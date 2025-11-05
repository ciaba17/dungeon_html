// player.js - Definisce la classe Player, la logica di movimento, interazione e stato
// Esporta l'istanza 'player' utilizzata globalmente dagli altri moduli

// ====================================================================================
// ===== IMPORTAZIONI E COSTANTI =====
// ====================================================================================

import { inputState } from "../core/input.js";
import { Npc, walls, GameObject, mapToWalls } from "./objects.js";
import { globals } from "../utils/globals.js";
import { showDialogues } from "./ui.js";
import { showElement, hideElement } from "../utils/cssHandler.js";
import { sounds } from "../core/audio.js";

// --- Costanti di Movimento ---
const SPEED = 3 * globals.tileSize; // Velocità di movimento (unità al secondo)
const ROTATION_SPEED = 180;         // Velocità di rotazione (gradi al secondo)


// ====================================================================================
// ===== CLASSE PLAYER =====
// ====================================================================================

class Player {
    /**
     * @param {number} x Coordinata X della tile di spawn
     * @param {number} y Coordinata Y della tile di spawn
     * @param {number} angle Angolo di partenza in gradi
     */
    constructor(x, y, angle) {
        // --- Posizione e angolo ---
        // Centra il player all'interno della tile
        this.x = (x + 1) * globals.tileSize - globals.tileSize / 2;
        this.y = (y + 1) * globals.tileSize - globals.tileSize / 2;
        this.angle = angle; // in gradi

        // --- Dati giocatore (da localStorage) ---
        this.name = localStorage.getItem("playerName");
        this.updateNameUI();                // Aggiorna l'elemento DOM del nome
        this.classType = localStorage.getItem("playerClass");
        this.initClassType(this.classType); // Inizializza stats specifiche per la classe

        // --- Statistiche e inventario ---
        this.baseDamage = 20;
        this.inventory; // (Questa riga è ridondante ma mantenuta per fedeltà all'originale)
        this.inventory = [];

        // --- Stato movimento (per interpolazione) ---
        this.moving = false;
        this.rotating = false;
        this.interactingWithNpc = false;

        // Obiettivi (target) per il movimento interpolato
        this.targetX = this.x;
        this.targetY = this.y;
        this.targetAngle = this.angle;

        // --- Stato Eventi ---
        this.enteredDungeon = false;
    }

    // ====================================================================================
    // ===== LOOP DI AGGIORNAMENTO (UPDATE) =====
    // ====================================================================================

    /**
     * Funzione principale del Player, chiamata ad ogni frame dal gameloop
     * Gestisce la lettura degli input e l'interpolazione di movimento e rotazione
     */
    update() {
        // --- 1. Lettura input (solo se il player è fermo) ---
        // Imposta i 'target' per il movimento/rotazione
        if (!this.moving && !this.rotating) {
            if (inputState.movement.up) {
                this.moveIfFree(0);
                inputState.movement.up = false;
            }
            if (inputState.movement.down) {
                this.moveIfFree(180);
                inputState.movement.down = false;
            }
            if (inputState.movement.left) {
                this.moveIfFree(-90);
                inputState.movement.left = false;
            }
            if (inputState.movement.right) {
                this.moveIfFree(90);
                inputState.movement.right = false;
            }
            if (inputState.movement.turnLeft) {
                this.targetAngle = this.angle - 90;
                this.rotating = true;
                inputState.movement.turnLeft = false;
            }
            if (inputState.movement.turnRight) {
                this.targetAngle = this.angle + 90;
                this.rotating = true;
                inputState.movement.turnRight = false;
            }
        }

        // --- 2. Movimento (interpolazione smooth) ---
        // Esegue lo spostamento effettivo verso il targetX/targetY
        if (this.moving) {
            const dX = this.targetX - this.x;
            const dY = this.targetY - this.y;
            const dist = Math.hypot(dX, dY);
            const step = SPEED * globals.deltaTime; // Movimento basato sul tempo (delta)

            if (dist <= step) {
                // Arrivato a destinazione
                this.x = this.targetX;
                this.y = this.targetY;
                this.moving = false;
            } else {
                // Muove il player verso il target
                this.x += (dX / dist) * step;
                this.y += (dY / dist) * step;
            }
        }

        // --- 3. Rotazione (Interpolazione Smooth) ---
        // Esegue la rotazione effettiva verso il targetAngle
        if (this.rotating) {
            let diff = this.targetAngle - this.angle;
            // Normalizza l'angolo per il percorso più breve 
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;

            const step = ROTATION_SPEED * globals.deltaTime;
            if (Math.abs(diff) <= step) {
                this.angle = this.targetAngle;
                this.rotating = false;
            } else {
                this.angle += Math.sign(diff) * step;
            }

            // Mantiene l'angolo nell'intervallo (0, 360)
            if (this.angle < 0) this.angle += 360;
            if (this.angle >= 360) this.angle -= 360;
        }

        // --- 4. Controllo eventi ---
        this.checkEvents(); 
    }

