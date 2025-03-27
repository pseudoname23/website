$("setnum").addEventListener("pointerup", () => {
  const success = setRandomCell();
  if (success) recursiveSolve();
});

window.addEventListener("keyup", e => {
  let puzzleChanged = setCells(e.code);
  puzzleChanged = puzzleChanged || clearCells(e.code);
  if (puzzleChanged) recursiveSolve();
})