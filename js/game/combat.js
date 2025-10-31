import { globals } from "../utils/globals.js";
import { createTimer } from "../utils/timer.js";
import { inputState } from "../core/input.js";
import { showDialogues } from "./ui.js";
import { sounds } from "../core/audio.js";

const combatState = {
    player: null,
    enemy: null,
    timer: null,
}

// Accoppia una mossa con quella su cui predomina
const winsAgainst = {
    sword: "magic",
    shield: "sword",
    magic: "shield",
}


export function renderCombat(ctx) {
    const enemy = globals.enemyOnCombat

    ctx.fillRect(0, 0, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT);
    const textureW = enemy.texture.width / 2;
    const textureH = enemy.texture.height / 2;


    ctx.drawImage(enemy.texture, globals.SCREEN_WIDTH / 2 - textureW / 2, globals.SCREEN_HEIGHT / 2 - textureH,textureW, textureH);
}


export function combat() {
    // 1. SCELTA DEL GIOCATORE
    if (!combatState.player) {
        for (const action in inputState.combat) {
            if (inputState.combat[action]) {
                combatState.player = action;
                
                showDialogues(`${action}_player`);
                sounds.combatSounds.player[action]?.play();  // Suono player
                
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
        sounds.combatSounds.enemy[combatState.enemy]?.play();  // Suono nemico
        
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
    }

    showDialogues(resultKey);
    sounds.combatSounds.result[resultKey]?.play();  // Suono risultato

    // Reset per il prossimo turno
    combatState.player = null;
    combatState.enemy = null;
}