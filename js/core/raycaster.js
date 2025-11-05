// raycaster.js - Modulo Core che implementa l'algoritmo Raycasting (DDA) per la proiezione 3D
// Gestisce la creazione e il lancio di tutti i raggi per determinare la distanza dai muri


// ====================================================================================
// ===== IMPORTAZIONI DI MODULI ESTERNI =====
// ====================================================================================

import { walls } from "../game/objects.js";    // Array di tutti gli oggetti Muro sulla mappa
import { player } from "../game/player.js";    // Oggetto del giocatore (posizione, angolo, FOV)
import { globals } from "../utils/globals.js"; // Variabili globali del gioco (dimensioni tile, costanti)


// ====================================================================================
// ===== VARIABILI DI STATO E CONSTANTI (EXPORT) =====
// ====================================================================================

export let rays = [];          // Array contenente tutte le istanze di Ray (una per colonna verticale)
export let wallDistances = []; // Distanze finali dei muri colpite dai raggi, usate per il rendering 3D

// Distanza massima oltre la quale il raggio non viene calcolato o visualizzato
const MAX_DISTANCE = globals.tileSize * 500; 


// ====================================================================================
// ===== CLASSE RAY - L'UNITÀ FONDAMENTALE DEL RAYCASTING =====
// ====================================================================================

/**
 * La classe Ray rappresenta un singolo raggio di luce lanciato dalla posizione del Giocatore
 * Contiene tutti i dati risultanti dal calcolo del colpo (hit) con un muro
 */
class Ray {
    /**
     * @param {Object} entity L'entità che sta lanciando il raggio (solitamente il Player)
     */
    constructor(entity) {
        this.angle = null;          // Angolo di lancio del raggio (in radianti)
        this.distance = 0;          // Distanza euclidea non corretta percorsa dal raggio
        this.correctedDistance = 0; // Distanza corretta per eliminare l'effetto "fish-eye"
        
        // Punti di incontro con il muro (coordinate mondiali)
        this.hitX = null; 
        this.hitY = null;
        this.entity = entity;
        this.hitWall = null;      // Riferimento all'oggetto Muro effettivamente colpito
        this.hitVertical = false; // Flag per indicare se il raggio ha colpito un muro verticale (X-side) o orizzontale (Y-side)
    }

    /**
     * Esegue l'algoritmo DDA (Digital Differential Analyzer) per determinare 
     * il primo muro intersecato dal raggio
     * @param {Array<Object>} walls La lista degli oggetti muro da controllare
     */
    cast(walls) {
        // --- Pre-filtraggio dei muri ---
        // Ottimizzazione: considera solo i muri che sono entro la MAX_DISTANCE dal lanciatore
        const filteredWalls = walls.filter(wall => {
            const dx = wall.x - this.entity.x;
            const dy = wall.y - this.entity.y;
            return dx * dx + dy * dy <= MAX_DISTANCE * MAX_DISTANCE;
        });

        // --- Setup iniziale DDA ---
        let startX = Math.floor(this.entity.x / globals.tileSize); // Indice X della tile iniziale
        let startY = Math.floor(this.entity.y / globals.tileSize); // Indice Y della tile iniziale
    
        // Componenti di direzione del raggio (vettore unitario)
        const rayDirX = Math.cos(this.angle);
        const rayDirY = Math.sin(this.angle);
    
        // Distanza che il raggio deve percorrere in X o Y per attraversare una cella
        const deltaDistX = Math.abs(1 / rayDirX) * globals.tileSize;
        const deltaDistY = Math.abs(1 / rayDirY) * globals.tileSize;
    
        // Direzione del passo (incremento) sulla griglia (1 o -1)
        const stepX = rayDirX < 0 ? -1 : 1;
        const stepY = rayDirY < 0 ? -1 : 1;
    
        // Distanza dall'inizio del raggio alla prima linea di griglia in X e Y
        let sideDistX = rayDirX < 0
            ? (this.entity.x - startX * globals.tileSize) * Math.abs(1 / rayDirX)
            : ((startX + 1) * globals.tileSize - this.entity.x) * Math.abs(1 / rayDirX);
        let sideDistY = rayDirY < 0
            ? (this.entity.y - startY * globals.tileSize) * Math.abs(1 / rayDirY)
            : ((startY + 1) * globals.tileSize - this.entity.y) * Math.abs(1 / rayDirY);
    
        let hit = false;          // Flag se un muro è stato colpito
        let side = 0;             // 0 = Colpito lato X (muro verticale), 1 = Colpito lato Y (muro orizzontale)
        let hitWall = null;       // Riferimento al muro colpito
        let traveledDistance = 0; // Distanza percorsa per la condizione di uscita MAX_DISTANCE

        // --- Loop principale del DDA ---
        while (!hit && traveledDistance < MAX_DISTANCE) {
            // Sceglie se avanzare di una griglia in X o in Y (il lato più vicino)
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX; // Avanza il SideDistance in X
                startX += stepX;         // Sposta l'indice X della cella
                side = 0;                // Segna che il passo è avvenuto sull'asse X
                traveledDistance = sideDistX;
            } else {
                sideDistY += deltaDistY; // Avanza il SideDistance in Y
                startY += stepY;         // Sposta l'indice Y della cella
                side = 1;                // Segna che il passo è avvenuto sull'asse Y
                traveledDistance = sideDistY;
            }
        
            // Controllo della Collisione: verifica se la nuova cella [startX, startY] contiene un muro
            for (let wall of filteredWalls) {
                const wallMapX = Math.floor(wall.x / globals.tileSize);
                const wallMapY = Math.floor(wall.y / globals.tileSize);
            
                if (startX === wallMapX && startY === wallMapY) {
                    hit = true;
                    hitWall = wall;
                    break;
                }
            }
        }

