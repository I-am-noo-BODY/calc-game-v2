// Calculator Logic
let display = document.getElementById("display");

function appendToDisplay(value) {
    display.value += value;
}

function clearDisplay() {
    display.value = "";
}

function calculate() {
    try {
        const result = eval(display.value);
        display.value = result;
        
        if (display.value === "1337") {
            startGame();
        }
    } catch (error) {
        display.value = "Error";
    }
}

// RPG Game Logic
function startGame() {
    document.body.innerHTML = `
        <div class="game">
            <h1>SECRET ADVENTURE UNLOCKED!</h1>
            <div class="game-ui">
                <div class="stats">
                    <span>Score: <span id="score">0</span></span>
                    <span>Health: <span id="health">100</span>%</span>
                    <span id="safeStatus">DANGER</span>
                </div>
                <button onclick="location.reload()">Exit to Calculator</button>
            </div>
            <div class="game-container">
                <canvas id="gameCanvas" width="800" height="800"></canvas>
            </div>
        </div>
    `;

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const viewport = { x: 0, y: 0, width: 800, height: 800 };
    const worldSize = { width: 1600, height: 1600 };

    // Game Assets
    const assets = {
        trees: [],
        rocks: [],
        lakes: [],
        coins: []
    };

    // Generate World (same as before)

    // Safe House (same as before)

    // Player - now with more visible properties
    const player = {
        x: safeHouse.x,
        y: safeHouse.y,
        size: 25,  // Increased size
        speed: 5,
        health: 100,
        score: 0,
        isSafe: true,
        color: "#3498db",
        outlineColor: "#2c3e50",
        eyeColor: "white",
        isAlive: true,
        respawnTimer: 0,
        coinCollectionRange: 50
    };

    // Enemies (same as before)

    // Initialize (same as before)

    // Controls (same as before)

    function updateUI() {
        document.getElementById("score").textContent = player.score;
        document.getElementById("health").textContent = player.health;
    }

    function drawPlayer() {
        if (!player.isAlive) return;
        
        // Draw player body with outline
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(
            player.x - viewport.x,
            player.y - viewport.y,
            player.size,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.strokeStyle = player.outlineColor;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw player eyes (more visible)
        ctx.fillStyle = player.eyeColor;
        ctx.beginPath();
        ctx.arc(
            player.x - viewport.x - 8,
            player.y - viewport.y - 5,
            5,
            0,
            Math.PI * 2
        );
        ctx.arc(
            player.x - viewport.x + 8,
            player.y - viewport.y - 5,
            5,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Draw player mouth
        ctx.beginPath();
        ctx.arc(
            player.x - viewport.x,
            player.y - viewport.y + 5,
            8,
            0,
            Math.PI
        );
        ctx.stroke();
    }

    function drawWorld() {
        // Clear canvas
        ctx.fillStyle = "#ecf0f1";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw world elements (same as before)
    }

    function gameLoop() {
        // Update viewport (same as before)
        
        // Draw world first
        drawWorld();
        
        // Then draw player (now guaranteed to be visible)
        drawPlayer();
        
        // Then draw enemies and other elements (same as before)

        // Rest of game logic (same as before)
        
        requestAnimationFrame(gameLoop);
    }

    updateUI();
    gameLoop();
}
