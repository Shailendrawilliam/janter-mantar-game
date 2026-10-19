import Phaser from 'phaser';
import { IsometricUtils } from '../core/IsometricUtils';

export class MediaCrew extends Phaser.GameObjects.Sprite {
  public isInteracted = false;

  constructor(scene: Phaser.Scene, startX: number, startY: number) {
    super(scene, startX, startY, 'prop_media');

    this.scene.add.existing(this);
    this.setOrigin(0.5, 0.9);
    this.setDepth(IsometricUtils.getDepth(this.x, this.y, 1));

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
  }

  public interact(): void {
    if (this.isInteracted) return;
    this.isInteracted = true;

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y - 20,
      duration: 400,
      onComplete: () => {
        this.destroy();
      },
    });
  }
}
