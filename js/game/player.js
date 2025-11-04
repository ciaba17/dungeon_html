import { inputState } from "../core/input.js";
import { Npc, walls, GameObject } from "./objects.js";
import { globals } from "../utils/globals.js";
import { showDialogues } from "./ui.js";
import { showElement, hideElement } from "../utils/cssHandler.js";

const SPEED = 3 * globals.tileSize;     // unità al secondo
const ROTATION_SPEED = 180;             // gradi al secondo

class Player {
    constructor(x, y, angle) {
        this.x = x * globals.tileSize - globals.tileSize / 2;
        this.y = y * globals.tileSize - globals.tileSize / 2;
        this.angle = angle; // in gradi

        // Aggiunge al gioco nome e classe player scelti in precedenza
        this.name = localStorage.getItem("playerName");
        this.updateNameUI();
        this.classType = localStorage.getItem("playerClass");
        this.initClassType(this.classType);
        this.baseDamage = 20;
        this.inventory;


        // Movimento attivo
        this.moving = false;
        this.interactingWithNpc = false;
        this.rotating = false;

        this.targetX = this.x;
        this.targetY = this.y;
        this.targetAngle = this.angle;

    }

    update() {
        // Se non sta muovendo ne ruotando, leggi input
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

        // Movimento verso il target
        if (this.moving) {
            const dX = this.targetX - this.x;
            const dY = this.targetY - this.y;
            const dist = Math.hypot(dX, dY);
            const step = SPEED * globals.deltaTime;

            if (dist <= step) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.moving = false;
            } else {
                this.x += (dX / dist) * step;
                this.y += (dY / dist) * step;
            }
        }

