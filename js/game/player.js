import { inputState } from "../core/input.js";
import { walls } from "./objects.js";
import { globals } from "../utils/globals.js";
import { mostraDialoghi } from "./ui.js";

const SPEED = 3 * globals.tileSize;     // unità al secondo
const ROTATION_SPEED = 180;             // gradi al secondo

class Player {
    constructor(x, y, angle) {
        this.x = x * globals.tileSize - globals.tileSize / 2;
        this.y = y * globals.tileSize - globals.tileSize / 2;
        this.angle = angle; // in gradi

        // Movimento attivo
        this.moving = false;
        this.rotating = false;

        this.targetX = this.x;
        this.targetY = this.y;
        this.targetAngle = this.angle;
    }

    update() {
        // Se non sta muovendo né ruotando, leggi input
        if (!this.moving && !this.rotating) {
            if (inputState.up) {
                this.targetX = this.x + globals.tileSize * Math.cos(this.angle * Math.PI / 180);
                this.targetY = this.y + globals.tileSize * Math.sin(this.angle * Math.PI / 180);
                this.moving = true;
                inputState.up = false;
            }
            if (inputState.down) {
                this.targetX = this.x - globals.tileSize * Math.cos(this.angle * Math.PI / 180);
                this.targetY = this.y - globals.tileSize * Math.sin(this.angle * Math.PI / 180);
                this.moving = true;
                inputState.down = false;
            }
            if (inputState.left) {
                this.targetX = this.x + globals.tileSize * Math.cos((this.angle - 90) * Math.PI / 180);
                this.targetY = this.y + globals.tileSize * Math.sin((this.angle - 90) * Math.PI / 180);
                this.moving = true;
                inputState.left = false;
            }
            if (inputState.right) {
                this.targetX = this.x + globals.tileSize * Math.cos((this.angle + 90) * Math.PI / 180);
                this.targetY = this.y + globals.tileSize * Math.sin((this.angle + 90) * Math.PI / 180);
                this.moving = true;
                inputState.right = false;
            }
            if (inputState.turnLeft) {
                this.targetAngle = this.angle - 90;
                this.rotating = true;
                inputState.turnLeft = false;
            }
            if (inputState.turnRight) {
                this.targetAngle = this.angle + 90;
                this.rotating = true;
                inputState.turnRight = false;
            }
        }

        // Movimento verso il target
        if (this.moving) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.hypot(dx, dy);
            const step = SPEED * globals.deltaTime;

            if (dist <= step) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.moving = false;
            } else {
                this.x += (dx / dist) * step;
                this.y += (dy / dist) * step;
            }
        }

        // Rotazione verso il target
        if (this.rotating) {
            let diff = this.targetAngle - this.angle;
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;

            const step = ROTATION_SPEED * globals.deltaTime;
            if (Math.abs(diff) <= step) {
                this.angle = this.targetAngle;
                this.rotating = false;
            } else {
                this.angle += Math.sign(diff) * step;
            }

            if (this.angle < 0) this.angle += 360;
            if (this.angle >= 360) this.angle -= 360;
        }
    }

    interact() {
        // Calcola la posizione davanti al giocatore
        const interactDistance = globals.tileSize;
        const interactX = this.x + interactDistance * Math.cos(this.angle * Math.PI / 180);
        const interactY = this.y + interactDistance * Math.sin(this.angle * Math.PI / 180);
        // Controlla se c'è un oggetto interagibile in quella posizione
        for (let entity of globals.entities) {
            if (interactX === entity.x && interactY === entity.y && entity.interactable) {
                mostraDialoghi("test2");
            }
        }
    }

    draw(context) {
        context.fillStyle = "red";
        context.beginPath();
        context.arc(this.x, this.y, 10, 0, Math.PI * 2);
        context.fill();
    }
}

export const player = new Player(7, 7, 0);
