import { globals } from '../utils/globals.js';

export const inputState = {
    up: false,
    down: false,
    left: false,
    right: false
};

export function inputHandler() {
    addEventListener('keydown', (event) => {
        switch(event.key) {
            case 'ArrowUp':
                inputState.up = true;
                break;
            case 'ArrowDown':
                inputState.down = true;
                break;
            case 'ArrowLeft':
                inputState.left = true;
                break;
            case 'ArrowRight':
                inputState.right = true;
                break;
        }
    });

    addEventListener('keyup', (event) => {
        switch(event.key) {
            case 'ArrowUp':
                inputState.up = false;
                break;
            case 'ArrowDown':
                inputState.down = false;
                break;
            case 'ArrowLeft':
                inputState.left = false;
                break;
            case 'ArrowRight':
                inputState.right = false;
                break;
        }
    });
};