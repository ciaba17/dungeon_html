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
    wallTexture: new Image(),
    blankTexture: new Image(),
    errorTexture: new Image(),
    test: new Image(),
    
}

textures.wallTexture.src = "assets/images/wallTexture.png";
textures.blankTexture.src = "assets/images/blankTexture.png";
textures.errorTexture.src = "assets/images/errorTexture.png";
textures.test.src = "assets/images/monster.png";