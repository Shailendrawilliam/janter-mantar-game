import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { LEVELS } from '../config/levelData';
import { SoundSystem } from '../core/SoundSystem';
import { SaveManager } from '../core/SaveManager';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  create(data: { levelIndex: number; finalCrowd: number; barricadesBroken: number }): void {
    const sound = SoundSystem.getInstance();
    const saveManager = SaveManager.getInstance();
    sound.playVictory();
    sound.playCrowdRoar();

    const currentLevel = LEVELS[data.levelIndex] || LEVELS[0];
    const hasNextLevel = data.levelIndex + 1 < LEVELS.length;

    // Calculate score and update save data
    const marchDist = currentLevel.roadLength || 3200;
    const score = Math.round(data.finalCrowd * 250 + (data.barricadesBroken || 0) * 150 + 1500);
    const isNewHigh = saveManager.updateEndlessScore(marchDist, data.finalCrowd, score);

    // 1. Background (Rich Victory AI Art if available, or dark tactical gradient)
    if (this.textures.exists('victory_bg')) {
      const bgImg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'victory_bg');
      bgImg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

      const overlay = this.add.graphics();
      overlay.fillGradientStyle(0x060c14, 0x060c14, 0x091422, 0x091422, 0.65, 0.65, 0.88, 0.88);
      overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    } else {
      const bg = this.add.graphics();
      bg.fillGradientStyle(0x0a1018, 0x0a1018, 0x05080c, 0x05080c, 1);
      bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    // Confetti
    this.createConfetti();

    // Central Monument Graphic
    const monument = this.add.image(GAME_WIDTH / 2, 205, 'jantar_mantar_monument');
    monument.setScale(1.1);

    // PUBG Style Golden Laurel Banner
    const bannerW = 620;
    const bannerH = 75;
    const banner = this.add.graphics();
    banner.fillStyle(0x0a1018, 0.92);
    banner.fillRoundedRect(GAME_WIDTH / 2 - bannerW / 2, 40, bannerW, bannerH, 8);
    banner.lineStyle(2, 0xf2a900, 1);
    banner.strokeRoundedRect(GAME_WIDTH / 2 - bannerW / 2, 40, bannerW, bannerH, 8);

    // Golden Wings / Accents
    banner.fillStyle(0xf2a900, 1);
    banner.fillRect(GAME_WIDTH / 2 - bannerW / 2 + 10, 43, 12, bannerH - 6);
    banner.fillRect(GAME_WIDTH / 2 + bannerW / 2 - 22, 43, 12, bannerH - 6);

    // PUBG Victory Title
    this.add.text(GAME_WIDTH / 2, 65, 'WINNER WINNER JANTAR MANTAR DHARNA!', {
      fontFamily: 'Outfit, Impact, sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#f2a900',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5);

    const leaderName = saveManager.getPlayerName();
    this.add.text(GAME_WIDTH / 2, 97, `#1 / 100 • LEADER: ${leaderName.toUpperCase()}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#2ecc71',
      letterSpacing: 2,
    }).setOrigin(0.5);

    // PUBG Match Stats Card
    const cardW = 500;
    const cardH = 210;
    const cardX = GAME_WIDTH / 2 - cardW / 2;
    const cardY = 300;

    const statsCard = this.add.graphics();
    statsCard.fillStyle(0x0d1520, 0.94);
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
    this.add.text(cardX + 110, cardY + 24, currentLevel.name.toUpperCase(), {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
    });

    this.add.text(cardX + 110, cardY + 46, `DIFFICULTY: ${currentLevel.difficultyLabel}  •  SCORE: ${score.toLocaleString('en-IN')} PTS`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#f2a900',
    });

    if (isNewHigh) {
      this.add.text(cardX + 110, cardY + 66, '⭐ NEW HIGH SCORE RECORD!', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#2ecc71',
      });
    }

    // Detailed Stats Grid
    const statLabels = [
      `RALLY COMMANDER: ${leaderName}`,
      `KAFILA CITIZENS GATHERED: ${data.finalCrowd} PROTESTERS`,
      `POLICE BARRICADES SMASHED: ${data.barricadesBroken}`,
      `SECTION 144 CRACKDOWN: EVADED 100%`,
      `PARLIAMENT DHARNA STAGE: SUCCESSFULLY PITCHED`,
    ];

    this.add.text(cardX + 25, cardY + 95, statLabels.join('\n'), {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      lineSpacing: 4,
      color: '#ecf0f1',
    });

    // Satirical Hindi Newspaper Headline
    const newsBanner = this.add.container(GAME_WIDTH / 2, cardY + cardH + 24);
    const newsBg = this.add.graphics();
    newsBg.fillStyle(0xf1c40f, 0.95);
    newsBg.fillRoundedRect(-290, -14, 580, 28, 4);
    const newsText = this.add.text(0, 0, `📰 दैनिक जंतर मंतर: "${leaderName} के नेतृत्व में संसद तक पहुंचा काफिला! माँगें मंजूर!"`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#111111',
    }).setOrigin(0.5);
    newsBanner.add([newsBg, newsText]);

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
