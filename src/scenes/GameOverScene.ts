import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { SoundSystem } from '../core/SoundSystem';
import { SaveManager } from '../core/SaveManager';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { levelIndex: number; reason: string }): void {
    const sound = SoundSystem.getInstance();
    sound.playDefeat();

    // Background: Cinematic Detained / Section 144 Barricade image if loaded
    if (this.textures.exists('detained_bg')) {
      const bgImg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'detained_bg');
      const scale = Math.max(GAME_WIDTH / bgImg.width, GAME_HEIGHT / bgImg.height);
      bgImg.setScale(scale).setScrollFactor(0);
      bgImg.setTint(0x999999);
    }

    // Dark tactical vignette overlay
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0a0a, 0x1a0a0a, 0x080404, 0x080404, 0.88);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Red warning scanlines
    const lines = this.add.graphics();
    lines.lineStyle(1, 0xff3b30, 0.18);
    for (let y = 0; y < GAME_HEIGHT; y += 8) {
      lines.lineBetween(0, y, GAME_WIDTH, y);
    }

    // Prominent "DETAINED!" Header
    this.add.text(GAME_WIDTH / 2, 85, 'DETAINED!', {
      fontFamily: 'Outfit, Impact, sans-serif',
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#ff3b30',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 132, 'SECTION 144 CRACKDOWN • DIVERTON TO TALKATORA STADIUM', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#e74c3c',
      letterSpacing: 2,
    }).setOrigin(0.5);

    // Defeat Stats Card
    const cardW = 520;
    const cardH = 265;
    const cardX = GAME_WIDTH / 2 - cardW / 2;
    const cardY = 175;

    const card = this.add.graphics();
    card.fillStyle(0x0a0f18, 0.95);
    card.fillRoundedRect(cardX, cardY, cardW, cardH, 8);
    card.lineStyle(1.5, 0x5c2424, 1);
    card.strokeRoundedRect(cardX, cardY, cardW, cardH, 8);

    // Detained Status Banner
    const elimBanner = this.add.graphics();
    elimBanner.fillStyle(0x381212, 0.95);
    elimBanner.fillRoundedRect(cardX + 20, cardY + 18, cardW - 40, 52, 6);
    elimBanner.lineStyle(1.5, 0xff3b30, 0.8);
    elimBanner.strokeRoundedRect(cardX + 20, cardY + 18, cardW - 40, 52, 6);

    const leaderName = SaveManager.getInstance().getPlayerName();
    this.add.text(cardX + 35, cardY + 24, `LEADER: ${leaderName.toUpperCase()}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#bdc3c7',
      letterSpacing: 1,
    });

    this.add.text(cardX + 35, cardY + 42, 'STATUS: DETAINED (धारा 144)', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ff3b30',
      letterSpacing: 1,
    });

    // Rating Badge (PUBG Rank B)
    const badge = this.add.graphics();
    badge.fillStyle(0xc0392b, 1);
    badge.fillRoundedRect(cardX + cardW - 80, cardY + 24, 44, 40, 4);
    this.add.text(cardX + cardW - 58, cardY + 44, 'B', {
      fontFamily: 'Impact, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Tactical Lore Report
    const reasonText = data.reason || 'Leader detained under Section 144.';
    const reportText = `
INCIDENT REPORT:
${reasonText}

Detained marchers have been loaded onto DTC buses and diverted to Talkatora Stadium holding camp. 

TACTICAL TIP:
Gather a larger Kafila (+10 citizens) before pushing through yellow barricades, or use the CHANT slogan [Spacebar] to intimidate solitary constables backwards!
    `;

    this.add.text(cardX + 30, cardY + 90, reportText, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      lineSpacing: 5,
      color: '#ecf0f1',
      wordWrap: { width: cardW - 60 },
    });

    // Action Buttons
    const btnY = 500;
    this.createPubgButton(
      GAME_WIDTH / 2 - 130,
      btnY,
      '↺ RETRY MARCH',
      0xff7700,
      () => {
        sound.playClick();
        this.scene.start('GameScene', { levelIndex: data.levelIndex });
      }
    );

    this.createPubgButton(
      GAME_WIDTH / 2 + 130,
      btnY,
      'MAIN MENU',
      0x1b2838,
      () => {
        sound.playClick();
        this.scene.start('MenuScene');
      }
    );
  }

  private createPubgButton(x: number, y: number, text: string, bgColor: number, onClick: () => void): void {
    const w = 220;
    const h = 46;
    const c = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(bgColor, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    bg.lineStyle(1.5, 0xffffff, 0.4);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    c.add([bg, label]);
    c.setSize(w, h);
    c.setInteractive({ useHandCursor: true });

    c.on('pointerdown', onClick);
  }
}
