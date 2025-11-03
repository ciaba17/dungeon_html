import { globals } from "../utils/globals.js";
import { createTimer } from "../utils/timer.js";
import { inputState } from "../core/input.js";
import { showDialogues } from "./ui.js";
import { sounds } from "../core/audio.js";
import { player } from "./player.js";
import { hideElement } from '../utils/cssHandler.js';
import { showElement } from '../utils/cssHandler.js';
import { scaleCanvas, fitGameMap } from "../core/scaling.js";
import { contexts } from "../core/renderer.js";

const combatState = {
    player: null,
    enemy: null,
    timer: null,
};

// Accoppia una mossa con quella su cui predomina
const winsAgainst = {
    sword: "magic",
    shield: "sword",
    magic: "shield",
};

export function combat() {
    // 1. SCELTA DEL GIOCATORE
    if (!combatState.player) {
        for (const action in inputState.combat) {
            if (inputState.combat[action]) {
                combatState.player = action;

                showDialogues(`${action}_player`);
                sounds.combatSounds.player[action]?.play(); // Suono player

                inputState.combat[action] = false;
                combatState.timer = createTimer(3);
                break;
            }
        }
        return;
    }

    // ATTESA TRA I TURNI
    if (combatState.timer.running) {
        combatState.timer.update(globals.deltaTime);
        return;
    }

    // 2. SCELTA DEL NEMICO
    if (!combatState.enemy && !combatState.timer.running) {
        const moves = ["sword", "shield", "magic"];
        combatState.enemy = moves[Math.floor(Math.random() * moves.length)];

        showDialogues(`${combatState.enemy}_enemy`);
        sounds.combatSounds.enemy[combatState.enemy]?.play(); // Suono nemico

        combatState.timer.reset();
        return;
    }

    // 3. DETERMINAZIONE DEL VINCITORE
    let resultKey;
    if (combatState.player === combatState.enemy) {
        resultKey = "draw";
    } else {
        const playerWins = winsAgainst[combatState.player] === combatState.enemy;
        resultKey = playerWins ? "victory_player" : "victory_enemy";

        const damage = 60; // Puoi regolare i valori di danno

        if (playerWins) {
            // Se il giocatore vince, il nemico prende danno
            if (globals.enemyOnCombat.takeDamage) {
                globals.enemyOnCombat.takeDamage(damage);
            } else {
                // Se non ha la funzione takeDamage, riduci direttamente gli HP
                globals.enemyOnCombat.hp -= damage;
            }
        } else {
            // Se il giocatore perde, subisce danno
            player.takeDamage(damage);
        }
    }

    showDialogues(resultKey);
    sounds.combatSounds.result[resultKey]?.play(); // Suono risultato

    // Reset per il prossimo turno
    combatState.player = null;
    combatState.enemy = null;
    globals.combatInputLocked = false; // Sblocca l'input

    // Pulisci inputState per sicurezza
    for (const action in inputState.combat) {
        inputState.combat[action] = false;
    }

}

export function enterCombat(enemy) {
    globals.gameState = "combat";
    globals.enemyOnCombat = enemy;

    hideElement(document.getElementById("move-controls"));
    showElement(document.getElementById("combat-controls"));
    hideElement(globals.mapCanvas);

    const textboxContent = document.getElementById("textbox-content");
    showElement(textboxContent);

    hideElement(document.getElementById("stats-overview"));
    showElement(document.getElementById("combat-stats"));

    textboxContent.style.textAlign = "center";
    const combatTextContainer = document.getElementById("map-container");
    combatTextContainer.appendChild(textboxContent);
}

export function exitCombat() {
    globals.gameState = "exploration";
    globals.enemyOnCombat = null;

    showElement(document.getElementById("move-controls"));
    hideElement(document.getElementById("combat-controls"));
    showElement(globals.mapCanvas);
    
    const textboxContent = document.getElementById("textbox-content");
    hideElement(textboxContent);
    
    showElement(document.getElementById("stats-overview"));
    hideElement(document.getElementById("combat-stats"));

    // Riporta il textbox nel suo contenitore originale (se necessario)
    const originalContainer = document.getElementById("ui-container");
    if (originalContainer && !originalContainer.contains(textboxContent)) {
        originalContainer.appendChild(textboxContent);
    }

    // Riresiza tutto
    scaleCanvas(globals.gameCanvas, contexts.gameCtx, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT);
    fitGameMap(); // Prima di scalare la mappa
    scaleCanvas(globals.mapCanvas, contexts.mapCtx, globals.MAP_WIDTH, globals.MAP_HEIGHT);
}


export function renderCombat(ctx) {
    const enemy = globals.enemyOnCombat;
    ctx.fillRect(0, 0, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT);

    const enemyTextureW = enemy.texture.width / 2;
    const enemyTextureH = enemy.texture.height / 2;

    ctx.drawImage(
        enemy.texture,
        globals.SCREEN_WIDTH / 2 - enemyTextureW / 2,
        globals.SCREEN_HEIGHT / 2 - enemyTextureH,
        enemyTextureW,
        enemyTextureH
    );

    const playerTextureW = player.backImage.width / 2;
    const playerTextureH = player.backImage.height / 2;
    ctx.drawImage(
        player.backImage,
        globals.SCREEN_WIDTH / 4 - playerTextureW / 2,
        globals.SCREEN_HEIGHT - playerTextureH,
        playerTextureW,
        playerTextureH
    );
}


