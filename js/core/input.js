import { globals } from '../utils/globals.js';
import { contexts } from './renderer.js';

export const inputState = new Map([ // Mappa di stato degli input
    ["up", false],
    ["down", false],
    ["left", false],
    ["right", false],
    ["turnLeft", false],
    ["turnRight", false]
]);



export function inputHandler() {
    
};


document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.getElementsByClassName("control-btn"); // Prende tutti i bottoni per i comandi
    
    // Aggiunge un event listener a ogni bottone
    for (let button of buttons) {
        button.addEventListener("click", () => {
            const dir = button.id.replace("-btn", ""); // tipo "up-btn" → "up"
            inputState[dir] = true;
        });
    }

    const interact = document.getElementById("interact-btn");
    interact.onclick = () => {
    player.interact();
    }
});



document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowUp') {
        globals.mouseY += 20
    }
    if (event.key === 'ArrowDown') {
        globals.mouseY -= 20
    }
});


document.addEventListener('mousemove', function(event) {
    const x = event.clientX;

});
