# Contributing to Chalo Jantar Mantar (चलो जंतर मंतर)

Thank you for your interest in contributing to **Chalo Jantar Mantar**! This project is an open-source satirical Delhi crowd-runner built with TypeScript, Phaser 3, and Vite.

---

## 🚀 How to Run Locally

```bash
# 1. Clone your fork
git clone https://github.com/<your-username>/country_defender.git
cd country_defender

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Build production bundle & check types
npm run build
```

---

## 🛠️ How You Can Contribute

### 1. Adding New Slogans & Speech Lines
Edit `src/scenes/GameScene.ts` and `src/core/SpeechVoiceSystem.ts`:
```ts
const slogans = [
  'चलो जंतर मंतर!',
  'इंक़लाब ज़िन्दाबाद!',
  'आज़ादी!',
  'YOUR_NEW_SLOGAN_HERE!'
];
```

### 2. Creating New Levels & Delhi Routes
Add a new level object to `src/config/levelData.ts`:
```ts
{
  id: 5,
  key: 'level_5',
  name: 'India Gate to Kartavya Path',
  subtitle: 'Grand Boulevard March',
  difficulty: DIFFICULTY.HARD,
  difficultyLabel: 'CUSTOM HARD',
  roadLength: 4200,
  roadWidth: 380,
  minCrowdForVictory: 35,
  targetDistance: 4000,
  barricadeCount: 18,
  barricadeTiers: 3,
  bystanderCount: 40,
  policeCount: 25,
  ...
}
```

### 3. Adding New Delhi Vehicles & Satirical Props
- Define sprite graphics in `src/scenes/BootScene.ts`.
- Implement AI and physics in `src/entities/Vehicle.ts`.

---

## ⚖️ Guidelines for Contributions
- **No Real Names:** Never use real names or likenesses of living politicians or individuals to protect from defamation.
- **Pure Code & Procedural Assets:** Do not commit copyrighted MP3s, movie clips, or commercial game textures. All audio and graphics should remain procedural or royalty-free CC0.
- **Keep Performance at 60 FPS:** Verify that `npm run build` succeeds without any TypeScript errors.

---

## 📜 License
By contributing, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).
