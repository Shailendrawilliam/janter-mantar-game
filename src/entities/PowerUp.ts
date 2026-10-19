import Phaser from 'phaser';
import { IsometricUtils } from '../core/IsometricUtils';

export type PowerUpType = 'LANGAR' | 'MEGAPHONE' | 'ARMOR';

export class PowerUp extends Phaser.GameObjects.Sprite {
  public powerUpType: PowerUpType;
  public isCollected = false;

  constructor(scene: Phaser.Scene, startX: number, startY: number, type: PowerUpType) {
    let tex = 'loot_langar';
    if (type === 'MEGAPHONE') tex = 'loot_megaphone';
    else if (type === 'ARMOR') tex = 'loot_armor';

    super(scene, startX, startY, tex);

    this.powerUpType = type;

    this.scene.add.existing(this);
    this.setOrigin(0.5, 0.85);
    this.setDepth(IsometricUtils.getDepth(this.x, this.y, 1));

    this.scene.tweens.add({
      targets: this,
      y: startY - 8,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public collect(): void {
    if (this.isCollected) return;
    this.isCollected = true;

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      y: this.y - 25,
      duration: 250,
      onComplete: () => {
        this.destroy();
      },
    });
  }
}
