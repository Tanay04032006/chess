import { WebSocket } from "ws";
import {Chess} from "chess.js";
import { GAME_OVER } from "./messages.js";
import { INIT_GAME } from "./messages.js";
import { MOVE } from "./messages.js";
export class Game{
player1;
player2;
board 
#moves
#startTime
#moveCount=0;

    constructor(player1,player2){
        this.player1=player1;
        this.player2=player2;
        this.board=new Chess();
        this.#startTime=new Date();
        this.player1.send(JSON.stringify({
            type:INIT_GAME,
            payload:{
                color:"white"
            }
        }))
        this.player2.send(JSON.stringify({
            type:INIT_GAME,
            payload:{
                color:"black"
            }
        }))
    }

    makeMove(socket,move){
        //validate the type of move using zod
        console.log(move)
        if(this.#moveCount%2===0 && socket!==this.player1){
            //send an error message to the player
            console.log("error message sent 1");
            return;
        }
        if(this.#moveCount%2===1 && socket!==this.player2){
            //send an error message to the player
            console.log("error message sent 2");
            return;
        }
console.log("did not early return");

        try{
            this.board.move(move);
            
        }catch(e){
            //send an error message to the player
            console.log(e);
            return;
        }

        console.log("move successful");


        if(this.board.isGameOver()){
            //send a message to both players
            this.player1.send(JSON.stringify({
                type:GAME_OVER,
                payload:{
                    winner:this.board.turn()==="w"?"black":"white"
                }
            }))
            this.player2.send(JSON.stringify({
                type:GAME_OVER,
                payload:{
                    winner:this.board.turn()==="w"?"black":"white"
                }
            }))
            return
        }

        if(this.#moveCount%2===0){
            this.player2.send(JSON.stringify({
                type:MOVE,
                payload:move
            }))
        }else{
            this.player1.send(JSON.stringify({
                type:MOVE,
                payload:move
            }))
        }


        this.#moveCount++;

        //send the updated board to both players

    }
}