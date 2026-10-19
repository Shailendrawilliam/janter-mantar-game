import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { SoundSystem } from '../core/SoundSystem';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { levelIndex: number; reason: string }): void {
    const sound = SoundSystem.getInstance();
    sound.playDefeat();

    // Dark tactical vignette background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0a0a, 0x1a0a0a, 0x080404, 0x080404, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Red warning scanlines
    const lines = this.add.graphics();
    lines.lineStyle(1, 0xff3b30, 0.15);
    for (let y = 0; y < GAME_HEIGHT; y += 8) {
      lines.lineBetween(0, y, GAME_WIDTH, y);
    }

    // PUBG Style "BETTER LUCK NEXT TIME!" Header
    this.add.text(GAME_WIDTH / 2, 90, 'BETTER LUCK NEXT TIME!', {
      fontFamily: 'Outfit, Impact, sans-serif',
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#ff3b30',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 135, 'RANK #43 / 100 • SECTION 144 CRACKDOWN', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#bdc3c7',
      letterSpacing: 2,
    }).setOrigin(0.5);

    // PUBG Defeat Stats Card
    const cardW = 500;
    const cardH = 260;
    const cardX = GAME_WIDTH / 2 - cardW / 2;
    const cardY = 180;

    const card = this.add.graphics();
    card.fillStyle(0x0f141c, 0.95);
    card.fillRoundedRect(cardX, cardY, cardW, cardH, 8);
    card.lineStyle(1.5, 0x3a4b5d, 1);
    card.strokeRoundedRect(cardX, cardY, cardW, cardH, 8);

    // Elimination Banner
    const elimBanner = this.add.graphics();
    elimBanner.fillStyle(0x2c1010, 0.9);
    elimBanner.fillRoundedRect(cardX + 20, cardY + 20, cardW - 40, 48, 6);
    elimBanner.lineStyle(1, 0xff3b30, 0.6);
    elimBanner.strokeRoundedRect(cardX + 20, cardY + 20, cardW - 40, 48, 6);

    this.add.text(cardX + 35, cardY + 28, 'DETAINED BY:', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#bdc3c7',
    });

    this.add.text(cardX + 35, cardY + 44, 'DELHI POLICE CORDON (SECTION 144)', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ff3b30',
    });

    // Rating (PUBG Rank B)
    const badge = this.add.graphics();
    badge.fillStyle(0x424949, 1);
    badge.fillRoundedRect(cardX + cardW - 75, cardY + 24, 40, 40, 4);
    this.add.text(cardX + cardW - 55, cardY + 44, 'B', {
      fontFamily: 'Impact, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Tactical Lore Report
    const reasonText = data.reason || 'Leader detained by Delhi Police cordons.';
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
