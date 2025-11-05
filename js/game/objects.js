// objects.js - Modulo che definisce le classi base per Muri, Entità, Oggetti e NPC, 
// e la logica per la proiezione degli sprite nel mondo 3D


// ====================================================================================
// ===== IMPORTAZIONI DI MODULI ESTERNI =====
// ====================================================================================

import { globals, textures } from '../utils/globals.js';           // Variabili e texture globali
import { player } from './player.js';                              // L'oggetto Player (per il calcolo della distanza e dell'angolo)
import { showDialogues } from './ui.js';                           // Funzione per mostrare i dialoghi all'interazione
import { showElement, hideElement } from '../utils/cssHandler.js'; // Utilità UI
import { sounds } from '../core/audio.js';


// ====================================================================================
// ===== SEZIONE 1: CLASSE WALL (MURI STATICHE) =====
// ====================================================================================

export let walls = []; // Array globale di tutti gli oggetti Muro

/**
 * La classe Wall rappresenta un singolo blocco muro sulla mappa 2D
 */
class Wall {
    /**
     * @param {number} x Coordinata mondo X della tile
     * @param {number} y Coordinata mondo Y della tile
     * @param {number} textureId ID numerico della texture da assegnare
     */
    constructor(x, y, textureId) {
        // Le coordinate sono già scalate per la dimensione della tile (tileSize) dalla funzione mapToWalls
        this.x = x; 
        this.y = y;
        this.texture = textures.errorTexture;
        this.setTexture(textureId);
    }

    /**
     * Assegna la texture corretta in base all'ID fornito
     * @param {number} textureId L'ID della texture
     */
    setTexture(textureId) {
        // Mappa gli ID numerici con gli oggetti Image pre-caricati
        const textureList = [
            textures.blankTexture, // 0
            textures.wallTexture,  // 1
            textures.outside1_1,   // 2
            textures.gate,         // 3
            textures.errorTexture, // 4 (Nota: l'ID 3 era duplicato, ho corretto l'indice 4 per coerenza)
        ];

        this.texture = textureList[textureId] || textures.blankTexture; // Fallback
    }


    /**
     * Disegna la rappresentazione 2D del muro sulla minimappa
     * @param {CanvasRenderingContext2D} ctx Il contesto di disegno della minimappa
     */
    draw2D(ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, globals.tileSize, globals.tileSize);
    }
}

/**
 * Inizializza l'array `walls` creando istanze della classe Wall dalla mappa caricata
 * @param {string} id L'ID della mappa da caricare
 */
export function mapToWalls(id) {
    const map = globals.maps[id]; 
    walls = [];

    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            const [tipo, texture] = map[i][j]; // Destruttura [tipo_base, tipo_extra/textureId]

            if (tipo === 1) { // 1 Rappresenta un muro nel livello base
                // Le coordinate mondo vengono calcolate qui
                walls.push(new Wall(
                    j * globals.tileSize, 
                    i * globals.tileSize, 
                    texture // ID della texture
                ));
            }
        }
    }
}


// ====================================================================================
// ===== SEZIONE 2: CLASSE ENTITY (BASE PER SPRITE DINAMICI) =====
// ====================================================================================

/**
 * La classe Entity è la base per tutti gli oggetti dinamici del mondo (Nemici, Oggetti, NPC)
 * Contiene la logica per la proiezione 3D e il disegno 2D sulla minimappa
 */
export class Entity {
    /**
     * @param {number} x Coordinata X della tile di spawn
     * @param {number} y Coordinata Y della tile di spawn
     * @param {number} z Offset verticale (per centratura in altezza)
     * @param {number} scale Fattore di scala dello sprite
     * @param {string} name Nome dell'entità (usato per caricare la texture)
     * @param {boolean} interactable Indica se l'entità può essere interagita
     */
    constructor(x, y, z = 0, scale, name, interactable) {
        // Centra l'entità all'interno della tile [x, y]
        this.x = x * globals.tileSize - globals.tileSize / 2; 
        this.y = y * globals.tileSize - globals.tileSize / 2;
        this.z = z - 12; // Regolazione Z (verticale)
        this.scale = scale / 10; // Riduce la scala per un fattore visivo
        this.name = name;
        
        // Caricamento della texture (presume il percorso standard)
        this.texture = new Image();
        this.texture.src = "assets/images/" + this.name + ".png"
        
        this.interactable = interactable;
        this.onScreen = true; // Usato per il frustum culling
        this.distance = 0;    // Distanza dal player, aggiornata prima del rendering
    }

