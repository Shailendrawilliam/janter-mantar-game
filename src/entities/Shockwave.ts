import Phaser from 'phaser';
import { IsometricUtils } from '../core/IsometricUtils';

export class ShockwaveRing extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, startX: number, startY: number, color = 0xf2a900) {
    super(scene, startX, startY, 'fx_shockwave');

    this.setTint(color);
    this.scene.add.existing(this);
    this.setOrigin(0.5, 0.5);
    this.setScale(0.2);
    this.setAlpha(0.9);
    this.setDepth(IsometricUtils.getDepth(this.x, this.y, 2));

    this.scene.tweens.add({
      targets: this,
      scaleX: 2.8,
      scaleY: 1.8,
      alpha: 0,
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.destroy();
      },
    });
  }
}
