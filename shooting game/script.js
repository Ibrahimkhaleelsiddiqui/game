(function() {
    const game = document.getElementById('game');
    const player = document.getElementById('player');
    const scoreboard = document.getElementById('scoreboard');
    const gameOverScreen = document.getElementById('gameOver');
    const finalScoreEl = document.getElementById('finalScore');
    const restartBtn = document.getElementById('restartBtn');

    const gameWidth = window.innerWidth;
    const gameHeight = window.innerHeight;

    // Player properties
    const playerWidth = 60;
    const playerHeight = 60;
    let playerX = gameWidth / 2 - playerWidth / 2;
    const playerSpeed = 7;

    // Movement controls
    let moveLeft = false;
    let moveRight = false;

    // Bullets
    const bullets = [];
    const bulletSpeed = 12;

    // Targets
    const targets = [];
    const targetSpeedInit = 1.2;
    let targetSpeed = targetSpeedInit;
    const targetSize = 50;
    const maxTargets = 5;
    const targetRowY = 70;

    // Game state
    let score = 0;
    let isGameOver = false;
    let animationFrameId;

    // Initialize player position
    function updatePlayerPosition() {
      if(moveLeft) {
        playerX -= playerSpeed;
      }
      if(moveRight) {
        playerX += playerSpeed;
      }
      // Boundaries
      if(playerX < 0) playerX = 0;
      if(playerX > gameWidth - playerWidth) playerX = gameWidth - playerWidth;

      player.style.left = playerX + 'px';
    }

    // Create bullet
    function createBullet() {
      const bullet = document.createElement('div');
      bullet.classList.add('bullet');
      bullet.style.left = playerX + playerWidth / 2 - 3 + 'px';
      bullet.style.top = gameHeight - playerHeight - 20 + 'px';
      game.appendChild(bullet);
      bullets.push(bullet);
    }

    // Update bullets position
    function updateBullets() {
      for(let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        let top = parseFloat(b.style.top);
        top -= bulletSpeed;
        if(top < -20) {
          // Remove bullet if off screen
          b.remove();
          bullets.splice(i, 1);
          continue;
        }
        b.style.top = top + 'px';

        // Check collision with targets
        for(let j = targets.length - 1; j >= 0; j--) {
          const t = targets[j];
          if(checkCollision(b, t)) {
            // Hit target
            increaseScore();
            // Remove target and bullet
            t.remove();
            targets.splice(j, 1);
            b.remove();
            bullets.splice(i, 1);
            break;
          }
        }
      }
    }

    // Create a target at random horizontal position
    function createTarget() {
      const target = document.createElement('div');
      target.classList.add('target');
      // Random x between 0 and (gameWidth - targetSize)
      const x = Math.random() * (gameWidth - targetSize);
      target.style.left = x + 'px';
      target.style.top = targetRowY + 'px';
      game.appendChild(target);
      targets.push(target);
      target.movingRight = Math.random() < 0.5;
      target.speed = targetSpeed;
    }

    // Update targets position
    function updateTargets() {
      for(let i = 0; i < targets.length; i++) {
        const t = targets[i];
        let x = parseFloat(t.style.left);
        if(t.movingRight) {
          x += t.speed;
          if(x > gameWidth - targetSize) {
            t.movingRight = false;
          }
        } else {
          x -= t.speed;
          if(x < 0) {
            t.movingRight = true;
          }
        }
        t.style.left = x + 'px';
      }
    }

    // Check for collision between two elements (rectangles)
    function checkCollision(el1, el2) {
      const r1 = el1.getBoundingClientRect();
      const r2 = el2.getBoundingClientRect();
      return !(
        r1.top > r2.bottom ||
        r1.bottom < r2.top ||
        r1.left > r2.right ||
        r1.right < r2.left
      );
    }

    // Increase score and update UI
    function increaseScore() {
      score += 10;
      scoreboard.textContent = 'Score: ' + score;
      // Increase difficulty every 100 points
      if(score % 100 === 0) {
        targetSpeed += 0.3;
      }
    }

    // Game loop
    function gameLoop() {
      if(isGameOver) return;

      updatePlayerPosition();
      updateBullets();
      updateTargets();

      // Spawn targets if fewer than max
      if(targets.length < maxTargets) {
        createTarget();
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    }

    // Event handlers
    function keyDownHandler(e) {
      if(e.code === 'ArrowLeft') {
        moveLeft = true;
      } else if(e.code === 'ArrowRight') {
        moveRight = true;
      } else if(e.code === 'Space') {
        e.preventDefault();
        if(!isGameOver) {
          createBullet();
        }
      }
    }
    function keyUpHandler(e) {
      if(e.code === 'ArrowLeft') {
        moveLeft = false;
      } else if(e.code === 'ArrowRight') {
        moveRight = false;
      }
    }

    // Game Over function
    function endGame() {
      isGameOver = true;
      // Show Game Over Screen
      finalScoreEl.textContent = score;
      gameOverScreen.style.display = 'block';
    }

    // For this simple game, end game if any target touches the bottom region near player
    function checkGameOver() {
      for(let t of targets) {
        const rect = t.getBoundingClientRect();
        if(rect.bottom > window.innerHeight - 80) {
          endGame();
          break;
        }
      }
    }

    // Restart game function
    function restartGame() {
      // Clear bullets
      bullets.forEach(b => b.remove());
      bullets.length = 0;
      // Clear targets
      targets.forEach(t => t.remove());
      targets.length = 0;
      score = 0;
      targetSpeed = targetSpeedInit;
      scoreboard.textContent = 'Score: 0';
      gameOverScreen.style.display = 'none';
      isGameOver = false;
      playerX = gameWidth / 2 - playerWidth / 2;
      animationFrameId = requestAnimationFrame(gameLoop);
    }

    // Periodically check for game over condition
    setInterval(() => {
      if(!isGameOver) {
        checkGameOver();
      }
    }, 100);

    restartBtn.addEventListener('click', () => {
      restartGame();
    });

    // Initialize player horizontal position
    player.style.left = playerX + 'px';

    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    // Start game loop
    animationFrameId = requestAnimationFrame(gameLoop);

    // Focus on game container to capture keyboard events
    game.focus();
    // Adjust on resize
    window.addEventListener('resize', () => {
      // We don't dynamically resize player's X for this version, but could improve later
    });
})();

