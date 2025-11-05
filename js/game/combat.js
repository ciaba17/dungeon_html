// combat.js - Modulo dedicato alla gestione completa del sistema di combattimento a turni (simil "Sasso-Carta-Forbice").
// Contiene la logica per l'inizio, la gestione dei turni, il calcolo del danno e l'uscita dal combattimento.


// ====================================================================================
// ===== IMPORTAZIONI DI MODULI ESTERNI =====
// ====================================================================================

import { globals } from "../utils/globals.js";                // Variabili di stato globale del gioco.
import { createTimer } from "../utils/timer.js";              // Utilità per la creazione di un timer per i turni.
import { inputState } from "../core/input.js";                // Stato degli input utente per le mosse di combattimento.
import { showDialogues } from "./ui.js";                      // Funzione per mostrare messaggi (dialoghi) a schermo.
import { sounds } from "../core/audio.js";                    // Risorse audio per suoni e risultati di combattimento.
import { player } from "./player.js";                         // L'oggetto Player.
import { hideElement } from '../utils/cssHandler.js';         // Utilità per nascondere elementi UI.
import { showElement } from '../utils/cssHandler.js';         // Utilità per mostrare elementi UI.
import { scaleCanvas, fitGameMap } from "../core/scaling.js"; // Funzioni per il ri-scaling dopo modifiche UI.
import { contexts } from "../core/renderer.js";               // Contesti del Canvas per il ri-scaling.


// ====================================================================================
// ===== STATO DEL COMBATTIMENTO E REGOLE =====
// ====================================================================================

/**
 * Stato interno che traccia lo svolgimento del combattimento turno per turno.
 */
const combatState = {
    player: null, // Mossa scelta dal giocatore (es. "sword", "magic").
    enemy: null,  // Mossa scelta dal nemico (es. "sword", "magic").
    timer: null,  // Timer per l'attesa tra la mossa del giocatore e quella del nemico.
};

/**
 * Regole del gioco "Sasso-Carta-Forbice" del combattimento.
 * Definisce quale mossa vince contro un'altra.
 */
const winsAgainst = {
    sword: "magic",  // La Spada vince contro la Magia.
    shield: "sword", // Lo Scudo vince contro la Spada.
    magic: "shield", // La Magia vince contro lo Scudo.
};


// ====================================================================================
// ===== FUNZIONE PRINCIPALE: COMBAT LOOP (EXPORT) =====
// ====================================================================================

/**
 * Funzione di aggiornamento del combattimento. Viene chiamata ad ogni frame dal Game Loop
 * finché `globals.gameState` è "combat".
 */
export function combat() {
    
    // ------------------------------------
    // 1. SCELTA DEL GIOCATORE (ASPETTA INPUT)
    // ------------------------------------
    if (!combatState.player) {
        // Itera sugli input di combattimento per vedere se un tasto/bottone è stato premuto.
        for (const action in inputState.combat) {
            if (inputState.combat[action]) {
                combatState.player = action;                // Memorizza la mossa scelta.

                showDialogues(`${action}_player`);          // Mostra il messaggio della mossa.
                sounds.combatSounds.player[action]?.play(); // Riproduci il suono corrispondente.

                inputState.combat[action] = false;          // Resetta l'input per evitare multi-click.
                combatState.timer = createTimer(3);         // Avvia il timer di attesa.
                break;
            }
        }
        return; // Ritorna, in attesa del prossimo frame o dell'input.
    }

    // ------------------------------------
    // ATTESA TRA LE AZIONI
    // ------------------------------------
    if (combatState.timer.running) {
        combatState.timer.update(globals.deltaTime);
        return;
    }

    // ------------------------------------
    // 2. SCELTA DEL NEMICO (RANDOM)
    // ------------------------------------
    if (!combatState.enemy && !combatState.timer.running) {
        const moves = ["sword", "shield", "magic"];
        // Scelta casuale della mossa del nemico.
        combatState.enemy = moves[Math.floor(Math.random() * moves.length)];

        showDialogues(`${combatState.enemy}_enemy`);          // Mostra il messaggio della mossa nemica.
        sounds.combatSounds.enemy[combatState.enemy]?.play(); // Riproduci il suono del nemico.

        combatState.timer.reset();                            // Resetta il timer per l'attesa del risultato.
        return;
    }

    // ------------------------------------
    // 3. DETERMINAZIONE DEL VINCITORE E APPLICAZIONE DANNO
    // ------------------------------------
    let resultKey;
    if (combatState.player === combatState.enemy) {
        // PARITÀ
        resultKey = "draw";
    } else {
        // VITTORIA/SCONFITTA
        const playerWins = winsAgainst[combatState.player] === combatState.enemy;
        resultKey = playerWins ? "victory_player" : "victory_enemy";
    
        let damage;
        if (playerWins) {
            // Player vince e attacca
            damage = calculateDamage(true);
            globals.enemyOnCombat.takeDamage(damage)
        } else {
            // Nemico vince e attacca
            damage = calculateDamage(false);
            player.takeDamage(damage);
        }
        console.log(damage)
    }
    
    // --- Messaggio di Risultato e Audio ---
    showDialogues(resultKey);
    sounds.combatSounds.result[resultKey]?.play(); 
    
    // --- Reset e Preparazione per il Prossimo Turno ---
    combatState.player = null;
    combatState.enemy = null;
    globals.combatInputLocked = false; // Sblocca l'input per il prossimo turno.
    
    // Pulisci l'inputState per sicurezza.
    for (const action in inputState.combat) {
        inputState.combat[action] = false;
    }
    
    // La funzione di calcolo del danno è stata spostata in fondo.
    // L'esecuzione del codice non prosegue se l'input del giocatore non è ancora arrivato (vedi inizio funzione).
}


