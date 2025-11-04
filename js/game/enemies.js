import { Entity, Npc, GameObject } from './objects.js';
import { globals, textures } from '../utils/globals.js';
import { createTimer } from '../utils/timer.js';
import { enterCombat, exitCombat } from './combat.js';

class Node {
    constructor(x, y, walkable) {
        this.x = x;
        this.y = y;
        this.g = 0;
        this.h = 0;
        this.f = 0;
        this.walkable = walkable;
        this.parent = null;
        this.neighbors = [];
    }

    addNeighbor(node) {
        this.neighbors.push(node);
    }
}

export class Enemy extends Entity {
    constructor(x, y, z, scale, name, hp, baseDamage, speed) {
        super(x, y, z, scale, name, false); // Passa i valori al costruttore originale di entity
        this.moving = false;
        this.timer;
        this.path;

        this.hp = hp;
        this.hpLimit = hp;
        this.updateHPBar();
        this.baseDamage = 20;
        this.speed = speed;
    }

    followPlayer(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // --- ENTRATA IN COMBATTIMENTO ----
        if (distance <= globals.tileSize * 0.6) {
            enterCombat(this);
            return;
        }

        if (distance >= globals.tileSize * 10) {
            return
        }

        // --- PATHFINDING PERIODICO ---
        if (!this.moving) {
            this.timer = createTimer(0.4); // Ricalcola path ogni tot secondi 
            this.moving = true;
        }

        if (this.timer.running) {
            this.timer.update(globals.deltaTime);
        } else {
            const startX = Math.floor(this.x / globals.tileSize);
            const startY = Math.floor(this.y / globals.tileSize);
            const targetX = Math.floor(player.x / globals.tileSize);
            const targetY = Math.floor(player.y / globals.tileSize);
            const startNode = nodeGrid[startY][startX];
            const targetNode = nodeGrid[targetY][targetX];
            this.path = findPath(startNode, targetNode);
            this.timer.reset();
        }

        // --- MOVIMENTO ---
        if (this.path && this.path.length > 0) {
            const nextNode = this.path[0];
            const targetX = nextNode.x * globals.tileSize + globals.tileSize / 2;
            const targetY = nextNode.y * globals.tileSize + globals.tileSize / 2;

            let dirX = targetX - this.x;
            let dirY = targetY - this.y;
            const len = Math.sqrt(dirX*dirX + dirY*dirY);
            if (len > 0) {
                dirX /= len;
                dirY /= len;
            }

            let speed = this.speed * globals.deltaTime;

            // Movimento separato per asse X e Y (scivola lungo il muro)
            let newX = this.x + dirX * speed;
            let newY = this.y + dirY * speed;

            if (!isWallAt(newX, this.y)) this.x = newX;
            if (!isWallAt(this.x, newY)) this.y = newY;

            if (Math.abs(this.x - targetX) < 0.1 && Math.abs(this.y - targetY) < 0.1) {
                this.path.shift();
            }
        }   
    }

    updateHPBar() { // DA RIVEDERE TESTO
        const fill = document.getElementById("enemy-hp-fill");
        const text = document.getElementById("enemy-hp-text");
        const percent = (this.hp / this.hpLimit) * 100;
        fill.style.width = percent + "%";
        text.textContent = `${this.hp} / ${this.hpLimit}`;
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
        this.updateHPBar();

        if (this.hp <= 0) this.die();
    }

    die() {
        exitCombat();
        const index = globals.entities.indexOf(this); // IndexOf restituisce -1 se non lo trova
        if (index !== -1) globals.entities.splice(index, 1); 

    }


    drawOnCombat(ctx) {
        ctx.drawImage(this.texture, globals.SCREEN_WIDTH / 2 - this.texture.width / 2, globals.SCREEN_HEIGHT / 2 - this.texture.height / 2);
    }
}


function isWallAt(x, y) {
    const col = Math.floor(x / globals.tileSize);
    const row = Math.floor(y / globals.tileSize);
    
    // Controlla che la riga e la colonna esistano
    if (!globals.maps.map[row] || !globals.maps.map[row][col]) return false;
    
    const [tipo, texture] = globals.maps.map[row][col]; // destruttura la tupla
    return tipo === 1; // vero se è un muro
}















let nodeGrid = [];

export function createNodeMap() {
    for (let y = 0; y < globals.maps.map.length; y++) {
        nodeGrid[y] = [];
        for (let x = 0; x < globals.maps.map[y].length; x++) {
            const [tipo, texture] = globals.maps.map[y][x];
            nodeGrid[y][x] = new Node(x, y, tipo === 0); // camminabile se tipo = 0

        }
    }

    for (let y = 0; y < globals.maps.map.length; y++) {
        for (let x = 0; x < globals.maps.map[y].length; x++) {
            let node = nodeGrid[y][x];
            if (!node.walkable) continue;

            let dirs = [
                [1, 0], [-1, 0], [0, 1], [0, -1],
                [1, 1], [1, -1], [-1, 1], [-1, -1] 
            ];

            for (let [dx, dy] of dirs) {
                let nx = x + dx
                let ny = y + dy;
                if (nodeGrid[ny] && nodeGrid[ny][nx] && nodeGrid[ny][nx].walkable)
                    node.addNeighbor(nodeGrid[ny][nx]);
            }
        }
    }
}

