// enemies.js - Modulo Core che gestisce la logica delle Entità Nemiche (IA, HP, Danno) 
// e implementa il sistema di Pathfinding A* (A-Star) e l'inizializzazione delle entità dalla mappa.


// ====================================================================================
// ===== IMPORTAZIONI DI MODULI ESTERNI =====
// ====================================================================================

// Classi base degli oggetti, presumibilmente da './objects.js'.
import { Entity, Npc, GameObject } from './objects.js'; 
import { globals, textures } from '../utils/globals.js'; // Variabili e texture globali.
import { createTimer } from '../utils/timer.js';         // Utilità per la temporizzazione del ricalcolo del path.
import { enterCombat, exitCombat } from './combat.js';   // Funzioni per la transizione tra stati di gioco.


// ====================================================================================
// ===== SEZIONE 1: CLASSI CORE PER IL PATHFINDING (A-STAR) =====
// ====================================================================================

/**
 * La classe Node rappresenta una singola cella (tile) sulla griglia della mappa,
 * essenziale per l'algoritmo A*.
 */
class Node {
    /**
     * @param {number} x Coordinata X della cella sulla griglia.
     * @param {number} y Coordinata Y della cella sulla griglia.
     * @param {boolean} walkable Indica se la cella è attraversabile.
     */
    constructor(x, y, walkable) {
        this.x = x;
        this.y = y;
        this.g = 0;          // Costo dal nodo di partenza (g(n)).
        this.h = 0;          // Euristica: costo stimato al nodo target (h(n)).
        this.f = 0;          // Costo totale: f(n) = g(n) + h(n).
        this.walkable = walkable;
        this.parent = null;  // Il nodo precedente nel percorso ottimale.
        this.neighbors = []; // Nodi adiacenti (vicini).
    }

    /**
     * Aggiunge un nodo adiacente alla lista dei vicini (per il Pathfinding).
     * @param {Node} node Il nodo vicino.
     */
    addNeighbor(node) {
        this.neighbors.push(node);
    }
}


// ====================================================================================
// ===== SEZIONE 2: CLASSE ENEMY (NEMICO) =====
// ====================================================================================

/**
 * La classe Enemy estende la classe base Entity e aggiunge logiche specifiche
 * come il Pathfinding, HP e gestione del combattimento.
 */
export class Enemy extends Entity {
    /**
     * @param {number} x Coordinata mondo X iniziale.
     * @param {number} y Coordinata mondo Y iniziale.
     * @param {number} z Livello (altezza) del nemico.
     * @param {number} scale Scala dello sprite.
     * @param {string} name Nome del nemico.
     * @param {number} hp Punti vita attuali.
     * @param {number} baseDamage Danno base inflitto.
     * @param {number} speed Velocità di movimento.
     */
    constructor(x, y, z, scale, name, hp, baseDamage, speed) {
        // Chiama il costruttore della classe Entity
        super(x, y, z, scale, name, false); 
        this.moving = false; 
        this.timer;          
        this.path;           

        // Statistiche di Combattimento
        this.hp = hp;
        this.hpLimit = hp;       
        this.updateHPBar();      
        this.baseDamage = baseDamage;
        this.speed = speed;
    }

