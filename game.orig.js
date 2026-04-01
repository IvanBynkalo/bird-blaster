
// Bird Blaster — PNG-версия (все ассеты из assets/)

const LEADERBOARD_KEY = "bird_blaster_leaderboard_v1";
const PLAYER_NAME_KEY = "bird_blaster_player_name_v1";

function sanitizePlayerName(name) {
  return (name || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 16);
}

function getSavedPlayerName() {
  try {
    return sanitizePlayerName(localStorage.getItem(PLAYER_NAME_KEY) || "");
  } catch (e) {
    return "";
  }
}

function savePlayerName(name) {
  const clean = sanitizePlayerName(name);
  try {
    localStorage.setItem(PLAYER_NAME_KEY, clean);
  } catch (e) {}
  return clean;
}

function loadLeaderboard() {
  try {
    const raw = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .map((row) => ({
        name: sanitizePlayerName(row.name || "Игрок") || "Игрок",
        score: Number(row.score) || 0,
        date: row.date || new Date().toISOString().slice(0, 10)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch (e) {
    return [];
  }
}

function saveLeaderboard(rows) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(rows.slice(0, 10)));
  } catch (e) {}
}

function addLeaderboardScore(name, score) {
  const rows = loadLeaderboard();
  rows.push({
    name: sanitizePlayerName(name) || "Игрок",
    score: Math.max(0, Math.round(score || 0)),
    date: new Date().toISOString().slice(0, 10)
  });
  rows.sort((a, b) => b.score - a.score);
  const trimmed = rows.slice(0, 10);
  saveLeaderboard(trimmed);
  return trimmed;
}

function getLeaderboardRank(score) {
  const rows = loadLeaderboard();
  const better = rows.filter((row) => row.score > score).length;
  return better + 1;
}

class BootScene extends Phaser.Scene {
  constructor() { super("BootScene"); }

  preload() {
    this.load.on("loaderror", (file) => {
      console.warn("Asset not found:", file.key, "— using fallback");
    });

    const W = this.scale.width, H = this.scale.height;
    const bar = this.add.rectangle(W/2, H/2, 400, 20, 0x333333);
    const fill = this.add.rectangle(W/2 - 200, H/2, 0, 16, 0x00e5ff).setOrigin(0, 0.5);
    const label = this.add.text(W/2, H/2 - 36, "Загрузка...", {
      fontSize:"28px", color:"#fff", stroke:"#000", strokeThickness:4
    }).setOrigin(0.5);

    this.load.on("progress", (v) => { fill.width = 400 * v; });

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
    this.registry.set("playerName", getSavedPlayerName());
    this.scene.start("MenuScene");
  }
}

class MenuScene extends Phaser.Scene {
  constructor() { super("MenuScene"); }

  create() {
    const { width: W, height: H } = this.scale;
    this.add.image(W/2, H/2, "bg").setDisplaySize(W, H);

    this.add.rectangle(W/2, H*0.16, 590, 132, 0x5d4037).setStrokeStyle(7, 0x3e2723);
    this.add.rectangle(W/2, H*0.16, 582, 124, 0x6d4c41);
    this.add.text(W/2, H*0.115, "BIRD", { fontSize:"102px", color:"#FFD700", stroke:"#7f4000", strokeThickness:14, fontStyle:"bold" }).setOrigin(0.5);
    this.add.text(W/2, H*0.195, "BLASTER", { fontSize:"74px", color:"#00e5ff", stroke:"#003366", strokeThickness:10, fontStyle:"bold" }).setOrigin(0.5);

    const birds = [
      { key:"birdBlue",  pts:"100", x:W*0.18, label:"Обычная" },
      { key:"birdRed",   pts:"150", x:W*0.50, label:"Быстрая" },
      { key:"birdGold",  pts:"300", x:W*0.82, label:"Бонусная" },
    ];
    birds.forEach(({ key, pts, x, label }) => {
      const img = this.add.image(x, H*0.39, key).setScale(0.14);
      this.tweens.add({ targets:img, y:H*0.39-14, duration:900+Math.random()*400, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });
      this.add.text(x, H*0.48, `+${pts}`, { fontSize:"38px", color:"#FFD700", stroke:"#000", strokeThickness:5 }).setOrigin(0.5);
      this.add.text(x, H*0.53, label,    { fontSize:"26px", color:"#fff",    stroke:"#000", strokeThickness:4 }).setOrigin(0.5);
    });

    const gun = this.add.image(W/2, H*0.71, "gun").setScale(0.275);
    this.tweens.add({ targets:gun, y:H*0.71-8, duration:1200, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });
    this.add.text(W/2, H*0.645, "ЗАЖМИ И ОТПУСТИ = ВЫСТРЕЛ", { fontSize:"30px", color:"#fff", stroke:"#000", strokeThickness:6 }).setOrigin(0.5);

    this.nameText = this.add.text(W/2, H*0.765, "", {
      fontSize:"28px", color:"#fff", stroke:"#000", strokeThickness:5
    }).setOrigin(0.5);
    this.refreshPlayerNameText();

    this.drawLeaderboard();

    const btn = this.add.rectangle(W/2, H*0.93, 380, 90, 0xff6f00).setStrokeStyle(5, 0xFFD700).setInteractive({ useHandCursor: true });
    this.add.text(W/2, H*0.93, "ИГРАТЬ!", { fontSize:"52px", color:"#fff", stroke:"#000", strokeThickness:7, fontStyle:"bold" }).setOrigin(0.5);
    this.tweens.add({ targets:btn, scaleX:1.04, scaleY:1.04, duration:700, yoyo:true, repeat:-1 });
    btn.on("pointerdown", () => this.openNameModal());
  }

  refreshPlayerNameText() {
    const currentName = this.registry.get("playerName") || getSavedPlayerName() || "Не указано";
    this.nameText.setText(`Игрок: ${currentName}`);
  }

  drawLeaderboard() {
    const { width: W, height: H } = this.scale;
    const boardX = W / 2;
    const boardY = H * 0.80;
    this.add.rectangle(boardX, boardY, 540, 220, 0x000000, 0.45).setStrokeStyle(4, 0xFFD700);
    this.add.text(boardX, boardY - 86, "🏆 ТОП ИГРОКОВ", {
      fontSize:"34px", color:"#FFD700", stroke:"#000", strokeThickness:5, fontStyle:"bold"
    }).setOrigin(0.5);

    const rows = loadLeaderboard();
    if (!rows.length) {
      this.add.text(boardX, boardY, "Пока нет результатов\nСтань первым в рейтинге!", {
        fontSize:"28px", align:"center", color:"#fff", stroke:"#000", strokeThickness:4
      }).setOrigin(0.5);
      return;
    }

    rows.slice(0, 5).forEach((row, index) => {
      const y = boardY - 42 + index * 34;
      const prefix = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index+1}.`;
      this.add.text(boardX - 220, y, `${prefix} ${row.name}`, {
        fontSize:"24px", color:"#fff", stroke:"#000", strokeThickness:4
      }).setOrigin(0, 0.5);
      this.add.text(boardX + 220, y, `${row.score}`, {
        fontSize:"24px", color:"#7CFF00", stroke:"#000", strokeThickness:4, fontStyle:"bold"
      }).setOrigin(1, 0.5);
    });
  }

  openNameModal() {
    const modal = document.getElementById("name-modal");
    const input = document.getElementById("player-name-input");
    const startBtn = document.getElementById("start-game-btn");
    const cancelBtn = document.getElementById("cancel-name-btn");
    if (!modal || !input || !startBtn || !cancelBtn) {
      this.scene.start("GameScene");
      return;
    }

    const currentName = this.registry.get("playerName") || getSavedPlayerName();
    input.value = currentName || "";
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    setTimeout(() => {
      input.focus();
      input.select();
    }, 0);

    const closeModal = () => {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
      startBtn.onclick = null;
      cancelBtn.onclick = null;
      input.onkeydown = null;
    };

    const startGame = () => {
      const finalName = savePlayerName(input.value || "Игрок");
      this.registry.set("playerName", finalName || "Игрок");
      closeModal();
      this.scene.start("GameScene", { playerName: finalName || "Игрок" });
    };

    startBtn.onclick = startGame;
    cancelBtn.onclick = closeModal;
    input.onkeydown = (e) => {
      if (e.key === "Enter") startGame();
      if (e.key === "Escape") closeModal();
    };
  }
}

class GameScene extends Phaser.Scene {
  constructor() { super("GameScene"); }

  init(data) {
    this.playerName  = sanitizePlayerName(data?.playerName || this.registry.get("playerName") || getSavedPlayerName() || "Игрок") || "Игрок";
    this.score       = 0;
    this.lives       = 3;
    this.timeLeft    = 60;
    this.isGameOver  = false;
    this.missStreak  = 0;
    this.hitStreak   = 0;
    this.comboHits   = 0;
    this.comboMult   = 1;
    this.superReady  = false;
    this.holdStart   = 0;
    this.isHolding   = false;
    this.chargeX     = 0;
    this.chargeY     = 0;
    this.finalRankPosition = null;
  }

  create() {
    const { width: W, height: H } = this.scale;
    this.add.image(W/2, H/2, "bg").setDisplaySize(W, H);

    this.birds   = this.physics.add.group();
    this.bullets = this.physics.add.group();

    this.gun = this.add.image(W/2, H - 60, "gun");
    this.gunBaseScale = 0.275;
    this.gun.setOrigin(0.5, 0.90).setScale(this.gunBaseScale);

    this.chargeBarBg = this.add.rectangle(W/2, H - 18, 320, 18, 0x333333, 0.7).setDepth(10);
    this.chargeBar   = this.add.rectangle(W/2 - 160, H - 18, 0, 14, 0x00e5ff, 1).setOrigin(0, 0.5).setDepth(11);
    this.chargeLabel = this.add.text(W/2, H - 18, "", { fontSize:"20px", color:"#fff", stroke:"#000", strokeThickness:3 }).setOrigin(0.5).setDepth(12);

    this.missIcons = [];
    for(let i = 0; i < 3; i++) {
      const ic = this.add.text(W/2 - 42 + i*42, H - 48, "✕", {
        fontSize:"28px", color:"#888", stroke:"#000", strokeThickness:3
      }).setDepth(10);
      this.missIcons.push(ic);
    }

    this.add.rectangle(W/2, 60, W, 120, 0x5d4037, 0.88);
    this.add.rectangle(W/2, 60, W-4, 116, 0x6d4c41, 0.5);
    this.timeText  = this.add.text(24, 20, "⏱ 60", { fontSize:"44px", color:"#FFD700", stroke:"#000", strokeThickness:6 });
    this.scoreText = this.add.text(W/2, 20, "SCORE: 0", { fontSize:"44px", color:"#fff", stroke:"#000", strokeThickness:6 }).setOrigin(0.5, 0);
    this.comboText = this.add.text(W/2, 72, "", { fontSize:"28px", color:"#FFD700", stroke:"#000", strokeThickness:5, fontStyle:"bold" }).setOrigin(0.5, 0);
    this.livesText = this.add.text(W-20, 20, "❤❤❤", { fontSize:"38px", color:"#ff4d4d", stroke:"#000", strokeThickness:5 }).setOrigin(1, 0);
    this.playerText = this.add.text(24, 102, `Игрок: ${this.playerName}`, {
      fontSize:"24px", color:"#fff", stroke:"#000", strokeThickness:4
    });

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

    this.input.on("pointerdown", (p) => {
      if(this.isGameOver) return;
      this.isHolding = true;
      this.holdStart = this.time.now;
      this.chargeX   = p.x;
      this.chargeY   = p.y;
      const angle = Phaser.Math.Angle.Between(this.gun.x, this.gun.y, p.x, p.y);
      this.gun.setRotation(angle + Math.PI/2);
    });

    this.input.on("pointermove", (p) => {
      if(!this.isHolding || this.isGameOver) return;
      this.chargeX = p.x;
      this.chargeY = p.y;
      const angle = Phaser.Math.Angle.Between(this.gun.x, this.gun.y, p.x, p.y);
      this.gun.setRotation(angle + Math.PI/2);
    });

    this.input.on("pointerup", () => {
      if(!this.isHolding || this.isGameOver) return;
      this.isHolding = false;
      const held = this.time.now - this.holdStart;
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

    if(this.isHolding) {
      const held = this.time.now - this.holdStart;
      const t    = Math.min(held / 1500, 1);
      const barW = Math.round(t * 320);
      this.chargeBar.width = barW;
      const color = t < 0.5
        ? Phaser.Display.Color.Interpolate.ColorWithColor({r:0,g:229,b:255}, {r:255,g:220,b:0}, 100, Math.round(t*200))
        : Phaser.Display.Color.Interpolate.ColorWithColor({r:255,g:220,b:0}, {r:255,g:60,b:0},  100, Math.round((t-0.5)*200));
      this.chargeBar.setFillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
      const speed = Math.round(600 + t * 1400);
      this.chargeLabel.setText(t < 0.05 ? "" : `${speed} px/s`);
    }

    const bulletList = this.bullets.children.entries.slice();
    for(const b of bulletList) {
      if(!b.active || b.counted) continue;
      if(b.x < -80 || b.x > W+80 || b.y < -80 || b.y > H+80) {
        b.counted = true;
        b.destroy();
        this.registerMiss();
      }
    }

    const birdList = this.birds.children.entries.slice();
    for(const bird of birdList) {
      if(!bird.active) continue;
      if(bird.x < -180 || bird.x > W+180 || bird.y < -180 || bird.y > H+180) {
        bird.destroy();
      }
    }
  }

  getGunMuzzle() {
    const localX = 0;
    const localY = -this.gun.displayHeight * 0.68;
    const cos = Math.cos(this.gun.rotation);
    const sin = Math.sin(this.gun.rotation);
    return {
      x: this.gun.x + localX * cos - localY * sin,
      y: this.gun.y + localX * sin + localY * cos,
    };
  }

  shoot(tx, ty, held) {
    const { x: gx, y: gy } = this.getGunMuzzle();
    const t  = Math.min(held / 1500, 1);
    const speed = 600 + t * 1400;

    if(this.superReady) {
      this.superReady = false;
      this.superLabel.setText("");
      for(let i=0;i<3;i++) { this.hitIcons[i].setColor("#555"); this.hitIcons[i].setText("◎"); }

      const baseAngle = Phaser.Math.Angle.Between(gx, gy, tx, ty);
      const spread    = [-0.18, 0, 0.18];
      spread.forEach((offset) => {
        const ang = baseAngle + offset;
        const b = this.bullets.create(gx, gy, "bullet");
        b.setScale(0.16).setTint(0xFFD700);
        const vx = Math.cos(ang) * (speed + 300);
        const vy = Math.sin(ang) * (speed + 300);
        b.setVelocity(vx, vy);
        this.spawnTrail(b, 0xFFD700, 8);
      });

      this.tweens.killTweensOf(this.gun);
      this.gun.setScale(this.gunBaseScale);
      this.tweens.add({
        targets:this.gun,
        scaleX:this.gunBaseScale * 0.84,
        scaleY:this.gunBaseScale * 0.84,
        duration:80,
        yoyo:true,
        onComplete:() => this.gun.setScale(this.gunBaseScale)
      });

      const ring = this.add.circle(gx, gy, 8, 0xFFD700, 0.9);
      this.tweens.add({ targets:ring, scaleX:6, scaleY:6, alpha:0, duration:300, onComplete:()=>ring.destroy() });
      return;
    }

    const bullet = this.bullets.create(gx, gy, "bullet");
    bullet.setScale(0.06 + t * 0.06);
    this.physics.moveTo(bullet, tx, ty, speed);
    const trailColor = t < 0.5 ? 0x00e5ff : (t < 0.8 ? 0xffcc00 : 0xff4400);
    this.spawnTrail(bullet, trailColor, Math.round((0.6 + t * 0.6) * 6));

    const kick = this.gunBaseScale * (0.94 - t * 0.08);
    this.tweens.killTweensOf(this.gun);
    this.gun.setScale(this.gunBaseScale);
    this.tweens.add({
      targets:this.gun,
      scaleX:kick,
      scaleY:kick,
      duration:55,
      yoyo:true,
      onComplete:() => this.gun.setScale(this.gunBaseScale)
    });
  }

  spawnTrail(bullet, color, radius) {
    this.time.addEvent({ delay:16, repeat:6, callback:() => {
      if(!bullet.active) return;
      const trail = this.add.circle(bullet.x, bullet.y, radius, color, 0.6);
      this.tweens.add({ targets:trail, alpha:0, scaleX:0, scaleY:0, duration:160, onComplete:()=>trail.destroy() });
    }});
  }

  registerMiss() {
    if(this.isGameOver) return;
    this.resetCombo();
    this.missStreak++;
    for(let i = 0; i < 3; i++) {
      this.missIcons[i].setColor(i < this.missStreak ? "#ff4444" : "#888");
    }
    if(this.missStreak >= 3) {
      this.missStreak = 0;
      for(let i = 0; i < 3; i++) this.missIcons[i].setColor("#888");
      this.cameras.main.shake(120, 0.008);
      this.loseLife("miss");
    }
  }

  getComboMultiplier() {
    if (this.comboHits >= 12) return 5;
    if (this.comboHits >= 8) return 3;
    if (this.comboHits >= 4) return 2;
    return 1;
  }

  updateComboUI() {
    if (!this.comboText) return;
    if (this.comboHits <= 1) {
      this.comboText.setText("");
      return;
    }
    const label = `🔥 COMBO x${this.comboMult} · ${this.comboHits}`;
    this.comboText.setText(label);
    const color = this.comboMult >= 5 ? "#ff5a00" : this.comboMult >= 3 ? "#00e5ff" : "#FFD700";
    this.comboText.setColor(color);
  }

  resetCombo() {
    this.comboHits = 0;
    this.comboMult = 1;
    this.updateComboUI();
  }

  addCombo() {
    this.comboHits++;
    this.comboMult = this.getComboMultiplier();
    this.updateComboUI();
    if (this.comboHits > 1) {
      this.tweens.add({ targets:this.comboText, scaleX:1.12, scaleY:1.12, duration:90, yoyo:true });
    }
  }

  spawnBird() {
    if(this.isGameOver) return;
    const { width:W, height:H } = this.scale;
    const side = Phaser.Math.Between(0,1);
    const roll = Phaser.Math.Between(1,100);
    let texture="birdBlue", points=100, speed=Phaser.Math.Between(110,160), scale=0.13, isDanger=false;
    if(roll>60&&roll<=78)  { texture="birdRed";   points=150; speed=Phaser.Math.Between(180,250); scale=0.12; }
    else if(roll>78&&roll<=90) { texture="birdBlack"; points=0;   speed=Phaser.Math.Between(200,280); scale=0.115; isDanger=true; }
    else if(roll>90)           { texture="birdGold";  points=300; speed=Phaser.Math.Between(130,190); scale=0.14; }

    const spawnY  = Phaser.Math.Between(140, Math.floor(H*0.60));
    const startX  = side===0 ? -160 : W+160;
    const targetX = side===0 ? W+200 : -200;
    const targetY = spawnY + Phaser.Math.Between(-80,80);

    const bird = this.birds.create(startX, spawnY, texture);
    bird.setScale(scale);
    bird.points   = points;
    bird.isDanger = isDanger;
    bird.setFlipX(side===1);
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

    if(isDanger) {
      const skull = this.add.text(bx, by-20, "☠ -ЖИЗНЬ!", {
        fontSize:"52px", color:"#ff0000", stroke:"#000", strokeThickness:7, fontStyle:"bold"
      }).setOrigin(0.5).setDepth(20);
      this.tweens.add({ targets:skull, y:skull.y-90, alpha:0, duration:900, ease:"Quad.easeOut", onComplete:()=>skull.destroy() });

      const hit = this.add.image(bx, by, "hit").setScale(0.6).setTint(0xff0000);
      this.tweens.add({ targets:hit, alpha:0, scale:1.8, duration:400, onComplete:()=>hit.destroy() });

      this.resetCombo();
      this.cameras.main.shake(160, 0.012);
      this.loseLife("black_bird");
      return;
    }

    this.missStreak = 0;
    for(let i=0;i<3;i++) this.missIcons[i].setColor("#888");

    this.addCombo();

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

    const gained = pts * this.comboMult;
    const color = this.comboMult >= 3 ? "#00e5ff" : (pts>=300?"#FFD700":"#7CFF00");
    const popupLabel = this.comboMult > 1 ? `+${gained}  x${this.comboMult}` : `+${gained}`;
    const popup = this.add.text(bx, by-30, popupLabel, {
      fontSize:"60px", color, stroke:"#000", strokeThickness:7, fontStyle:"bold"
    }).setOrigin(0.5);
    this.tweens.add({ targets:popup, y:popup.y-80, alpha:0, duration:700, ease:"Quad.easeOut", onComplete:()=>popup.destroy() });

    this.score += gained;
    this.scoreText.setText(`SCORE: ${this.score}`);
    this.cameras.main.shake(90, 0.004 + Math.min(this.comboMult, 5) * 0.0015);
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
    this.resetCombo();
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

    const topBefore = loadLeaderboard();
    this.finalRankPosition = getLeaderboardRank(this.score);
    const updatedLeaderboard = addLeaderboardScore(this.playerName, this.score);
    const isNewRecord = !topBefore.length || this.score >= topBefore[0].score;

    const { width:W, height:H } = this.scale;
    this.add.rectangle(W/2,H/2,W,H,0x000000,0.72);
    this.add.text(W/2,H/2-170,"GAME OVER",{ fontSize:"82px", color:"#ff4d4d", stroke:"#000", strokeThickness:12, fontStyle:"bold" }).setOrigin(0.5);
    this.add.text(W/2,H/2-88,`${this.playerName}`,{ fontSize:"42px", color:"#fff", stroke:"#000", strokeThickness:6 }).setOrigin(0.5);
    this.add.text(W/2,H/2-20,`SCORE: ${this.score}`,{ fontSize:"62px", color:"#FFD700", stroke:"#000", strokeThickness:8 }).setOrigin(0.5);

    let rank="🐦 Новичок";
    if(this.score>=5000) rank="👑 Легенда";
    else if(this.score>=2500) rank="🏆 Мастер";
    else if(this.score>=1000) rank="🎯 Снайпер";
    this.add.text(W/2,H/2+42,rank,{ fontSize:"42px", color:"#00e5ff", stroke:"#000", strokeThickness:6 }).setOrigin(0.5);
    this.add.text(W/2,H/2+94, isNewRecord ? "🔥 Новый рекорд!" : `Место в рейтинге: #${this.finalRankPosition}`, {
      fontSize:"32px", color:isNewRecord ? "#FFD700" : "#fff", stroke:"#000", strokeThickness:5, fontStyle:"bold"
    }).setOrigin(0.5);

    this.drawEndLeaderboard(updatedLeaderboard, W, H);

    const btn=this.add.rectangle(W/2,H/2+330,400,90,0xff6f00).setStrokeStyle(5,0xFFD700).setInteractive({ useHandCursor: true });
    this.add.text(W/2,H/2+330,"МЕНЮ",{ fontSize:"48px", color:"#fff", stroke:"#000", strokeThickness:7, fontStyle:"bold" }).setOrigin(0.5);
    this.tweens.add({ targets:btn, scaleX:1.05, scaleY:1.05, duration:600, yoyo:true, repeat:-1 });
    btn.on("pointerdown", ()=>this.scene.start("MenuScene"));
  }

  drawEndLeaderboard(rows, W, H) {
    this.add.rectangle(W/2, H/2+205, 520, 190, 0x000000, 0.42).setStrokeStyle(4, 0xFFD700);
    this.add.text(W/2, H/2+126, "ТОП 5", {
      fontSize:"30px", color:"#FFD700", stroke:"#000", strokeThickness:5, fontStyle:"bold"
    }).setOrigin(0.5);

    rows.slice(0, 5).forEach((row, index) => {
      const y = H/2 + 162 + index * 28;
      const prefix = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index+1}.`;
      const rowColor = row.name === this.playerName && row.score === this.score ? "#7CFF00" : "#fff";
      this.add.text(W/2 - 210, y, `${prefix} ${row.name}`, {
        fontSize:"22px", color:rowColor, stroke:"#000", strokeThickness:4
      }).setOrigin(0, 0.5);
      this.add.text(W/2 + 210, y, `${row.score}`, {
        fontSize:"22px", color:rowColor, stroke:"#000", strokeThickness:4, fontStyle:"bold"
      }).setOrigin(1, 0.5);
    });
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
