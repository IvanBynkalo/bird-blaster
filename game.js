// Bird Blaster — PNG-версия (все ассеты из assets/)

class BootScene extends Phaser.Scene {
  constructor() { super("BootScene"); }

  preload() {
    // Если PNG не найден — не крашимся, просто пропускаем
    this.load.on("loaderror", (file) => {
      console.warn("Asset not found:", file.key, "— using fallback");
    });

    // Показываем прогресс загрузки
    const W = this.scale.width, H = this.scale.height;
    const bar = this.add.rectangle(W/2, H/2, 400, 20, 0x333333);
    const fill = this.add.rectangle(W/2 - 200, H/2, 0, 16, 0x00e5ff).setOrigin(0, 0.5);
    const label = this.add.text(W/2, H/2 - 36, "Загрузка...", {
      fontSize:"28px", color:"#fff", stroke:"#000", strokeThickness:4
    }).setOrigin(0.5);

    this.load.on("progress", (v) => { fill.width = 400 * v; });

    // ── Ассеты ──
    this.load.image("bg",        "assets/bg.png");
    this.load.image("gun",       "assets/gun.png");
    this.load.image("birdBlue",  "assets/bird_blue.png");
    this.load.image("birdRed",   "assets/bird_red.png");
    this.load.image("birdGold",  "assets/bird_gold.png");
    this.load.image("birdBlack", "assets/bird_black.png");
    this.load.image("bullet",    "assets/bullet.png");
    this.load.image("hit",       "assets/hit.png");
    this.load.image("feather",   "assets/feather.png");
  }

  create() {
    this.scene.start("MenuScene");
  }
}

// ══════════════════════════════════════════════
//  МЕНЮ
// ══════════════════════════════════════════════
class MenuScene extends Phaser.Scene {
  constructor() { super("MenuScene"); }
  create() {
    const { width: W, height: H } = this.scale;
    this.add.image(W/2, H/2, "bg").setDisplaySize(W, H);

    this.add.rectangle(W/2, H*0.18, 590, 132, 0x5d4037).setStrokeStyle(7, 0x3e2723);
    this.add.rectangle(W/2, H*0.18, 582, 124, 0x6d4c41);
    this.add.text(W/2, H*0.13, "BIRD", { fontSize:"102px", color:"#FFD700", stroke:"#7f4000", strokeThickness:14, fontStyle:"bold" }).setOrigin(0.5);
    this.add.text(W/2, H*0.22, "BLASTER", { fontSize:"74px", color:"#00e5ff", stroke:"#003366", strokeThickness:10, fontStyle:"bold" }).setOrigin(0.5);

    const birds = [
      { key:"birdBlue",  pts:"100", x:W*0.18, label:"Обычная" },
      { key:"birdRed",   pts:"150", x:W*0.50, label:"Быстрая" },
      { key:"birdGold",  pts:"300", x:W*0.82, label:"Бонусная" },
    ];
    birds.forEach(({ key, pts, x, label }) => {
      const img = this.add.image(x, H*0.48, key).setScale(0.18);
      this.tweens.add({ targets:img, y:H*0.48-14, duration:900+Math.random()*400, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });
      this.add.text(x, H*0.57, `+${pts}`, { fontSize:"38px", color:"#FFD700", stroke:"#000", strokeThickness:5 }).setOrigin(0.5);
      this.add.text(x, H*0.62, label,    { fontSize:"26px", color:"#fff",    stroke:"#000", strokeThickness:4 }).setOrigin(0.5);
    });

    const gun = this.add.image(W/2, H*0.80, "gun").setScale(0.15);
    this.tweens.add({ targets:gun, y:H*0.80-8, duration:1200, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });
    this.add.text(W/2, H*0.73, "ТАП = ВЫСТРЕЛ", { fontSize:"38px", color:"#fff", stroke:"#000", strokeThickness:6 }).setOrigin(0.5);

    const btn = this.add.rectangle(W/2, H*0.91, 380, 90, 0xff6f00).setStrokeStyle(5, 0xFFD700);
    this.add.text(W/2, H*0.91, "ИГРАТЬ!", { fontSize:"52px", color:"#fff", stroke:"#000", strokeThickness:7, fontStyle:"bold" }).setOrigin(0.5);
    this.tweens.add({ targets:btn, scaleX:1.04, scaleY:1.04, duration:700, yoyo:true, repeat:-1 });
    this.input.on("pointerdown", () => this.scene.start("GameScene"));
  }
}

