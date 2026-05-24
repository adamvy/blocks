foam.CLASS({
  package: 'woodblock',
  name: 'Piece',
  extends: 'foam.graphics.CView',

  requires: [
    'woodblock.Theme'
  ],

  imports: [
    'theme? as importedTheme'
  ],

  properties: [
    [ 'width', 1 ],
    [ 'height', 1 ],
    [ 'cellSize', 36 ],
    [ 'cellGap', 3 ],
    [ 'shapeName', 'single' ],
    [ 'shelfSlot', -1 ],
    {
      class: 'Array',
      name: 'cells',
      factory: function() { return [ [ 0, 0 ] ]; }
    },
    {
      name: 'theme',
      expression: function(importedTheme) {
        return importedTheme || this.Theme.create();
      }
    },
    {
      class: 'Color',
      name: 'color',
      value: '#476a51'
    },
    'texture'
  ],

  methods: [
    function paintSelf(ctx) {
      this.paintAt(ctx, 0, 0, this.cellSize, this.cellGap, 1);
    },

    function paintAt(ctx, x, y, cellSize, cellGap, alpha, color, texture) {
      var oldAlpha = ctx.globalAlpha;
      ctx.globalAlpha = oldAlpha * ( alpha === undefined ? 1 : alpha );

      for ( var i = 0 ; i < this.cells.length ; i++ ) {
        var cell = this.cells[i];
        this.theme.paintCell(
          ctx,
          x + cell[0] * (cellSize + cellGap),
          y + cell[1] * (cellSize + cellGap),
          cellSize,
          color || this.color,
          texture || this.texture,
          this.theme.pieceBorderColor);
      }

      ctx.globalAlpha = oldAlpha;
    },

    function pixelWidth() {
      return this.width * this.cellSize + Math.max(0, this.width - 1) * this.cellGap;
    },

    function pixelHeight() {
      return this.height * this.cellSize + Math.max(0, this.height - 1) * this.cellGap;
    },

    function hitTest(p) {
      return p.x >= 0 && p.y >= 0 &&
        p.x < this.pixelWidth() &&
        p.y < this.pixelHeight();
    }
  ]
});
