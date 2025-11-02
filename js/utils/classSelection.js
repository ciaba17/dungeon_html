document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.class-btn');

    const classData = {
        wizard: {
            name: "Wizard",
            description: "Maestro di magie arcane e incantesimi potenti."
        },
        paladin: {
            name: "Paladin",
            description: "Guerriero sacro con alto potere difensivo e attacchi pesanti."
        },
        rogue: {
            name: "Rogue",
            description: "Abile e veloce, esperto in trappole e colpi critici."
        },
        wanderer: {
            name: "Wanderer",
            description: "Esploratore libero, bilanciato tra attacco e mobilità."
        }
    };

    buttons.forEach(btn => {
        const infoBox = btn.nextElementSibling; // prende il div .class-info sotto il bottone
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
    });
});
