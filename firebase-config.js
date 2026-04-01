// Bird Blaster Firebase config
// Чтобы включить единый рейтинг для всех устройств:
// 1) Создай Firebase project
// 2) Включи Firestore Database
// 3) Вставь сюда свои данные
// 4) Открой index.html / загрузи проект на хостинг

window.BIRD_BLASTER_ENABLE_GLOBAL_LEADERBOARD = false;
window.BIRD_BLASTER_FIREBASE_CONFIG = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN",
  projectId: "PASTE_YOUR_PROJECT_ID",
  appId: "PASTE_YOUR_APP_ID"
};

// Опционально: свой путь коллекции
window.BIRD_BLASTER_LEADERBOARD_COLLECTION = "leaderboard";
