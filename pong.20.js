 class PongGame {
            constructor() {
                this.canvas = document.getElementById('gameCanvas');
                this.ctx = this.canvas.getContext('2d');
                this.width = this.canvas.width;
                this.height = this.canvas.height;
                
                // Scores
                this.leftScore = 0;
                this.rightScore = 0;
                this.leftScoreEl = document.getElementById('leftScore');
                this.rightScoreEl = document.getElementById('rightScore');
                
                // Constantes de jeu
                this.paddleSpeed = 12;
                this.ballSpeed = 8;
                this.paddleWidth = 10;
                this.paddleHeight = 100;
                this.ballSize = 20;
                
                // Objets du jeu
                this.leftPaddle = {
                    x: 20,
                    y: this.height / 2 - this.paddleHeight / 2,
                    width: this.paddleWidth,
                    height: this.paddleHeight
                };
                
                this.rightPaddle = {
                    x: this.width - 30,
                    y: this.height / 2 - this.paddleHeight / 2,
                    width: this.paddleWidth,
                    height: this.paddleHeight
                };
                
                this.ball = {
                    x: this.width / 2,
                    y: this.height / 2,
                    velX: this.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
                    velY: this.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
                    trail: []
                };
                
                // Fond ondulant
                this.waveTime = 0;
                this.waveSpeed = 0.05;
                
                // Confettis
                this.confetti = [];
                this.confettiColors = [
                    '#ff0000', '#00ff00', '#0000ff', '#ffff00',
                    '#ff00ff', '#00ffff', '#ffa500', '#8000ff'
                ];
                
                // Contrôles
                this.keys = {};
                this.setupControls();
                
                // Démarrer le jeu
                this.gameLoop();
            }
            
            setupControls() {
                document.addEventListener('keydown', (e) => {
                    this.keys[e.key.toLowerCase()] = true;
                });
                
                document.addEventListener('keyup', (e) => {
                    this.keys[e.key.toLowerCase()] = false;
                });
            }
            
            createWaveBackground() {
                const imageData = this.ctx.createImageData(this.width, this.height);
                const data = imageData.data;
                
                for (let x = 0; x < this.width; x += 4) {
                    for (let y = 0; y < this.height; y += 4) {
                        const wave1 = Math.sin(x * 0.01 + this.waveTime) * 0.5 + 0.5;
                        const wave2 = Math.sin(y * 0.015 + this.waveTime * 1.2) * 0.5 + 0.5;
                        const wave3 = Math.sin((x + y) * 0.008 + this.waveTime * 0.8) * 0.5 + 0.5;
                        
                        const waveFactor = (wave1 + wave2 + wave3) / 3;
                        
                        const pink = [255, 105, 180];
                        const blue = [30, 144, 255];
                        
                        const r = Math.floor(pink[0] * (1 - waveFactor) + blue[0] * waveFactor);
                        const g = Math.floor(pink[1] * (1 - waveFactor) + blue[1] * waveFactor);
                        const b = Math.floor(pink[2] * (1 - waveFactor) + blue[2] * waveFactor);
                        
                        for (let dx = 0; dx < 4 && x + dx < this.width; dx++) {
                            for (let dy = 0; dy < 4 && y + dy < this.height; dy++) {
                                const index = ((y + dy) * this.width + (x + dx)) * 4;
                                data[index] = r;
                                data[index + 1] = g;
                                data[index + 2] = b;
                                data[index + 3] = 255;
                            }
                        }
                    }
                }
                
                this.ctx.putImageData(imageData, 0, 0);
                this.waveTime += this.waveSpeed;
            }
            
            createConfettiExplosion(x, y) {
                for (let i = 0; i < 25; i++) {
                    this.confetti.push({
                        x: x,
                        y: y,
                        velX: (Math.random() - 0.5) * 16,
                        velY: Math.random() * -12 - 3,
                        color: this.confettiColors[Math.floor(Math.random() * this.confettiColors.length)],
                        life: 80,
                        maxLife: 80,
                        size: Math.random() * 4 + 4,
                        rotation: Math.random() * 360,
                        rotationSpeed: (Math.random() - 0.5) * 20,
                        gravity: 0.3
                    });
                }
            }
            
            updateConfetti() {
                for (let i = this.confetti.length - 1; i >= 0; i--) {
                    const c = this.confetti[i];
                    
                    c.x += c.velX;
                    c.y += c.velY;
                    c.velY += c.gravity;
                    c.velX *= 0.99;
                    c.rotation += c.rotationSpeed;
                    c.life--;
                    
                    if (c.life <= 0 || c.y > this.height + 100) {
                        this.confetti.splice(i, 1);
                    }
                }
            }
            
            drawConfetti() {
                this.confetti.forEach(c => {
                    const alpha = c.life / c.maxLife;
                    this.ctx.save();
                    this.ctx.globalAlpha = alpha;
                    this.ctx.translate(c.x, c.y);
                    this.ctx.rotate(c.rotation * Math.PI / 180);
                    this.ctx.fillStyle = c.color;
                    this.ctx.fillRect(-c.size/2, -c.size/2, c.size, c.size);
                    this.ctx.restore();
                });
            }
            
            handleInput() {
                // Joueur gauche
                if (this.keys['w'] && this.leftPaddle.y > 0) {
                    this.leftPaddle.y -= this.paddleSpeed;
                }
                if (this.keys['s'] && this.leftPaddle.y < this.height - this.paddleHeight) {
                    this.leftPaddle.y += this.paddleSpeed;
                }
                
                // Joueur droit
                if (this.keys['arrowup'] && this.rightPaddle.y > 0) {
                    this.rightPaddle.y -= this.paddleSpeed;
                }
                if (this.keys['arrowdown'] && this.rightPaddle.y < this.height - this.paddleHeight) {
                    this.rightPaddle.y += this.paddleSpeed;
                }
            }
            
            updateBall() {
                // Ajouter à la traînée
                this.ball.trail.push({x: this.ball.x + this.ballSize/2, y: this.ball.y + this.ballSize/2});
                if (this.ball.trail.length > 10) {
                    this.ball.trail.shift();
                }
                
                // Mouvement
                this.ball.x += this.ball.velX;
                this.ball.y += this.ball.velY;
                
                // Collision haut/bas
                if (this.ball.y <= 0 || this.ball.y >= this.height - this.ballSize) {
                    this.ball.velY = -this.ball.velY;
                    this.ball.velY *= 1.02;
                }
                
                // Collision raquette gauche
                if (this.ball.x <= this.leftPaddle.x + this.leftPaddle.width &&
                    this.ball.x + this.ballSize >= this.leftPaddle.x &&
                    this.ball.y <= this.leftPaddle.y + this.leftPaddle.height &&
                    this.ball.y + this.ballSize >= this.leftPaddle.y &&
                    this.ball.velX < 0) {
                    
                    this.ball.velX = -this.ball.velX * 1.02;
                    this.createConfettiExplosion(this.ball.x + this.ballSize/2, this.ball.y + this.ballSize/2);
                }
                
                // Collision raquette droite
                if (this.ball.x <= this.rightPaddle.x + this.rightPaddle.width &&
                    this.ball.x + this.ballSize >= this.rightPaddle.x &&
                    this.ball.y <= this.rightPaddle.y + this.rightPaddle.height &&
                    this.ball.y + this.ballSize >= this.rightPaddle.y &&
                    this.ball.velX > 0) {
                    
                    this.ball.velX = -this.ball.velX * 1.02;
                    this.createConfettiExplosion(this.ball.x + this.ballSize/2, this.ball.y + this.ballSize/2);
                }
                
                // Points marqués
                if (this.ball.x < 0) {
                    this.rightScore++;
                    this.rightScoreEl.textContent = this.rightScore;
                    this.resetBall();
                } else if (this.ball.x > this.width) {
                    this.leftScore++;
                    this.leftScoreEl.textContent = this.leftScore;
                    this.resetBall();
                }
            }
            
            resetBall() {
                this.ball.x = this.width / 2;
                this.ball.y = this.height / 2;
                this.ball.velX = this.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
                this.ball.velY = this.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
                this.ball.trail = [];
            }
            
            draw() {
                // Fond ondulant
                this.createWaveBackground();
                
                // Ligne centrale
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([10, 10]);
                this.ctx.beginPath();
                this.ctx.moveTo(this.width / 2, 0);
                this.ctx.lineTo(this.width / 2, this.height);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
                
                // Traînée de la balle
                this.ball.trail.forEach((pos, index) => {
                    const alpha = index / this.ball.trail.length * 0.6;
                    this.ctx.save();
                    this.ctx.globalAlpha = alpha;
                    this.ctx.fillStyle = 'white';
                    this.ctx.beginPath();
                    this.ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.restore();
                });
                
                // Raquettes avec effet de lueur
                this.ctx.fillStyle = 'white';
                this.ctx.fillRect(this.leftPaddle.x, this.leftPaddle.y, this.leftPaddle.width, this.leftPaddle.height);
                this.ctx.fillRect(this.rightPaddle.x, this.rightPaddle.y, this.rightPaddle.width, this.rightPaddle.height);
                
                this.ctx.strokeStyle = 'rgba(200, 200, 255, 0.8)';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(this.leftPaddle.x, this.leftPaddle.y, this.leftPaddle.width, this.leftPaddle.height);
                this.ctx.strokeRect(this.rightPaddle.x, this.rightPaddle.y, this.rightPaddle.width, this.rightPaddle.height);
                
                // Balle avec effet de lueur
                this.ctx.fillStyle = 'white';
                this.ctx.beginPath();
                this.ctx.arc(this.ball.x + this.ballSize/2, this.ball.y + this.ballSize/2, this.ballSize/2, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.strokeStyle = 'rgba(255, 255, 150, 0.8)';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
                
                // Confettis
                this.drawConfetti();
            }
            
            gameLoop() {
                this.handleInput();
                this.updateBall();
                this.updateConfetti();
                this.draw();
                
                requestAnimationFrame(() => this.gameLoop());
            }
        }
        
        // Démarrer le jeu quand la page est chargée
        window.addEventListener('load', () => {
            new PongGame();
        });
        
        // Empêcher le défilement avec les flèches
        window.addEventListener('keydown', (e) => {
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        });