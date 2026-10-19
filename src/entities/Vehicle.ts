import Phaser from 'phaser';
import { IsometricUtils } from '../core/IsometricUtils';
import { SPEEDS } from '../config/constants';

export type VehicleType = 'DTC' | 'AUTO' | 'PCR' | 'VAJRA' | 'JAMMER';

export class Vehicle extends Phaser.GameObjects.Sprite {
  public vehicleType: VehicleType;
  public speed: number;
  public direction = 1;
  public minX: number;
  public maxX: number;
  public waterCannonTimer = 0;

  constructor(
    scene: Phaser.Scene,
    startX: number,
    startY: number,
    type: VehicleType,
    minX = startX - 160,
    maxX = startX + 160
  ) {
    let textureKey = 'vehicle_dtc';
    if (type === 'AUTO') textureKey = 'vehicle_auto';
    else if (type === 'PCR') textureKey = 'vehicle_pcr';
    else if (type === 'VAJRA') textureKey = 'vehicle_vajra';
    else if (type === 'JAMMER') textureKey = 'vehicle_jammer';

    super(scene, startX, startY, textureKey);

    this.vehicleType = type;
    this.minX = minX;
    this.maxX = maxX;

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

    this.x += this.direction * this.speed * dt;
    if (this.x >= this.maxX) {
      this.direction = -1;
      this.setFlipX(true);
    } else if (this.x <= this.minX) {
      this.direction = 1;
      this.setFlipX(false);
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
