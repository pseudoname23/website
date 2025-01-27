window.addEventListener('error', (a,b,c,d,e) => {
    alert(e.stack);
  })
  const $ = id => document.getElementById(id);
  const table = {
    cells: [],
    rows: [],
    columns: [],
    blocks: []
  };
  const state = {
    action: '1',
    mouseDown: false,
    shift: false,
    alt: false,
    ctrl: false,
    numTouches: 0,
    blockActionChanges: false,
  };
  
  const toBlockCoords = (row, col) => [Math.ceil(row / 3), Math.ceil(col / 3)];
  const getCell = (row, col) => table.cells[row*9 + col - 10];
  const getRow = number => table.rows[number - 1];
  const getColumn = number => table.columns[number - 1];
  const getBlock = (blockRow, blockCol) => table.blocks[blockRow*3 + blockCol - 4];
  const cellFromDOM = DOMCell => getCell(Number(DOMCell.id[1]), Number(DOMCell.id[0]));
  function createRejectionSpan(number) {
    let span = document.createElement('span');
    span.innerHTML = `!${number} `;
    span.classList.add('rejected');
    return span;
  }
  function createSuspicionSpan(number) {
    let span = document.createElement('span');
    span.innerHTML = `${number}, `;
    span.classList.add('sus');
    return span;
  }
  function appendLineBreak (parent) {
    let br = document.createElement('br');
    br.classList.add('rejected');
    parent.appendChild(br);
  }
  
  class Cell {
  
    // param DOMCell: HTMLTableCellElement
    constructor(DOMCell) {
      this.DOMCell = DOMCell;
      this.rowNumber = DOMCell.id[1];
      this.colNumber = DOMCell.id[0];
      this.blockCoords = {
        row: toBlockCoords(this.rowNumber, this.colNumber)[0],
        col: toBlockCoords(this.rowNumber, this.colNumber)[1],
      };
      this.number = null;
      this.suspicions = [];
      this.rejections = [];
      table.cells.push(this);
    }
    updateDOM() {
      this.DOMCell.innerHTML = '';
      if (!this.number) {
        this.rejections.forEach(num => {
          this.DOMCell.appendChild(createRejectionSpan(num))
        })
        if (this.suspicions[0] && this.rejections[0]) appendLineBreak(this.DOMCell);
        this.suspicions.forEach(num => {
          this.DOMCell.appendChild(createSuspicionSpan(num))
        })
      } else {
        this.DOMCell.innerHTML = this.number;
      }
    }
    setTo(number) {
      this.number = number;
      this.clearHypotheses();
    }
    clear() {
      if (!this.number) return;
      this.number = null;
      this.updateDOM();
    }
    suspect(number) {
      if (this.number) return;
      if (this.suspicions.indexOf(number) > -1) return;
      this.suspicions.push(number);
      this.suspicions.sort();
      this.updateDOM();
    }
    reject(number) {
      if (this.number) return;
      if (this.rejections.indexOf(number) > -1) return;
      this.rejections.push(number);
      this.rejections.sort();
      this.updateDOM();
    }
    clearSuspicions() {
      this.suspicions = [];
      this.updateDOM();
    }
    clearRejections() {
      this.rejections = [];
      this.updateDOM();
    }
    clearHypotheses() {
      // Prevents updating the DOM twice for performance reasons
      this.suspicions = [];
      this.rejections = [];
      this.updateDOM();
    }
    getRow() { return getRow(this.rowNumber); }
    getColumn() { return getColumn(this.colNumber); }
    getBlock() {
      return getBlock(this.blockCoords.row, this.blockCoords.col);
    }
  }
  
  class Row {
  
    // param rowNumber: int[1-9] inclusive
    constructor(rowNumber) {
      this.number = rowNumber;
      this.cells = table.cells.filter(cell => cell.rowNumber === this.number);
      table.rows.push(this);
    }
  }
  
  class Column {
  
    // param colNumber: int[1-9] inclusive
    constructor(colNumber) {
      this.number = colNumber;
      this.cells = table.cells.filter(cell => cell.colNumber === this.number);
      table.columns.push(this);
    }
  }
  
  class Block {
  
    // param blockRow: int[1-3] inclusive
    // param blockCol: int[1-3] inclusive
    constructor(blockRow, blockCol) {
      this.coords = [blockRow, blockCol];
      this.cells = 
          table.cells.filter(cell => cell.blockCoords.row === this.coords[0])
                     .filter(cell => cell.blockCoords.col === this.coords[1]);
      table.blocks.push(this);
    }
  }
  
  // Create a new Cell object from every cell in the table
  for (let i = 1; i <= 9; ++i) {
    for (let j = 1; j <= 9; ++j) {
      new Cell($(`${j}${i}`));
    }
  }
  
  // Create a new Row object from every row in the table
  // Create a new Column object from every column in the table
  for (let i = 1; i <= 9; ++i) {
    new Row(i);
    new Column(i);
  }
  
  // Create a new Block object from every block in the table
  for (let i = 1; i <= 3; ++i) {
    for (let j = 1; j <= 3; ++j) {
      new Block(i, j);
    }
  }
  
  // Magically apply correct border weights to each cell
  // I still can't believe this works. It's so goofy.
  let borderWidths = {
    edge_top: [19, 29, 39, 49, 59, 69, 79, 89, 99],
    edge_right: [91, 92, 93, 94, 95, 96, 97, 98, 99],
    edge_bottom: [11, 21, 31, 41, 51, 61, 71, 81, 91],
    edge_left: [11, 12, 13, 14, 15, 16, 17, 18, 19],
    hash_top: [13, 23, 33, 43, 53, 63, 73, 83, 93, 16, 26, 36, 46, 56, 66, 76, 86, 96],
    hash_right: [31, 32, 33, 34, 35, 36, 37, 38, 39, 61, 62, 63, 64, 65, 66, 67, 68, 69],
    hash_bottom: [14, 24, 34, 44, 54, 64, 74, 84, 94, 17, 27, 37, 47, 57, 67, 77, 87, 97],
    hash_left: [41, 42, 43, 44, 45, 46, 47, 48, 49, 71, 72, 73, 74, 75, 76, 77, 78, 79],
  }
  for (let name in borderWidths) {
    for (let n of borderWidths[name]) {
      getCell(n % 10, n/10 | 0).DOMCell.classList.add(name);
    }
  }
  borderWidths = null;
  
  function onKeyDown(event) {
    if (event.repeat || state.blockActionChanges) return;
    switch(event.key) {
      case '1': case '2': case '3':
      case '4': case '5': case '6':
      case '7': case '8': case '9':
      case 'Backspace':
        state.action = event.key;
        break;
      case 'Alt':     state.alt   = true; break;
      case 'Control': state.ctrl  = true; break;
      case 'Shift':   state.shift = true; break;
      default: break;
    }
  }
  
  function onKeyUp(event) {
    if (state.blockActionChanges) return;
    switch(event.key) {
      case 'Control': state.ctrl  = false; break;
      case 'Shift':   state.shift = false; break;
      case 'Alt':     state.alt   = false; break;
    }
  }
  
  function onPointerDown(event) {
    event.preventDefault();
    event.stopPropagation();
    state.mouseDown = true;
    state.blockActionChanges = true;
    if (state.action === 'Backspace') {
      if (state.ctrl) {
        if (state.alt) {
          cellFromDOM(this).clearSuspicions();
        } else {
          cellFromDOM(this).clearRejections();
        }
      } else {
        cellFromDOM(this).clear();
      }
    } else {
      if (state.ctrl) {
        if (state.alt) {
          cellFromDOM(this).suspect(state.action);
        } else {
          cellFromDOM(this).reject(state.action);
        }
      } else {
        cellFromDOM(this).setTo(state.action);
      }
    }
  }
  
  function onPointerUp(event) {
    state.mouseDown = false;
    state.blockActionChanges = false;
  }
  
  function onPointerEnter(event) {
    event.stopPropagation();
    if (!state.shift || !state.mouseDown) return;
    onPointerDown.call(this, event);
  }
  
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('contextmenu', event => event.preventDefault());
  
  for (let cell of table.cells.map(c => c.DOMCell)) {
    cell.addEventListener('pointerdown', onPointerDown);
    cell.addEventListener('pointerenter', onPointerEnter);
  }