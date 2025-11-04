document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.class-btn');
    const modal = document.getElementById("name-modal");
    const nameInput = document.getElementById("player-name-input");
    const confirmBtn = document.getElementById("confirm-name-btn");

    let selectedClass = null;

    const classData = {
        wizard: { 
            name: "Wizard", 
            description: "Master of arcane arts, capable of casting powerful spells and bending magic to their will." 
        },
        paladin: { 
            name: "Paladin", 
            description: "A holy warrior blessed with divine strength, excelling in defense and delivering heavy, righteous blows." 
        },
        guardian: { 
            name: "Guardian", 
            description: "Heavily armored and unyielding, a frontline fighter built to endure and dominate in close combat." 
        },
        wanderer: { 
            name: "Wanderer", 
            description: "A free-spirited explorer, balanced between offense, agility, and adaptability in any situation." 
        }
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