        // --- Gestione della distanza massima ---
        // Se non viene colpito nulla entro il limite, imposta la distanza al massimo
        if (!hit) {
            this.distance = MAX_DISTANCE;
            this.hitX = this.entity.x + rayDirX * MAX_DISTANCE;
            this.hitY = this.entity.y + rayDirY * MAX_DISTANCE;
        }

    
        // --- Calcolo della distanza finale e delle coordinate di impatto ---
        if (side === 0) {
            // Colpito asse X (muro verticale)
            this.distance = (startX - this.entity.x / globals.tileSize + (1 - stepX) / 2) / rayDirX * globals.tileSize;
            this.hitX = this.entity.x + rayDirX * this.distance;
            this.hitY = this.entity.y + rayDirY * this.distance;
            this.hitVertical = true;
        } else {
            // Colpito asse Y (muro orizzontale)
            this.distance = (startY - this.entity.y / globals.tileSize + (1 - stepY) / 2) / rayDirY * globals.tileSize;
            this.hitX = this.entity.x + rayDirX * this.distance;
            this.hitY = this.entity.y + rayDirY * this.distance;
            this.hitVertical = false;
        }
    
        // --- Correzione della distanza (eliminazione effetto fish-eye) ---
        // Moltiplica la distanza euclidea per il coseno dell'angolo tra la direzione del Player e l'angolo del Raggio
        this.correctedDistance = this.distance * Math.cos(this.angle - (this.entity.angle * Math.PI / 180));
    
        // --- Salvataggio risultati ---
        this.hitWall = hitWall; 
        wallDistances.push(this.correctedDistance); // Aggiunge la distanza corretta all'array globale per il Renderer
    }


    /**
     * Funzione di debug: disegna il raggio sulla minimappa per visualizzare la sua traiettoria
     * @param {CanvasRenderingContext2D} ctx Il contesto di disegno della minimappa
     */
    draw(ctx) {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.entity.x, this.entity.y);
        ctx.lineTo(this.hitX, this.hitY);
        ctx.strokeStyle = 'grey';
        ctx.stroke();
    }
}


// ====================================================================================
// ===== FUNZIONI DI GESTIONE DEI RAGGI (EXPORT) =====
// ====================================================================================

/**
 * Funzione principale chiamata ad ogni frame per ricalcolare tutti i raggi
 * Aggiorna l'angolo di ogni raggio e lancia il calcolo DDA
 */
export function raycast() { 
    wallDistances = []; // Resetta l’array delle distanze prima di ogni ciclo di raycasting
    
    // Itera su ogni raggio (colonna verticale dello schermo 3D)
    for (let i = 0; i < rays.length; i++) {
        const ray = rays[i];

        // Calcola l’angolo del raggio: Angolo Player +/- (Offset Raggio * Passo FOV)
        // Converte l'angolo del player (gradi) in radianti e aggiunge l'offset del FOV
        const rayAngleOffset = i * (globals.fov / globals.rayNumber) - globals.fov / 2;
        ray.angle = (player.angle + rayAngleOffset) * Math.PI / 180; 

        ray.cast(walls); // Esegue il calcolo DDA per trovare il primo muro
    }
}

/**
 * Crea e inizializza l'array di oggetti Ray (uno per ogni 'colonna' di rendering 3D)
 * Viene chiamata una sola volta all'avvio del gioco
 */
export function createRays() { 
    rays = []; // Resetta l’array, utile se si dovesse ricaricare la scena
    
    for (let i = 0; i < globals.rayNumber; i++) {
        const ray = new Ray(player); // Ogni raggio è lanciato dal player
        rays.push(ray);
    }
}