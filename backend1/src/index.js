import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager.js";

const port = Number(process.env.PORT || 8080);
const manager = new GameManager();
const server = createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    return response.end(JSON.stringify({ status: "ok" }));
  }
  response.writeHead(404);
  response.end();
});
const wss = new WebSocketServer({ server, maxPayload: 4096 });
wss.on("connection", (socket) => manager.addUser(socket));
server.listen(port, "0.0.0.0", () =>
  console.log(`Chess server listening on ${port}`),
);
