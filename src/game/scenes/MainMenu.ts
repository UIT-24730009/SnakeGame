import { GameObjects, Scene } from "phaser";

import { EventBus } from "../EventBus";
import Snake from "../models/Snake";

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;
    snake: Snake;

    constructor() {
        super("MainMenu");
    }

    preload() {
        this.load.setPath('assets');
        this.snake = new Snake(this);
        this.snake.preload();
    }

    create() {

        this.background = this.add.image(512, 384, "background");

        this.snake.createAnimations();
        this.snake.initializeSnake();

        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        if (this.logoTween) {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start("Game");
    }

}

