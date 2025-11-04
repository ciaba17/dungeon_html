// ===== Pulsanti menu =====
const startBtn   = document.getElementById("start-btn");

const optionsBtn = document.getElementById("options-btn");
const optionsWindow = document.getElementById("options-window");
const closeOptions = document.getElementById("close-options");

const commandsBtn = document.getElementById("commands-btn");
const commandsWindow = document.getElementById("commands-window");
const closeCommands = document.getElementById("close-commands");

const creditsBtn = document.getElementById("credits-btn");
const creditsWindow = document.getElementById("credits-window");
const closeCredits = document.getElementById("close-credits");

// Vai al gioco
startBtn.addEventListener("click", () => {
    window.location.href = "class.html"; // Sostituisci con la pagina del tuo gioco
});

// Schermata comandi
commandsBtn.addEventListener("click", () => {
    commandsWindow.classList.remove("hidden");
});
closeCommands.addEventListener("click", () => {
    commandsWindow.classList.add("hidden");
});

// Opzioni
optionsBtn.addEventListener("click", () => {
    optionsWindow.classList.remove("hidden");
});
closeOptions.addEventListener("click", () => {
    optionsWindow.classList.add("hidden");
});

// Crediti
creditsBtn.addEventListener("click", () => {
    creditsWindow.classList.remove("hidden");
});
closeCredits.addEventListener("click", () => {
    creditsWindow.classList.add("hidden");
});