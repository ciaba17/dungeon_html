// audio.js - Modulo per la gestione e l'esportazione di tutte le risorse audio del gioco
// Qui vengono caricati (istanziti) i file audio e configurate le loro proprietà di base (volume, loop)


// ====================================================================================
// ===== DEFINIZIONE DELL'OGGETTO SOUNDS (ESPORTAZIONE) =====
// ====================================================================================

/**
 * Esporta l'oggetto `sounds` che contiene tutte le istanze di Audio() caricate 
 * per l'accesso globale nel gioco (musiche, effetti di combattimento, suoni ambientali)
 */
export const sounds = {
    // --- Suoni di Combattimento (suddivisi per attore e risultato) ---
    combatSounds: {
        player: {
            // Suoni degli attacchi/azioni del Giocatore
            sword: new Audio("assets/audio/sword_player.mp3"),
            shield: new Audio("assets/audio/shield_player.mp3"),
            magic: new Audio("assets/audio/magic_player.mp3")
        },
        enemy: {
            // Suoni degli attacchi/azioni del Nemico
            sword: new Audio("assets/audio/sword_enemy.mp3"),
            shield: new Audio("assets/audio/shield_player.mp3"), // Nota: riusa lo stesso suono di scudo del giocatore
            magic: new Audio("assets/audio/magic_enemy.mp3")
        },
        result: {
            // Suoni riprodotti alla fine di un incontro di combattimento
            draw: new Audio("assets/audio/draw.mp3"),
            victory_player: new Audio("assets/audio/victory_player.mp3"),
            victory_enemy: new Audio("assets/audio/victory_enemy.mp3")
        }
    },

    // --- Suoni inventario ---
    collectItem: new Audio("assets/audio/collect_item.mp3"), // Suono riprodotto quando si raccoglie un oggetto

    // --- Musiche di Sottofondo e Suoni Ambientali ---
    bgMusic: new Audio("assets/audio/musics/bgMusic.mp3"), // Musica principale di esplorazione
    gate: new Audio("assets/audio/gate.mp3"),              // Suono per l'apertura/chiusura di cancelli o porte
    wind: new Audio("assets/audio/musics/wind.mp3"),       // Suono ambientale: vento
    birds: new Audio("assets/audio/musics/birds.mp3"),     // Suono ambientale: uccelli
}


// ====================================================================================
// ===== CONFIGURAZIONE INIZIALE DELLE PROPRIETÀ AUDIO =====
// ====================================================================================

// Imposta le proprietà di looping e volume basso per i suoni di sottofondo

// --- Musica Principale ---
sounds.bgMusic.loop = true;
sounds.bgMusic.volume = 0.2;

// --- Suoni ambientali (devono ripetersi e avere volume contenuto) ---
sounds.wind.loop = true;
sounds.wind.volume = 0.2;
sounds.birds.loop = true;
sounds.birds.volume = 0.2;