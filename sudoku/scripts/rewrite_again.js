const $ = id => document.getElementById(id);
const grid = document.createElement('table');
const gridInternal = {};
const singleDigitNumbers = [1,2,3,4,5,6,7,8,9];
const hashmaker = '_abcdefghj';
grid.id = 'grid';

// Selects the cell clicked.
// If the clicked cell is already selected, deselects it.
// If there are other selected cells, deselects them unless SHIFT is pressed.
function selectCell(cellDOM, add) {
  if (!add) {
    const arrayCopy = Array.from(document.getElementsByClassName("selected"));
    for (const selectedCell of arrayCopy) {
      if (selectedCell !== cellDOM) selectedCell.classList.remove("selected")
    }
  }
  cellDOM.classList.toggle("selected");
}

// Creates a simple hash for a cell given its coordinates.
function hash(x, y) {
  return hashmaker[x] + hashmaker[y];
}

// Returns a Cell object given a coordinate pair.
function getCell(x, y) {
  return gridInternal[hash(x, y)];
}

// Returns the <td> associated with the Cell at the given coordinate pair.
function getCellDOM(x, y) {
  return $(`x${x}y${y}`);
}

// Row 1 is the bottom, so it will be the last created
for (let i = 9; i > 0; --i) {
  let row = document.createElement('tr');
  row.id = "row"+i;
  // Column 1 is on the left, so it will be the first created
  for (let j = 1; j <= 9; ++j) {
    let cell = document.createElement('td');
    cell.id = `x${j}y${i}`;
    // X value === Col #
    // Y value === Row #
    cell.classList.add(`col${j}`);
    row.appendChild(cell);
    cell.addEventListener("pointerup", e => {
      selectCell(cell, e.shiftKey);
    })
  }
  grid.appendChild(row);
}
document.body.appendChild(grid);

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.DOM = getCellDOM(x, y);
    this.number = null;
    this.canBe = [undefined, true, true, true, true, true, true, true, true, true];
    this.fillState = {
      filled: false,
      computed: false,
      fixed: false
    }
    gridInternal[hash(this.x, this.y)] = this;
  }
  get empty() { return !this.fillState.filled; }
  set empty(bool) { this.fillState.filled = !bool; }
  get mutable() { return this.empty || this.fillState.computed; }
  setTo(num, manual = false) {
    let oldNum = this.number;
    this.number = num;
    if (num === null) {
      this.fillState.filled = this.fillState.computed = false;
      this.DOM.innerText = "";
    } else {
      this.fillState.filled = true;
      if (!manual) this.fillState.computed = true;
      this.DOM.innerText = num;
    }
  }
  clear(manual = false) {
    this.setTo(null, manual);
  }
  getPossibleNumbers() {
    for (let i of singleDigitNumbers) this.canBe[i] = true;
    for (let j of this.relevantCells) {
      if (j.number === null) continue;
      this.canBe[j.number] = false;
    }
    return this.canBe;
  }
}

for (let i of singleDigitNumbers) {
  for (let j of singleDigitNumbers) {
    new Cell(i, j);
  }
}

function getCellsInRow(y) {
  let row = [];
  for (let i of singleDigitNumbers) row.push(getCell(i, y));
  return row;
}

function getCellsInColumn(x) {
  let col = [];
  for (let i of singleDigitNumbers) col.push(getCell(x, i));
  return col;
}

function lowestBlockCoord(num) {
  if (num <= 3) return 1;
  if (num >= 7) return 7;
  return 4;
}
function getCellsInBlock(x, y) {
  x = lowestBlockCoord(x);
  y = lowestBlockCoord(y);
  let xPossibleCoords = [x, x+1, x+2];
  let yPossibleCoords = [y, y+1, y+2];
  let blk = [];
  for (let i of xPossibleCoords) {
    for (let j of yPossibleCoords) blk.push(getCell(i, j));
  }
  return blk;
}

function getRelevantCells(x, y) {
  let cells = new Set();
  cells.add(getCell(x, y));

  for (let i of getCellsInRow(y)) cells.add(i);
  for (let i of getCellsInColumn(x)) cells.add(i);
  for (let i of getCellsInBlock(x, y)) cells.add(i);

  cells.delete(getCell(x, y));
  return Array.from(cells);
}

const rows = [], columns = [], blocks = [];
for (let i of singleDigitNumbers) {
  rows.push(getCellsInRow(i));
  columns.push(getCellsInColumn(i));
  for (let j of singleDigitNumbers) {
    getCell(i, j).relevantCells = getRelevantCells(i, j);
  }
}