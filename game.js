// Bird Blaster — PNG-версия (все ассеты из assets/)

const LEADERBOARD_KEY = "bird_blaster_leaderboard_v1";
const PLAYER_NAME_KEY = "bird_blaster_player_name_v1";
const COINS_KEY = "bird_blaster_coins_v1";
const SHOP_STATE_KEY = "bird_blaster_shop_v1";
const SHOP_ITEMS = {
  blasterPro: { id: "blasterPro", title: "Blaster PRO", price: 500 },
  bigBullet: { id: "bigBullet", title: "Big Bullet", price: 300 }
};
const GAME_MODE_KEY = "bird_blaster_mode_v1";
const MISSION_STATE_KEY = "bird_blaster_missions_v1";
const GAME_MODES = {
  classic: { id: "classic", title: "КЛАССИКА", time: 60, lives: 3 },
  timeAttack: { id: "timeAttack", title: "НА ВРЕМЯ", time: 45, lives: 2 }
};
const MISSIONS = [
  { id: "hits50", title: "Сбей 50 птиц", goal: 50, reward: 100, stat: "totalHits" },
  { id: "score3000", title: "Набери 3000 очков суммарно", goal: 3000, reward: 150, stat: "totalScore" },
  { id: "games5", title: "Сыграй 5 раундов", goal: 5, reward: 80, stat: "gamesPlayed" }
];

const WAVE_THEMES = {
  balanced: {
    name: "Ясное небо",
    tint: 0xffffff,
    sky: 0x8fd3ff,
    overlay: 0x8be9ff,
    overlayAlpha: 0.08,
    topBar: 0x5d4037,
    panel: 0x6d4c41,
    accent: "#7CFF00",
    subAccent: "#ffffff",
    weather: "clouds",
    bgKey: "bgDay"
  },
  speed: {
    name: "Шторм",
    tint: 0xcfe8ff,
    sky: 0x4d78c9,
    overlay: 0x1c3d7a,
    overlayAlpha: 0.28,
    topBar: 0x1d3557,
    panel: 0x274c77,
    accent: "#00e5ff",
    subAccent: "#d6efff",
    weather: "rain",
    bgKey: "bgStorm"
  },
  gold: {
    name: "Золотой час",
    tint: 0xffe3a1,
    sky: 0xffb347,
    overlay: 0xff9800,
    overlayAlpha: 0.18,
    topBar: 0x7b4f00,
    panel: 0x9c6644,
    accent: "#FFD700",
    subAccent: "#fff0bd",
    weather: "sparkles",
    bgKey: "bgSunset"
  },
  shadow: {
    name: "Ночная охота",
    tint: 0xb9b6ff,
    sky: 0x101d42,
    overlay: 0x05081a,
    overlayAlpha: 0.42,
    topBar: 0x1b1034,
    panel: 0x261447,
    accent: "#d2b3ff",
    subAccent: "#f1e7ff",
    weather: "stars",
    bgKey: "bgNight"
  },
  boss: {
    name: "Арена босса",
    tint: 0xffb3b3,
    sky: 0x3a0d0d,
    overlay: 0x8b0000,
    overlayAlpha: 0.36,
    topBar: 0x5a0f0f,
    panel: 0x7a1f1f,
    accent: "#ff8a65",
    subAccent: "#ffd7d7",
    weather: "embers",
    bgKey: "bgBoss"
  }
};
const ENABLE_GLOBAL_LEADERBOARD = !!window.BIRD_BLASTER_ENABLE_GLOBAL_LEADERBOARD;
const FIREBASE_CONFIG = window.BIRD_BLASTER_FIREBASE_CONFIG || null;
const LEADERBOARD_COLLECTION = window.BIRD_BLASTER_LEADERBOARD_COLLECTION || "leaderboard";


function getCoins() {
  try {
    return Math.max(0, Number(localStorage.getItem(COINS_KEY) || 0) || 0);
  } catch (e) {
    return 0;
  }
}

function setCoins(value) {
  const clean = Math.max(0, Math.floor(Number(value) || 0));
  try {
    localStorage.setItem(COINS_KEY, String(clean));
  } catch (e) {}
  return clean;
}

function addCoins(delta) {
  return setCoins(getCoins() + Math.max(0, Math.floor(Number(delta) || 0)));
}

function loadShopState() {
  try {
    const raw = JSON.parse(localStorage.getItem(SHOP_STATE_KEY) || '{}');
    return {
      blasterPro: !!raw.blasterPro,
      bigBullet: !!raw.bigBullet
    };
  } catch (e) {
    return { blasterPro: false, bigBullet: false };
  }
}

function saveShopState(state) {
  const safe = { blasterPro: !!state?.blasterPro, bigBullet: !!state?.bigBullet };
  try {
    localStorage.setItem(SHOP_STATE_KEY, JSON.stringify(safe));
  } catch (e) {}
  return safe;
}

function buyShopItem(itemId) {
  const item = SHOP_ITEMS[itemId];
  if (!item) return { ok: false, reason: 'missing' };
  const state = loadShopState();
  if (state[itemId]) return { ok: false, reason: 'owned', coins: getCoins(), state };
  const coins = getCoins();
  if (coins < item.price) return { ok: false, reason: 'coins', coins, state };
  setCoins(coins - item.price);
  state[itemId] = true;
  saveShopState(state);
  return { ok: true, coins: getCoins(), state };
}

function getSavedGameMode() {
  try {
    const raw = localStorage.getItem(GAME_MODE_KEY) || "classic";
    return GAME_MODES[raw] ? raw : "classic";
  } catch (e) {
    return "classic";
  }
}

function saveGameMode(modeId) {
  const safe = GAME_MODES[modeId] ? modeId : "classic";
  try {
    localStorage.setItem(GAME_MODE_KEY, safe);
  } catch (e) {}
  return safe;
}

function loadMissionState() {
  try {
    const raw = JSON.parse(localStorage.getItem(MISSION_STATE_KEY) || '{}');
    return {
      totalHits: Math.max(0, Number(raw.totalHits) || 0),
      totalScore: Math.max(0, Number(raw.totalScore) || 0),
      gamesPlayed: Math.max(0, Number(raw.gamesPlayed) || 0),
      claimed: Array.isArray(raw.claimed) ? raw.claimed : []
    };
  } catch (e) {
    return { totalHits: 0, totalScore: 0, gamesPlayed: 0, claimed: [] };
  }
}

function saveMissionState(state) {
  const safe = {
    totalHits: Math.max(0, Number(state?.totalHits) || 0),
    totalScore: Math.max(0, Number(state?.totalScore) || 0),
    gamesPlayed: Math.max(0, Number(state?.gamesPlayed) || 0),
    claimed: Array.isArray(state?.claimed) ? [...new Set(state.claimed)] : []
  };
  try {
    localStorage.setItem(MISSION_STATE_KEY, JSON.stringify(safe));
  } catch (e) {}
  return safe;
}

function getMissionRows() {
  const state = loadMissionState();
  return MISSIONS.map((m) => ({
    ...m,
    value: Math.min(state[m.stat] || 0, m.goal),
    completed: (state[m.stat] || 0) >= m.goal,
    claimed: state.claimed.includes(m.id)
  }));
}