    /**
     * Calcola la distanza euclidea dal giocatore. Essenziale per l'ordinamento (Z-buffering)
     * e la proiezione 3D
     */
    updateDistance() {
        const dX = this.x - player.x;
        const dY = this.y - player.y;
        this.distance = Math.sqrt(dX * dX + dY * dY);
    }

    /**
     * Disegna la rappresentazione 3D dello sprite (basato sul raycasting)
     * Implementa la proiezione prospettica e il Z-buffering
     * @param {CanvasRenderingContext2D} ctx Il contesto di disegno 3D (gameCtx)
     */
    draw3D(ctx) {
        // Distanza dal piano di proiezione (costante del renderer)
        const distanceProjectionPlane = (globals.SCREEN_WIDTH / 2) / Math.tan((globals.fov * Math.PI / 180) / 2);

        let dX = this.x - player.x; // Distanza relativa X
        let dY = this.y - player.y; // Distanza relativa Y

        // Vettori di direzione (dir) e piano (plane) del giocatore
        const dirX = Math.cos(player.angle * Math.PI / 180);
        const dirY = Math.sin(player.angle * Math.PI / 180);

        const fovScale = globals.fov / 100;
        const planeX = -Math.sin(player.angle * Math.PI / 180) * fovScale;  
        const planeY = Math.cos(player.angle * Math.PI / 180) * fovScale;

        // --- Proiezione 3D (trasformazione della matrice 2D del player) ---
        // Formula standard per la proiezione di uno sprite in 2.5D (simile al Wolfenstein 3D)
        const invDet = 1 / (planeX * dirY - dirX * planeY);       // Determinante inverso
        const transformX = invDet * (dirY * dX - dirX * dY);
        const transformY = invDet * (-planeY * dX + planeX * dY); // Profondità (depth)

        // Se transformY <= 0, lo sprite è dietro il giocatore, non va disegnato
        if (transformY <= 0) return; 
        
        const depth = Math.max(transformY, 0.1); // Evita divisioni per zero o profondità troppo piccole

        // --- Calcolo dimensione dello sprite proiettato ---
        // L'altezza e la larghezza sono inversamente proporzionali alla profondità (depth)
        let spriteHeight = this.texture.height / depth * distanceProjectionPlane * this.scale;
        let spriteWidth  = this.texture.width  / depth * distanceProjectionPlane * this.scale;

        // --- Calcolo posizione a schermo ---
        // La posizione centrale X dello sprite sullo schermo
        const spriteScreenX = (globals.SCREEN_WIDTH / 2) * (1 + transformX / transformY) - spriteWidth / 2;
        // La posizione Y (verticale), considerando l'offset Z
        const spriteScreenY = globals.SCREEN_HEIGHT / 2 - (this.z * distanceProjectionPlane / transformY) - spriteHeight / 2;

        // Frustum Culling: non disegnare se è completamente fuori schermo
        if (spriteScreenX + spriteWidth < 0 || spriteScreenX > globals.SCREEN_WIDTH) return;


        // --- Z-Buffering (disegno a colonne) ---
        /* Disegna lo sprite colonna per colonna, confrontando la profondità dello sprite (transformY) 
           con la distanza del muro (wallSlices) in quella colonna */
        const textureWidth = this.texture.width;
        for (let x = 0; x < spriteWidth; x++) {

            let screenX = Math.floor(spriteScreenX + x);
            if (screenX < 0 || screenX >= globals.SCREEN_WIDTH) continue;
            
            // Trova la slice di muro corrispondente a questa colonna dello schermo 3D
            const sliceIndex = Math.floor(screenX * globals.wallSlices.length / globals.SCREEN_WIDTH);
            if (!globals.wallSlices[sliceIndex]) continue;
            
            // Z-Buffer Check: se la profondità dello sprite è MINORE della distanza del muro, disegna lo sprite
            if (transformY < globals.wallSlices[sliceIndex].distance) {
                // Calcola l'indice X da cui prelevare 1px di texture
                const textureX = Math.floor((x / spriteWidth) * textureWidth);
                ctx.drawImage(
                    this.texture,
                    textureX, 0, 1, this.texture.height,    // Sorgente: 1px verticale dalla texture
                    screenX, spriteScreenY, 1, spriteHeight // Destinazione: 1px scalato a schermo
                );
            }
        }
    }

