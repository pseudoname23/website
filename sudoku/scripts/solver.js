// AUTO SOLVING 
function attemptSolve() {
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
  console.log(`Puzzle changed: ${puzzleChanged.toString()}`);
  return puzzleChanged;
}

// Attempts to solve the puzzle until an attempt changes nothing.
// Afterward, updates the puzzle state.
// Returns the number of attempts made.
function recursiveSolve() {
  let lastIterationChanged = true;
  let attempts = 0;
  while (lastIterationChanged) {
    lastIterationChanged = attemptSolve();
    ++attempts;
  }
  setPuzzleState();
  return attempts;
}