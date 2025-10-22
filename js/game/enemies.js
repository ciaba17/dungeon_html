import { Entity } from './objects.js';
import { globals, textures } from '../utils/globals.js';

export class Enemy extends Entity {
    constructor(x, y, z, scale, name, texture, interactable = true) {
        super(x, y, z, scale, name, texture, interactable);
    }

    followPlayer(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const speed = 0.5; // Velocità del mostro
            this.x += (dx / distance) * speed;
            this.y += (dy / distance) * speed;
        }
    }
}


globals.entities.push(new Entity(10, 10, 0, 0.1, "oggettoTest", textures.test, true));
globals.entities.push(new Enemy(5, 5, 0, 1, 'Skeleton', textures.test, true));