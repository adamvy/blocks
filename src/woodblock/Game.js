foam.CLASS({
  package: 'woodblock',
  name: 'Game',
  extends: 'foam.graphics.CView',

  requires: [
    'woodblock.Piece',
    'woodblock.Theme'
  ],

  imports: [
    'theme? as importedTheme'
  ],

  exports: [
    'theme'
  ],

  properties: [
    [ 'width', 10 ],
    [ 'height', 10 ],
    [ 'cellSize', 36 ],
    [ 'cellGap', 3 ],
    [ 'feedGap', 30 ],
    [ 'feedSlotGap', 12 ],
    [ 'canvasWidth', 1 ],
    [ 'canvasHeight', 1 ],
    [ 'upcomingCount', 3 ],
    [ 'dropColumn', -1 ],
    [ 'dropRow', -1 ],
    [ 'dropShelfSlot', -1 ],
    [ 'validDrop', false ],
    'draggingPiece',
    [ 'activePointerId', -1 ],
    [ 'dragOffsetX', 0 ],
    [ 'dragOffsetY', 0 ],
    [ 'dragStartPointerX', 0 ],
    [ 'dragStartPointerY', 0 ],
    [ 'dragSourceSlot', -1 ],
    [ 'dragInputType', '' ],
    [ 'lastPointerX', 0 ],
    [ 'lastPointerY', 0 ],
    [ 'clearAnimationDuration', 260 ],
    [ 'clearAnimationFrameId', 0 ],
    {
      name: 'theme',
      expression: function(importedTheme) {
        return importedTheme || this.Theme.create();
      }
    },
    {
      class: 'Array',
      name: 'boardCells',
      factory: function() {
        return this.createEmptyBoardCells(this.width, this.height);
      }
    },
    {
      class: 'Array',
      name: 'shelfStacks',
      factory: function() { return []; }
    },
    {
      class: 'Array',
      name: 'clearAnimations',
      factory: function() { return []; }
    },
    {
      name: 'cellPitch',
      expression: function(cellSize, cellGap) {
        return cellSize + cellGap;
      }
    },
    {
      name: 'boardPixelWidth',
      expression: function(width, cellSize, cellGap) {
        return width * cellSize + Math.max(0, width - 1) * cellGap;
      }
    },
    {
      name: 'boardPixelHeight',
      expression: function(height, cellSize, cellGap) {
        return height * cellSize + Math.max(0, height - 1) * cellGap;
      }
    },
    {
      name: 'feedSlotSize',
      expression: function(cellSize, cellGap) {
        return 4 * cellSize + 3 * cellGap + Math.max(8, Math.round(cellSize * 0.6));
      }
    },
    {
      name: 'feedPixelWidth',
      expression: function(upcomingCount, feedSlotSize, feedSlotGap) {
        return upcomingCount * feedSlotSize +
          Math.max(0, upcomingCount - 1) * feedSlotGap;
      }
    },
    {
      name: 'boardX',
      expression: function(canvasWidth, boardPixelWidth) {
        return Math.max(0, (canvasWidth - boardPixelWidth) / 2);
      }
    },
    {
      name: 'boardY',
      expression: function(canvasHeight, boardPixelHeight, feedGap, feedSlotSize) {
        return Math.max(0, (canvasHeight - boardPixelHeight - feedGap - feedSlotSize) / 2);
      }
    },
    {
      name: 'feedX',
      expression: function(canvasWidth, feedPixelWidth) {
        return Math.max(0, (canvasWidth - feedPixelWidth) / 2);
      }
    },
    {
      name: 'feedY',
      expression: function(boardY, boardPixelHeight, feedGap) {
        return boardY + boardPixelHeight + feedGap;
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.resetGame();
    },

    function initCView() {
      this.SUPER();
      this.canvas.el_().addEventListener('pointerdown', this.onPointerDown);
      this.canvas.el_().addEventListener('pointermove', this.onPointerMove);
      this.canvas.el_().addEventListener('pointerup', this.onPointerUp);
      this.canvas.el_().addEventListener('pointercancel', this.onPointerCancel);
      this.canvas.el_().addEventListener('lostpointercapture', this.onPointerCancel);
      this.onDetach(function() {
        this.canvas.el_().removeEventListener('pointerdown', this.onPointerDown);
        this.canvas.el_().removeEventListener('pointermove', this.onPointerMove);
        this.canvas.el_().removeEventListener('pointerup', this.onPointerUp);
        this.canvas.el_().removeEventListener('pointercancel', this.onPointerCancel);
        this.canvas.el_().removeEventListener('lostpointercapture', this.onPointerCancel);
      }.bind(this));
    },

    function toE(args, X) {
      return this.Canvas.create({
        cview: this,
        width$: this.canvasWidth$,
        height$: this.canvasHeight$
      }, X);
    },

    function resetGame() {
      this.removeAllChildren();
      this.boardCells = this.createEmptyBoardCells(this.width, this.height);
      this.clearAnimations = [];

      var stacks = [];
      for ( var i = 0 ; i < this.upcomingCount ; i++ ) {
        var piece = this.createRandomPiece();
        piece.shelfSlot = i;
        stacks.push([ piece ]);
      }

      this.shelfStacks = stacks;
      this.layoutPieces();
      this.invalidate();
    },

    function fitToViewport(width, height) {
      width = Math.max(1, Math.floor(width || 1));
      height = Math.max(1, Math.floor(height || 1));

      this.canvasWidth = width;
      this.canvasHeight = height;

      var layout = this.pickLayout(width, height);
      this.cellSize = layout.cellSize;
      this.cellGap = layout.cellGap;
      this.feedGap = layout.feedGap;
      this.feedSlotGap = layout.feedSlotGap;

      if ( this.draggingPiece ) {
        this.draggingPiece.cellSize = this.cellSize;
        this.draggingPiece.cellGap = this.cellGap;
        this.updateDropTarget();
      }

      this.layoutPieces();
      this.invalidate();
    },

    function pickLayout(width, height) {
      for ( var size = 52 ; size >= 6 ; size-- ) {
        var gap = size <= 10 ? 1 : size <= 22 ? 2 : 3;
        var margin = size <= 10 ? 4 : size <= 14 ? 6 : size <= 22 ? 10 : size <= 32 ? 16 : 24;
        var feedGap = size <= 10 ? 16 : size <= 14 ? 20 : size <= 22 ? 32 : size <= 32 ? 52 : 84;
        var feedSlotGap = size <= 10 ? 3 : size <= 16 ? 4 : size <= 24 ? 6 : size <= 34 ? 8 : 12;
        var boardWidth = this.width * size + Math.max(0, this.width - 1) * gap;
        var boardHeight = this.height * size + Math.max(0, this.height - 1) * gap;
        var slot = this.feedSlotSizeFor(size, gap);
        var feedWidth = this.upcomingCount * slot +
          Math.max(0, this.upcomingCount - 1) * feedSlotGap;
        var contentWidth = margin * 2 + Math.max(boardWidth, feedWidth);
        var contentHeight = margin * 2 + boardHeight + feedGap + slot;

        if ( contentWidth <= width && contentHeight <= height ) {
          return {
            cellSize: size,
            cellGap: gap,
            feedGap: feedGap,
            feedSlotGap: feedSlotGap
          };
        }
      }

      return {
        cellSize: 6,
        cellGap: 1,
        feedGap: 16,
        feedSlotGap: 3
      };
    },

    function feedSlotSizeFor(cellSize, cellGap) {
      return 4 * cellSize + 3 * cellGap + Math.max(8, Math.round(cellSize * 0.6));
    },

    function resizeBoard(width, height) {
      width = Math.max(4, Math.min(16, Math.round(width)));
      height = Math.max(4, Math.min(16, Math.round(height)));

      if ( this.draggingPiece ) this.restoreDraggedPiece();

      var oldWidth = this.width;
      var oldHeight = this.height;
      var oldCells = this.boardCells;

      this.width = width;
      this.height = height;
      this.boardCells = this.resizeBoardCells(oldCells, oldWidth, oldHeight, width, height);
      this.fitToViewport(this.canvasWidth, this.canvasHeight);
    },

    function createEmptyBoardCells(width, height) {
      var cells = [];
      var count = Math.max(0, width * height);

      for ( var i = 0 ; i < count ; i++ ) cells.push(null);

      return cells;
    },

    function resizeBoardCells(oldCells, oldWidth, oldHeight, width, height) {
      var cells = this.createEmptyBoardCells(width, height);
      var copyWidth = Math.min(oldWidth, width);
      var copyHeight = Math.min(oldHeight, height);

      for ( var row = 0 ; row < copyHeight ; row++ ) {
        for ( var col = 0 ; col < copyWidth ; col++ ) {
          cells[row * width + col] = oldCells[row * oldWidth + col] || null;
        }
      }

      return cells;
    },

    function createRandomPiece() {
      var shapes = this.shapeLibrary();
      var shape = shapes[Math.floor(Math.random() * shapes.length)];
      var cells = shape.cells.map(function(cell) { return [ cell[0], cell[1] ]; });

      return this.Piece.create({
        shapeName: shape.name,
        cells: cells,
        width: shape.width,
        height: shape.height,
        cellSize: this.cellSize,
        cellGap: this.cellGap,
        color: this.theme.pieceColor(Math.floor(Math.random() * this.theme.pieceColors.length))
      });
    },

    function shapeLibrary() {
      return [
        { name: 'single', width: 1, height: 1, cells: [ [ 0, 0 ] ] },
        { name: 'square2', width: 2, height: 2, cells: [ [ 0, 0 ], [ 1, 0 ], [ 0, 1 ], [ 1, 1 ] ] },
        { name: 'line2', width: 2, height: 1, cells: [ [ 0, 0 ], [ 1, 0 ] ] },
        { name: 'line3', width: 3, height: 1, cells: [ [ 0, 0 ], [ 1, 0 ], [ 2, 0 ] ] },
        { name: 'line4', width: 4, height: 1, cells: [ [ 0, 0 ], [ 1, 0 ], [ 2, 0 ], [ 3, 0 ] ] },
        { name: 'line4v', width: 1, height: 4, cells: [ [ 0, 0 ], [ 0, 1 ], [ 0, 2 ], [ 0, 3 ] ] },
        { name: 'corner', width: 2, height: 2, cells: [ [ 0, 0 ], [ 0, 1 ], [ 1, 1 ] ] },
        { name: 'l3', width: 2, height: 3, cells: [ [ 0, 0 ], [ 0, 1 ], [ 0, 2 ], [ 1, 2 ] ] },
        { name: 'j3', width: 2, height: 3, cells: [ [ 1, 0 ], [ 1, 1 ], [ 1, 2 ], [ 0, 2 ] ] },
        { name: 'tee', width: 3, height: 2, cells: [ [ 0, 0 ], [ 1, 0 ], [ 2, 0 ], [ 1, 1 ] ] },
        { name: 'zig', width: 3, height: 2, cells: [ [ 0, 0 ], [ 1, 0 ], [ 1, 1 ], [ 2, 1 ] ] },
        { name: 'zag', width: 3, height: 2, cells: [ [ 1, 0 ], [ 2, 0 ], [ 0, 1 ], [ 1, 1 ] ] }
      ];
    },

    function layoutUpcomingPieces() {
      this.layoutPieces();
    },

    function layoutPieces() {
      for ( var slot = 0 ; slot < this.upcomingCount ; slot++ ) {
        var stack = this.shelfStacks[slot] || (this.shelfStacks[slot] = []);
        var top = this.topShelfPiece(slot);
        var slotX = this.shelfSlotX(slot);

        for ( var j = 0 ; j < stack.length ; j++ ) {
          var piece = stack[j];
          if ( piece !== top && piece.parent === this ) this.remove(piece);
        }

        if ( ! top ) continue;

        top.shelfSlot = slot;
        top.cellSize = this.cellSize;
        top.cellGap = this.cellGap;
        top.x = slotX + (this.feedSlotSize - top.pixelWidth()) / 2;
        top.y = this.feedY + (this.feedSlotSize - top.pixelHeight()) / 2;

        if ( top.parent !== this ) this.add(top);
      }
    },

    function topShelfPiece(slot) {
      var stack = this.shelfStacks[slot];
      return stack && stack.length ? stack[stack.length - 1] : null;
    },

    function shelfSlotX(slot) {
      return this.feedX + slot * (this.feedSlotSize + this.feedSlotGap);
    },

    function shelfSlotAt(x, y) {
      if ( y < this.feedY || y > this.feedY + this.feedSlotSize ) return -1;

      for ( var i = 0 ; i < this.upcomingCount ; i++ ) {
        var slotX = this.shelfSlotX(i);
        if ( x >= slotX && x <= slotX + this.feedSlotSize ) return i;
      }

      return -1;
    },

    function shelfPieceAt(x, y) {
      var slot = this.shelfSlotAt(x, y);
      return slot === -1 ? null : this.topShelfPiece(slot);
    },

    function paintSelf(ctx) {
      this.paintBackground(ctx);
      this.paintBoard(ctx);
      this.paintDropPreview(ctx);
      this.paintClearingCells(ctx);
      this.paintFeed(ctx);
    },

    function paintBackground(ctx) {
      ctx.fillStyle = this.theme.backgroundColor;
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    },

    function paintBoard(ctx) {
      ctx.fillStyle = this.theme.boardColor;
      ctx.fillRect(
        this.boardX - this.cellGap,
        this.boardY - this.cellGap,
        this.boardPixelWidth + this.cellGap * 2,
        this.boardPixelHeight + this.cellGap * 2);

      for ( var row = 0 ; row < this.height ; row++ ) {
        for ( var col = 0 ; col < this.width ; col++ ) {
          var cell = this.boardCells[this.indexFor(col, row)];

          this.theme.paintCell(
            ctx,
            this.cellX(col),
            this.cellY(row),
            this.cellSize,
            cell ? cell.color : this.theme.emptyCellColor,
            cell && cell.texture,
            cell ? this.theme.pieceBorderColor : this.theme.gridLineColor);
        }
      }
    },

    function paintDropPreview(ctx) {
      if ( ! this.draggingPiece || this.dropShelfSlot !== -1 ||
           this.dropColumn < -3 || this.dropRow < -3 ) return;

      var color = this.validDrop ? this.theme.validDropColor : this.theme.invalidDropColor;

      for ( var i = 0 ; i < this.draggingPiece.cells.length ; i++ ) {
        var cell = this.draggingPiece.cells[i];
        var col = this.dropColumn + cell[0];
        var row = this.dropRow + cell[1];

        if ( col < 0 || row < 0 || col >= this.width || row >= this.height ) continue;

        this.theme.paintCell(
          ctx,
          this.cellX(col),
          this.cellY(row),
          this.cellSize,
          color,
          null,
          this.validDrop ? '#4a805b' : '#b04338');
      }
    },

    function paintClearingCells(ctx) {
      if ( ! this.clearAnimations.length ) return;

      var now = this.animationTime();

      for ( var i = 0 ; i < this.clearAnimations.length ; i++ ) {
        var animation = this.clearAnimations[i];
        var progress = Math.min(1, Math.max(0,
          (now - animation.startedAt) / this.clearAnimationDuration));
        var alpha = progress < 0.18 ? 1 : 1 - (progress - 0.18) / 0.82;
        var size = this.cellSize * (1 - 0.34 * progress);
        var inset = (this.cellSize - size) / 2;
        var oldAlpha = ctx.globalAlpha;

        ctx.globalAlpha = oldAlpha * Math.max(0, alpha);

        for ( var j = 0 ; j < animation.cells.length ; j++ ) {
          var cell = animation.cells[j];

          this.theme.paintCell(
            ctx,
            this.cellX(cell.col) + inset,
            this.cellY(cell.row) + inset,
            size,
            cell.color,
            cell.texture,
            this.theme.pieceBorderColor);
        }

        ctx.globalAlpha = oldAlpha;
      }
    },

    function paintFeed(ctx) {
      for ( var i = 0 ; i < this.upcomingCount ; i++ ) {
        var x = this.shelfSlotX(i);

        ctx.fillStyle = this.dropShelfSlot === i && this.draggingPiece ?
          this.theme.validDropColor :
          this.theme.feedColor;
        ctx.fillRect(x, this.feedY, this.feedSlotSize, this.feedSlotSize - this.cellGap);
      }
    },

    function cellX(col) {
      return this.boardX + col * this.cellPitch;
    },

    function cellY(row) {
      return this.boardY + row * this.cellPitch;
    },

    function indexFor(col, row) {
      return row * this.width + col;
    },

    function updateDropTarget() {
      if ( ! this.draggingPiece ) {
        this.dropColumn = -1;
        this.dropRow = -1;
        this.dropShelfSlot = -1;
        this.validDrop = false;
        return;
      }

      this.dropColumn = Math.round((this.draggingPiece.x - this.boardX) / this.cellPitch);
      this.dropRow = Math.round((this.draggingPiece.y - this.boardY) / this.cellPitch);
      this.validDrop = this.canPlace(this.draggingPiece, this.dropColumn, this.dropRow);
      this.dropShelfSlot = this.validDrop ? -1 :
        this.shelfSlotAt(this.lastPointerX, this.lastPointerY);
    },

    function canPlace(piece, col, row) {
      for ( var i = 0 ; i < piece.cells.length ; i++ ) {
        var cell = piece.cells[i];
        var x = col + cell[0];
        var y = row + cell[1];

        if ( x < 0 || y < 0 || x >= this.width || y >= this.height ) return false;
        if ( this.boardCellOccupied(x, y) ) return false;
      }

      return true;
    },

    function boardCellOccupied(col, row) {
      return !! this.boardCells[this.indexFor(col, row)];
    },

    function placePieceOnBoard(piece, col, row) {
      var cells = this.boardCells.slice();

      for ( var i = 0 ; i < piece.cells.length ; i++ ) {
        var pieceCell = piece.cells[i];
        cells[this.indexFor(col + pieceCell[0], row + pieceCell[1])] = {
          color: piece.color,
          texture: piece.texture
        };
      }

      this.boardCells = cells;
      piece.shelfSlot = -1;
      if ( piece.parent === this ) this.remove(piece);
    },

    function clearFullLines() {
      var lines = this.findFullLines();

      if ( ! lines.rows.length && ! lines.columns.length ) return false;

      var cells = this.collectClearingCells(lines);
      this.removeClearedBoardCells(lines);
      this.startClearAnimation(cells);
      this.layoutPieces();
      this.invalidate();

      return true;
    },

    function findFullLines() {
      var rows = [];
      var columns = [];

      for ( var row = 0 ; row < this.height ; row++ ) {
        var rowFull = true;

        for ( var col = 0 ; col < this.width ; col++ ) {
          if ( ! this.boardCells[this.indexFor(col, row)] ) {
            rowFull = false;
            break;
          }
        }

        if ( rowFull ) rows.push(row);
      }

      for ( var c = 0 ; c < this.width ; c++ ) {
        var columnFull = true;

        for ( var r = 0 ; r < this.height ; r++ ) {
          if ( ! this.boardCells[this.indexFor(c, r)] ) {
            columnFull = false;
            break;
          }
        }

        if ( columnFull ) columns.push(c);
      }

      return {
        rows: rows,
        columns: columns
      };
    },

    function collectClearingCells(lines) {
      var rowSet = this.arrayToLookup(lines.rows);
      var columnSet = this.arrayToLookup(lines.columns);
      var cells = [];

      for ( var row = 0 ; row < this.height ; row++ ) {
        for ( var col = 0 ; col < this.width ; col++ ) {
          if ( ! rowSet[row] && ! columnSet[col] ) continue;

          var cell = this.boardCells[this.indexFor(col, row)];
          if ( ! cell ) continue;
          cells.push({
            col: col,
            row: row,
            color: cell.color,
            texture: cell.texture
          });
        }
      }

      return cells;
    },

    function removeClearedBoardCells(lines) {
      var rowSet = this.arrayToLookup(lines.rows);
      var columnSet = this.arrayToLookup(lines.columns);
      var cells = this.boardCells.slice();

      for ( var row = 0 ; row < this.height ; row++ ) {
        for ( var col = 0 ; col < this.width ; col++ ) {
          if ( rowSet[row] || columnSet[col] ) {
            cells[this.indexFor(col, row)] = null;
          }
        }
      }

      this.boardCells = cells;
    },

    function arrayToLookup(values) {
      var lookup = {};

      for ( var i = 0 ; i < values.length ; i++ ) {
        lookup[values[i]] = true;
      }

      return lookup;
    },

    function startClearAnimation(cells) {
      if ( ! cells.length ) return;

      this.clearAnimations = this.clearAnimations.concat([ {
        startedAt: this.animationTime(),
        cells: cells
      } ]);
      this.scheduleClearAnimationFrame();
    },

    function scheduleClearAnimationFrame() {
      if ( this.clearAnimationFrameId ) return;

      var self = this;
      var frame = function() {
        self.clearAnimationFrameId = 0;
        self.pruneClearAnimations();
        self.invalidate();
        if ( self.clearAnimations.length ) self.scheduleClearAnimationFrame();
      };

      if ( typeof window !== 'undefined' && window.requestAnimationFrame ) {
        this.clearAnimationFrameId = window.requestAnimationFrame(frame);
      } else {
        this.clearAnimationFrameId = setTimeout(frame, 16);
      }
    },

    function pruneClearAnimations() {
      if ( ! this.clearAnimations.length ) return;

      var now = this.animationTime();
      var duration = this.clearAnimationDuration;
      this.clearAnimations = this.clearAnimations.filter(function(animation) {
        return now - animation.startedAt < duration;
      });
    },

    function animationTime() {
      if ( typeof performance !== 'undefined' && performance.now ) {
        return performance.now();
      }

      return Date.now();
    },

    function takeShelfPiece(piece) {
      var slot = piece.shelfSlot;
      var stack = this.shelfStacks[slot];
      if ( ! stack || this.topShelfPiece(slot) !== piece ) return false;

      stack.pop();
      this.shelfStacks = this.shelfStacks.slice();
      this.layoutPieces();

      return true;
    },

    function putPieceOnShelf(piece, slot) {
      var stacks = this.shelfStacks.slice();
      var stack = (stacks[slot] || []).slice();

      piece.shelfSlot = slot;
      stack.push(piece);

      stacks[slot] = stack;
      this.shelfStacks = stacks;
      this.layoutPieces();
    },

    function ensureShelfSlotHasPiece(slot) {
      if ( slot < 0 ) return;
      if ( this.topShelfPiece(slot) ) return;

      this.putPieceOnShelf(this.createRandomPiece(), slot);
    },

    function hitTest(p) {
      return p.x >= 0 && p.y >= 0 &&
        p.x < this.canvasWidth &&
        p.y < this.canvasHeight;
    },

    function startDragAt(x, y, inputType) {
      if ( this.draggingPiece ) return false;

      var target = this.findFirstChildAt(x, y);
      var pickedFromShelfSlot = false;

      if ( ! this.Piece.isInstance(target) ||
           target.shelfSlot < 0 ||
           this.topShelfPiece(target.shelfSlot) !== target ) {
        target = this.shelfPieceAt(x, y);
        pickedFromShelfSlot = !! target;
      }

      if ( ! this.Piece.isInstance(target) ) return false;

      this.dragSourceSlot = target.shelfSlot;
      this.dragStartPointerX = x;
      this.dragStartPointerY = y;
      this.dragInputType = inputType || '';

      if ( ! this.takeShelfPiece(target) ) return false;

      this.draggingPiece = target;
      this.dragOffsetX = pickedFromShelfSlot ? target.pixelWidth() / 2 : x - target.x;
      this.dragOffsetY = pickedFromShelfSlot ? target.pixelHeight() / 2 : y - target.y;

      this.remove(target);
      this.add(target);
      this.dragTo(x, y);

      return true;
    },

    function dragTo(x, y) {
      if ( ! this.draggingPiece ) return;

      this.lastPointerX = x;
      this.lastPointerY = y;
      this.draggingPiece.x = x - this.dragOffsetX;
      this.draggingPiece.y = y - this.dragOffsetY - this.touchLiftFor(x, y);
      this.updateDropTarget();
      this.invalidate();
    },

    function touchLiftFor(x, y) {
      if ( this.dragInputType !== 'touch' ) return 0;

      var dx = x - this.dragStartPointerX;
      var dy = y - this.dragStartPointerY;
      var distance = Math.sqrt(dx * dx + dy * dy);
      var deadZone = 8;
      if ( distance <= deadZone ) return 0;

      var maxLift = Math.max(56, Math.min(118, this.cellSize * 3.2));
      var ramp = Math.max(30, Math.min(62, this.cellSize * 1.45));

      return maxLift * (1 - Math.exp(-(distance - deadZone) / ramp));
    },

    function eventToCanvasPoint(e) {
      var bounds = this.canvas.el_().getBoundingClientRect();
      var scaleX = bounds.width ? this.canvasWidth / bounds.width : 1;
      var scaleY = bounds.height ? this.canvasHeight / bounds.height : 1;

      return {
        x: (e.clientX - bounds.left) * scaleX,
        y: (e.clientY - bounds.top) * scaleY
      };
    },

    function claimPointer(e) {
      if ( this.canvas.el_().setPointerCapture ) {
        this.canvas.el_().setPointerCapture(e.pointerId);
      }

      this.activePointerId = e.pointerId;
    },

    function releasePointer(e) {
      if ( this.canvas.el_().releasePointerCapture &&
           this.canvas.el_().hasPointerCapture &&
           this.canvas.el_().hasPointerCapture(e.pointerId) ) {
        this.canvas.el_().releasePointerCapture(e.pointerId);
      }

      this.activePointerId = -1;
    },

    function isActivePointer(e) {
      return this.activePointerId === e.pointerId;
    },

    function clearDragState() {
      this.draggingPiece = null;
      this.activePointerId = -1;
      this.dragSourceSlot = -1;
      this.dragInputType = '';
      this.dragStartPointerX = 0;
      this.dragStartPointerY = 0;
      this.updateDropTarget();
      this.layoutPieces();
      this.invalidate();
    }
  ],

  listeners: [
    function onPointerDown(e) {
      if ( this.activePointerId !== -1 ) return;
      if ( e.pointerType === 'mouse' && e.button !== 0 ) return;

      var point = this.eventToCanvasPoint(e);
      if ( ! this.startDragAt(point.x, point.y, e.pointerType) ) return;

      this.claimPointer(e);
      e.preventDefault();
    },

    function onPointerMove(e) {
      if ( ! this.isActivePointer(e) ) return;

      var point = this.eventToCanvasPoint(e);
      this.dragTo(point.x, point.y);
      e.preventDefault();
    },

    function onPointerUp(e) {
      if ( ! this.isActivePointer(e) ) return;

      this.releasePointer(e);
      this.finishDrag();
      e.preventDefault();
    },

    function onPointerCancel(e) {
      if ( ! this.isActivePointer(e) ) return;

      this.releasePointer(e);
      this.restoreDraggedPiece();
      e.preventDefault();
    },

    function finishDrag() {
      var piece = this.draggingPiece;
      if ( ! piece ) return;

      if ( this.dropShelfSlot !== -1 ) {
        this.putPieceOnShelf(piece, this.dropShelfSlot);
        if ( this.dropShelfSlot !== this.dragSourceSlot ) this.ensureShelfSlotHasPiece(this.dragSourceSlot);
      } else if ( this.validDrop ) {
        this.placePieceOnBoard(piece, this.dropColumn, this.dropRow);
        this.clearFullLines();
        this.ensureShelfSlotHasPiece(this.dragSourceSlot);
      } else {
        this.restoreDraggedPiece();
        return;
      }

      this.clearDragState();
    },

    function restoreDraggedPiece() {
      var piece = this.draggingPiece;
      if ( ! piece ) return;

      this.putPieceOnShelf(piece, this.dragSourceSlot);

      this.clearDragState();
    }
  ]
});
