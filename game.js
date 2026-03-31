// ──────────────────────────────────────────────
//  Bird Blaster — исправленная версия
//  Ассеты генерируются через Canvas (не нужны PNG)
// ──────────────────────────────────────────────

// ── Утилита: создать текстуру через offscreen canvas ──
function makeTexture(scene, key, w, h, drawFn) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  drawFn(ctx, w, h);
  scene.textures.addCanvas(key, canvas);
}

// ══════════════════════════════════════════════
//  СЦЕНА: Загрузка ассетов
// ══════════════════════════════════════════════
class BootScene extends Phaser.Scene {
  constructor() { super("BootScene"); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // ── Фон: небо + облака + трава ──
    makeTexture(this, "bg", W, H, (ctx, w, h) => {
      // Небо
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.75);
      skyGrad.addColorStop(0, "#0a1628");
      skyGrad.addColorStop(0.4, "#1a3a5c");
      skyGrad.addColorStop(1, "#2d6a9f");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Луна
      ctx.save();
      ctx.shadowColor = "rgba(255,255,200,0.6)";
      ctx.shadowBlur = 30;
      ctx.fillStyle = "#fffde7";
      ctx.beginPath();
      ctx.arc(w * 0.8, h * 0.12, 38, 0, Math.PI * 2);
      ctx.fill();
      // Кратеры
      ctx.fillStyle = "rgba(0,0,0,0.07)";
      [[0.78, 0.09, 8], [0.83, 0.14, 5], [0.80, 0.16, 4]].forEach(([rx, ry, r]) => {
        ctx.beginPath(); ctx.arc(w * rx, h * ry, r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();

      // Звёзды
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      for (let i = 0; i < 80; i++) {
        const sx = Math.random() * w;
        const sy = Math.random() * h * 0.55;
        const sr = Math.random() * 1.5 + 0.3;
        ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
      }

      // Облака
      function drawCloud(cx, cy, scale) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        [[0,0,50],[40,-10,35],[-40,-5,35],[70,5,28],[-70,5,28]].forEach(([ox, oy, r]) => {
          ctx.beginPath(); ctx.arc(ox, oy, r, 0, Math.PI * 2); ctx.fill();
        });
        ctx.restore();
      }
      drawCloud(w * 0.2, h * 0.18, 1.2);
      drawCloud(w * 0.65, h * 0.12, 0.9);
      drawCloud(w * 0.5, h * 0.28, 1.4);
      drawCloud(w * 0.15, h * 0.35, 0.8);
      drawCloud(w * 0.82, h * 0.32, 1.0);

      // Горизонт — деревья
      ctx.fillStyle = "#0d2b0d";
      ctx.fillRect(0, h * 0.75, w, h * 0.25);

      // Ёлки
      function drawTree(tx, ty, size) {
        ctx.fillStyle = "#0a3d0a";
        for (let layer = 0; layer < 3; layer++) {
          const lw = size * (1.2 - layer * 0.2);
          const lh = size * 0.45;
          const ly = ty - layer * size * 0.3;
          ctx.beginPath();
          ctx.moveTo(tx, ly - lh);
          ctx.lineTo(tx - lw / 2, ly);
          ctx.lineTo(tx + lw / 2, ly);
          ctx.closePath();
          ctx.fill();
        }
      }
      for (let tx = 20; tx < w; tx += Phaser.Math.Between ? 45 : 45) {
        const tsize = 40 + (tx * 17 % 30);
        drawTree(tx, h * 0.75, tsize);
      }

      // Трава
      const grassGrad = ctx.createLinearGradient(0, h * 0.75, 0, h);
      grassGrad.addColorStop(0, "#1a4d1a");
      grassGrad.addColorStop(1, "#0d2b0d");
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, h * 0.75, w, h * 0.25);
    });

    // ── Пушка ──
    makeTexture(this, "gun", 100, 140, (ctx) => {
      // Подставка
      const baseGrad = ctx.createLinearGradient(10, 100, 90, 140);
      baseGrad.addColorStop(0, "#555");
      baseGrad.addColorStop(1, "#333");
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.moveTo(15, 140); ctx.lineTo(85, 140);
      ctx.lineTo(78, 105); ctx.lineTo(22, 105);
      ctx.closePath(); ctx.fill();

      // Тело
      const bodyGrad = ctx.createLinearGradient(20, 60, 80, 110);
      bodyGrad.addColorStop(0, "#7ecfff");
      bodyGrad.addColorStop(0.5, "#4aa8e8");
      bodyGrad.addColorStop(1, "#1a78c2");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(22, 60, 56, 50, 10);
      ctx.fill();

      // Детали тела
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(28, 65, 44, 35, 6); ctx.stroke();

      // Индикаторы
      ["#ff4444", "#ffaa00", "#44ff88"].forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(35 + i * 14, 87, 4, 0, Math.PI * 2); ctx.fill();
      });

      // Ствол
      const barrelGrad = ctx.createLinearGradient(38, 0, 62, 0);
      barrelGrad.addColorStop(0, "#888");
      barrelGrad.addColorStop(0.5, "#bbb");
      barrelGrad.addColorStop(1, "#888");
      ctx.fillStyle = barrelGrad;
      ctx.beginPath(); ctx.roundRect(38, 5, 24, 58, 5); ctx.fill();

      // Дуло
      ctx.fillStyle = "#222";
      ctx.beginPath(); ctx.roundRect(36, 2, 28, 18, 4); ctx.fill();

      // Свечение дула
      const glowGrad = ctx.createRadialGradient(50, 10, 2, 50, 10, 14);
      glowGrad.addColorStop(0, "rgba(100,200,255,0.8)");
      glowGrad.addColorStop(1, "rgba(100,200,255,0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath(); ctx.arc(50, 10, 14, 0, Math.PI * 2); ctx.fill();
    });

