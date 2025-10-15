import { inputState } from "../core/input.js";

const SPEED = 5;
const ROTATION_SPEED = 3; // gradi per frame


class Player {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle; // in gradi
    }

    update() {
    // Movimento avanti/indietro
    if (inputState.up) {
        this.x += SPEED * Math.cos(this.angle * Math.PI / 180);
        this.y += SPEED * Math.sin(this.angle * Math.PI / 180);
    }
    if (inputState.down) {
        this.x -= SPEED * Math.cos(this.angle * Math.PI / 180);
        this.y -= SPEED * Math.sin(this.angle * Math.PI / 180);
    }

    // Rotazione sinistra/destra
    if (inputState.left) {
        this.angle -= ROTATION_SPEED;
    }
    if (inputState.right) {
        this.angle += ROTATION_SPEED;
    }

    // Mantieni l'angolo tra 0 e 360 gradi
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

export const player = new Player(100, 100, 0); // Posizione iniziale e angolo

