import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { GameManager } from "../src/GameManager.js";

class Client extends EventEmitter {
  readyState = 1;
  messages = [];
  send(value) {
    this.messages.push(JSON.parse(value));
  }
  sendToServer(type, payload) {
    this.emit("message", JSON.stringify({ type, payload }));
  }
  last(type) {
    return this.messages.filter((message) => message.type === type).at(-1);
  }
}

test("matches two clients, rejects illegal moves, and syncs legal moves", () => {
  const manager = new GameManager();
  const white = new Client();
  const black = new Client();
  manager.addUser(white);
  manager.addUser(black);
  white.sendToServer("init_game");
  assert.equal(
    white.last("waiting").payload.message,
    "Waiting for an opponent...",
  );
  black.sendToServer("init_game");
  assert.equal(white.last("init_game").payload.color, "white");
  assert.equal(black.last("init_game").payload.color, "black");
  black.sendToServer("move", { move: { from: "e7", to: "e5" } });
  assert.equal(black.last("error").payload.message, "Wait for your turn.");
  white.sendToServer("move", { move: { from: "e2", to: "e5" } });
  assert.equal(white.last("error").payload.message, "That move is not legal.");
  white.sendToServer("move", { move: { from: "e2", to: "e4" } });
  assert.deepEqual(white.last("game_state").payload.history, ["e4"]);
  assert.deepEqual(black.last("game_state").payload.history, ["e4"]);
  assert.equal(black.last("game_state").payload.turn, "black");
});

test("notifies the opponent on disconnect and allows another match", () => {
  const manager = new GameManager();
  const first = new Client();
  const second = new Client();
  const third = new Client();
  for (const client of [first, second, third]) manager.addUser(client);
  first.sendToServer("init_game");
  second.sendToServer("init_game");
  first.emit("close");
  assert.equal(
    second.last("opponent_left").payload.message,
    "Your opponent disconnected.",
  );
  second.sendToServer("init_game");
  third.sendToServer("init_game");
  assert.equal(third.last("init_game").payload.color, "black");
});

test("announces checkmate and releases both players for another game", () => {
  const manager = new GameManager();
  const white = new Client();
  const black = new Client();
  manager.addUser(white);
  manager.addUser(black);
  white.sendToServer("init_game");
  black.sendToServer("init_game");
  for (const [player, from, to] of [
    [white, "f2", "f3"],
    [black, "e7", "e5"],
    [white, "g2", "g4"],
    [black, "d8", "h4"],
  ]) player.sendToServer("move", { move: { from, to } });
  assert.deepEqual(white.last("game_over").payload, {
    reason: "Checkmate",
    winner: "black",
  });
  assert.deepEqual(black.last("game_over").payload, {
    reason: "Checkmate",
    winner: "black",
  });
  white.sendToServer("init_game");
  black.sendToServer("init_game");
  assert.equal(white.messages.filter((message) => message.type === "init_game").length, 2);
});
