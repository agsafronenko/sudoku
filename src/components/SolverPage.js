import React, { useState, useEffect } from "react";
import Cell from "./Cell";
import NumberPad from "./NumberPad";
import Modal from "./Modal";
import MuteButton from "./MuteButton";
import { solveSudoku } from "../utils/sudokuSolver";
import { playSound } from "../utils/soundUtils";
import { setupKeyboardListeners } from "../utils/keyboardHandler";
import "./SolverPage.css";

function SolverPage() {
  const [board, setBoard] = useState(
    Array(9)
      .fill()
      .map(() => Array(9).fill(0))
  );
  const [selectedCell, setSelectedCell] = useState(null);
  const [solution, setSolution] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Add keyboard event listener
  useEffect(() => {
    // Create dummy functions for unsupported operations in solver
    const dummyFn = () => {};

    const cleanup = setupKeyboardListeners({
      selectedCell,
      originalBoard: Array(9)
        .fill()
        .map(() => Array(9).fill(0)),
      handleNumberInput,
      toggleNoteMode: dummyFn,
      notes: [],
      setNotes: dummyFn,
      setSelectedCell,
      showHint: dummyFn,
      showIncorrectCells: dummyFn,
      startNewGame: clearBoard,
    });
    return cleanup;
  }, [selectedCell, board]);

  const handleCellClick = (row, col) => {
    // Don't allow selection if solution is displayed
    if (solution) return;

    playSound("clickCell");
    setSelectedCell({ row, col });
  };

  const handleNumberInput = (number) => {
    if (!selectedCell || solution) return;

    if (number === 0) {
      playSound("clear");
    } else {
      playSound("clickButton");
    }
    const { row, col } = selectedCell;
    const newBoard = [...board];
    newBoard[row][col] = number === newBoard[row][col] ? 0 : number;
    setBoard(newBoard);
  };

  const solvePuzzle = () => {
    playSound("clickButton");
    const boardCopy = JSON.parse(JSON.stringify(board));

    const result = solveSudoku(boardCopy);

    if (result.solved) {
      setSolution(result.board);
      setModalMessage("Puzzle solved!");
      playSound("congratulations");
    } else {
      setSolution(null);
      setModalMessage("This puzzle cannot be solved. Please check your input.");
      playSound("failed");
    }

    setShowModal(true);
  };

  const clearBoard = () => {
    playSound("clear");
    setBoard(
      Array(9)
        .fill()
        .map(() => Array(9).fill(0))
    );
    setSolution(null);
  };

  return (
    <div className="solver-container">
      <MuteButton />
      <h2 className="solver-title">Sudoku Solver</h2>
      <p className="solver-instructions">Enter the numbers you want to solve, then click "Solve". Use keyboard numbers 1-9 to input values, or Delete/Backspace to clear cells.</p>

      <div className="board-container">
        <div className="sudoku-board">
          {(solution || board).map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((cell, colIndex) => (
                <Cell key={`${rowIndex}-${colIndex}`} value={cell} notes={[]} isSelected={selectedCell?.row === rowIndex && selectedCell?.col === colIndex} isOriginal={solution ? true : false} isIncorrect={false} onClick={() => handleCellClick(rowIndex, colIndex)} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="solver-controls">
        <button className="solver-button solve" onClick={solvePuzzle} disabled={!!solution}>
          Solve
        </button>
        <button className="solver-button clear" onClick={clearBoard}>
          Clear Board
        </button>
      </div>

      {!solution && <NumberPad onNumberSelect={handleNumberInput} />}

      {showModal && <Modal message={modalMessage} onClose={() => setShowModal(false)} />}
    </div>
  );
}

export default SolverPage;
