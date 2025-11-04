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



// Crea e carica tutte le textures
export const textures = {
    wallTexture: new Image(),
    blankTexture: new Image(),
    errorTexture: new Image(),
    monster: new Image(),
    key: new Image(),
    outside1_1: new Image(),
    outside1_2: new Image(),
    outside1_3: new Image(),
    outside2_1: new Image(),
    outside2_2: new Image(),
    outside2_3: new Image(),
    outside3_1: new Image(),
    outside3_2: new Image(),
    outside3_3: new Image(),
};

for (let key in textures) {
    textures[key].src = "assets/images/" + key + ".png";
}