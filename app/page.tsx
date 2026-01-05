"use client";

import { useState } from "react";

type Cell = "X" | "O" | " ";
type Difficulty = "easy" | "medium" | "hard";
type GameMode = "ai" | "friend";

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6] // diagonals
];

export default function Home() {
  const [board, setBoard] = useState<Cell[]>(new Array(9).fill(" "));
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [gameMode, setGameMode] = useState<GameMode>("ai");
  const [currentPlayer, setCurrentPlayer] = useState<Cell>("X");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [scores, setScores] = useState({ player: 0, ai: 0, draws: 0 });
  const [isThinking, setIsThinking] = useState(false);

  const checkWinner = (board: Cell[], player: Cell): boolean => {
    return WINNING_COMBOS.some(combo =>
      combo.every(index => board[index] === player)
    );
  };

  const isDraw = (board: Cell[]): boolean => {
    return !board.includes(" ");
  };

  const minimax = (boardCopy: Cell[], isMaximizing: boolean): number => {
    if (checkWinner(boardCopy, "O")) return 1;
    if (checkWinner(boardCopy, "X")) return -1;
    if (isDraw(boardCopy)) return 0;

    if (isMaximizing) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (boardCopy[i] === " ") {
          const newBoard = [...boardCopy];
          newBoard[i] = "O";
          best = Math.max(best, minimax(newBoard, false));
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (boardCopy[i] === " ") {
          const newBoard = [...boardCopy];
          newBoard[i] = "X";
          best = Math.min(best, minimax(newBoard, true));
        }
      }
      return best;
    }
  };

  const getEmptyIndices = (board: Cell[]): number[] => {
    return board.map((cell, i) => cell === " " ? i : -1).filter(i => i !== -1);
  };

  const randomMove = (board: Cell[], randomValue: number): number => {
    const empty = getEmptyIndices(board);
    return empty[Math.floor(randomValue * empty.length)];
  };

  const bestMove = (board: Cell[]): number => {
    let bestScore = -Infinity;
    let move = 0;
    for (let i = 0; i < 9; i++) {
      if (board[i] === " ") {
        const newBoard = [...board];
        newBoard[i] = "O";
        const score = minimax(newBoard, false);
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  const aiMove = (board: Cell[], difficulty: Difficulty, randomValue: number): number => {
    if (difficulty === "easy") {
      return randomMove(board, randomValue);
    } else if (difficulty === "medium") {
      const shouldUseRandom = randomValue < 0.5;
      return shouldUseRandom ? randomMove(board, randomValue) : bestMove(board);
    } else {
      return bestMove(board);
    }
  };

  const handleCellClick = (index: number) => {
    if (board[index] !== " " || gameOver || isThinking) return;

    const newBoard = [...board];
    
    if (gameMode === "friend") {
      // Friend mode - alternate between X and O
      newBoard[index] = currentPlayer;
      setBoard(newBoard);

      if (checkWinner(newBoard, currentPlayer)) {
        setWinner(`Player ${currentPlayer} wins!`);
        setGameOver(true);
        if (currentPlayer === "X") {
          setScores(prev => ({ ...prev, player: prev.player + 1 }));
        } else {
          setScores(prev => ({ ...prev, ai: prev.ai + 1 }));
        }
        return;
      }

      if (isDraw(newBoard)) {
        setWinner("Draw!");
        setGameOver(true);
        setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
        return;
      }

      // Switch player
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    } else {
      // AI mode
      newBoard[index] = "X";
      setBoard(newBoard);

      if (checkWinner(newBoard, "X")) {
        setWinner("You win!");
        setGameOver(true);
        setScores(prev => ({ ...prev, player: prev.player + 1 }));
        return;
      }

      if (isDraw(newBoard)) {
        setWinner("Draw!");
        setGameOver(true);
        setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
        return;
      }

      setIsThinking(true);
      setTimeout(() => {
        const randomValue = Math.random();
        const move = aiMove(newBoard, difficulty, randomValue);
        const aiBoard = [...newBoard];
        aiBoard[move] = "O";
        setBoard(aiBoard);
        setIsThinking(false);

        if (checkWinner(aiBoard, "O")) {
          setWinner("AI wins!");
          setGameOver(true);
          setScores(prev => ({ ...prev, ai: prev.ai + 1 }));
        } else if (isDraw(aiBoard)) {
          setWinner("Draw!");
          setGameOver(true);
          setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
        }
      }, 300);
    }
  };

  const resetGame = () => {
    setBoard(new Array(9).fill(" "));
    setGameOver(false);
    setWinner(null);
    setIsThinking(false);
    setCurrentPlayer("X");
  };

  const resetScores = () => {
    setScores({ player: 0, ai: 0, draws: 0 });
    resetGame();
  };

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-4">
      <div className="w-full max-w-4xl">
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
          {/* Left Side - Scores & Info */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Tic Tac Toe
            </h1>
            
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm space-y-2">
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Game Mode</div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setGameMode("ai");
                    resetGame();
                    resetScores();
                  }}
                  className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-colors cursor-pointer ${
                    gameMode === "ai"
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600"
                  }`}
                >
                  vs AI
                </button>
                <button
                  onClick={() => {
                    setGameMode("friend");
                    resetGame();
                    resetScores();
                  }}
                  className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-colors cursor-pointer ${
                    gameMode === "friend"
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600"
                  }`}
                >
                  vs Friend
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm space-y-3">
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Score</div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{scores.player}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">{gameMode === "ai" ? "You" : "Player X"}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-600 dark:text-zinc-400">{scores.draws}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Draws</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{scores.ai}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">{gameMode === "ai" ? "AI" : "Player O"}</div>
                </div>
              </div>
            </div>

            {gameMode === "ai" && (
              <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm space-y-2">
                <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Difficulty</div>
                <div className="flex gap-2">
                  {(["easy", "medium", "hard"] as Difficulty[]).map((level) => {
                    const colors = {
                      easy: difficulty === level 
                        ? "bg-green-500 text-white" 
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600",
                      medium: difficulty === level 
                        ? "bg-orange-500 text-white" 
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600",
                      hard: difficulty === level 
                        ? "bg-red-500 text-white" 
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600"
                    };
                    
                    return (
                      <button
                        key={level}
                        onClick={() => {
                          setDifficulty(level);
                          resetGame();
                        }}
                        className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-colors cursor-pointer ${colors[level]}`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {gameMode === "ai" ? (
                <>You are <span className="text-blue-600 dark:text-blue-400 font-semibold">X</span>, AI is <span className="text-red-600 dark:text-red-400 font-semibold">O</span></>
              ) : (
                <>Current: <span className={`font-semibold ${currentPlayer === "X" ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}`}>{currentPlayer}</span></>
              )}
            </p>
          </div>

          {/* Center - Game Board */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-8 shadow-lg">
            <div className="grid grid-cols-3 gap-3 mb-6" style={{ width: "360px", height: "360px" }}>
              {board.map((cell, index) => (
                <button
                  key={`cell-${index}`}
                  onClick={() => handleCellClick(index)}
                  disabled={gameOver || cell !== " " || isThinking}
                  style={{ width: "114px", height: "114px" }}
                  className="flex items-center justify-center text-6xl font-bold rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 disabled:hover:bg-zinc-100 dark:disabled:hover:bg-zinc-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <span className={cell === "X" ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}>
                    {cell === " " ? "" : cell}
                  </span>
                </button>
              ))}
            </div>

            {/* Status */}
            <div className="text-center h-8 flex items-center justify-center">
              {isThinking && !gameOver && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">AI is thinking...</p>
              )}
              {winner && (
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{winner}</p>
              )}
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="space-y-3">
            <button
              onClick={resetGame}
              className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              New Game
            </button>
            <button
              onClick={resetScores}
              className="w-full py-3 px-4 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors shadow-sm cursor-pointer"
            >
              Reset Scores
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
