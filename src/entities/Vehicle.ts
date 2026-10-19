import Phaser from 'phaser';
import { IsometricUtils } from '../core/IsometricUtils';
import { SPEEDS } from '../config/constants';

export type VehicleType = 'DTC' | 'AUTO' | 'PCR' | 'VAJRA' | 'JAMMER';

export class Vehicle extends Phaser.GameObjects.Sprite {
  public vehicleType: VehicleType;
  public speed: number;
  public direction = 1;
  public axis: 'X' | 'Y' = 'X';
  public minCoord: number;
  public maxCoord: number;
  public waterCannonTimer = 0;

  constructor(
    scene: Phaser.Scene,
    startX: number,
    startY: number,
    type: VehicleType,
    axis: 'X' | 'Y' = 'X',
    minCoord?: number,
    maxCoord?: number
  ) {
    let textureKey = 'vehicle_dtc';
    if (type === 'AUTO') textureKey = 'vehicle_auto';
    else if (type === 'PCR') textureKey = 'vehicle_pcr';
    else if (type === 'VAJRA') textureKey = 'vehicle_vajra';
    else if (type === 'JAMMER') textureKey = 'vehicle_jammer';

    super(scene, startX, startY, textureKey);

    this.vehicleType = type;
    this.axis = axis;
    this.minCoord = minCoord ?? (axis === 'X' ? 240 : startY - 180);
    this.maxCoord = maxCoord ?? (axis === 'X' ? 784 : startY + 180);

    switch (type) {
      case 'DTC':
        this.speed = SPEEDS.VEHICLE_BUS;
        break;
      case 'AUTO':
        this.speed = SPEEDS.VEHICLE_AUTO;
        break;
      case 'PCR':
        this.speed = SPEEDS.VEHICLE_PCR;
        break;
      case 'VAJRA':
        this.speed = 25;
        break;
      case 'JAMMER':
        this.speed = 35;
        break;
    }

    this.scene.add.existing(this);
    this.setOrigin(0.5, 0.85);
    this.setDepth(IsometricUtils.getDepth(this.x, this.y, 1));
  }

  public updateVehicle(delta: number): { firesWater: boolean } {
    const dt = delta / 1000;
    let firesWater = false;

    if (this.axis === 'X') {
      this.x += this.direction * this.speed * dt;
      if (this.x >= this.maxCoord) {
        this.direction = -1;
        this.setFlipX(true);
      } else if (this.x <= this.minCoord) {
        this.direction = 1;
        this.setFlipX(false);
      }
    } else {
      this.y += this.direction * this.speed * dt;
      if (this.y >= this.maxCoord) {
        this.direction = -1;
      } else if (this.y <= this.minCoord) {
        this.direction = 1;
      }
    }

    if (this.vehicleType === 'VAJRA') {
      this.waterCannonTimer += dt;
      if (this.waterCannonTimer >= 4.2) {
        this.waterCannonTimer = 0;
        firesWater = true;
      }
    }

    this.setDepth(IsometricUtils.getDepth(this.x, this.y, 1));
    return { firesWater };
  }
}