    /**
     * Logica IA principale: calcola il percorso per seguire il giocatore e verifica la distanza di ingaggio.
     * @param {Object} player L'oggetto Player da inseguire.
     */
    followPlayer(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // --- ENTRATA IN COMBATTIMENTO ----
        if (distance <= globals.tileSize * 0.6) {
            enterCombat(this); 
            return;
        }

        // --- FUORI PORTATA ---
        if (distance >= globals.tileSize * 10) {
            return
        }

        // --- PATHFINDING PERIODICO ---
        if (!this.moving) {
            this.timer = createTimer(0.4); // Ricalcola path ogni 0.4 secondi.
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

        // --- MOVIMENTO LUNGO IL PATH ---
        if (this.path && this.path.length > 0) {
            const nextNode = this.path[0];
            const targetX = nextNode.x * globals.tileSize + globals.tileSize / 2;
            const targetY = nextNode.y * globals.tileSize + globals.tileSize / 2;

            // Vettore di direzione normalizzato
            let dirX = targetX - this.x;
            let dirY = targetY - this.y;
            const len = Math.sqrt(dirX*dirX + dirY*dirY);
            if (len > 0) {
                dirX /= len;
                dirY /= len;
            }

            let speed = this.speed * globals.deltaTime;

            // Movimento basato sulla collisione (separato per asse)
            let newX = this.x + dirX * speed;
            let newY = this.y + dirY * speed;

            if (!isWallAt(newX, this.y)) this.x = newX;
            if (!isWallAt(this.x, newY)) this.y = newY;

            // Passa al nodo successivo se è stato raggiunto
            if (Math.abs(this.x - targetX) < 0.1 && Math.abs(this.y - targetY) < 0.1) {
                this.path.shift(); 
            }
            this.updateHPBar(); 
        }   
    }

    /** Aggiorna visualmente la barra HP. */
    updateHPBar() {
        const fill = document.getElementById("enemy-hp-fill");
        const text = document.getElementById("enemy-hp-text");
        const percent = (this.hp / this.hpLimit) * 100;
        fill.style.width = percent + "%";
        text.textContent = `${this.hp} / ${this.hpLimit}`;
    }

    /** Subisce danno e verifica la morte. */
    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
        this.updateHPBar();

        if (this.hp <= 0) this.die();
    }

    /** Logica eseguita alla morte del nemico. */
    die() {
        exitCombat(); 
        const index = globals.entities.indexOf(this); 
        if (index !== -1) globals.entities.splice(index, 1); // Rimuove dall'array globale.
    }

    /** Disegna lo sprite del nemico in modalità combattimento. */
    drawOnCombat(ctx) {
        ctx.drawImage(this.texture, 
            globals.SCREEN_WIDTH / 2 - this.texture.width / 2, 
            globals.SCREEN_HEIGHT / 2 - this.texture.height / 2
        );
    }
}


// ====================================================================================
// ===== SEZIONE 3: UTILITY PER LA MAPPA E LA COLLISIONE =====
// ====================================================================================

/**
 * Controlla se la coordinata mondo specificata si trova all'interno di un muro.
 * @param {number} x Coordinata mondo X.
 * @param {number} y Coordinata mondo Y.
 * @returns {boolean} True se c'è un muro nella posizione.
 */
function isWallAt(x, y) {
    const col = Math.floor(x / globals.tileSize);
    const row = Math.floor(y / globals.tileSize);
    
    if (!globals.maps.map[row] || !globals.maps.map[row][col]) return false;
    
    const [tipo, texture] = globals.maps.map[row][col]; 
    return tipo === 1; // Un muro è tipo '1'.
}


// ====================================================================================
// ===== SEZIONE 4: GRIGLIA, PATHFINDING A* E INIZIALIZZAZIONE =====
// ====================================================================================

let nodeGrid = []; // La griglia globale di nodi per il Pathfinding.

/**
 * Crea la griglia di nodi (Node Map) basata sulla mappa di gioco e definisce i vicini.
 */
