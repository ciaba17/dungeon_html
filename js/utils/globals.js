export const globals = {
    SCREEN_WIDTH: 800, 
    SCREEN_HEIGHT: 600,

    MAP_WIDTH: 400,
    MAP_HEIGHT: 300,

    VIEW_DISTANCE: 150,

    gameState: "exploration", // Stato del gioco (es. gameover, combat, exploration)
    enemyOnCombat: null,

    // Oggetti vuoti che saranno popolati durante l'inizializzazione del gioco
    dialogues: {},
    currentDialogueInterval: null,
    maps: {}, 
    gameCanvas: null,
    mapCanvas: null,

    tileSize: 32, // Dimensione di una piastrella in pixel
    mapZoom: 1,

    rayNumber: 400,

    fov: 60, // In gradi
    FPS_LIMIT: 60,

    wallSlices: [],

    entities: [],

    deltaTime: null,

    combatInputLocked: false,
    
};


export const textures = {
    wallTexture : new Image(),
    test : new Image(),
    
}

textures.wallTexture.src = "assets/images/wallTexture.png";  // Prova a caricare il file
textures.test.src = "assets/images/monster.png";

textures.wallTexture.onload = function() {
    console.log("Immagine caricata con successo!");
};

textures.wallTexture.onerror = function() {
    console.error("Errore: impossibile caricare l'immagine.");
};


textures.test.onload = function() {
    console.log("Immagine caricata con successo!");
};

textures.test.onerror = function() {
    console.error("Errore: impossibile caricare l'immagine.");
};
