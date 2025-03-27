const $ = id => document.getElementById(id);
const grid = document.createElement('table');
const gridInternal = {
  cells: {},
  rows: [],
  columns: [],
  blocks: [], // TODO: make this an object
  emptyCells: new Set()
};
const singleDigitNumbers = [1,2,3,4,5,6,7,8,9];
const validKeyCodes = [
  "Digit1", 
  "Digit2", 
  "Digit3", 
  "Digit4", 
  "Digit5", 
  "Digit6", 
  "Digit7", 
  "Digit8", 
  "Digit9"
];
const hashmaker = '_abcdefghj';
grid.id = 'grid';

// Creates a simple hash for a cell given its coordinates.
function hash(x, y) {
  return hashmaker[x] + hashmaker[y];
}

// Returns a Cell object given a coordinate pair.
function getCell(x, y) {
  return gridInternal.cells[hash(x, y)];
}

// Returns a Cell object given a <td> element. (Reads its ID)
function getCellFromDOM(td) {
  const x = parseInt(td.id[1]);
  const y = parseInt(td.id[3]);
  return getCell(x, y);
}

// Returns the <td> associated with the Cell at the given coordinate pair.
function getCellDOM(x, y) {
  return $(`x${x}y${y}`);
}

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.DOM = getCellDOM(x, y);
    this.number = null;
    gridInternal.cells[hash(this.x, this.y)] = this;
    gridInternal.emptyCells.add(this);
    this.DOM.addEventListener("pointerup", e => {
      e.preventDefault();
      selectCell(e.target, e.shiftKey);
    })
  }
  // TODO: Make more efficient, you know how, can't articulate it
  isValidSudoku(num) {
    if (num === null) return true;
    const numbers = new Set();
    for (const cell of this.relevantCells) {
      if (cell.number !== null) numbers.add(cell.number);
    }
    if (numbers.has(num)) return false;
    return true;
  }
  setTo(num) {
    if (!this.isValidSudoku(num)) return;
    const oldNum = this.number;
    this.number = num;
    if (num === null) {
      this.DOM.innerText = "";
      if (oldNum !== null) gridInternal.emptyCells.add(this);
    } else {
      this.DOM.innerText = num;
      if (oldNum === null) gridInternal.emptyCells.delete(this);
    }
  }
  clear() {
    this.setTo(null);
    this.DOM.classList.remove("permanent");
  }
  getPossibleNumbers() {
    const numbers = new Set();
    for (const cell of this.relevantCells) {
      if (cell.number !== null) numbers.add(cell.number);
    }
    return singleDigitNumbers.filter(num => !numbers.has(num));
  }
}


