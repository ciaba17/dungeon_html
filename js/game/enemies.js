import { Entity } from './objects.js';
import { globals, textures } from '../utils/globals.js';

export class Enemy extends Entity {
    constructor(x, y, z, scale, hp, speed, name, texture, interactable = true) {
        super(x, y, z, scale, name, texture, interactable);
        this.hp = hp;
        this.speed = speed;
    }

    followPlayer(player) {
        const dX = player.x - this.x;
        const dY = player.y - this.y;
        const distance = Math.sqrt(dX * dX + dY * dY);

        if (distance > 2) { // Se sta inseguendo il nemico
            // Sceglie la distanza maggiore
            const selectedAxis = dX >= dY ? "x" : "y";
            const newPos = this[selectedAxis] + globals.tileSize;
            //let newPos = axis + (distanceAxis / distance) * this.speed;

            // Controllo collisione con muri separatamente sugli assi
            if (!isWallAt(this.x, this.y, selectedAxis, newPos)) {
                if (this[selectedAxis] !== newPos) {
                    this[selectedAxis] += this.speed;
                }
            }
        } else { 
            // Il nemico raggiunge il player e il giovo va in stato di combattimento
            globals.gameState = 1;
            globals.enemyOnCombat = this; // Salva il nemico che ha toccato il player per il combattimento
            globals.moveControls.style.display = "none";
            globals.combatControls.style.display = "";
            const combatTextContainer = document.getElementById("map-container");
            combatTextContainer.appendChild(globals.textBoxContent);
        }
    }   


    drawOnCombat(ctx) {
        ctx.drawImage(this.texture, globals.SCREEN_WIDTH / 2 - this.texture.width / 2, globals.SCREEN_HEIGHT / 2 - this.texture.height / 2);
    }
}


function isWallAt(x, y, selectedAxis, newPos) {
    let col;
    let row;

    if (selectedAxis === "x") {
        col = Math.floor(newPos / globals.tileSize);
        row = Math.floor(y / globals.tileSize);
    } else {
        col = Math.floor(x / globals.tileSize);
        row = Math.floor(newPos / globals.tileSize);
    }
    

    return globals.maps.map1[row][col] === 1;
}

globals.entities.push(new Entity(10, 10, 0, 0.2, "oggettoTest", textures.test, true));
globals.entities.push(new Enemy(6, 6, 0, 1, 6, 0.5, 'Skeleton', textures.test, true));