function updateMissionProgress(delta = {}) {
  const state = loadMissionState();
  state.totalHits += Math.max(0, Number(delta.totalHits) || 0);
  state.totalScore += Math.max(0, Number(delta.totalScore) || 0);
  state.gamesPlayed += Math.max(0, Number(delta.gamesPlayed) || 0);
  const granted = [];
  for (const mission of MISSIONS) {
    const done = (state[mission.stat] || 0) >= mission.goal;
    if (done && !state.claimed.includes(mission.id)) {
      state.claimed.push(mission.id);
      addCoins(mission.reward);
      granted.push(mission);
    }
  }
  saveMissionState(state);
  return { state, granted, missions: getMissionRows(), coins: getCoins() };
}

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

function loadLocalLeaderboard() {
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

function saveLocalLeaderboard(rows) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify((rows || []).slice(0, 10)));
  } catch (e) {}
}

function addLocalLeaderboardScore(name, score) {
  const rows = loadLocalLeaderboard();
  rows.push({
    name: sanitizePlayerName(name) || "Игрок",
    score: Math.max(0, Math.round(score || 0)),
    date: new Date().toISOString().slice(0, 10)
  });
  rows.sort((a, b) => b.score - a.score);
  const trimmed = rows.slice(0, 10);
  saveLocalLeaderboard(trimmed);
  return trimmed;
}

function getLocalLeaderboardRank(score) {
  const rows = loadLocalLeaderboard();
  const better = rows.filter((row) => row.score > score).length;
  return better + 1;
}

