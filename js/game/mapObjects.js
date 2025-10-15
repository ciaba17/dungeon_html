import { globals } from '../utils/globals.js';
export const walls = [];


class Wall {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(context) {
        context.fillStyle = 'white';
        context.fillRect(this.x, this.y, globals.tileSize, globals.tileSize);
    }
}

export function mapToWalls(id) {
    const map = globals.maps[id]; // Usa la mappa caricata
    console.log(globals.maps, globals.maps[id]);

    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            if (map[i][j] == 1) { // Supponendo che '1' rappresenti un muro
                walls.push(new Wall(j * globals.tileSize, i * globals.tileSize));
            }
        }
    }
}