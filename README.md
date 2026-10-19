# Chalo Jantar Mantar (चलो जंतर मंतर)
### Satirical Delhi Protest March Simulator in 2.5D Isometric View

Built with **Phaser 3**, **TypeScript**, and **Vite** — engineered with clean modular architecture for **PC (Desktop/Web)** and ready for **iOS (Mobile App via Capacitor / WebView)**.

---

## 🏛️ Game Overview & Satirical Delhi Lore

Inspired by real-world Delhi marches heading towards the historic protest grounds at **Jantar Mantar**, players take on the role of the **Protest Leader (*Andolankari*)**:
- Recruit citizens into your growing **Kafila** (crowd) along the boulevards.
- Chant slogans (*"Chalo Jantar Mantar!"*, *"Azaadi!"*, *"Hum Honge Kaamyab!"*) to raise morale and expand your reach.
- Smash through iconic **Delhi Police yellow steel barricades** using crowd weight and sprint charges.
- Dodge police cordons, **Tear Gas smoke shells**, high-pressure **Water Cannon ("Vajra") trucks**, and **Internet Jammer vans** (which scramble your GPS radar under Section 144).
- Overcome DTC bus traffic jams and reach the finish line at the **Samrat Yantra** monument to establish a victorious dharna!

---

## 🎮 Controls

### PC (Desktop / Laptop)
| Action | Key / Control |
|---|---|
| **Move** | `W`, `A`, `S`, `D` or `Arrow Keys` |
| **Slogan / Chant** | `Spacebar` / `C` / `E` |
| **Sprint / Dash** | Hold `Shift` |
| **Sound Toggle** | Top-right sound button |

### Mobile / Touch (iOS & Android)
| Action | Touch Control |
|---|---|
| **Movement** | Virtual Analog Joystick (bottom-left touch zone) |
| **Slogan / Chant** | Green `📢 CHANT` action button |
| **Sprint / Dash** | Orange `⚡ DASH` action button |

---

## 🗺️ Levels & Hardness Ratings

1. **Level 1: ITO Chowk to Tilak Marg (`LOW HARDNESS`)**
   - *Objective:* Gather 8+ citizens into your Kafila.
   - *Obstacles:* Light police constables, slow DTC buses, single-layer yellow barricades.
   - *Hazards:* None (Tear gas & water cannons disabled).

2. **Level 2: Mandi House to Connaught Place Circle (`MID HARDNESS`)**
   - *Objective:* Gather 16+ citizens.
   - *Obstacles:* Double-layer reinforced barricades, Section 144 zones, DTC gridlocks & auto-rickshaws.
   - *Hazards:* Tear Gas squads dropping disorienting smoke, Mobile Internet Jammer van disabling 5G radar.

3. **Level 3: Parliament Street to Jantar Mantar (`TOUGH / HARD`)**
   - *Objective:* Gather 28+ citizens to storm the barricades.
   - *Obstacles:* 3-tier steel riot barricades, riot police locking shield walls, PCR Gypsy patrols.
   - *Hazards:* Armored **Vajra Water-Cannon trucks** firing high-pressure jets, tear gas shells, continuous Section 144 alerts.
   - *Climax:* The terracotta-red **Samrat Yantra** finish stage with tricolor confetti celebration!

---

## 🏗️ Architecture & Codebase Structure

```
country_defender/
├── index.html                  # Mobile-ready HTML with iOS viewport tags & status bar styling
├── src/
│   ├── main.ts                 # Application entry point & Phaser initialization
│   ├── style.css               # Responsive styling, touch-action handling, iOS safe area insets
│   ├── config/
│   │   ├── constants.ts        # Isometric tile dimensions, game resolutions, color palettes
│   │   ├── levelData.ts        # Level definitions, parameters, and difficulty presets
│   │   └── gameConfig.ts       # Phaser scale manager, multi-touch input, scene pipeline
│   ├── core/
│   │   ├── IsometricUtils.ts   # 2.5D Isometric transformations & dynamic depth sorting
│   │   ├── SoundSystem.ts      # Web Audio procedural sound synthesizer (sirens, dhol, crash, fanfare)
│   │   └── InputHandler.ts     # Unified keyboard + mobile virtual joystick & touch handler
│   ├── entities/
│   │   ├── Player.ts           # Protest leader with sprint energy, detention meter, flag animation
│   │   ├── CrowdMember.ts      # Flocking crowd with bystander, following, and dispersed states
│   │   ├── PoliceOfficer.ts    # Constable and Riot police AI (patrol, chase, whistle, detain)
│   │   ├── Barricade.ts        # Yellow Delhi Police barricades with HP, shake, and topple physics
│   │   ├── Vehicle.ts          # DTC buses, Auto-rickshaws, PCR Gypsies, Vajra, Jammer vans
│   │   ├── Hazards.ts          # Tear Gas smoke clouds and high-pressure Water Cannon jets
│   │   └── MediaCrew.ts        # TV news crew granting crowd and morale boosts
│   └── scenes/
│       ├── BootScene.ts        # Procedural texture generator (sharp 2.5D graphics, 0 external asset load)
│       ├── MenuScene.ts        # Title screen, Delhi skyline, animated preview, help modal
│       ├── LevelSelectScene.ts # 3 Difficulty cards (Low, Mid, Hard) with route stats
│       ├── GameScene.ts        # Core gameplay loop, camera tracking, crowd physics, detention checks
│       ├── UIScene.ts          # HUD overlay: Kafila counter, detention bar, radar, mobile joystick
│       ├── VictoryScene.ts     # Celebration at Jantar Mantar with tricolor confetti & statistics
│       └── GameOverScene.ts    # Satirical newspaper headline ("Talkatora Stadium" detention camp)
```

---

## 📱 Porting to iOS App (Capacitor)

The game is pre-configured with responsive viewport meta tags, safe-area-insets, multi-touch listeners, and touch-action suppression to wrap into an iOS app.

To generate an iOS Xcode project:

```bash
# 1. Build the production web bundle
npm run build

# 2. Install Capacitor CLI and iOS bridge
npm install @capacitor/core @capacitor/cli @capacitor/ios

# 3. Initialize Capacitor
npx cap init "Chalo Jantar Mantar" "com.chalojantarmantar.game" --web-dir=dist

# 4. Add the iOS platform
npx cap add ios

# 5. Open in Xcode
npx cap open ios
```
In Xcode, set your Development Team and click **Run** to launch directly on iPhone Simulator or physical iOS devices!

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```
Open **`http://127.0.0.1:5173/`** in your browser to play!