    // ====================================================================================
    // ===== EVENTI E INTERAZIONE =====
    // ====================================================================================

    /**
     * Controlla eventi scriptati basati sulla posizione (tile) attuale del giocatore.
     */
    checkEvents() {
        const col = Math.floor(this.x / globals.tileSize);
        const row = Math.floor(this.y / globals.tileSize);

        // Esempio: entrata nel dungeon (modifica la mappa dinamicamente)
        if (row > 30 && !this.enteredDungeon) {
            // Chiude il passaggio (modificando il tipo di tile nella griglia logica)
            globals.maps.map[30][22] = [1,11];
            globals.maps.map[30][23] = [1,11];
            globals.maps.map[30][24] = [1,11];
            mapToWalls("map"); // Aggiorna i muri 3D
            
            // Cambia l'atmosfera
            globals.floorColor = "rgb(0,0,0)";
            globals.ceilingColor = "rgb(0,0,0)";
            sounds.bgMusic.play();
            sounds.gate.play();
            sounds.wind.pause();
            sounds.birds.pause();
            this.enteredDungeon = true;
        }

        // Fine demo (raccolta di due chiavi)
        if (this.inventory.includes("key1") && this.inventory.includes("key2")) {
            showDialogues("demo_end");  // Mostra il dialogo di fine demo
        }
    }

    /**
     * Gestisce l'interazione con Entità (NPC o GameObject) nella tile di fronte al player
     */
    interact() {
        // Calcola la posizione (coordinate mondo) di fronte al giocatore
        const interactDistance = globals.tileSize;
        const interactX = this.x + interactDistance * Math.cos(this.angle * Math.PI / 180);
        const interactY = this.y + interactDistance * Math.sin(this.angle * Math.PI / 180);

        // Controlla se c'è un'entità interagibile in quella posizione
        for (let entity of globals.entities) {
            /* NOTA: Questo controllo confronta coordinate esatte (float), 
               che è molto restrittivo. La logica originale è mantenuta */
            if (interactX === entity.x && interactY === entity.y && entity.interactable) { 
                
                // --- Caso 1: interazione con NPC ---
                if (entity instanceof Npc && !this.interactingWithNpc) {
                    this.enterInteract(entity); // Avvia il dialogo

                    // Esempio di evento specifico per NPC (apertura cancello)
                    switch(entity.name) {
                        case "dungeon_keeper":
                            globals.maps.map[30][22] = [0,0];
                            globals.maps.map[30][23] = [0,0];
                            globals.maps.map[30][24] = [0,0];
                            mapToWalls("map");
                            sounds.gate.play();
                            break;
                    }
                }

                // --- Caso 2: interazione con GameObject ---
                if (entity instanceof GameObject) { 
                    if (entity.collectable) {
                        this.enterInteract(entity, true); // Avvia dialogo (è un oggetto)
                        entity.collect();                 // Raccoglie l'oggetto
                    }
                    else entity.interact(); // Interazione generica
                }
            }
        }
    }