// ══════════════════════════════════════════════
//  ИГРА
// ══════════════════════════════════════════════
class GameScene extends Phaser.Scene {
  constructor() { super("GameScene"); }

  init() {
    this.score       = 0;
    this.lives       = 3;
    this.timeLeft    = 60;
    this.isGameOver  = false;
    this.missStreak  = 0;
    this.hitStreak   = 0;
    this.superReady  = false;
    this.holdStart   = 0;
    this.isHolding   = false;
    this.chargeX     = 0;
    this.chargeY     = 0;
  }

  create() {
    const { width: W, height: H } = this.scale;
    this.add.image(W/2, H/2, "bg").setDisplaySize(W, H);

    this.birds   = this.physics.add.group();
    this.bullets = this.physics.add.group();

    // Пушка
    this.gun = this.add.image(W/2, H - 60, "gun");
    this.gun.setOrigin(0.2, 0.25).setScale(0.20);

    // Индикатор заряда (шкала под пушкой)
    this.chargeBarBg = this.add.rectangle(W/2, H - 18, 320, 18, 0x333333, 0.7).setDepth(10);
    this.chargeBar   = this.add.rectangle(W/2 - 160, H - 18, 0, 14, 0x00e5ff, 1).setOrigin(0, 0.5).setDepth(11);
    this.chargeLabel = this.add.text(W/2, H - 18, "", { fontSize:"20px", color:"#fff", stroke:"#000", strokeThickness:3 }).setOrigin(0.5).setDepth(12);

    // Иконка промахов (3 черепа = потеря жизни)
    this.missIcons = [];
    for(let i = 0; i < 3; i++) {
      const ic = this.add.text(W/2 - 42 + i*42, H - 48, "✕", {
        fontSize:"28px", color:"#888", stroke:"#000", strokeThickness:3
      }).setDepth(10);
      this.missIcons.push(ic);
    }

    // HUD
    this.add.rectangle(W/2, 60, W, 120, 0x5d4037, 0.88);
    this.add.rectangle(W/2, 60, W-4, 116, 0x6d4c41, 0.5);
    this.timeText  = this.add.text(24, 20, "⏱ 60", { fontSize:"44px", color:"#FFD700", stroke:"#000", strokeThickness:6 });
    this.scoreText = this.add.text(W/2, 20, "SCORE: 0", { fontSize:"44px", color:"#fff", stroke:"#000", strokeThickness:6 }).setOrigin(0.5, 0);
    this.livesText = this.add.text(W-20, 20, "❤❤❤", { fontSize:"38px", color:"#ff4d4d", stroke:"#000", strokeThickness:5 }).setOrigin(1, 0);

    // Счётчик серии попаданий (супер-выстрел)
    this.hitIcons = [];
    for(let i = 0; i < 3; i++) {
      const ic = this.add.text(W/2 + 90 + i*38, H - 48, "◎", {
        fontSize:"26px", color:"#555", stroke:"#000", strokeThickness:3
      }).setDepth(10);
      this.hitIcons.push(ic);
    }
    this.superLabel = this.add.text(W/2, H - 78, "", {
      fontSize:"28px", color:"#FFD700", stroke:"#000", strokeThickness:5, fontStyle:"bold"
    }).setOrigin(0.5).setDepth(12);

    this.physics.add.overlap(this.bullets, this.birds, this.handleBulletHitBird, null, this);

    // ── ЗАЖАТИЕ: pointerdown начинает заряд, pointerup — стреляет ──
    this.input.on("pointerdown", (p) => {
      if(this.isGameOver) return;
      this.isHolding = true;
      this.holdStart = this.time.now;
      this.chargeX   = p.x;
      this.chargeY   = p.y;
      // Поворот пушки сразу при зажатии
      const angle = Phaser.Math.Angle.Between(this.gun.x, this.gun.y - 70, p.x, p.y);
      this.gun.setRotation(angle + Math.PI/2);
    });

    this.input.on("pointermove", (p) => {
      if(!this.isHolding || this.isGameOver) return;
      this.chargeX = p.x;
      this.chargeY = p.y;
      const angle = Phaser.Math.Angle.Between(this.gun.x, this.gun.y - 70, p.x, p.y);
      this.gun.setRotation(angle + Math.PI/2);
    });

    this.input.on("pointerup", (p) => {
      if(!this.isHolding || this.isGameOver) return;
      this.isHolding = false;
      const held = this.time.now - this.holdStart; // мс
      this.shoot(this.chargeX, this.chargeY, held);
      this.chargeBar.width = 0;
      this.chargeLabel.setText("");
    });

    this.spawnEvent = this.time.addEvent({ delay:1100, callback:this.spawnBird, callbackScope:this, loop:true });
    this.timerEvent = this.time.addEvent({ delay:1000, callback:this.updateGameTimer, callbackScope:this, loop:true });
  }

