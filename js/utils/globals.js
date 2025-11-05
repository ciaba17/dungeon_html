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
    
    ceilingColor: "rgb(86, 152, 232)",
    floorColor: "rgb(67, 112, 11)",
};



// Crea e carica tutte le textures
export const textures = {
    blankTexture: new Image(),
    wallTexture: new Image(),
    outside1_1: new Image(),
    gate: new Image(),
    errorTexture: new Image(),
};

for (let key in textures) {
    textures[key].src = "assets/images/" + key + ".png";
}