import Phaser from 'phaser';
import { IsometricUtils } from '../core/IsometricUtils';
import { SPEEDS, ROAD_BOUNDS } from '../config/constants';

export type CrowdState = 'BYSTANDER' | 'FOLLOWING' | 'DISPERSED';

export class CrowdMember extends Phaser.GameObjects.Sprite {
  public state: CrowdState = 'BYSTANDER';
  public targetOffset: { x: number; y: number } = { x: 0, y: 0 };
  public speed = SPEEDS.CROWD_WALK; // 125 px/s
  private disperseTimer = 0;

  constructor(scene: Phaser.Scene, startX: number, startY: number, variant: number) {
    super(scene, startX, startY, `crowd_member_${variant % 5}`);

    this.scene.add.existing(this);
    this.setOrigin(0.5, 0.9);
    this.setDepth(IsometricUtils.getDepth(this.x, this.y, 1));

    // Placard bobbing
    this.scene.tweens.add({
      targets: this,
      y: startY - 3,
      duration: 600 + Math.random() * 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public recruit(offsetX: number, offsetY: number): void {
    if (this.state === 'FOLLOWING') return;
    this.state = 'FOLLOWING';
    this.targetOffset = { x: offsetX, y: offsetY };

    // Hop on recruit
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 200,
      yoyo: true,
      ease: 'Back.easeOut',
    });
  }

  public disperse(pushAngle: number): void {
    this.state = 'DISPERSED';
    this.disperseTimer = 3.0;
    this.x += Math.cos(pushAngle) * 35;
    this.y += Math.sin(pushAngle) * 35;
  }

  public updateCrowd(leaderX: number, leaderY: number, delta: number): void {
    const dt = delta / 1000;

    if (this.state === 'FOLLOWING') {
      const targetX = leaderX + this.targetOffset.x;
      const targetY = leaderY + this.targetOffset.y;

      const dx = targetX - this.x;
      const dy = targetY - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 8) {
        const moveDist = Math.min(dist, this.speed * dt * (dist > 60 ? 1.4 : 1.0));
        this.x += (dx / dist) * moveDist;
        this.y += (dy / dist) * moveDist;

        if (dx < -0.1) this.setFlipX(true);
        else if (dx > 0.1) this.setFlipX(false);
      }
    } else if (this.state === 'DISPERSED') {
      this.disperseTimer -= dt;
      if (this.disperseTimer <= 0) {
        this.state = 'BYSTANDER';
      }
    }

    this.y = Phaser.Math.Clamp(this.y, ROAD_BOUNDS.TOP_Y, ROAD_BOUNDS.BOTTOM_Y);
    this.setDepth(IsometricUtils.getDepth(this.x, this.y, 1));
  }
}
