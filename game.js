// لعبة Amir First Play - منطق اللعبة الأساسي

class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.player = null;
        this.targets = [];
        this.bullets = [];
        this.score = 0;
        this.lives = 3;
        this.gameRunning = false;
        this.keys = {};
        this.lastTime = 0;
        this.targetSpawnTimer = 0;
        this.highScore = localStorage.getItem('amirFirstPlayHighScore') || 0;
        
        this.init();
    }

    init() {
        // كشف نوع الجهاز
        this.detectDevice();
        
        // إعداد عناصر DOM
        this.setupDOM();
        
        // إعداد Canvas
        this.setupCanvas();
        
        // إعداد اللاعب
        this.setupPlayer();
        
        // إعداد أحداث التحكم
        this.setupControls();
        
        // بدء حلقة اللعبة
        this.gameLoop();
    }

    detectDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);
        
        if (isIOS) {
            document.body.classList.add('ios-device');
            document.getElementById('deviceInfo').innerHTML = 
                '📱 جهاز iOS - العب في المتصفح فقط';
        } else if (isAndroid) {
            document.body.classList.add('android-device');
            document.getElementById('deviceInfo').innerHTML = 
                '🤖 جهاز Android - يمكنك تحميل التطبيق أو اللعب في المتصفح';
        } else {
            document.getElementById('deviceInfo').innerHTML = 
                '💻 جهاز كمبيوتر - العب في المتصفح';
        }
    }

    setupDOM() {
        // أزرار التحكم
        document.getElementById('playBrowserBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('downloadAndroidBtn').addEventListener('click', () => {
            this.downloadAPK();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pauseGame();
        });
        
        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('backToMenuBtn').addEventListener('click', () => {
            this.backToMenu();
        });
        
        document.getElementById('quitBtn').addEventListener('click', () => {
            this.backToMenu();
        });
    }

    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // تعديل حجم Canvas للشاشات المختلفة
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        const maxWidth = Math.min(800, container.clientWidth - 40);
        const maxHeight = Math.min(600, window.innerHeight - 200);
        
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;
        this.canvas.style.width = maxWidth + 'px';
        this.canvas.style.height = maxHeight + 'px';
    }

    setupPlayer() {
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            width: 30,
            height: 30,
            speed: 5,
            color: '#4CAF50'
        };
    }

    setupControls() {
        // تحكم لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ') {
                e.preventDefault();
                this.shoot();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // تحكم اللمس للموبايل
        this.setupMobileControls();
    }

    setupMobileControls() {
        const controls = {
            'leftBtn': () => this.movePlayer(-1, 0),
            'rightBtn': () => this.movePlayer(1, 0),
            'upBtn': () => this.movePlayer(0, -1),
            'downBtn': () => this.movePlayer(0, 1),
            'shootBtn': () => this.shoot()
        };

        Object.keys(controls).forEach(id => {
            const btn = document.getElementById(id);
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                controls[id]();
            });
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                controls[id]();
            });
        });
    }

    startGame() {
        this.showScreen('gameScreen');
        this.gameRunning = true;
        this.score = 0;
        this.lives = 3;
        this.targets = [];
        this.bullets = [];
        this.updateUI();
        
        // إظهار أزرار التحكم على الموبايل
        if (window.innerWidth <= 768) {
            document.getElementById('mobileControls').style.display = 'grid';
        }
    }

    pauseGame() {
        this.gameRunning = false;
        this.showScreen('pauseScreen');
    }

    resumeGame() {
        this.gameRunning = true;
        this.showScreen('gameScreen');
    }

    restartGame() {
        this.startGame();
    }

    backToMenu() {
        this.gameRunning = false;
        this.showScreen('startScreen');
        document.getElementById('mobileControls').style.display = 'none';
    }

    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('amirFirstPlayHighScore', this.highScore);
            document.getElementById('highScoreText').textContent = 
                `🎉 رقم قياسي جديد! أعلى نقاط: ${this.highScore}`;
        } else {
            document.getElementById('highScoreText').textContent = 
                `أعلى نقاط: ${this.highScore}`;
        }
        
        this.showScreen('gameOverScreen');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    movePlayer(dx, dy) {
        if (!this.gameRunning) return;
        
        this.player.x += dx * this.player.speed;
        this.player.y += dy * this.player.speed;
        
        // منع اللاعب من الخروج من الشاشة
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
        this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
    }

    shoot() {
        if (!this.gameRunning) return;
        
        this.bullets.push({
            x: this.player.x + this.player.width / 2,
            y: this.player.y,
            width: 4,
            height: 10,
            speed: 8,
            color: '#FFD700'
        });
    }

    spawnTarget() {
        const isGood = Math.random() > 0.3; // 70% أهداف جيدة
        this.targets.push({
            x: Math.random() * (this.canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            speed: 2 + Math.random() * 3,
            color: isGood ? '#FF6B6B' : '#2196F3',
            isGood: isGood
        });
    }

    update(deltaTime) {
        if (!this.gameRunning) return;
        
        // تحديث حركة اللاعب
        if (this.keys['ArrowLeft'] || this.keys['a']) this.movePlayer(-1, 0);
        if (this.keys['ArrowRight'] || this.keys['d']) this.movePlayer(1, 0);
        if (this.keys['ArrowUp'] || this.keys['w']) this.movePlayer(0, -1);
        if (this.keys['ArrowDown'] || this.keys['s']) this.movePlayer(0, 1);
        
        // تحديث الرصاصات
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > -bullet.height;
        });
        
        // تحديث الأهداف
        this.targets = this.targets.filter(target => {
            target.y += target.speed;
            
            // إذا وصل الهدف لأسفل الشاشة
            if (target.y > this.canvas.height) {
                if (target.isGood) {
                    this.lives--;
                    if (this.lives <= 0) {
                        this.gameOver();
                    }
                }
                return false;
            }
            return true;
        });
        
        // فحص التصادمات
        this.checkCollisions();
        
        // إنتاج أهداف جديدة
        this.targetSpawnTimer += deltaTime;
        if (this.targetSpawnTimer > 1000) {
            this.spawnTarget();
            this.targetSpawnTimer = 0;
        }
        
        this.updateUI();
    }

    checkCollisions() {
        // تصادم الرصاصات مع الأهداف
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.targets.length - 1; j >= 0; j--) {
                if (this.isColliding(this.bullets[i], this.targets[j])) {
                    if (this.targets[j].isGood) {
                        this.score += 10;
                    } else {
                        this.score = Math.max(0, this.score - 5);
                        this.lives--;
                        if (this.lives <= 0) {
                            this.gameOver();
                            return;
                        }
                    }
                    this.bullets.splice(i, 1);
                    this.targets.splice(j, 1);
                    break;
                }
            }
        }
        
        // تصادم اللاعب مع الأهداف
        for (let i = this.targets.length - 1; i >= 0; i--) {
            if (this.isColliding(this.player, this.targets[i])) {
                if (this.targets[i].isGood) {
                    this.score += 5;
                } else {
                    this.lives--;
                    if (this.lives <= 0) {
                        this.gameOver();
                        return;
                    }
                }
                this.targets.splice(i, 1);
            }
        }
    }

    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    render() {
        // مسح الشاشة
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.gameRunning) return;
        
        // رسم اللاعب
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // رسم الرصاصات
        this.bullets.forEach(bullet => {
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        
        // رسم الأهداف
        this.targets.forEach(target => {
            this.ctx.fillStyle = target.color;
            this.ctx.fillRect(target.x, target.y, target.width, target.height);
        });
    }

    updateUI() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('livesValue').textContent = this.lives;
    }

    downloadAPK() {
        // محاكاة تحميل APK
        alert('🚧 التحميل قيد التطوير! سيتم إضافة رابط التحميل قريباً.');
    }

    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// بدء اللعبة عند تحميل الصفحة
window.addEventListener('load', () => {
    new Game();
});
