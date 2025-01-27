function randomSudoku() {
    let count = 0;
    let isComplete = false;
    while(!isComplete) {
        ++count;
        if (groupIsFull(table.cells)) return;
        let randCell = getEmptyCellsInGroup(table.cells)[Math.floor(Math.random()*getEmptyCellsInGroup(table.cells).length)];
        if (!randCell.getPossibleNumbers()[0]) {
            alert('Sudoku is not solvable');
            return;
        }
        let randNum = randCell.getPossibleNumbers()[Math.floor(Math.random()*(randCell.getPossibleNumbers().length))];
        randCell.setTo(randNum, true);
        iteratedSinceLastInput = false;
        computeCells();
        if (!tableIsValidSudoku()) {
            randCell.clear(true);
            iteratedSinceLastInput = false;
            computeCells();
        }
        isComplete = groupIsFull(table.cells) && tableIsValidSudoku();
    }
    alert(count);
}
function placeRandomNumber() {
    if (groupIsFull(table.cells)) return;
    let randCell = getEmptyCellsInGroup(table.cells)[Math.floor(Math.random()*getEmptyCellsInGroup(table.cells).length)];
    let randNum = randCell.getPossibleNumbers()[Math.floor(Math.random()*(randCell.getPossibleNumbers().length))];
    randCell.setTo(randNum, true);
    iteratedSinceLastInput = false;
    computeCells();
    if (!tableIsValidSudoku()) {
        randCell.clear(true);
        iteratedSinceLastInput = false;
        computeCells();
    }
}