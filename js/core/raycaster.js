import { walls } from "../game/mapObjects.js";
import { player } from "../game/player.js";
import { globals } from "../utils/globals.js";

export let rays = [];

const STEP = 1; // Passo di avanzamento del raggio
const MAX_DISTANCE = 800; // Distanza massima di lancio del raggio

let fov = 60;

class Ray {
    constructor() {
        this.position = [player.x, player.y]; 
        this.angle = null; 
        this.direction = null;
        this.distance = 0; // Distanza percorsa dal raggio prima di colpire un oggetto
        this.correctedDistance = 0; // Distanza corretta per la distorsione prospettica (fish-eye)
    }

    cast(walls) {
        // resetta la posizione di partenza ogni volta
        this.position = [player.x, player.y];
        this.distance = 0;

        while (this.distance < MAX_DISTANCE) {
            this.position[0] += this.direction[0] * STEP;
            this.position[1] += this.direction[1] * STEP;
            this.distance += STEP;

            for (let wall of walls) {
                if (
                    this.position[0] >= wall.x &&
                    this.position[0] <= wall.x + globals.tileSize &&
                    this.position[1] >= wall.y &&
                    this.position[1] <= wall.y + globals.tileSize
                ) {
                    this.correctedDistance = this.distance * Math.cos((this.angle - player.angle * Math.PI / 180)); // Correzione fish-eye in radianti
                    return; // Esce dal ciclo: collisione trovata 
                }
            }
        }
    }

    draw(ctx) {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(this.position[0], this.position[1]);
        ctx.strokeStyle = 'grey';
        ctx.stroke();
    }
}

export function raycast() { // Lancia tutti i raggi ad ogni frame
    for (let i = 0; i < rays.length; i++) {
        const ray = rays[i];

        // Calcolo dell’angolo del raggio in base all'angolo del giocatore(gradi) e al FOV
        ray.angle = (player.angle + (i * (fov / globals.rayNumber) - fov / 2)) * Math.PI / 180; // in radianti

        // Ricalcola la direzione del raggio
        ray.direction = [Math.cos(ray.angle), Math.sin(ray.angle)];

        // Lancia il raggio
        ray.cast(walls);
    }
}

export function createRays() { // Crea i raggi iniziali
    rays = []; // resetta l’array se si ricreano i raggi
    for (let i = 0; i < globals.rayNumber; i++) {
        const ray = new Ray();
        ray.angle = (player.angle + (i * (fov / globals.rayNumber) - fov / 2)) * Math.PI / 180;
        ray.direction = [Math.cos(ray.angle), Math.sin(ray.angle)];
        rays.push(ray);
    }
}