  update() {
    if(this.isGameOver) return;
    const { width:W, height:H } = this.scale;

    // Анимация шкалы заряда
    if(this.isHolding) {
      const held = this.time.now - this.holdStart;
      const t    = Math.min(held / 1500, 1); // макс заряд за 1.5 сек
      const barW = Math.round(t * 320);
      this.chargeBar.width = barW;
      // Цвет: синий → жёлтый → красный
      const color = t < 0.5
        ? Phaser.Display.Color.Interpolate.ColorWithColor({r:0,g:229,b:255}, {r:255,g:220,b:0}, 100, Math.round(t*200))
        : Phaser.Display.Color.Interpolate.ColorWithColor({r:255,g:220,b:0}, {r:255,g:60,b:0},  100, Math.round((t-0.5)*200));
      this.chargeBar.setFillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
      const speed = Math.round(600 + t * 1400);
      this.chargeLabel.setText(t < 0.05 ? "" : `${speed} px/s`);
    }

    // Удаляем улетевшие пули — копируем в массив чтобы destroy() не ломал итератор
    const bulletList = this.bullets.children.entries.slice();
    for(const b of bulletList) {
      if(!b.active || b.counted) continue;
      if(b.x < -80 || b.x > W+80 || b.y < -80 || b.y > H+80) {
        b.counted = true;
        b.destroy();
        this.registerMiss();
      }
    }

    // Птицы улетели — просто удаляем (жизнь НЕ снимаем)
    // Копируем в массив чтобы destroy() не ломал итератор
    const birdList = this.birds.children.entries.slice();
    for(const bird of birdList) {
      if(!bird.active) continue;
      if(bird.x < -180 || bird.x > W+180 || bird.y < -180 || bird.y > H+180) {
        bird.destroy();
      }
    }
  }

  // ── ВЫСТРЕЛ: held — время зажатия в мс ──
  shoot(tx, ty, held) {
    const gx = this.gun.x, gy = this.gun.y - 70;
    const t  = Math.min(held / 1500, 1);
    const speed = 600 + t * 1400;

    if(this.superReady) {
      // ── СУПЕР-ВЫСТРЕЛ: 3 снаряда с рассеиванием ──
      this.superReady = false;
      this.superLabel.setText("");
      for(let i=0;i<3;i++) { this.hitIcons[i].setColor("#555"); this.hitIcons[i].setText("◎"); }

      const baseAngle = Phaser.Math.Angle.Between(gx, gy, tx, ty);
      const spread    = [-0.18, 0, 0.18]; // рассеивание в радианах (~10°)
      spread.forEach((offset, idx) => {
        const ang = baseAngle + offset;
        const b = this.bullets.create(gx, gy, "bullet");
        b.setScale(0.16).setTint(0xFFD700);
        const vx = Math.cos(ang) * (speed + 300);
        const vy = Math.sin(ang) * (speed + 300);
        b.setVelocity(vx, vy);
        this.spawnTrail(b, 0xFFD700, 8);
      });

      // Мощная отдача
      this.tweens.add({ targets:this.gun, scaleX:0.82, scaleY:0.82, duration:80, yoyo:true });

      // Вспышка-кольцо у дула
      const ring = this.add.circle(gx, gy, 8, 0xFFD700, 0.9);
      this.tweens.add({ targets:ring, scaleX:6, scaleY:6, alpha:0, duration:300, onComplete:()=>ring.destroy() });
      return;
    }

    const bullet = this.bullets.create(gx, gy, "bullet");
    bullet.setScale(0.12 + t * 0.12);
    this.physics.moveTo(bullet, tx, ty, speed);
    const trailColor = t < 0.5 ? 0x00e5ff : (t < 0.8 ? 0xffcc00 : 0xff4400);
    this.spawnTrail(bullet, trailColor, Math.round((0.6 + t * 0.6) * 6));

    const kick = 0.94 - t * 0.08;
    this.tweens.add({ targets:this.gun, scaleX:kick, scaleY:kick, duration:55, yoyo:true });
  }

