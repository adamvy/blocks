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
      box-sizing: border-box;
      display: grid;
      gap: 8px;
      grid-template-rows: minmax(0, 1fr) auto;
      height: 100vh;
      height: 100svh;
      height: 100dvh;
      max-height: 100vh;
      max-height: 100svh;
      max-height: 100dvh;
      max-width: 100vw;
      overflow: hidden;
      padding: 8px;
      padding-bottom: calc(8px + env(safe-area-inset-bottom));
      padding-left: calc(8px + env(safe-area-inset-left));
      padding-right: calc(8px + env(safe-area-inset-right));
      padding-top: calc(8px + env(safe-area-inset-top));
      width: 100vw;
    }

    ^canvas {
      align-items: center;
      display: flex;
      justify-content: center;
      min-height: 0;
      min-width: 0;
      max-height: 100%;
      max-width: 100%;
      overflow: hidden;
    }

    ^canvas canvas {
      max-height: 100%;
      max-width: 100%;
    }

    ^controls {
      align-items: center;
      box-sizing: border-box;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: center;
      min-width: 0;
      max-width: 100%;
      width: 100%;
    }

    ^control {
      align-items: center;
      background: #cbd8ce;
      border: 1px solid #9fb0a5;
      border-radius: 8px;
      box-sizing: border-box;
      display: grid;
      flex: 1 1 136px;
      gap: 6px;
      grid-template-columns: minmax(42px, 1fr) 34px minmax(34px, auto) 34px;
      max-width: 184px;
      min-height: 38px;
      min-width: 0;
      padding: 5px 6px;
    }

    ^label {
      color: #36523d;
      font: 600 12px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      min-width: 0;
    }

    ^value {
      color: #253a2b;
      font: 700 14px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
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
      height: 30px;
      padding: 0;
      width: 34px;
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
      }
      this.onDetach(function() {
        this.window.removeEventListener('resize', this.resizeGame);
        this.window.removeEventListener('orientationchange', this.resizeGame);
        if ( this.window.visualViewport ) {
          this.window.visualViewport.removeEventListener('resize', this.resizeGame);
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

    function availableCanvasSize() {
      if ( this.element_ && this.element_.querySelector ) {
        var canvas = this.element_.querySelector('.' + this.myClass('canvas'));
        if ( canvas ) {
          var bounds = canvas.getBoundingClientRect();
          if ( bounds.width > 0 && bounds.height > 0 ) {
            return {
              width: Math.floor(bounds.width),
              height: Math.floor(bounds.height)
            };
          }
        }
      }

      return {
        width: Math.max(1, Math.floor(this.window.innerWidth || 1) - 16),
        height: Math.max(1, Math.floor(this.window.innerHeight || 1) - 96)
      };
    },

    function pickCellSize(availableWidth, availableHeight) {
      for ( var size = 36 ; size >= 6 ; size-- ) {
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
        cellSize: 6,
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

      var size = this.availableCanvasSize();
      var layout = this.pickCellSize(size.width, size.height);

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