const LeaderboardService = {
  db: null,
  initialized: false,
  enabled: ENABLE_GLOBAL_LEADERBOARD,
  statusLabel: ENABLE_GLOBAL_LEADERBOARD ? "ОБЩИЙ РЕЙТИНГ" : "ЛОКАЛЬНЫЙ РЕЙТИНГ",

  init() {
    if (this.initialized) return this.db;
    this.initialized = true;

    if (!this.enabled || typeof firebase === "undefined" || !FIREBASE_CONFIG || !FIREBASE_CONFIG.projectId || String(FIREBASE_CONFIG.projectId).includes("PASTE_")) {
      this.enabled = false;
      this.statusLabel = "ЛОКАЛЬНЫЙ РЕЙТИНГ";
      return null;
    }

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      this.db = firebase.firestore();
      this.statusLabel = "ОБЩИЙ РЕЙТИНГ";
      return this.db;
    } catch (e) {
      console.warn("Firebase init failed, fallback to local leaderboard:", e);
      this.enabled = false;
      this.statusLabel = "ЛОКАЛЬНЫЙ РЕЙТИНГ";
      return null;
    }
  },

  async loadTop(limitCount = 10) {
    const db = this.init();
    if (!db) return loadLocalLeaderboard();

    try {
      const snapshot = await db.collection(LEADERBOARD_COLLECTION)
        .orderBy("score", "desc")
        .orderBy("createdAt", "asc")
        .limit(limitCount)
        .get();

      const rows = snapshot.docs.map((doc) => {
        const data = doc.data() || {};
        return {
          name: sanitizePlayerName(data.name || "Игрок") || "Игрок",
          score: Number(data.score) || 0,
          date: data.date || new Date().toISOString().slice(0, 10)
        };
      });

      saveLocalLeaderboard(rows);
      return rows;
    } catch (e) {
      console.warn("Global leaderboard load failed, using local:", e);
      return loadLocalLeaderboard();
    }
  },

  async addScore(name, score) {
    const cleanName = sanitizePlayerName(name) || "Игрок";
    const cleanScore = Math.max(0, Math.round(score || 0));
    const db = this.init();

    if (!db) {
      return addLocalLeaderboardScore(cleanName, cleanScore);
    }

    try {
      if (cleanScore > 0) {
        await db.collection(LEADERBOARD_COLLECTION).add({
          name: cleanName,
          score: cleanScore,
          date: new Date().toISOString().slice(0, 10),
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      return await this.loadTop(10);
    } catch (e) {
      console.warn("Global leaderboard save failed, using local:", e);
      return addLocalLeaderboardScore(cleanName, cleanScore);
    }
  },

  async getRank(score) {
    const cleanScore = Math.max(0, Math.round(score || 0));
    const db = this.init();

    if (!db) {
      return getLocalLeaderboardRank(cleanScore);
    }

    try {
      const better = await db.collection(LEADERBOARD_COLLECTION)
        .where("score", ">", cleanScore)
        .get();
      return better.size + 1;
    } catch (e) {
      console.warn("Global rank load failed, using local:", e);
      return getLocalLeaderboardRank(cleanScore);
    }
  }
};

class BootScene extends Phaser.Scene {
  constructor() { super("BootScene"); }

  preload() {
    this.load.on("loaderror", (file) => {
      console.warn("Asset not found:", file.key, "— using fallback");
    });

    const W = this.scale.width, H = this.scale.height;
    const fillBg = this.add.rectangle(W/2, H/2, 400, 20, 0x333333);
    const fill = this.add.rectangle(W/2 - 200, H/2, 0, 16, 0x00e5ff).setOrigin(0, 0.5);
    this.add.text(W/2, H/2 - 36, "Загрузка...", {
      fontSize:"28px", color:"#fff", stroke:"#000", strokeThickness:4
    }).setOrigin(0.5);

    this.load.on("progress", (v) => { fill.width = 400 * v; });

    this.load.image("bg",        "assets/bg.png");
    this.load.image("bgDay",     "assets/bg_day.png");
    this.load.image("bgStorm",   "assets/bg_storm.png");
    this.load.image("bgSunset",  "assets/bg_sunset.png");
    this.load.image("bgNight",   "assets/bg_night.png");
    this.load.image("bgBoss",    "assets/bg_boss.png");
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
    LeaderboardService.init();
    this.registry.set("playerName", getSavedPlayerName());
    this.registry.set("coins", getCoins());
    this.registry.set("shopState", loadShopState());
    this.registry.set("gameMode", getSavedGameMode());
    this.registry.set("missions", getMissionRows());
    this.scene.start("MenuScene");
  }
}

class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
    this.boardRowTexts = [];
  }

  create() {
    const { width: W, height: H } = this.scale;
    this.skyBackdrop = this.add.rectangle(W/2, H/2, W, H, 0x8fd3ff, 1);
    this.bg = this.add.image(W/2, H/2, "bgDay").setDisplaySize(W, H);
    this.themeOverlay = this.add.rectangle(W/2, H/2, W, H, 0x8be9ff, 0.05).setDepth(1);

    this.add.rectangle(W/2, H*0.102, 520, 116, 0x5d4037, 0.92).setStrokeStyle(7, 0x3e2723).setDepth(3);
    this.add.rectangle(W/2, H*0.102, 508, 102, 0x6d4c41, 0.96).setDepth(3);
    this.add.text(W/2, H*0.072, "BIRD", { fontSize:"84px", color:"#FFD700", stroke:"#7f4000", strokeThickness:12, fontStyle:"bold" }).setOrigin(0.5).setDepth(4);
    this.add.text(W/2, H*0.128, "BLASTER", { fontSize:"56px", color:"#00e5ff", stroke:"#003366", strokeThickness:9, fontStyle:"bold" }).setOrigin(0.5).setDepth(4);

    this.topCoinsCard = this.add.rectangle(W*0.18, H*0.205, 180, 60, 0x000000, 0.45).setStrokeStyle(4, 0xFFD700);
    this.coinsText = this.add.text(W*0.18, H*0.205, "", {
      fontSize:"28px", color:"#FFD700", stroke:"#000", strokeThickness:5, fontStyle:"bold"
    }).setOrigin(0.5).setDepth(4);

    this.shopBtn = this.add.rectangle(W*0.82, H*0.205, 180, 60, 0x6a1b9a, 0.95).setStrokeStyle(5, 0xFFD700).setInteractive({ useHandCursor: true }).setDepth(3);
    this.shopBtnLabel = this.add.text(W*0.82, H*0.205, "🛒 SHOP", { fontSize:"28px", color:"#fff", stroke:"#000", strokeThickness:5, fontStyle:"bold" }).setOrigin(0.5).setDepth(4);
    this.shopBtn.on("pointerdown", () => this.openShopModal());

    const birds = [
      { key:"birdBlue",  pts:"100", x:W*0.19, label:"Обычная" },
      { key:"birdRed",   pts:"150", x:W*0.50, label:"Быстрая" },
      { key:"birdGold",  pts:"300", x:W*0.81, label:"Бонусная" },
    ];
    birds.forEach(({ key, pts, x, label }) => {
      const img = this.add.image(x, H*0.315, key).setScale(0.12).setDepth(4);
      this.tweens.add({ targets:img, y:H*0.315-12, duration:900+Math.random()*400, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });
      this.add.text(x, H*0.378, `+${pts}`, { fontSize:"34px", color:"#FFD700", stroke:"#000", strokeThickness:5 }).setOrigin(0.5).setDepth(4);
      this.add.text(x, H*0.417, label, { fontSize:"22px", color:"#fff", stroke:"#000", strokeThickness:4 }).setOrigin(0.5).setDepth(4);
    });

    this.add.rectangle(W/2, H*0.505, 420, 62, 0x000000, 0.40).setStrokeStyle(3, 0xffffff, 0.35).setDepth(3);
    this.add.text(W/2, H*0.505, "ЗАЖМИ И ОТПУСТИ = ВЫСТРЕЛ", { fontSize:"26px", color:"#fff", stroke:"#000", strokeThickness:5, fontStyle:"bold" }).setOrigin(0.5).setDepth(4);

    const gun = this.add.image(W/2, H*0.59, "gun").setScale(0.235).setDepth(4);
    this.tweens.add({ targets:gun, y:H*0.59-8, duration:1200, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });

    this.nameCard = this.add.rectangle(W/2, H*0.665, 420, 54, 0x000000, 0.42).setStrokeStyle(3, 0x00e5ff, 0.8).setDepth(3);
    this.nameText = this.add.text(W/2, H*0.665, "", {
      fontSize:"26px", color:"#fff", stroke:"#000", strokeThickness:5, fontStyle:"bold"
    }).setOrigin(0.5).setDepth(4);

    this.modeBtn = this.add.rectangle(W*0.26, H*0.742, 240, 68, 0x1565c0).setStrokeStyle(5, 0xFFD700).setInteractive({ useHandCursor: true }).setDepth(3);
    this.modeText = this.add.text(W*0.26, H*0.742, "", { fontSize:"23px", color:"#fff", stroke:"#000", strokeThickness:5, fontStyle:"bold", align:"center" }).setOrigin(0.5).setDepth(4);
    this.modeBtn.on("pointerdown", () => this.toggleMode());

    this.versionText = this.add.text(W*0.75, H*0.742, "v11 UI", { fontSize:"28px", color:"#b3e5fc", stroke:"#000", strokeThickness:5, fontStyle:"bold" }).setOrigin(0.5).setDepth(4);

    this.drawLeaderboardShell();
    this.refreshLeaderboard();

    const btnY = H*0.94;
    const btn = this.add.rectangle(W/2, btnY, 410, 86, 0xff6f00).setStrokeStyle(6, 0xFFD700).setInteractive({ useHandCursor: true }).setDepth(4);
    this.add.text(W/2, btnY, "ИГРАТЬ!", { fontSize:"50px", color:"#fff", stroke:"#000", strokeThickness:7, fontStyle:"bold" }).setOrigin(0.5).setDepth(5);
    this.tweens.add({ targets:btn, scaleX:1.03, scaleY:1.03, duration:700, yoyo:true, repeat:-1 });
    btn.on("pointerdown", () => this.openNameModal());

    this.refreshPlayerNameText();
    this.refreshCoinsText();
    this.refreshModeText();
  }

  refreshPlayerNameText() {
    const currentName = this.registry.get("playerName") || getSavedPlayerName() || "Не указано";
    this.nameText.setText(`Игрок: ${currentName}`);
  }

  refreshCoinsText() {
    const coins = getCoins();
    this.registry.set("coins", coins);
    if (this.coinsText) this.coinsText.setText(`🪙 ${coins}`);
  }

  refreshModeText() {
    const modeId = this.registry.get("gameMode") || getSavedGameMode();
    const mode = GAME_MODES[modeId] || GAME_MODES.classic;
    if (this.modeText) this.modeText.setText(`РЕЖИМ\n${mode.title}`);
  }

  toggleMode() {
    const current = this.registry.get("gameMode") || getSavedGameMode();
    const next = current === "classic" ? "timeAttack" : "classic";
    this.registry.set("gameMode", saveGameMode(next));
    this.refreshModeText();
  }

  refreshMissionTexts() {
    this.missionTexts.forEach((item) => item.destroy());
    this.missionTexts = [];
    const missions = getMissionRows();
    this.registry.set("missions", missions);
    missions.forEach((mission, index) => {
      const y = this.boardY + 98 + index * 34;
      const done = mission.claimed;
      const color = done ? "#7CFF00" : "#fff";
      const label = `${done ? "✅" : "•"} ${mission.title}`;
      const progress = done ? `+${mission.reward} взято` : `${mission.value}/${mission.goal}  (+${mission.reward})`;
      const left = this.add.text(this.boardX - 250, y, label, {
        fontSize:"18px", color, stroke:"#000", strokeThickness:4
      }).setOrigin(0, 0.5).setDepth(4);
      const right = this.add.text(this.boardX + 250, y, progress, {
        fontSize:"18px", color: done ? "#7CFF00" : "#FFD700", stroke:"#000", strokeThickness:4, fontStyle:"bold"
      }).setOrigin(1, 0.5).setDepth(4);
      this.missionTexts.push(left, right);
    });
  }

  drawLeaderboardShell() {
    const { width: W, height: H } = this.scale;
    const boardX = W / 2;
    const boardY = H * 0.83;
    this.boardX = boardX;
    this.boardY = boardY;

    this.boardPanel = this.add.rectangle(boardX, boardY, 560, 238, 0x000000, 0.46).setStrokeStyle(4, 0xFFD700);
    this.boardTitle = this.add.text(boardX, boardY - 94, "🏆 ТОП ИГРОКОВ", {
      fontSize:"30px", color:"#FFD700", stroke:"#000", strokeThickness:5, fontStyle:"bold"
    }).setOrigin(0.5).setDepth(4);
    this.boardModeText = this.add.text(boardX, boardY - 66, LeaderboardService.statusLabel, {
      fontSize:"17px", color:"#00e5ff", stroke:"#000", strokeThickness:4, fontStyle:"bold"
    }).setOrigin(0.5).setDepth(4);
    this.boardLoadingText = this.add.text(boardX, boardY - 6, "Загрузка рейтинга...", {
      fontSize:"24px", align:"center", color:"#fff", stroke:"#000", strokeThickness:4
    }).setOrigin(0.5).setDepth(4);

    this.missionTitle = this.add.text(boardX, boardY + 64, "🎯 МИССИИ", {
      fontSize:"28px", color:"#00e5ff", stroke:"#000", strokeThickness:5, fontStyle:"bold"
    }).setOrigin(0.5).setDepth(4);
    this.missionTexts = [];
    this.refreshMissionTexts();
  }

  clearBoardRows() {
    this.boardRowTexts.forEach((item) => item.destroy());
    this.boardRowTexts = [];
  }

  async refreshLeaderboard() {
    this.clearBoardRows();
    this.boardLoadingText.setVisible(true).setText("Загрузка рейтинга...");
    this.boardModeText.setText(LeaderboardService.statusLabel);

    const rows = await LeaderboardService.loadTop(10);
    this.boardModeText.setText(LeaderboardService.statusLabel);

    if (!this.scene.isActive()) return;

    if (!rows.length) {
      this.boardLoadingText.setVisible(true).setText("Пока нет результатов\nСтань первым в рейтинге!");
      return;
    }

    this.boardLoadingText.setVisible(false);
    rows.slice(0, 5).forEach((row, index) => {
      const y = this.boardY - 34 + index * 30;
      const prefix = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index+1}.`;
      const left = this.add.text(this.boardX - 228, y, `${prefix} ${row.name}`, {
        fontSize:"22px", color:"#fff", stroke:"#000", strokeThickness:4
      }).setOrigin(0, 0.5).setDepth(4);
      const right = this.add.text(this.boardX + 228, y, `${row.score}`, {
        fontSize:"22px", color:"#7CFF00", stroke:"#000", strokeThickness:4, fontStyle:"bold"
      }).setOrigin(1, 0.5).setDepth(4);
      this.boardRowTexts.push(left, right);
    });
  }

  openShopModal() {
    const modal = document.getElementById("shop-modal");
    const closeBtn = document.getElementById("close-shop-btn");
    const buyBlasterBtn = document.getElementById("buy-blaster-pro-btn");
    const buyBulletBtn = document.getElementById("buy-big-bullet-btn");
    const coinsLabel = document.getElementById("shop-coins-label");
    if (!modal || !closeBtn || !buyBlasterBtn || !buyBulletBtn || !coinsLabel) return;

    const render = () => {
      const state = loadShopState();
      const coins = getCoins();
      this.registry.set("shopState", state);
      this.registry.set("coins", coins);
      this.refreshCoinsText();
      coinsLabel.textContent = `Монеты: ${coins}`;

      const config = [
        { btn: buyBlasterBtn, owned: state.blasterPro, price: SHOP_ITEMS.blasterPro.price, buy: "Купить", own: "Куплено ✓" },
        { btn: buyBulletBtn, owned: state.bigBullet, price: SHOP_ITEMS.bigBullet.price, buy: "Купить", own: "Куплено ✓" }
      ];
      config.forEach(({ btn, owned, price, buy, own }) => {
        btn.disabled = owned;
        btn.textContent = owned ? own : `${buy} — ${price}`;
      });
    };

    const closeModal = () => {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
      closeBtn.onclick = null;
      buyBlasterBtn.onclick = null;
      buyBulletBtn.onclick = null;
    };

    buyBlasterBtn.onclick = () => {
      const res = buyShopItem("blasterPro");
      if (!res.ok && res.reason === "coins") alert("Недостаточно монет");
      render();
    };
    buyBulletBtn.onclick = () => {
      const res = buyShopItem("bigBullet");
      if (!res.ok && res.reason === "coins") alert("Недостаточно монет");
      render();
    };
    closeBtn.onclick = closeModal;
    render();
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
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
      this.scene.start("GameScene", { playerName: finalName || "Игрок", gameMode: this.registry.get("gameMode") || getSavedGameMode() });
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
    this.modeId      = data?.gameMode || this.registry.get("gameMode") || getSavedGameMode();
    this.mode        = GAME_MODES[this.modeId] || GAME_MODES.classic;
    this.score       = 0;
    this.lives       = this.mode.lives;
    this.timeLeft    = this.mode.time;
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
    this.finalLeaderboardRows = [];
    this.coinReward = 0;
    this.shopState = loadShopState();
    this.shotCooldown = this.shopState.blasterPro ? 170 : 260;
    this.lastShotAt = 0;
    this.bulletScaleBonus = this.shopState.bigBullet ? 1.3 : 1;
    this.sessionHits = 0;
    this.doubleScoreActive = false;
    this.doubleScoreReady = false;
    this.slowMoActive = false;
    this.slowMoReady = false;
    this.waveIndex = 0;
    this.waveBirdTarget = 0;
    this.waveBirdSpawned = 0;
    this.waveInTransition = false;
    this.waveProfile = null;
    this.spawnDelayCurrent = 1100;
    this.speedWaveMultiplier = 1;
    this.bossActive = false;
    this.bossSpawnedThisWave = false;
    this.bossBird = null;
    this.timePressureLevel = 0;
  }

  create() {
    const { width: W, height: H } = this.scale;
    this.skyBackdrop = this.add.rectangle(W/2, H/2, W, H, 0x8fd3ff, 1);
    this.bg = this.add.image(W/2, H/2, "bgDay").setDisplaySize(W, H);
    this.themeOverlay = this.add.rectangle(W/2, H/2, W, H, 0x8be9ff, 0.08).setDepth(1);

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

    this.topBar = this.add.rectangle(W/2, 60, W, 120, 0x5d4037, 0.88);
    this.topBarInner = this.add.rectangle(W/2, 60, W-4, 116, 0x6d4c41, 0.5);
    this.timeText  = this.add.text(24, 20, `⏱ ${this.timeLeft}`, { fontSize:"44px", color:"#FFD700", stroke:"#000", strokeThickness:6 });
    this.scoreText = this.add.text(W/2, 20, "SCORE: 0", { fontSize:"44px", color:"#fff", stroke:"#000", strokeThickness:6 }).setOrigin(0.5, 0);
    this.modeHudText = this.add.text(W/2, 112, this.mode.title, { fontSize:"22px", color:"#00e5ff", stroke:"#000", strokeThickness:4, fontStyle:"bold" }).setOrigin(0.5,0);
    this.comboText = this.add.text(W/2, 72, "", { fontSize:"28px", color:"#FFD700", stroke:"#000", strokeThickness:5, fontStyle:"bold" }).setOrigin(0.5, 0);
    this.waveText = this.add.text(W/2, 144, "", { fontSize:"26px", color:"#7CFF00", stroke:"#000", strokeThickness:5, fontStyle:"bold" }).setOrigin(0.5, 0);
    this.waveSubText = this.add.text(W/2, 174, "", { fontSize:"18px", color:"#fff", stroke:"#000", strokeThickness:4, fontStyle:"bold" }).setOrigin(0.5, 0);
    this.bossHpText = this.add.text(W/2, 202, "", { fontSize:"28px", color:"#ff8a65", stroke:"#000", strokeThickness:5, fontStyle:"bold" }).setOrigin(0.5, 0).setVisible(false);
    this.themeNameText = this.add.text(W/2, 228, "", { fontSize:"18px", color:"#fff", stroke:"#000", strokeThickness:4, fontStyle:"bold" }).setOrigin(0.5, 0);
    this.livesText = this.add.text(W-20, 20, "❤❤❤", { fontSize:"38px", color:"#ff4d4d", stroke:"#000", strokeThickness:5 }).setOrigin(1, 0);
    this.playerText = this.add.text(24, 132, `Игрок: ${this.playerName}`, {
      fontSize:"24px", color:"#fff", stroke:"#000", strokeThickness:4
    });
    this.coinsHudText = this.add.text(W-20, 132, `🪙 ${getCoins()}`, {
      fontSize:"24px", color:"#FFD700", stroke:"#000", strokeThickness:4
    }).setOrigin(1, 0);

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

    this.slowBtn = this.add.rectangle(100, H - 120, 140, 62, 0x455a64, 0.95).setStrokeStyle(4, 0x90caf9).setInteractive({ useHandCursor: true }).setDepth(15);
    this.slowBtnText = this.add.text(100, H - 120, "SLOW\n6 HIT", { fontSize:"20px", align:"center", color:"#fff", stroke:"#000", strokeThickness:4, fontStyle:"bold" }).setOrigin(0.5).setDepth(16);
    this.slowBtn.on("pointerdown", () => this.activateSlowMo());
    this.x2Btn = this.add.rectangle(W - 100, H - 120, 140, 62, 0x6a1b9a, 0.95).setStrokeStyle(4, 0xffcc80).setInteractive({ useHandCursor: true }).setDepth(15);
    this.x2BtnText = this.add.text(W - 100, H - 120, "X2\n10 HIT", { fontSize:"20px", align:"center", color:"#fff", stroke:"#000", strokeThickness:4, fontStyle:"bold" }).setOrigin(0.5).setDepth(16);
    this.x2Btn.on("pointerdown", () => this.activateDoubleScore());
    this.updateBoosterButtons();

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

    this.applyWaveTheme(this.getThemeForWaveProfile("balanced"), { silent: true });
    this.startWave(1);
    this.timerEvent = this.time.addEvent({ delay:1000, callback:this.updateGameTimer, callbackScope:this, loop:true });
  }

  update(time, delta) {
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
      if(!bird.isBoss && (bird.x < -180 || bird.x > W+180 || bird.y < -180 || bird.y > H+180)) {
        bird.destroy();
      }
    }

    this.checkWaveProgress();
    this.updateWeatherLayer(delta || 16);
  }

  getWaveProfile(index) {
    const cycle = (index - 1) % 4;
    if (cycle === 0) return { id: "balanced", label: "Сбалансированная стая", weights: { blue: 56, red: 22, black: 10, gold: 12 } };
    if (cycle === 1) return { id: "speed", label: "Шторм быстрых птиц", weights: { blue: 35, red: 45, black: 10, gold: 10 } };
    if (cycle === 2) return { id: "gold", label: "Золотая лихорадка", weights: { blue: 28, red: 18, black: 8, gold: 46 } };
    return { id: "shadow", label: "Теневая волна", weights: { blue: 34, red: 24, black: 26, gold: 16 } };
  }

  getAliveBirdCount(includeBoss = true) {
    return this.birds.children.entries.filter((bird) => bird.active && (includeBoss || !bird.isBoss)).length;
  }

  showWaveBanner(title, subtitle = "") {
    const centerX = this.scale.width / 2;
    const panel = this.add.rectangle(centerX, 300, 420, subtitle ? 112 : 84, 0x000000, 0.42).setStrokeStyle(4, 0xFFD700).setDepth(28);
    const t1 = this.add.text(centerX, subtitle ? 278 : 300, title, {
      fontSize:"42px", color:"#FFD700", stroke:"#000", strokeThickness:7, fontStyle:"bold"
    }).setOrigin(0.5).setDepth(29);
    const nodes = [panel, t1];
    if (subtitle) {
      nodes.push(this.add.text(centerX, 322, subtitle, {
        fontSize:"22px", color:"#fff", stroke:"#000", strokeThickness:5, fontStyle:"bold"
      }).setOrigin(0.5).setDepth(29));
    }
    this.tweens.add({
      targets:nodes,
      alpha:0,
      y:'-=28',
      duration:1100,
      delay:700,
      onComplete:() => nodes.forEach((node) => node.destroy())
    });
  }

  getThemeForWaveProfile(profileId, forceBoss = false) {
    if (forceBoss) return WAVE_THEMES.boss;
    return WAVE_THEMES[profileId] || WAVE_THEMES.balanced;
  }

  buildWeatherLayer(theme) {
    if (this.weatherParticles) {
      this.weatherParticles.destroy(true);
      this.weatherParticles = null;
    }
    this.weatherParticles = this.add.group();
    const { width: W, height: H } = this.scale;
    const kind = theme.weather;
    const createParticle = (shape, x, y, color, alpha) => {
      const obj = shape === 'circle'
        ? this.add.circle(x, y, 2, color, alpha)
        : this.add.rectangle(x, y, shape === 'rain' ? 3 : 4, shape === 'rain' ? 22 : 4, color, alpha);
      obj.setDepth(3);
      this.weatherParticles.add(obj);
      return obj;
    };

    const count = kind === 'rain' ? 60 : kind === 'clouds' ? 14 : kind === 'stars' ? 42 : kind === 'sparkles' ? 28 : 34;
    for (let i = 0; i < count; i++) {
      if (kind === 'rain') {
        const p = createParticle('rain', Phaser.Math.Between(0, W), Phaser.Math.Between(-H, H), 0xb3e5fc, 0.45);
        p.speedY = Phaser.Math.Between(850, 1150);
        p.speedX = Phaser.Math.Between(-150, -60);
      } else if (kind === 'clouds') {
        const p = this.add.ellipse(Phaser.Math.Between(0, W), Phaser.Math.Between(120, H * 0.52), Phaser.Math.Between(120, 220), Phaser.Math.Between(28, 54), 0xffffff, 0.11);
        p.setDepth(2);
        p.speedX = Phaser.Math.Between(10, 24);
        p.scaleY = Phaser.Math.FloatBetween(0.8, 1.2);
        this.weatherParticles.add(p);
      } else if (kind === 'stars') {
        const p = createParticle('circle', Phaser.Math.Between(0, W), Phaser.Math.Between(110, H * 0.65), 0xffffff, Phaser.Math.FloatBetween(0.35, 0.9));
        p.baseAlpha = p.alpha;
        p.twinkleOffset = Phaser.Math.FloatBetween(0, Math.PI * 2);
      } else if (kind === 'sparkles') {
        const p = createParticle('circle', Phaser.Math.Between(0, W), Phaser.Math.Between(120, H * 0.68), i % 3 === 0 ? 0xfff59d : 0xffd54f, Phaser.Math.FloatBetween(0.35, 0.85));
        p.baseAlpha = p.alpha;
        p.twinkleOffset = Phaser.Math.FloatBetween(0, Math.PI * 2);
        p.floatY = Phaser.Math.FloatBetween(0.2, 0.7);
      } else {
        const p = createParticle('circle', Phaser.Math.Between(0, W), Phaser.Math.Between(150, H), i % 2 === 0 ? 0xff7043 : 0xffcc80, Phaser.Math.FloatBetween(0.3, 0.8));
        p.speedY = Phaser.Math.Between(40, 110);
        p.driftX = Phaser.Math.FloatBetween(-0.2, 0.2);
      }
    }
  }

  applyWaveTheme(theme, options = {}) {
    if (!theme || !this.bg) return;
    this.currentTheme = theme;
    if (theme.bgKey && this.bg.texture?.key !== theme.bgKey) {
      this.bg.setTexture(theme.bgKey).setDisplaySize(this.scale.width, this.scale.height);
    }
    this.bg.clearTint();
    if (this.skyBackdrop) this.skyBackdrop.setFillStyle(theme.sky, 1);
    if (this.themeOverlay) this.themeOverlay.setFillStyle(theme.overlay, Math.min(theme.overlayAlpha, 0.18));
    if (this.topBar) this.topBar.setFillStyle(theme.topBar, 0.88);
    if (this.topBarInner) this.topBarInner.setFillStyle(theme.panel, 0.55);
    if (this.waveText) this.waveText.setColor(theme.accent);
    if (this.waveSubText) this.waveSubText.setColor(theme.subAccent);
    if (this.modeHudText) this.modeHudText.setColor(theme.accent);
    if (this.themeNameText) this.themeNameText.setText(`ТЕМА: ${theme.name}`).setColor(theme.subAccent);
    this.buildWeatherLayer(theme);
    if (!options.silent) {
      const label = this.add.text(this.scale.width / 2, 246, `${theme.name}`, {
        fontSize:"24px", color:theme.subAccent, stroke:"#000", strokeThickness:5, fontStyle:"bold"
      }).setOrigin(0.5).setDepth(27);
      this.tweens.add({ targets:label, alpha:0, y:210, duration:1200, onComplete:() => label.destroy() });
    }
  }

  updateWeatherLayer(delta) {
    if (!this.weatherParticles) return;
    const { width: W, height: H } = this.scale;
    const secs = delta / 1000;
    this.weatherParticles.getChildren().forEach((p) => {
      if (!p.active) return;
      if (this.currentTheme?.weather === 'rain') {
        p.x += p.speedX * secs;
        p.y += p.speedY * secs;
        if (p.y > H + 40 || p.x < -40) {
          p.x = Phaser.Math.Between(0, W + 80);
          p.y = Phaser.Math.Between(-220, -40);
        }
      } else if (this.currentTheme?.weather === 'clouds') {
        p.x += p.speedX * secs;
        if (p.x - p.width/2 > W + 40) p.x = -p.width / 2 - 40;
      } else if (this.currentTheme?.weather === 'stars' || this.currentTheme?.weather === 'sparkles') {
        const t = this.time.now / 500 + (p.twinkleOffset || 0);
        p.alpha = Math.max(0.15, (p.baseAlpha || 0.5) + Math.sin(t) * 0.25);
        if (this.currentTheme?.weather === 'sparkles') p.y += Math.sin(this.time.now / 700 + (p.twinkleOffset || 0)) * (p.floatY || 0.4);
      } else if (this.currentTheme?.weather === 'embers') {
        p.x += Math.sin(this.time.now / 400 + p.y * 0.01) * (p.driftX || 0.1);
        p.y -= p.speedY * secs;
        if (p.y < 110) {
          p.x = Phaser.Math.Between(0, W);
          p.y = Phaser.Math.Between(H - 80, H + 40);
        }
      }
    });
  }

  startWave(index) {
    if (this.isGameOver) return;
    this.waveIndex = index;
    this.waveInTransition = false;
    this.waveProfile = this.getWaveProfile(index);
    this.applyWaveTheme(this.getThemeForWaveProfile(this.waveProfile.id));
    const modeBonus = this.modeId === "timeAttack" ? -1 : 0;
    this.waveBirdTarget = Math.max(6, 7 + index * 2 + modeBonus);
    this.waveBirdSpawned = 0;
    this.bossSpawnedThisWave = false;
    this.bossActive = false;
    this.bossBird = null;
    const pressureFactor = this.timePressureLevel === 2 ? 140 : this.timePressureLevel === 1 ? 80 : 0;
    this.spawnDelayCurrent = Math.max(380, (this.modeId === "timeAttack" ? 930 : 1040) - index * 55 - pressureFactor);
    this.speedWaveMultiplier = 1 + (index - 1) * 0.1 + (this.modeId === "timeAttack" ? 0.06 : 0) + this.timePressureLevel * 0.06;
    this.waveText.setText(`🌊 WAVE ${index}`);
    this.waveSubText.setText(`${this.waveProfile.label} • ${this.currentTheme?.name || ""}`);
    this.bossHpText.setVisible(false).setText("");
    this.showWaveBanner(`WAVE ${index}`, this.waveProfile.label);
    this.setSpawnDelay(this.spawnDelayCurrent);
  }

  scheduleNextWave(delay = 1200) {
    if (this.isGameOver || this.waveInTransition) return;
    this.waveInTransition = true;
    this.showWaveBanner("WAVE CLEAR", `Готовься к wave ${this.waveIndex + 1}`);
    this.time.delayedCall(delay, () => {
      if (this.isGameOver) return;
      this.startWave(this.waveIndex + 1);
    });
  }

  shouldSpawnBossThisWave() {
    return this.waveIndex > 0 && this.waveIndex % 3 === 0;
  }

  spawnBoss() {
    if (this.isGameOver || this.bossActive) return;
    const { width:W } = this.scale;
    this.bossSpawnedThisWave = true;
    this.bossActive = true;
    const startLeft = Phaser.Math.Between(0, 1) === 0;
    const boss = this.birds.create(startLeft ? 120 : W - 120, Phaser.Math.Between(260, 400), this.waveIndex % 2 === 0 ? "birdBlack" : "birdGold");
    boss.setScale(0.28);
    boss.isBoss = true;
    boss.points = 1000 + this.waveIndex * 250;
    boss.hp = 8 + this.waveIndex * 2 + (this.modeId === "timeAttack" ? 2 : 0);
    boss.maxHp = boss.hp;
    boss.setFlipX(!startLeft);
    boss.body.allowGravity = false;
    boss.body.setImmovable(true);
    boss.body.moves = false;
    this.bossBird = boss;

    boss.moveTween = this.tweens.add({
      targets:boss,
      x:startLeft ? W - 120 : 120,
      duration:Math.max(1800, 3600 - this.waveIndex * 120),
      yoyo:true,
      repeat:-1,
      ease:"Sine.easeInOut"
    });
    boss.bobTween = this.tweens.add({
      targets:boss,
      y:boss.y + 80,
      duration:1300,
      yoyo:true,
      repeat:-1,
      ease:"Sine.easeInOut"
    });

    this.applyWaveTheme(this.getThemeForWaveProfile(this.waveProfile?.id, true));
    this.bossHpText.setVisible(true).setText(`👑 BOSS HP: ${boss.hp}/${boss.maxHp}`);
    this.showWaveBanner("👑 BOSS WAVE", `HP ${boss.hp} · награда ${boss.points}`);
  }

  updateBossHpUI() {
    if (this.bossBird && this.bossBird.active) {
      this.bossHpText.setVisible(true).setText(`👑 BOSS HP: ${this.bossBird.hp}/${this.bossBird.maxHp}`);
    } else {
      this.bossHpText.setVisible(false).setText("");
    }
  }

  checkWaveProgress() {
    if (this.isGameOver || this.waveInTransition) return;
    if (!this.bossActive && this.waveBirdSpawned >= this.waveBirdTarget && this.getAliveBirdCount(false) === 0) {
      if (this.shouldSpawnBossThisWave() && !this.bossSpawnedThisWave) {
        this.spawnBoss();
      } else if (!this.shouldSpawnBossThisWave() || this.bossSpawnedThisWave) {
        this.scheduleNextWave(this.bossSpawnedThisWave ? 1600 : 900);
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
    if (this.time.now - this.lastShotAt < this.shotCooldown) return;
    this.lastShotAt = this.time.now;
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
        b.setScale(0.16 * this.bulletScaleBonus).setTint(0xFFD700);
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
    bullet.setScale((0.06 + t * 0.06) * this.bulletScaleBonus);
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

  updateBoosterButtons() {
    if (!this.slowBtn || !this.x2Btn) return;
    const slowColor = this.slowMoActive ? 0x00acc1 : (this.slowMoReady ? 0x039be5 : 0x455a64);
    const x2Color = this.doubleScoreActive ? 0xff8f00 : (this.doubleScoreReady ? 0xef6c00 : 0x6a1b9a);
    this.slowBtn.setFillStyle(slowColor, 0.95);
    this.x2Btn.setFillStyle(x2Color, 0.95);
    this.slowBtnText.setText(this.slowMoActive ? "SLOW\nON" : (this.slowMoReady ? "SLOW\nREADY" : "SLOW\n6 HIT"));
    this.x2BtnText.setText(this.doubleScoreActive ? "X2\nON" : (this.doubleScoreReady ? "X2\nREADY" : "X2\n10 HIT"));
  }

  activateSlowMo() {
    if (this.isGameOver || !this.slowMoReady || this.slowMoActive) return;
    this.slowMoReady = false;
    this.slowMoActive = true;
    this.updateBoosterButtons();
    this.birds.children.entries.forEach((bird) => {
      if (bird?.body) {
        bird.body.velocity.x *= 0.45;
        bird.body.velocity.y *= 0.45;
      }
    });
    const label = this.add.text(this.scale.width/2, 180, "❄ SLOW MOTION", {
      fontSize:"34px", color:"#90caf9", stroke:"#000", strokeThickness:6, fontStyle:"bold"
    }).setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets:label, alpha:0, y:140, duration:1400, onComplete:()=>label.destroy() });
    this.time.delayedCall(5000, () => {
      this.slowMoActive = false;
      this.birds.children.entries.forEach((bird) => {
        if (bird?.body) {
          bird.body.velocity.x /= 0.45;
          bird.body.velocity.y /= 0.45;
        }
      });
      this.updateBoosterButtons();
    });
  }

  activateDoubleScore() {
    if (this.isGameOver || !this.doubleScoreReady || this.doubleScoreActive) return;
    this.doubleScoreReady = false;
    this.doubleScoreActive = true;
    this.updateBoosterButtons();
    const label = this.add.text(this.scale.width/2, 220, "⚡ DOUBLE SCORE", {
      fontSize:"34px", color:"#ffcc80", stroke:"#000", strokeThickness:6, fontStyle:"bold"
    }).setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets:label, alpha:0, y:180, duration:1400, onComplete:()=>label.destroy() });
    this.time.delayedCall(6000, () => {
      this.doubleScoreActive = false;
      this.updateBoosterButtons();
    });
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
    if (this.comboHits >= 6 && !this.slowMoReady && !this.slowMoActive) this.slowMoReady = true;
    if (this.comboHits >= 10 && !this.doubleScoreReady && !this.doubleScoreActive) this.doubleScoreReady = true;
    this.updateComboUI();
    this.updateBoosterButtons();
    if (this.comboHits > 1) {
      this.tweens.add({ targets:this.comboText, scaleX:1.12, scaleY:1.12, duration:90, yoyo:true });
    }
  }

  spawnBird() {
    if(this.isGameOver || this.bossActive || this.waveInTransition) return;
    if (this.waveBirdSpawned >= this.waveBirdTarget) {
      if (this.spawnEvent) {
        this.spawnEvent.remove(false);
        this.spawnEvent = null;
      }
      return;
    }

    const { width:W, height:H } = this.scale;
    const side = Phaser.Math.Between(0,1);
    const profile = this.waveProfile || this.getWaveProfile(this.waveIndex || 1);
    const roll = Phaser.Math.Between(1,100);
    const w = profile.weights;
    let texture="birdBlue", points=100, speed=Phaser.Math.Between(110,160), scale=0.13, isDanger=false;
    if (roll <= w.blue) {
      texture = "birdBlue";
      points = 100;
      speed = Phaser.Math.Between(110,160);
      scale = 0.13;
    } else if (roll <= w.blue + w.red) {
      texture = "birdRed";
      points = 150;
      speed = Phaser.Math.Between(180,250);
      scale = 0.12;
    } else if (roll <= w.blue + w.red + w.black) {
      texture = "birdBlack";
      points = 0;
      speed = Phaser.Math.Between(200,280);
      scale = 0.115;
      isDanger = true;
    } else {
      texture = "birdGold";
      points = 300;
      speed = Phaser.Math.Between(130,190);
      scale = 0.14;
    }

    const spawnY  = Phaser.Math.Between(180, Math.floor(H*0.60));
    const startX  = side===0 ? -160 : W+160;
    const targetX = side===0 ? W+200 : -200;
    const targetY = spawnY + Phaser.Math.Between(-90,90);

    const bird = this.birds.create(startX, spawnY, texture);
    bird.setScale(scale);
    bird.points   = points;
    bird.isDanger = isDanger;
    bird.isBoss   = false;
    bird.setFlipX(side===1);
    this.physics.moveTo(bird, targetX, targetY, speed * this.speedWaveMultiplier * (this.slowMoActive ? 0.45 : 1));
    this.tweens.add({ targets:bird, y:bird.y+Phaser.Math.Between(-30,30), duration:Phaser.Math.Between(450,850), yoyo:true, repeat:-1, ease:"Sine.easeInOut" });

    this.waveBirdSpawned++;
    if (this.waveBirdSpawned >= this.waveBirdTarget && this.spawnEvent) {
      this.spawnEvent.remove(false);
      this.spawnEvent = null;
    }
  }

  handleBulletHitBird(bullet, bird) {
    if(!bullet.active||!bird.active) return;
    const pts      = bird.points;
    const isDanger = bird.isDanger;
    const isBoss   = !!bird.isBoss;
    const bx = bird.x, by = bird.y;

    bullet.destroy();

    if (isBoss) {
      bird.hp -= 1;
      bird.setTintFill(0xffffff);
      this.time.delayedCall(70, () => {
        if (bird.active) bird.clearTint();
      });
      this.cameras.main.shake(70, 0.006);
      const chip = this.add.text(bx, by - 42, `-${1}`, {
        fontSize:"36px", color:"#ff8a65", stroke:"#000", strokeThickness:5, fontStyle:"bold"
      }).setOrigin(0.5).setDepth(20);
      this.tweens.add({ targets:chip, y:chip.y-32, alpha:0, duration:360, onComplete:()=>chip.destroy() });

      if (bird.hp > 0) {
        this.updateBossHpUI();
        return;
      }

      if (bird.moveTween) bird.moveTween.remove();
      if (bird.bobTween) bird.bobTween.remove();
      bird.destroy();
      this.bossActive = false;
      this.bossBird = null;
      this.applyWaveTheme(this.getThemeForWaveProfile(this.waveProfile?.id));
      this.updateBossHpUI();
      this.addCombo();
      this.sessionHits += 3;
      this.missStreak = 0;
      for(let i=0;i<3;i++) this.missIcons[i].setColor("#888");

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

      const bossHit = this.add.image(bx, by, "hit").setScale(1).setTint(0xffb300);
      this.tweens.add({ targets:bossHit, alpha:0, scale:2.1, duration:500, onComplete:()=>bossHit.destroy() });
      for(let i=0;i<12;i++){
        const f = this.add.image(bx, by, "feather")
          .setScale(0.1+Math.random()*0.1).setRotation(Math.random()*Math.PI*2).setAlpha(0.95).setTint(i % 2 ? 0xffd54f : 0xff7043);
        this.tweens.add({ targets:f, x:bx+Phaser.Math.Between(-150,150), y:by+Phaser.Math.Between(-120,120),
          angle:Phaser.Math.Between(-180,180), alpha:0, duration:900+Math.random()*300, ease:"Quad.easeOut", onComplete:()=>f.destroy() });
      }

      const runMult = this.doubleScoreActive ? 2 : 1;
      const gained = pts * this.comboMult * runMult;
      this.score += gained;
      this.scoreText.setText(`SCORE: ${this.score}`);
      const bossPopup = this.add.text(bx, by-40, `👑 BOSS DOWN  +${gained}`, {
        fontSize:"48px", color:"#FFD700", stroke:"#000", strokeThickness:7, fontStyle:"bold", align:"center"
      }).setOrigin(0.5).setDepth(20);
      this.tweens.add({ targets:bossPopup, y:bossPopup.y-90, alpha:0, duration:900, ease:"Quad.easeOut", onComplete:()=>bossPopup.destroy() });
      this.showWaveBanner("👑 БОСС ПОВЕРЖЕН", `+${gained} очков`);
      this.scheduleNextWave(1400);
      return;
    }

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
    this.sessionHits++;

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

    const runMult = this.doubleScoreActive ? 2 : 1;
    const gained = pts * this.comboMult * runMult;
    const color = this.comboMult >= 3 ? "#00e5ff" : (pts>=300?"#FFD700":"#7CFF00");
    const popupParts = [`+${gained}`];
    if (this.comboMult > 1) popupParts.push(`x${this.comboMult}`);
    if (runMult > 1) popupParts.push("x2");
    const popupLabel = popupParts.join("  ");
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
    const newPressure = this.timeLeft <= 10 ? 2 : this.timeLeft <= 25 ? 1 : 0;
    if (newPressure !== this.timePressureLevel) {
      this.timePressureLevel = newPressure;
      this.spawnDelayCurrent = Math.max(300, this.spawnDelayCurrent - (newPressure === 2 ? 140 : 70));
      if (this.spawnEvent) this.setSpawnDelay(this.spawnDelayCurrent);
    }
    if(this.timeLeft<=0)  this.endGame();
  }

  setSpawnDelay(delay) {
    this.spawnDelayCurrent = delay;
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

  async endGame() {
    if(this.isGameOver) return;
    this.isGameOver = true;
    if(this.spawnEvent) this.spawnEvent.remove(false);
    if(this.timerEvent) this.timerEvent.remove(false);
    if (this.bossBird) {
      if (this.bossBird.moveTween) this.bossBird.moveTween.remove();
      if (this.bossBird.bobTween) this.bossBird.bobTween.remove();
    }

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

    const comboBonus = this.comboMult >= 5 ? 1.5 : this.comboMult >= 3 ? 1.2 : 1;
    this.coinReward = Math.max(1, Math.floor(this.score / 10 * comboBonus));
    let totalCoins = addCoins(this.coinReward);
    const missionUpdate = updateMissionProgress({ totalHits: this.sessionHits, totalScore: this.score, gamesPlayed: 1 });
    totalCoins = missionUpdate.coins;
    this.registry.set("coins", totalCoins);
    this.registry.set("missions", missionUpdate.missions);
    this.add.text(W/2,H/2+86,`🪙 +${this.coinReward}   Всего: ${totalCoins}`,{ fontSize:"30px", color:"#FFD700", stroke:"#000", strokeThickness:5 }).setOrigin(0.5);
    if (missionUpdate.granted.length) {
      const msg = missionUpdate.granted.map((m) => `+${m.reward} ${m.title}`).join("   ");
      this.add.text(W/2,H/2+116, `🎯 Миссия: ${msg}`, { fontSize:"22px", color:"#7CFF00", stroke:"#000", strokeThickness:4, align:"center" }).setOrigin(0.5);
    }

    this.rankText = this.add.text(W/2,H/2+146, "Сохраняем результат...", {
      fontSize:"30px", color:"#fff", stroke:"#000", strokeThickness:5, fontStyle:"bold"
    }).setOrigin(0.5);

    this.drawEndLeaderboardShell(W, H);

    const btn=this.add.rectangle(W/2,H/2+348,400,90,0xff6f00).setStrokeStyle(5,0xFFD700).setInteractive({ useHandCursor: true });
    this.add.text(W/2,H/2+348,"МЕНЮ",{ fontSize:"48px", color:"#fff", stroke:"#000", strokeThickness:7, fontStyle:"bold" }).setOrigin(0.5);
    this.tweens.add({ targets:btn, scaleX:1.05, scaleY:1.05, duration:600, yoyo:true, repeat:-1 });
    btn.on("pointerdown", ()=>this.scene.start("MenuScene"));

    const rows = await LeaderboardService.addScore(this.playerName, this.score);
    const topRows = Array.isArray(rows) ? rows : [];
    const topBeforeScore = topRows.length ? topRows[0].score : 0;
    this.finalRankPosition = await LeaderboardService.getRank(this.score);
    const isNewRecord = topRows.length ? this.score >= topBeforeScore : true;

    if (!this.scene.isActive()) return;

    this.rankText.setText(isNewRecord ? "🔥 Новый рекорд!" : `Место в рейтинге: #${this.finalRankPosition}`)
      .setColor(isNewRecord ? "#FFD700" : "#fff");

    this.updateEndLeaderboardRows(topRows, W, H);
  }

  drawEndLeaderboardShell(W, H) {
    this.add.rectangle(W/2, H/2+220, 520, 190, 0x000000, 0.42).setStrokeStyle(4, 0xFFD700);
    this.add.text(W/2, H/2+142, "ТОП 5", {
      fontSize:"30px", color:"#FFD700", stroke:"#000", strokeThickness:5, fontStyle:"bold"
    }).setOrigin(0.5);
    this.add.text(W/2, H/2+166, LeaderboardService.statusLabel, {
      fontSize:"16px", color:"#00e5ff", stroke:"#000", strokeThickness:4, fontStyle:"bold"
    }).setOrigin(0.5);
    this.endBoardLoading = this.add.text(W/2, H/2+226, "Обновляем таблицу...", {
      fontSize:"24px", color:"#fff", stroke:"#000", strokeThickness:4
    }).setOrigin(0.5);
    this.endBoardTexts = [];
  }

  updateEndLeaderboardRows(rows, W, H) {
    if (this.endBoardLoading) this.endBoardLoading.setVisible(!rows.length);
    this.endBoardTexts.forEach((node) => node.destroy());
    this.endBoardTexts = [];

    if (!rows.length) {
      if (this.endBoardLoading) this.endBoardLoading.setText("Пока нет результатов");
      return;
    }

    if (this.endBoardLoading) this.endBoardLoading.setVisible(false);

    rows.slice(0, 5).forEach((row, index) => {
      const y = H/2 + 178 + index * 28;
      const prefix = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index+1}.`;
      const rowColor = row.name === this.playerName && row.score === this.score ? "#7CFF00" : "#fff";
      const left = this.add.text(W/2 - 210, y, `${prefix} ${row.name}`, {
        fontSize:"22px", color:rowColor, stroke:"#000", strokeThickness:4
      }).setOrigin(0, 0.5);
      const right = this.add.text(W/2 + 210, y, `${row.score}`, {
        fontSize:"22px", color:rowColor, stroke:"#000", strokeThickness:4, fontStyle:"bold"
      }).setOrigin(1, 0.5);
      this.endBoardTexts.push(left, right);
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
