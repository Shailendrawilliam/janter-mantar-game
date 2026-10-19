import Phaser from 'phaser';
import { IsometricUtils } from '../core/IsometricUtils';
import { SPEEDS, ROAD_BOUNDS } from '../config/constants';

export type PoliceType = 'CONSTABLE' | 'RIOT';
export type PoliceState = 'PATROL' | 'CHASE' | 'DETAIN';

export class PoliceOfficer extends Phaser.GameObjects.Sprite {
  public policeType: PoliceType;
  public state: PoliceState = 'PATROL';
  public patrolOrigin: { x: number; y: number };
  public patrolRadius = 140;
  public speed = SPEEDS.POLICE_PATROL; // 75 px/s
  public chaseSpeed = SPEEDS.POLICE_CHASE; // 110 px/s
  public detectionRadius = 180;
  public pushback = 0;

  constructor(scene: Phaser.Scene, startX: number, startY: number, type: PoliceType = 'CONSTABLE') {
    super(scene, startX, startY, type === 'CONSTABLE' ? 'police_constable' : 'police_riot');

    this.patrolOrigin = { x: startX, y: startY };
    this.policeType = type;
    this.speed = type === 'CONSTABLE' ? SPEEDS.POLICE_PATROL : SPEEDS.POLICE_PATROL * 0.85;
    this.chaseSpeed = type === 'CONSTABLE' ? SPEEDS.POLICE_CHASE : SPEEDS.POLICE_CHASE * 0.85;
    this.detectionRadius = type === 'CONSTABLE' ? 180 : 150;

    this.scene.add.existing(this);
    this.setOrigin(0.5, 0.9);
    this.setDepth(IsometricUtils.getDepth(this.x, this.y, 1));
  }

  public updateAI(targetX: number, targetY: number, crowdCount: number, delta: number): { detaining: boolean; blewWhistle: boolean } {
    const dt = delta / 1000;
    let detaining = false;
    let blewWhistle = false;

    // Pushback recovery
    if (this.pushback > 0) {
      this.pushback = Math.max(0, this.pushback - dt * 60);
      this.x = Phaser.Math.Clamp(this.x, ROAD_BOUNDS.WALK_MIN_X, ROAD_BOUNDS.WALK_MAX_X);
      this.setDepth(IsometricUtils.getDepth(this.x, this.y, 1));
      return { detaining: false, blewWhistle: false };
    }

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distToTarget = Math.hypot(dx, dy);

    if (distToTarget < this.detectionRadius) {
      if (this.state === 'PATROL') {
        blewWhistle = true;
      }
      this.state = 'CHASE';

      const crowdIntimidation = this.policeType === 'CONSTABLE' && crowdCount > 12;

      if (distToTarget > 30 && !crowdIntimidation) {
        this.x += (dx / distToTarget) * this.chaseSpeed * dt;
        this.y += (dy / distToTarget) * this.chaseSpeed * dt;

        if (dx < -0.1) this.setFlipX(true);
        else if (dx > 0.1) this.setFlipX(false);
      } else if (distToTarget <= 30) {
        detaining = true;
      }
    } else {
      this.state = 'PATROL';
      const pDx = this.patrolOrigin.x - this.x;
      const pDy = this.patrolOrigin.y - this.y;
      const pDist = Math.hypot(pDx, pDy);
      if (pDist > 10) {
        this.x += (pDx / pDist) * this.speed * dt;
        this.y += (pDy / pDist) * this.speed * dt;
      }
    }

    this.x = Phaser.Math.Clamp(this.x, ROAD_BOUNDS.WALK_MIN_X, ROAD_BOUNDS.WALK_MAX_X);
    this.setDepth(IsometricUtils.getDepth(this.x, this.y, 1));
    return { detaining, blewWhistle };
  }

  public applyCrowdPush(angle: number, force: number): void {
    this.pushback = force;
    this.x += Math.cos(angle) * force;
    this.y += Math.sin(angle) * force;
    this.x = Phaser.Math.Clamp(this.x, ROAD_BOUNDS.WALK_MIN_X, ROAD_BOUNDS.WALK_MAX_X);
    this.setDepth(IsometricUtils.getDepth(this.x, this.y, 1));
  }
}
