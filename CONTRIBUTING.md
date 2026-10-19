# Contributing to Chalo Jantar Mantar (चलो जंतर मंतर) 🇮🇳

Thank you for your interest in contributing to **Chalo Jantar Mantar**! We welcome bug fixes, satirical lore additions, new obstacles, sound enhancements, and performance optimizations.

---

## 🌟 How to Contribute

1. **Fork the Repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/janter-mantar-game.git
   cd country_defender
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/awesome-new-feature
   ```
5. **Develop & Test Locally**:
   ```bash
   npm run dev
   ```
6. **Verify Strict TypeScript Compilation**:
   ```bash
   npm run build
   ```
   *(Ensure zero TypeScript errors before committing!)*
7. **Commit & Push**:
   ```bash
   git commit -m "feat: Add DTC electric bus variant and horn sound"
   git push origin feature/awesome-new-feature
   ```
8. **Open a Pull Request** with a brief summary of what your change introduces.

---

## 📐 Code Style & Engineering Standards

- **Language**: TypeScript (ES2023+). Strict type safety without `any`.
- **Game Engine**: Phaser 3 / 4.
- **Audio Philosophy**: We prioritize zero-latency procedural Web Audio synthesis in `SoundSystem.ts`. If adding sound effects, write an oscillator/envelope generator rather than bundling heavy audio files.
- **Visuals**: Vector graphics generated directly via `Phaser.GameObjects.Graphics` inside `BootScene.ts`.
- **Depth Sorting**: All moving dynamic entities must update their depth using standard Cartesian Y-coordinate sorting in `update()`.

---

## 💡 Ideas for Future Contributions

- 🚊 **Delhi Metro Overpass**: Trains running on overhead tracks creating periodic shadows.
- 🪧 **Customizable Placards**: Allow players to type custom protest slogans on banners.
- 🌧️ **Delhi Smog & Weather Mode**: Dynamic AQI smog haze effects with mask loot power-ups.
- 🏆 **Online Global Leaderboard**: Connect high scores to a Supabase or Firebase backend.

Thank you for supporting Indian Indie Game Development! ⭐
