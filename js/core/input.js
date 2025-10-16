import { globals } from '../utils/globals.js';

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
});