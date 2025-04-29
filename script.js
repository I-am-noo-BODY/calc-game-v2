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

    // Safe House
    const safeHouse = {
        x: worldSize.width * 0.7,
        y: worldSize.height * 0.7,
        width: 120,
        height: 100,
        safeRadius: 150,
        noEnemyRadius: 250
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
        coinCollectionRange: 50
    };

    // Enemies
    const enemies = [];
    const enemyTypes = [
        { color: "#e74c3c", speed: 1.5, health: 2, size: 25, viewRange: 150 },
        { color: "#9b59b6", speed: 2, health: 1, size: 20, viewRange: 120 },
        { color: "#e67e22", speed: 1, health: 3, size: 30, viewRange: 180 }
    ];

    function spawnEnemy() {
        let x, y, validPosition;
        
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
            originalX: x,
            originalY: y
        });
    }

    // Initialize
    generateWorld();
    for (let i = 0; i < 12; i++) spawnEnemy();

    // Controls
    const keys = {};
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

    function updateUI() {
        document.getElementById("score").textContent = player.score;
        document.getElementById("health").textContent = player.health;
    }

    function drawWorld() {
        // Clear canvas
        ctx.fillStyle = "#ecf0f1";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw lakes
        ctx.fillStyle = "#3498db";
        assets.lakes.forEach(lake => {
            ctx.fillRect(
                lake.x - viewport.x,
                lake.y - viewport.y,
                lake.width,
                lake.height
            );
        });

        // Draw trees
        assets.trees.forEach(tree => {
            // Trunk
            ctx.fillStyle = "#8b4513";
            ctx.fillRect(
                tree.x - viewport.x - 3,
                tree.y - viewport.y + tree.size/2,
                6,
                tree.size
            );
            
            // Leaves
            ctx.fillStyle = "#2ecc71";
            ctx.beginPath();
            ctx.arc(
                tree.x - viewport.x,
                tree.y - viewport.y,
                tree.size/2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });

        // Draw rocks
        ctx.fillStyle = "#7f8c8d";
        assets.rocks.forEach(rock => {
            ctx.beginPath();
            ctx.arc(
                rock.x - viewport.x,
                rock.y - viewport.y,
                rock.size/2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });

        // Draw coins
        assets.coins.forEach(coin => {
            if (!coin.collected) {
                ctx.fillStyle = "#f1c40f";
                ctx.beginPath();
                ctx.arc(
                    coin.x - viewport.x,
                    coin.y - viewport.y,
                    10,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                ctx.fillStyle = "#e67e22";
                ctx.beginPath();
                ctx.arc(
                    coin.x - viewport.x,
                    coin.y - viewport.y,
                    6,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        });

        // Draw safe house
        const houseColor = player.isSafe ? "#16a085" : "#1abc9c";
        ctx.fillStyle = houseColor;
        ctx.fillRect(
            safeHouse.x - viewport.x - safeHouse.width/2,
            safeHouse.y - viewport.y - safeHouse.height/2,
            safeHouse.width,
            safeHouse.height
        );
        
        // Draw roof
        ctx.fillStyle = "#c0392b";
        ctx.beginPath();
        ctx.moveTo(safeHouse.x - viewport.x - safeHouse.width/2, safeHouse.y - viewport.y - safeHouse.height/2);
        ctx.lineTo(safeHouse.x - viewport.x, safeHouse.y - viewport.y - safeHouse.height);
        ctx.lineTo(safeHouse.x - viewport.x + safeHouse.width/2, safeHouse.y - viewport.y - safeHouse.height/2);
        ctx.fill();

        // Draw door
        ctx.fillStyle = "#8b4513";
        ctx.fillRect(
            safeHouse.x - viewport.x - 15,
            safeHouse.y - viewport.y + 20,
            30,
            50
        );

        // Draw safe radius
        if (player.isSafe) {
            ctx.strokeStyle = "#2ecc71";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(
                safeHouse.x - viewport.x,
                safeHouse.y - viewport.y,
                safeHouse.safeRadius,
                0,
                Math.PI * 2
            );
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    function gameLoop() {
        // Update viewport
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

        // Auto-collect coins
        assets.coins.forEach((coin) => {
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

        // Update enemies
        enemies.forEach(enemy => {
            const distToPlayer = Math.sqrt(
                Math.pow(player.x - enemy.x, 2) + 
                Math.pow(player.y - enemy.y, 2)
            );
            
            const distToHouse = Math.sqrt(
                Math.pow(enemy.x - safeHouse.x, 2) + 
                Math.pow(enemy.y - safeHouse.y, 2)
            );

            // Stay away from house
            if (distToHouse < safeHouse.noEnemyRadius) {
                const angle = Math.atan2(
                    enemy.y - safeHouse.y, 
                    enemy.x - safeHouse.x
                );
                enemy.x += Math.cos(angle) * enemy.speed;
                enemy.y += Math.sin(angle) * enemy.speed;
            }
            // Return to original position if player not in view
            else if (distToPlayer > enemy.viewRange || player.isSafe) {
                const angle = Math.atan2(
                    enemy.originalY - enemy.y, 
                    enemy.originalX - enemy.x
                );
                const moveDist = Math.min(
                    Math.sqrt(
                        Math.pow(enemy.originalX - enemy.x, 2) + 
                        Math.pow(enemy.originalY - enemy.y, 2)
                    ),
                    enemy.speed * 0.3
                );
                enemy.x += Math.cos(angle) * moveDist;
                enemy.y += Math.sin(angle) * moveDist;
            }
            // Chase player if in view range
            else {
                const angle = Math.atan2(
                    player.y - enemy.y, 
                    player.x - enemy.x
                );
                enemy.x += Math.cos(angle) * enemy.speed;
                enemy.y += Math.sin(angle) * enemy.speed;
                
                // Attack if touching player
                if (distToPlayer < player.size + enemy.size) {
                    player.health = Math.max(0, player.health - 0.5);
                    updateUI();
                }
            }

            // Draw enemy
            ctx.fillStyle = enemy.color;
            ctx.beginPath();
            ctx.arc(
                enemy.x - viewport.x,
                enemy.y - viewport.y,
                enemy.size,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // Health bar
            ctx.fillStyle = "#000";
            ctx.fillRect(
                enemy.x - viewport.x - enemy.size,
                enemy.y - viewport.y - enemy.size - 10,
                enemy.size * 2,
                5
            );
            ctx.fillStyle = "#e74c3c";
            ctx.fillRect(
                enemy.x - viewport.x - enemy.size,
                enemy.y - viewport.y - enemy.size - 10,
                (enemy.size * 2) * (enemy.health / enemy.maxHealth),
                5
            );
        });

        // Heal when safe
        if (player.isSafe && player.health < 100) {
            player.health = Math.min(100, player.health + 0.1);
            updateUI();
        }

        requestAnimationFrame(gameLoop);
    }

    updateUI();
    gameLoop();
}
