import { inputState } from "../core/input.js";
import { walls } from "./mapObjects.js";
import { globals } from "../utils/globals.js";

const SPEED = globals.tileSize;
const ROTATION_SPEED = 90; // gradi per frame


class Player {
    constructor(x, y, angle) {
        // Allinea alla griglia
        this.x = x * globals.tileSize - globals.tileSize / 2; 
        this.y = y * globals.tileSize - globals.tileSize / 2;

        this.angle = angle; // in gradi
        this.canMove = true;
    }

    update() {

    // Movimento
    if (inputState.turnLeft) {
    this.angle -= ROTATION_SPEED;
    inputState.turnLeft = false;
    }
    if (inputState.turnRight) {
        this.angle += ROTATION_SPEED;
        inputState.turnRight = false;
    }
    if (inputState.up && this.canMove) {
        this.x += SPEED * Math.cos(this.angle * Math.PI / 180);
        this.y += SPEED * Math.sin(this.angle * Math.PI / 180);
        inputState.up = false;
    }
    if (inputState.down && this.canMove) {
        this.x -= SPEED * Math.cos(this.angle * Math.PI / 180);
        this.y -= SPEED * Math.sin(this.angle * Math.PI / 180);
        inputState.down = false;
    }
    if (inputState.left && this.canMove) {
        this.x += SPEED * Math.cos((this.angle - 90) * Math.PI / 180);
        this.y += SPEED * Math.sin((this.angle - 90) * Math.PI / 180);
        inputState.left = false;
    }
    if (inputState.right && this.canMove) {
        this.x += SPEED * Math.cos((this.angle + 90) * Math.PI / 180);
        this.y += SPEED * Math.sin((this.angle + 90) * Math.PI / 180);
        inputState.right = false;
    }
    

    // Mantiene l'angolo tra 0 e 360 gradi
    if (this.angle < 0) this.angle += 360;
    if (this.angle >= 360) this.angle -= 360;
}

    draw(context) {
        context.fillStyle = 'red';
        context.beginPath();
        context.arc(this.x, this.y, 10, 0, Math.PI * 2);
        context.fill();
    }


}

export const player = new Player(7, 7, 0); // Posizione iniziale e angolo

