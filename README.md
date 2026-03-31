# Bird Blaster 🐦

Мини-игра на Phaser 3 — стреляй по птицам!

## Запуск

### Вариант 1 — Python (самый простой, без установки)
```bash
cd bird-blaster
python3 -m http.server 8080
```
Открой: http://localhost:8080

### Вариант 2 — Node.js (npx)
```bash
cd bird-blaster
npx serve .
```
Открой: http://localhost:3000

### Вариант 3 — VS Code Live Server
1. Установи расширение "Live Server"
2. Открой папку в VS Code
3. ПКМ по index.html → "Open with Live Server"

## Файлы
- index.html — точка входа
- game.js — вся логика игры
- (PNG-ассеты НЕ нужны — всё рисуется через Canvas)

## Управление
- Тап / клик = выстрел в то место
- Пушка поворачивается к цели

## Птицы
| Птица  | Очки | Скорость |
|--------|------|----------|
| Синяя  | +100 | средняя  |
| Красная| +150 | быстрая  |
| Золотая| +300 | средняя  |
