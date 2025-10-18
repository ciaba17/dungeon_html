export const globals = {
    SCREEN_WIDTH: 800, 
    SCREEN_HEIGHT: 600,

    // Oggetti vuoti che saranno popolati durante l'inizializzazione del gioco
    dialoghi: {},
    maps: {}, 
    gameCanvas: null,
    mapCanvas: null,

    tileSize: 25, // Dimensione di una piastrella in pixel

    rayNumber : 400,

    fov: 60, // In gradi
    FPS_LIMIT: 60,
    lastTime: 0,
    interval: 0,
};


export const textures = {
    wallTexture : new Image(),
}

textures.wallTexture.src = "../assets/images/wallTexture.png";  // Prova a caricare il file

textures.wallTexture.onload = function() {
    console.log("Immagine caricata con successo!");
};

textures.wallTexture.onerror = function() {
    console.error("Errore: impossibile caricare l'immagine.");
};