    /**
     * Inizializza l'interfaccia utente per l'interazione (mostra dialogo, nasconde stats)
     * @param {Entity} entity L'entità con cui si interagisce
     * @param {boolean} isObject True se l'entità è un oggetto
     */
    enterInteract(entity, isObject = false) {
        this.interactingWithNpc = true; // Blocca il movimento

        const textboxContent = document.getElementById("textbox-content");
        const headContainer = document.getElementById("player-head");

        // Aggiorna la UI per il dialogo
        hideElement(document.getElementById("stats-overview"));
        showElement(textboxContent);

        // Se è un NPC, mostra il suo volto e allinea il testo
        if (!isObject && entity.headImage) {
            textboxContent.style.textAlign = "left";
            headContainer.style.backgroundImage = `url("${entity.headImage.src}")`;
        }

        showDialogues(entity.dialogueId);
    }

    /**
     * Termina l'interazione e ripristina l'interfaccia utente (UI)
     */
    exitInteract() {
        this.interactingWithNpc = false; // Sblocca il movimento
        const textboxContent = document.getElementById("textbox-content");
        const headContainer = document.getElementById("player-head");

        // Ripristina la UI
        hideElement(textboxContent);
        showElement(document.getElementById("stats-overview"));
        // Rimette l'immagine del giocatore nel box
        headContainer.style.backgroundImage = `url("${this.frontImage.src}")`;
    }


    // ====================================================================================
    // ===== MOVIMENTO E COLLISIONI =====
    // ====================================================================================
    
    /**
     * Tenta di muovere il player di una tile se la destinazione non è un muro
     * @param {number} angleOffset Offset dell'angolo rispetto alla direzione in avanti (0, 90, 180, -90)
     */
    moveIfFree(angleOffset) {
        // Calcola la posizione (coordinate mondo) della tile target
        const rad = (this.angle + angleOffset) * Math.PI / 180;
        const newX = this.x + globals.tileSize * Math.cos(rad);
        const newY = this.y + globals.tileSize * Math.sin(rad);
        
        // Controlla collisione sulla tile target e se si è in interazione
        if (!isWallAt(newX, newY) && !this.interactingWithNpc) {
            this.targetX = newX;
            this.targetY = newY;
            this.moving = true; // Abilita l'interpolazione (gestita in update())
        }
    }

    // ====================================================================================
    // ===== METODI DI SUPPORTO (UI e STATS) =====
    // ====================================================================================

    /**
     * Aggiorna gli elementi HTML del nome del giocatore (in-game e stats)
     */
    updateNameUI() {
        const combatName = document.getElementById("player-name");
        const overviewName = document.getElementById("char-name");
    
        if (combatName) combatName.textContent = this.name;
        if (overviewName) overviewName.textContent = this.name;
    }

    /**
     * Inizializza le statistiche (HP, MP), i modificatori e le immagini
     * in base alla classe scelta dal giocatore
     * @param {string} classType L'identificativo della classe (es. "wizard")
     */
    initClassType(classType) {    
        // --- Database Statistiche di Classe ---
        const CLASS_DATA = {
            wizard:   { hp: 70,  mp: 120 },
            paladin:  { hp: 120, mp: 60 },
            guardian: { hp: 150, mp: 30 },
            wanderer: { hp: 90,  mp: 90 }
        };
    
        // Database Modificatori di Classe
        const CLASS_MODIFIERS = {
            wizard: {
                attack: { sword: 0.8, shield: 0.9, magic: 1.5 },
                special: { name: "Magia Potenziata", cost: 10, description: "Danno doppio con attacco magico (x2)." }
            },
            paladin: {
                attack: { sword: 1.1, shield: 1.0, magic: 1.1 },
                special: { name: "Scudo Divino", cost: 10, description: "Assorbe tutto il danno per 1 turno." }
            },
            guardian: {
                attack: { sword: 1.0, shield: 1.0, magic: 0.8 },
                special: { name: "Controcolpo", cost: 10, description: "Riflette parte del danno subito se blocca." }
            },
            wanderer: {
                attack: { sword: 1.1, shield: 1.0, magic: 1.1 },
                special: null 
            }
        };
    
        // --- Assegnazione Statistiche ---
        this.hpLimit = CLASS_DATA[classType].hp;
        this.mpLimit = CLASS_DATA[classType].mp;
        this.hp = CLASS_DATA[classType].hp;
        this.mp = CLASS_DATA[classType].mp;
    
        this.classType = classType;
        this.classModifiers = CLASS_MODIFIERS[classType];
    
        // --- Assegnazione Immagini ---
        this.backImage = new Image();
        this.backImage.src = "assets/images/" + classType + "_back.png";
        this.frontImage = new Image();
        this.frontImage.src = "assets/images/" + classType + "_front.png";
    
        // --- Aggiornamento UI Iniziale ---
        this.updateHPBar();
        this.updateMPBar();
    
        const headContainer = document.getElementById("player-head");
        headContainer.style.backgroundImage = 'url("' + this.frontImage.src + '")';
    }

