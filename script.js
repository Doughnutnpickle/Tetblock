document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ Tetblock Loaded!");

    document.getElementById("singlePlayerBtn").addEventListener("click", () => startGame(false, false));
    document.getElementById("singlePlayerStakeBtn").addEventListener("click", () => openStakingMenu(false));
    document.getElementById("multiPlayerBtn").addEventListener("click", () => startGame(true, false));
    document.getElementById("multiPlayerStakeBtn").addEventListener("click", () => openStakingMenu(true));
    document.getElementById("restartBtn").addEventListener("click", () => location.reload());
    document.getElementById("cancelStakeBtn").addEventListener("click", () => closeStakingMenu());
});

// ✅ Start Game
function startGame(multiplayer, staking) {
    console.log(`🎮 startGame() called! Multiplayer: ${multiplayer}, Staking: ${staking}`);

    document.getElementById("menu").style.display = "none";
    document.getElementById("stakingMenu").style.display = "none";
    document.getElementById("game").style.display = "block";

    const gameCanvas = document.getElementById("gameCanvasP1");
    gameCanvas.style.display = "block";
    gameCanvas.width = 300;
    gameCanvas.height = 600;

    new TetblockGame("gameCanvasP1", "scoreP1");
}

// ✅ Tetblock Game With Touch Controls
class TetblockGame {
    constructor(canvasId, scoreId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.scoreElement = document.getElementById(scoreId);
        this.score = 0;

        this.rows = 20;
        this.cols = 10;
        this.blockSize = 30;

        this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
        this.currentPiece = this.createPiece();
        this.isRunning = true;

        this.initControls();
        this.initTouchControls(); // ✅ Add Touch Support
        this.gameLoop();
    }

    createPiece() {
        const shapes = [
            [[1, 1, 1, 1]], [[1, 1], [1, 1]], [[0, 1, 0], [1, 1, 1]], [[1, 1, 0], [0, 1, 1]], [[0, 1, 1], [1, 1, 0]]
        ];
        const colors = ["red", "blue", "green", "yellow", "purple"];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        return { shape, color: colors[Math.floor(Math.random() * colors.length)], x: 4, y: 0 };
    }

    rotatePiece() {
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );

        if (!this.checkCollision(0, 0, rotated)) {
            this.currentPiece.shape = rotated;
        }
    }

    drawGrid() {
        this.ctx.fillStyle = "#222"; // Dark gray background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.ctx.strokeStyle = "#555"; 
                this.ctx.strokeRect(col * this.blockSize, row * this.blockSize, this.blockSize, this.blockSize);

                if (this.grid[row][col]) {
                    this.ctx.fillStyle = this.grid[row][col];
                    this.ctx.fillRect(col * this.blockSize, row * this.blockSize, this.blockSize, this.blockSize);
                }
            }
        }
    }

    drawPiece() {
        this.ctx.fillStyle = this.currentPiece.color;
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    this.ctx.fillRect(
                        (this.currentPiece.x + col) * this.blockSize, 
                        (this.currentPiece.y + row) * this.blockSize, 
                        this.blockSize, this.blockSize
                    );
                }
            }
        }
    }

    checkCollision(dx, dy, newShape = this.currentPiece.shape) {
        return newShape.some((row, rowIndex) =>
            row.some((cell, colIndex) => {
                if (!cell) return false;
                const newX = this.currentPiece.x + colIndex + dx;
                const newY = this.currentPiece.y + rowIndex + dy;
                return (
                    newX < 0 || newX >= this.cols ||  
                    newY >= this.rows ||              
                    (newY >= 0 && this.grid[newY][newX])
                );
            })
        );
    }

    placePiece() {
        this.currentPiece.shape.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell) {
                    const gridX = this.currentPiece.x + colIndex;
                    const gridY = this.currentPiece.y + rowIndex;
                    if (gridY < 0) {
                        this.gameOver();
                    } else {
                        this.grid[gridY][gridX] = this.currentPiece.color;
                    }
                }
            });
        });

        this.clearRows();
        this.currentPiece = this.createPiece();
    }

    clearRows() {
        let clearedRows = 0;
        this.grid = this.grid.filter(row => {
            if (row.every(cell => cell)) {
                clearedRows++;
                return false;
            }
            return true;
        });

        while (this.grid.length < this.rows) {
            this.grid.unshift(Array(this.cols).fill(0));
        }

        if (clearedRows > 0) {
            this.score += clearedRows * 100;
            this.scoreElement.textContent = this.score;
        }
    }

    gameOver() {
        console.log("❌ GAME OVER!");
        this.isRunning = false;
        alert("Game Over! Your final score: " + this.score);
        location.reload();
    }

    movePiece(dx) {
        if (!this.checkCollision(dx, 0)) {
            this.currentPiece.x += dx;
        }
    }

    dropPiece() {
        if (!this.checkCollision(0, 1)) {
            this.currentPiece.y++;
        } else {
            this.placePiece();
        }
    }

    gameLoop() {
        if (this.isRunning) {
            this.dropPiece();
            this.drawGrid();
            this.drawPiece();
        }
        setTimeout(() => this.gameLoop(), 500);
    }

    initControls() {
        document.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") this.movePiece(-1);
            if (e.key === "ArrowRight") this.movePiece(1);
            if (e.key === "ArrowDown") this.dropPiece();
            if (e.key === "ArrowUp") this.rotatePiece();
        });
    }

    // ✅ Touch Controls for Mobile
    initTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;

        this.canvas.addEventListener("touchstart", (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.canvas.addEventListener("touchend", (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 20) this.movePiece(1); // Swipe Right
                else if (dx < -20) this.movePiece(-1); // Swipe Left
            } else {
                if (dy > 20) this.dropPiece(); // Swipe Down
                else this.rotatePiece(); // Tap to Rotate
            }
        });
    }
}