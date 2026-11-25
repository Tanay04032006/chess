import { useState } from "react";

const pieces = {
  wk: "♔",
  wq: "♕",
  wr: "♖",
  wb: "♗",
  wn: "♘",
  wp: "♙",
  bk: "♚",
  bq: "♛",
  br: "♜",
  bb: "♝",
  bn: "♞",
  bp: "♟",
};

export default function ChessBoard({ chess, color, canMove, onMove }) {
  const [selected, setSelected] = useState(null);
  const files = color === "black" ? "hgfedcba" : "abcdefgh";
  const ranks = color === "black" ? "12345678" : "87654321";
  const legal = selected
    ? chess.moves({ square: selected, verbose: true }).map((m) => m.to)
    : [];

  function choose(square) {
    if (!canMove) return;
    const piece = chess.get(square);
    if (selected && legal.includes(square)) {
      onMove({ from: selected, to: square, promotion: "q" });
      setSelected(null);
    } else if (piece?.color === (color === "white" ? "w" : "b")) {
      setSelected(square);
    } else {
      setSelected(null);
    }
  }

  return (
    <div className="board" role="grid" aria-label="Chess board">
      {Array.from(ranks).flatMap((rank, row) =>
        Array.from(files).map((file, col) => {
          const square = file + rank;
          const piece = chess.get(square);
          return (
            <button
              type="button"
              role="gridcell"
              aria-label={`${square}${piece ? ` ${piece.color === "w" ? "white" : "black"} ${piece.type}` : ""}`}
              key={square}
              onClick={() => choose(square)}
              className={`square ${(row + col) % 2 ? "dark" : "light"} ${selected === square ? "selected" : ""} ${legal.includes(square) ? "legal" : ""}`}
            >
              {piece && (
                <span
                  className={
                    piece.color === "w" ? "white-piece" : "black-piece"
                  }
                >
                  {pieces[piece.color + piece.type]}
                </span>
              )}
              {legal.includes(square) && <i aria-hidden="true" />}
              {col === 0 && <small className="rank-label">{rank}</small>}
              {row === 7 && <small className="file-label">{file}</small>}
            </button>
          );
        }),
      )}
    </div>
  );
}
