import Phaser from "phaser";
import { SNAKE_PART } from "../../constants/snake.constant";

interface SnakePart {
  sprite: Phaser.GameObjects.Sprite;
  position: { x: number; y: number };
}

type Direction = "up" | "down" | "left" | "right";
type BodyAnimKeys = "horizontal" | "vertical" | "turn";

export default class Snake {
  private scene: Phaser.Scene;
  private snakeParts: SnakePart[];
  private snakeMaps: number[];
  private direction: "up" | "down" | "left" | "right";
  private spriteSize: number;
  private spriteScale: number;
  private spriteSpacing: number;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private moveDelay: number;
  private lastMoveTime: number;
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

  private assets: {
    head: string;
    body: string;
  };

  private assetsKey: {
    head: string;
    body: string;
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.snakeParts = [];
    this.direction = "right";
    this.spriteSize = 16;
    this.spriteScale = 1;
    this.spriteSpacing = this.spriteScale * this.spriteSize;
    this.moveDelay = 100;
    this.lastMoveTime = 0;

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
    this.assets = {
      head: "SnakeHead/GreenHead.png",
      body: "SnakeBody/GreenBody.png",
    };
    this.assetsKey = {
      head: "snake-head",
      body: "snake-body",
    };
  }

  getFrameNumber(from: number, to: number): number[] {
    const length = to - from + 1;
    return Array.from({ length }, (_, index) => index + from);
  }

  preload(): void {
    this.scene.load.spritesheet(this.assetsKey.head, this.assets.head, {
      frameWidth: this.spriteSize,
      frameHeight: this.spriteSize,
    });

    this.scene.load.spritesheet(this.assetsKey.body, this.assets.body, {
      frameWidth: this.spriteSize,
      frameHeight: this.spriteSize,
    });
  }

  createAnimations(): void {
    this.scene.anims.create({
      key: this.animations.head.up,
      frames: this.scene.anims.generateFrameNumbers(this.assetsKey.head, {
        frames: this.getFrameNumber(0, 7),
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.scene.anims.create({
      key: this.animations.head.left,
      frames: this.scene.anims.generateFrameNumbers(this.assetsKey.head, {
        frames: this.getFrameNumber(17, 24),
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.scene.anims.create({
      key: this.animations.head.down,
      frames: this.scene.anims.generateFrameNumbers(this.assetsKey.head, {
        frames: this.getFrameNumber(32, 40),
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.scene.anims.create({
      key: this.animations.head.right,
      frames: this.scene.anims.generateFrameNumbers(this.assetsKey.head, {
        frames: this.getFrameNumber(49, 56),
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.scene.anims.create({
      key: this.animations.body.horizontal,
      frames: this.scene.anims.generateFrameNumbers(this.assetsKey.body, {
        frames: [0],
      }),
      //   frameRate: 6,
      //   repeat: -1,
    });

    // this.scene.anims.create({
    //     key: this.animations.body.vertical,
    //     frames: this.scene.anims.generateFrameNumbers(this.assetsKey.body, {
    //         frames: [4, 5, 6, 7],
    //     }),
    //     frameRate: 6,
    //     repeat: -1,
    // });
  }

  mappingAssets(part: number, x: number, y: number): void {
    let sprite;
    switch (part) {
      case SNAKE_PART.HEAD.UP:
        sprite = this.scene.add.sprite(x, y, this.assets.head);
        sprite.play(this.animations.head.up);
        break;
      case SNAKE_PART.HEAD.DOWN:
        sprite = this.scene.add.sprite(x, y, this.assets.head);
        sprite.play(this.animations.head.down);
        break;
      case SNAKE_PART.HEAD.LEFT:
        sprite = this.scene.add.sprite(x, y, this.assets.head);
        sprite.play(this.animations.head.left);
        break;
      case SNAKE_PART.HEAD.RIGHT:
        sprite = this.scene.add.sprite(x, y, this.assets.head);
        sprite.play(this.animations.head.right);
        break;
      case SNAKE_PART.BODY.HORIZONTAL:
        sprite = this.scene.add.sprite(x, y, this.assetsKey.body, 1);
        console.log(sprite);
        break;
      case SNAKE_PART.TAIL.LEFT:
        sprite = this.scene.add.sprite(x, y, this.assetsKey.body, 15);
        break;
      default:
        throw "snake part invalid";
    }

    if (!sprite) throw "invalid sprite";

    sprite.scale = this.spriteScale;
    this.snakeParts.push({
      sprite,
      position: { x, y },
    });
  }

  initializeSnake(): void {
    const startX = 200;
    const startY = 200;

    this.snakeMaps = [
      SNAKE_PART.HEAD.RIGHT,
      SNAKE_PART.BODY.HORIZONTAL,
      SNAKE_PART.TAIL.LEFT,
    ];

    this.snakeMaps.forEach((part, i) => {
      const x = startX - this.spriteSpacing * i;
      this.mappingAssets(part, x, startY);
    });

    this.cursors = this.scene.input?.keyboard?.createCursorKeys();
  }

  update(time: number): void {
    let newDirection = this.direction;
    if (this.cursors?.up.isDown && this.direction !== "down") {
      newDirection = "up";
    } else if (this.cursors?.down.isDown && this.direction !== "up") {
      newDirection = "down";
    } else if (this.cursors?.left.isDown && this.direction !== "right") {
      newDirection = "left";
    } else if (this.cursors?.right.isDown && this.direction !== "left") {
      newDirection = "right";
    }

    if (time - this.lastMoveTime > this.moveDelay) {
      this.move(newDirection);
      this.lastMoveTime = time;
    }
  }

  move(newDirection: "up" | "down" | "left" | "right"): void {
    const head = this.snakeParts[0].sprite;
    const oldDirection = this.direction;

    // Cập nhật hướng và animation
    if (this.canChangeDirection(newDirection)) {
      this.direction = newDirection;
      head.play(this.animations.head[newDirection]);
    }
    // Tính toán vị trí mới
    const newPosition = this.calculateNewPosition();

    newPosition.x =
      (newPosition.x + this.scene.scale.width) % this.scene.scale.width;
    newPosition.y =
      (newPosition.y + this.scene.scale.height) % this.scene.scale.height;

    // Di chuyển thân rắn
    for (let i = this.snakeParts.length - 1; i > 0; i--) {
      const currentPart = this.snakeParts[i];
      const previousPart = this.snakeParts[i - 1];

      currentPart.position = { ...previousPart.position };
      currentPart.sprite.setPosition(
        currentPart.position.x,
        currentPart.position.y
      );
    }

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
      this.assetsKey.body
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

  destroy(): void {
    this.snakeParts.forEach((part) => part.sprite.destroy());
    this.snakeParts = [];
  }
}
