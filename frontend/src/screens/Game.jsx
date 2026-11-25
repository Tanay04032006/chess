import { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import { Link } from "react-router-dom";
import ChessBoard from "../components/ChessBoard";
import useSocket from "../hooks/useSocket";

const initialFen = new Chess().fen();

export function Game() {
  const { socket, connection } = useSocket();
  const [fen, setFen] = useState(initialFen);
  const [color, setColor] = useState(null);
  const [turn, setTurn] = useState("white");
  const [history, setHistory] = useState([]);
  const [check, setCheck] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [notice, setNotice] = useState(
    "Play someone online. The first player gets white.",
  );
  const chess = useMemo(() => new Chess(fen), [fen]);

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }
      const data = message.payload || {};
      switch (message.type) {
        case "waiting":
          setPhase("waiting");
          setNotice(data.message);
          break;
        case "init_game":
          setColor(data.color);
          setPhase("playing");
          setNotice(`You are ${data.color}. Good luck!`);
          break;
        case "game_state":
          setFen(data.fen);
          setTurn(data.turn);
          setHistory(data.history);
          setCheck(data.check);
          break;
        case "game_over":
          setPhase("finished");
          setNotice(
            data.winner ? `${data.reason} — ${data.winner} wins.` : data.reason,
          );
          break;
        case "opponent_left":
          setPhase("finished");
          setNotice(data.message);
          break;
        case "error":
          setNotice(data.message);
          break;
        default:
          break;
      }
    };
    return () => {
      socket.onmessage = null;
    };
  }, [socket]);

  useEffect(() => {
    if ((connection === "disconnected" || connection === "error") &&
        (phase === "playing" || phase === "waiting")) {
      setPhase("finished");
      setNotice("Connection lost. Join a new match when the server reconnects.");
    }
  }, [connection, phase]);

  function join() {
    setFen(initialFen);
    setHistory([]);
    setColor(null);
    setTurn("white");
    setCheck(false);
    setPhase("waiting");
    setNotice("Looking for an opponent...");
    socket.send(JSON.stringify({ type: "init_game" }));
  }

  const canMove = phase === "playing" && color === turn;
  return (
    <main className="game-page">
      <header className="game-header">
        <Link to="/" className="brand">
          knight<span>.</span>
        </Link>
        <span>ONLINE CHESS / BY TANAY GUPTA</span>
        <a
          href="https://github.com/Tanay04032006/chess"
          target="_blank"
          rel="noreferrer"
        >
          SOURCE ↗
        </a>
      </header>
      <div className="game-layout">
        <div className="board-wrap">
          <div className="board-top">
            <span>LIVE BOARD</span>
            <span>
              {phase === "playing"
                ? `${turn.toUpperCase()} TO MOVE`
                : "READY WHEN YOU ARE"}
            </span>
          </div>
          <ChessBoard
            chess={chess}
            color={color || "white"}
            canMove={canMove}
            onMove={(move) =>
              socket?.send(JSON.stringify({ type: "move", payload: { move } }))
            }
          />
          <div className="board-bottom">
            <span>
              {color
                ? `YOU PLAY ${color.toUpperCase()}`
                : "FIND AN OPPONENT TO START"}
            </span>
            <span>{check && phase === "playing" ? "CHECK!" : "♞"}</span>
          </div>
        </div>
        <aside className="game-panel">
          <span className="eyebrow">THE MATCH</span>
          <h1>
            {phase === "playing"
              ? "Your move."
              : phase === "waiting"
                ? "Finding your rival."
                : phase === "finished"
                  ? "Well played."
                  : "Ready to play?"}
          </h1>
          <p>
            {connection !== "connected"
              ? `Server ${connection}. Set VITE_WS_URL for a hosted backend.`
              : notice}
          </p>
          <div className="status-card">
            <span>STATUS</span>
            <strong>{connection !== "connected" ? connection : phase}</strong>
          </div>
          {(phase === "idle" || phase === "finished") && (
            <button className="play-button" onClick={join} disabled={!socket}>
              Find a match <span>↗</span>
            </button>
          )}
          {phase === "waiting" && (
            <div className="waiting">
              <span className="pulse" /> Waiting for another player to join...
            </div>
          )}
          <div className="moves">
            <div>
              <span>MOVE HISTORY</span>
              <span>{history.length} MOVES</span>
            </div>
            <p>
              {history.length
                ? history.map((move, i) => (
                    <span key={i}>
                      {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ""}
                      {move}{" "}
                    </span>
                  ))
                : "Your moves will appear here."}
            </p>
          </div>
          <p className="game-tip">
            Tip: click one of your pieces, then a highlighted square. Pawns
            promote to queens automatically.
          </p>
        </aside>
      </div>
    </main>
  );
}
