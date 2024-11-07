import Phaser from "phaser";

interface SnakePart {
    sprite: Phaser.GameObjects.Sprite;
    position: { x: number; y: number };
}

export default class Snake {
    private scene: Phaser.Scene;
    private snakeParts: SnakePart[];
    private direction: "up" | "down" | "left" | "right";
    private spriteSize: number;
    private spriteScale: number;
    private spriteSpacing: number;
    private readonly animations: {
        head: {
            up: string;
            down: string;
            left: string;
            right: string;
            idle: string;
        };
        body: {
            horizontal: string;
            vertical: string;
            turn: string;
        };
    };

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.snakeParts = [];
        this.direction = "up";
        this.spriteSize = 16;
        this.spriteScale = 1;
        this.spriteSpacing = this.spriteScale * this.spriteSize;
        this.animations = {
            head: {
                up: "head-up",
                down: "head-down",
                left: "head-left",
                right: "head-right",
                idle: "head-idle",
            },
            body: {
                horizontal: "body-horizontal",
                vertical: "body-vertical",
                turn: "body-turn",
            },
        };
    }

    getFrameNumber(from: number, to: number): number[] {
        const length = to - from + 1;
        return Array.from({ length }, (_, index) => index + from);
    }

    preload(): void {
        this.scene.load.spritesheet("snake-head", "SnakeHead/GreenHead.png", {
            frameWidth: this.spriteSize,
            frameHeight: this.spriteSize,
        });

         this.scene.load.spritesheet("snake-body", "SnakeBody/GreenBody.png", {
             frameWidth: this.spriteSize,
             frameHeight: this.spriteSize,
         });
    }

    createAnimations(): void {
        this.scene.anims.create({
            key: this.animations.head.up,
            frames: this.scene.anims.generateFrameNumbers("snake-head", {
                frames: this.getFrameNumber(0, 7),
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.scene.anims.create({
            key: this.animations.head.left,
            frames: this.scene.anims.generateFrameNumbers("snake-head", {
                frames: this.getFrameNumber(17, 24),
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.scene.anims.create({
            key: this.animations.head.down,
            frames: this.scene.anims.generateFrameNumbers("snake-head", {
                frames: this.getFrameNumber(32, 40),
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.scene.anims.create({
            key: this.animations.head.right,
            frames: this.scene.anims.generateFrameNumbers("snake-head", {
                frames: this.getFrameNumber(49, 56),
            }),
            frameRate: 8,
            repeat: -1,
        });

         this.scene.anims.create({
             key: this.animations.body.horizontal,
             frames: this.scene.anims.generateFrameNumbers("snake-body", {
                 frames: [0],
             }),
             frameRate: 6,
             repeat: -1,
         });

        // this.scene.anims.create({
        //     key: this.animations.body.vertical,
        //     frames: this.scene.anims.generateFrameNumbers("snake-body", {
        //         frames: [4, 5, 6, 7],
        //     }),
        //     frameRate: 6,
        //     repeat: -1,
        // });
    }

    initializeSnake(): void {
        const startX = 200;
        const startY = 200;

        const head = this.scene.add.sprite(startX, startY, "SnakeHead/GreenHead.png");
        head.scale = this.spriteScale;


        this.snakeParts.push({
            sprite: head,
            position: { x: startX, y: startY },
        });

        head.play(this.animations.head.right);

        const bodyStartX = startX - this.spriteSpacing;
        const body = this.scene.add.sprite(bodyStartX, startY, "snake-body", 1); 
        body.scale = this.spriteScale;
        this.snakeParts.push({
            sprite: body,
            position: { x: bodyStartX, y: startY },
        });

        const tailStartX = startX - (this.spriteSpacing * 2);
        const tail = this.scene.add.sprite(tailStartX, startY, "snake-body", 15); 
        tail.scale = this.spriteScale;
        this.snakeParts.push({
            sprite: tail,
            position: { x: tailStartX, y: startY },
        });
    }

    move(newDirection: "up" | "down" | "left" | "right"): void {
        const head = this.snakeParts[0].sprite;

        // Cập nhật hướng và animation
        if (this.canChangeDirection(newDirection)) {
            this.direction = newDirection;
            head.play(this.animations.head[newDirection]);
        }

        // Tính toán vị trí mới
        const newPosition = this.calculateNewPosition();

        // Di chuyển đầu rắn
        this.snakeParts[0].position = newPosition;
        head.setPosition(newPosition.x, newPosition.y);
    }

    private canChangeDirection(newDirection: string): boolean {
        if (this.direction === "up" && newDirection === "down") return false;
        if (this.direction === "down" && newDirection === "up") return false;
        if (this.direction === "left" && newDirection === "right") return false;
        if (this.direction === "right" && newDirection === "left") return false;
        return true;
    }

    private calculateNewPosition(): { x: number; y: number } {
        const currentHead = this.snakeParts[0].position;

        switch (this.direction) {
            case "up":
                return { x: currentHead.x, y: currentHead.y - this.spriteSize };
            case "down":
                return { x: currentHead.x, y: currentHead.y + this.spriteSize };
            case "left":
                return { x: currentHead.x - this.spriteSize, y: currentHead.y };
            case "right":
                return { x: currentHead.x + this.spriteSize, y: currentHead.y };
            default:
                return currentHead;
        }
    }

    grow(): void {
        const lastPart = this.snakeParts[this.snakeParts.length - 1];
        const newPart = this.scene.add.sprite(
            lastPart.position.x,
            lastPart.position.y,
            "snake-body"
        );

        // Chọn animation dựa trên hướng di chuyển
        const animation =
            this.direction === "left" || this.direction === "right"
                ? this.animations.body.horizontal
                : this.animations.body.vertical;

        newPart.play(animation);

        this.snakeParts.push({
            sprite: newPart,
            position: { ...lastPart.position },
        });
    }

    update(): void {
        // Cập nhật vị trí của các phần thân
        for (let i = this.snakeParts.length - 1; i > 0; i--) {
            const currentPart = this.snakeParts[i];
            const previousPart = this.snakeParts[i - 1];

            currentPart.position = { ...previousPart.position };
            currentPart.sprite.setPosition(
                currentPart.position.x,
                currentPart.position.y
            );
        }
    }

    destroy(): void {
        this.snakeParts.forEach((part) => part.sprite.destroy());
        this.snakeParts = [];
    }
}

