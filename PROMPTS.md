# Bird Blaster — промпты для генерации ассетов

Генерируй в **ChatGPT Image** (или Midjourney, Leonardo).
Каждый ассет — отдельный запрос.
Сохраняй в папку `assets/` с точными именами файлов.

---

## bg.png — Фон игры

```
Mobile game background, vertical orientation 9:16.
Bright cartoon style. Blue sky with fluffy white clouds.
Bottom third: dense green forest with cartoon pine trees and oak trees.
Bright sunny day, vivid colors. Flat cartoon illustration.
No characters, no text. Game background art.
Style: colorful 2D mobile game like Angry Birds or Cut the Rope.
```

---

## gun.png — Пушка (вид снизу вверх)

```
Cartoon game weapon sprite. Colorful toy blaster / cannon,
viewed from below pointing upward. Bright colors: orange body,
green stripes, yellow accents, dark barrel with blue glow at tip.
Wooden grip at bottom. Chunky cartoon style, thick outlines.
Transparent background PNG. Isolated game asset.
Size: square canvas, weapon takes up most of the space.
Style: casual mobile game, Clash Royale art style.
```

---

## bird_blue.png — Синяя птица (обычная)

```
Cartoon game sprite. Fat cute blue bird flying horizontally
to the LEFT. Big round eyes, small orange beak, stubby wings spread wide,
fluffy feathers, round chubby body. Bright blue color with lighter belly.
Thick black outline. White highlight in eye.
Transparent background PNG. Isolated on white or transparent.
Style: Angry Birds inspired, casual mobile game art.
Resolution: 512x512px.
```

---

## bird_red.png — Красная птица (быстрая, злая)

```
Cartoon game sprite. Fat angry red bird flying horizontally to the LEFT.
Angry eyebrows furrowed, sharp red crest on head, big round eyes with
mean expression, small beak, wings spread. Bright red with darker wing tips.
Thick black outline. Chunky cartoon style.
Transparent background PNG. Isolated.
Style: Angry Birds inspired, casual mobile game art.
Resolution: 512x512px.
```

---

## bird_gold.png — Золотая птица (бонусная, с короной)

```
Cartoon game sprite. Fat cute golden yellow bird flying horizontally to the LEFT.
Wearing a tiny golden crown on head. Big sparkling eyes, happy expression,
round chubby body, fluffy golden feathers, small orange beak.
Sparkle/star effects around the bird. Bright gold and yellow colors.
Thick black outline. Transparent background PNG. Isolated.
Style: Angry Birds inspired, casual mobile game art. 
Resolution: 512x512px.
```

---

## bird_black.png — Чёрная птица (опасная, -жизнь)

```
Cartoon game sprite. Fat dark gray / black bird flying horizontally to the LEFT.
Menacing expression, sharp curved beak like a crow or raven,
small angry red eyes, ruffled dark feathers, chunky body.
Dark charcoal color with subtle dark purple sheen.
Thick black outline with slight red glow/aura around it to show danger.
Transparent background PNG. Isolated.
Style: Angry Birds inspired, casual mobile game art.
Resolution: 512x512px.
```

---

## bullet.png — Снаряд / пуля

```
Cartoon game projectile sprite. Glowing energy ball / bullet.
Bright cyan/blue color with white hot center, energy glow effect.
Small round shape with motion blur streak behind it going upward.
Cartoon style, thick outlines. Transparent background PNG.
Resolution: 128x256px, bullet pointing upward.
Style: casual mobile game power-up / projectile.
```

---

## hit.png — Вспышка попадания

```
Cartoon explosion / hit effect sprite for mobile game.
Bright yellow and orange starburst explosion, white hot center,
rays shooting outward. No smoke, just clean cartoon flash effect.
Round starburst shape. Transparent background PNG.
Resolution: 256x256px.
Style: Angry Birds hit effect, cartoon casual game.
```

---

## feather.png — Перо (эффект попадания)

```
Single cartoon bird feather sprite. White feather, soft edges,
simple shape. Slightly curved. Transparent background PNG.
Resolution: 64x128px, feather pointing upward.
Style: simple flat cartoon illustration.
```

---

# Инструкция

1. Открой ChatGPT → выбери Image Generation (DALL·E 4 / GPT-4o)
2. Скопируй промпт для каждого ассета
3. Скачай PNG (правой кнопкой → Сохранить как)
4. Положи в папку `assets/` с точным именем файла
5. Задеплой обновлённую папку на Vercel (просто загрузи файлы в GitHub репо)

## Советы по генерации

- Если фон птицы не прозрачный — попроси: **"remove background, transparent PNG"**
- Если птица смотрит вправо — попроси: **"mirror the image horizontally"**
- Если стиль не тот — добавь: **"Supercell game art style"** или **"Rovio Angry Birds style"**
- Размер не критичен — игра масштабирует автоматически

## После загрузки ассетов

Если птицы кажутся слишком большими или маленькими —
найди в `game.js` строку `scale=0.26` и измени число:
- Больше = птица крупнее (0.3, 0.4...)
- Меньше = птица мельче (0.2, 0.15...)

Аналогично для пушки: найди `setScale(0.55)` в GameScene.
