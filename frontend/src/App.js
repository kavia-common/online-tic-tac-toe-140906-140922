import React, { useMemo, useState } from 'react';
import './App.css';

/**
 * Determine if there is a winner on a 3x3 board
 * Returns:
 * - { winner: 'X'|'O', line: number[] } when someone wins
 * - null if no winner yet
 */
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6],            // diagonals
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

// PUBLIC_INTERFACE
export default function App() {
  /**
   * Basic local two-player state
   * - board: 9 cells, null | 'X' | 'O'
   * - xIsNext: whose turn
   */
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameId, setGameId] = useState(1); // used to remount board on reset for subtle animations

  const result = useMemo(() => calculateWinner(board), [board]);
  const isDraw = useMemo(() => !result && board.every(Boolean), [result, board]);
  const currentPlayer = xIsNext ? 'X' : 'O';

  // PUBLIC_INTERFACE
  const handleCellClick = (index) => {
    if (board[index] || result || isDraw) return; // ignore if occupied or game ended
    const next = board.slice();
    next[index] = currentPlayer;
    setBoard(next);
    setXIsNext(!xIsNext);
  };

  // PUBLIC_INTERFACE
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setGameId((id) => id + 1);
  };

  const winningLine = result?.line ?? [];

  const statusLabel = result
    ? `Winner: ${result.winner}`
    : isDraw
      ? 'Draw'
      : `Turn: ${currentPlayer}`;

  const secondaryHint = result
    ? 'Tap Reset to play again'
    : isDraw
      ? 'No moves left. Reset to play again'
      : `Player ${currentPlayer} to move`;

  // No external services needed; env vars respected if present but unused here.
  const appEnv = {
    API_BASE: process.env.REACT_APP_API_BASE,
    BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
    FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL,
    WS_URL: process.env.REACT_APP_WS_URL,
    NODE_ENV: process.env.REACT_APP_NODE_ENV,
  };
  void appEnv; // silence lint for unused, kept for future integration

  return (
    <div className="App">
      <main className="game-card" aria-label="Tic Tac Toe Game" role="application">
        <header className="header">
          <div className="brand" aria-label="Brand">
            <div className="brand-badge" aria-hidden>TT</div>
            <div>
              <h1 className="title">Tic Tac Toe</h1>
              <p className="subtitle">Ocean Professional</p>
            </div>
          </div>

          <div className="status" role="status" aria-live="polite">
            <span className="badge">{statusLabel}</span>
            {!result && !isDraw && (
              <span className="turn" aria-label={`Current player ${currentPlayer}`}>
                <span className="dot" />
                {currentPlayer}
              </span>
            )}
          </div>
        </header>

        <section
          key={gameId}
          className="board"
          role="grid"
          aria-label="Tic Tac Toe board"
        >
          {board.map((value, idx) => {
            const isWinningCell = winningLine.includes(idx);
            const classes = [
              'cell',
              value ? value : '',
              isWinningCell ? 'win' : '',
              (result || isDraw) ? 'disabled' : ''
            ].join(' ').trim();

            return (
              <button
                key={idx}
                className={classes}
                onClick={() => handleCellClick(idx)}
                aria-label={`Cell ${idx + 1}${value ? ` contains ${value}` : ' empty'}`}
                aria-disabled={Boolean(result || isDraw || value)}
              >
                {value}
              </button>
            );
          })}
        </section>

        <footer className="actions">
          <button className="reset-btn" onClick={resetGame} aria-label="Reset game">
            Reset
          </button>
          <span className="note">{secondaryHint}</span>
        </footer>
      </main>
    </div>
  );
}
