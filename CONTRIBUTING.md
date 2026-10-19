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

## 🗺️ Priority Roadmap & Help Wanted (To-Do List)

We are actively welcoming Pull Requests for these major feature additions:

1. **🌐 Real-Time Multiplayer Mode (Co-Op & PvP)**
   - **Co-op Kafila March**: Allow multiple protest leaders online (WebSockets / Socket.io / Colyseus) merging their crowds together to storm Delhi Police riot barricades.
   - **Cops vs Protesters Mode**: 1 player acts as Delhi Police Commissioner deploying water cannons & barricades while other players navigate the march.

2. **🎭 Role Selection & Character Customization (Characterization)**
   - Add a character selection screen with distinct archetypes and stats:
     - 🎓 **Student Leader**: +25% sprint speed, fast slogans.
     - 🌾 **Kisan Union Chief**: High crowd stability, Swaraj tractor bonus.
     - ⚖️ **Legal Aid Advocate**: Half-price Anticipatory Bail, quick immunity against detention.
     - 🥁 **Cultural Dholak Artist**: High rally aura radius, crowd recovery speed.

3. **📸 Custom Face Photo Upload (Avatar Creator)**
   - HTML5 file input / selfie upload in the main menu or character creator.
   - Dynamic canvas texture generation mapping the player's face onto:
     - The 2.5D Protest Leader in-game sprite.
     - Rally placards carried by the Kafila crowd.
     - The Victory & Detained newspaper headline photo frames!

4. **🏆 Online Global Leaderboard**
   - Connect high scores, distance marched, and crowd sizes to an online leaderboard (e.g. Supabase / Firebase).

5. **🚊 Overhead Delhi Metro Train Hazard**
   - Metro trains passing overhead across the elevated viaduct with dynamic shadows and procedural rumble audio.

Thank you for supporting Indian Indie Game Development! ⭐
