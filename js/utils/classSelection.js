// classSelection.js - Gestisce l'interfaccia utente sulla pagina di selezione del personaggio (class.html).
// Cattura la classe scelta e il nome del giocatore, salvandoli nel localStorage.

// ====================================================================================
// ===== ESECUZIONE PRINCIPALE (DOMContentLoaded) =====
// ====================================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- Riferimenti DOM ---
    const buttons = document.querySelectorAll('.class-btn');       // Tutti i bottoni delle classi
    const modal = document.getElementById("name-modal");            // Il modal per l'inserimento del nome
    const nameInput = document.getElementById("player-name-input"); // L'input del nome
    const confirmBtn = document.getElementById("confirm-name-btn"); // Bottone di conferma nel modal

    let selectedClass = null; // Variabile per memorizzare la classe scelta.

    // --- Dati delle Classi ---
    const classData = {
        wizard: { 
            name: "Wizard", 
            description: "Master of the arcane arts, capable of casting powerful spells and bending magic to their will." 
        },
        paladin: { 
            name: "Paladin", 
            description: "A holy warrior blessed with divine strength, excelling in defense and delivering righteous, heavy blows." 
        },
        guardian: { 
            name: "Guardian", 
            description: "Heavily armored and unyielding, a frontline fighter built to endure and dominate in close combat." 
        },
        wanderer: { 
            name: "Wanderer", 
            description: "A free-spirited explorer, balanced between offense, agility, and adaptability in any situation." 
        }

    };


    // ====================================================================================
    // ===== GESTIONE EVENTI: BOTTONI DI CLASSE =====
    // ====================================================================================

    buttons.forEach(btn => {
        // L'infoBox è l'elemento adiacente (tooltip o descrizione)
        const infoBox = btn.nextElementSibling; 

        // --- Evento 1: Mouse Enter (Mostra Descrizione/Tooltip) ---
        btn.addEventListener('mouseenter', () => {
            const cls = btn.dataset.class; // Recupera l'ID della classe (es. 'wizard') dal data-class
            if(classData[cls]) {
                infoBox.innerHTML = `<strong>${classData[cls].name}</strong><br>${classData[cls].description}`;
                infoBox.style.display = 'block';
            }
        });

        // --- Evento 2: Mouse Leave (Nasconde Descrizione/Tooltip) ---
        btn.addEventListener('mouseleave', () => {
            infoBox.style.display = 'none';
        });

        // --- Evento 3: Click (Selezione Classe e Apertura Modal) ---
        btn.addEventListener('click', () => {
            selectedClass = btn.dataset.class;
            if(classData[selectedClass]) {
                modal.classList.remove("hidden"); // Rimuove la classe 'hidden' per mostrare il modal
                nameInput.focus(); // Porta il focus sull'input per una migliore UX
            }
        });
    });

    // ====================================================================================
    // ===== GESTIONE EVENTI: MODAL NOME GIOCATORE =====
    // ====================================================================================

    /**
     * Gestisce la conferma del nome, salva i dati e avvia il gioco.
     */
    confirmBtn.addEventListener('click', () => {
        let playerName = nameInput.value.trim(); // Rimuove spazi bianchi iniziali/finali
        
        // Validazione: controlla se il nome è vuoto
        if(playerName === "") {
            alert("Devi inserire un nome valido!");
            return;
        }

        // Formattazione: Nome sempre in maiuscolo (come da richiesta originale)
        playerName = playerName.toUpperCase();

        // --- 1. Salvataggio Dati nel localStorage ---
        // Essenziale per trasferire la scelta al modulo di gioco (player.js)
        localStorage.setItem("playerClass", selectedClass);
        localStorage.setItem("playerName", playerName);

        // --- 2. Reindirizzamento ---
        // Carica la pagina principale del gioco
        window.location.href = "game.html";
    });

    // --- Funzionalità Aggiuntiva: Chiusura Modal con ESC ---
    document.addEventListener('keydown', e => {
        if(e.key === "Escape") {
            modal.classList.add("hidden"); // Nasconde il modal
        }
    });
});