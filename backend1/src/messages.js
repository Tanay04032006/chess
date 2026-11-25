export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_STATE = "game_state";
export const GAME_OVER = "game_over";
export const WAITING = "waiting";
export const ERROR = "error";
export const OPPONENT_LEFT = "opponent_left";

export function send(socket, type, payload = {}) {
  if (socket.readyState === 1) socket.send(JSON.stringify({ type, payload }));
}
