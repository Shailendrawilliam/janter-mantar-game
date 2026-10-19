import Phaser from 'phaser';
import { IsometricUtils } from '../core/IsometricUtils';
import { SoundSystem } from '../core/SoundSystem';
import { ROAD_BOUNDS } from '../config/constants';

export class RallyTractor extends Phaser.GameObjects.Sprite {
  public speed = 175;
  public life = 22.0; // Active for 22 seconds of glorious ramming
  public isFinished = false;
  public isMounted = false;
  private hornTimer = 1.0;

  constructor(scene: Phaser.Scene, startX: number, startY: number) {
    super(scene, startX, startY, 'vehicle_tractor');

    this.scene.add.existing(this);
    this.setOrigin(0.5, 0.85);
    this.setDepth(IsometricUtils.getDepth(this.x, this.y, 2));

    // Tractor rumble bounce
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.03,
      duration: 90,
      yoyo: true,
      repeat: -1,
    });
  }

  public updateTractor(delta: number, steerX = 0): boolean {
    const dt = delta / 1000;
    this.life -= dt;

    // Move Northwards
    this.y -= this.speed * dt;

    // Steer horizontally if mounted or following player lane
    if (steerX !== 0) {
      this.x += steerX * 140 * dt;
      this.x = Phaser.Math.Clamp(this.x, ROAD_BOUNDS.ROAD_LEFT_X + 40, ROAD_BOUNDS.ROAD_RIGHT_X - 40);
    }

    this.setDepth(IsometricUtils.getDepth(this.x, this.y, 2));

    // Periodic Truck Horn ("OK TATA")
    this.hornTimer -= dt;
    if (this.hornTimer <= 0) {
      this.hornTimer = 4.2;
      SoundSystem.getInstance().playDelhiTruckHorn();
    }

    // Exhaust smoke puff behind tractor
    if (Math.random() < 0.3) {
      const smoke = this.scene.add.image(this.x - 18, this.y + 25, 'fx_dust');
      smoke.setScale(0.9);
      smoke.setAlpha(0.65);
      this.scene.tweens.add({
        targets: smoke,
        y: smoke.y + 24,
        x: smoke.x - 6,
        alpha: 0,
        scale: 1.6,
        duration: 400,
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
