import { globals } from '../utils/globals.js';
import { contexts } from './renderer.js';
import { player } from '../game/player.js';

export const inputState = { // Mappa di stato degli input
    movement: {
        up: false,
        down: false,
        left: false,
        right: false,
        turnLeft: false,
        turnRight: false,
    },

    combat: {
        sword: false,
        shield: false,
        magic: false,
    }
};



export function inputHandler() {
    
};


document.addEventListener("DOMContentLoaded", () => {
    const buttons = Array.from(document.querySelectorAll(".combat-btn, .move-btn"));

    for (let button of buttons) {
        button.addEventListener("click", () => {
            if (globals.combatInputLocked) return; // ignora input finché bloccato

            const input = button.id.replace("-btn", "");
            if (button.classList.contains("move-btn")) {
                inputState.movement[input] = true;
            } else if (button.classList.contains("combat-btn")) {
                inputState.combat[input] = true;
                globals.combatInputLocked = true; // blocca subito altri click finché il turno non termina
            }
        });
    }

    document.getElementById("interact-btn").onclick = () => {
        player.interact();
    }
});




// Comandi da tastiera
document.addEventListener('keydown', event => {
    switch (event.key) {
        case 'ArrowUp':
            inputState.movement.up = true;
            break;
        case 'ArrowDown':
            inputState.movement.down = true;
            break;
        case 'ArrowLeft':
            inputState.movement.left = true;
            break;
        case 'ArrowRight':
            inputState.movement.right = true;
            break;
        case 'z':
            inputState.movement.turnLeft = true;
            break;
        case 'x':
            inputState.movement.turnRight = true;
            break;
        case ' ': // Spacebar
            player.interact();
            break;
    }
});

document.addEventListener('keyup', event => {
    switch (event.key) {
        case 'ArrowUp':
            inputState.movement.up = false;
            break;
        case 'ArrowDown':
            inputState.movement.down = false;
            break;
        case 'ArrowLeft':
            inputState.movement.left = false;
            break;
        case 'ArrowRight':
            inputState.movement.right = false;
            break;
        case 'z':
            inputState.movement.turnLeft = false;
            break;
        case 'x':
            inputState.movement.turnRight = false;
            break;
    }
});
