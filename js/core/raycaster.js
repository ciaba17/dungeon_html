import { walls } from "../game/mapObjects.js";
import { player } from "../game/player.js";
import { globals } from "../utils/globals.js";

const STEP = 0.1; // Passo per l'incremento dell'angolo del raggio

class ray {
    constructor() {
        this.position = [player.x, player.y]; // x, y
        this.direction = player.direction;
        this.dir = [Math.cos(this.direction), Math.sin(this.direction)]; // x, y
    }

    cast(walls) {
        while (true) {
            this.position[0] += this.dir[0] * STEP;
            this.position[1] += this.dir[1] * STEP;

            for (let wall of walls) {
                if ((this.position[0] >= wall.x && this.position[0] <= wall.x+globals.tileSize) && 
                    (this.position[1] >= wall.y && this.position[1] <= wall.y+globals.tileSize)) 

                    console.log("Hit wall at", this.position);
            }
        }
    }
}

export function raycast() {
    const r = new ray();
    r.direction = (player.angle + i) * Math.PI / 180;
    r.dir = [Math.cos(r.direction), Math.sin(r.direction)];
    r.cast(walls);
}