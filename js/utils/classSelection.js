document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.class-btn');
    const modal = document.getElementById("name-modal");
    const nameInput = document.getElementById("player-name-input");
    const confirmBtn = document.getElementById("confirm-name-btn");

    let selectedClass = null;

    const classData = {
        wizard: { name: "Wizard", description: "Maestro di magie arcane e incantesimi potenti" },
        paladin: { name: "Paladin", description: "Guerriero sacro con alto potere difensivo e attacchi pesanti" },
        rogue: { name: "Guardian", description: "Pesante e corazzato, molto forte nei combattimenti corpo a corpo" },
        wanderer: { name: "Wanderer", description: "Esploratore libero, bilanciato tra attacco e mobilità" }
    };

    buttons.forEach(btn => {
        const infoBox = btn.nextElementSibling;

        btn.addEventListener('mouseenter', () => {
            const cls = btn.dataset.class;
            if(classData[cls]) {
                infoBox.innerHTML = `<strong>${classData[cls].name}</strong><br>${classData[cls].description}`;
                infoBox.style.display = 'block';
            }
        });

        btn.addEventListener('mouseleave', () => {
            infoBox.style.display = 'none';
        });

        btn.addEventListener('click', () => {
            selectedClass = btn.dataset.class;
            if(classData[selectedClass]) {
                modal.classList.remove("hidden"); // mostra il modal
                nameInput.focus();
            }
        });
    });

    confirmBtn.addEventListener('click', () => {
        let playerName = nameInput.value.trim();
        if(playerName === "") {
            alert("Devi inserire un nome valido!");
            return;
        }

        // Nome sempre in maiuscolo
        playerName = playerName.toUpperCase();

        // salva dati in localStorage
        localStorage.setItem("playerClass", selectedClass);
        localStorage.setItem("playerName", playerName);

        // reindirizza a game.html
        window.location.href = "game.html";
    });

    // opzionale: chiudi il modal con ESC
    document.addEventListener('keydown', e => {
        if(e.key === "Escape") {
            modal.classList.add("hidden");
        }
    });
});
