foam.CLASS({
  package: 'woodblock',
  name: 'Theme',

  properties: [
    [ 'backgroundColor', '#dfe8e2' ],
    [ 'boardColor', '#b8c9bd' ],
    [ 'feedColor', '#cbd8ce' ],
    [ 'emptyCellColor', '#eef4ef' ],
    [ 'gridLineColor', '#9fb0a5' ],
    [ 'pieceBorderColor', '#f9fbf7' ],
    [ 'validDropColor', 'rgba(74, 128, 91, 0.32)' ],
    [ 'invalidDropColor', 'rgba(176, 67, 56, 0.35)' ],
    [ 'cellRadius', 5 ],
    {
      class: 'Array',
      name: 'pieceColors',
      factory: function() {
        return [
          '#476a51',
          '#6f7f46',
          '#b58a4a',
          '#7e5847',
          '#3f6f82',
          '#855f7f',
          '#8c4d43'
        ];
      }
    }
  ],

  methods: [
    function pieceColor(index) {
      return this.pieceColors[index % this.pieceColors.length];
    },

    function cellFillStyle(ctx, color, texture) {
      if ( texture ) {
        if ( texture.toCanvasStyle ) return texture.toCanvasStyle(ctx);
        if ( typeof CanvasPattern !== 'undefined' && texture instanceof CanvasPattern ) return texture;
        if ( typeof CanvasGradient !== 'undefined' && texture instanceof CanvasGradient ) return texture;
        if ( typeof HTMLImageElement !== 'undefined' &&
             texture instanceof HTMLImageElement &&
             texture.complete ) {
          return ctx.createPattern(texture, 'repeat') || color;
        }
      }

      return color || this.emptyCellColor;
    },

    function paintCell(ctx, x, y, size, color, texture, borderColor) {
      ctx.beginPath();
      this.roundRect(ctx, x, y, size, size, this.cellRadius);
      ctx.fillStyle = this.cellFillStyle(ctx, color, texture);
      ctx.fill();

      if ( borderColor ) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = borderColor;
        ctx.stroke();
      }
    },

    function roundRect(ctx, x, y, width, height, radius) {
      radius = Math.min(radius, width / 2, height / 2);

      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }
  ]
});
