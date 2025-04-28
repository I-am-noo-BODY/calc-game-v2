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
        safeRadius: 150
    };

    // Player
    const player = {
        x: worldSize.width / 2,
        y: worldSize.height / 2,
        size: 20,
        speed: 5,
        health: 100,
        score: 0,
        lastAttack: 0,
        isSafe: false,
        healTimer: 0
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
            speed: type.speed,
            lastDirectionChange: 0
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
        if (player.isSafe) return;
        
        const now = Date.now();
        if (now - player.lastAttack < 300) return;
        player.lastAttack = now;

        // Attack enemies
        enemies.forEach((enemy, index) => {
            const dist = Math.sqrt(
                Math.pow(mouse.x - enemy.x, 2) + 
                Math.pow(mouse.y - enemy.y, 2)
            );
            
            if (dist < enemy.size) {
                enemy.health--;
                if (enemy.health <= 0) {
                    player.score += 10;
                    enemies.splice(index, 1);
                    spawnEnemy();
                }
                updateUI();
            }
        });

        // Collect coins
        assets.coins.forEach((coin, index) => {
            if (!coin.collected) {
                const dist = Math.sqrt(
                    Math.pow(mouse.x - coin.x, 2) + 
                    Math.pow(mouse.y - coin.y, 2)
                );
                if (dist < 30) {
                    coin.collected = true;
                    player.score += 5;
                    updateUI();
                }
            }
        });
    });

    function updateUI() {
        document.getElementById("score").textContent = player.score;
        document.getElementById("health").textContent = player.health;
    }

    function drawWorld() {
        // Draw background
        ctx.fillStyle = "#ecf0f1";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw lakes
        ctx.fillStyle = "#3498db";
        assets.lakes.forEach(lake => {
            if (isVisible(lake)) {
                ctx.fillRect(
                    lake.x - viewport.x,
                    lake.y - viewport.y,
                    lake.width,
                    lake.height
                );
            }
        });

        // Draw trees
        assets.trees.forEach(tree => {
            if (isVisible(tree)) {
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
            }
        });

        // Draw rocks
        ctx.fillStyle = "#7f8c8d";
        assets.rocks.forEach(rock => {
            if (isVisible(rock)) {
                ctx.beginPath();
                ctx.arc(
                    rock.x - viewport.x,
                    rock.y - viewport.y,
                    rock.size/2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        });

        // Draw coins
        assets.coins.forEach(coin => {
            if (!coin.collected && isVisible({x: coin.x, y: coin.y, size: 10})) {
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

        // Draw safe radius (visual indicator)
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

    function isVisible(obj) {
        return (
            obj.x + obj.size > viewport.x &&
            obj.x - obj.size < viewport.x + viewport.width &&
            obj.y + obj.size > viewport.y &&
            obj.y - obj.size < viewport.y + viewport.height
        );
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

        // Heal player when safe
        if (player.isSafe) {
            player.healTimer++;
            if (player.healTimer > 60 && player.health < 100) {
                player.health++;
                updateUI();
                player.healTimer = 0;
            }
        } else {
            player.healTimer = 0;
        }

        // Draw player
        ctx.fillStyle = "#3498db";
        ctx.beginPath();
        ctx.arc(
            player.x - viewport.x,
            player.y - viewport.y,
            player.size,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Update and draw enemies
        const now = Date.now();
        enemies.forEach(enemy => {
            // AI behavior
            if (!player.isSafe) {
                // Chase player when not in safe zone
                const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                enemy.x += Math.cos(angle) * enemy.speed;
                enemy.y += Math.sin(angle) * enemy.speed;
            } else {
                // Wander randomly when player is safe
                if (now - enemy.lastDirectionChange > 2000) {
                    enemy.randomAngle = Math.random() * Math.PI * 2;
                    enemy.lastDirectionChange = now;
                }
                enemy.x += Math.cos(enemy.randomAngle) * enemy.speed * 0.5;
                enemy.y += Math.sin(enemy.randomAngle) * enemy.speed * 0.5;
                
                // Keep enemies in bounds
                enemy.x = Math.max(enemy.size, Math.min(worldSize.width - enemy.size, enemy.x));
                enemy.y = Math.max(enemy.size, Math.min(worldSize.height - enemy.size, enemy.y));
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

        requestAnimationFrame(gameLoop);
    }

    updateUI();
    gameLoop();
}