    // --- Gestione Barre UI ---
    
    // Aggiorna tutte le barre HP (in-game e stats)
    updateHPBar() {
        const fills = document.querySelectorAll(".player-hp-fill");
        const texts = document.querySelectorAll(".player-hp-text");
        const percent = (this.hp / this.hpLimit) * 100;
    
        fills.forEach(f => f.style.width = percent + "%");
        texts.forEach(t => t.textContent = `${this.hp} / ${this.hpLimit}`);
    }
    
    // Aggiorna tutte le barre MP (in-game e stats)
    updateMPBar() {
        const fills = document.querySelectorAll(".player-mp-fill");
        const texts = document.querySelectorAll(".player-mp-text");
        const percent = (this.mp / this.mpLimit) * 100;
    
        fills.forEach(f => f.style.width = percent + "%");
        texts.forEach(t => t.textContent = `${this.mp} / ${this.mpLimit}`);
    }
    

    // --- Gestione Danno e Morte ---

    /**
     * Applica danno al giocatore e aggiorna la UI
     * @param {number} amount La quantità di danno da subire
     */
    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
        this.updateHPBar();

        if (this.hp <= 0) this.die();
    }

    // Gestisce la logica di Game Over 
    die() { 
        // Mostra la schermata di morte
        showElement(document.getElementById("death-screen"));
        document.getElementById("retry-btn").onclick = () => { location.reload(); };

        const deathText = document.getElementById("death-text");

        // Seleziona una frase casuale dai dialoghi
        const messages = globals.dialogues.death_messages;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        deathText.innerText = randomMessage;

        globals.gameState = "gameover"; // Blocca il gioco
    }

    // ====================================================================================
    // ===== RENDERING 2D (MINIMAPPA) =====
    // ====================================================================================
    
    /**
     * Disegna la rappresentazione 2D del giocatore sulla minimappa
     * @param {CanvasRenderingContext2D} context Il contesto di rendering 2D della minimappa
     */
    draw2D(context) {
        // Disegna il punto (cerchio) del player
        context.fillStyle = "red";
        context.beginPath();
        context.arc(this.x, this.y, 10, 0, Math.PI * 2);
        context.fill();
    }
} // --- Fine della classe player ---


// ====================================================================================
// ===== FUNZIONI DI UTILITY (Scope del Modulo) =====
// ====================================================================================

/**
 * Controlla se le coordinate X, Y nel mondo si trovano su un muro
 * @param {number} x Coordinata X nel mondo
 * @param {number} y Coordinata Y nel mondo
 * @returns {boolean} True se la posizione è un muro
 */
function isWallAt(x, y) {
    const col = Math.floor(x / globals.tileSize);
    const row = Math.floor(y / globals.tileSize);
    
    // Controlla che la riga e la colonna esistano
    if (!globals.maps.map[row] || !globals.maps.map[row][col]) return false;
    
    const [type, texture] = globals.maps.map[row][col]; // Destruttura la tupla
    return type === 1 || texture === 99; // Vero se è un muro (tipo 1) o un blocco speciale (texture 99)
}


// ====================================================================================
// ===== ISTANZA GLOBALE DEL PLAYER =====
// ====================================================================================

/**
 * Creazione dell'unica istanza di Player
 * Viene esportata in modo che altri moduli (es. raycaster.js) possano importarla
 */
export const player = new Player(23, 25, 90);