  spawnTrail(bullet, color, radius) {
    this.time.addEvent({ delay:16, repeat:6, callback:() => {
      if(!bullet.active) return;
      const trail = this.add.circle(bullet.x, bullet.y, radius, color, 0.6);
      this.tweens.add({ targets:trail, alpha:0, scaleX:0, scaleY:0, duration:160, onComplete:()=>trail.destroy() });
    }});
  }

  // ── ПРОМАХ — пуля улетела за экран ──
  registerMiss() {
    if(this.isGameOver) return;
    this.missStreak++;
    // Подсвечиваем иконки промахов
    for(let i = 0; i < 3; i++) {
      this.missIcons[i].setColor(i < this.missStreak ? "#ff4444" : "#888");
    }
    if(this.missStreak >= 3) {
      this.missStreak = 0;
      for(let i = 0; i < 3; i++) this.missIcons[i].setColor("#888");
      this.loseLife("miss");
    }
  }

  spawnBird() {
    if(this.isGameOver) return;
    const { width:W, height:H } = this.scale;
    const side = Phaser.Math.Between(0,1);
    const roll = Phaser.Math.Between(1,100);
    let texture="birdBlue", points=100, speed=Phaser.Math.Between(110,160), scale=0.16, isDanger=false;
    if(roll>60&&roll<=78)  { texture="birdRed";   points=150; speed=Phaser.Math.Between(180,250); scale=0.14; }
    else if(roll>78&&roll<=90) { texture="birdBlack"; points=0;   speed=Phaser.Math.Between(200,280); scale=0.13; isDanger=true; }
    else if(roll>90)           { texture="birdGold";  points=300; speed=Phaser.Math.Between(130,190); scale=0.18; }

    const spawnY  = Phaser.Math.Between(140, Math.floor(H*0.60));
    const startX  = side===0 ? -160 : W+160;
    const targetX = side===0 ? W+200 : -200;
    const targetY = spawnY + Phaser.Math.Between(-80,80);

    const bird = this.birds.create(startX, spawnY, texture);
    bird.setScale(scale);
    bird.points   = points;
    bird.isDanger = isDanger;
    // Текстура нарисована головой влево:
    // side=0 (летит влево→вправо): нужен flipX чтобы голова смотрела вправо
    // side=1 (летит вправо→влево): flipX не нужен, голова и так смотрит влево
    if(side===0) bird.setFlipX(true);
    this.physics.moveTo(bird, targetX, targetY, speed);
    this.tweens.add({ targets:bird, y:bird.y+Phaser.Math.Between(-30,30), duration:Phaser.Math.Between(450,850), yoyo:true, repeat:-1, ease:"Sine.easeInOut" });
  }

  handleBulletHitBird(bullet, bird) {
    if(!bullet.active||!bird.active) return;
    const pts      = bird.points;
    const isDanger = bird.isDanger;
    const bx = bird.x, by = bird.y;

    bullet.destroy();
    bird.destroy();

    // Попал в чёрную птицу — минус жизнь!
    if(isDanger) {
      const skull = this.add.text(bx, by-20, "☠ -ЖИЗНЬ!", {
        fontSize:"52px", color:"#ff0000", stroke:"#000", strokeThickness:7, fontStyle:"bold"
      }).setOrigin(0.5).setDepth(20);
      this.tweens.add({ targets:skull, y:skull.y-90, alpha:0, duration:900, ease:"Quad.easeOut", onComplete:()=>skull.destroy() });

      // Красная вспышка побольше
      const hit = this.add.image(bx, by, "hit").setScale(0.6).setTint(0xff0000);
      this.tweens.add({ targets:hit, alpha:0, scale:1.8, duration:400, onComplete:()=>hit.destroy() });

      this.loseLife("black_bird");
      return;
    }

    // Обычное попадание
    this.missStreak = 0;
    for(let i=0;i<3;i++) this.missIcons[i].setColor("#888");

    // Серия попаданий → супер-выстрел
    this.hitStreak++;
    for(let i=0;i<3;i++) {
      this.hitIcons[i].setColor(i < this.hitStreak ? "#FFD700" : "#555");
      this.hitIcons[i].setText(i < this.hitStreak ? "★" : "◎");
    }
    if(this.hitStreak >= 3) {
      this.hitStreak = 0;
      this.superReady = true;
      this.superLabel.setText("⚡ СУПЕР!");
      this.tweens.add({ targets:this.superLabel, scaleX:1.2, scaleY:1.2, duration:300, yoyo:true, repeat:2 });
      for(let i=0;i<3;i++) { this.hitIcons[i].setColor("#00e5ff"); this.hitIcons[i].setText("★"); }
    }

    const hit = this.add.image(bx, by, "hit").setScale(0.5);
    this.tweens.add({ targets:hit, alpha:0, scale:1.3, duration:350, onComplete:()=>hit.destroy() });

    for(let i=0;i<5;i++){
      const f = this.add.image(bx, by, "feather")
        .setScale(0.08+Math.random()*0.06).setRotation(Math.random()*Math.PI*2).setAlpha(0.9);
      this.tweens.add({ targets:f, x:bx+Phaser.Math.Between(-80,80), y:by+Phaser.Math.Between(-60,80),
        angle:Phaser.Math.Between(-180,180), alpha:0, duration:700+Math.random()*300, ease:"Quad.easeOut", onComplete:()=>f.destroy() });
    }

    const color = pts>=300?"#FFD700":"#7CFF00";
    const popup = this.add.text(bx, by-30, `+${pts}`, {
      fontSize:"60px", color, stroke:"#000", strokeThickness:7, fontStyle:"bold"
    }).setOrigin(0.5);
    this.tweens.add({ targets:popup, y:popup.y-80, alpha:0, duration:700, ease:"Quad.easeOut", onComplete:()=>popup.destroy() });

    this.score += pts;
    this.scoreText.setText(`SCORE: ${this.score}`);
  }

