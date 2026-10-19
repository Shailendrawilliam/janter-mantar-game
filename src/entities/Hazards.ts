import Phaser from 'phaser';
import { IsometricUtils } from '../core/IsometricUtils';

export class TearGasHazard extends Phaser.GameObjects.Sprite {
  public radius = 75;
  public duration = 6.0;

  constructor(scene: Phaser.Scene, startX: number, startY: number) {
    super(scene, startX, startY, 'fx_tear_gas');

    this.scene.add.existing(this);
    this.setOrigin(0.5, 0.5);
    this.setScale(0.5);
    this.setAlpha(0.85);
    this.setDepth(IsometricUtils.getDepth(this.x, this.y, 3));

    this.scene.tweens.add({
      targets: this,
      scaleX: 2.6,
      scaleY: 2.2,
      alpha: 0,
      duration: this.duration * 1000,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.destroy();
      },
    });
  }
}

export class WaterJetHazard extends Phaser.GameObjects.Sprite {
  public velocityX: number;
  public velocityY: number;
  public life = 1.2;

  constructor(scene: Phaser.Scene, startX: number, startY: number, angle: number) {
    super(scene, startX, startY, 'fx_water');

    const speed = 250;
    this.velocityX = Math.cos(angle) * speed;
    this.velocityY = Math.sin(angle) * speed;

    this.scene.add.existing(this);
    this.setOrigin(0.5, 0.5);
    this.setDepth(IsometricUtils.getDepth(this.x, this.y, 4));
  }

  public update(delta: number): boolean {
    const dt = delta / 1000;
    this.life -= dt;
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;
    this.setDepth(IsometricUtils.getDepth(this.x, this.y, 4));

    if (this.life <= 0) {
      this.destroy();
      return false;
    }
    return true;
  }
}
