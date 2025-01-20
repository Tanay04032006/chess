import React, { useEffect, useState } from 'react';
import ChessBoard from '../components/ChessBoard';
import Button from '../components/Button';
import useSocket from '../hooks/useSocket';
import { Chess } from 'chess.js';

// Todo: Move together, there is code repetition
export const INIT_GAME = 'init_game';
export const MOVE = 'move';
export const GAME_OVER = 'game_over';

export const Game = () => {
  const socket = useSocket();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const[started,setStarted]=useState(false);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);

      switch (message.type) {
        case INIT_GAME:
          setStarted(true);
          setChess(new Chess());
          setBoard(chess.board());
          console.log('Game Initialized');
          break;
        case MOVE:
          const move = message.payload;
          chess.move(move);
          setBoard(chess.board());
          console.log('Move');
          break;
        case GAME_OVER:
          console.log('Game Over');
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    };
  }, [socket, chess]);

  if (!socket) {
    return <div>Connecting...</div>;
  }

  return (
    <div className="justify-center flex">
      <div className="pt-8 max-w-screen-lg w-full">
        <div className="grid grid-cols-6 gap-4 w-full">
          <div className="col-span-4 w-full flex justify-center">
            <ChessBoard chess={chess} setBoard={setBoard} socket={socket} board={board} />
          </div>
          <div className="col-span-2 bg-slate-800 w-full flex justify-center">
            <div className='pt-8'>
            {!started && <Button
              onClick={() => {
                socket.send(
                  JSON.stringify({
                    type: INIT_GAME,
                  })
                );
              }}
            >
              Play
            </Button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