function findPath(startNode, targetNode) {
    // Inizializza i valori di startNode
    startNode.g = 0;
    startNode.h = Math.sqrt((targetNode.x - startNode.x)**2 + (targetNode.y - startNode.y)**2);
    startNode.f = startNode.g + startNode.h;

    let openList = [startNode];
    let closedList = [];
    let currentNode = openList[0];
    
    while (openList.length > 0) {
        if (currentNode.x === targetNode.x && currentNode.y === targetNode.y) { // Percorso trovato
            break;
        } else { // Percorso non trovato
            openList.splice(openList.indexOf(currentNode), 1); // Toglie il currentNode
            closedList.push(currentNode);

            for (let neighborNode of currentNode.neighbors) {
                if (!neighborNode.walkable || closedList.includes(neighborNode)) // Il nodo è un muro o è gia stato controllato
                    continue
                
                let dx = Math.abs(currentNode.x - neighborNode.x);
                let dy = Math.abs(currentNode.y - neighborNode.y);
                let cost = (dx === 1 && dy === 1) ? Math.SQRT2 : 1;
                let new_g = currentNode.g + cost;

                if (!openList.includes(neighborNode)) {
                    neighborNode.parent = currentNode;
                    neighborNode.g = new_g;
                    neighborNode.h = Math.sqrt((targetNode.x - neighborNode.x)**2 + (targetNode.y - neighborNode.y)**2);
                    neighborNode.f = neighborNode.g + neighborNode.h;
                    openList.push(neighborNode);
                } else { // Se il nodo è gia stato controllato
                    if (new_g < neighborNode.g) {
                        neighborNode.parent = currentNode;
                        neighborNode.g = new_g
                        neighborNode.h = Math.sqrt((targetNode.x - neighborNode.x)**2 + (targetNode.y - neighborNode.y)**2);
                        neighborNode.f = neighborNode.g + neighborNode.h;
                    }
                }
            }
        }

        // Prende il nodo con l'f più basso tra quelli da controllare
        let fMin = Infinity;
        for (let node of openList) {
            if (node.f < fMin) {
                fMin = node.f;
                currentNode = node;
            }
        }
    }

    // Il miglior percorso al nodo target è stato trovato
    let bestPath = [];
    while (currentNode !== startNode) {
        bestPath.push(currentNode);
        currentNode = currentNode.parent;
        }
    bestPath.reverse();
    return bestPath;
}



export function mapToEntities(id) {
    const ENTITY_TYPES = {
        1: { class: Npc, defaults: { x:0, y:0, z:0, scale:0.5, name:"dungeon_keeper", dialogueId:"dungeon_keeper" }},
        2: { class: Enemy, defaults: { x:0, y:0, z:0, scale:1, name:"Skeleton", hp:60, baseDamage:10, speed:10 }},
        3: { class: Enemy, defaults: { x:0, y:0, z:0, scale:0.5, name:"Rat", hp:15, baseDamage:3, speed:30 }},
        4: { class: GameObject, defaults: { x:0, y:0, z:0, scale:0.5, name:"Key1", dialogueId:"", interactable:true }},
        5: { class: GameObject, defaults: { x:0, y:0, z:0, scale:0.5, name:"Key2", dialogueId:"", interactable:true }},
        6: { class: Entity, defaults: { x:0, y:0, z:0, scale:1, name:"Tree", interactable:false }},
        7: { class: Npc, defaults: { x:0, y:0, z:0, scale:0.5, name:"HoodedMan", dialogueId:"hooded_man_dialogue" }},
        8: { class: Enemy, defaults: { x:0, y:0, z:0, scale:1, name:"Zombie", hp:50, baseDamage:8, speed:30 }},
        9: { class: Enemy, defaults: { x:0, y:0, z:0, scale:1, name:"Goblin", hp:30, baseDamage:6, speed:30 }},
        10: { class: GameObject, defaults: { x:0, y:0, z:0, scale:0.5, name:"AncientScroll", dialogueId:"", interactable:true }},
        11: { class: Entity, defaults: { x:0, y:0, z:0, scale:1, name:"StoneStatue", interactable:false }},
        12: { class: Enemy, defaults: { x:0, y:0, z:0, scale:1, name:"DarkKnight", hp:120, baseDamage:20, speed:30 }}
    };

    const map = globals.maps[id];
    globals.entities = globals.entities || [];

    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            const [tipoBase, tipoExtra] = map[i][j];

            if (tipoBase !== 0) continue; // ignora completamente se tipoBase diverso da 0
            if (tipoExtra === 0 || tipoExtra === null || tipoExtra === undefined) continue; // tile vuoto

            const entityConfig = ENTITY_TYPES[tipoExtra];
            if (!entityConfig) continue;

            const EntityClass = entityConfig.class;
            const params = { ...entityConfig.defaults };

            let entity;
            j++;
            i++;
            if (EntityClass === Enemy) {
                entity = new EntityClass(j, i, params.z || 0, params.scale, params.name, params.hp || 50, params.baseDamage || 10);
            } else if (EntityClass === Npc) {
                entity = new EntityClass(j, i, params.z || 0, params.scale, params.name, params.dialogueId || "");
            } else {
                entity = new EntityClass(j, i, params.z || 0, params.scale, params.name);
            }
            j--;
            i--;

            globals.entities.push(entity);
        }
    }
}

