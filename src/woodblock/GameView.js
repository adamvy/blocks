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
      display: block;
      height: 100vh;
      height: 100svh;
      height: 100dvh;
      max-height: 100vh;
      max-height: 100svh;
      max-height: 100dvh;
      max-width: 100vw;
      overflow: hidden;
      padding: 0;
      touch-action: none;
      width: 100vw;
    }

    ^ canvas {
      display: block;
      height: 100%;
      max-height: 100%;
      max-width: 100%;
      touch-action: none;
      width: 100%;
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
        .add(this.game);

      if ( this.window.requestAnimationFrame ) {
        this.window.requestAnimationFrame(this.resizeGame);
      } else {
        this.resizeGame();
      }
    },

    function viewportSize() {
      var viewport = this.window.visualViewport;
      return {
        width: Math.max(1, Math.floor(viewport && viewport.width || this.window.innerWidth || 1)),
        height: Math.max(1, Math.floor(viewport && viewport.height || this.window.innerHeight || 1))
      };
    }
  ],

  listeners: [
    function resizeGame() {
      if ( ! this.game ) return;

      var size = this.viewportSize();
      this.game.fitToViewport(size.width, size.height);
    }
  ]
});
