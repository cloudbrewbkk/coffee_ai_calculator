# ☕ BREW.AI — Pour Over Intelligence

A pour-over coffee recipe calculator that learns from your taste feedback.

## Features

- **Smart Recipe Engine** — Calculates dose, water, temp, grind, and brew time based on bean profile
- **Dripper-aware** — Adjusts recipe for V60, Kalita, Origami, Melitta, Flat Bottom, and Cone
- **Taste Feedback System** — Select how the cup tasted; AI adjusts the recipe in real-time
- **Local Learning** — Stores your feedback in localStorage (with consent) for future improvement
- **Dark UI** — Premium coffee-shop aesthetic with warm amber tones

## How It Works

1. Select your bean's **roast**, **process**, and **origin**
2. Choose your **flavor preference** and **brew style**
3. Pick your **dripper**
4. Hit **Generate Recipe** → get a precision pour-over recipe
5. Brew and taste → submit **feedback** → AI adjusts the recipe on the spot

## Tech Stack

- Pure HTML / CSS / JavaScript (no dependencies)
- `localStorage` for optional feedback storage
- Google Fonts: Playfair Display · DM Sans · DM Mono

## Inputs → Recipe Logic

| Input         | Effect                                      |
|---------------|---------------------------------------------|
| Light roast   | Higher extraction score → higher temp       |
| Washed process| Cleaner extraction → finer grind            |
| Ethiopian origin | High density → medium-fine grind         |
| Fruity style  | Lower dose, slightly lower score            |
| V60 dripper   | +1°C, +0.3 min, finer grind                |
| Kalita dripper| -1°C, -0.2 min, coarser grind              |

## Feedback → AI Adjustment

| Taste      | Adjustment                          |
|------------|-------------------------------------|
| Too sour   | +1°C, +0.2 min, finer grind         |
| Too bitter | -1°C, -0.2 min, coarser grind       |
| Too weak   | Lower ratio (more coffee per water) |
| Astringent | -1°C, coarser grind                 |

## Future Roadmap

- [ ] Export feedback data as CSV
- [ ] Python model trained on collected data
- [ ] Cloud sync (user accounts)
- [ ] Dashboard: flavor trend analysis
- [ ] AI bean recommendation engine
