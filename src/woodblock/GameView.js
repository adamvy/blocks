foam.CLASS({
  package: 'woodblock',
  name: 'GameView',
  extends: 'foam.u2.Element',

  requires: [
    'woodblock.Game',
    'woodblock.Theme'
  ],

  imports: [
    'window'
  ],

  exports: [
    'theme'
  ],

  css: `
    ^ {
      align-items: center;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 10px;
      justify-content: center;
      max-width: 100%;
      min-height: 100vh;
      min-height: 100svh;
      min-height: 100dvh;
      overflow: hidden;
      padding: 12px;
      width: 100%;
    }

    ^canvas {
      display: flex;
      justify-content: center;
      min-height: 0;
      max-width: 100%;
      overflow: hidden;
    }

    ^controls {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      max-width: 100%;
    }

    ^control {
      align-items: center;
      background: #cbd8ce;
      border: 1px solid #9fb0a5;
      border-radius: 8px;
      display: grid;
      gap: 6px;
      grid-template-columns: auto 36px minmax(56px, auto) 36px;
      min-height: 42px;
      padding: 6px 8px;
    }

    ^label {
      color: #36523d;
      font: 600 13px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      min-width: 44px;
    }

    ^value {
      color: #253a2b;
      font: 700 15px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      text-align: center;
    }

    ^step {
      appearance: none;
      background: #476a51;
      border: 1px solid #36523d;
      border-radius: 6px;
      color: #f9fbf7;
      cursor: pointer;
      font: 700 20px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      height: 32px;
      padding: 0;
      width: 36px;
    }

    ^step:active {
      transform: translateY(1px);
    }
  `,

  properties: [
    {
      name: 'theme',
      factory: function() { return this.Theme.create(); }
    },
    {
      name: 'game',
      factory: function() { return this.Game.create({}, this); }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.resizeGame();
      this.window.addEventListener('resize', this.resizeGame);
      this.window.addEventListener('orientationchange', this.resizeGame);
      if ( this.window.visualViewport ) {
        this.window.visualViewport.addEventListener('resize', this.resizeGame);
        this.window.visualViewport.addEventListener('scroll', this.resizeGame);
      }
      this.onDetach(function() {
        this.window.removeEventListener('resize', this.resizeGame);
        this.window.removeEventListener('orientationchange', this.resizeGame);
        if ( this.window.visualViewport ) {
          this.window.visualViewport.removeEventListener('resize', this.resizeGame);
          this.window.visualViewport.removeEventListener('scroll', this.resizeGame);
        }
      }.bind(this));
    },

    function render() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('canvas'))
          .add(this.game)
        .end()
        .start()
          .addClass(this.myClass('controls'))
          .start()
            .addClass(this.myClass('control'))
            .start('span').addClass(this.myClass('label')).add('Width').end()
            .start('button')
              .addClass(this.myClass('step'))
              .attrs({ type: 'button', 'aria-label': 'Decrease board width' })
              .on('click', this.decreaseWidth)
              .add('-')
            .end()
            .start('span').addClass(this.myClass('value')).add(this.game.width$).end()
            .start('button')
              .addClass(this.myClass('step'))
              .attrs({ type: 'button', 'aria-label': 'Increase board width' })
              .on('click', this.increaseWidth)
              .add('+')
            .end()
          .end()
          .start()
            .addClass(this.myClass('control'))
            .start('span').addClass(this.myClass('label')).add('Height').end()
            .start('button')
              .addClass(this.myClass('step'))
              .attrs({ type: 'button', 'aria-label': 'Decrease board height' })
              .on('click', this.decreaseHeight)
              .add('-')
            .end()
            .start('span').addClass(this.myClass('value')).add(this.game.height$).end()
            .start('button')
              .addClass(this.myClass('step'))
              .attrs({ type: 'button', 'aria-label': 'Increase board height' })
              .on('click', this.increaseHeight)
              .add('+')
            .end()
          .end()
        .end();

      if ( this.window.requestAnimationFrame ) {
        this.window.requestAnimationFrame(this.resizeGame);
      } else {
        this.resizeGame();
      }
    },

    function viewportWidth() {
      return Math.floor(
        this.window.visualViewport && this.window.visualViewport.width ||
        this.window.innerWidth ||
        1);
    },

    function viewportHeight() {
      return Math.floor(
        this.window.visualViewport && this.window.visualViewport.height ||
        this.window.innerHeight ||
        1);
    },

    function controlReserveHeight() {
      if ( this.element_ && this.element_.querySelector ) {
        var controls = this.element_.querySelector('.' + this.myClass('controls'));
        if ( controls ) {
          var height = Math.ceil(controls.getBoundingClientRect().height);
          if ( height > 0 ) return height + 46;
        }
      }

      return 124;
    },

    function pickCellSize(availableWidth, availableHeight) {
      for ( var size = 36 ; size >= 8 ; size-- ) {
        var gap = size <= 10 ? 1 : size <= 22 ? 2 : 3;
        var margin = size <= 14 ? 6 : size <= 16 ? 8 : size <= 22 ? 10 : size <= 28 ? 16 : 24;
        var feedGap = size <= 14 ? 5 : size <= 16 ? 6 : size <= 22 ? 8 : size <= 28 ? 16 : 30;
        var feedSlotGap = size <= 10 ? 3 : size <= 16 ? 4 : size <= 22 ? 6 : size <= 28 ? 8 : 12;
        var boardWidth = this.game.width * size + Math.max(0, this.game.width - 1) * gap;
        var boardHeight = this.game.height * size + Math.max(0, this.game.height - 1) * gap;
        var slot = 4 * size + 3 * gap + 20;
        var feedWidth = this.game.upcomingCount * slot +
          Math.max(0, this.game.upcomingCount - 1) * feedSlotGap;
        var canvasWidth = margin * 2 + Math.max(boardWidth, feedWidth);
        var canvasHeight = margin * 2 + boardHeight + feedGap + slot;

        if ( canvasWidth <= availableWidth && canvasHeight <= availableHeight ) {
          return {
            cellSize: size,
            cellGap: gap,
            boardMargin: margin,
            feedGap: feedGap,
            feedSlotGap: feedSlotGap
          };
        }
      }

      return {
        cellSize: 8,
        cellGap: 1,
        boardMargin: 6,
        feedGap: 5,
        feedSlotGap: 3
      };
    },

    function updateBoardSize(width, height) {
      this.game.resizeBoard(width, height);
      this.resizeGame();
    }
  ],

  listeners: [
    function resizeGame() {
      if ( ! this.game ) return;

      var availableWidth = Math.max(1, this.viewportWidth() - 24);
      var availableHeight = Math.max(1, this.viewportHeight() - this.controlReserveHeight());
      var layout = this.pickCellSize(availableWidth, availableHeight);

      this.game.cellSize = layout.cellSize;
      this.game.cellGap = layout.cellGap;
      this.game.boardMargin = layout.boardMargin;
      this.game.feedGap = layout.feedGap;
      this.game.feedSlotGap = layout.feedSlotGap;
      this.game.layoutUpcomingPieces();
      this.game.invalidate();
    },

    function decreaseWidth() {
      this.updateBoardSize(this.game.width - 1, this.game.height);
    },

    function increaseWidth() {
      this.updateBoardSize(this.game.width + 1, this.game.height);
    },

    function decreaseHeight() {
      this.updateBoardSize(this.game.width, this.game.height - 1);
    },

    function increaseHeight() {
      this.updateBoardSize(this.game.width, this.game.height + 1);
    }
  ]
});
