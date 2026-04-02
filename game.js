// Bird Blaster — PNG-версия (все ассеты из assets/)

const LEADERBOARD_KEY = "bird_blaster_leaderboard_v1";
const PLAYER_NAME_KEY = "bird_blaster_player_name_v1";
const COINS_KEY = "bird_blaster_coins_v1";
const SHOP_STATE_KEY = "bird_blaster_shop_v1";
const SHOP_ITEMS = {
  blasterPro: { id: "blasterPro", title: "Blaster PRO", price: 500 },
  bigBullet: { id: "bigBullet", title: "Big Bullet", price: 300 },
  fireRate: { id: "fireRate", title: "Rapid Fire", maxLevel: 10, basePrice: 250, step: 170 },
  bulletLab: { id: "bulletLab", title: "Bullet Lab", maxLevel: 10, basePrice: 220, step: 160 },
  critTech: { id: "critTech", title: "Crit Tech", maxLevel: 5, basePrice: 450, step: 260 },
  luckyCase: { id: "luckyCase", title: "Lucky Case", price: 350 }
};
const BULLET_STYLE_KEY = "bird_blaster_bullet_style_v1";
const BULLET_OWNED_KEY = "bird_blaster_bullet_owned_v1";
const BULLET_SKIN_PRICE = 2000;
const BULLET_STYLES = [
  { id: "classic", title: "Classic", texture: "bulletClassic" },
  { id: "laser", title: "Laser", texture: "bulletLaser" },
  { id: "ice", title: "Ice", texture: "bulletIce" },
  { id: "flower", title: "Flower", texture: "bulletFlower" },
  { id: "minion", title: "Minion", texture: "bulletMinion" },
  { id: "rainbow", title: "Rainbow", texture: "bulletRainbow" },
  { id: "plasma", title: "Plasma", texture: "bulletPlasma" }
];
const GAME_MODE_KEY = "bird_blaster_mode_v1";
const MISSION_STATE_KEY = "bird_blaster_missions_v1";
const GAME_MODES = {
  classic: { id: "classic", title: "КЛАССИКА", time: 0, lives: 3 },
  timeAttack: { id: "timeAttack", title: "НА ВРЕМЯ", time: 60, lives: 2 }
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
function getLeaderboardModeId(modeId) {
  return GAME_MODES[modeId] ? modeId : "classic";
}

function getLeaderboardModeLabel(modeId) {
  const safeMode = getLeaderboardModeId(modeId);
  const mode = GAME_MODES[safeMode] || GAME_MODES.classic;
  return `${ENABLE_GLOBAL_LEADERBOARD ? "ОБЩИЙ" : "ЛОКАЛЬНЫЙ"} • ${mode.title}`;
}

function getLeaderboardStorageKey(modeId) {
  return `${LEADERBOARD_KEY}_${getLeaderboardModeId(modeId)}`;
}

const AUTO_START_KEY = "bird_blaster_auto_start_v1";
const AUTO_START_NAME_KEY = "bird_blaster_auto_start_name_v1";
const AUTO_START_MODE_KEY = "bird_blaster_auto_start_mode_v1";

function requestFreshGameStart(playerName, gameMode) {
  try {
    sessionStorage.setItem(AUTO_START_KEY, "1");
    sessionStorage.setItem(AUTO_START_NAME_KEY, sanitizePlayerName(playerName || "Игрок") || "Игрок");
    sessionStorage.setItem(AUTO_START_MODE_KEY, getLeaderboardModeId(gameMode || getSavedGameMode()));
  } catch (e) {}
  window.location.reload();
}

function consumeFreshGameStart() {
  try {
    if (sessionStorage.getItem(AUTO_START_KEY) !== "1") return null;
    const playerName = sanitizePlayerName(sessionStorage.getItem(AUTO_START_NAME_KEY) || getSavedPlayerName() || "Игрок") || "Игрок";
    const gameMode = getLeaderboardModeId(sessionStorage.getItem(AUTO_START_MODE_KEY) || getSavedGameMode());
    sessionStorage.removeItem(AUTO_START_KEY);
    sessionStorage.removeItem(AUTO_START_NAME_KEY);
    sessionStorage.removeItem(AUTO_START_MODE_KEY);
    return { playerName, gameMode };
  } catch (e) {
    return null;
  }
}

function hideDomModals() {
  try {
    const ids = ["shop-modal", "name-modal", "leaderboard-modal"];
    ids.forEach((id) => {
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
      modal.style.display = "";
    });
    document.onkeydown = null;
  } catch (e) {}
}



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
      bigBullet: !!raw.bigBullet,
      fireRateLevel: Math.max(0, Math.min(10, Number(raw.fireRateLevel) || 0)),
      bulletLabLevel: Math.max(0, Math.min(10, Number(raw.bulletLabLevel) || 0)),
      critTechLevel: Math.max(0, Math.min(5, Number(raw.critTechLevel) || 0)),
      luckyCaseOpened: Math.max(0, Number(raw.luckyCaseOpened) || 0)
    };
  } catch (e) {
    return { blasterPro: false, bigBullet: false, fireRateLevel: 0, bulletLabLevel: 0, critTechLevel: 0, luckyCaseOpened: 0 };
  }
}

function saveShopState(state) {
  const safe = {
    blasterPro: !!state?.blasterPro,
    bigBullet: !!state?.bigBullet,
    fireRateLevel: Math.max(0, Math.min(10, Number(state?.fireRateLevel) || 0)),
    bulletLabLevel: Math.max(0, Math.min(10, Number(state?.bulletLabLevel) || 0)),
    critTechLevel: Math.max(0, Math.min(5, Number(state?.critTechLevel) || 0)),
    luckyCaseOpened: Math.max(0, Number(state?.luckyCaseOpened) || 0)
  };
  try {
    localStorage.setItem(SHOP_STATE_KEY, JSON.stringify(safe));
  } catch (e) {}
  return safe;
}


function getActiveBulletStyle() {
  try {
    const raw = String(localStorage.getItem(BULLET_STYLE_KEY) || "classic");
    const safe = BULLET_STYLES.some((s) => s.id === raw) ? raw : "classic";
    return isBulletStyleOwned(safe) ? safe : "classic";
  } catch (e) {
    return "classic";
  }
}

function setActiveBulletStyle(styleId) {
  const safe = BULLET_STYLES.some((s) => s.id === styleId) ? styleId : "classic";
  const finalStyle = isBulletStyleOwned(safe) ? safe : "classic";
  try {
    localStorage.setItem(BULLET_STYLE_KEY, finalStyle);
  } catch (e) {}
  return finalStyle;
}

function getBulletStyleMeta(styleId = getActiveBulletStyle()) {
  return BULLET_STYLES.find((s) => s.id === styleId) || BULLET_STYLES[0];
}

function getBulletTextureKey(styleId = getActiveBulletStyle()) {
  return getBulletStyleMeta(styleId).texture;
}

function loadOwnedBulletStyles() {
  try {
    const raw = JSON.parse(localStorage.getItem(BULLET_OWNED_KEY) || '{}');
    const safe = { classic: true };
    BULLET_STYLES.forEach((style) => {
      if (style.id === 'classic') {
        safe.classic = true;
      } else {
        safe[style.id] = !!raw[style.id];
      }
    });
    return safe;
  } catch (e) {
    const safe = { classic: true };
    BULLET_STYLES.forEach((style) => { if (style.id !== 'classic') safe[style.id] = false; });
    return safe;
  }
}

function saveOwnedBulletStyles(state) {
  const safe = { classic: true };
  BULLET_STYLES.forEach((style) => {
    if (style.id === 'classic') safe.classic = true;
    else safe[style.id] = !!state?.[style.id];
  });
  try { localStorage.setItem(BULLET_OWNED_KEY, JSON.stringify(safe)); } catch (e) {}
  return safe;
}

function isBulletStyleOwned(styleId) {
  const owned = loadOwnedBulletStyles();
  return !!owned[styleId];
}