        // Rotazione verso il target
        if (this.rotating) {
            let diff = this.targetAngle - this.angle;
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;

            const step = ROTATION_SPEED * globals.deltaTime;
            if (Math.abs(diff) <= step) {
                this.angle = this.targetAngle;
                this.rotating = false;
            } else {
                this.angle += Math.sign(diff) * step;
            }

            if (this.angle < 0) this.angle += 360;
            if (this.angle >= 360) this.angle -= 360;
        }
    }

    interact() {
        // Calcola la posizione davanti al giocatore
        const interactDistance = globals.tileSize;
        const interactX = this.x + interactDistance * Math.cos(this.angle * Math.PI / 180);
        const interactY = this.y + interactDistance * Math.sin(this.angle * Math.PI / 180);
        // Controlla se c'è un oggetto interagibile in quella posizione
        for (let entity of globals.entities) {
            if (interactX === entity.x && interactY === entity.y && entity.interactable) {
                if (entity instanceof Npc && !this.interactingWithNpc) {
                    this.enterInteract(entity);
                }

                if (entity instanceof GameObject) { 
                    // Controlla se collezionare l'oggetto o se interagirci
                    if (entity.collectable) {
                        this.enterInteract(entity, true);
                        entity.collect();
                    }
                    else entity.interact();
                }
            }
        }
    }

    enterInteract(entity, isObject = false) {
        this.interactingWithNpc = true;

        const textboxContent = document.getElementById("textbox-content");
        const headContainer = document.getElementById("player-head");

        // Mostra il textbox e nasconde le stats
        hideElement(document.getElementById("stats-overview"));
        showElement(textboxContent);

        // Se è un NPC, testo allineato a sinistra e mostra immagine volto
        if (!isObject && entity.headImage) {
            textboxContent.style.textAlign = "left";
            headContainer.style.backgroundImage = `url("${entity.headImage.src}")`;
        }

        showDialogues(entity.dialogueId);
    }

    // Uscita dall'interazione (NPC o oggetto)
    exitInteract() {
        this.interactingWithNpc = false;
        const textboxContent = document.getElementById("textbox-content");
        const headContainer = document.getElementById("player-head");

        hideElement(textboxContent);
        showElement(document.getElementById("stats-overview"));
        headContainer.style.backgroundImage = `url("${this.frontImage.src}")`;
    }


    
    moveIfFree(angleOffset) {
        const rad = (this.angle + angleOffset) * Math.PI / 180;
        const newX = this.x + globals.tileSize * Math.cos(rad);
        const newY = this.y + globals.tileSize * Math.sin(rad);
        
        if (!isWallAt(newX, newY) && !this.interactingWithNpc) {
            this.targetX = newX;
            this.targetY = newY;
            this.moving = true;
        }
    }

    updateNameUI() {
        const combatName = document.getElementById("player-name");
        const overviewName = document.getElementById("char-name");
    
        if (combatName) combatName.textContent = this.name;
        if (overviewName) overviewName.textContent = this.name;
    }


    initClassType(classType) {    
        // Valori base HP/MP
        const CLASS_DATA = {
            wizard:   { hp: 70,  mp: 120 },
            paladin:  { hp: 120, mp: 60 },
            guardian: { hp: 150, mp: 30 },
            wanderer: { hp: 90,  mp: 90 }
        };
    
        // Modificatori di attacco e difesa per ogni classe
        const CLASS_MODIFIERS = {
            wizard: {
                attack: {
                    sword: 0.8,  // -20% danno
                    shield: 0.9, // -10% difesa
                    magic: 1.5   // +50% danno
                },
                special: {
                    name: "Magia Potenziata",
                    cost: 10,
                    description: "Danno doppio con attacco magico (x2)."
                }
            },
        
            paladin: {
                attack: {
                    sword: 1.1,  // +10% danno
                    shield: 1.0,
                    magic: 1.1   // +10% danno
                },
                special: {
                    name: "Scudo Divino",
                    cost: 10,
                    description: "Assorbe tutto il danno per 1 turno."
                }
            },
        
            guardian: {
                attack: {
                    sword: 1.0,
                    shield: 1.0,
                    magic: 0.8   // -20% danno
                },
                special: {
                    name: "Controcolpo",
                    cost: 10,
                    description: "Riflette parte del danno subito se blocca."
                }
            },
        
            wanderer: {
                attack: {
                    sword: 1.1,  // +10% danno
                    shield: 1.0,
                    magic: 1.1
                },
                special: null // Nessuna abilità speciale
            }
        };
    
        // Imposta HP/MP
        this.hpLimit = CLASS_DATA[classType].hp;
        this.mpLimit = CLASS_DATA[classType].mp;
        this.hp = CLASS_DATA[classType].hp;
        this.mp = CLASS_DATA[classType].mp;
    
        // Imposta modificatori di classe
        this.classType = classType;
        this.classModifiers = CLASS_MODIFIERS[classType];
    
        // Imposta immagini
        this.backImage = new Image();
        this.backImage.src = "assets/images/" + classType + "_back.png";
        this.frontImage = new Image();
        this.frontImage.src = "assets/images/" + classType + "_front.png";
    
        // Aggiorna barre HP/MP
        this.updateHPBar();
        this.updateMPBar();
    
        // Imposta immagine del volto nel DOM
        const headContainer = document.getElementById("player-head");
        headContainer.style.backgroundImage = 'url("' + this.frontImage.src + '")';
    }


    
    // Aggiorna tutte le barre HP
    updateHPBar() {
        const fills = document.querySelectorAll(".player-hp-fill");
        const texts = document.querySelectorAll(".player-hp-text");
        const percent = (this.hp / this.hpLimit) * 100;
    
        fills.forEach(f => f.style.width = percent + "%");
        texts.forEach(t => t.textContent = `${this.hp} / ${this.hpLimit}`);
    }
    
    // Aggiorna tutte le barre MP
    updateMPBar() {
        const fills = document.querySelectorAll(".player-mp-fill");
        const texts = document.querySelectorAll(".player-mp-text");
        const percent = (this.mp / this.mpLimit) * 100;
    
        fills.forEach(f => f.style.width = percent + "%");
        texts.forEach(t => t.textContent = `${this.mp} / ${this.mpLimit}`);
    }
    

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
        this.updateHPBar();

        if (this.hp <= 0) this.die();
    }

    die() { // Game over
        showElement(document.getElementById("death-screen"));
        document.getElementById("retry-btn").onclick = () => { location.reload(); };

        const deathText = document.getElementById("death-text");

        // seleziona una frase casuale tra quelle nei dialoghi
        const messages = globals.dialogues.death_messages;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        deathText.innerText = randomMessage;

        globals.gameState = "gameover";
    }

    draw2D(context) {
        context.fillStyle = "red";
        context.beginPath();
        context.arc(this.x, this.y, 10, 0, Math.PI * 2);
        context.fill();
    }
}


function isWallAt(x, y) {
    const col = Math.floor(x / globals.tileSize);
    const row = Math.floor(y / globals.tileSize);
    
    // Controlla che la riga e la colonna esistano
    if (!globals.maps.map1[row] || !globals.maps.map1[row][col]) return false;
    
    const [tipo, texture] = globals.maps.map1[row][col]; // destruttura la tupla
    return tipo === 1; // vero se è un muro
}




export const player = new Player(8, 7, 0);