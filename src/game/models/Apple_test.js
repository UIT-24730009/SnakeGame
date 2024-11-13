import Phaser from 'phaser';

const GRID_SIZE = 20;
const APPLE_SIZE = 20;

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {}

  create() {
    this.apple = this.createApple();

    // Vi tri trung lap -> xac dinh lai vi tri cua apple
    this.repositionApple();
  }

  createApple() {
    const apple = this.add.sprite(0, 0, 'apple');
    apple.setOrigin(0);
    apple.setDisplaySize(APPLE_SIZE, APPLE_SIZE);
    return apple;
  }

  repositionApple() {
    let position;
    do {
      position = {
        x: Phaser.Math.Between(0, GRID_SIZE - 1) * APPLE_SIZE,
        y: Phaser.Math.Between(0, GRID_SIZE - 1) * APPLE_SIZE,
      };
    } while (this.isPositionOnSnake(position));

    this.apple.setPosition(position.x, position.y);
  }
}
