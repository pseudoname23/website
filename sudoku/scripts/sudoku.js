window.onerror = function(a,b,c,d , error) {
    alert(error.stack);
  }
  const $ = id => document.getElementById(id);
  const prettyPrintArray = arr => `[${arr.toString().replaceAll(',',', ')}]`
  const allowedNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const allowedNumberStrings = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
  let iteratedSinceLastInput = false;
  let prevIterationChanged = false;
  let t1, t2;
  const table = {
    cells: [],
    rows: [[], [], [], [], [], [], [], [], []],
    columns: [[], [], [], [], [], [], [], [], []],
    blocks: [[], [], [], [], [], [], [], [], []]
  }
  
  
  
  class Cell {
    constructor(cellement) {
      this.DOMCell = cellement;
      this.x = Number(this.DOMCell.id[0]);
      this.y = Number(this.DOMCell.id[1]);
      this.number = null;
      this.isComputed = false;
      this.column = table.columns[this.x-1];
      this.row = table.rows[this.y-1];
      this.block = table.blocks[Math.floor((this.y - 1) / 3) * 3 + Math.ceil(this.x / 3) - 1];
      table.cells.push(this);
      this.row.push(this);
      this.column.push(this);
      this.block.push(this);
    }
    clear(clearUser = false) {
      if (this.isComputed || clearUser) {
        this.number = null;
        this.DOMCell.innerHTML = '';
        if (this.isComputed) this.DOMCell.classList.remove('computed');
        this.isComputed = false;
      }
    }
    setTo(number, fromUser = false) {
      if (number === null) return this.clear(fromUser);
      number = Number(number); // This is very silly, but necessary.
      this.number = number;
      this.DOMCell.innerHTML = number;
      if (fromUser && this.isComputed) this.DOMCell.classList.remove('computed');
      if (!(fromUser || this.isComputed)) this.DOMCell.classList.add('computed');
      this.isComputed = !fromUser;
    }
    getPossibleNumbers(extraLogic = true) {
      if (this.number) return null;
      let pre = allowedNumbers.filter(number => getNumbersInGroup(this.relevantCells).indexOf(number) === -1);
      if (!extraLogic) return pre; // Everything after this line is broken
      let post = pre.filter(() => true);
      pre.forEach(number => {
        let maybeBlock = possibilitiesAreLocalized(this.row, number);
        if (maybeBlock && (this.block !== maybeBlock)) post.splice(post.indexOf(number), 1);
        if (post.indexOf(number) === -1) return;
        maybeBlock = possibilitiesAreLocalized(this.column, number);
        if (maybeBlock && (this.block !== maybeBlock)) post.splice(post.indexOf(number), 1);
      })
      return post;
    }
  }
  
  
  
  for(let i = 1; i < 10; ++i) {
    for (let j = 1; j < 10; ++j) new Cell($(`${i}${j}`));
  }
  for (let cell of table.cells) cell.relevantCells = Array.from(new Set(cell.column.concat(cell.row).concat(cell.block).filter(otherCell => otherCell !== cell)));
  
  
  
  const getDOMCellAt = (x, y) => table.columns[x-1][y-1].DOMCell;
  const getFullCellAt = (x, y) => table.columns[x-1][y-1];
  const getFullCellFromDOM = DOMCell => table.columns[DOMCell.id[0]-1][DOMCell.id[1]-1];
  const getFilledCellsInGroup = group => group.filter(cell => cell.number);
  const getEmptyCellsInGroup = group => group.filter(cell => !cell.number);
  const getNumbersInGroup = group => group.filter(cell => cell.number).map(cell => cell.number);
  const groupIsFull = group => !group.some(cell => !cell.number);
  const groupIsEmpty = group => !group.some(cell => cell.number);
  
  
  
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
  for (let name of Object.keys(borderWidths)) {
    for (let n of borderWidths[name]) getDOMCellAt(n/10|0, n%10).classList.add(name);
  }
  borderWidths = null;
  
  
  
  function handleKey(keyEvent){
    let selectedCell = document.querySelectorAll('.selected')[0];
    if (!selectedCell) return;
    let fullSelectedCell = getFullCellFromDOM(selectedCell);
    if (allowedNumberStrings.indexOf(keyEvent.key) !== -1) {
      fullSelectedCell.setTo(Number(keyEvent.key), true)
      selectedCell.classList.remove('selected');
    } else if (keyEvent.key === "Backspace") {
      if (fullSelectedCell.isComputed) return selectedCell.classList.remove('selected');
      fullSelectedCell.clear(true);
      selectedCell.classList.remove('selected');
    } else { return; }
    Array.from(document.querySelectorAll('.nearSelected')).forEach(cell => {
      cell.classList.remove('nearSelected');
    })
    iteratedSinceLastInput = false;
    computeCells();
  }
  
  
  
  function handleClick(event) {
    Array.from(document.querySelectorAll('.nearSelected')).forEach(cell => {
      cell.classList.remove('nearSelected');
    })
    if (this === document.querySelectorAll('.selected')[0]) {
      this.classList.remove('selected');
    } else {
      document.querySelectorAll('.selected')[0]?.classList.remove('selected');
      this.classList.add('selected');
      getFullCellFromDOM(this).relevantCells.forEach(cell => {
        cell.DOMCell.classList.add('nearSelected');
      })
    }
  }
  
  
  
  window.addEventListener('keydown', handleKey);
  table.cells.forEach(cell => cell.DOMCell.addEventListener('pointerup', handleClick));
  
  
  
  function computeCells() {
    if (!iteratedSinceLastInput) {
      prevIterationChanged = true;
      for (let cell of table.cells) cell.clear();
    } else if (!prevIterationChanged) { 
      for (let cell of getEmptyCellsInGroup(table.cells)) {
        cell.DOMCell.title = prettyPrintArray(cell.getPossibleNumbers());
      }
      for (let cell of getFilledCellsInGroup(table.cells)) {
        cell.DOMCell.title = '';
      }
      tableIsValidSudoku();
      return;
    }
    return iterateCells();
  }
  
  
  
  function iterateCells() {
    iteratedSinceLastInput = true;
    prevIterationChanged = false;
    for (let cell of table.cells) {
      t1 = performance.now();
      if (cell.number) continue;
      let possibleNumbers = cell.getPossibleNumbers();
      if (possibleNumbers.length === 1) {
        cell.setTo(possibleNumbers[0]);
        prevIterationChanged = true;
      } else {
        for (let i = 1; i <= 9; ++i) {
          if(isOnlyPossibleSolution(cell, cell.relevantCells, i)) {
            cell.setTo(i);
            prevIterationChanged = true;
            break;
          }
        }
      }
    }
    return computeCells();
  }
  
  
  
  function isOnlyPossibleSolution(cell, group, number) {
    let possibilities = [];
    for(let emptyCell of getEmptyCellsInGroup(group)) {
      possibilities.push(emptyCell.getPossibleNumbers());
      if (possibilities.filter(possibility => possibility.indexOf(number) !== -1).length > 1) return false;
    }
    if (possibilities.filter(possibility => possibility.indexOf(number) !== -1).length === 1 && cell.getPossibleNumbers().indexOf(number) !== -1) return true;
    return false;
  }
  
  
  
  function tableIsValidSudoku() {
    for (let i = 1; i <= 9; ++i) {
      // Return false if a number is present more than once in any group
      // Return false if any empty cell can't be filled
      for (let row of table.rows) {
        if (getNumbersInGroup(row).filter(n => n === i).length > 1) throw new Error(`Row ${row[0].DOMCell.y} contains multiple instances of the same number`);
      }
      for (let column of table.columns) {
        if (getNumbersInGroup(column).filter(n => n === i).length > 1) throw new Error(`Column ${column[0].DOMCell.x} contains multiple instances of the same number`);
      }
      for (let block of table.blocks) {
        if (getNumbersInGroup(block).filter(n => n === i).length > 1) throw new Error(`Block (${Math.ceil(block[0].DOMCell.x / 3)}, ${Math.ceil(block[0].DOMCell.y / 3)}) contains multiple instances of the same number`);
      }
      for (let cell of getEmptyCellsInGroup(table.cells)) {
        if (cell.getPossibleNumbers().length === 0) throw new Error(`Cell ${cell.DOMCell.id} is empty and cannot be solved`);
      }
    }
    return true;
  }
  
  
  
  function possibilitiesAreLocalized(line, number) {
    // For each block that touches the line, store only empty cells in that block that can be set to the given number
    let block1 = getEmptyCellsInGroup(line[0].block).filter(cell => cell.getPossibleNumbers(false).indexOf(number) !== -1);
    let block2 = getEmptyCellsInGroup(line[3].block).filter(cell => cell.getPossibleNumbers(false).indexOf(number) !== -1);
    let block3 = getEmptyCellsInGroup(line[6].block).filter(cell => cell.getPossibleNumbers(false).indexOf(number) !== -1);
    
    // If *every* stored cell in that block is also in the given line, return the entire block
    // if (block1 && (block1.filter(cell => line.indexOf(cell) !== -1).length === block1.length)) return line[0].block;
    // if (block2 && (block2.filter(cell => line.indexOf(cell) !== -1).length === block2.length)) return line[3].block;
    // if (block3 && (block3.filter(cell => line.indexOf(cell) !== -1).length === block3.length)) return line[6].block;
    if (block1 && (block1.filter(cell => line.indexOf(cell) !== -1).length === block1.length)) console.log(block1.filter(cell => line.indexOf(cell) !== -1).length, block1.length);
    if (block2 && (block2.filter(cell => line.indexOf(cell) !== -1).length === block2.length)) console.log(block2.filter(cell => line.indexOf(cell) !== -1).length, block2.length);
    return false;
  }