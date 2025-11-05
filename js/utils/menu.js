// menu.js - Gestisce la logica di interazione del menu principale index.html: 
// Navigazione verso la selezione classe e gestione delle finestre modali (pop-up)

document.addEventListener('DOMContentLoaded', () => {
    
    // ====================================================================================
    // ===== 1) RIFERIMENTI DOM =====
    // ====================================================================================

    // Pulsanti Principali
    const startBtn = document.getElementById("start-btn");

    // Finestra Opzioni
    const optionsBtn = document.getElementById("options-btn");
    const optionsWindow = document.getElementById("options-window");
    const closeOptions = document.getElementById("close-options");

    // Finestra Comandi
    const commandsBtn = document.getElementById("commands-btn");
    const commandsWindow = document.getElementById("commands-window");
    const closeCommands = document.getElementById("close-commands");

    // Finestra Crediti
    const creditsBtn = document.getElementById("credits-btn");
    const creditsWindow = document.getElementById("credits-window");
    const closeCredits = document.getElementById("close-credits");


    // ====================================================================================
    // ===== 2) NAVIGAZIONE (Inizio Gioco) =====
    // ====================================================================================

    /**
     * Avvia il flusso di gioco reindirizzando alla pagina di selezione della classe
     */
    startBtn.addEventListener("click", () => {
        // Reindirizza l'utente alla schermata successiva (selezione classe/nome)
        window.location.href = "class.html"; 
    });


    // ====================================================================================
    // ===== 3) FUNZIONI HELPER PER LE MODALI =====
    // ====================================================================================

    /**
     * Configura gli event listener per mostrare e nascondere una specifica finestra modale
     * @param {HTMLElement} openBtn Il pulsante che apre la finestra
     * @param {HTMLElement} windowElement La finestra modale (elemento DOM)
     * @param {HTMLElement} closeBtn Il pulsante o l'icona per chiudere la finestra
     */
    function setupModal(openBtn, windowElement, closeBtn) {
        // Mostra la finestra modale (rimuove la classe 'hidden')
        openBtn.addEventListener("click", () => {
            windowElement.classList.remove("hidden");
        });
        
        // Nasconde la finestra modale (aggiunge la classe 'hidden')
        closeBtn.addEventListener("click", () => {
            windowElement.classList.add("hidden");
        });
    }


    // ====================================================================================
    // ===== 4) APPLICAZIONE DEI LISTENER =====
    // ====================================================================================

    // Configura la finestra Comandi
    setupModal(commandsBtn, commandsWindow, closeCommands);

    // Configura la finestra Opzioni
    setupModal(optionsBtn, optionsWindow, closeOptions);

    // Configura la finestra Crediti
    setupModal(creditsBtn, creditsWindow, closeCredits);

});