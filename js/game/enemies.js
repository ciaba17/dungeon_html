import { Entity } from './objects.js';
import { globals, textures } from '../utils/globals.js';

export class Enemy extends Entity {
    constructor(x, y, z, scale, name, texture, hp, interactable = true) {
        super(x, y, z, scale, name, texture, interactable);
        this.hp = hp;
    }

    followPlayer(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 2) {
            const speed = 0.5; // Velocità del mostro
            let newX = this.x + (dx / distance) * speed;
            let newY = this.y + (dy / distance) * speed;

            // Controllo collisione con muri separatamente sugli assi
            if (!isWallAt(newX, this.y)) {
                this.x = newX;
            }
            if (!isWallAt(this.x, newY)) {
                this.y = newY;
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


function isWallAt(x, y) {
    const col = Math.floor(x / globals.tileSize);
    const row = Math.floor(y / globals.tileSize);

    return globals.maps.map1[row][col] === 1;
}

globals.entities.push(new Entity(10, 10, 0, 0.2, "oggettoTest", textures.test, true));
globals.entities.push(new Enemy(6, 6, 0, 1, 'Skeleton', textures.test, 6, true));


