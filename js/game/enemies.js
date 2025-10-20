import { Entity } from './objects.js';
import { textures } from '../utils/globals.js';

class Enemy extends Entity {
    constructor(x, y, z, scale, name, texture) {
        super(x, y, z, scale, name, texture);
    }

    followPlayer(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const speed = 0.1; // Velocità del mostro
            this.x += (dx / distance) * speed;
            this.y += (dy / distance) * speed;
        }
    }
}


export const enemies = [
    new Enemy(5, 5, 0, 1, 'Skeleton', textures.test)
];