  updateGameTimer() {
    if(this.isGameOver) return;
    this.timeLeft--;
    this.timeText.setText(`⏱ ${this.timeLeft}`);
    if(this.timeLeft<=10) this.tweens.add({ targets:this.timeText, alpha:0.2, duration:200, yoyo:true });
    if(this.timeLeft===40) this.setSpawnDelay(900);
    if(this.timeLeft===20) this.setSpawnDelay(650);
    if(this.timeLeft<=0)  this.endGame();
  }

  setSpawnDelay(delay) {
    if(this.spawnEvent) this.spawnEvent.remove(false);
    this.spawnEvent = this.time.addEvent({ delay, callback:this.spawnBird, callbackScope:this, loop:true });
  }

  loseLife(reason) {
    if(this.isGameOver) return;
    this.lives--;
    const hearts = ["","❤","❤❤","❤❤❤"];
    this.livesText.setText(hearts[Math.max(0, this.lives)]);

    const flash = this.add.rectangle(this.scale.width/2, this.scale.height/2, this.scale.width, this.scale.height, 0xff0000, 0.4);
    this.tweens.add({ targets:flash, alpha:0, duration:300, onComplete:()=>flash.destroy() });

    if(this.lives <= 0) this.endGame();
  }

  endGame() {
    if(this.isGameOver) return;
    this.isGameOver = true;
    if(this.spawnEvent) this.spawnEvent.remove(false);
    if(this.timerEvent) this.timerEvent.remove(false);

    const { width:W, height:H } = this.scale;
    this.add.rectangle(W/2,H/2,W,H,0x000000,0.65);
    this.add.text(W/2,H/2-130,"GAME OVER",{ fontSize:"82px", color:"#ff4d4d", stroke:"#000", strokeThickness:12, fontStyle:"bold" }).setOrigin(0.5);
    this.add.text(W/2,H/2-30,`SCORE: ${this.score}`,{ fontSize:"62px", color:"#FFD700", stroke:"#000", strokeThickness:8 }).setOrigin(0.5);
    let rank="🐦 Новичок";
    if(this.score>=5000) rank="👑 Легенда";
    else if(this.score>=2500) rank="🏆 Мастер";
    else if(this.score>=1000) rank="🎯 Снайпер";
    this.add.text(W/2,H/2+60,rank,{ fontSize:"42px", color:"#00e5ff", stroke:"#000", strokeThickness:6 }).setOrigin(0.5);
    const btn=this.add.rectangle(W/2,H/2+165,400,90,0xff6f00).setStrokeStyle(5,0xFFD700);
    this.add.text(W/2,H/2+165,"ЕЩЁ РАЗ!",{ fontSize:"48px", color:"#fff", stroke:"#000", strokeThickness:7, fontStyle:"bold" }).setOrigin(0.5);
    this.tweens.add({ targets:btn, scaleX:1.05, scaleY:1.05, duration:600, yoyo:true, repeat:-1 });
    this.input.once("pointerdown", ()=>this.scene.restart());
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 720, height: 1280,
  backgroundColor: "#6dcff6",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: "arcade", arcade: { debug: false } },
  scene: [BootScene, MenuScene, GameScene]
};
new Phaser.Game(config);
