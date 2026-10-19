import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { LEVELS, type LevelConfig } from '../config/levelData';
import { SoundSystem } from '../core/SoundSystem';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  create(): void {
    const sound = SoundSystem.getInstance();

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a252f, 0x1a252f, 0x0b1015, 0x0b1015, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Header
    this.add.text(GAME_WIDTH / 2, 50, 'SELECT MARCH ROUTE', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '34px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#111111',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 85, 'Choose your campaign route or challenge the Endless Delhi Rally', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#bdc3c7',
    }).setOrigin(0.5);

    // 4 Cards layout
    const cardWidth = 220;
    const cardHeight = 460;
    const spacing = 20;
    const startX = (GAME_WIDTH - (4 * cardWidth + 3 * spacing)) / 2 + cardWidth / 2;
    const cardY = 350;

    LEVELS.forEach((level, index) => {
      const x = startX + index * (cardWidth + spacing);
      this.createLevelCard(x, cardY, cardWidth, cardHeight, level, index, sound);
    });

    const backBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 45, '← BACK TO MAIN MENU', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#e74c3c',
      backgroundColor: '#1c2833',
      padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerdown', () => {
      sound.playClick();
      this.scene.start('MenuScene');
    });
  }

  private createLevelCard(
    x: number,
    y: number,
    w: number,
    h: number,
    level: LevelConfig,
    index: number,
    sound: SoundSystem
  ): void {
    const card = this.add.container(x, y);

    let badgeColor = 0x27ae60;
    let badgeText = 'LOW HARDNESS';
    if (level.difficulty === 'MID') {
      badgeColor = 0xf39c12;
      badgeText = 'MID HARDNESS';
    } else if (level.difficulty === 'HARD') {
      badgeColor = 0xc0392b;
      badgeText = 'TOUGH / HARD';
    } else if (level.difficulty === 'ENDLESS') {
      badgeColor = 0x8e44ad;
      badgeText = '♾️ ENDLESS RALLY';
    }

    const bg = this.add.graphics();
    bg.fillStyle(0x131a22, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    bg.lineStyle(2, badgeColor, 0.85);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);

    const badge = this.add.graphics();
    badge.fillStyle(badgeColor, 1);
    badge.fillRoundedRect(-w / 2 + 15, -h / 2 + 15, w - 30, 24, 12);
    const badgeLabel = this.add.text(0, -h / 2 + 27, badgeText, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    const title = this.add.text(0, -h / 2 + 65, level.name, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#f1c40f',
      align: 'center',
      wordWrap: { width: w - 20 },
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, -h / 2 + 105, level.subtitle, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#bdc3c7',
      align: 'center',
      wordWrap: { width: w - 20 },
    }).setOrigin(0.5);

    const specsY = -h / 2 + 150;
    const targetLabel = level.isEndless ? 'Infinite Run' : `${level.minCrowdForVictory}+ Citizens`;
    const specs = [
      `🎯 Target: ${targetLabel}`,
      `🚧 Barricades: ${level.barricadeCount}`,
      `👮 Police Forces: ${level.policeCount}`,
      `💨 Tear Gas: ${level.hasTearGas ? 'YES' : 'NONE'}`,
      `🌊 Water Cannon: ${level.hasWaterCannon ? 'ACTIVE' : 'NONE'}`,
      `🚜 Rally Tractor: YES`,
      `🌫️ Delhi AQI: 485`,
    ];

    const specsText = this.add.text(-w / 2 + 15, specsY, specs.join('\n\n'), {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      lineSpacing: 2,
      color: '#ecf0f1',
    });

    const btnY = h / 2 - 35;
    const btnBg = this.add.graphics();
    btnBg.fillStyle(badgeColor, 1);
    btnBg.fillRoundedRect(-w / 2 + 15, btnY - 18, w - 30, 36, 6);

    const btnLabel = this.add.text(0, btnY, 'START MARCH →', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    card.add([bg, badge, badgeLabel, title, subtitle, specsText, btnBg, btnLabel]);
    card.setSize(w, h);
    card.setInteractive({ useHandCursor: true });

    card.on('pointerover', () => {
      this.tweens.add({
        targets: card,
        scaleX: 1.04,
        scaleY: 1.04,
        y: y - 6,
        duration: 150,
      });
    });

    card.on('pointerout', () => {
      this.tweens.add({
        targets: card,
        scaleX: 1,
        scaleY: 1,
        y: y,
        duration: 150,
      });
    });

    card.on('pointerdown', () => {
      sound.playClick();
      this.scene.start('GameScene', { levelIndex: index });
    });
  }
}