    // ── Птица синяя (обычная) ──
    makeTexture(this, "birdBlue", 80, 60, (ctx) => {
      // Тело
      const bodyGrad = ctx.createRadialGradient(38, 30, 5, 38, 30, 28);
      bodyGrad.addColorStop(0, "#64b5f6");
      bodyGrad.addColorStop(1, "#1565c0");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.ellipse(38, 32, 28, 20, 0, 0, Math.PI * 2); ctx.fill();

      // Крыло
      ctx.fillStyle = "#0d47a1";
      ctx.beginPath();
      ctx.moveTo(25, 28); ctx.quadraticCurveTo(20, 12, 45, 18); ctx.quadraticCurveTo(35, 26, 25, 28);
      ctx.fill();
      ctx.fillStyle = "#1976d2";
      ctx.beginPath();
      ctx.moveTo(28, 27); ctx.quadraticCurveTo(24, 15, 44, 20); ctx.quadraticCurveTo(35, 25, 28, 27);
      ctx.fill();

      // Хвост
      ctx.fillStyle = "#1565c0";
      ctx.beginPath(); ctx.moveTo(66, 28); ctx.lineTo(78, 18); ctx.lineTo(76, 32); ctx.lineTo(78, 44); ctx.lineTo(66, 38); ctx.closePath(); ctx.fill();

      // Голова
      const headGrad = ctx.createRadialGradient(15, 26, 3, 15, 26, 15);
      headGrad.addColorStop(0, "#82c5ff");
      headGrad.addColorStop(1, "#1976d2");
      ctx.fillStyle = headGrad;
      ctx.beginPath(); ctx.arc(15, 28, 14, 0, Math.PI * 2); ctx.fill();

      // Хохолок
      ctx.fillStyle = "#0d47a1";
      ctx.beginPath(); ctx.moveTo(8, 16); ctx.quadraticCurveTo(5, 6, 15, 10); ctx.quadraticCurveTo(18, 6, 22, 15); ctx.quadraticCurveTo(18, 12, 14, 16); ctx.closePath(); ctx.fill();

      // Клюв
      ctx.fillStyle = "#ff8f00";
      ctx.beginPath(); ctx.moveTo(2, 27); ctx.lineTo(-2, 31); ctx.lineTo(6, 31); ctx.closePath(); ctx.fill();

      // Глаз
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(10, 24, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#111";
      ctx.beginPath(); ctx.arc(9, 24, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(8, 23, 1.2, 0, Math.PI * 2); ctx.fill();
    });

    // ── Птица красная (быстрая) ──
    makeTexture(this, "birdRed", 80, 60, (ctx) => {
      const bodyGrad = ctx.createRadialGradient(38, 30, 5, 38, 30, 28);
      bodyGrad.addColorStop(0, "#ef9a9a");
      bodyGrad.addColorStop(1, "#b71c1c");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.ellipse(38, 32, 28, 20, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = "#7f0000";
      ctx.beginPath();
      ctx.moveTo(25, 28); ctx.quadraticCurveTo(20, 12, 45, 18); ctx.quadraticCurveTo(35, 26, 25, 28);
      ctx.fill();
      ctx.fillStyle = "#c62828";
      ctx.beginPath();
      ctx.moveTo(28, 27); ctx.quadraticCurveTo(24, 15, 44, 20); ctx.quadraticCurveTo(35, 25, 28, 27);
      ctx.fill();

      ctx.fillStyle = "#7f0000";
      ctx.beginPath(); ctx.moveTo(66, 28); ctx.lineTo(78, 18); ctx.lineTo(76, 32); ctx.lineTo(78, 44); ctx.lineTo(66, 38); ctx.closePath(); ctx.fill();

      const headGrad = ctx.createRadialGradient(15, 26, 3, 15, 26, 15);
      headGrad.addColorStop(0, "#ff8a80");
      headGrad.addColorStop(1, "#c62828");
      ctx.fillStyle = headGrad;
      ctx.beginPath(); ctx.arc(15, 28, 14, 0, Math.PI * 2); ctx.fill();

      // Гребень
      ctx.fillStyle = "#7f0000";
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(10 + i * 5, 16); ctx.lineTo(8 + i * 5, 6 - i * 2); ctx.lineTo(14 + i * 5, 14); ctx.closePath(); ctx.fill();
      }

      ctx.fillStyle = "#ff8f00";
      ctx.beginPath(); ctx.moveTo(2, 27); ctx.lineTo(-2, 31); ctx.lineTo(6, 31); ctx.closePath(); ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(10, 24, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#111";
      ctx.beginPath(); ctx.arc(9, 24, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(8, 23, 1.2, 0, Math.PI * 2); ctx.fill();

      // Злые брови
      ctx.strokeStyle = "#7f0000";
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(5, 19); ctx.lineTo(14, 22); ctx.stroke();
    });

    // ── Птица золотая (бонусная) ──
    makeTexture(this, "birdGold", 90, 70, (ctx) => {
      // Аура
      const aura = ctx.createRadialGradient(42, 35, 10, 42, 35, 42);
      aura.addColorStop(0, "rgba(255,215,0,0.3)");
      aura.addColorStop(1, "rgba(255,215,0,0)");
      ctx.fillStyle = aura;
      ctx.beginPath(); ctx.arc(42, 35, 42, 0, Math.PI * 2); ctx.fill();

      const bodyGrad = ctx.createRadialGradient(40, 36, 5, 40, 36, 30);
      bodyGrad.addColorStop(0, "#fff176");
      bodyGrad.addColorStop(0.5, "#fdd835");
      bodyGrad.addColorStop(1, "#e65100");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.ellipse(40, 37, 30, 22, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = "#bf360c";
      ctx.beginPath();
      ctx.moveTo(26, 32); ctx.quadraticCurveTo(20, 14, 48, 20); ctx.quadraticCurveTo(38, 30, 26, 32);
      ctx.fill();
      ctx.fillStyle = "#e65100";
      ctx.beginPath();
      ctx.moveTo(29, 31); ctx.quadraticCurveTo(24, 17, 47, 22); ctx.quadraticCurveTo(38, 29, 29, 31);
      ctx.fill();

      ctx.fillStyle = "#bf360c";
      ctx.beginPath(); ctx.moveTo(70, 32); ctx.lineTo(84, 20); ctx.lineTo(82, 36); ctx.lineTo(84, 50); ctx.lineTo(70, 44); ctx.closePath(); ctx.fill();

      const headGrad = ctx.createRadialGradient(16, 30, 3, 16, 30, 17);
      headGrad.addColorStop(0, "#fff9c4");
      headGrad.addColorStop(1, "#f9a825");
      ctx.fillStyle = headGrad;
      ctx.beginPath(); ctx.arc(16, 32, 16, 0, Math.PI * 2); ctx.fill();

      // Корона
      ctx.fillStyle = "#fdd835";
      ctx.beginPath();
      ctx.moveTo(4, 18); ctx.lineTo(6, 8); ctx.lineTo(11, 14); ctx.lineTo(16, 4); ctx.lineTo(21, 14); ctx.lineTo(26, 8); ctx.lineTo(28, 18); ctx.closePath(); ctx.fill();
      // Камни короны
      ["#ff1744", "#00e5ff", "#76ff03"].forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(9 + i * 9, 14, 3, 0, Math.PI * 2); ctx.fill();
      });

      ctx.fillStyle = "#e65100";
      ctx.beginPath(); ctx.moveTo(2, 31); ctx.lineTo(-3, 35); ctx.lineTo(7, 36); ctx.closePath(); ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(10, 27, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#111";
      ctx.beginPath(); ctx.arc(9, 27, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(8, 26, 1.5, 0, Math.PI * 2); ctx.fill();

      // Блёстки
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      [[55, 20], [65, 38], [48, 45], [72, 28]].forEach(([sx, sy]) => {
        ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI * 2); ctx.fill();
      });
    });

    // ── Пуля ──
    makeTexture(this, "bullet", 20, 30, (ctx) => {
      const grad = ctx.createLinearGradient(0, 30, 0, 0);
      grad.addColorStop(0, "#00e5ff");
      grad.addColorStop(0.5, "#ffffff");
      grad.addColorStop(1, "rgba(0,229,255,0)");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.ellipse(10, 15, 6, 14, 0, 0, Math.PI * 2); ctx.fill();

      const glow = ctx.createRadialGradient(10, 15, 2, 10, 15, 10);
      glow.addColorStop(0, "rgba(0,229,255,0.6)");
      glow.addColorStop(1, "rgba(0,229,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(10, 15, 10, 0, Math.PI * 2); ctx.fill();
    });

    // ── Вспышка попадания ──
    makeTexture(this, "hit", 90, 90, (ctx) => {
      // Лучи
      ctx.save(); ctx.translate(45, 45);
      for (let i = 0; i < 8; i++) {
        ctx.save(); ctx.rotate((i * Math.PI * 2) / 8);
        const rayGrad = ctx.createLinearGradient(0, 0, 0, -42);
        rayGrad.addColorStop(0, "rgba(255,220,0,0.9)");
        rayGrad.addColorStop(1, "rgba(255,100,0,0)");
        ctx.fillStyle = rayGrad;
        ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.lineTo(2, -42); ctx.lineTo(-2, -42); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      const coreGrad = ctx.createRadialGradient(45, 45, 3, 45, 45, 28);
      coreGrad.addColorStop(0, "rgba(255,255,255,1)");
      coreGrad.addColorStop(0.3, "rgba(255,220,0,0.9)");
      coreGrad.addColorStop(0.7, "rgba(255,80,0,0.6)");
      coreGrad.addColorStop(1, "rgba(255,0,0,0)");
      ctx.fillStyle = coreGrad;
      ctx.beginPath(); ctx.arc(45, 45, 28, 0, Math.PI * 2); ctx.fill();
    });

    this.scene.start("MenuScene");
  }
}

// ══════════════════════════════════════════════
//  СЦЕНА: Меню
// ══════════════════════════════════════════════
class MenuScene extends Phaser.Scene {
  constructor() { super("MenuScene"); }

  create() {
    const { width: W, height: H } = this.scale;

    this.add.image(W / 2, H / 2, "bg").setDisplaySize(W, H);

    // Заголовок
    this.add.text(W / 2, H * 0.22, "BIRD", {
      fontSize: "110px", color: "#FFD700",
      stroke: "#000", strokeThickness: 12,
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.33, "BLASTER", {
      fontSize: "80px", color: "#00e5ff",
      stroke: "#000", strokeThickness: 10,
      fontStyle: "bold"
    }).setOrigin(0.5);

    // Демо-птицы с иконками
    const birds = [
      { key: "birdBlue",  pts: "100",  x: W * 0.2,  label: "обычная" },
      { key: "birdRed",   pts: "150",  x: W * 0.5,  label: "быстрая" },
      { key: "birdGold",  pts: "300",  x: W * 0.8,  label: "бонусная" },
    ];

    birds.forEach(({ key, pts, x, label }) => {
      const img = this.add.image(x, H * 0.52, key).setScale(0.9);
      this.tweens.add({ targets: img, y: H * 0.52 - 12, duration: 1000 + Math.random() * 400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      this.add.text(x, H * 0.59, `+${pts} pts`, { fontSize: "28px", color: "#FFD700", stroke: "#000", strokeThickness: 4 }).setOrigin(0.5);
      this.add.text(x, H * 0.63, label, { fontSize: "22px", color: "#fff", stroke: "#000", strokeThickness: 3 }).setOrigin(0.5);
    });

    // Описание управления
    this.add.text(W / 2, H * 0.72, "ТАП = ВЫСТРЕЛ", {
      fontSize: "32px", color: "#fff",
      stroke: "#000", strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.77, "не дай птицам улететь!", {
      fontSize: "24px", color: "#aef",
      stroke: "#000", strokeThickness: 4
    }).setOrigin(0.5);

    // Кнопка старт
    const btnBg = this.add.rectangle(W / 2, H * 0.87, 340, 80, 0x00e5ff).setStrokeStyle(4, 0xffffff);
    const btnText = this.add.text(W / 2, H * 0.87, "ИГРАТЬ!", {
      fontSize: "48px", color: "#000",
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.tweens.add({ targets: [btnBg, btnText], scaleX: 1.04, scaleY: 1.04, duration: 700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on("pointerdown", () => this.scene.start("GameScene"));
    this.input.on("pointerdown", () => this.scene.start("GameScene"));
  }
}

// ══════════════════════════════════════════════
//  СЦЕНА: Игра
// ══════════════════════════════════════════════
class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  init() {
    // Сброс состояния при каждом старте сцены
    this.score = 0;
    this.lives = 3;
    this.timeLeft = 60;
    this.isGameOver = false;
  }

  create() {
    const { width: W, height: H } = this.scale;

    // Фон
    this.add.image(W / 2, H / 2, "bg").setDisplaySize(W, H);

    // Группы
    this.birds = this.physics.add.group();
    this.bullets = this.physics.add.group();

    // Пушка
    this.gun = this.add.image(W / 2, H - 110, "gun");
    this.gun.setOrigin(0.5, 0.85).setScale(0.55);

    // HUD — панель сверху
    this.add.rectangle(W / 2, 55, W, 110, 0x000000, 0.45);

    this.timeText = this.add.text(30, 25, "⏱ 60", {
      fontSize: "38px", color: "#00e5ff",
      stroke: "#000", strokeThickness: 5
    });

    this.scoreText = this.add.text(W / 2, 25, "SCORE: 0", {
      fontSize: "38px", color: "#FFD700",
      stroke: "#000", strokeThickness: 5
    }).setOrigin(0.5, 0);

    this.livesText = this.add.text(W - 25, 25, "❤❤❤", {
      fontSize: "32px", color: "#ff4d4d",
      stroke: "#000", strokeThickness: 4
    }).setOrigin(1, 0);

    // Коллизии
    this.physics.add.overlap(this.bullets, this.birds, this.handleBulletHitBird, null, this);

    // Выстрел
    this.input.on("pointerdown", (pointer) => {
      if (this.isGameOver) return;
      this.shoot(pointer.x, pointer.y);
    });

    // Спавн птиц
    this.spawnEvent = this.time.addEvent({
      delay: 1200, callback: this.spawnBird, callbackScope: this, loop: true
    });

    // Таймер
    this.timerEvent = this.time.addEvent({
      delay: 1000, callback: this.updateGameTimer, callbackScope: this, loop: true
    });
  }

  update() {
    if (this.isGameOver) return;
    const { width: W, height: H } = this.scale;

    this.bullets.children.each((b) => {
      if (!b.active) return;
      if (b.x < -60 || b.x > W + 60 || b.y < -60 || b.y > H + 60) b.destroy();
    });

    this.birds.children.each((bird) => {
      if (!bird.active) return;
      // FIX: проверяем вылет и вниз тоже
      if (bird.x < -130 || bird.x > W + 130 || bird.y < -130 || bird.y > H + 130) {
        bird.destroy();
        this.loseLife();
      }
    });
  }

  shoot(tx, ty) {
    const gx = this.gun.x;
    const gy = this.gun.y - 40;

    const angle = Phaser.Math.Angle.Between(gx, gy, tx, ty);
    this.gun.setRotation(angle + Math.PI / 2);

    const bullet = this.bullets.create(gx, gy, "bullet");
    bullet.setScale(0.9);
    this.physics.moveTo(bullet, tx, ty, 950);

    // Следовые частицы пули
    this.time.addEvent({
      delay: 20, repeat: 4, callback: () => {
        if (!bullet.active) return;
        const trail = this.add.circle(bullet.x, bullet.y, 4, 0x00e5ff, 0.5);
        this.tweens.add({ targets: trail, alpha: 0, scaleX: 0, scaleY: 0, duration: 200, onComplete: () => trail.destroy() });
      }
    });

    // Отдача
    this.tweens.add({ targets: this.gun, scaleX: 0.50, scaleY: 0.50, duration: 55, yoyo: true });
  }

  spawnBird() {
    if (this.isGameOver) return;
    const { width: W, height: H } = this.scale;

    const side = Phaser.Math.Between(0, 1);
    const roll = Phaser.Math.Between(1, 100);

    let texture = "birdBlue", points = 100, speed = Phaser.Math.Between(120, 170), scale = 0.55;

    if (roll > 70 && roll <= 92) {
      texture = "birdRed"; points = 150; speed = Phaser.Math.Between(190, 260); scale = 0.50;
    } else if (roll > 92) {
      texture = "birdGold"; points = 300; speed = Phaser.Math.Between(140, 200); scale = 0.60;
    }

    const spawnY = Phaser.Math.Between(130, Math.floor(H * 0.62));
    const startX = side === 0 ? -90 : W + 90;
    const targetX = side === 0 ? W + 110 : -110;
    const targetY = spawnY + Phaser.Math.Between(-60, 60);

    const bird = this.birds.create(startX, spawnY, texture);
    bird.setScale(scale);
    bird.points = points;
    if (side === 1) bird.setFlipX(true);

    this.physics.moveTo(bird, targetX, targetY, speed);

    this.tweens.add({
      targets: bird,
      y: bird.y + Phaser.Math.Between(-25, 25),
      duration: Phaser.Math.Between(500, 900),
      yoyo: true, repeat: -1, ease: "Sine.easeInOut"
    });
  }

  handleBulletHitBird(bullet, bird) {
    if (!bullet.active || !bird.active) return;
    const pts = bird.points || 100;

    // Вспышка
    const hit = this.add.image(bird.x, bird.y, "hit").setScale(0.5);
    this.tweens.add({ targets: hit, alpha: 0, scale: 1.1, duration: 300, onComplete: () => hit.destroy() });

    // Текст очков
    const popup = this.add.text(bird.x, bird.y - 20, `+${pts}`, {
      fontSize: "40px", color: pts >= 300 ? "#FFD700" : "#7CFF00",
      stroke: "#000", strokeThickness: 5
    }).setOrigin(0.5);
    this.tweens.add({ targets: popup, y: popup.y - 60, alpha: 0, duration: 600, onComplete: () => popup.destroy() });

    // FIX: уничтожаем оба объекта перед изменением счёта
    bullet.destroy();
    bird.destroy();

    this.score += pts;
    this.scoreText.setText(`SCORE: ${this.score}`);
  }

  updateGameTimer() {
    if (this.isGameOver) return;
    this.timeLeft--;
    this.timeText.setText(`⏱ ${this.timeLeft}`);

    // Мигание при <10 сек
    if (this.timeLeft <= 10) {
      this.tweens.add({ targets: this.timeText, alpha: 0.2, duration: 200, yoyo: true });
    }

    // Усложнение
    if (this.timeLeft === 40) this.setSpawnDelay(950);
    if (this.timeLeft === 20) this.setSpawnDelay(700);

    if (this.timeLeft <= 0) this.endGame();
  }

  setSpawnDelay(delay) {
    if (this.spawnEvent) this.spawnEvent.remove(false);
    this.spawnEvent = this.time.addEvent({ delay, callback: this.spawnBird, callbackScope: this, loop: true });
  }

  loseLife() {
    if (this.isGameOver) return;
    this.lives--;

    const hearts = ["", "❤", "❤❤", "❤❤❤"];
    this.livesText.setText(hearts[Math.max(0, this.lives)]);

    // Вспышка экрана
    const flash = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0xff0000, 0.3);
    this.tweens.add({ targets: flash, alpha: 0, duration: 300, onComplete: () => flash.destroy() });

    if (this.lives <= 0) this.endGame();
  }

  endGame() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    if (this.spawnEvent) this.spawnEvent.remove(false);
    if (this.timerEvent) this.timerEvent.remove(false);

    const { width: W, height: H } = this.scale;

    // Тёмный оверлей
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6);

    this.add.text(W / 2, H / 2 - 120, "GAME OVER", {
      fontSize: "76px", color: "#ff4d4d",
      stroke: "#000", strokeThickness: 10, fontStyle: "bold"
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 - 20, `SCORE: ${this.score}`, {
      fontSize: "56px", color: "#FFD700",
      stroke: "#000", strokeThickness: 7
    }).setOrigin(0.5);

    // Рейтинг
    let rank = "🐦 Новичок";
    if (this.score >= 5000) rank = "👑 Легенда";
    else if (this.score >= 2500) rank = "🏆 Мастер";
    else if (this.score >= 1000) rank = "🎯 Снайпер";

    this.add.text(W / 2, H / 2 + 60, rank, {
      fontSize: "38px", color: "#00e5ff",
      stroke: "#000", strokeThickness: 5
    }).setOrigin(0.5);

    // Кнопка рестарта
    const btn = this.add.rectangle(W / 2, H / 2 + 155, 360, 80, 0x00e5ff).setStrokeStyle(4, 0xffffff);
    this.add.text(W / 2, H / 2 + 155, "ТАП ДЛЯ РЕСТАРТА", {
      fontSize: "32px", color: "#000", fontStyle: "bold"
    }).setOrigin(0.5);

    this.tweens.add({ targets: btn, scaleX: 1.05, scaleY: 1.05, duration: 600, yoyo: true, repeat: -1 });

    // FIX: используем once, чтобы рестарт сработал один раз
    this.input.once("pointerdown", () => {
      this.scene.restart();
    });
  }
}

// ══════════════════════════════════════════════
//  КОНФИГ PHASER
// ══════════════════════════════════════════════
const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 720,
  height: 1280,
  backgroundColor: "#1a1a2e",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: "arcade",
    arcade: { debug: false }
  },
  scene: [BootScene, MenuScene, GameScene]
};

new Phaser.Game(config);
