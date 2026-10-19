import Phaser from 'phaser';
import { IsometricUtils } from '../core/IsometricUtils';

export class RallyTractor extends Phaser.GameObjects.Sprite {
  public speed = 155;
  public life = 14.0; // Active for 14 seconds
  public isFinished = false;

  constructor(scene: Phaser.Scene, startX: number, startY: number) {
    super(scene, startX, startY, 'vehicle_tractor');

    this.scene.add.existing(this);
    this.setOrigin(0.5, 0.85);
    this.setDepth(IsometricUtils.getDepth(this.x, this.y, 2));

    // Tractor rumble bounce
    this.scene.tweens.add({
      targets: this,
      y: startY - 2,
      duration: 120,
      yoyo: true,
      repeat: -1,
    });
  }

  public updateTractor(delta: number): boolean {
    const dt = delta / 1000;
    this.life -= dt;
    this.x += this.speed * dt;
    this.setDepth(IsometricUtils.getDepth(this.x, this.y, 2));

    // Exhaust smoke puff
    if (Math.random() < 0.25) {
      const smoke = this.scene.add.image(this.x - 25, this.y - 32, 'fx_dust');
      smoke.setScale(0.8);
      smoke.setAlpha(0.6);
      this.scene.tweens.add({
        targets: smoke,
        y: smoke.y - 20,
        x: smoke.x - 10,
        alpha: 0,
        scale: 1.5,
        duration: 350,
        onComplete: () => smoke.destroy(),
      });
    }

    if (this.life <= 0) {
      this.isFinished = true;
      this.destroy();
      return false;
    }
    return true;
  }
}