function buyBulletStyle(styleId) {
  if (!BULLET_STYLES.some((s) => s.id === styleId)) return { ok: false, reason: 'missing' };
  if (styleId === 'classic') return { ok: false, reason: 'free' };
  const owned = loadOwnedBulletStyles();
  if (owned[styleId]) return { ok: false, reason: 'owned', owned, coins: getCoins() };
  const coins = getCoins();
  if (coins < BULLET_SKIN_PRICE) return { ok: false, reason: 'coins', owned, coins };
  setCoins(coins - BULLET_SKIN_PRICE);
  owned[styleId] = true;
  saveOwnedBulletStyles(owned);
  return { ok: true, owned, coins: getCoins() };
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

function getUpgradeMeta(upgradeId) {
  if (upgradeId === 'fireRate') return { stateKey: 'fireRateLevel', maxLevel: SHOP_ITEMS.fireRate.maxLevel, basePrice: SHOP_ITEMS.fireRate.basePrice, step: SHOP_ITEMS.fireRate.step };
  if (upgradeId === 'bulletLab') return { stateKey: 'bulletLabLevel', maxLevel: SHOP_ITEMS.bulletLab.maxLevel, basePrice: SHOP_ITEMS.bulletLab.basePrice, step: SHOP_ITEMS.bulletLab.step };
  if (upgradeId === 'critTech') return { stateKey: 'critTechLevel', maxLevel: SHOP_ITEMS.critTech.maxLevel, basePrice: SHOP_ITEMS.critTech.basePrice, step: SHOP_ITEMS.critTech.step };
  return null;
}

function getUpgradePrice(upgradeId, level) {
  const meta = getUpgradeMeta(upgradeId);
  if (!meta) return 0;
  return meta.basePrice + level * meta.step;
}

function buyUpgrade(upgradeId) {
  const meta = getUpgradeMeta(upgradeId);
  if (!meta) return { ok: false, reason: 'missing' };
  const state = loadShopState();
  const level = state[meta.stateKey] || 0;
  if (level >= meta.maxLevel) return { ok: false, reason: 'max', state, coins: getCoins() };
  const price = getUpgradePrice(upgradeId, level);
  const coins = getCoins();
  if (coins < price) return { ok: false, reason: 'coins', coins, state, price };
  setCoins(coins - price);
  state[meta.stateKey] = level + 1;
  saveShopState(state);
  return { ok: true, state, coins: getCoins(), level: state[meta.stateKey], price };
}

function openLuckyCase() {
  const state = loadShopState();
  const price = SHOP_ITEMS.luckyCase.price;
  const coins = getCoins();
  if (coins < price) return { ok: false, reason: 'coins', coins, state, price };
  setCoins(coins - price);
  state.luckyCaseOpened = (state.luckyCaseOpened || 0) + 1;
  const roll = Math.random();
  let reward = null;
  if (roll < 0.45) reward = { type: 'coins', amount: 220 + Math.floor(Math.random() * 181), label: 'Монеты' };
  else if (roll < 0.70) reward = { type: 'coins', amount: 420 + Math.floor(Math.random() * 231), label: 'Монеты' };
  else if (roll < 0.84) reward = { type: 'upgrade', upgradeId: 'fireRate', label: 'Rapid Fire +1' };
  else if (roll < 0.94) reward = { type: 'upgrade', upgradeId: 'bulletLab', label: 'Bullet Lab +1' };
  else reward = { type: 'upgrade', upgradeId: 'critTech', label: 'Crit Tech +1' };

  if (reward.type === 'coins') {
    addCoins(reward.amount);
  } else {
    const meta = getUpgradeMeta(reward.upgradeId);
    if (meta) {
      state[meta.stateKey] = Math.min(meta.maxLevel, (state[meta.stateKey] || 0) + 1);
    }
  }
  saveShopState(state);
  return { ok: true, state, coins: getCoins(), reward };
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

function loadLocalLeaderboard(modeId = "classic") {
  try {
    const raw = JSON.parse(localStorage.getItem(getLeaderboardStorageKey(modeId)) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .map((row) => ({
        name: sanitizePlayerName(row.name || "Игрок") || "Игрок",
        score: Math.max(0, Number(row.score) || 0),
        date: row.date || ""
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch (e) {
    return [];
  }
}

function saveLocalLeaderboard(rows, modeId = "classic") {
  try {
    localStorage.setItem(getLeaderboardStorageKey(modeId), JSON.stringify((rows || []).slice(0, 10)));
  } catch (e) {}
}

function addLocalLeaderboardScore(name, score, modeId = "classic") {
  const rows = loadLocalLeaderboard(modeId);
  rows.push({
    name: sanitizePlayerName(name) || "Игрок",
    score: Math.max(0, Math.round(score || 0)),
    date: new Date().toISOString().slice(0, 10),
    mode: getLeaderboardModeId(modeId)
  });
  const trimmed = rows.sort((a, b) => b.score - a.score).slice(0, 10);
  saveLocalLeaderboard(trimmed, modeId);
  return trimmed;
}

function getLocalLeaderboardRank(score, modeId = "classic") {
  const rows = loadLocalLeaderboard(modeId);
  const better = rows.filter((row) => row.score > score).length;
  return better + 1;
}

const LeaderboardService = {
  db: null,
  initialized: false,
  enabled: ENABLE_GLOBAL_LEADERBOARD,
  statusLabel: ENABLE_GLOBAL_LEADERBOARD ? "ОБЩИЙ РЕЙТИНГ" : "ЛОКАЛЬНЫЙ РЕЙТИНГ",
  getStatusLabel(modeId = "classic") { return getLeaderboardModeLabel(modeId); },

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

  async loadTop(limitCount = 10, modeId = "classic") {
    const safeMode = getLeaderboardModeId(modeId);
    const db = this.init();
    if (!db) return loadLocalLeaderboard(safeMode);

    try {
      const snapshot = await db.collection(LEADERBOARD_COLLECTION)
        .where("mode", "==", safeMode)
        .get();

      const rows = snapshot.docs.map((doc) => {
        const data = doc.data() || {};
        return {
          name: sanitizePlayerName(data.name || "Игрок") || "Игрок",
          score: Number(data.score) || 0,
          date: data.date || new Date().toISOString().slice(0, 10),
          createdAt: Number(data.createdAt) || 0
        };
      }).sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.createdAt || 0) - (b.createdAt || 0);
      }).slice(0, limitCount).map(({createdAt, ...row}) => row);

      saveLocalLeaderboard(rows, safeMode);
      return rows;
    } catch (e) {
      console.warn("Global leaderboard load failed, using local:", e);
      return loadLocalLeaderboard(safeMode);
    }
  },

  async addScore(name, score, modeId = "classic") {
    const safeMode = getLeaderboardModeId(modeId);
    const cleanName = sanitizePlayerName(name) || "Игрок";
    const cleanScore = Math.max(0, Math.round(score || 0));
    const db = this.init();

    if (!db) {
      return addLocalLeaderboardScore(cleanName, cleanScore, safeMode);
    }

    try {
      if (cleanScore > 0) {
        await db.collection(LEADERBOARD_COLLECTION).add({
          name: cleanName,
          score: cleanScore,
          mode: safeMode,
          date: new Date().toISOString().slice(0, 10),
          createdAt: Date.now()
        });
      }
      return await this.loadTop(10, safeMode);
    } catch (e) {
      console.warn("Global leaderboard save failed, using local:", e);
      return addLocalLeaderboardScore(cleanName, cleanScore, safeMode);
    }
  },

  async getRank(score, modeId = "classic") {
    const safeMode = getLeaderboardModeId(modeId);
    const cleanScore = Math.max(0, Math.round(score || 0));
    const db = this.init();

    if (!db) {
      return getLocalLeaderboardRank(cleanScore, safeMode);
    }

    try {
      const snapshot = await db.collection(LEADERBOARD_COLLECTION)
        .where("mode", "==", safeMode)
        .get();
      const better = snapshot.docs.filter((doc) => Number((doc.data() || {}).score) > cleanScore).length;
      return better + 1;
    } catch (e) {
      console.warn("Global rank load failed, using local:", e);
      return getLocalLeaderboardRank(cleanScore, safeMode);
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
    this.load.image("bulletClassic", "assets/bullets/bullet_classic.png");
    this.load.image("bulletLaser",   "assets/bullets/bullet_laser.png");
    this.load.image("bulletIce",     "assets/bullets/bullet_ice.png");
    this.load.image("bulletFlower",  "assets/bullets/bullet_flower.png");
    this.load.image("bulletMinion",  "assets/bullets/bullet_minion.png");
    this.load.image("bulletRainbow", "assets/bullets/bullet_rainbow.png");
    this.load.image("bulletPlasma",  "assets/bullets/bullet_plasma.png");
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
    this.registry.set("activeBulletStyle", getActiveBulletStyle());
    this.registry.set("ownedBulletStyles", loadOwnedBulletStyles());
    const autoStart = consumeFreshGameStart();
    if (autoStart) {
      this.registry.set("playerName", autoStart.playerName);
      this.registry.set("gameMode", autoStart.gameMode);
      this.scene.start("GameScene", autoStart);
      return;
    }
    this.scene.start("MenuScene");
  }
}

class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
    this.boardRowTexts = [];
  }

  create() {
    hideDomModals();
    try { this.input.enabled = true; } catch (e) {}
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

    this.playerChip = this.add.rectangle(W*0.28, H*0.662, 248, 52, 0x000000, 0.46).setStrokeStyle(3, 0x00e5ff, 0.85).setDepth(3);
    this.nameText = this.add.text(W*0.28, H*0.662, "", {
      fontSize:"24px", color:"#fff", stroke:"#000", strokeThickness:5, fontStyle:"bold"
    }).setOrigin(0.5).setDepth(4);

    this.modeBtn = this.add.rectangle(W*0.74, H*0.662, 248, 52, 0x1565c0).setStrokeStyle(4, 0xFFD700).setInteractive({ useHandCursor: true }).setDepth(3);
    this.modeText = this.add.text(W*0.74, H*0.662, "", { fontSize:"20px", color:"#fff", stroke:"#000", strokeThickness:5, fontStyle:"bold", align:"center" }).setOrigin(0.5).setDepth(4);
    this.modeBtn.on("pointerdown", () => this.toggleMode());

    this.versionText = this.add.text(W*0.86, H*0.702, "v16.1.1", { fontSize:"22px", color:"#b3e5fc", stroke:"#000", strokeThickness:5, fontStyle:"bold" }).setOrigin(0.5).setDepth(4);

    this.drawLeaderboardShell();
    this.refreshLeaderboard();

    const btnY = H*0.955;
    const btn = this.add.rectangle(W/2, btnY, 390, 76, 0xff6f00).setStrokeStyle(6, 0xFFD700).setInteractive({ useHandCursor: true }).setDepth(4);
    this.add.text(W/2, btnY, "ИГРАТЬ!", { fontSize:"44px", color:"#fff", stroke:"#000", strokeThickness:7, fontStyle:"bold" }).setOrigin(0.5).setDepth(5);
    this.tweens.add({ targets:btn, scaleX:1.03, scaleY:1.03, duration:700, yoyo:true, repeat:-1 });
    btn.on("pointerdown", () => this.openNameModal());

    this.refreshPlayerNameText();
    this.refreshCoinsText();
    this.refreshModeText();
  }

  refreshPlayerNameText() {
    const currentName = this.registry.get("playerName") || getSavedPlayerName() || "Не указано";
    this.nameText.setText(`👤 ${currentName}`);
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
    this.refreshLeaderboard();
  }

  refreshMissionTexts() {
    this.missionTexts.forEach((item) => item.destroy());
    this.missionTexts = [];
    const missions = getMissionRows();
    this.registry.set("missions", missions);
    missions.forEach((mission, index) => {
      const y = this.boardY + 104 + index * 30;
      const done = mission.claimed;
      const card = this.add.rectangle(this.boardX, y, 524, 26, done ? 0x143c14 : 0x102238, 0.76)
        .setStrokeStyle(2, done ? 0x7CFF00 : 0x3ab4ff, 0.9).setDepth(3.5);
      const label = `${done ? "✅" : "🎯"} ${mission.title}`;
      const progress = done ? `+${mission.reward} взято` : `${mission.value}/${mission.goal}  •  +${mission.reward}`;
      const left = this.add.text(this.boardX - 246, y, label, {
        fontSize:"14px", color: done ? "#b9ffb9" : "#fff", stroke:"#000", strokeThickness:4
      }).setOrigin(0, 0.5).setDepth(4);
      const right = this.add.text(this.boardX + 246, y, progress, {
        fontSize:"14px", color: done ? "#7CFF00" : "#FFD700", stroke:"#000", strokeThickness:4, fontStyle:"bold"
      }).setOrigin(1, 0.5).setDepth(4);
      this.missionTexts.push(card, left, right);
    });
  }

  drawLeaderboardShell() {
    const { width: W, height: H } = this.scale;
    const boardX = W / 2;
    const boardY = H * 0.775;
    this.boardX = boardX;
    this.boardY = boardY;

    this.boardPanel = this.add.rectangle(boardX, boardY, 580, 214, 0x05111f, 0.58).setStrokeStyle(4, 0xFFD700).setDepth(3);
    this.boardHeader = this.add.rectangle(boardX, boardY - 84, 540, 40, 0x4a2d14, 0.9).setStrokeStyle(2, 0xFFD700).setDepth(3.2);
    this.boardTitle = this.add.text(boardX, boardY - 84, "🏆 ЛУЧШИЕ ИГРОКИ", {
      fontSize:"28px", color:"#FFD700", stroke:"#000", strokeThickness:5, fontStyle:"bold"
    }).setOrigin(0.5).setDepth(4);
    this.boardModeText = this.add.text(boardX, boardY - 58, LeaderboardService.getStatusLabel(this.registry.get("gameMode") || getSavedGameMode()), {
      fontSize:"16px", color:"#7de3ff", stroke:"#000", strokeThickness:4, fontStyle:"bold"
    }).setOrigin(0.5).setDepth(4);
    this.boardLoadingText = this.add.text(boardX, boardY - 18, "Загрузка рейтинга...", {
      fontSize:"22px", align:"center", color:"#fff", stroke:"#000", strokeThickness:4
    }).setOrigin(0.5).setDepth(4);
    this.showAllBtn = this.add.rectangle(boardX, boardY + 34, 240, 36, 0x1565c0, 0.96).setStrokeStyle(3, 0x7de3ff).setInteractive({ useHandCursor: true }).setDepth(3.5);
    this.showAllBtnLabel = this.add.text(boardX, boardY + 34, "🏆 Показать всё", {
      fontSize:"20px", color:"#fff", stroke:"#000", strokeThickness:4, fontStyle:"bold"
    }).setOrigin(0.5).setDepth(4);
    this.showAllBtn.on("pointerdown", () => this.openLeaderboardModal());

    this.missionDivider = this.add.line(boardX, boardY + 58, -248, 0, 248, 0, 0x3ab4ff, 0.65).setLineWidth(2, 2).setDepth(3.2);
    this.missionTitle = this.add.text(boardX, boardY + 76, "🎯 МИССИИ", {
      fontSize:"24px", color:"#00e5ff", stroke:"#000", strokeThickness:5, fontStyle:"bold"
    }).setOrigin(0.5).setDepth(4);
    this.missionTexts = [];
    this.refreshMissionTexts();
  }

  clearBoardRows() {
    this.boardRowTexts.forEach((item) => item.destroy());
    this.boardRowTexts = [];
  }

  formatLeaderboardName(name) {
    const raw = String(name || 'Игрок');
    return raw.length > 13 ? `${raw.slice(0, 12)}…` : raw;
  }

  async refreshLeaderboard() {
    this.clearBoardRows();
    this.boardLoadingText.setVisible(true).setText("Загрузка рейтинга...");
    const currentModeId = this.registry.get("gameMode") || getSavedGameMode();
    this.boardModeText.setText(LeaderboardService.getStatusLabel(currentModeId));

    const rows = await LeaderboardService.loadTop(10, currentModeId);
    this.boardModeText.setText(LeaderboardService.getStatusLabel(currentModeId));

    if (!this.scene.isActive()) return;

    if (!rows.length) {
      this.boardLoadingText.setVisible(true).setText("Пока нет результатов\nСтань первым в рейтинге!");
      return;
    }

    this.boardLoadingText.setVisible(false);

    const visibleRows = rows.slice(0, 3);
    const rowColors = [
      { fill: 0x6b4f12, stroke: 0xffd54f, medal: 0xffd54f, scoreFill: 0x4b390d, scoreStroke: 0xffec99 },
      { fill: 0x4e545d, stroke: 0xdfe6ee, medal: 0xdfe6ee, scoreFill: 0x3b4047, scoreStroke: 0xf5f7fa },
      { fill: 0x6b3f24, stroke: 0xd7a07a, medal: 0xd7a07a, scoreFill: 0x4c2e1e, scoreStroke: 0xe8b899 },
      { fill: 0x102238, stroke: 0x2eb8ff, medal: 0x2eb8ff, scoreFill: 0x0a1625, scoreStroke: 0x7de3ff },
      { fill: 0x102238, stroke: 0x2eb8ff, medal: 0x2eb8ff, scoreFill: 0x0a1625, scoreStroke: 0x7de3ff }
    ];

    visibleRows.forEach((row, index) => {
      const y = this.boardY - 42 + index * 34;
      const theme = rowColors[index] || rowColors[rowColors.length - 1];
      const rank = index + 1;
      const medalLabel = String(rank);
      const displayName = this.formatLeaderboardName(row.name);

      const card = this.add.rectangle(this.boardX, y, 520, 28, theme.fill, 0.92)
        .setStrokeStyle(2, theme.stroke, 1)
        .setDepth(3.6);
      const medal = this.add.circle(this.boardX - 226, y, 14, theme.medal, 1)
        .setStrokeStyle(2, 0xffffff, 0.9)
        .setDepth(3.8);
      const medalText = this.add.text(this.boardX - 226, y, medalLabel, {
        fontSize: '15px',
        color: '#1b1b1b',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 1
      }).setOrigin(0.5).setDepth(4);
      const nameText = this.add.text(this.boardX - 202, y, displayName, {
        fontSize:'18px', color:'#ffffff', stroke:'#000', strokeThickness:3, fontStyle: index < 3 ? 'bold' : 'normal'
      }).setOrigin(0, 0.5).setDepth(4);
      const scorePill = this.add.rectangle(this.boardX + 186, y, 104, 22, theme.scoreFill, 1)
        .setStrokeStyle(2, theme.scoreStroke, 1)
        .setDepth(3.85);
      const scoreText = this.add.text(this.boardX + 186, y, String(row.score), {
        fontSize:'18px', color:'#7CFF00', stroke:'#000', strokeThickness:3, fontStyle:'bold'
      }).setOrigin(0.5).setDepth(4);

      this.boardRowTexts.push(card, medal, medalText, nameText, scorePill, scoreText);
    });
  }

  async openLeaderboardModal() {
    const modal = document.getElementById("leaderboard-modal");
    const closeBtn = document.getElementById("close-leaderboard-btn");
    const closeBtnTop = document.getElementById("close-leaderboard-x");
    const listEl = document.getElementById("leaderboard-list");
    const subtitle = document.getElementById("leaderboard-modal-subtitle");
    if (!modal || !closeBtn || !listEl || !subtitle) return;

    const currentModeId = this.registry.get("gameMode") || getSavedGameMode();
    subtitle.textContent = LeaderboardService.getStatusLabel(currentModeId);
    listEl.innerHTML = '<div class="shop-desc">Загрузка...</div>';
    const rows = await LeaderboardService.loadTop(20, currentModeId);
    if (!this.scene.isActive()) return;
    if (!rows.length) {
      listEl.innerHTML = '<div class="shop-desc">Пока нет результатов. Стань первым!</div>';
    } else {
      listEl.innerHTML = rows.map((row, idx) => `
        <div class="leaderboard-row">
          <div class="leaderboard-rank">${idx + 1}</div>
          <div class="leaderboard-main">
            <div class="leaderboard-name">${this.formatLeaderboardName(row.name)}</div>
            <div class="leaderboard-mode">${GAME_MODES[currentModeId]?.title || "КЛАССИКА"}</div>
          </div>
          <div class="leaderboard-score">${row.score}</div>
        </div>`).join('');
    }

    const closeModal = () => {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
      closeBtn.onclick = null;
      if (closeBtnTop) closeBtnTop.onclick = null;
      modal.onclick = null;
      document.onkeydown = null;
    };
    closeBtn.onclick = closeModal;
    if (closeBtnTop) closeBtnTop.onclick = closeModal;
    modal.onclick = (event) => { if (event.target === modal) closeModal(); };
    document.onkeydown = (event) => { if (event.key === "Escape") closeModal(); };
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
  }

  openShopModal() {
    const modal = document.getElementById("shop-modal");
    const closeBtn = document.getElementById("close-shop-btn");
    const closeBtnTop = document.getElementById("close-shop-x");
    const buyBlasterBtn = document.getElementById("buy-blaster-pro-btn");
    const buyBulletBtn = document.getElementById("buy-big-bullet-btn");
    const buyRapidBtn = document.getElementById("buy-rapid-fire-btn");
    const buyBulletLabBtn = document.getElementById("buy-bullet-lab-btn");
    const buyCritBtn = document.getElementById("buy-crit-tech-btn");
    const openCaseBtn = document.getElementById("open-lucky-case-btn");
    const coinsLabel = document.getElementById("shop-coins-label");
    const bulletCurrentLabel = document.getElementById("shop-bullet-current");
    const bulletButtons = {
      classic: document.getElementById("select-bullet-classic-btn"),
      laser: document.getElementById("select-bullet-laser-btn"),
      ice: document.getElementById("select-bullet-ice-btn"),
      flower: document.getElementById("select-bullet-flower-btn"),
      minion: document.getElementById("select-bullet-minion-btn"),
      rainbow: document.getElementById("select-bullet-rainbow-btn"),
      plasma: document.getElementById("select-bullet-plasma-btn")
    };
    if (!modal || !closeBtn || !buyBlasterBtn || !buyBulletBtn || !buyRapidBtn || !buyBulletLabBtn || !buyCritBtn || !openCaseBtn || !coinsLabel) return;

    const render = () => {
      const state = loadShopState();
      const coins = getCoins();
      this.registry.set("shopState", state);
      this.registry.set("coins", coins);
      this.refreshCoinsText();
      coinsLabel.textContent = `Монеты: ${coins}`;

      const setupOwned = ({ btn, owned, price }) => {
        btn.disabled = owned;
        btn.textContent = owned ? 'Куплено ✓' : `Купить — ${price}`;
      };
      setupOwned({ btn: buyBlasterBtn, owned: state.blasterPro, price: SHOP_ITEMS.blasterPro.price });
      setupOwned({ btn: buyBulletBtn, owned: state.bigBullet, price: SHOP_ITEMS.bigBullet.price });

      const setupUpgrade = ({ btn, id, levelKey, maxLevel }) => {
        const level = state[levelKey] || 0;
        if (level >= maxLevel) {
          btn.disabled = true;
          btn.textContent = `MAX LEVEL`;
        } else {
          btn.disabled = false;
          btn.textContent = `Улучшить до ${level + 1} — ${getUpgradePrice(id, level)}`;
        }
      };
      setupUpgrade({ btn: buyRapidBtn, id: 'fireRate', levelKey: 'fireRateLevel', maxLevel: SHOP_ITEMS.fireRate.maxLevel });
      setupUpgrade({ btn: buyBulletLabBtn, id: 'bulletLab', levelKey: 'bulletLabLevel', maxLevel: SHOP_ITEMS.bulletLab.maxLevel });
      setupUpgrade({ btn: buyCritBtn, id: 'critTech', levelKey: 'critTechLevel', maxLevel: SHOP_ITEMS.critTech.maxLevel });
      openCaseBtn.disabled = coins < SHOP_ITEMS.luckyCase.price;
      openCaseBtn.textContent = `Открыть — ${SHOP_ITEMS.luckyCase.price}`;

      const lvlRapid = document.getElementById('shop-fire-rate-level');
      const lvlBullet = document.getElementById('shop-bullet-lab-level');
      const lvlCrit = document.getElementById('shop-crit-tech-level');
      const caseStat = document.getElementById('shop-case-opened');
      if (lvlRapid) lvlRapid.textContent = `Уровень: ${state.fireRateLevel}/10`;
      if (lvlBullet) lvlBullet.textContent = `Уровень: ${state.bulletLabLevel}/10`;
      if (lvlCrit) lvlCrit.textContent = `Уровень: ${state.critTechLevel}/5`;
      if (caseStat) caseStat.textContent = `Открыто кейсов: ${state.luckyCaseOpened || 0}`;
      const activeStyle = getActiveBulletStyle();
      const activeMeta = getBulletStyleMeta(activeStyle);
      const ownedStyles = loadOwnedBulletStyles();
      this.registry.set("ownedBulletStyles", ownedStyles);
      this.registry.set("activeBulletStyle", activeStyle);
      if (bulletCurrentLabel) bulletCurrentLabel.textContent = `Активная пуля: ${activeMeta.title}`;

      Object.entries(bulletButtons).forEach(([styleId, btn]) => {
        if (!btn) return;
        const meta = getBulletStyleMeta(styleId);
        const owned = !!ownedStyles[styleId];
        const isActive = styleId === activeStyle;
        btn.className = 'bullet-skin-btn';
        btn.dataset.styleId = styleId;
        btn.innerHTML = `<img src="assets/bullets/bullet_${styleId}.png" alt="${meta.title}"><span class="bullet-skin-name">${meta.title}</span><span class="bullet-skin-action">${!owned ? `Купить — ${BULLET_SKIN_PRICE}` : (isActive ? 'Выбрано ✓' : 'Использовать')}</span>`;
        btn.disabled = isActive;
        btn.classList.toggle('owned', owned);
        btn.classList.toggle('selected', isActive);
        btn.classList.toggle('locked', !owned);
      });
    };

    const closeModal = () => {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
      closeBtn.onclick = null;
      if (closeBtnTop) closeBtnTop.onclick = null;
      modal.onclick = null;
      buyBlasterBtn.onclick = null;
      buyBulletBtn.onclick = null;
      buyRapidBtn.onclick = null;
      buyBulletLabBtn.onclick = null;
      buyCritBtn.onclick = null;
      openCaseBtn.onclick = null;
      Object.values(bulletButtons).forEach((btn) => { if (btn) btn.onclick = null; });
      document.onkeydown = null;
    };

    const insufficient = (res) => { if (!res.ok && res.reason === 'coins') alert('Недостаточно монет'); };
    buyBlasterBtn.onclick = () => { insufficient(buyShopItem("blasterPro")); render(); };
    buyBulletBtn.onclick = () => { insufficient(buyShopItem("bigBullet")); render(); };
    buyRapidBtn.onclick = () => { const res = buyUpgrade('fireRate'); insufficient(res); render(); };
    buyBulletLabBtn.onclick = () => { const res = buyUpgrade('bulletLab'); insufficient(res); render(); };
    buyCritBtn.onclick = () => { const res = buyUpgrade('critTech'); insufficient(res); render(); };
    openCaseBtn.onclick = () => {
      const res = openLuckyCase();
      if (!res.ok && res.reason === 'coins') {
        alert('Недостаточно монет');
      } else if (res.ok) {
        const reward = res.reward;
        if (reward.type === 'coins') alert(`🎁 Кейс: +${reward.amount} монет`);
        else alert(`🎁 Кейс: ${reward.label}`);
      }
      render();
    };
    Object.entries(bulletButtons).forEach(([styleId, btn]) => {
      if (!btn) return;
      btn.onclick = () => {
        if (!isBulletStyleOwned(styleId)) {
          const res = buyBulletStyle(styleId);
          if (!res.ok && res.reason === 'coins') {
            alert(`Недостаточно монет. Нужно ${BULLET_SKIN_PRICE}`);
            return;
          }
        }
        const active = setActiveBulletStyle(styleId);
        this.registry.set("activeBulletStyle", active);
        this.registry.set("ownedBulletStyles", loadOwnedBulletStyles());
        render();
      };
    });
    closeBtn.onclick = closeModal;
    if (closeBtnTop) closeBtnTop.onclick = closeModal;
    modal.onclick = (event) => {
      if (event.target === modal) closeModal();
    };
    document.onkeydown = (event) => {
      if (event.key === "Escape") closeModal();
    };
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
      const gameMode = this.registry.get("gameMode") || getSavedGameMode();
      this.registry.set("playerName", finalName || "Игрок");
      this.registry.set("gameMode", gameMode);
      closeModal();
      hideDomModals();
      requestFreshGameStart(finalName || "Игрок", gameMode);
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
    const rapidBase = this.shopState.blasterPro ? 170 : 260;
    this.shotCooldown = Math.max(95, rapidBase - this.shopState.fireRateLevel * 10);
    this.lastShotAt = 0;
    this.bulletScaleBonus = (this.shopState.bigBullet ? 1.3 : 1) + this.shopState.bulletLabLevel * 0.06;
    this.critChance = Math.min(0.28, this.shopState.critTechLevel * 0.05);
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
    this.superVolleySeq = 0;
    this.superVolleyState = {};
    this.timePressureLevel = 0;
  }

  create() {
    hideDomModals();
    try { this.input.enabled = true; } catch (e) {}
    const { width: W, height: H } = this.scale;
    this.skyBackdrop = this.add.rectangle(W/2, H/2, W, H, 0x8fd3ff, 1);
    this.bg = this.add.image(W/2, H/2, "bgDay").setDisplaySize(W, H);
    this.bgCrossfade = this.add.image(W/2, H/2, "bgDay").setDisplaySize(W, H).setAlpha(0).setDepth(0.5).setVisible(false);
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

    this.topBar = this.add.rectangle(W/2, 52, W, 104, 0x5d4037, 0.88);
    this.topBarInner = this.add.rectangle(W/2, 52, W-4, 100, 0x6d4c41, 0.5);
    this.timeText  = this.add.text(24, 16, this.modeId === "classic" ? `⏱ ∞` : `⏱ ${this.timeLeft}`, { fontSize:"40px", color:"#FFD700", stroke:"#000", strokeThickness:6 });
    this.scoreText = this.add.text(W/2, 16, "SCORE: 0", { fontSize:"42px", color:"#fff", stroke:"#000", strokeThickness:6 }).setOrigin(0.5, 0);
    this.comboText = this.add.text(W/2, 62, "", { fontSize:"26px", color:"#FFD700", stroke:"#000", strokeThickness:5, fontStyle:"bold" }).setOrigin(0.5, 0);
    this.modeHudText = this.add.text(W/2, 96, this.mode.title, { fontSize:"20px", color:"#00e5ff", stroke:"#000", strokeThickness:4, fontStyle:"bold" }).setOrigin(0.5,0);
    this.waveText = this.add.text(W/2, 128, "", { fontSize:"30px", color:"#7CFF00", stroke:"#000", strokeThickness:5, fontStyle:"bold" }).setOrigin(0.5, 0);
    this.waveSubText = this.add.text(W/2, 164, "", { fontSize:"24px", color:"#fff", stroke:"#000", strokeThickness:4, fontStyle:"bold" }).setOrigin(0.5, 0);
    this.bossHpText = this.add.text(W/2, 196, "", { fontSize:"24px", color:"#ff8a65", stroke:"#000", strokeThickness:5, fontStyle:"bold" }).setOrigin(0.5, 0).setVisible(false);
    this.bossHpBarBg = this.add.rectangle(W/2, 230, 300, 16, 0x000000, 0.58).setStrokeStyle(2, 0xff8a65, 0.8).setDepth(5).setVisible(false);
    this.bossHpBarFill = this.add.rectangle(W/2 - 150, 230, 0, 12, 0xff7043, 0.96).setOrigin(0, 0.5).setDepth(6).setVisible(false);
    this.themeNameText = this.add.text(W/2, 0, "", { fontSize:"1px", color:"#fff" }).setOrigin(0.5, 0).setVisible(false);
    this.waveBonusBg = this.add.rectangle(W/2, 222, 360, 50, 0x000000, 0.52).setStrokeStyle(3, 0xFFD700, 0.9).setDepth(5);
    this.waveBonusText = this.add.text(W/2, 199, "", { fontSize:"24px", color:"#FFD700", stroke:"#000", strokeThickness:5, fontStyle:"bold", align:"center" }).setOrigin(0.5, 0).setDepth(6);
    this.survivalBonusText = this.add.text(W/2, 0, "", { fontSize:"1px", color:"#ffffff" }).setOrigin(0.5, 0).setDepth(6).setVisible(false);
    this.waveProgressBg = this.add.rectangle(W/2, 255, 280, 14, 0x000000, 0.55).setStrokeStyle(2, 0xffffff, 0.5).setDepth(5);
    this.waveProgressFill = this.add.rectangle(W/2 - 140, 255, 0, 10, 0x7CFF00, 0.95).setOrigin(0, 0.5).setDepth(6);
    this.waveProgressText = this.add.text(W/2, 268, "", { fontSize:"16px", color:"#ffffff", stroke:"#000", strokeThickness:4, fontStyle:"bold", align:"center" }).setOrigin(0.5, 0).setDepth(6);
    this.livesText = this.add.text(W-20, 16, "❤❤❤", { fontSize:"38px", color:"#ff4d4d", stroke:"#000", strokeThickness:5 }).setOrigin(1, 0);
    this.playerText = this.add.text(24, 128, `Игрок: ${this.playerName}`, {
      fontSize:"22px", color:"#fff", stroke:"#000", strokeThickness:4
    });
    this.coinsHudText = this.add.text(W-20, 128, `🪙 ${getCoins()}`, {
      fontSize:"22px", color:"#FFD700", stroke:"#000", strokeThickness:4
    }).setOrigin(1, 0);

    this.hitIcons = [];
    for(let i = 0; i < 3; i++) {
      const ic = this.add.text(W/2 + 90 + i*38, H - 48, "◎", {
        fontSize:"26px", color:"#555", stroke:"#000", strokeThickness:3
      }).setDepth(10);
      this.hitIcons.push(ic);
    }
    this.slowBarBg = this.add.rectangle(100, H - 84, 128, 10, 0x000000, 0.55).setStrokeStyle(2, 0x90caf9, 0.7).setDepth(15);
    this.slowBarFill = this.add.rectangle(36, H - 84, 0, 6, 0x29b6f6, 0.95).setOrigin(0,0.5).setDepth(16);
    this.x2BarBg = this.add.rectangle(W - 100, H - 84, 128, 10, 0x000000, 0.55).setStrokeStyle(2, 0xffcc80, 0.7).setDepth(15);
    this.x2BarFill = this.add.rectangle(W - 164, H - 84, 0, 6, 0xffb74d, 0.95).setOrigin(0,0.5).setDepth(16);
    this.superBarBg = this.add.rectangle(W/2, H - 96, 220, 10, 0x000000, 0.55).setStrokeStyle(2, 0xFFD700, 0.7).setDepth(15);
    this.superBarFill = this.add.rectangle(W/2 - 110, H - 96, 0, 6, 0xFFD700, 0.95).setOrigin(0,0.5).setDepth(16);
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
    this.updateBoosterBars();

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

    this.events.once("shutdown", () => {
      try { this.input.removeAllListeners(); } catch (e) {}
      try { if (this.spawnEvent) this.spawnEvent.remove(false); } catch (e) {}
      try { if (this.timerEvent) this.timerEvent.remove(false); } catch (e) {}
      try { if (this.transitionEvent) this.transitionEvent.remove(false); } catch (e) {}
      try { if (this.slowMoTimer) this.slowMoTimer.remove(false); } catch (e) {}
      try { if (this.doubleScoreTimer) this.doubleScoreTimer.remove(false); } catch (e) {}
      try { hideDomModals(); } catch (e) {}
      this.isHolding = false;
      this.isGameOver = true;
    });

    this.applyWaveTheme(this.getThemeForWaveProfile("balanced"), { silent: true });
    this.startWave(1);
    if (this.modeId === "timeAttack") {
      this.timerEvent = this.time.addEvent({ delay:1000, callback:this.updateGameTimer, callbackScope:this, loop:true });
    } else {
      this.timerEvent = null;
    }
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

    this.updateBoosterBars();

    const bulletList = this.bullets.children.entries.slice();
    const birdList = this.birds.children.entries.slice();
    for(const b of bulletList) {
      if(!b.active || b.counted) continue;

      let sweptHit = false;
      for (const bird of birdList) {
        if (!bird.active) continue;
        if (this.isSweptPreciseHit(b, bird)) {
          this.handleBulletHitBird(b, bird);
          sweptHit = true;
          break;
        }
      }
      if (sweptHit || !b.active) continue;

      if(b.x < -80 || b.x > W+80 || b.y < -80 || b.y > H+80) {
        b.counted = true;
        this.resolveBulletOutcome(b, false);
        b.destroy();
        continue;
      }

      b.prevX = b.x;
      b.prevY = b.y;
    }

    for(const bird of birdList) {
      if(!bird.active) continue;
      if(!bird.isBoss && (bird.x < -180 || bird.x > W+180 || bird.y < -180 || bird.y > H+180)) {
        bird.destroy();
      }
    }

    this.checkWaveProgress();
    this.updateWaveHud();
    this.updateWeatherLayer(delta || 16);
  }

  getWaveProfile(index) {
    const cycle = (index - 1) % 4;
    const stage = Math.floor((index - 1) / 4) + 1;
    const stageSpeed = 1 + (stage - 1) * 0.08;
    const stageScore = 1 + (stage - 1) * 0.10;
    const stageBlack = Math.min(34, 10 + (stage - 1) * 4);
    const stageGold = Math.min(58, 10 + (stage - 1) * 5);
    const stageLabel = stage > 1 ? ` • этап ${stage}` : '';
    if (cycle === 0) return { id: "balanced", label: `Базовая волна${stageLabel}`, bonus: stage > 1 ? `этап ${stage} • враги сильнее` : "+0% очков", weights: { blue: Math.max(26, 58 - (stage - 1) * 6), red: Math.min(34, 22 + (stage - 1) * 2), black: stageBlack, gold: Math.min(24, 10 + (stage - 1) * 2) }, scoreMult: 1 * stageScore, speedMult: 1 * stageSpeed, stage };
    if (cycle === 1) return { id: "speed", label: `Шторм${stageLabel}`, bonus: `+20% очков • быстрые птицы • этап ${stage}`, weights: { blue: Math.max(16, 34 - (stage - 1) * 4), red: Math.min(56, 46 + (stage - 1) * 3), black: stageBlack, gold: Math.min(24, 10 + (stage - 1) * 2) }, scoreMult: 1.2 * stageScore, speedMult: 1.18 * stageSpeed, stage };
    if (cycle === 2) return { id: "gold", label: `Золотая волна${stageLabel}`, bonus: `много золотых птиц • этап ${stage}`, weights: { blue: Math.max(10, 24 - (stage - 1) * 2), red: Math.min(24, 16 + (stage - 1) * 2), black: Math.min(18, 8 + (stage - 1) * 2), gold: stageGold }, scoreMult: 1.15 * stageScore, speedMult: 1.05 * stageSpeed, stage };
    return { id: "shadow", label: `Ночная волна${stageLabel}`, bonus: `+35% очков • длиннее комбо • этап ${stage}`, weights: { blue: Math.max(16, 34 - (stage - 1) * 3), red: Math.min(28, 24 + (stage - 1) * 2), black: Math.min(40, 24 + (stage - 1) * 4), gold: Math.min(28, 18 + (stage - 1) * 2) }, scoreMult: 1.35 * stageScore, speedMult: 1.12 * stageSpeed, stage };
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

  applyThemeNow(theme, options = {}) {
    this.currentTheme = theme;
    if (!options.skipBackground && theme.bgKey && this.bg.texture?.key !== theme.bgKey) {
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
    if (this.waveBonusText) this.waveBonusText.setColor(theme.accent);
    if (this.survivalBonusText) this.survivalBonusText.setColor(theme.subAccent);
    this.buildWeatherLayer(theme);
    this.updateWaveHud();
  }

  applyWaveTheme(theme, options = {}) {
    if (!theme || !this.bg) return;

    const showLabel = () => {
      if (options.silent) return;
      const label = this.add.text(this.scale.width / 2, 246, `${theme.name}`, {
        fontSize:"24px", color:theme.subAccent, stroke:"#000", strokeThickness:5, fontStyle:"bold"
      }).setOrigin(0.5).setDepth(27);
      this.tweens.add({ targets:label, alpha:0, y:210, duration:1200, onComplete:() => label.destroy() });
    };

    if (options.silent || !this.currentTheme) {
      this.applyThemeNow(theme, options);
      showLabel();
      return;
    }

    if (this.themeTransitionTween) {
      this.themeTransitionTween.stop();
      this.themeTransitionTween = null;
    }

    if (!this.themeTransitionRect) {
      this.themeTransitionRect = this.add.rectangle(
        this.scale.width / 2,
        this.scale.height / 2,
        this.scale.width,
        this.scale.height,
        0x000000,
        0
      ).setDepth(26).setScrollFactor(0);
    }

    if (this.bgCrossfade) {
      this.bgCrossfade
        .setTexture(theme.bgKey || this.bg.texture.key)
        .setDisplaySize(this.scale.width, this.scale.height)
        .setPosition(this.scale.width / 2, this.scale.height / 2)
        .setAlpha(0)
        .setVisible(true);
    }

    this.themeTransitionRect
      .setSize(this.scale.width, this.scale.height)
      .setPosition(this.scale.width / 2, this.scale.height / 2)
      .setFillStyle(theme.overlay || theme.topBar || 0x000000, 0)
      .setAlpha(0);

    this.themeTransitionTween = this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 1050,
      ease: 'Sine.easeInOut',
      onStart: () => {
        this._themeSwappedAtMid = false;
      },
      onUpdate: (tw) => {
        const t = tw.getValue();
        const cross = Phaser.Math.Clamp((t - 0.12) / 0.76, 0, 1);
        if (this.bgCrossfade) this.bgCrossfade.alpha = cross;
        this.themeTransitionRect.alpha = Math.sin(Math.PI * t) * 0.20;

        if (t >= 0.58 && !this._themeSwappedAtMid) {
          this._themeSwappedAtMid = true;
          this.applyThemeNow(theme, { ...options, skipBackground: true });
        }
      },
      onComplete: () => {
        this.applyThemeNow(theme, options);
        if (this.bgCrossfade) {
          this.bgCrossfade.alpha = 0;
          this.bgCrossfade.setVisible(false);
        }
        this.themeTransitionRect.alpha = 0;
        this._themeSwappedAtMid = false;
        this.themeTransitionTween = null;
        showLabel();
      }
    });
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

  getSurvivalBonusMultiplier(waveIndex = this.waveIndex || 1) {
    return waveIndex >= 8 ? 2 : waveIndex >= 6 ? 1.5 : 1;
  }

  getNextSurvivalBonusTarget(waveIndex = this.waveIndex || 1) {
    if (waveIndex < 6) return { wave: 6, mult: 1.5 };
    if (waveIndex < 8) return { wave: 8, mult: 2 };
    return null;
  }

  getShortWaveBonus(profile = this.waveProfile) {
    if (!profile) return "";
    if (profile.id === "speed") return "+20% SCORE";
    if (profile.id === "gold") return "GOLD BIRDS ↑";
    if (profile.id === "shadow") return "+35% SCORE";
    if (profile.id === "boss") return "BOSS BONUS";
    return "START";
  }

  updateWaveHud() {
    if (!this.waveProfile) return;
    const cleared = Math.max(0, this.waveBirdSpawned - this.getAliveBirdCount(false));
    const total = Math.max(1, this.waveBirdTarget || 1);
    const progress = Phaser.Math.Clamp(cleared / total, 0, 1);
    const accentHex = Phaser.Display.Color.HexStringToColor((this.currentTheme?.accent || '#FFD700')).color;
    this.waveText.setText(`WAVE ${this.waveIndex} — ${this.waveProfile.label.toUpperCase()}`);
    this.waveSubText.setText(this.getShortWaveBonus(this.waveProfile));
    if (this.waveBonusText) this.waveBonusText.setText(this.getShortWaveBonus(this.waveProfile));
    if (this.waveProgressText) {
      this.waveProgressText.setText(`${cleared}/${total}`);
    }
    if (this.waveBonusBg) {
      const baseColor = this.currentTheme?.panel || 0x6d4c41;
      this.waveBonusBg.setFillStyle(baseColor, 0.64);
      this.waveBonusBg.setStrokeStyle(3, accentHex, 0.95);
    }
    const showWaveProgress = !this.bossActive;
    if (this.waveProgressBg) {
      this.waveProgressBg.setVisible(showWaveProgress);
      this.waveProgressBg.setStrokeStyle(2, accentHex, 0.75);
    }
    if (this.waveProgressFill) {
      this.waveProgressFill.setVisible(showWaveProgress);
      this.waveProgressFill.setFillStyle(accentHex, 0.95);
      this.waveProgressFill.width = 280 * progress;
    }
    if (this.waveProgressText) {
      this.waveProgressText.setVisible(showWaveProgress);
    }
  }

  startWave(index) {
    if (this.isGameOver) return;
    this.waveIndex = index;
    this.waveInTransition = false;
    this.waveProfile = this.getWaveProfile(index);
    this.applyWaveTheme(this.getThemeForWaveProfile(this.waveProfile.id));
    const stage = this.waveProfile?.stage || (Math.floor((index - 1) / 4) + 1);
    this.stageTier = stage;
    const modeBonus = this.modeId === "timeAttack" ? -4 : 0;
    this.waveBirdTarget = Math.max(this.modeId === "timeAttack" ? 14 : 18, 18 + index * 5 + modeBonus + (stage - 1) * 4);
    this.waveBirdSpawned = 0;
    this.bossSpawnedThisWave = false;
    this.bossActive = false;
    this.bossBird = null;
    const pressureFactor = this.timePressureLevel === 2 ? 140 : this.timePressureLevel === 1 ? 80 : 0;
    this.spawnDelayCurrent = Math.max(520, (this.modeId === "timeAttack" ? 1080 : 1320) - index * 34 - pressureFactor - (stage - 1) * 48);
    this.speedWaveMultiplier = (this.waveProfile?.speedMult || 1) + (index - 1) * 0.045 + (this.modeId === "timeAttack" ? 0.08 : 0) + this.timePressureLevel * 0.04 + (stage - 1) * 0.06;
    this.bossHpText.setVisible(false).setText("");
    this.updateWaveHud();
    this.showWaveBanner(`WAVE ${index} • STAGE ${stage}`, this.getShortWaveBonus(this.waveProfile));
    this.setSpawnDelay(this.spawnDelayCurrent);
  }

  scheduleNextWave(delay = 1200) {
    if (this.isGameOver || this.waveInTransition) return;
    this.waveInTransition = true;
    this.showWaveBanner("WAVE CLEAR", `Следующая волна: ${this.waveIndex + 1}`);
    this.time.delayedCall(delay, () => {
      if (this.isGameOver) return;
      this.startWave(this.waveIndex + 1);
    });
  }

  shouldSpawnBossThisWave() {
    return this.waveIndex > 0 && this.waveIndex % 4 === 0;
  }

  spawnBoss() {
    if (this.isGameOver || this.bossActive) return;
    const { width:W } = this.scale;
    this.bossSpawnedThisWave = true;
    this.bossActive = true;
    const startLeft = Phaser.Math.Between(0, 1) === 0;
    const boss = this.birds.create(startLeft ? 120 : W - 120, Phaser.Math.Between(260, 400), this.waveIndex % 2 === 0 ? "birdBlack" : "birdGold");
    boss.setScale(0.28);
    this.applyBirdHitbox(boss);
    boss.isBoss = true;
    const stage = this.stageTier || Math.floor((this.waveIndex - 1) / 4) + 1;
    boss.points = Math.round((1500 + this.waveIndex * 300) * (1 + (stage - 1) * 0.45));
    boss.hp = Math.round((7 + this.waveIndex * 2 + (this.modeId === "timeAttack" ? 2 : 0)) * (1 + (stage - 1) * 0.30));
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
    this.showWaveBanner(`👑 BOSS STAGE ${stage}`, `HP ${boss.hp} · награда ${boss.points}`);
  }

  updateBossHpUI() {
    if (this.bossBird && this.bossBird.active) {
      const hp = Math.max(0, this.bossBird.hp || 0);
      const maxHp = Math.max(1, this.bossBird.maxHp || 1);
      const progress = Phaser.Math.Clamp(hp / maxHp, 0, 1);
      this.bossHpText.setVisible(true).setText(`👑 BOSS HP: ${hp}/${maxHp}`);
      if (this.bossHpBarBg) this.bossHpBarBg.setVisible(true);
      if (this.bossHpBarFill) {
        this.bossHpBarFill.setVisible(true);
        this.bossHpBarFill.width = 300 * progress;
      }
    } else {
      this.bossHpText.setVisible(false).setText("");
      if (this.bossHpBarBg) this.bossHpBarBg.setVisible(false);
      if (this.bossHpBarFill) this.bossHpBarFill.setVisible(false).width = 0;
    }
  }

  checkWaveProgress() {
    if (this.isGameOver || this.waveInTransition) return;
    if (!this.bossActive && this.waveBirdSpawned >= this.waveBirdTarget && this.getAliveBirdCount(false) === 0) {
      if (this.shouldSpawnBossThisWave() && !this.bossSpawnedThisWave) {
        this.spawnBoss();
      } else if (!this.shouldSpawnBossThisWave() || this.bossSpawnedThisWave) {
        this.scheduleNextWave(this.bossSpawnedThisWave ? 2200 : 1500);
      }
    }
  }


  applyBulletHitbox(bullet, isSuper = false) {
    if (!bullet?.body) return;
    const radius = Math.max(9, Math.round(Math.min(bullet.displayWidth, bullet.displayHeight) * (isSuper ? 0.30 : 0.26)));
    const bodySize = radius * 2;
    const offsetX = (bullet.displayWidth - bodySize) / 2;
    const offsetY = (bullet.displayHeight - bodySize) / 2;
    bullet.body.setCircle(radius, offsetX, offsetY);
  }

  applyBirdHitbox(bird) {
    if (!bird?.body) return;
    const width = Math.max(22, Math.round(bird.displayWidth * (bird.isBoss ? 0.58 : 0.50)));
    const height = Math.max(22, Math.round(bird.displayHeight * (bird.isBoss ? 0.56 : 0.48)));
    bird.body.setSize(width, height, true);
  }

  isPreciseHit(bullet, bird) {
    if (!bullet?.active || !bird?.active) return false;
    const dx = bullet.x - bird.x;
    const dy = bullet.y - bird.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const bulletRadius = Math.max(9, Math.min(bullet.displayWidth, bullet.displayHeight) * 0.26);
    const birdRadius = Math.max(20, Math.min(bird.displayWidth, bird.displayHeight) * (bird.isBoss ? 0.34 : 0.28));
    return distance <= bulletRadius + birdRadius;
  }

  isSweptPreciseHit(bullet, bird) {
    if (!bullet?.active || !bird?.active) return false;
    const x1 = Number.isFinite(bullet.prevX) ? bullet.prevX : bullet.x;
    const y1 = Number.isFinite(bullet.prevY) ? bullet.prevY : bullet.y;
    const x2 = bullet.x;
    const y2 = bullet.y;
    const cx = bird.x;
    const cy = bird.y;
    const bulletRadius = Math.max(9, Math.min(bullet.displayWidth, bullet.displayHeight) * 0.26);
    const birdRadius = Math.max(20, Math.min(bird.displayWidth, bird.displayHeight) * (bird.isBoss ? 0.34 : 0.28));
    const r = bulletRadius + birdRadius;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq <= 0.0001) {
      const ddx = x2 - cx;
      const ddy = y2 - cy;
      return (ddx * ddx + ddy * ddy) <= r * r;
    }

    let t = ((cx - x1) * dx + (cy - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    const ddx = px - cx;
    const ddy = py - cy;
    return (ddx * ddx + ddy * ddy) <= r * r;
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

      const volleyId = ++this.superVolleySeq;
      this.superVolleyState[volleyId] = { remaining: 3, hit: false };
      const baseAngle = Phaser.Math.Angle.Between(gx, gy, tx, ty);
      const spread    = [-0.18, 0, 0.18];
      spread.forEach((offset) => {
        const ang = baseAngle + offset;
        const b = this.bullets.create(gx, gy, getBulletTextureKey());
        b.superVolleyId = volleyId;
        b.prevX = gx;
        b.prevY = gy;
        b.setScale(0.16 * this.bulletScaleBonus).setTint(0xFFD700);
        this.applyBulletHitbox(b, true);
        const vx = Math.cos(ang) * (speed + 300);
        const vy = Math.sin(ang) * (speed + 300);
        b.setVelocity(vx, vy);
        b.fxProfile = this.getBulletFxProfile(1, true, false);
        this.spawnTrail(b, b.fxProfile.trail, b.fxProfile.radius, b.fxProfile);
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

      const ring = this.add.circle(gx, gy, 8, 0xFFD700, 0.9).setDepth(18);
      this.tweens.add({ targets:ring, scaleX:6, scaleY:6, alpha:0, duration:300, onComplete:()=>ring.destroy() });
      this.spawnImpactBurst(gx, gy, [0xFFD700, 0xff7043, 0xfff59d], 14, 42, 6, true);
      return;
    }

    const bullet = this.bullets.create(gx, gy, getBulletTextureKey());
    bullet.prevX = gx;
    bullet.prevY = gy;
    bullet.setScale((0.06 + t * 0.06) * this.bulletScaleBonus);
    this.applyBulletHitbox(bullet, false);
    this.physics.moveTo(bullet, tx, ty, speed);
    bullet.chargeT = t;
    bullet.fxProfile = this.getBulletFxProfile(t, false, false);
    this.spawnTrail(bullet, bullet.fxProfile.trail, bullet.fxProfile.radius, bullet.fxProfile);

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
    this.spawnImpactBurst(gx, gy, [bullet.fxProfile.trail, bullet.fxProfile.secondary || 0xffffff], 6, 24, 4, true);
  }

  spawnImpactBurst(x, y, palette = [0xffffff], count = 10, spread = 120, size = 5, rise = false) {
    for (let i = 0; i < count; i++) {
      const color = palette[i % palette.length];
      const particle = this.add.circle(x, y, Phaser.Math.FloatBetween(size * 0.45, size), color, 0.95).setDepth(18);
      const dx = Phaser.Math.Between(-spread, spread);
      const dy = rise ? Phaser.Math.Between(-spread, -20) : Phaser.Math.Between(-spread, spread);
      this.tweens.add({
        targets: particle,
        x: x + dx,
        y: y + dy,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: Phaser.Math.Between(260, 520),
        ease: "Quad.easeOut",
        onComplete: () => particle.destroy()
      });
    }
  }

  spawnTrail(bullet, color, radius, options = {}) {
    const repeat = options.repeat ?? 6;
    const delay = options.delay ?? 16;
    const alpha = options.alpha ?? 0.6;
    const secondary = options.secondary || null;
    const pulse = options.pulse || false;
    const shadow = options.shadow || false;
    this.time.addEvent({ delay, repeat, callback:() => {
      if(!bullet.active) return;
      const trail = this.add.circle(bullet.x, bullet.y, radius, color, alpha).setDepth(8);
      if (shadow) trail.setStrokeStyle(2, secondary || 0xffffff, 0.55);
      if (pulse) {
        trail.setScale(0.8);
        this.tweens.add({ targets:trail, alpha:0, scaleX:1.9, scaleY:1.9, duration:220, onComplete:()=>trail.destroy() });
      } else {
        this.tweens.add({ targets:trail, alpha:0, scaleX:0, scaleY:0, duration:160, onComplete:()=>trail.destroy() });
      }
      if (secondary) {
        const sparkle = this.add.circle(bullet.x + Phaser.Math.Between(-4,4), bullet.y + Phaser.Math.Between(-4,4), Math.max(2, radius * 0.35), secondary, Math.min(0.95, alpha + 0.1)).setDepth(9);
        this.tweens.add({ targets:sparkle, alpha:0, y:sparkle.y - Phaser.Math.Between(8,18), duration:180, onComplete:()=>sparkle.destroy() });
      }
    }});
  }

  getBulletFxProfile(chargeT = 0, isSuper = false, isCrit = false) {
    if (isSuper) {
      return { trail: 0xFFD700, secondary: 0xff7043, radius: 9, repeat: 8, alpha: 0.75, pulse: true, hitPalette: [0xFFD700, 0xff7043, 0xfff59d], shake: 0.01 };
    }
    if (isCrit) {
      return { trail: 0xff8a65, secondary: 0xffcc80, radius: 7, repeat: 7, alpha: 0.72, pulse: true, hitPalette: [0xff8a65, 0xffcc80, 0xff7043], shake: 0.008 };
    }
    if (chargeT >= 0.8) {
      return { trail: 0xff4400, secondary: 0xffcc80, radius: 7, repeat: 7, alpha: 0.7, pulse: true, hitPalette: [0xff4400, 0xffcc80, 0xff7043], shake: 0.0065 };
    }
    if (chargeT >= 0.5) {
      return { trail: 0xffcc00, secondary: 0xfff59d, radius: 6, repeat: 6, alpha: 0.62, pulse: false, hitPalette: [0xffcc00, 0xfff59d, 0xffe082], shake: 0.005 };
    }
    return { trail: 0x00e5ff, secondary: 0x80deea, radius: 5, repeat: 5, alpha: 0.55, pulse: false, hitPalette: [0x00e5ff, 0x80deea, 0xb2ebf2], shake: 0.004 };
  }

  updateBoosterBars() {
    if (!this.slowBarFill || !this.x2BarFill || !this.superBarFill) return;
    const slowNeed = 6;
    const x2Need = 10;
    const slowHits = Phaser.Math.Clamp(this.comboHits, 0, slowNeed);
    const x2Hits = Phaser.Math.Clamp(this.comboHits, 0, x2Need);
    const slowT = this.slowMoReady || this.slowMoActive ? 1 : (slowHits / slowNeed);
    const x2T = this.doubleScoreReady || this.doubleScoreActive ? 1 : (x2Hits / x2Need);
    this.slowBarFill.width = Math.round(124 * slowT);
    this.x2BarFill.width = Math.round(124 * x2T);
    if (this.slowMoReady || this.slowMoActive) {
      this.slowBarFill.setFillStyle(0x7dd3fc, 1);
    } else {
      this.slowBarFill.setFillStyle(0x29b6f6, 0.95);
    }
    if (this.doubleScoreReady || this.doubleScoreActive) {
      this.x2BarFill.setFillStyle(0xffd180, 1);
    } else {
      this.x2BarFill.setFillStyle(0xffb74d, 0.95);
    }
    const superShotsNeed = Math.max(1, this.superThreshold || 6);
    const superT = Phaser.Math.Clamp((this.superCharge || 0) / superShotsNeed, 0, 1);
    this.superBarFill.width = Math.round(216 * superT);
    this.superBarFill.setFillStyle(this.superReady ? 0xfff176 : 0xFFD700, 0.98);
    if (this.superReady) {
      this.superLabel.setText('SUPER READY');
    } else if (this.superCharge > 0) {
      this.superLabel.setText(`${this.superCharge}/${superShotsNeed}`);
    } else {
      this.superLabel.setText('');
    }
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
    this.updateBoosterBars();
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
      this.updateBoosterBars();
    });
  }

  activateDoubleScore() {
    if (this.isGameOver || !this.doubleScoreReady || this.doubleScoreActive) return;
    this.doubleScoreReady = false;
    this.doubleScoreActive = true;
    this.updateBoosterButtons();
    this.updateBoosterBars();
    const label = this.add.text(this.scale.width/2, 220, "⚡ DOUBLE SCORE", {
      fontSize:"34px", color:"#ffcc80", stroke:"#000", strokeThickness:6, fontStyle:"bold"
    }).setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets:label, alpha:0, y:180, duration:1400, onComplete:()=>label.destroy() });
    this.time.delayedCall(6000, () => {
      this.doubleScoreActive = false;
      this.updateBoosterButtons();
      this.updateBoosterBars();
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

  resolveBulletOutcome(bullet, didHit = false) {
    if (!bullet || bullet._outcomeResolved) return;
    bullet._outcomeResolved = true;

    const volleyId = bullet.superVolleyId;
    if (volleyId) {
      const state = this.superVolleyState?.[volleyId];
      if (state) {
        if (didHit) state.hit = true;
        state.remaining = Math.max(0, (state.remaining || 0) - 1);
        if (state.remaining <= 0) {
          if (!state.hit) this.registerMiss();
          delete this.superVolleyState[volleyId];
        }
      }
      return;
    }

    if (!didHit) this.registerMiss();
  }

  getComboMultiplier() {
    if (this.comboHits >= 20) return 5;
    if (this.comboHits >= 10) return 3;
    if (this.comboHits >= 5) return 2;
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
    this.updateBoosterBars();
  }

  addCombo() {
    this.comboHits++;
    this.comboMult = this.getComboMultiplier();
    if (this.comboHits >= 6 && !this.slowMoReady && !this.slowMoActive) this.slowMoReady = true;
    if (this.comboHits >= 10 && !this.doubleScoreReady && !this.doubleScoreActive) this.doubleScoreReady = true;
    this.updateComboUI();
    this.updateBoosterButtons();
    this.updateBoosterBars();
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

    const spawnY  = Phaser.Math.Between(270, Math.floor(H*0.62));
    const startX  = side===0 ? -160 : W+160;
    const targetX = side===0 ? W+200 : -200;
    const targetY = spawnY + Phaser.Math.Between(-90,90);

    const bird = this.birds.create(startX, spawnY, texture);
    bird.setScale(scale);
    this.applyBirdHitbox(bird);
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
    if (!this.isPreciseHit(bullet, bird) && !this.isSweptPreciseHit(bullet, bird)) return;
    const pts      = bird.points;
    const isDanger = bird.isDanger;
    const isBoss   = !!bird.isBoss;
    const bx = bird.x, by = bird.y;

    this.resolveBulletOutcome(bullet, true);
    bullet.destroy();

    if (isBoss) {
      bird.hp -= 1;
      bird.setTintFill(0xffffff);
      this.time.delayedCall(70, () => {
        if (bird.active) bird.clearTint();
      });
      const bossFx = bullet.fxProfile || this.getBulletFxProfile(0.9, false, false);
      this.cameras.main.shake(70, Math.max(0.006, bossFx.shake || 0.006));
      this.spawnImpactBurst(bx, by, bossFx.hitPalette || [0xff8a65, 0xffcc80], 10, 56, 6);
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

      const bossHit = this.add.image(bx, by, "hit").setScale(1).setTint(0xffb300).setDepth(18);
      this.tweens.add({ targets:bossHit, alpha:0, scale:2.1, duration:500, onComplete:()=>bossHit.destroy() });
      for(let i=0;i<12;i++){
        const f = this.add.image(bx, by, "feather")
          .setScale(0.1+Math.random()*0.1).setRotation(Math.random()*Math.PI*2).setAlpha(0.95).setTint(i % 2 ? 0xffd54f : 0xff7043);
        this.tweens.add({ targets:f, x:bx+Phaser.Math.Between(-150,150), y:by+Phaser.Math.Between(-120,120),
          angle:Phaser.Math.Between(-180,180), alpha:0, duration:900+Math.random()*300, ease:"Quad.easeOut", onComplete:()=>f.destroy() });
      }

      const runMult = this.doubleScoreActive ? 2 : 1;
      const waveMult = this.waveProfile?.scoreMult || 1;
      const isCrit = Math.random() < this.critChance;
      const critMult = isCrit ? 2 : 1;
      const gained = Math.round(pts * this.comboMult * runMult * waveMult * critMult);
      this.score += gained;
      this.scoreText.setText(`SCORE: ${this.score}`);
      const bossPopup = this.add.text(bx, by-40, `${isCrit ? 'CRIT!  ' : ''}👑 BOSS DOWN  +${gained}`, {
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

      const dangerFx = bullet.fxProfile || this.getBulletFxProfile(0.3, false, false);
      this.spawnImpactBurst(bx, by, [0xff0000, dangerFx.trail, dangerFx.secondary || 0xffffff], 12, 90, 7);
      const hit = this.add.image(bx, by, "hit").setScale(0.6).setTint(0xff0000).setDepth(18);
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

    const runMult = this.doubleScoreActive ? 2 : 1;
    const waveMult = this.waveProfile?.scoreMult || 1;
    const isCrit = Math.random() < this.critChance;
    const critMult = isCrit ? 2 : 1;

    const shotFx = bullet.fxProfile || this.getBulletFxProfile(0.3, false, false);
    if (isCrit) shotFx.hitPalette = [0xff8a65, 0xffcc80, 0xff7043];
    this.spawnImpactBurst(bx, by, shotFx.hitPalette || [0xffffff], isCrit ? 12 : 8, isCrit ? 78 : 56, isCrit ? 6 : 5);
    const hit = this.add.image(bx, by, "hit").setScale(isCrit ? 0.68 : 0.5).setDepth(18);
    if (isCrit) hit.setTint(0xff8a65);
    this.tweens.add({ targets:hit, alpha:0, scale:1.3, duration:350, onComplete:()=>hit.destroy() });

    for(let i=0;i<5;i++){
      const f = this.add.image(bx, by, "feather")
        .setScale(0.08+Math.random()*0.06).setRotation(Math.random()*Math.PI*2).setAlpha(0.9);
      this.tweens.add({ targets:f, x:bx+Phaser.Math.Between(-80,80), y:by+Phaser.Math.Between(-60,80),
        angle:Phaser.Math.Between(-180,180), alpha:0, duration:700+Math.random()*300, ease:"Quad.easeOut", onComplete:()=>f.destroy() });
    }
    const gained = Math.round(pts * this.comboMult * runMult * waveMult * critMult);
    const color = isCrit ? "#ff8a65" : (this.comboMult >= 3 ? "#00e5ff" : (pts>=300?"#FFD700":"#7CFF00"));
    const popupParts = [`+${gained}`];
    if (isCrit) popupParts.unshift('CRIT!');
    if (this.comboMult > 1) popupParts.push(`x${this.comboMult}`);
    if (runMult > 1) popupParts.push("x2");
    const popupLabel = popupParts.join("  ");
    const popup = this.add.text(bx, by-30, popupLabel, {
      fontSize:"60px", color, stroke:"#000", strokeThickness:7, fontStyle:"bold"
    }).setOrigin(0.5);
    this.tweens.add({ targets:popup, y:popup.y-80, alpha:0, duration:700, ease:"Quad.easeOut", onComplete:()=>popup.destroy() });

    this.score += gained;
    this.scoreText.setText(`SCORE: ${this.score}`);
    this.cameras.main.shake(90, (shotFx.shake || 0.004) + Math.min(this.comboMult, 5) * 0.0015);
  }

  updateGameTimer() {
    if(this.isGameOver || this.modeId !== "timeAttack") return;
    this.timeLeft--;
    this.timeText.setText(`⏱ ${this.timeLeft}`);
    if(this.timeLeft<=10) this.tweens.add({ targets:this.timeText, alpha:0.2, duration:200, yoyo:true });
    const newPressure = this.timeLeft <= 10 ? 2 : this.timeLeft <= 25 ? 1 : 0;
    if (newPressure !== this.timePressureLevel) {
      this.timePressureLevel = newPressure;
      this.spawnDelayCurrent = Math.max(360, this.spawnDelayCurrent - (newPressure === 2 ? 120 : 60));
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
    const survivalMul = this.getSurvivalBonusMultiplier(this.waveIndex);
    const finalScore = Math.round(this.score * survivalMul);
    this.finalScore = finalScore;
    this.add.text(W/2,H/2-20,`SCORE: ${finalScore}`,{ fontSize:"62px", color:"#FFD700", stroke:"#000", strokeThickness:8 }).setOrigin(0.5);
    this.add.text(W/2,H/2+18,`ФИНАЛЬНЫЙ БОНУС ВОЛНЫ: x${survivalMul}`,{ fontSize:"24px", color:"#fff", stroke:"#000", strokeThickness:5, fontStyle:"bold" }).setOrigin(0.5);

    let rank="🐦 Новичок";
    if(finalScore>=5000) rank="👑 Легенда";
    else if(finalScore>=2500) rank="🏆 Мастер";
    else if(finalScore>=1000) rank="🎯 Снайпер";
    this.add.text(W/2,H/2+62,rank,{ fontSize:"42px", color:"#00e5ff", stroke:"#000", strokeThickness:6 }).setOrigin(0.5);

    const comboBonus = this.comboMult >= 5 ? 1.5 : this.comboMult >= 3 ? 1.2 : 1;
    this.coinReward = Math.max(1, Math.floor(finalScore / 10 * comboBonus));
    let totalCoins = addCoins(this.coinReward);
    const missionUpdate = updateMissionProgress({ totalHits: this.sessionHits, totalScore: finalScore, gamesPlayed: 1 });
    totalCoins = missionUpdate.coins;
    this.registry.set("coins", totalCoins);
    this.registry.set("missions", missionUpdate.missions);
    if (survivalMul > 1) {
      this.add.text(W/2,H/2+78,`🌊 Бонус за выживание x${survivalMul}`,{ fontSize:"24px", color:"#7CFF00", stroke:"#000", strokeThickness:5, fontStyle:"bold" }).setOrigin(0.5);
    }
    this.add.text(W/2,H/2+110,`🪙 +${this.coinReward}   Всего: ${totalCoins}`,{ fontSize:"30px", color:"#FFD700", stroke:"#000", strokeThickness:5 }).setOrigin(0.5);
    if (missionUpdate.granted.length) {
      const msg = missionUpdate.granted.map((m) => `+${m.reward} ${m.title}`).join("   ");
      this.add.text(W/2,H/2+144, `🎯 Миссия: ${msg}`, { fontSize:"22px", color:"#7CFF00", stroke:"#000", strokeThickness:4, align:"center" }).setOrigin(0.5);
    }

    this.rankText = this.add.text(W/2,H/2+176, "Сохраняем результат...", {
      fontSize:"30px", color:"#fff", stroke:"#000", strokeThickness:5, fontStyle:"bold"
    }).setOrigin(0.5);

    this.drawEndLeaderboardShell(W, H);

    const btn=this.add.rectangle(W/2,H/2+348,400,90,0xff6f00).setStrokeStyle(5,0xFFD700).setInteractive({ useHandCursor: true });
    this.add.text(W/2,H/2+348,"МЕНЮ",{ fontSize:"48px", color:"#fff", stroke:"#000", strokeThickness:7, fontStyle:"bold" }).setOrigin(0.5);
    this.tweens.add({ targets:btn, scaleX:1.05, scaleY:1.05, duration:600, yoyo:true, repeat:-1 });
    btn.once("pointerdown", ()=>{
      hideDomModals();
      btn.disableInteractive();
      try { this.input.enabled = true; } catch (e) {}
      this.scene.start("MenuScene");
    });

    const rows = await LeaderboardService.addScore(this.playerName, finalScore, this.modeId);
    const topRows = Array.isArray(rows) ? rows : [];
    const topBeforeScore = topRows.length ? topRows[0].score : 0;
    this.finalRankPosition = await LeaderboardService.getRank(finalScore, this.modeId);
    const isNewRecord = topRows.length ? finalScore >= topBeforeScore : true;

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
    this.add.text(W/2, H/2+166, LeaderboardService.getStatusLabel(this.modeId), {
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
      const rowColor = row.name === this.playerName && row.score === this.finalScore ? "#7CFF00" : "#fff";
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
