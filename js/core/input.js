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
        rock: false,
        paper: false,
        scissors: false,
    }
};



export function inputHandler() {
    
};


document.addEventListener("DOMContentLoaded", () => {
    const buttons = Array.from(document.querySelectorAll(".combat-btn, .move-btn")); // Prende elementi che hanno una delle due classi e trasforma in array
    
    // Aggiunge un event listener a ogni bottone
    for (let button of buttons) {
        button.addEventListener("click", () => {
            const input = button.id.replace("-btn", ""); // tipo "up-btn" → "up"
            console.log(input)
            if (button.classList.contains("move-btn")) {
                inputState.movement[input] = true;
            } else if (button.classList.contains("combat-btn")) {
                inputState.combat[input] = true;
            }
        });
    }

    const interact = document.getElementById("interact-btn");
    interact.onclick = () => {
        player.interact();
    }
});

// DA ORA IN POI SOLO PER DEBUG PENSO

document.addEventListener('mousemove', function(event) {
    globals.offsetY = event.clientY - (window.innerHeight / 2);
});


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
