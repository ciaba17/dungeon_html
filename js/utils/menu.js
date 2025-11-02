// ===== Pulsanti menu =====
const startBtn   = document.getElementById("start-btn");
const loadBtn    = document.getElementById("load-btn");
const optionsBtn = document.getElementById("options-btn");
const exitBtn    = document.getElementById("exit-btn");

// Vai al gioco
startBtn.addEventListener("click", () => {
    window.location.href = "class.html"; // Sostituisci con la pagina del tuo gioco
    console.log("cai")
});

// Caricamento salvataggi
loadBtn.addEventListener("click", () => {
    alert("Funzione Carica non ancora implementata");
});

// Opzioni
optionsBtn.addEventListener("click", () => {
    alert("Funzione Opzioni non ancora implementata");
});

// Esci
exitBtn.addEventListener("click", () => {
    window.close(); // In browser probabilmente non funziona
});
