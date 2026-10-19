import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import type { InputHandler } from '../core/InputHandler';
import { SoundSystem } from '../core/SoundSystem';
import { SpeechVoiceSystem } from '../core/SpeechVoiceSystem';

export interface MinimapEntity {
  x: number;
  y: number;
  type: 'player' | 'crowd' | 'bystander' | 'police' | 'barricade' | 'target' | 'loot' | 'tractor';
}

export class UIScene extends Phaser.Scene {
  private inputHandler!: InputHandler;

  // PUBG Top Compass Ribbon
  private compassContainer!: Phaser.GameObjects.Container;
  private compassRibbon!: Phaser.GameObjects.Graphics;
  private compassMarkerText!: Phaser.GameObjects.Text;

  // Delhi AQI Meter (Air Quality Index)
  private aqiContainer!: Phaser.GameObjects.Container;
  private aqiText!: Phaser.GameObjects.Text;

  // PUBG Mini-Map Radar (Top Right)
  private minimapContainer!: Phaser.GameObjects.Container;
  private minimapBg!: Phaser.GameObjects.Graphics;
  private minimapBlips!: Phaser.GameObjects.Graphics;
  private minimapScanLine!: Phaser.GameObjects.Graphics;
  private minimapZoneText!: Phaser.GameObjects.Text;
  private scanAngle = 0;

  // PUBG Killfeed / Event Ticker (Top Left)
  private feedContainer!: Phaser.GameObjects.Container;
  private feedItems: Array<{ container: Phaser.GameObjects.Container; timer: number }> = [];

  // PUBG Squad Status Panel (Bottom Left)
  private squadContainer!: Phaser.GameObjects.Container;
  private squadCrowdText!: Phaser.GameObjects.Text;
  private squadStatusBadge!: Phaser.GameObjects.Text;
  private activeBuffText!: Phaser.GameObjects.Text;

  // PUBG Health & Boost Bar (Center Bottom)
  private hpContainer!: Phaser.GameObjects.Container;
  private hpBarGfx!: Phaser.GameObjects.Graphics;
  private boostBarGfx!: Phaser.GameObjects.Graphics;
  private rushBarGfx!: Phaser.GameObjects.Graphics;
  private hpLabelText!: Phaser.GameObjects.Text;

  // Tactical Mass Rush Button
  private rushBtn!: Phaser.GameObjects.Container;

  // Touch Virtual Controls (PUBG layout)
  private joystickBase!: Phaser.GameObjects.Graphics;
  private joystickThumb!: Phaser.GameObjects.Graphics;
  private joystickActive = false;
  private joystickPointerId: number | null = null;
  private joystickOrigin = { x: 120, y: GAME_HEIGHT - 120 };

