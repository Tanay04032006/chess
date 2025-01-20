import React, { useState } from 'react';
import { Chess } from 'chess.js';
import { MOVE } from '../screens/Game';

const ChessBoard = ({chess, setBoard, socket, board }) => {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  return (
    <div className="text-white-200">
      {board.map((row, i) => {
        return (
          <div key={i} className="flex">
            {row.map((square, j) => {
              const squarePosition = String.fromCharCode(97 + (j % 8)) + "" + (8 - i); // Corrected here

              return (
                <div
                  onClick={() => {
                    if (!from) {
                      setFrom(squarePosition);
                    } else {
                      socket.send(
                        JSON.stringify({
                          
                          type: MOVE,
                          payload: {
                            move:{
                              from,
                              to: squarePosition,
                            }
                          },
                        })
                      );
                      setFrom(null);
                      chess.move({
                        from,
                        to: squarePosition,
                      })
                      setBoard(chess.board());
                    }
                  }}
                  key={j}
                  className={`w-16 h-16 ${(i + j) % 2 === 0 ? 'bg-green-500' : 'bg-green-300'}`}
                >
                  <div className="w-full justify-center flex h-full">
                    <div className="h-full justify-center flex flex-col">
                      {square ? square.type : '.'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default ChessBoard;
