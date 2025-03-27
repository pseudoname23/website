// https://sudoku.com/sudoku-rules
function obviousSingles() {
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

function genericHiddenSingles(group) {
  if (group.solved) return false;
  const emptyCells = group.getEmptyCells();
  if (emptyCells.length === 0) {
    group.solved = true;
    return false;
  }
  if (emptyCells.length === 1) return false; // Presumably unsolvable
  let subPuzzleChanged = false;
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
    cell.setTo(parseInt(n));
    subPuzzleChanged = true;
  }
  return subPuzzleChanged;
}

function hiddenSingles() {
  let puzzleChanged = false;
  for (const col of gridInternal.columns) {
    puzzleChanged = puzzleChanged || genericHiddenSingles(col);
  }
  for (const row of gridInternal.rows) {
    puzzleChanged = puzzleChanged || genericHiddenSingles(row);
  }
  for (const block of gridInternal.blocks) {
    puzzleChanged = puzzleChanged || genericHiddenSingles(block);
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
  //let extraDebugging = false;
  let attempts = 0;

  // Phase 1: Look for cells with exactly 1 possible number
  while (lastIterationChanged) {
    //if (extraDebugging === true) break;
    //if (attempts >= 1000) {
    //  console.warn("Reached 1,000 attempts in one solve; cycling once with extra debugging, then aborting");
    //  extraDebugging = true;
    //}
    lastIterationChanged = obviousSingles();
    ++attempts;
    if (lastIterationChanged) continue;
    lastIterationChanged = hiddenSingles();
    ++attempts;
  }

  // Phase 2: Look for cell groups where a possible number occurs in only 1 spot
  setPuzzleState();
  return attempts;
}