// ------------------------------------
// FUNZIONE DI SUPPORTO PER IL DANNO
// ------------------------------------

/**
 * Calcola il danno inflitto in base a chi sta attaccando e alla mossa utilizzata.
 * NOTA DIDATTICA: Questa funzione è un placeholder e richiede logica RPG più complessa.
 * @param {boolean} isPlayerAttacking True se il giocatore sta attaccando.
 * @returns {number} Il valore del danno inflitto.
 */
function calculateDamage(isPlayerAttacking = true) {
    let damage;

    if (isPlayerAttacking) {
        // Danno Player: base * modificatore mossa specifica
        damage = player.baseDamage * player.classModifiers.attack[combatState.player];
    } else {
        // Danno Nemico: base del nemico
        damage = globals.enemyOnCombat.baseDamage;
    }

    return Math.round(damage);
}


// ====================================================================================
// ===== GESTIONE DEL PASSAGGIO DI STATO (ENTER/EXIT COMBAT) =====
// ====================================================================================

/**
 * Inizializza la modalità di combattimento quando il giocatore incontra un nemico.
 * @param {Object} enemy L'entità nemica con cui si entra in combattimento.
 */
export function enterCombat(enemy) {
    globals.gameState = "combat";
    globals.enemyOnCombat = enemy; // Memorizza il nemico attuale.

    // --- Aggiornamento UI: Nascondi controlli di movimento, mostra quelli di combattimento ---
    hideElement(document.getElementById("move-controls"));
    showElement(document.getElementById("combat-controls"));
    
    // --- Aggiornamento UI: Minimappa e Box Statistiche ---
    hideElement(globals.mapCanvas);
    hideElement(document.getElementById("stats-overview"));
    showElement(document.getElementById("combat-stats"));

    // --- Aggiornamento UI: Gestione Testo (Spostamento e Centratura) ---
    const textboxContent = document.getElementById("textbox-content");
    showElement(textboxContent);
    textboxContent.style.textAlign = "center";
    
    // Sposta il textbox nella posizione centrale per il combattimento (ad esempio nel container della mappa).
    const textContainer = document.getElementById("map-container");
    textContainer.appendChild(textboxContent);

    // Aggiorna l'interfaccia (es. barra HP del nemico).
    enemy.updateHPBar();
}

/**
 * Riporta il gioco alla modalità Esplorazione dopo che il combattimento è terminato.
 */
export function exitCombat() {
    globals.gameState = "exploration";
    globals.enemyOnCombat = null; // Rimuove il riferimento al nemico sconfitto.

    // --- Aggiornamento UI: Mostra controlli di movimento, nascondi quelli di combattimento ---
    showElement(document.getElementById("move-controls"));
    hideElement(document.getElementById("combat-controls"));
    
    // --- Aggiornamento UI: Minimappa e Box Statistiche ---
    showElement(globals.mapCanvas);
    showElement(document.getElementById("stats-overview"));
    hideElement(document.getElementById("combat-stats"));
    
    const textboxContent = document.getElementById("textbox-content");
    hideElement(textboxContent);
    
    // --- Aggiornamento UI: Riporta il textbox nel contenitore originale ---
    const originalContainer = document.getElementById("info-container");
    originalContainer.appendChild(textboxContent);

    // --- Ricalcolo dello Scaling ---
    // Necessario perché la visibilità degli elementi UI è cambiata (potrebbe influenzare il layout).
    scaleCanvas(globals.gameCanvas, contexts.gameCtx, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT);
    fitGameMap(); 
    scaleCanvas(globals.mapCanvas, contexts.mapCtx, globals.MAP_WIDTH, globals.MAP_HEIGHT);
}


// ====================================================================================
// ===== FUNZIONE DI RENDERING DELLA SCENA DI COMBATTIMENTO (EXPORT) =====
// ====================================================================================

/**
 * Disegna la scena di combattimento (sfondo e sprite del nemico/giocatore).
 * Chiamata dal `renderer.js` quando `globals.gameState` è "combat".
 * @param {CanvasRenderingContext2D} ctx Il contesto di disegno principale (gameCtx).
 */
export function renderCombat(ctx) {
    const enemy = globals.enemyOnCombat;
    
    // Pulisce lo schermo
    ctx.fillRect(0, 0, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT);

    // --- Disegno del Nemico al Centro ---
    const enemyTextureW = enemy.texture.width / 2;
    const enemyTextureH = enemy.texture.height / 2;

    ctx.drawImage(
        enemy.texture,
        globals.SCREEN_WIDTH / 2 - enemyTextureW / 2, // Centrato orizzontalmente
        globals.SCREEN_HEIGHT / 2 - enemyTextureH,    // Posizionato nella metà superiore
        enemyTextureW,
        enemyTextureH
    );

    // --- Disegno del Giocatore (Sprite di spalle) ---
    const playerTextureW = player.backImage.width / 2;
    const playerTextureH = player.backImage.height / 2;
    ctx.drawImage(
        player.backImage,
        globals.SCREEN_WIDTH / 4 - playerTextureW / 2, // Leggermente spostato a sinistra dal centro
        globals.SCREEN_HEIGHT - playerTextureH,        // Posizionato in basso
        playerTextureW,
        playerTextureH
    );
}