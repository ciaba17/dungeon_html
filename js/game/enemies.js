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
            this.x += (dx / distance) * speed;
            this.y += (dy / distance) * speed;
        } else { // IL NEMICO RAGGIUNGE IL PLAYER E IL GIOCO VA IN STATO DI COMBATTIMENTO
            globals.gameState = 1; // Il gioco va in stato di combattimento
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


globals.entities.push(new Entity(10, 10, 0, 0.2, "oggettoTest", textures.test, true));
globals.entities.push(new Enemy(6, 5, 0, 1, 'Skeleton', textures.test, 6, true));