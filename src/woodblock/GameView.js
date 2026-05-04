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
      max-width: 100%;
      padding: 12px;
    }

    ^canvas {
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
      this.onDetach(function() {
        this.window.removeEventListener('resize', this.resizeGame);
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
    },

    function pickCellSize(availableWidth, availableHeight) {
      for ( var size = 36 ; size >= 12 ; size-- ) {
        var gap = size <= 22 ? 2 : 3;
        var margin = size <= 16 ? 8 : size <= 22 ? 10 : size <= 28 ? 16 : 24;
        var feedGap = size <= 16 ? 6 : size <= 22 ? 8 : size <= 28 ? 16 : 30;
        var feedSlotGap = size <= 16 ? 4 : size <= 22 ? 6 : size <= 28 ? 8 : 12;
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
        cellSize: 12,
        cellGap: 2,
        boardMargin: 8,
        feedGap: 6,
        feedSlotGap: 4
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

      var availableWidth = Math.max(1, this.window.innerWidth - 24);
      var availableHeight = Math.max(1, this.window.innerHeight - 148);
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
