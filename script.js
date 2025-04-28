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
        
        // Secret game trigger
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
    const worldSize = { width: 2000, height: 2000 };

    // Game Assets
    const assets = {
        trees: [],
        rocks: [],
        lakes: [],
        coins: []
    };

    // Generate World
    function generateWorld() {
        // Trees
        for (let i = 0; i < 100; i++) {
            assets.trees.push({
                x: Math.random() * worldSize.width,
                y: Math.random() * worldSize.height,
                size: 15 + Math.random() * 20
            });
        }
        
        // Rocks
        for (let i = 0; i < 60; i++) {
            assets.rocks.push({
                x: Math.random() * worldSize.width,
                y: Math.random() * worldSize.height,
                size: 10 + Math.random() * 30
            });
        }
        
        // Lakes
        for (let i = 0; i < 8; i++) {
            assets.lakes.push({
                x: Math.random() * (worldSize.width - 300),
                y: Math.random() * (worldSize.height - 300),
                width: 100 + Math.random() * 200,
                height: 100 + Math.random() * 200
            });
        }
        
        // Coins
        for (let i = 0; i < 30; i++) {
            assets.coins.push({
                x: Math.random() * worldSize.width,
                y: Math.random() * worldSize.height,
                collected: false
            });
        }
    }

    // Player
    const player = {
        x: worldSize.width / 2,
        y: worldSize.height / 2,
        size: 20,
        speed: 5,
        health: 100,
        score: 0,
        lastAttack: 0
    };

    // Enemies
    const enemies = [];
    const enemyTypes = [
        { color: "#e74c3c", speed: 1.5, health: 2, size: 25 },
        { color: "#9b59b6", speed: 2, health: 1, size: 20 },
        { color: "#e67e22", speed: 1, health: 3, size: 30 }
    ];

    function spawnEnemy() {
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        enemies.push({
            x: Math.random() * worldSize.width,
            y: Math.random() * worldSize.height,
            size: type.size,
            color: type.color,
            health: type.health,
            maxHealth: type.health,
            speed: type.speed
        });
    }

    // Initialize
    generateWorld();
    for (let i = 0; i < 12; i++) spawnEnemy();

    // Controls
    const keys = {};
    const mouse = { x: 0, y: 0 };

    document.addEventListener("keydown", (e) => {
        if (e.key === "8") keys.up = true;
        if (e.key === "4") keys.left = true;
        if (e.key === "5") keys.down = true;
        if (e.key === "6") keys.right = true;
    });

    document.addEventListener("keyup", (e) => {
        if (e.key === "8") keys.up = false;
        if (e.key === "4") keys.left = false;
        if (e.key === "5") keys.down = false;
        if (e.key === "6") keys.right = false;
    });

    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left + viewport.x;
        mouse.y = e.clientY - rect.top + viewport.y;
    });

    canvas.addEventListener("click", (e) => {
        const now = Date.now();
        if (now - player.lastAttack < 300) return;
        player.lastAttack = now;

        // Attack enemies
        enemies.forEach((enemy, index) => {
            const dist = Math.sqrt(
                Math.pow(mouse.x - enemy.x, 2) + 
                Math.pow(mouse.y - enemy.y, 2)
           
