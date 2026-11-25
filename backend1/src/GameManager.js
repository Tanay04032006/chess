import { Game } from "./Game.js";
import { ERROR, INIT_GAME, MOVE, WAITING, send } from "./messages.js";

export class GameManager {
  constructor() {
    this.pending = null;
    this.games = new Map();
  }

  addUser(socket) {
    socket.on("message", (data) => {
      let message;
      try {
        message = JSON.parse(data.toString());
      } catch {
        return send(socket, ERROR, { message: "Invalid message." });
      }
      if (!message || typeof message !== "object")
        return send(socket, ERROR, { message: "Invalid message." });
      if (message.type === INIT_GAME) this.join(socket);
      else if (message.type === MOVE) {
        const game = this.games.get(socket);
        game?.makeMove(socket, message.payload?.move);
        if (game?.finished) {
          this.games.delete(game.white);
          this.games.delete(game.black);
        }
      }
    });
    socket.on("close", () => this.removeUser(socket));
    socket.on("error", () => this.removeUser(socket));
  }

  join(socket) {
    if (this.games.has(socket))
      return send(socket, ERROR, { message: "You are already in a game." });
    if (this.pending === socket)
      return send(socket, WAITING, { message: "Waiting for an opponent..." });
    if (this.pending?.readyState === 1) {
      const game = new Game(this.pending, socket);
      this.games.set(this.pending, game);
      this.games.set(socket, game);
      this.pending = null;
    } else {
      this.pending = socket;
      send(socket, WAITING, { message: "Waiting for an opponent..." });
    }
  }

  removeUser(socket) {
    if (this.pending === socket) this.pending = null;
    const game = this.games.get(socket);
    if (!game) return;
    game.leave(socket);
    this.games.delete(game.white);
    this.games.delete(game.black);
  }
}
