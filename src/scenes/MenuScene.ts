import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { SoundSystem } from '../core/SoundSystem';
import { SaveManager } from '../core/SaveManager';

export class MenuScene extends Phaser.Scene {
  private leaderNameText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const sound = SoundSystem.getInstance();
    const saveManager = SaveManager.getInstance();

    // 1. Background (Rich AI Art if available, or stylized dark gradient)
    if (this.textures.exists('menu_bg')) {
      const bgImg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'menu_bg');
      bgImg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

      // Vignette & scrim overlay for AAA game legibility
      const overlay = this.add.graphics();
      overlay.fillGradientStyle(0x050910, 0x050910, 0x0a111d, 0x0a111d, 0.72, 0.72, 0.90, 0.90);
      overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    } else {
      const bg = this.add.graphics();
      bg.fillGradientStyle(0x1a252f, 0x1a252f, 0x0e141a, 0x0e141a, 1);
      bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      this.createDecorativeSkyline();
    }

    // 2. High Score & Protester Identity Top Header
    this.createHeaderBar(sound, saveManager);

    // 3. Central Title Card with Indian Saffron / Gold theme
    const titleText = this.add.text(GAME_WIDTH / 2, 128, 'CHALO JANTAR MANTAR', {
      fontFamily: 'Outfit, Impact, sans-serif',
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 7,
      shadow: { offsetX: 0, offsetY: 4, color: '#000000', blur: 10, fill: true },
    }).setOrigin(0.5);

    const subTitle = this.add.text(GAME_WIDTH / 2, 176, 'चलो जंतर मंतर • THE DELHI PROTEST SIMULATOR', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#e67e22',
      stroke: '#000000',
      strokeThickness: 3,
      letterSpacing: 2,
    }).setOrigin(0.5);

    // Subtle breathing float animation
    this.tweens.add({
      targets: [titleText, subTitle],
      y: '-=4',
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 4. Maximum Score Showcase Card
    this.createHighScoreCard(saveManager);

    // 5. Interactive Tactical Marching Preview in Center
    this.createIsometricPreview();

    // 6. Action Menu Buttons (PUBG / Tactical Style)
    this.createButtons(sound);

    // 7. Sound toggle in top right
    this.createSoundToggle(sound);

    // 8. Footer Controls Info
    this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 22,
      'PC: WASD / Arrows = Move • Space = CHANT Slogan / Boost • Shift = Sprint | Mobile: On-Screen Touch Controls',
      {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '12px',
        color: '#8395a7',
      }
    ).setOrigin(0.5);
  }

  private createHeaderBar(sound: SoundSystem, saveManager: SaveManager): void {
    const barW = 380;
    const barH = 46;
    const barX = 20;
    const barY = 16;

    // Leader ID Badge Container
    const leaderContainer = this.add.container(barX, barY);

    const bg = this.add.graphics();
    bg.fillStyle(0x0f1824, 0.88);
    bg.fillRoundedRect(0, 0, barW, barH, 8);
    bg.lineStyle(1.5, 0x34495e, 1);
    bg.strokeRoundedRect(0, 0, barW, barH, 8);
    leaderContainer.add(bg);

    const tag = this.add.text(14, 7, '🎖️ RALLY LEADER IDENTITY:', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#f39c12',
      letterSpacing: 1,
    });
    leaderContainer.add(tag);

    this.leaderNameText = this.add.text(14, 21, saveManager.getPlayerName(), {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff',
    });
    leaderContainer.add(this.leaderNameText);

    // Randomize Name Button
    const rollBtn = this.add.container(barW - 90, 8);
    const rollBg = this.add.graphics();
    rollBg.fillStyle(0x27ae60, 1);
    rollBg.fillRoundedRect(0, 0, 80, 30, 6);
    rollBg.lineStyle(1, 0xffffff, 0.4);
    rollBg.strokeRoundedRect(0, 0, 80, 30, 6);

    const rollLabel = this.add.text(40, 15, '🎲 RE-ROLL', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    rollBtn.add([rollBg, rollLabel]);
    rollBtn.setSize(80, 30);
    rollBtn.setInteractive({ useHandCursor: true });

    rollBtn.on('pointerdown', () => {
      sound.playClick();
      const newName = saveManager.rollRandomName();
      this.leaderNameText.setText(newName);

      this.tweens.add({
        targets: this.leaderNameText,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 100,
        yoyo: true,
      });
    });

    rollBtn.on('pointerover', () => rollBtn.setScale(1.05));
    rollBtn.on('pointerout', () => rollBtn.setScale(1.0));

    leaderContainer.add(rollBtn);
  }

  private createHighScoreCard(saveManager: SaveManager): void {
    const scores = saveManager.getHighScores();
    const cardW = 540;
    const cardH = 50;
    const cardX = GAME_WIDTH / 2 - cardW / 2;
    const cardY = 215;

    const card = this.add.graphics();
    card.fillStyle(0x0c141f, 0.88);
    card.fillRoundedRect(cardX, cardY, cardW, cardH, 8);
    card.lineStyle(1.5, 0xf1c40f, 0.7);
    card.strokeRoundedRect(cardX, cardY, cardW, cardH, 8);

    const trophy = this.add.text(cardX + 25, cardY + cardH / 2, '🏆', {
      fontSize: '24px',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: trophy,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const maxScoreFormatted = (scores.maxScore || 0).toLocaleString('en-IN');
    this.add.text(cardX + 50, cardY + 10, `MAX RALLY SCORE: ${maxScoreFormatted} PTS`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#f1c40f',
      letterSpacing: 1,
    });

    const subStats = `👥 PEAK KAFILA: ${scores.endlessCrowd} CITIZENS  •  📍 LONGEST MARCH: ${scores.endlessDistance}m`;
    this.add.text(cardX + 50, cardY + 28, subStats, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#bdc3c7',
    });

    const badge = this.add.graphics();
    badge.fillStyle(0xf39c12, 1);
    badge.fillRoundedRect(cardX + cardW - 85, cardY + 10, 72, 30, 4);
    this.add.text(cardX + cardW - 49, cardY + 25, 'RECORD', {
      fontFamily: 'Impact, Outfit, sans-serif',
      fontSize: '12px',
      color: '#111111',
    }).setOrigin(0.5);
  }

  private createIsometricPreview(): void {
    const container = this.add.container(GAME_WIDTH / 2, 375);

    for (let i = -3; i <= 3; i++) {
      const tile = this.add.image(i * 32, i * 16, 'tile_road');
      container.add(tile);
    }

    const barricade = this.add.image(40, -10, 'barricade_yellow');
    container.add(barricade);

    const cop = this.add.image(80, -20, 'police_constable');
    cop.setFlipX(true);
    container.add(cop);

    const leader = this.add.image(-40, 10, 'protester_leader');
    const crowd1 = this.add.image(-75, -5, 'crowd_member_0');
    const crowd2 = this.add.image(-85, 25, 'crowd_member_2');
    container.add([leader, crowd1, crowd2]);

    this.tweens.add({
      targets: [leader, crowd1, crowd2],
      y: '-=6',
      duration: 420,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createButtons(sound: SoundSystem): void {
    const startY = 490;

    this.createMenuButton(
      GAME_WIDTH / 2,
      startY,
      '⚔️ SELECT ROUTE (3 DIFFICULTIES)',
      0x27ae60,
      () => {
        sound.playClick();
        this.scene.start('LevelSelectScene');
      }
    );

    this.createMenuButton(
      GAME_WIDTH / 2,
      startY + 64,
      '⚡ QUICK START: ITO CHOWK (LOW)',
      0xe67e22,
      () => {
        sound.playClick();
        this.scene.start('GameScene', { levelIndex: 0 });
      }
    );

    this.createMenuButton(
      GAME_WIDTH / 2,
      startY + 128,
      '📜 HOW TO PLAY & DELHI RULES',
      0x2980b9,
      () => {
        sound.playClick();
        this.showHelpModal();
      }
    );
  }

  private createMenuButton(
    x: number,
    y: number,
    text: string,
    bgColor: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const w = 360;
    const h = 50;

    const bg = this.add.graphics();
    bg.fillStyle(bgColor, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    bg.lineStyle(1.5, 0xffffff, 0.45);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    container.add([bg, label]);
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.04,
        scaleY: 1.04,
        duration: 120,
      });
    });

    container.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 120,
      });
    });

    container.on('pointerdown', onClick);

    return container;
  }

  private createSoundToggle(sound: SoundSystem): void {
    const isMuted = sound.getMuted();
    const btnText = this.add.text(
      GAME_WIDTH - 25,
      25,
      isMuted ? '🔇 SOUND: OFF' : '🔊 SOUND: ON',
      {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#f1c40f',
        backgroundColor: '#1b2631',
        padding: { x: 12, y: 8 },
      }
    ).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    btnText.on('pointerdown', () => {
      const muted = sound.toggleMute();
      btnText.setText(muted ? '🔇 SOUND: OFF' : '🔊 SOUND: ON');
      if (!muted) sound.playClick();
    });
  }

  private createDecorativeSkyline(): void {
    const skyline = this.add.graphics();
    skyline.fillStyle(0x141d26, 0.7);
    for (let x = 0; x < GAME_WIDTH; x += 40) {
      const h = Phaser.Math.Between(80, 220);
      skyline.fillRect(x, GAME_HEIGHT - h, 36, h);
    }
  }

  private showHelpModal(): void {
    const modal = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    modal.setDepth(100);

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x000000, 0.88);
    backdrop.fillRect(-GAME_WIDTH / 2, -GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT);

    const panel = this.add.graphics();
    panel.fillStyle(0x141e2a, 1);
    panel.fillRoundedRect(-310, -230, 620, 460, 12);
    panel.lineStyle(2.5, 0xf1c40f, 1);
    panel.strokeRoundedRect(-310, -230, 620, 460, 12);

    const title = this.add.text(0, -190, 'DELHI PROTEST MANUAL (RULES)', {
      fontFamily: 'Outfit, Impact, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#f39c12',
    }).setOrigin(0.5);

    const rules = [
      '1. GATHER YOUR KAFILA (CROWD):',
      '   • Walk near bystanders on footpaths to recruit them.',
      '   • Press CHANT [Spacebar] to raise morale & recruit faster!',
      '',
      '2. YELLOW DELHI POLICE BARRICADES:',
      '   • Single & multi-tier barricades block your path to Jantar Mantar.',
      '   • Charge them with a large kafila to smash them open!',
      '',
      '3. DODGE POLICE & AVOID DETENTION:',
      '   • Delhi Police constables & riot squads will attempt to detain leader.',
      '   • Your kafila shields you and pushes cops backwards!',
      '   • If detained meter hits 100% => Diverted to Talkatora Stadium!',
      '',
      '4. HAZARDS: Tear Gas, Water Cannon (Vajra), and Internet Jammers.',
    ];

    const instructions = this.add.text(-270, -150, rules.join('\n'), {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      lineSpacing: 5,
      color: '#ecf0f1',
    });

    const closeBtn = this.add.text(0, 190, '[ CLOSE MANUAL ]', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#e74c3c',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      SoundSystem.getInstance().playClick();
      modal.destroy();
    });

    modal.add([backdrop, panel, title, instructions, closeBtn]);
  }
}
