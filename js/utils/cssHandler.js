// cssHandler.js - Modulo di utility per la manipolazione semplice delle classi CSS 
// di visibilità sugli elementi DOM

// ====================================================================================
// ===== FUNZIONI CORE =====
// ====================================================================================

/**
 * Nasconde un elemento DOM aggiungendo la classe 'hidden'
 * Si presume che la classe 'hidden' imposti 'display: none' o 'visibility: hidden'
 * nel file CSS principale
 * @param {HTMLElement} element L'elemento DOM da nascondere
 */
export function hideElement(element) {
    element.classList.add('hidden');
}

/**
 * Mostra un elemento DOM rimuovendo la classe 'hidden'
 * @param {HTMLElement} element L'elemento DOM da mostrare
 */
export function showElement(element) {
    element.classList.remove('hidden');
}