export function createNodeMap() {
    // --- 1. Creazione dei Nodi ---
    for (let y = 0; y < globals.maps.map.length; y++) {
        nodeGrid[y] = [];
        for (let x = 0; x < globals.maps.map[y].length; x++) {
            const [tipo, texture] = globals.maps.map[y][x];
            nodeGrid[y][x] = new Node(x, y, tipo === 0); // camminabile se tipo = 0
        }
    }

    // --- 2. Connessione dei Vicini (8 direzioni) ---
    for (let y = 0; y < globals.maps.map.length; y++) {
        for (let x = 0; x < globals.maps.map[y].length; x++) {
            let node = nodeGrid[y][x];
            if (!node.walkable) continue;

            // Le 8 direzioni (ortogonali e diagonali).
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

/**
 * Implementa l'algoritmo di Pathfinding A* (A-Star).
 * @param {Node} startNode Il nodo di partenza.
 * @param {Node} targetNode Il nodo di destinazione.
 * @returns {Array<Node>} Il percorso ottimale (escluso il nodo di partenza).
 */
function findPath(startNode, targetNode) {
    // Inizializza i valori di startNode per l'A*
    startNode.g = 0;
    // Euristica (h): distanza euclidea (straight-line distance).
    startNode.h = Math.sqrt((targetNode.x - startNode.x)**2 + (targetNode.y - startNode.y)**2);
    startNode.f = startNode.g + startNode.h;

    let openList = [startNode];  // Nodi da valutare.
    let closedList = [];         // Nodi già valutati.
    let currentNode = startNode; // Inizia con il nodo di partenza.
    
    // Ciclo principale A*
    while (openList.length > 0) {
        
        // --- Trova il nodo con il costo 'f' più basso in openList ---
        let fMin = Infinity;
        let indexMin = -1;
        for (let i = 0; i < openList.length; i++) {
            if (openList[i].f < fMin) {
                fMin = openList[i].f;
                currentNode = openList[i];
                indexMin = i;
            }
        }
        
        // Caso: Percorso Trovato (currentNode è il target)
        if (currentNode.x === targetNode.x && currentNode.y === targetNode.y) { 
            break; // Esci dal ciclo.
        } 

        // Rimuovi il nodo corrente da openList e aggiungilo a closedList
        openList.splice(indexMin, 1); 
        closedList.push(currentNode);

        // --- Valuta i Vicini ---
        for (let neighborNode of currentNode.neighbors) {
            
            // Salta i vicini non camminabili o già controllati
            if (!neighborNode.walkable || closedList.includes(neighborNode)) 
                continue
            
            // Calcolo del costo: 1 per ortogonale, Math.SQRT2 per diagonale.
            let dx = Math.abs(currentNode.x - neighborNode.x);
            let dy = Math.abs(currentNode.y - neighborNode.y);
            let cost = (dx === 1 && dy === 1) ? Math.SQRT2 : 1;
            let new_g = currentNode.g + cost;

            if (!openList.includes(neighborNode)) {
                // Se il vicino è nuovo (non in openList)
                neighborNode.parent = currentNode;
                neighborNode.g = new_g;
                // Ricalcola l'euristica h
                neighborNode.h = Math.sqrt((targetNode.x - neighborNode.x)**2 + (targetNode.y - neighborNode.y)**2);
                neighborNode.f = neighborNode.g + neighborNode.h;
                openList.push(neighborNode);
            } else { 
                // Se il vicino è già in openList: controlla se il nuovo percorso è migliore
                if (new_g < neighborNode.g) {
                    neighborNode.parent = currentNode;
                    neighborNode.g = new_g
                    // Ricalcola il costo f (g è cambiato, h è lo stesso)
                    neighborNode.f = neighborNode.g + neighborNode.h;
                }
            }
        }
    }

    // --- Ricostruzione del Percorso ---
    let bestPath = [];
    while (currentNode !== startNode && currentNode.parent !== null) {
        bestPath.push(currentNode);
        currentNode = currentNode.parent;
    }
    bestPath.reverse(); // Il percorso va dal target al punto di partenza, quindi va invertito.
    
    // Pulisce i nodi per il prossimo calcolo (essenziale per resetare g, h, f e parent)
    for (let node of closedList) {
        node.g = 0; node.h = 0; node.f = 0; node.parent = null;
    }
    for (let node of openList) {
        node.g = 0; node.h = 0; node.f = 0; node.parent = null;
    }

    return bestPath;
}


/**
 * Mappa le entità dalla griglia di livello (map) agli oggetti Entity, Npc o Enemy.
 * @param {string} id L'ID della mappa da caricare (es. 'map1', 'dungeon').
 */
export function mapToEntities(id) {
    // Definizione di tutti i tipi di entità che possono essere piazzate sulla mappa.
    const ENTITY_TYPES = {
        1: { class: Npc, defaults: { x:0, y:0, z:0, scale:0.5, name:"dungeon_keeper", dialogueId:"dungeon_keeper" }},
        2: { class: Enemy, defaults: { x:0, y:0, z:0, scale:1, name:"skeleton", hp:60, baseDamage:10, speed:35 }},
        3: { class: Enemy, defaults: { x:0, y:0, z:0, scale:0.5, name:"rat", hp:15, baseDamage:5, speed:100 }},
        4: { class: GameObject, defaults: { x:0, y:-15, z:0, scale:0.2, name:"key1", dialogueId:"object_collected", collectable:true }},
        5: { class: GameObject, defaults: { x:0, y:-15, z:0, scale:0.2, name:"key2", dialogueId:"object_coolected", collectable:true }},
        6: { class: Entity, defaults: { x:0, y:0, z:0, scale:1, name:"tree", interactable:false }},
        7: { class: Npc, defaults: { x:0, y:0, z:0, scale:0.5, name:"hooded_man", dialogueId:"hooded_man" }},
        // Ipotetici entità future
        8: { class: Enemy, defaults: { x:0, y:0, z:0, scale:1, name:"Zombie", hp:50, baseDamage:8, speed:30 }},
        9: { class: Enemy, defaults: { x:0, y:0, z:0, scale:1, name:"Goblin", hp:30, baseDamage:6, speed:30 }},
        10: { class: GameObject, defaults: { x:0, y:0, z:0, scale:0.5, name:"AncientScroll", dialogueId:"", interactable:true }},
        11: { class: Entity, defaults: { x:0, y:0, z:0, scale:1, name:"StoneStatue", interactable:false }},
        12: { class: Enemy, defaults: { x:0, y:0, z:0, scale:1, name:"DarkKnight", hp:120, baseDamage:20, speed:30 }}
    };

    const map = globals.maps[id];
    globals.entities = globals.entities || []; // Inizializza l'array se non esiste.

    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            const [tipoBase, tipoExtra] = map[i][j];

            if (tipoBase !== 0) continue; // Si cercano entità solo nelle tile di tipo 0 (camminabili).
            if (tipoExtra === 0 || tipoExtra === null || tipoExtra === undefined) continue; // Tile vuoto.

            const entityConfig = ENTITY_TYPES[tipoExtra];
            if (!entityConfig) continue;

            const EntityClass = entityConfig.class;
            // Copia i parametri di default per evitare modifiche all'oggetto originale.
            const params = { ...entityConfig.defaults }; 

            let entity;
            
            // Le coordinate i e j rappresentano la tile. Aggiungendo 0.5 (o 1) si centra l'entità.
            // Usa i++ e j++ per allineare le coordinate effettive dell'entità a quelle della griglia.
            j++; 
            i++; 
            
            // Creazione dinamica dell'entità in base alla sua classe
            if (EntityClass === Enemy) {
                entity = new EntityClass(
                    j, i, 
                    params.z || 0, params.scale, params.name, 
                    params.hp || 50, params.baseDamage || 10, params.speed || 25
                );
            } else if (EntityClass === Npc) {
                entity = new EntityClass(
                    j, i, 
                    params.z || 0, params.scale, params.name, params.dialogueId || ""
                );
            } else { // GameObject o Entity generica
                entity = new EntityClass(
                    j, i, 
                    params.z || 0, params.scale, params.name, 
                    params.dialogueId, params.collectable // Se collectable non è definito, viene passato undefined.
                );
            }
            j--;
            i--;

            globals.entities.push(entity);
        }
    }
}