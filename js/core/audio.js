export const sounds = {
    combatSounds: {
        player: {
            sword: new Audio("../../assets/audio/sword_player.mp3"),
            shield: new Audio("../../assets/audio/shield_player.mp3"),
            magic: new Audio("../../assets/audio/magic_player.mp3")
        },
        enemy: {
            sword: new Audio("../../assets/audio/sword_enemy.mp3"),
            shield: new Audio("../../assets/audio/shield_player.mp3"),
            magic: new Audio("../../assets/audio/magic_enemy.mp3")
        },
        result: {
            draw: new Audio("../../assets/audio/draw.mp3"),
            victory_player: new Audio("../../assets/audio/"),
            victory_enemy: new Audio("../../assets/audio/victory_enemy.mp3")
        }
    },


    

    bgMusic: new Audio("../../assets/audio/musics/bgMusic.mp3"),
}

sounds.bgMusic.volume = 0.05;
// Fa partire la bg music ad un qualsiasi click della pagina
document.addEventListener('click', () => {
    sounds.bgMusic.play()
});
