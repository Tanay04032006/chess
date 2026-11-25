import { Link } from "react-router-dom";

export function Landing() {
  return (
    <main className="landing">
      <header className="game-header">
        <a href="/" className="brand">
          knight<span>.</span>
        </a>
        <span>ONLINE CHESS / BY TANAY GUPTA</span>
        <a
          href="https://github.com/Tanay04032006/chess"
          target="_blank"
          rel="noreferrer"
        >
          SOURCE ↗
        </a>
      </header>
      <div className="landing-content">
        <div>
          <span className="eyebrow">A LITTLE STRATEGY, A LOT OF FUN</span>
          <h1>
            One board.
            <br />
            <em>Two minds.</em>
            <br />
            Your move.
          </h1>
          <p>
            Jump into a live match against another player. No account, no
            clutter—just chess.
          </p>
          <Link className="play-button" to="/game">
            Play online <span>↗</span>
          </Link>
          <div className="landing-note">
            BUILT WITH REACT · CHESS.JS · WEBSOCKETS
          </div>
        </div>
        <div className="landing-art">
          <div className="art-piece">♞</div>
          <span className="art-label">THE GAME IS ON</span>
        </div>
      </div>
    </main>
  );
}
