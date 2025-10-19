import { inputState } from "../core/input.js";
import { walls } from "./mapObjects.js";
import { globals } from "../utils/globals.js";

const SPEED = globals.tileSize;
const ROTATION_SPEED = 1; // gradi per frame
const TOTAL_ROTATION = 90;

class Player {
    constructor(x, y, angle) {
        // Allinea alla griglia
        this.x = x * globals.tileSize - globals.tileSize / 2; 
        this.y = y * globals.tileSize - globals.tileSize / 2;

        this.angle = angle; // In gradi
        this.canMove = true;
        this.intervallo;
        this.animationSpeed = 5; // In ms
    }

    update() {
    // Movimento
    const animateMovement = (deltaX, deltaY, steps = 9) => {
        let frame = 0;
        this.canMove = false;
        const intervallo = setInterval(() => {
            this.x += deltaX / steps;
            this.y += deltaY / steps;
            frame++;
            if (frame >= steps) {
                clearInterval(intervallo);
                this.canMove = true;
            }
        }, this.animationSpeed);
    };

    const animateRotation = (deltaAngle, steps = 9) => {
        let frame = 0;
        this.canMove = false;
        const intervallo = setInterval(() => {
            this.angle += deltaAngle / steps;
            frame++;
            if (frame >= steps) {
                clearInterval(intervallo);
                this.canMove = true;
            }
        }, this.animationSpeed);
    };

    // Rotazioni
    if (inputState.turnLeft && this.canMove) {
        animateRotation(-TOTAL_ROTATION, TOTAL_ROTATION / ROTATION_SPEED);
        inputState.turnLeft = false;
    }   

    if (inputState.turnRight && this.canMove) {
        animateRotation(TOTAL_ROTATION, TOTAL_ROTATION / ROTATION_SPEED);
        inputState.turnRight = false;
    }

    // Movimenti lineari
    if (inputState.up && this.canMove) {
        animateMovement(SPEED * Math.cos(this.angle * Math.PI / 180),
                        SPEED * Math.sin(this.angle * Math.PI / 180));
        inputState.up = false;
    }
    if (inputState.down && this.canMove) {
        animateMovement(-SPEED * Math.cos(this.angle * Math.PI / 180),
                        -SPEED * Math.sin(this.angle * Math.PI / 180));
        inputState.down = false;
    }
    if (inputState.left && this.canMove) {
        animateMovement(SPEED * Math.cos((this.angle - 90) * Math.PI / 180),
                        SPEED * Math.sin((this.angle - 90) * Math.PI / 180));
        inputState.left = false;
    }
    if (inputState.right && this.canMove) {
        animateMovement(SPEED * Math.cos((this.angle + 90) * Math.PI / 180),
                        SPEED * Math.sin((this.angle + 90) * Math.PI / 180));
        inputState.right = false;
    }

    // Mantiene l'angolo tra 0 e 360
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

