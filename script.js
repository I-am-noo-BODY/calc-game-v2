// Calculator Logic (unchanged)
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

// RPG Game Logic with all new features
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
    const worldSize = { width: 2000, height: 2000 };

    // Game Assets
    const assets = {
        trees: [],
        rocks: [],
        lakes: [],
        coins: []
    };

    // Safe House
    const safeHouse = {
        x: worldSize.width * 0.7,
        y: worldSize.height * 0.7,
        width: 120,
        height: 100,
        safeRadius: 150,
        noEnemyRadius: 250 // Enemies avoid this area
    };

    // Player
    const player = {
        x: worldSize.width / 2,
        y: worldSize.height / 2,
        size: 20,
        speed: 5,
        health: 100,
        score: 0,
        isSafe: false,
        healTimer: 0,
        coinCollectionRange: 50 // Auto-collect coins within this range
    };

    // Enemies
    const enemies = [];
    const enemyTypes = [
        { color: "#e74c3c", speed: 1.5, health: 2, size: 25, viewRange: 150 },
        { color: "#9b59b6", speed: 2, health: 1, size: 20, viewRange: 120 },
        { color: "#e67e22", speed: 1, health: 3, size: 30, viewRange: 180 }
    ];

    // Generate World
    function generateWorld() {
        // Generate trees, rocks, lakes (same as before)
        // Generate coins (same as before)
    }

    function spawnEnemy() {
        let x, y, validPosition;
        
        // Ensure enemies spawn away from safe house
        do {
            x = Math.random() * worldSize.width;
            y = Math.random() * worldSize.height;
            const distToHouse = Math.sqrt(
                Math.pow(x - safeHouse.x, 2) + 
                Math.pow(y - safeHouse.y, 2)
            );
            validPosition = distToHouse > safeHouse.noEnemyRadius;
        } while (!validPosition);

        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        enemies.push({
            x: x,
            y: y,
            size: type.size,
            color: type.color,
            health: type.health,
            maxHealth: type.health,
            speed: type.speed,
            viewRange: type.viewRange,
            isActive: false
        });
    }

    // Initialize
    generateWorld();
    for (let i = 0; i < 12; i++) spawnEnemy();

    // Controls (same as before)

    function updateUI() {
        document.getElementById("score").textContent = player.score;
        document.getElementById("health").textContent = player.health;
    }

    function drawWorld() {
        // Draw world elements (same as before)
    }

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update viewport to follow player
        viewport.x = player.x - canvas.width / 2;
        viewport.y = player.y - canvas.height / 2;
        viewport.x = Math.max(0, Math.min(worldSize.width - viewport.width, viewport.x));
        viewport.y = Math.max(0, Math.min(worldSize.height - viewport.height, viewport.y));

        // Draw world
        drawWorld();

        // Update player position
        if (keys.up) player.y -= player.speed;
        if (keys.left) player.x -= player.speed;
        if (keys.down) player.y += player.speed;
        if (keys.right) player.x += player.speed;

        // Boundary check
        player.x = Math.max(player.size, Math.min(worldSize.width - player.size, player.x));
        player.y = Math.max(player.size, Math.min(worldSize.height - player.size, player.y));

        // Safe house logic
        const distToHouse = Math.sqrt(
            Math.pow(player.x - safeHouse.x, 2) + 
            Math.pow(player.y - safeHouse.y, 2)
        );
        
        player.isSafe = distToHouse < safeHouse.safeRadius;
        document.getElementById("safeStatus").textContent = 
            player.isSafe ? "SAFE" : "DANGER";
        document.getElementById("safeStatus").style.color = 
            player.isSafe ? "#2ecc71" : "#e74c3c";

        // Auto-collect coins when near
        assets.coins.forEach((coin, index) => {
            if (!coin.collected) {
                const dist = Math.sqrt(
                    Math.pow(player.x - coin.x, 2) + 
                    Math.pow(player.y - coin.y, 2)
                );
                if (dist < player.coinCollectionRange) {
                    coin.collected = true;
                    player.score += 5;
                    updateUI();
                }
            }
        });

        // Update and draw enemies
        enemies.forEach(enemy => {
            const distToPlayer = Math.sqrt(
                Math.pow(player.x - enemy.x, 2) + 
                Math.pow(player.y - enemy.y, 2)
            );
            
            const distToHouse = Math.sqrt(
                Math.pow(enemy.x - safeHouse.x, 2) + 
                Math.pow(enemy.y - safeHouse.y, 2)
            );

            // Enemy stays away from house
            if (distToHouse < safeHouse.noEnemyRadius) {
                const angle = Math.atan2(
                    enemy.y - safeHouse.y, 
                    enemy.x - safeHouse.x
                );
                enemy.x += Math.cos(angle) * enemy.speed;
                enemy.y += Math.sin(angle) * enemy.speed;
            }
            // Enemy only chases if player is in view range and not in safe zone
            else if (distToPlayer < enemy.viewRange && !player.isSafe) {
                const angle = Math.atan2(
                    player.y - enemy.y, 
                    player.x - enemy.x
                );
                enemy.x += Math.cos(angle) * enemy.speed;
                enemy.y += Math.sin(angle) * enemy.speed;
                
                // Check for player collision (attack)
                if (distToPlayer < player.size + enemy.size) {
                    player.health = Math.max(0, player.health - 0.5);
                    updateUI();
                }
            }

            // Draw enemy (same as before)
        });

        // Heal player when safe
        if (player.isSafe && player.health < 100) {
            player.health = Math.min(100, player.health + 0.1);
            updateUI();
        }

        requestAnimationFrame(gameLoop);
    }

    updateUI();
    gameLoop();
}
