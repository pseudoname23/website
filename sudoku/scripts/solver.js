// AUTO SOLVING 
function cellSolve() {
  let puzzleChanged = false;
  const emptyCellMap = {};
  Array.from(gridInternal.emptyCells).forEach(cell => {
    emptyCellMap[hash(cell.x, cell.y)] = cell.getPossibleNumbers();
    cell.DOM.classList.remove("unsolvable");
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
  console.log(`Puzzle changed: ${puzzleChanged.toString()} (cell phase)`);
  return puzzleChanged;
}

function groupSolve() {
  // Only columns for now
  let puzzleChanged = false;
  for (const col of gridInternal.columns) {
    if (col.solved) continue;
    const emptyCells = col.getEmptyCells();
    if (emptyCells.length === 0) {
      col.solved = true;
      continue;
    }
    if (emptyCells.length === 1) continue; // Presumably unsolvable
    const possibilitiesMap = {
      1: [],
      2: [], // There is probably a better way to do this,
      3: [], // but this way works for now
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: []
    }
    for (const cell of emptyCells) {
      const numbers = cell.getPossibleNumbers();
      for (const n of numbers) possibilitiesMap[n].push(cell);
    }
    for (const n in possibilitiesMap) {
      const arr = possibilitiesMap[n];
      if (arr.length !== 1) continue;
      const cell = arr[0];
      cell.setTo(n);
      puzzleChanged = true;
    }
  }
  console.log(`Puzzle changed: ${puzzleChanged.toString()} (group phase)`);
  return puzzleChanged;
  // Get the empty cells in each group and make a data structure like this: {
  // 1: ["aa", "ab", "ac"],
  // 4: ["aa"], <--- LOOK FOR THESE
  // 5: ["af", "ag"]
}

// Attempts to solve the puzzle until an attempt changes nothing.
// Afterward, updates the puzzle state.
// Returns the number of attempts made.
function recursiveSolve() {
  let lastIterationChanged = true;
  let attempts = 0;

  // Phase 1: Look for cells with exactly 1 possible number
  while (lastIterationChanged) {
    lastIterationChanged = cellSolve();
    ++attempts;
    if (lastIterationChanged) continue;
    lastIterationChanged = groupSolve();
    ++attempts;
  }

  // Phase 2: Look for cell groups where a possible number occurs in only 1 spot
  setPuzzleState();
  return attempts;
}