    /**
     * Disegna la rappresentazione 2D dell'entità sulla minimappa.
     * @param {CanvasRenderingContext2D} ctx Il contesto di disegno della minimappa.
     */
    draw2D(ctx) {
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
    }
}


// ====================================================================================
// ===== SEZIONE 3: CLASSE GAMEOBJECT (OGGETTI INTERAGIBILI/COLLEZIONABILI) =====
// ====================================================================================

/**
 * La classe GameObject estende Entity e aggiunge la logica di interazione e collezione.
 */
export class GameObject extends Entity {
    /**
     * @param {number} x Coordinata X.
     * @param {number} y Coordinata Y.
     * @param {number} z Offset Z.
     * @param {number} scale Scala.
     * @param {string} name Nome.
     * @param {string} dialogueId ID del dialogo da mostrare all'interazione/collezione.
     * @param {boolean} collectable Indica se l'oggetto scompare quando raccolto.
     */
    constructor(x, y, z, scale, name, dialogueId, collectable = false) {
        // Gli oggetti sono sempre inizialmente interactable.
        super(x, y, z, scale, name, true);
        this.collectable = collectable
        if (this.collectable) this.collected = false; // Flag se è collezionabile
        this.dialogueId = dialogueId;
    }

    /** Logica per "raccogliere" l'oggetto */
    collect() {
        this.collected = true;
        this.onScreen = false; // Sparisce dal rendering

        // Mostra dialogo quando raccolto
        showDialogues(this.dialogueId);

        
        player.inventory.push(this.name);                            // Aggiunge all'inventario del player
        globals.entities = globals.entities.filter(e => e !== this); // Rimuove l'oggetto dal mondo
        
        sounds.collectItem.play();                                     // Suono di raccoltayy
        // Aggiorna l'UI dell'inventario.
        const inventoryUI = document.getElementById("inventory-slots");
        for (let slot of inventoryUI.getElementsByClassName("inventory-slot")) {
            if (!slot.dataset.filled) {
                slot.style.backgroundImage = `url('assets/images/${this.name}.png')`;
                slot.style.backgroundSize = "contain";
                slot.style.backgroundColor = "rgba(255, 255, 255, 0.4)";
                slot.dataset.filled = "true";
                break;
            }
        }
        
    }

    // Placeholder per interazioni complesse
    interact() {
        // Logica futura: es. se non collectable, mostra un dialogo specifico
    }
}


// ====================================================================================
// ===== SEZIONE 4: CLASSE NPC (PERSONAGGI NON GIOCANTI) =====
// ====================================================================================

/**
 * La classe Npc estende Entity e aggiunge elementi specifici per i personaggi
 * che interagiscono con il giocatore (es. testa per il dialogo).
 */
export class Npc extends Entity {
    /**
     * @param {number} x Coordinata X.
     * @param {number} y Coordinata Y.
     * @param {number} z Offset Z.
     * @param {number} scale Scala.
     * @param {string} name Nome.
     * @param {string} dialogueId ID del dialogo da mostrare all'interazione.
     */
    constructor(x, y, z, scale, name, dialogueId){
        // Gli NPC sono sempre interactable.
        super(x, y, z, scale, name, true); 

        this.dialogueId = dialogueId;

        // Texture della testa usata probabilmente nel box dialogo.
        this.headImage = new Image()
        this.headImage.src = "assets/images/" + this.name + "_head.png"
    }

}