  // Delhi Smog layer
  private smogLayer!: Phaser.GameObjects.Graphics;
  private jammerOverlay!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'UIScene' });
  }

  init(data: { inputHandler: InputHandler }): void {
    this.inputHandler = data.inputHandler;
  }

  create(): void {
    const sound = SoundSystem.getInstance();
    const speech = SpeechVoiceSystem.getInstance();

    this.buildPubgCompass();
    this.buildAqiMeter();
    this.buildPubgMinimap();
    this.buildPubgEventFeed();
    this.buildPubgSquadPanel();
    this.buildPubgHealthBar();
    this.setupPubgTouchControls();
    this.setupToggles(sound, speech);

    // Delhi Atmospheric Smog Layer
    this.smogLayer = this.add.graphics();
    this.smogLayer.fillStyle(0xbdc3c7, 0.08);
    this.smogLayer.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.smogLayer.setDepth(-2);

    this.jammerOverlay = this.add.graphics();
    this.jammerOverlay.setDepth(-1);

    this.addEventFeedItem('📢 March started towards Jantar Mantar!', '#f2a900');
    this.addEventFeedItem('🌫️ Delhi AQI: 485 (HAZARDOUS SMOG)', '#e74c3c');
    this.addEventFeedItem('🎙️ Real Hindi Voice Lines Active!', '#2ecc71');
  }

  private buildPubgCompass(): void {
    const w = 340;
    const h = 30;
    const x = GAME_WIDTH / 2;
    const y = 22;

    this.compassContainer = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x0a1018, 0.88);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
    bg.lineStyle(1.5, 0x2e3d4f, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 4);

    const pointer = this.add.graphics();
    pointer.fillStyle(0xf2a900, 1);
    pointer.fillTriangle(0, h / 2 - 2, -5, h / 2 + 5, 5, h / 2 + 5);

    this.compassRibbon = this.add.graphics();
    this.compassMarkerText = this.add.text(0, -2, 'EAST • 90°', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.compassContainer.add([bg, this.compassRibbon, pointer, this.compassMarkerText]);
  }

  private buildAqiMeter(): void {
    const x = GAME_WIDTH / 2;
    const y = 46;
    this.aqiContainer = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x2c1010, 0.9);
    bg.fillRoundedRect(-85, 0, 170, 18, 3);
    bg.lineStyle(1, 0xe74c3c, 0.8);
    bg.strokeRoundedRect(-85, 0, 170, 18, 3);

    this.aqiText = this.add.text(0, 9, '🌫️ AQI: 485 [HAZARDOUS]', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#ff7675',
    }).setOrigin(0.5);

    this.aqiContainer.add([bg, this.aqiText]);
  }

  private buildPubgMinimap(): void {
    const size = 130;
    const x = GAME_WIDTH - 85;
    const y = 85;

    this.minimapContainer = this.add.container(x, y);

    this.minimapBg = this.add.graphics();
    this.minimapBg.fillStyle(0x080e14, 0.92);
    this.minimapBg.fillCircle(0, 0, size / 2);
    this.minimapBg.lineStyle(2, 0x3a4b5d, 1);
    this.minimapBg.strokeCircle(0, 0, size / 2);

    this.minimapBg.lineStyle(1, 0x1b2838, 0.7);
    this.minimapBg.strokeCircle(0, 0, size / 4);
    this.minimapBg.lineBetween(-size / 2, 0, size / 2, 0);
    this.minimapBg.lineBetween(0, -size / 2, 0, size / 2);

    this.minimapBlips = this.add.graphics();
    this.minimapScanLine = this.add.graphics();

    const title = this.add.text(0, -size / 2 - 12, 'DELHI RADAR', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f2a900',
    }).setOrigin(0.5);

    this.minimapZoneText = this.add.text(0, size / 2 + 10, 'ZONE SAFE', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#2ecc71',
    }).setOrigin(0.5);

    this.minimapContainer.add([
      this.minimapBg,
      this.minimapBlips,
      this.minimapScanLine,
      title,
      this.minimapZoneText,
    ]);
  }

  private buildPubgEventFeed(): void {
    this.feedContainer = this.add.container(20, 20);
  }

  public addEventFeedItem(text: string, color = '#ffffff'): void {
    const itemContainer = this.add.container(0, this.feedItems.length * 26);

    const bg = this.add.graphics();
    bg.fillStyle(0x0a1018, 0.85);
    bg.fillRoundedRect(0, 0, 275, 22, 4);
    bg.lineStyle(1, 0x2e3d4f, 0.8);
    bg.strokeRoundedRect(0, 0, 275, 22, 4);

    const label = this.add.text(8, 3, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color,
    });

    itemContainer.add([bg, label]);
    itemContainer.setAlpha(0);
    this.feedContainer.add(itemContainer);

    this.tweens.add({
      targets: itemContainer,
      alpha: 1,
      x: 0,
      duration: 200,
    });

    this.feedItems.push({ container: itemContainer, timer: 4.5 });

    if (this.feedItems.length > 4) {
      const oldest = this.feedItems.shift();
      if (oldest) oldest.container.destroy();
    }

    this.feedItems.forEach((item, idx) => {
      this.tweens.add({
        targets: item.container,
        y: idx * 26,
        duration: 150,
      });
    });
  }

  private buildPubgSquadPanel(): void {
    const x = 20;
    const y = GAME_HEIGHT - 235;
    this.squadContainer = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x0a1018, 0.88);
    bg.fillRoundedRect(0, 0, 220, 88, 6);
    bg.lineStyle(1.5, 0x2e3d4f, 1);
    bg.strokeRoundedRect(0, 0, 220, 88, 6);

    const playerLabel = this.add.text(12, 8, '1 👑 LEADER (YOU)', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f2a900',
    });

    this.squadCrowdText = this.add.text(12, 28, '2 👥 KAFILA: 1 CITIZENS', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#2ecc71',
    });

    this.squadStatusBadge = this.add.text(12, 48, 'TARGET: NEED 8+', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '10px',
      color: '#f39c12',
    });

    this.activeBuffText = this.add.text(12, 66, 'BUFF: NONE', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#95a5a6',
    });

    this.squadContainer.add([bg, playerLabel, this.squadCrowdText, this.squadStatusBadge, this.activeBuffText]);
  }

  private buildPubgHealthBar(): void {
    const w = 320;
    const x = GAME_WIDTH / 2 - w / 2;
    const y = GAME_HEIGHT - 48;

    this.hpContainer = this.add.container(x, y);

    this.hpLabelText = this.add.text(w / 2, -22, 'DETENTION SHIELD: 100% [SAFE]', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.rushBarGfx = this.add.graphics();
    this.boostBarGfx = this.add.graphics();
    this.hpBarGfx = this.add.graphics();

    this.hpContainer.add([this.hpLabelText, this.rushBarGfx, this.boostBarGfx, this.hpBarGfx]);
  }

  private setupPubgTouchControls(): void {
    this.joystickBase = this.add.graphics();
    this.joystickBase.lineStyle(2, 0xffffff, 0.4);
    this.joystickBase.fillStyle(0x0a1018, 0.5);
    this.joystickBase.strokeCircle(this.joystickOrigin.x, this.joystickOrigin.y, 45);
    this.joystickBase.fillCircle(this.joystickOrigin.x, this.joystickOrigin.y, 45);

    this.joystickThumb = this.add.graphics();
    this.joystickThumb.fillStyle(0xf2a900, 0.85);
    this.joystickThumb.fillCircle(this.joystickOrigin.x, this.joystickOrigin.y, 18);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < GAME_WIDTH * 0.45 && pointer.y > 140) {
        this.joystickActive = true;
        this.joystickPointerId = pointer.id;
        this.updateJoystick(pointer.x, pointer.y);
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.joystickActive && pointer.id === this.joystickPointerId) {
        this.updateJoystick(pointer.x, pointer.y);
      }
    });

    const resetJoystick = (pointer: Phaser.Input.Pointer) => {
      if (pointer.id === this.joystickPointerId) {
        this.joystickActive = false;
        this.joystickPointerId = null;
        this.inputHandler.touchVx = 0;
        this.inputHandler.touchVy = 0;
        this.joystickThumb.clear();
        this.joystickThumb.fillStyle(0xf2a900, 0.85);
        this.joystickThumb.fillCircle(this.joystickOrigin.x, this.joystickOrigin.y, 18);
      }
    };

    this.input.on('pointerup', resetJoystick);
    this.input.on('pointerout', resetJoystick);

    const rightMargin = GAME_WIDTH - 80;
    const bottomMargin = GAME_HEIGHT - 90;

    // Chant
    this.createTacticalButton(
      rightMargin - 85,
      bottomMargin,
      64,
      '📢',
      'CHANT',
      '[SPACE]',
      0x27ae60,
      () => {
        this.inputHandler.touchChant = true;
      }
    );

    // Sprint
    const sprintBtn = this.createTacticalButton(
      rightMargin,
      bottomMargin - 50,
      64,
      '⚡',
      'DASH',
      '[SHIFT]',
      0xff7700,
      () => {}
    );

    sprintBtn.on('pointerdown', () => {
      this.inputHandler.touchSprint = true;
    });
    sprintBtn.on('pointerup', () => {
      this.inputHandler.touchSprint = false;
    });
    sprintBtn.on('pointerout', () => {
      this.inputHandler.touchSprint = false;
    });

    // Mass Rush
    this.rushBtn = this.createTacticalButton(
      rightMargin - 45,
      bottomMargin - 120,
      56,
      '🔥',
      'RUSH',
      '[Q]',
      0xe74c3c,
      () => {
        this.inputHandler.touchMassRush = true;
      }
    );
  }

  private createTacticalButton(
    x: number,
    y: number,
    size: number,
    icon: string,
    label: string,
    keyHint: string,
    accentColor: number,
    onTap: () => void
  ): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x0a1018, 0.88);
    bg.fillCircle(0, 0, size / 2);
    bg.lineStyle(2, accentColor, 0.95);
    bg.strokeCircle(0, 0, size / 2);

    const iconText = this.add.text(0, -10, icon, { fontSize: '20px' }).setOrigin(0.5);
    const labelText = this.add.text(0, 8, label, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    const hintText = this.add.text(0, 20, keyHint, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '8px',
      color: '#bdc3c7',
    }).setOrigin(0.5);

    c.add([bg, iconText, labelText, hintText]);
    c.setSize(size, size);
    c.setInteractive({ useHandCursor: true });

    c.on('pointerdown', () => {
      this.tweens.add({
        targets: c,
        scaleX: 0.92,
        scaleY: 0.92,
        duration: 80,
        yoyo: true,
      });
      onTap();
    });

    return c;
  }

  private updateJoystick(px: number, py: number): void {
    const dx = px - this.joystickOrigin.x;
    const dy = py - this.joystickOrigin.y;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 40;

    let thumbX = px;
    let thumbY = py;

    if (dist > maxRadius) {
      thumbX = this.joystickOrigin.x + (dx / dist) * maxRadius;
      thumbY = this.joystickOrigin.y + (dy / dist) * maxRadius;
    }

    this.joystickThumb.clear();
    this.joystickThumb.fillStyle(0xf2a900, 0.95);
    this.joystickThumb.fillCircle(thumbX, thumbY, 18);

    this.inputHandler.touchVx = (thumbX - this.joystickOrigin.x) / maxRadius;
    this.inputHandler.touchVy = (thumbY - this.joystickOrigin.y) / maxRadius;
  }

  private setupToggles(sound: SoundSystem, speech: SpeechVoiceSystem): void {
    // Sound FX Toggle
    const soundBtn = this.add.text(
      GAME_WIDTH - 25,
      18,
      sound.getMuted() ? '🔇' : '🔊',
      {
        fontSize: '18px',
        backgroundColor: '#0a1018',
        padding: { x: 6, y: 4 },
      }
    ).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

    soundBtn.on('pointerdown', () => {
      const muted = sound.toggleMute();
      soundBtn.setText(muted ? '🔇' : '🔊');
    });

    // Voice Speech Toggle
    const voiceBtn = this.add.text(
      GAME_WIDTH - 65,
      18,
      '🎙️',
      {
        fontSize: '18px',
        backgroundColor: '#0a1018',
        padding: { x: 6, y: 4 },
      }
    ).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

    voiceBtn.on('pointerdown', () => {
      const v = speech.toggleVoice();
      voiceBtn.setAlpha(v ? 1.0 : 0.4);
    });
  }

  public updateHUD(
    crowdCount: number,
    targetCrowd: number,
    _progress: number,
    distanceRem: number,
    detentionRatio: number,
    sprintRatio: number,
    rushRatio: number,
    activeBuff: string,
    isJammed: boolean,
    headingDeg: number,
    minimapEntities: MinimapEntity[]
  ): void {
    this.compassMarkerText.setText(`${headingDeg}° • DIST: ${Math.max(0, Math.round(distanceRem))}m`);

    this.squadCrowdText.setText(`2 👥 KAFILA: ${crowdCount} CITIZENS`);
    if (crowdCount >= targetCrowd) {
      this.squadStatusBadge.setText('✓ READY FOR DHARNA');
      this.squadStatusBadge.setColor('#2ecc71');
    } else {
      this.squadStatusBadge.setText(`NEED ${targetCrowd - crowdCount} MORE`);
      this.squadStatusBadge.setColor('#f39c12');
    }

    this.activeBuffText.setText(`BUFF: ${activeBuff || 'NONE'}`);
    this.activeBuffText.setColor(activeBuff ? '#f1c40f' : '#95a5a6');

    // N95 Mask effect reduces smog
    if (activeBuff === 'N95') {
      this.smogLayer.setAlpha(0.01);
      this.aqiText.setText('😷 AQI: N95 PROTECTED');
      this.aqiText.setColor('#00d2d3');
    } else {
      this.smogLayer.setAlpha(0.08);
      this.aqiText.setText('🌫️ AQI: 485 [HAZARDOUS]');
      this.aqiText.setColor('#ff7675');
    }

    const barW = 320;
    const hpSafeRatio = 1 - Phaser.Math.Clamp(detentionRatio, 0, 1);

    this.rushBarGfx.clear();
    this.rushBarGfx.fillStyle(0x0a1018, 0.8);
    this.rushBarGfx.fillRoundedRect(0, -12, barW, 4, 1);
    this.rushBarGfx.fillStyle(0xf1c40f, 1);
    this.rushBarGfx.fillRoundedRect(0, -12, barW * Phaser.Math.Clamp(rushRatio, 0, 1), 4, 1);

    this.boostBarGfx.clear();
    this.boostBarGfx.fillStyle(0x0a1018, 0.8);
    this.boostBarGfx.fillRoundedRect(0, -6, barW, 4, 1);
    this.boostBarGfx.fillStyle(0xff9800, 1);
    this.boostBarGfx.fillRoundedRect(0, -6, barW * sprintRatio, 4, 1);

    this.hpBarGfx.clear();
    this.hpBarGfx.fillStyle(0x0a1018, 0.88);
    this.hpBarGfx.fillRoundedRect(0, 0, barW, 14, 3);
    this.hpBarGfx.lineStyle(1.5, 0x3a4b5d, 1);
    this.hpBarGfx.strokeRoundedRect(0, 0, barW, 14, 3);

    let hpColor = 0xffffff;
    if (hpSafeRatio < 0.35) hpColor = 0xff3b30;
    else if (hpSafeRatio < 0.65) hpColor = 0xf2a900;

    this.hpBarGfx.fillStyle(hpColor, 1);
    this.hpBarGfx.fillRoundedRect(2, 2, (barW - 4) * hpSafeRatio, 10, 2);

    const shieldPct = Math.round(hpSafeRatio * 100);
    if (shieldPct < 40) {
      this.hpLabelText.setText(`⚠️ DETENTION RISK CRITICAL: ${100 - shieldPct}%!`);
      this.hpLabelText.setColor('#ff3b30');
    } else {
      this.hpLabelText.setText(`DETENTION SHIELD: ${shieldPct}% [SAFE]`);
      this.hpLabelText.setColor('#ffffff');
    }

    if (this.rushBtn) {
      if (rushRatio >= 1.0) {
        this.rushBtn.setAlpha(1.0);
        this.rushBtn.setScale(1.05 + Math.sin(Date.now() * 0.008) * 0.05);
      } else {
        this.rushBtn.setAlpha(0.65);
        this.rushBtn.setScale(1.0);
      }
    }

    this.updateMinimapBlips(minimapEntities, isJammed);
    this.updateEventFeed();
  }

  private updateMinimapBlips(entities: MinimapEntity[], isJammed: boolean): void {
    this.minimapBlips.clear();
    this.minimapScanLine.clear();

    if (isJammed) {
      this.minimapZoneText.setText('📡 JAMMED');
      this.minimapZoneText.setColor('#ff3b30');
      this.jammerOverlay.clear();
      this.jammerOverlay.fillStyle(0xffffff, Math.random() * 0.08);
      this.jammerOverlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      return;
    }

    this.minimapZoneText.setText('ZONE 1 • ACTIVE');
    this.minimapZoneText.setColor('#2ecc71');
    this.jammerOverlay.clear();

    this.scanAngle = (this.scanAngle + 0.04) % (Math.PI * 2);
    const radius = 55;
    this.minimapScanLine.lineStyle(1.5, 0x00d2ff, 0.5);
    this.minimapScanLine.lineBetween(0, 0, Math.cos(this.scanAngle) * radius, Math.sin(this.scanAngle) * radius);

    const scale = 0.12;
    entities.forEach((e) => {
      const rx = e.x * scale;
      const ry = e.y * scale;
      const dist = Math.hypot(rx, ry);

      if (dist < radius - 3) {
        switch (e.type) {
          case 'player':
            this.minimapBlips.fillStyle(0x00d2ff, 1);
            this.minimapBlips.fillCircle(rx, ry, 3.5);
            break;
          case 'crowd':
            this.minimapBlips.fillStyle(0x2ecc71, 0.9);
            this.minimapBlips.fillCircle(rx, ry, 2);
            break;
          case 'bystander':
            this.minimapBlips.fillStyle(0xf2a900, 0.85);
            this.minimapBlips.fillCircle(rx, ry, 2);
            break;
          case 'police':
            this.minimapBlips.fillStyle(0xff3b30, 0.95);
            this.minimapBlips.fillCircle(rx, ry, 2.5);
            break;
          case 'barricade':
            this.minimapBlips.fillStyle(0xe67e22, 0.9);
            this.minimapBlips.fillRect(rx - 2, ry - 1, 4, 2);
            break;
          case 'loot':
            this.minimapBlips.fillStyle(0xf1c40f, 1);
            this.minimapBlips.fillRect(rx - 2, ry - 2, 4, 4);
            break;
          case 'tractor':
            this.minimapBlips.fillStyle(0x27ae60, 1);
            this.minimapBlips.fillTriangle(rx, ry - 4, rx - 3, ry + 3, rx + 3, ry + 3);
            break;
          case 'target':
            this.minimapBlips.fillStyle(0xf1c40f, 1);
            this.minimapBlips.fillCircle(rx, ry, 4);
            break;
        }
      }
    });
  }

  private updateEventFeed(): void {
    for (let i = this.feedItems.length - 1; i >= 0; i--) {
      const item = this.feedItems[i];
      item.timer -= 0.016;
      if (item.timer <= 0) {
        this.tweens.add({
          targets: item.container,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            item.container.destroy();
          },
        });
        this.feedItems.splice(i, 1);
      }
    }
  }
}