class CellGroup {
  // `type` accepts type 'column', 'row', or 'block'.
  // `cells` accepts an Array of Cell objects.
  constructor(type, cellArray) {
    switch(type) {
      case 'column':
        gridInternal.columns.push(cellArray);
        for (const cell of cellArray) {
          cell.column = cellArray;
        }
        break;

      case 'row':
        gridInternal.rows.push(cellArray);
        for (const cell of cellArray) {
          cell.row = cellArray;
        }
        break;

      case 'block':
        gridInternal.blocks.push(cellArray);
        for (const cell of cellArray) {
          cell.block = cellArray;
        }
        break;

      default:
        throw Error("Invalid group type passed to CellGroup constructor");
    }
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

// Selects the cell clicked.
// If the clicked cell is already selected, deselects it.
// If there are other selected cells, deselects them unless SHIFT is pressed.
function selectCell(cellDOM, add) {
  if (!add) {
    const arrayCopy = Array.from(getSelectedCells());
    for (const selectedCell of arrayCopy) {
      if (selectedCell !== cellDOM) deselect(selectedCell);
    }
  }
  toggleSelected(cellDOM);
}

function toggleSelected(td) {
  td.classList.toggle("selected");
}
function select(td) {
  td.classList.add("selected");
}
function deselect(td) {
  td.classList.remove("selected");
}

function getSelectedCells() {
  return document.getElementsByClassName("selected");
}

function setCells(code) {
  if (!validKeyCodes.includes(code)) return;
  const selectedCells = getSelectedCells();
  if (selectedCells.length === 0) return;
  if (selectedCells.length === 1) {
    const cell = getCellFromDOM(selectedCells[0]);
    cell.setTo(parseInt(code[5]));
    if (cell.number !== null) cell.DOM.classList.add("permanent");
    deselect(cell.DOM);
  } else {
    console.log("Multi-set not yet supported");
  }
}

function clearCells(code) {
  if (code !== "Backspace") return;
  const selectedCells = Array.from(getSelectedCells());
  if (selectedCells.length === 0) return;
  for (const cellDOM of selectedCells) {
    getCellFromDOM(cellDOM).clear();
    deselect(cellDOM);
  }
}

// Returns an integer in the range 1-9 inclusive.
const randomSudokuInt = () => Math.random()*9+1|0;

// Returns a random Cell object from gridInternal.cells.
function randomCell() {
  const x = randomSudokuInt();
  const y = randomSudokuInt();
  return gridInternal.cells[hash(x, y)];
}

// Attempts to find an empty cell and attempts to set it to a random number.
// If either attempt fails, does nothing.
function setRandomCell() {
  const cell = randomCell();
  if (cell.number !== null) return;
  cell.setTo(randomSudokuInt());
  if (cell.number !== null) cell.classList.add("permanent");
}

$("setnum").addEventListener("pointerup", setRandomCell);

// AUTO SOLVING 
function attemptSolve() {
  let puzzleChanged = false;
  const emptyCellMap = {};
  Array.from(gridInternal.emptyCells).forEach(cell => {
    emptyCellMap[hash(cell.x, cell.y)] = cell.getPossibleNumbers();
  })
  for (const hash in emptyCellMap) {
    const possibleNumbers = emptyCellMap[hash];
    const cell = gridInternal.cells[hash];
    if (possibleNumbers.length > 1) continue;
    if (possibleNumbers.length === 1) {
      cell.setTo(possibleNumbers[0]);
      if (cell.number === null) {
        // If cell is still null, that means its only possible number is no longer possible, leaving the puzzle unsolvable
        console.warn(`Sudoku is unsolvable: Cell ${hash} has no possible numbers. `, cell)
        cell.DOM.classList.add("unsolvable");
      } else {
        puzzleChanged = true;
      }
    }
    if (possibleNumbers.length === 0) {
      // If the cell has no possible numbers, the puzzle is unsolvable
      console.warn(`Sudoku is unsolvable: Cell ${hash} has no possible numbers. `, cell)
      cell.DOM.classList.add("unsolvable");
    }
  }
  console.log(`Puzzle changed: ${puzzleChanged.toString()}`);
  return puzzleChanged;
  /*{
      "ab": [1, 2, 3]
      "cd": [4, 5]
      "ef": [6]
  */
}

window.addEventListener("keyup", e => {
  setCells(e.code);
  clearCells(e.code);
})

// Construct cell HTML
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
  }
  grid.appendChild(row);
}
document.body.appendChild(grid);

// Construct cell data structure
for (let i of singleDigitNumbers) {
  for (let j of singleDigitNumbers) {
    new Cell(i, j);
  }
}
for (const i of singleDigitNumbers) {
  new CellGroup('row', getCellsInRow(i));
  new CellGroup('column', getCellsInColumn(i));
}
const _blockShortcut = [1, 4, 7];
for (const x of _blockShortcut) {
  for (const y of _blockShortcut) {
    new CellGroup('block', getCellsInBlock(x, y))
  }
}
for (const cell of Object.values(gridInternal.cells)) {
  cell.relevantCells = getRelevantCells(cell.x, cell.y);
}