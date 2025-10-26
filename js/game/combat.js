import { globals } from "../utils/globals.js";
import { createTimer } from "../utils/timer.js";
import { inputState } from "../core/input.js";

const combatState = {
    player: null,
    enemy: null,
    timer: null,
}


export function renderCombat(ctx) {
    const enemy = globals.enemyOnCombat

    ctx.fillRect(0, 0, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT);
    const textureW = enemy.texture.width / 2;
    const textureH = enemy.texture.height / 2;


    ctx.drawImage(enemy.texture, globals.SCREEN_WIDTH / 2 - textureW / 2, globals.SCREEN_HEIGHT / 2 - textureH,
        textureW, textureH
    );

}

export function combat(delta) {
    
    if (!combatState.player) { // IL GIOCATORE NON HA ANCORA SCELTO
        for (let inputAction in inputState.combat) { // Itera le keys (nomi degli attributi) dell'oggetto combat
            if (inputState.combat[inputAction] === true) { // Controlla se True la proprietà di combat che ha come nome il contenuto di action
                combatState.player = inputAction;
            }
        }
    } else if (!combatState.enemy) { // IL NEMICO DEVE RISPONDERE
        combatState.enemy = Math.floor(Math.random() * 3);

        switch(combatState.enemy) { // Converte da numero a mossa effettiva
            case 0:
                combatState.enemy = "rock"
                break;
            case 1:
                combatState.enemy = "paper"
                break;
            case 2:
                combatState.enemy = "scissors"
                break;
        }
        combatState.timer = createTimer(5);
    } else if (combatState.timer.running) {
        combatState.timer.update(delta);
    } else {
            console.log("vai cai")
    }
}