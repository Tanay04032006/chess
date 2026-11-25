import { Chess } from "chess.js";
import {
  ERROR,
  GAME_OVER,
  GAME_STATE,
  INIT_GAME,
  OPPONENT_LEFT,
  send,
} from "./messages.js";

export class Game {
  constructor(white, black) {
    this.white = white;
    this.black = black;
    this.board = new Chess();
    this.finished = false;
    send(white, INIT_GAME, { color: "white" });
    send(black, INIT_GAME, { color: "black" });
    this.broadcastState();
  }

  has(socket) {
    return socket === this.white || socket === this.black;
  }

  broadcastState() {
    const state = {
      fen: this.board.fen(),
      turn: this.board.turn() === "w" ? "white" : "black",
      history: this.board.history(),
      check: this.board.isCheck(),
    };
    send(this.white, GAME_STATE, state);
    send(this.black, GAME_STATE, state);
  }

  makeMove(socket, move) {
    if (this.finished || !this.has(socket)) return;
    const color = socket === this.white ? "white" : "black";
    const turn = this.board.turn() === "w" ? "white" : "black";
    if (color !== turn)
      return send(socket, ERROR, { message: "Wait for your turn." });
    if (
      !move ||
      !/^[a-h][1-8]$/.test(move.from) ||
      !/^[a-h][1-8]$/.test(move.to)
    ) {
      return send(socket, ERROR, { message: "Invalid move." });
    }
    try {
      this.board.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion || "q",
      });
    } catch {
      return send(socket, ERROR, { message: "That move is not legal." });
    }
    this.broadcastState();
    if (this.board.isGameOver()) {
      this.finished = true;
      let reason = "Game ended";
      let winner = null;
      if (this.board.isCheckmate()) {
        reason = "Checkmate";
        winner = color;
      } else if (this.board.isStalemate()) reason = "Stalemate";
      else if (this.board.isThreefoldRepetition())
        reason = "Threefold repetition";
      else if (this.board.isInsufficientMaterial())
        reason = "Insufficient material";
      else if (this.board.isDraw()) reason = "Draw";
      send(this.white, GAME_OVER, { reason, winner });
      send(this.black, GAME_OVER, { reason, winner });
    }
  }

  leave(socket) {
    this.finished = true;
    const opponent = socket === this.white ? this.black : this.white;
    send(opponent, OPPONENT_LEFT, { message: "Your opponent disconnected." });
  }
}
