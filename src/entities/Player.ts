import Phaser from 'phaser';
import { IsometricUtils } from '../core/IsometricUtils';
import { SPEEDS, ROAD_BOUNDS } from '../config/constants';

export class Player extends Phaser.GameObjects.Sprite {
  public speed = SPEEDS.PLAYER_WALK; // 135 px/s: Smooth, natural walking pace
  public sprintSpeed = SPEEDS.PLAYER_SPRINT; // 210 px/s: Controlled jog
  public isSprinting = false;
  public detentionMeter = 0; // 0 to 100
  public maxDetention = 100;
  public chantCooldown = 0;
  public sprintEnergy = 100;
  public maxSprintEnergy = 100;
  public headingAngle = 90; // Default facing East towards Jantar Mantar
  private dustTimer = 0;
  private walkBob = 0;

  constructor(scene: Phaser.Scene, startX: number, startY: number) {
    super(scene, startX, startY, 'protester_leader');

    this.scene.add.existing(this);
    this.setOrigin(0.5, 0.9);
    this.setDepth(IsometricUtils.getDepth(this.x, this.y, 2));

    // Flag flutter tween
    this.scene.tweens.add({
      targets: this,
      scaleY: { from: 1, to: 1.03 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public updateMovement(vx: number, vy: number, delta: number, sprintInput: boolean): void {
    const dt = delta / 1000;

    // Sprint Energy
    if (sprintInput && this.sprintEnergy > 10 && (vx !== 0 || vy !== 0)) {
      this.isSprinting = true;
      this.sprintEnergy = Math.max(0, this.sprintEnergy - dt * 25);
    } else {
      this.isSprinting = false;
      this.sprintEnergy = Math.min(this.maxSprintEnergy, this.sprintEnergy + dt * 18);
    }

    const currentSpeed = this.isSprinting ? this.sprintSpeed : this.speed;

    // Normalize velocity vector
    let moveX = vx;
    let moveY = vy;
    const len = Math.hypot(moveX, moveY);

    if (len > 0) {
      moveX /= len;
      moveY /= len;

      // Smooth, real-pixel movement without accidental multipliers!
      this.x += moveX * currentSpeed * dt;
      this.y += moveY * currentSpeed * dt;

      // Facing orientation
      if (moveX < -0.1) {
        this.setFlipX(true);
      } else if (moveX > 0.1) {
        this.setFlipX(false);
      }

      // Compass heading in degrees (0 = East, 90 = South, 180 = West, 270 = North)
      let deg = Phaser.Math.RadToDeg(Math.atan2(moveY, moveX));
      if (deg < 0) deg += 360;
      this.headingAngle = Math.round(deg);

      // Walking bounce animation
      this.walkBob += dt * (this.isSprinting ? 14 : 9);
      this.y += Math.sin(this.walkBob) * 0.4;

      // Dust puff particles when running
      this.dustTimer += dt;
      if (this.dustTimer > 0.3) {
        this.dustTimer = 0;
        this.spawnDustPuff();
      }
    }

    // Clamp inside road corridor bounds
    this.y = Phaser.Math.Clamp(this.y, ROAD_BOUNDS.TOP_Y, ROAD_BOUNDS.BOTTOM_Y);
    this.x = Math.max(80, this.x);

    // Dynamic depth sorting
    this.setDepth(IsometricUtils.getDepth(this.x, this.y, 2));

    if (this.chantCooldown > 0) {
      this.chantCooldown -= dt;
    }
  }

  private spawnDustPuff(): void {
    const dust = this.scene.add.image(this.x - (this.flipX ? -6 : 6), this.y - 2, 'fx_dust');
    dust.setDepth(this.depth - 1);
    dust.setScale(Phaser.Math.FloatBetween(0.6, 1.2));
    dust.setAlpha(0.6);

    this.scene.tweens.add({
      targets: dust,
      alpha: 0,
      scaleX: 1.6,
      scaleY: 1.6,
      y: dust.y - 8,
      duration: 350,
      ease: 'Quad.easeOut',
      onComplete: () => {
        dust.destroy();
      },
    });
  }

  public adjustDetention(amount: number): void {
    this.detentionMeter = Phaser.Math.Clamp(this.detentionMeter + amount, 0, this.maxDetention);
  }

  public getSprintRatio(): number {
    return this.sprintEnergy / this.maxSprintEnergy;
  }
}
