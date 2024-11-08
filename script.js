// game.js
const GAME_CONFIG = {
    easy: {
        speed: 200,
        gridSize: 20
    },
    medium: {
        speed: 150,
        gridSize: 20
    },
    hard: {
        speed: 100,
        gridSize: 20
    }
};

const DIRECTION = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

class Snake {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.reset();
    }

    reset() {
        this.body = [
            { x: 10, y: 10 }
        ];
        this.direction = DIRECTION.RIGHT;
        this.nextDirection = DIRECTION.RIGHT;
        this.shouldGrow = false;
    }

    update() {
        this.direction = this.nextDirection;
        const head = {
            x: this.body[0].x + this.direction.x,
            y: this.body[0].y + this.direction.y
        };

        // Kiểm tra va chạm với tường
        if (head.x < 0) head.x = this.gridSize - 1;
        if (head.x >= this.gridSize) head.x = 0;
        if (head.y < 0) head.y = this.gridSize - 1;
        if (head.y >= this.gridSize) head.y = 0;

        this.body.unshift(head);

        // Chỉ xóa phần đuôi nếu không cần tăng trưởng
        if (!this.shouldGrow) {
            this.body.pop();
        } else {
            this.shouldGrow = false;
        }
    }

    grow() {
        this.shouldGrow = true;
    }

    setDirection(direction) {
        // Ngăn chặn di chuyển ngược hướng
        const isOpposite = (
            (this.direction === DIRECTION.UP && direction === DIRECTION.DOWN) ||
            (this.direction === DIRECTION.DOWN && direction === DIRECTION.UP) ||
            (this.direction === DIRECTION.LEFT && direction === DIRECTION.RIGHT) ||
            (this.direction === DIRECTION.RIGHT && direction === DIRECTION.LEFT)
        );

        if (!isOpposite) {
            this.nextDirection = direction;
        }
    }

    checkCollision() {
        const head = this.body[0];
        return this.body.slice(1).some(segment =>
            segment.x === head.x && segment.y === head.y
        );
    }
}

class Food {
    constructor(gridSize) {
        this.gridSize = gridSize;
        this.position = { x: 0, y: 0 };
        this.relocate();
    }

    relocate() {
        this.position = {
            x: Math.floor(Math.random() * this.gridSize),
            y: Math.floor(Math.random() * this.gridSize)
        };
    }

    isEatenBy(snake) {
        const head = snake.body[0];
        return head.x === this.position.x && head.y === this.position.y;
    }
}

class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = this.canvas.width / GAME_CONFIG.easy.gridSize;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.level = 'easy';
        this.gameLoop = null;
        this.isGameOver = false;
        this.setupGame();
    }

    setupGame() {
        const config = GAME_CONFIG[this.level];
        this.snake = new Snake(config.gridSize);
        this.food = new Food(config.gridSize);
        this.score = 0;
        this.isGameOver = false;
        this.bindControls();
        this.updateHighScoreDisplay();
        document.getElementById('currentScore').textContent = '0';
    }

    bindControls() {
        document.addEventListener('keydown', (e) => {
            if (this.isGameOver) return;

            switch(e.key) {
                case 'ArrowUp':
                    this.snake.setDirection(DIRECTION.UP);
                    break;
                case 'ArrowDown':
                    this.snake.setDirection(DIRECTION.DOWN);
                    break;
                case 'ArrowLeft':
                    this.snake.setDirection(DIRECTION.LEFT);
                    break;
                case 'ArrowRight':
                    this.snake.setDirection(DIRECTION.RIGHT);
                    break;
            }
        });
    }

    start() {
        if (this.gameLoop) this.stop();
        this.setupGame();
        const config = GAME_CONFIG[this.level];
        this.gameLoop = setInterval(() => this.update(), config.speed);
    }

    stop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    update() {
        if (this.isGameOver) return;

        this.snake.update();

        if (this.food.isEatenBy(this.snake)) {
            this.snake.grow();
            this.food.relocate();
            this.updateScore(10);
        }

        if (this.snake.checkCollision()) {
            this.gameOver();
            return;
        }

        this.draw();
    }
    //design
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);


        this.drawGrid();

        this.snake.body.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#4CAF50' : '#81C784';
            this.ctx.fillRect(
                segment.x * this.cellSize,
                segment.y * this.cellSize,
                this.cellSize - 1,
                this.cellSize - 1
            );
        });

        this.ctx.fillStyle = '#FF5722';
        this.ctx.beginPath();
        this.ctx.arc(
            (this.food.position.x * this.cellSize) + (this.cellSize / 2),
            (this.food.position.y * this.cellSize) + (this.cellSize / 2),
            this.cellSize / 2 - 1,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    drawGrid() {
        this.ctx.strokeStyle = '#E0E0E0';
        this.ctx.lineWidth = 0.5;

        for (let i = 0; i <= GAME_CONFIG[this.level].gridSize; i++) {
            // Vẽ đường dọc
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.canvas.height);
            this.ctx.stroke();

            // Vẽ đường ngang
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
        }
    }

    updateScore(points) {
        this.score += points;
        document.getElementById('currentScore').textContent = this.score;

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateHighScoreDisplay();
        }
    }

    updateHighScoreDisplay() {
        document.getElementById('highScore').textContent = this.highScore;
    }

    gameOver() {
        this.isGameOver = true;
        this.stop();

        // Vẽ màn hình game over
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 30);
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);

        setTimeout(() => {
            if (confirm('Game Over! Play again?')) {
                this.start();
            }
        }, 500);
    }

    setLevel(level) {
        this.level = level;
        if (this.gameLoop) {
            this.stop();
            this.start();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game('gameCanvas');

    document.getElementById('startGame').addEventListener('click', () => {
        game.start();
    });

    document.getElementById('level').addEventListener('change', (e) => {
        game.setLevel(e.target.value);
    });
});