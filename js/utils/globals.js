export const globals = {
    SCREEN_WIDTH: 800, 
    SCREEN_HEIGHT: 600,

    MAP_WIDTH: 400,
    MAP_HEIGHT : 300,

    // Oggetti vuoti che saranno popolati durante l'inizializzazione del gioco
    dialoghi: {},
    maps: {}, 
    gameCanvas: null,
    mapCanvas: null,

    tileSize: 32, // Dimensione di una piastrella in pixel
    tileNumber: 32,
    mapZoom : 1,

    rayNumber : 400,

    fov: 60, // In gradi
    FPS_LIMIT: 60,

    wallSlices: [],

    entities: [],

    deltaTime : null,

    mouseY : 0,
};


export const textures = {
    wallTexture : new Image(),
    test : new Image(),
}

textures.wallTexture.src = "../assets/images/wallTexture.png";  // Prova a caricare il file
textures.test.src = "../assets/images/monster.png";

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
