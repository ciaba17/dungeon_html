import { globals } from "../utils/globals.js";

export function renderCombat(ctx) {
    const enemy = globals.enemyOnCombat

    ctx.fillRect(0, 0, globals.SCREEN_WIDTH, globals.SCREEN_HEIGHT);
    const textureW = enemy.texture.width / 2;
    const textureH = enemy.texture.height / 2;


    ctx.drawImage(enemy.texture, globals.SCREEN_WIDTH / 2 - textureW / 2, globals.SCREEN_HEIGHT / 2 - textureH,
        textureW, textureH
    );

}