import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { SoundSystem } from '../core/SoundSystem';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const sound = SoundSystem.getInstance();

    // Background gradient canvas
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a252f, 0x1a252f, 0x0e141a, 0x0e141a, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Decorative Delhi Skyline silhouette
    this.createDecorativeSkyline();

    // Decorative animated isometric scene preview in center
    this.createIsometricPreview();

    // Title Card
    const titleText = this.add.text(GAME_WIDTH / 2, 90, 'CHALO JANTAR MANTAR', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#111111',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 138, 'चलो जंतर मंतर • THE DELHI PROTEST SIMULATOR', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#e67e22',
      letterSpacing: 2,
    }).setOrigin(0.5);

    // Subtle floating animation on title
    this.tweens.add({
      targets: titleText,
      y: 85,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Main Buttons Container
    this.createButtons(sound);

    // Sound toggle in top right
    this.createSoundToggle(sound);

    // Controls description footer
    this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 35,
      'PC: WASD / Arrows to Move • Spacebar to Chant / Boost • Shift to Sprint | Mobile: On-Screen Touch Controls',
      {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '13px',
        color: '#95a5a6',
      }
    ).setOrigin(0.5);
  }

  private createDecorativeSkyline(): void {
    const skyline = this.add.graphics();
    skyline.fillStyle(0x141d26, 0.7);

    // Silhouette blocks representing Delhi buildings & Connaught Place pillars
    for (let x = 0; x < GAME_WIDTH; x += 40) {
      const h = Phaser.Math.Between(80, 220);
      skyline.fillRect(x, GAME_HEIGHT - h, 36, h);
    }
  }

  private createIsometricPreview(): void {
    const container = this.add.container(GAME_WIDTH / 2, 310);

    // Isometric road strip
    for (let i = -3; i <= 3; i++) {
      const tile = this.add.image(i * 32, i * 16, 'tile_road');
      container.add(tile);
    }

    // Yellow Barricade
    const barricade = this.add.image(40, -10, 'barricade_yellow');
    container.add(barricade);

    // Delhi Police Constable
    const cop = this.add.image(80, -20, 'police_constable');
    cop.setFlipX(true);
    container.add(cop);

    // Protester Leader
    const leader = this.add.image(-40, 10, 'protester_leader');
    container.add(leader);

    // Crowd members
    const crowd1 = this.add.image(-70, 0, 'crowd_member_0');
    const crowd2 = this.add.image(-80, 25, 'crowd_member_2');
    container.add(crowd1);
    container.add(crowd2);

    // Slight marching animation
    this.tweens.add({
      targets: [leader, crowd1, crowd2],
      y: '-=6',
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createButtons(sound: SoundSystem): void {
    const startY = 480;

    // 1. SELECT LEVEL / CAMPAIGN
    this.createMenuButton(
      GAME_WIDTH / 2,
      startY,
      'SELECT LEVEL (3 DIFFICULTIES)',
      '#27ae60',
      () => {
        sound.playClick();
        this.scene.start('LevelSelectScene');
      }
    );

    // 2. QUICK PLAY LEVEL 1 (LOW HARDNESS)
    this.createMenuButton(
      GAME_WIDTH / 2,
      startY + 68,
      'QUICK START: ITO CHOWK (LOW)',
      '#e67e22',
      () => {
        sound.playClick();
        this.scene.start('GameScene', { levelIndex: 0 });
      }
    );

    // 3. HOW TO PLAY INFO BUTTON
    this.createMenuButton(
      GAME_WIDTH / 2,
      startY + 136,
      'HOW TO PLAY & DELHI RULES',
      '#2980b9',
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
    colorHex: string,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const w = 340;
    const h = 52;

    const bg = this.add.graphics();
    bg.fillStyle(Phaser.Display.Color.HexStringToColor(colorHex).color, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    bg.lineStyle(2, 0xffffff, 0.4);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    container.add([bg, label]);
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
      });
    });

    container.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
      });
    });

    container.on('pointerdown', onClick);

    return container;
  }

  private createSoundToggle(sound: SoundSystem): void {
    const isMuted = sound.getMuted();
    const btnText = this.add.text(
      GAME_WIDTH - 30,
      30,
      isMuted ? '🔇 SOUND: OFF' : '🔊 SOUND: ON',
      {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#f1c40f',
        backgroundColor: '#2c3e50',
        padding: { x: 10, y: 6 },
      }
    ).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

    btnText.on('pointerdown', () => {
      const muted = sound.toggleMute();
      btnText.setText(muted ? '🔇 SOUND: OFF' : '🔊 SOUND: ON');
      if (!muted) sound.playClick();
    });
  }

  private showHelpModal(): void {
    const modal = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    modal.setDepth(100);

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x000000, 0.85);
    backdrop.fillRect(-GAME_WIDTH / 2, -GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT);

    const panel = this.add.graphics();
    panel.fillStyle(0x1c2833, 1);
    panel.fillRoundedRect(-300, -220, 600, 440, 14);
    panel.lineStyle(3, 0xf1c40f, 1);
    panel.strokeRoundedRect(-300, -220, 600, 440, 14);

    const title = this.add.text(0, -180, 'DELHI PROTEST MANUAL (RULES)', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#f1c40f',
    }).setOrigin(0.5);

    const content = `
1. GATHER YOUR KAFILA (CROWD):
   • Walk near bystanders on footpaths to recruit them.
   • Press CHANT (Spacebar / Chant button) to raise morale and recruit faster!

2. YELLOW DELHI POLICE BARRICADES:
   • Single & multi-tier barricades block your path to Jantar Mantar.
   • Charge into them with a large crowd to smash them open!

3. DODGE POLICE & AVOID DETENTION:
   • Delhi Police constables & riot police will try to detain your leader.
   • A large crowd will shield you and intimidate police backwards.
   • If detained meter hits 100%, you get sent to Talkatora Stadium (Game Over)!

4. HAZARDS:
   • Tear Gas clouds disperse crowd members temporarily.
   • Water Cannon ("Vajra") knocks protesters back.
   • Internet Jammers disrupt your GPS radar.
    `;

    const instructions = this.add.text(-260, -140, content, {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '15px',
      lineSpacing: 6,
      color: '#ecf0f1',
    });

    const closeBtn = this.add.text(0, 180, '[ CLOSE MANUAL ]', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '18px',
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
