import Phaser from 'phaser';
import { IsometricUtils } from '../core/IsometricUtils';

export class Barricade extends Phaser.GameObjects.Sprite {
  public tier: number;
  public health: number;
  public maxHealth: number;
  public isBreached = false;

  constructor(scene: Phaser.Scene, startX: number, startY: number, tier = 1) {
    super(scene, startX, startY, 'barricade_yellow');

    this.tier = tier;
    this.maxHealth = tier * 35;
    this.health = this.maxHealth;

    this.scene.add.existing(this);
    this.setOrigin(0.5, 0.85);
    this.setDepth(IsometricUtils.getDepth(this.x, this.y, 0));
  }

  public damage(amount: number): boolean {
    if (this.isBreached) return false;
    this.health -= amount;

    // Shake
    this.scene.tweens.add({
      targets: this,
      x: this.x + Phaser.Math.Between(-4, 4),
      duration: 40,
      yoyo: true,
      repeat: 2,
    });

    if (this.health <= 0) {
      this.isBreached = true;
      this.setTexture('barricade_damaged');
      this.setAlpha(0.65);

      this.scene.tweens.add({
        targets: this,
        angle: 28,
        scaleY: 0.8,
        duration: 250,
        ease: 'Bounce.easeOut',
      });
      return true;
    }
    return false;
  }
}
