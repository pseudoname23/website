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

// Sets a selected cell to the provided number.
// This function is MANUAL and is triggered on key press by the user.
// Returns true if the puzzle changes as a result.
function setCells(code) {
  if (!validKeyCodes.includes(code)) return false;
  let puzzleChanged = false;
  const selectedCells = getSelectedCells();
  if (selectedCells.length === 0) return false;
  if (selectedCells.length === 1) {
    const cell = getCellFromDOM(selectedCells[0]);
    cell.setTo(parseInt(code[5]));
    if (cell.number !== null) {
      cell.DOM.classList.add("permanent");
      puzzleChanged = true;
    }
    deselect(cell.DOM);
  } else {
    console.log("Multi-set not yet supported");
  }
  return puzzleChanged;
}

function clearCells(code) {
  if (code !== "Backspace") return false;
  const selectedCells = Array.from(getSelectedCells());
  if (selectedCells.length === 0) return false;
  for (const cellDOM of selectedCells) {
    getCellFromDOM(cellDOM).clear();
    deselect(cellDOM);
  }
  return true;
}

// Takes a random empty cell and sets it to one of its possible numbers at random.
function setRandomCell() {
  const cell = randomEmptyCell();
  if (cell === null) {
    console.log("Cannot add random number: All cells are full");
    return false;
  }
  const candidates = cell.getPossibleNumbers();
  if (candidates.length === 0) {
    console.warn("Failed to add random number: Selected unsolvable cell");
    return false;
  }
  cell.setTo(candidates[Math.random()*candidates.length|0]);
  cell.DOM.classList.add("permanent");
  return true;
}

function updatePuzzleStateIndicator (string) {
  $("state").innerText = string;
}

function setPuzzleState() {
  if (document.getElementsByClassName("unsolvable").length > 0) {
    updatePuzzleStateIndicator("Unsolvable: One or more cells has no solution")
  } else if (gridInternal.emptyCells.size > 0) {
    updatePuzzleStateIndicator("Unsolved: Not enough info or insufficient logic to solve")
  } else {
    updatePuzzleStateIndicator("Solved")
  }
}