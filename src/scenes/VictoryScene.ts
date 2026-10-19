import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { LEVELS } from '../config/levelData';
import { SoundSystem } from '../core/SoundSystem';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  create(data: { levelIndex: number; finalCrowd: number; barricadesBroken: number }): void {
    const sound = SoundSystem.getInstance();
    sound.playVictory();

    const currentLevel = LEVELS[data.levelIndex] || LEVELS[0];
    const hasNextLevel = data.levelIndex + 1 < LEVELS.length;

    // Dark tactical background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a1018, 0x0a1018, 0x05080c, 0x05080c, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Confetti
    this.createConfetti();

    // Central Monument Graphic
    const monument = this.add.image(GAME_WIDTH / 2, 210, 'jantar_mantar_monument');
    monument.setScale(1.15);

    // PUBG Style Golden Laurel Banner
    const bannerW = 600;
    const bannerH = 75;
    const banner = this.add.graphics();
    banner.fillStyle(0x0a1018, 0.9);
    banner.fillRoundedRect(GAME_WIDTH / 2 - bannerW / 2, 45, bannerW, bannerH, 8);
    banner.lineStyle(2, 0xf2a900, 1);
    banner.strokeRoundedRect(GAME_WIDTH / 2 - bannerW / 2, 45, bannerW, bannerH, 8);

    // Golden Wings / Accents
    banner.fillStyle(0xf2a900, 1);
    banner.fillRect(GAME_WIDTH / 2 - bannerW / 2 + 10, 48, 12, bannerH - 6);
    banner.fillRect(GAME_WIDTH / 2 + bannerW / 2 - 22, 48, 12, bannerH - 6);

    // PUBG Victory Title
    this.add.text(GAME_WIDTH / 2, 70, 'WINNER WINNER JANTAR MANTAR DHARNA!', {
      fontFamily: 'Outfit, Impact, sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#f2a900',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 102, '#1 / 100 • PROTEST MARCH DOMINATED', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#2ecc71',
      letterSpacing: 2,
    }).setOrigin(0.5);

    // PUBG Match Stats Card
    const cardW = 460;
    const cardH = 200;
    const cardX = GAME_WIDTH / 2 - cardW / 2;
    const cardY = 320;

    const statsCard = this.add.graphics();
    statsCard.fillStyle(0x0f1722, 0.92);
    statsCard.fillRoundedRect(cardX, cardY, cardW, cardH, 8);
    statsCard.lineStyle(1.5, 0x2e3d4f, 1);
    statsCard.strokeRoundedRect(cardX, cardY, cardW, cardH, 8);

    // Rating Badge (PUBG SSS Rank)
    const badge = this.add.graphics();
    badge.fillStyle(0xf2a900, 1);
    badge.fillRoundedRect(cardX + 20, cardY + 20, 70, 70, 6);
    this.add.text(cardX + 55, cardY + 55, 'SSS', {
      fontFamily: 'Impact, Outfit, sans-serif',
      fontSize: '32px',
      color: '#000000',
    }).setOrigin(0.5);

    // Level & Match Info
    this.add.text(cardX + 110, cardY + 25, currentLevel.name.toUpperCase(), {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
    });

    this.add.text(cardX + 110, cardY + 48, `DIFFICULTY: ${currentLevel.difficultyLabel}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#f2a900',
    });

    // Detailed Stats Grid
    const statLabels = [
      `KAFILA STRENGTH: ${data.finalCrowd} CITIZENS`,
      `BARRICADES BREACHED: ${data.barricadesBroken}`,
      `SECTION 144 EVADED: 100%`,
      `STAGE AT JANTAR MANTAR: ESTABLISHED`,
    ];

    this.add.text(cardX + 30, cardY + 110, statLabels.join('\n'), {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      lineSpacing: 6,
      color: '#ecf0f1',
    });

    // Action Buttons
    const btnY = 560;
    if (hasNextLevel) {
      this.createPubgButton(
        GAME_WIDTH / 2 - 130,
        btnY,
        'CONTINUE TO NEXT ROUTE →',
        0x27ae60,
        () => {
          sound.playClick();
          this.scene.start('GameScene', { levelIndex: data.levelIndex + 1 });
        }
      );

      this.createPubgButton(
        GAME_WIDTH / 2 + 130,
        btnY,
        'ROUTE SELECTION',
        0x1b2838,
        () => {
          sound.playClick();
          this.scene.start('LevelSelectScene');
        }
      );
    } else {
      this.createPubgButton(
        GAME_WIDTH / 2 - 130,
        btnY,
        'PLAY AGAIN',
        0xff7700,
        () => {
          sound.playClick();
          this.scene.start('GameScene', { levelIndex: 0 });
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
  }

  private createConfetti(): void {
    const keys = ['confetti_saffron', 'confetti_white', 'confetti_green'];
    for (let i = 0; i < 35; i++) {
      const x = Phaser.Math.Between(40, GAME_WIDTH - 40);
      const y = Phaser.Math.Between(-50, GAME_HEIGHT);
      const conf = this.add.image(x, y, Phaser.Utils.Array.GetRandom(keys));
      conf.setScale(Phaser.Math.FloatBetween(0.8, 1.8));

      this.tweens.add({
        targets: conf,
        y: GAME_HEIGHT + 20,
        x: conf.x + Phaser.Math.Between(-60, 60),
        angle: 360,
        duration: Phaser.Math.Between(3000, 5000),
        repeat: -1,
        ease: 'Linear',
      });
    }
  }

  private createPubgButton(x: number, y: number, text: string, bgColor: number, onClick: () => void): void {
    const w = 230;
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
