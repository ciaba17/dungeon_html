export const bgMusic = new Audio("../../assets/audio/musics/bgMusic.mp3")

bgMusic.volume = 0.1


document.addEventListener('click', () => {
    bgMusic.play()
});
