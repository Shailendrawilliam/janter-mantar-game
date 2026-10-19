import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.load.image('menu_bg', 'assets/menu_bg.jpg');
    this.load.image('victory_bg', 'assets/victory_bg.jpg');
  }

  create(): void {
    this.createRoadAndEnvironment();
    this.createCharacters();
    this.createBarricades();
    this.createVehicles();
    this.createJantarMantarMonument();
    this.createPropsAndParticles();
    this.createPowerUps();

    this.scene.start('MenuScene');
  }

  private createRoadAndEnvironment(): void {
    // 1. Asphalt Road Texture (128x128 tileable)
    const road = this.make.graphics({ x: 0, y: 0 });
    road.fillStyle(0x22272e, 1);
    road.fillRect(0, 0, 128, 128);
    road.fillStyle(0x2b313a, 0.4);
    for (let i = 0; i < 40; i++) {
      road.fillRect((i * 17) % 128, (i * 23) % 128, 3, 2);
    }
    road.generateTexture('road_asphalt', 128, 128);
    road.destroy();

    // 2. Vertical Road Lane Divider (Yellow dashed line running North-South)
    const laneV = this.make.graphics({ x: 0, y: 0 });
    laneV.fillStyle(0xf1c40f, 0.95);
    laneV.fillRect(0, 0, 6, 48);
    laneV.generateTexture('road_lane_stripe_v', 6, 48);
    laneV.destroy();

    // 3. Horizontal Zebra Crossing across the vertical road (width 524, height 64)
    const zebraH = this.make.graphics({ x: 0, y: 0 });
    zebraH.fillStyle(0xffffff, 0.9);
    for (let i = 0; i < 11; i++) {
      zebraH.fillRect(i * 48, 0, 26, 64);
    }
    zebraH.generateTexture('zebra_crossing_h', 524, 64);
    zebraH.destroy();

    // 4. Sidewalk Pavement (Red Sandstone / Gray Delhi Pavement)
    const pave = this.make.graphics({ x: 0, y: 0 });
    pave.fillStyle(0x84817a, 1);
    pave.fillRect(0, 0, 64, 64);
    pave.lineStyle(1.5, 0x57606f, 0.7);
    pave.strokeRect(0, 0, 32, 32);
    pave.strokeRect(32, 0, 32, 32);
    pave.strokeRect(0, 32, 32, 32);
    pave.strokeRect(32, 32, 32, 32);
    pave.generateTexture('sidewalk_tile', 64, 64);
    pave.destroy();

    // 5. Vertical Delhi Yellow & Black Curb (running along the left and right edges)
    const curbV = this.make.graphics({ x: 0, y: 0 });
    curbV.fillStyle(0xf1c40f, 1); // Yellow
    curbV.fillRect(0, 0, 12, 32);
    curbV.fillStyle(0x111111, 1); // Black
    curbV.fillRect(0, 32, 12, 32);
    curbV.generateTexture('delhi_curb_v', 12, 64);
    curbV.destroy();

    // 6. Lush Delhi Tree
    const tree = this.make.graphics({ x: 0, y: 0 });
    tree.fillStyle(0x000000, 0.35);
    tree.fillEllipse(36, 80, 50, 20);
    tree.fillStyle(0x4b2c20, 1);
    tree.fillRoundedRect(30, 40, 12, 42, 3);
    tree.fillStyle(0x1b4332, 1);
    tree.fillCircle(36, 32, 28);
    tree.fillStyle(0x2d6a4f, 1);
    tree.fillCircle(24, 26, 20);
    tree.fillCircle(48, 28, 20);
    tree.fillStyle(0x40916c, 0.9);
    tree.fillCircle(36, 18, 16);
    tree.generateTexture('delhi_tree', 72, 92);
    tree.destroy();

    // 7. Delhi Street Lamp
    const lamp = this.make.graphics({ x: 0, y: 0 });
    lamp.fillStyle(0x000000, 0.3);
    lamp.fillEllipse(15, 78, 18, 8);
    lamp.lineStyle(4, 0x2f3640, 1);
    lamp.lineBetween(15, 78, 15, 12);
    lamp.lineBetween(15, 12, 28, 6);
    lamp.fillStyle(0xfbc531, 1);
    lamp.fillCircle(28, 8, 5);
    lamp.generateTexture('street_lamp', 36, 82);
    lamp.destroy();

    // 8. Delhi Metro Elevated Pillar (P-108 with DMRC logo & coaching posters)
    const pillarW = 44;
    const pillarH = 120;
    const pillar = this.make.graphics({ x: 0, y: 0 });
    pillar.fillStyle(0x000000, 0.4);
    pillar.fillEllipse(pillarW / 2, pillarH - 6, pillarW - 4, 16);
    // Concrete shaft
    pillar.fillStyle(0x95a5a6, 1);
    pillar.fillRoundedRect(6, 10, pillarW - 12, pillarH - 24, 4);
    // Yellow & Black hazard base
    for (let i = 0; i < 4; i++) {
      pillar.fillStyle(i % 2 === 0 ? 0xf1c40f : 0x111111, 1);
      pillar.fillRect(6, pillarH - 26 - i * 6, pillarW - 12, 6);
    }
    // DMRC Blue / Red line marker
    pillar.fillStyle(0x2980b9, 1);
    pillar.fillRect(6, 32, pillarW - 12, 10);
    // Delhi coaching poster on pillar ("IAS / SSC" satire)
    pillar.fillStyle(0xfff9e6, 0.95);
    pillar.fillRect(10, 48, pillarW - 20, 18);
    pillar.fillStyle(0xc0392b, 1);
    pillar.fillRect(12, 52, pillarW - 24, 3);
    pillar.fillStyle(0x2c3e50, 1);
    pillar.fillRect(12, 58, pillarW - 24, 2);
    pillar.fillRect(12, 62, pillarW - 28, 2);
    // Top elevated track bracket
    pillar.fillStyle(0x7f8c8d, 1);
    pillar.fillRoundedRect(2, 6, pillarW - 4, 10, 2);
    pillar.generateTexture('delhi_metro_pillar', pillarW, pillarH);
    pillar.destroy();

    // 9. Delhi DTC Bus Stop Shelter (with bench & route signboard)
    const busStopW = 86;
    const busStopH = 74;
    const busStop = this.make.graphics({ x: 0, y: 0 });
    busStop.fillStyle(0x000000, 0.35);
    busStop.fillEllipse(busStopW / 2, busStopH - 6, busStopW - 8, 14);
    // Green steel awning
    busStop.fillStyle(0x27ae60, 1);
    busStop.fillRoundedRect(4, 6, busStopW - 8, 16, 4);
    busStop.fillStyle(0xf1c40f, 1);
    busStop.fillRect(4, 18, busStopW - 8, 4);
    // Stainless steel support poles
    busStop.lineStyle(3, 0xbdc3c7, 1);
    busStop.lineBetween(12, 22, 12, busStopH - 8);
    busStop.lineBetween(busStopW - 12, 22, busStopW - 12, busStopH - 8);
    // Passenger bench
    busStop.fillStyle(0x95a5a6, 1);
    busStop.fillRoundedRect(16, busStopH - 24, busStopW - 32, 6, 2);
    // Route map board
    busStop.fillStyle(0xffffff, 0.9);
    busStop.fillRect(busStopW / 2 - 14, 26, 28, 20);
    busStop.fillStyle(0xe74c3c, 1);
    busStop.fillRect(busStopW / 2 - 12, 28, 24, 4);
    busStop.generateTexture('bus_stop_shelter', busStopW, busStopH);
    busStop.destroy();

    // 10. Delhi Langar & Chai Stall (Community Seva Station)
    const stallW = 76;
    const stallH = 72;
    const stall = this.make.graphics({ x: 0, y: 0 });
    stall.fillStyle(0x000000, 0.4);
    stall.fillEllipse(stallW / 2, stallH - 6, stallW - 6, 16);
    // Saffron Canopy Tent
    stall.fillStyle(0xff9933, 1);
    stall.fillTriangle(4, 24, stallW / 2, 4, stallW - 4, 24);
    stall.fillStyle(0xffffff, 1);
    stall.fillRect(4, 24, stallW - 8, 6);
    // Marigold Garland decoration
    for (let i = 0; i < 7; i++) {
      stall.fillStyle(i % 2 === 0 ? 0xf1c40f : 0xe67e22, 1);
      stall.fillCircle(8 + i * 10, 30, 3);
    }
    // Wooden Table
    stall.fillStyle(0x8e44ad, 1);
    stall.fillRect(8, 36, stallW - 16, 26);
    // Steaming Brass Chai Samovar / Degchi
    stall.fillStyle(0xf39c12, 1);
    stall.fillRoundedRect(14, 28, 16, 18, 3);
    stall.fillStyle(0xd35400, 1);
    stall.fillRect(16, 26, 12, 3);
    // Samosa Plate
    stall.fillStyle(0xecf0f1, 1);
    stall.fillEllipse(stallW - 24, 40, 20, 8);
    stall.fillStyle(0xd35400, 1);
    stall.fillTriangle(stallW - 30, 42, stallW - 25, 34, stallW - 20, 42);
    stall.fillTriangle(stallW - 24, 42, stallW - 19, 34, stallW - 14, 42);
    stall.generateTexture('langar_stall', stallW, stallH);
    stall.destroy();

    // 11. Delhi Monsoon Pothole / Water Puddle
    const potW = 54;
    const potH = 26;
    const pot = this.make.graphics({ x: 0, y: 0 });
    pot.fillStyle(0x161a22, 1);
    pot.fillEllipse(potW / 2, potH / 2, potW - 6, potH - 6);
    pot.fillStyle(0x1f2d3d, 0.9);
    pot.fillEllipse(potW / 2, potH / 2, potW - 16, potH - 12);
    pot.fillStyle(0x5dade2, 0.5);
    pot.fillEllipse(potW / 2 - 4, potH / 2 - 2, 12, 5);
    pot.generateTexture('pothole_puddle', potW, potH);
    pot.destroy();

    // 12. Road Speed Breaker (Yellow & Black chevron stripes across lane)
    const sbW = 128;
    const sbH = 20;
    const sb = this.make.graphics({ x: 0, y: 0 });
    sb.fillStyle(0x111111, 0.9);
    sb.fillRect(0, 0, sbW, sbH);
    for (let i = 0; i < 8; i++) {
      sb.fillStyle(0xf1c40f, 1);
      sb.fillTriangle(i * 16, sbH, i * 16 + 8, 0, i * 16 + 16, sbH);
    }
    sb.generateTexture('speed_breaker', sbW, sbH);
    sb.destroy();

    // 13. Police Steel Spike Strip / Nail Barricading (कीलों वाले बैरिकेड)
    const spW = 130;
    const spH = 26;
    const sp = this.make.graphics({ x: 0, y: 0 });
    sp.fillStyle(0x111111, 0.95);
    sp.fillRect(0, 10, spW, 12);
    // Sharp metal spikes
    for (let i = 0; i < 9; i++) {
      sp.fillStyle(0xdfe6e9, 1);
      sp.fillTriangle(i * 14 + 4, 10, i * 14 + 10, 0, i * 14 + 16, 10);
      sp.fillStyle(0xb2bec3, 1);
      sp.fillTriangle(i * 14 + 6, 22, i * 14 + 12, 12, i * 14 + 18, 22);
    }
    sp.generateTexture('spike_strip', spW, spH);
    sp.destroy();

    // 14. Drone Spotlight Beam Cone
    const spotW = 140;
    const spotH = 140;
    const spot = this.make.graphics({ x: 0, y: 0 });
    spot.fillStyle(0x00d2ff, 0.15);
    spot.fillCircle(spotW / 2, spotH / 2, spotW / 2 - 4);
    spot.lineStyle(2, 0x00d2ff, 0.5);
    spot.strokeCircle(spotW / 2, spotH / 2, spotW / 2 - 4);
    spot.generateTexture('spotlight_cone', spotW, spotH);
    spot.destroy();
  }

  private createCharacters(): void {
    // 1. Protester Leader
    const leader = this.make.graphics({ x: 0, y: 0 });
    leader.fillStyle(0x000000, 0.4);
    leader.fillEllipse(26, 56, 26, 12);
    leader.fillStyle(0xe67e22, 1);
    leader.fillRoundedRect(16, 22, 20, 26, 5);
    leader.fillStyle(0x27ae60, 1);
    leader.fillRect(14, 24, 7, 22);
    leader.fillStyle(0xf5cba7, 1);
    leader.fillCircle(26, 15, 9);
    leader.fillStyle(0x1e272e, 1);
    leader.fillCircle(26, 11, 8);
    leader.fillStyle(0xf1f2f6, 1);
    leader.fillRect(18, 45, 6, 12);
    leader.fillRect(28, 45, 6, 12);
    leader.fillStyle(0x2d3436, 1);
    leader.fillRect(17, 54, 8, 4);
    leader.fillRect(27, 54, 8, 4);
    leader.lineStyle(2.5, 0x8395a7, 1);
    leader.lineBetween(36, 54, 36, 2);
    leader.fillStyle(0xff9933, 1);
    leader.fillRect(36, 2, 18, 5);
    leader.fillStyle(0xffffff, 1);
    leader.fillRect(36, 7, 18, 5);
    leader.fillStyle(0x138808, 1);
    leader.fillRect(36, 12, 18, 5);
    leader.fillStyle(0x000080, 1);
    leader.fillCircle(45, 9, 2);
    leader.generateTexture('protester_leader', 58, 64);
    leader.destroy();

    // 2. Crowd Members
    const crowdColors = [0x3498db, 0x9b59b6, 0x1abc9c, 0xe74c3c, 0xf39c12];
    crowdColors.forEach((color, idx) => {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x000000, 0.35);
      g.fillEllipse(22, 50, 22, 10);
      g.fillStyle(color, 1);
      g.fillRoundedRect(14, 20, 16, 22, 4);
      g.fillStyle(0xfad7a0, 1);
      g.fillCircle(22, 14, 8);
      g.fillStyle(0x1e272e, 1);
      g.fillCircle(22, 10, 7);
      g.fillStyle(0x2c3e50, 1);
      g.fillRect(16, 40, 5, 11);
      g.fillRect(23, 40, 5, 11);
      g.lineStyle(2, 0x95a5a6, 1);
      g.lineBetween(30, 42, 30, 6);
      g.fillStyle(0xffffff, 1);
      g.fillRoundedRect(24, 4, 18, 12, 2);
      g.lineStyle(1.5, 0xe74c3c, 1);
      g.strokeRoundedRect(24, 4, 18, 12, 2);
      g.fillStyle(0xc0392b, 1);
      g.fillRect(26, 7, 14, 2);
      g.fillRect(26, 11, 10, 2);
      g.generateTexture(`crowd_member_${idx}`, 46, 56);
      g.destroy();
    });

    // 3. Delhi Police Constable
    const cop = this.make.graphics({ x: 0, y: 0 });
    cop.fillStyle(0x000000, 0.38);
    cop.fillEllipse(24, 52, 22, 10);
    cop.fillStyle(0xc4a36e, 1);
    cop.fillRoundedRect(15, 20, 18, 22, 4);
    cop.fillStyle(0xd91e18, 1);
    cop.fillRect(14, 22, 3, 4);
    cop.fillStyle(0x1b2838, 1);
    cop.fillRect(14, 26, 3, 4);
    cop.fillStyle(0xa88750, 1);
    cop.fillRect(17, 40, 6, 12);
    cop.fillRect(25, 40, 6, 12);
    cop.fillStyle(0x111111, 1);
    cop.fillRect(16, 49, 7, 4);
    cop.fillRect(25, 49, 7, 4);
    cop.fillStyle(0xedbb99, 1);
    cop.fillCircle(24, 14, 8);
    cop.fillStyle(0x1b2838, 1);
    cop.fillRoundedRect(17, 6, 15, 6, 2);
    cop.fillStyle(0xd91e18, 1);
    cop.fillRect(22, 6, 5, 3);
    cop.lineStyle(3.5, 0x5d4037, 1);
    cop.lineBetween(33, 22, 37, 46);
    cop.generateTexture('police_constable', 46, 58);
    cop.destroy();

    // 4. Riot Police
    const riot = this.make.graphics({ x: 0, y: 0 });
    riot.fillStyle(0x000000, 0.42);
    riot.fillEllipse(26, 54, 24, 11);
    riot.fillStyle(0x17202a, 1);
    riot.fillRoundedRect(16, 18, 20, 24, 4);
    riot.fillStyle(0x212f3d, 1);
    riot.fillRect(18, 40, 6, 14);
    riot.fillRect(26, 40, 6, 14);
    riot.fillStyle(0x2c3e50, 1);
    riot.fillCircle(26, 13, 8);
    riot.fillStyle(0x85c1e9, 0.8);
    riot.fillRect(22, 11, 9, 5);
    riot.fillStyle(0x5dade2, 0.5);
    riot.fillRoundedRect(6, 14, 14, 36, 4);
    riot.lineStyle(2, 0xffffff, 0.9);
    riot.strokeRoundedRect(6, 14, 14, 36, 4);
    riot.fillStyle(0xffffff, 0.95);
    riot.fillRect(8, 28, 10, 3);
    riot.generateTexture('police_riot', 50, 60);
    riot.destroy();

    // 5. Delhi Lathi Charge Constable ("लट्ठमार")
    const lathi = this.make.graphics({ x: 0, y: 0 });
    lathi.fillStyle(0x000000, 0.4);
    lathi.fillEllipse(24, 52, 22, 10);
    lathi.fillStyle(0xc4a36e, 1);
    lathi.fillRoundedRect(15, 20, 18, 22, 4);
    lathi.fillStyle(0xd91e18, 1);
    lathi.fillRect(14, 22, 3, 4);
    lathi.fillStyle(0xa88750, 1);
    lathi.fillRect(17, 40, 6, 12);
    lathi.fillRect(25, 40, 6, 12);
    lathi.fillStyle(0xedbb99, 1);
    lathi.fillCircle(24, 14, 8);
    lathi.fillStyle(0x1b2838, 1);
    lathi.fillRoundedRect(17, 6, 15, 6, 2);
    // Heavy Bamboo Lathi raised diagonally
    lathi.lineStyle(4, 0x8d6e63, 1);
    lathi.lineBetween(30, 36, 44, 8);
    lathi.fillStyle(0x5d4037, 1);
    lathi.fillCircle(44, 8, 3);
    lathi.generateTexture('police_lathi', 50, 60);
    lathi.destroy();

    // 6. Court Advocate / Legal Bail Lawyer ("वकील साहब")
    const lawyer = this.make.graphics({ x: 0, y: 0 });
    lawyer.fillStyle(0x000000, 0.4);
    lawyer.fillEllipse(22, 50, 22, 10);
    // Black Advocate Robe / Coat
    lawyer.fillStyle(0x111111, 1);
    lawyer.fillRoundedRect(13, 18, 18, 24, 4);
    // White lawyer neckband
    lawyer.fillStyle(0xffffff, 1);
    lawyer.fillRect(19, 18, 6, 6);
    lawyer.fillRect(18, 24, 3, 7);
    lawyer.fillRect(23, 24, 3, 7);
    lawyer.fillStyle(0xf5cba7, 1);
    lawyer.fillCircle(22, 12, 7);
    lawyer.fillStyle(0x2c3e50, 1);
    lawyer.fillRect(15, 40, 6, 11);
    lawyer.fillRect(23, 40, 6, 11);
    // Red Legal Bail Case File Folder
    lawyer.fillStyle(0xc0392b, 1);
    lawyer.fillRoundedRect(28, 24, 14, 16, 2);
    lawyer.fillStyle(0xffffff, 1);
    lawyer.fillRect(30, 27, 10, 2);
    lawyer.fillRect(30, 31, 8, 2);
    lawyer.generateTexture('bail_lawyer', 48, 56);
    lawyer.destroy();

    // 7. Hot Food Delivery Scooter (Zomato/Swiggy satire Langar Delivery)
    const delW = 58;
    const delH = 52;
    const del = this.make.graphics({ x: 0, y: 0 });
    del.fillStyle(0x000000, 0.38);
    del.fillEllipse(delW / 2, delH - 4, delW - 6, 12);
    // Red Scooter Body
    del.fillStyle(0xe74c3c, 1);
    del.fillRoundedRect(10, 22, 34, 18, 4);
    del.fillStyle(0x111111, 1);
    del.fillCircle(14, delH - 6, 6);
    del.fillCircle(delW - 16, delH - 6, 6);
    // Delivery Box (Orange/Yellow hot container)
    del.fillStyle(0xff793f, 1);
    del.fillRoundedRect(6, 10, 18, 18, 3);
    del.fillStyle(0xffffff, 1);
    del.fillRect(9, 14, 12, 3);
    del.fillRect(9, 19, 8, 3);
    // Rider with helmet
    del.fillStyle(0x2c3e50, 1);
    del.fillRect(28, 14, 10, 14);
    del.fillStyle(0xf1c40f, 1); // Yellow helmet
    del.fillCircle(33, 10, 7);
    del.generateTexture('delivery_scooter', delW, delH);
    del.destroy();

    // 8. Delhi Police Surveillance Drone (कैमरा ड्रोन)
    const drW = 54;
    const drH = 50;
    const dr = this.make.graphics({ x: 0, y: 0 });
    dr.fillStyle(0x000000, 0.25);
    dr.fillEllipse(drW / 2, drH - 2, 28, 8);
    // Quadcopter arms
    dr.lineStyle(3, 0x2d3436, 1);
    dr.lineBetween(8, 12, 46, 38);
    dr.lineBetween(8, 38, 46, 12);
    // 4 Rotors
    const rotorPos = [[8, 12], [46, 12], [8, 38], [46, 38]];
    rotorPos.forEach(([rx, ry]) => {
      dr.fillStyle(0x636e72, 0.85);
      dr.fillCircle(rx, ry, 6);
      dr.lineStyle(1.5, 0x00d2d3, 0.8);
      dr.strokeCircle(rx, ry, 7);
    });
    // Center Drone Pod
    dr.fillStyle(0x1e272e, 1);
    dr.fillRoundedRect(drW / 2 - 10, drH / 2 - 10, 20, 20, 4);
    // Glowing Camera Lens & Red-Blue Beacon
    dr.fillStyle(0x00d2ff, 1);
    dr.fillCircle(drW / 2, drH / 2, 4);
    dr.fillStyle(0xff3838, 1);
    dr.fillCircle(drW / 2 - 6, drH / 2 - 6, 2);
    dr.fillStyle(0x18dcff, 1);
    dr.fillCircle(drW / 2 + 6, drH / 2 - 6, 2);
    dr.generateTexture('police_drone', drW, drH);
    dr.destroy();
  }

  private createBarricades(): void {
    const W = 72;
    const H = 52;
    const b = this.make.graphics({ x: 0, y: 0 });
    b.fillStyle(0x000000, 0.4);
    b.fillEllipse(W / 2, H - 4, W - 6, 14);
    b.lineStyle(4, 0x2c3e50, 1);
    b.lineBetween(10, H - 6, 16, H - 24);
    b.lineBetween(22, H - 6, 16, H - 24);
    b.lineBetween(W - 22, H - 6, W - 16, H - 24);
    b.lineBetween(W - 10, H - 6, W - 16, H - 24);
    b.fillStyle(0xf1c40f, 1);
    b.fillRoundedRect(6, 8, W - 12, 30, 4);
    b.lineStyle(3, 0x1b2838, 1);
    b.strokeRoundedRect(6, 8, W - 12, 30, 4);
    b.fillStyle(0xd91e18, 0.95);
    b.fillTriangle(10, 8, 20, 8, 10, 20);
    b.fillTriangle(W - 20, 8, W - 10, 8, W - 10, 20);
    b.fillTriangle(10, 26, 10, 38, 20, 38);
    b.fillTriangle(W - 10, 26, W - 10, 38, W - 20, 38);
    b.fillStyle(0x1b2838, 1);
    b.fillRect(18, 16, W - 36, 14);
    b.fillStyle(0xffffff, 1);
    b.fillRect(22, 20, W - 44, 2);
    b.fillRect(22, 24, W - 44, 2);
    b.generateTexture('barricade_yellow', W, H);
    b.destroy();

    const bDmg = this.make.graphics({ x: 0, y: 0 });
    bDmg.fillStyle(0x000000, 0.3);
    bDmg.fillEllipse(W / 2, H - 4, W - 10, 10);
    bDmg.fillStyle(0xd4ac0d, 0.85);
    bDmg.fillRoundedRect(8, 16, W - 16, 22, 4);
    bDmg.lineStyle(2.5, 0xc0392b, 1);
    bDmg.lineBetween(12, 18, 26, 36);
    bDmg.lineBetween(W - 22, 20, W - 12, 36);
    bDmg.generateTexture('barricade_damaged', W, H);
    bDmg.destroy();
  }

  private createVehicles(): void {
    // 1. DTC Bus
    const busW = 120;
    const busH = 64;
    const bus = this.make.graphics({ x: 0, y: 0 });
    bus.fillStyle(0x000000, 0.45);
    bus.fillEllipse(busW / 2, busH - 6, busW - 12, 18);
    bus.fillStyle(0x27ae60, 1);
    bus.fillRoundedRect(6, 12, busW - 12, 40, 6);
    bus.fillStyle(0xf1c40f, 1);
    bus.fillRect(6, 44, busW - 12, 5);
    bus.fillStyle(0x74b9ff, 0.9);
    for (let i = 0; i < 5; i++) bus.fillRoundedRect(16 + i * 18, 16, 14, 16, 3);
    bus.fillStyle(0xdfe6e9, 0.95);
    bus.fillRoundedRect(busW - 18, 16, 10, 26, 3);
    bus.fillStyle(0x111111, 1);
    bus.fillRect(busW - 26, 9, 18, 6);
    bus.fillStyle(0xf39c12, 1);
    bus.fillRect(busW - 24, 11, 14, 2);
    bus.fillStyle(0x1e272e, 1);
    bus.fillCircle(30, busH - 8, 7);
    bus.fillCircle(busW - 30, busH - 8, 7);
    bus.generateTexture('vehicle_dtc', busW, busH);
    bus.destroy();

    // 2. Auto-Rickshaw
    const autoW = 60;
    const autoH = 50;
    const auto = this.make.graphics({ x: 0, y: 0 });
    auto.fillStyle(0x000000, 0.38);
    auto.fillEllipse(autoW / 2, autoH - 4, autoW - 8, 12);
    auto.fillStyle(0x2ecc71, 1);
    auto.fillRoundedRect(8, 20, autoW - 16, 22, 5);
    auto.fillStyle(0xf1c40f, 1);
    auto.fillRoundedRect(10, 8, autoW - 20, 18, 5);
    auto.fillStyle(0x111111, 0.85);
    auto.fillRect(16, 16, autoW - 32, 12);
    auto.fillStyle(0x1e272e, 1);
    auto.fillCircle(16, autoH - 6, 5);
    auto.fillCircle(autoW - 16, autoH - 6, 5);
    auto.generateTexture('vehicle_auto', autoW, autoH);
    auto.destroy();

    // 3. Police PCR Gypsy
    const pcrW = 84;
    const pcrH = 52;
    const pcr = this.make.graphics({ x: 0, y: 0 });
    pcr.fillStyle(0x000000, 0.4);
    pcr.fillEllipse(pcrW / 2, pcrH - 5, pcrW - 10, 14);
    pcr.fillStyle(0xf8f9fa, 1);
    pcr.fillRoundedRect(6, 14, pcrW - 12, 28, 5);
    pcr.fillStyle(0xd91e18, 1);
    pcr.fillRect(6, 28, pcrW - 12, 3);
    pcr.fillStyle(0x1b2838, 1);
    pcr.fillRect(6, 31, pcrW - 12, 3);
    pcr.fillStyle(0x74b9ff, 0.9);
    pcr.fillRoundedRect(16, 16, 20, 10, 2);
    pcr.fillRoundedRect(pcrW - 24, 16, 14, 16, 2);
    pcr.fillStyle(0xd91e18, 1);
    pcr.fillRoundedRect(pcrW / 2 - 8, 7, 7, 6, 1);
    pcr.fillStyle(0x0984e3, 1);
    pcr.fillRoundedRect(pcrW / 2, 7, 7, 6, 1);
    pcr.fillStyle(0x1e272e, 1);
    pcr.fillCircle(20, pcrH - 6, 6);
    pcr.fillCircle(pcrW - 20, pcrH - 6, 6);
    pcr.generateTexture('vehicle_pcr', pcrW, pcrH);
    pcr.destroy();

    // 4. Vajra Water Cannon Truck
    const vajraW = 96;
    const vajraH = 60;
    const vajra = this.make.graphics({ x: 0, y: 0 });
    vajra.fillStyle(0x000000, 0.45);
    vajra.fillEllipse(vajraW / 2, vajraH - 6, vajraW - 8, 16);
    vajra.fillStyle(0x353b48, 1);
    vajra.fillRoundedRect(6, 14, vajraW - 12, 36, 5);
    vajra.fillStyle(0x1e272e, 1);
    vajra.fillRect(vajraW - 26, 18, 18, 18);
    vajra.fillStyle(0x273c75, 1);
    vajra.fillRoundedRect(10, 18, 48, 26, 4);
    vajra.fillStyle(0x00a8ff, 1);
    vajra.fillCircle(vajraW - 34, 10, 7);
    vajra.lineStyle(4, 0x00d2d3, 1);
    vajra.lineBetween(vajraW - 34, 10, vajraW - 14, 4);
    vajra.fillStyle(0x111111, 1);
    vajra.fillCircle(22, vajraH - 8, 8);
    vajra.fillCircle(40, vajraH - 8, 8);
    vajra.fillCircle(vajraW - 24, vajraH - 8, 8);
    vajra.generateTexture('vehicle_vajra', vajraW, vajraH);
    vajra.destroy();

    // 5. Internet Jammer Van
    const jammerW = 82;
    const jammerH = 54;
    const jammer = this.make.graphics({ x: 0, y: 0 });
    jammer.fillStyle(0x000000, 0.4);
    jammer.fillEllipse(jammerW / 2, jammerH - 6, jammerW - 10, 14);
    jammer.fillStyle(0x1e272e, 1);
    jammer.fillRoundedRect(6, 14, jammerW - 12, 30, 5);
    jammer.lineStyle(3, 0xf1c40f, 1);
    jammer.lineBetween(jammerW / 2, 14, jammerW / 2, 4);
    jammer.fillStyle(0xf39c12, 1);
    jammer.fillCircle(jammerW / 2, 4, 7);
    jammer.generateTexture('vehicle_jammer', jammerW, jammerH);
    jammer.destroy();

    // 6. Indian Rally Tractor (facing upwards towards North)
    const trW = 76;
    const trH = 86;
    const tr = this.make.graphics({ x: 0, y: 0 });
    tr.fillStyle(0x000000, 0.45);
    tr.fillEllipse(trW / 2, trH - 6, trW - 6, 20);
    // Green Hood (Swaraj style pointing Up)
    tr.fillStyle(0x27ae60, 1);
    tr.fillRoundedRect(18, 16, 40, 50, 6);
    // Front grill & headlights
    tr.fillStyle(0x111111, 1);
    tr.fillRect(22, 16, 32, 8);
    tr.fillStyle(0xfff59d, 1);
    tr.fillCircle(24, 20, 3);
    tr.fillCircle(52, 20, 3);
    // Chrome vertical exhaust pipe
    tr.lineStyle(4, 0xbdc3c7, 1);
    tr.lineBetween(22, 26, 22, 8);
    tr.fillStyle(0x111111, 1);
    tr.fillCircle(22, 8, 3);
    // Dual Megaphones on hood
    tr.fillStyle(0xf1c40f, 1);
    tr.fillTriangle(26, 12, 32, 6, 32, 16);
    tr.fillTriangle(50, 12, 44, 6, 44, 16);
    // Driver seat & steering
    tr.fillStyle(0x2c3e50, 1);
    tr.fillRect(24, 46, 28, 16);
    // Left Giant Rear Wheel
    tr.fillStyle(0x111111, 1);
    tr.fillRoundedRect(6, 40, 12, 34, 4);
    // Right Giant Rear Wheel
    tr.fillRoundedRect(58, 40, 12, 34, 4);
    // Front Left Wheel
    tr.fillRoundedRect(10, 18, 8, 20, 3);
    // Rear Indian Tiranga flag
    tr.lineStyle(2, 0xbdc3c7, 1);
    tr.lineBetween(48, 56, 48, 28);
    tr.fillStyle(0xff9933, 1);
    tr.fillRect(48, 28, 16, 5);
    tr.fillStyle(0xffffff, 1);
    tr.fillRect(48, 33, 16, 5);
    tr.fillStyle(0x138808, 1);
    tr.fillRect(48, 38, 16, 5);
    tr.fillStyle(0x000080, 1);
    tr.fillCircle(56, 35, 1.5);

    tr.generateTexture('vehicle_tractor', trW, trH);
    tr.destroy();
  }

  private createJantarMantarMonument(): void {
    const W = 240;
    const H = 160;
    const m = this.make.graphics({ x: 0, y: 0 });

    m.fillStyle(0x000000, 0.4);
    m.fillEllipse(W / 2, H - 12, W - 20, 30);

    // Terracotta-red masonry base
    m.fillStyle(0x922b21, 1);
    m.beginPath();
    m.moveTo(10, H - 24);
    m.lineTo(W / 2, 14);
    m.lineTo(W - 10, H - 24);
    m.lineTo(W - 10, H - 12);
    m.lineTo(10, H - 12);
    m.closePath();
    m.fillPath();

    m.fillStyle(0xc0392b, 1);
    m.beginPath();
    m.moveTo(20, H - 24);
    m.lineTo(W / 2, 18);
    m.lineTo(W / 2 + 18, 18);
    m.lineTo(W - 30, H - 24);
    m.closePath();
    m.fillPath();

    m.fillStyle(0x641e16, 1);
    m.fillRoundedRect(W / 2 - 32, H - 46, 22, 26, 11);
    m.fillRoundedRect(W / 2 + 10, H - 46, 22, 26, 11);

    m.lineStyle(2, 0xfadbd8, 0.9);
    for (let i = 0; i < 9; i++) {
      const x1 = 40 + i * 16;
      const y1 = H - 26 - i * 12;
      m.lineBetween(x1, y1, x1 + 10, y1 - 5);
    }

    m.lineStyle(2.5, 0xffffff, 1);
    m.lineBetween(W / 2 + 9, 18, W / 2 + 9, -2);
    m.fillStyle(0xff9933, 1);
    m.fillRect(W / 2 + 9, -2, 20, 5);
    m.fillStyle(0xffffff, 1);
    m.fillRect(W / 2 + 9, 3, 20, 5);
    m.fillStyle(0x138808, 1);
    m.fillRect(W / 2 + 9, 8, 20, 5);

    m.generateTexture('jantar_mantar_monument', W, H);
    m.destroy();
  }

  private createPropsAndParticles(): void {
    const media = this.make.graphics({ x: 0, y: 0 });
    media.fillStyle(0x000000, 0.35);
    media.fillEllipse(22, 50, 20, 9);
    media.fillStyle(0x8e44ad, 1);
    media.fillRoundedRect(14, 20, 16, 22, 4);
    media.fillStyle(0xf5cba7, 1);
    media.fillCircle(22, 14, 8);
    media.lineStyle(2, 0x111111, 1);
    media.lineBetween(28, 26, 38, 14);
    media.fillStyle(0xe74c3c, 1);
    media.fillCircle(38, 14, 5);
    media.generateTexture('prop_media', 46, 56);
    media.destroy();

    const gas = this.make.graphics({ x: 0, y: 0 });
    gas.fillStyle(0xecf0f1, 0.75);
    gas.fillCircle(18, 18, 16);
    gas.fillStyle(0xbdc3c7, 0.55);
    gas.fillCircle(14, 14, 10);
    gas.fillCircle(22, 16, 11);
    gas.generateTexture('fx_tear_gas', 36, 36);
    gas.destroy();

    const water = this.make.graphics({ x: 0, y: 0 });
    water.fillStyle(0x00e5ff, 0.85);
    water.fillCircle(12, 12, 10);
    water.fillStyle(0xffffff, 0.95);
    water.fillCircle(10, 10, 5);
    water.generateTexture('fx_water', 24, 24);
    water.destroy();

    const sw = this.make.graphics({ x: 0, y: 0 });
    sw.lineStyle(4, 0xffffff, 0.95);
    sw.strokeCircle(50, 50, 46);
    sw.lineStyle(2, 0xf2a900, 0.8);
    sw.strokeCircle(50, 50, 38);
    sw.generateTexture('fx_shockwave', 100, 100);
    sw.destroy();

    const dust = this.make.graphics({ x: 0, y: 0 });
    dust.fillStyle(0xdcdde1, 0.45);
    dust.fillCircle(8, 8, 7);
    dust.generateTexture('fx_dust', 16, 16);
    dust.destroy();

    const confS = this.make.graphics({ x: 0, y: 0 });
    confS.fillStyle(0xff9933, 1);
    confS.fillRect(0, 0, 8, 5);
    confS.generateTexture('confetti_saffron', 8, 5);
    confS.destroy();

    const confW = this.make.graphics({ x: 0, y: 0 });
    confW.fillStyle(0xffffff, 1);
    confW.fillRect(0, 0, 8, 5);
    confW.generateTexture('confetti_white', 8, 5);
    confW.destroy();

    const confG = this.make.graphics({ x: 0, y: 0 });
    confG.fillStyle(0x138808, 1);
    confG.fillRect(0, 0, 8, 5);
    confG.generateTexture('confetti_green', 8, 5);
    confG.destroy();
  }

  private createPowerUps(): void {
    const W = 40;
    const H = 36;

    const langar = this.make.graphics({ x: 0, y: 0 });
    langar.fillStyle(0x000000, 0.35);
    langar.fillEllipse(W / 2, H - 3, 26, 8);
    langar.fillStyle(0x192a56, 1);
    langar.fillRoundedRect(4, 10, W - 8, 20, 3);
    langar.fillStyle(0xe84118, 1);
    langar.fillRect(4, 10, W - 8, 6);
    langar.fillStyle(0xfbc531, 1);
    langar.fillCircle(W / 2, 20, 5);
    langar.generateTexture('loot_langar', W, H);
    langar.destroy();

    const mega = this.make.graphics({ x: 0, y: 0 });
    mega.fillStyle(0x000000, 0.35);
    mega.fillEllipse(W / 2, H - 3, 26, 8);
    mega.fillStyle(0xf39c12, 1);
    mega.fillRoundedRect(4, 10, W - 8, 20, 3);
    mega.fillStyle(0xffffff, 1);
    mega.fillRect(4, 10, W - 8, 6);
    mega.fillStyle(0x2c3e50, 1);
    mega.fillCircle(W / 2, 20, 6);
    mega.generateTexture('loot_megaphone', W, H);
    mega.destroy();

    const armor = this.make.graphics({ x: 0, y: 0 });
    armor.fillStyle(0x000000, 0.35);
    armor.fillEllipse(W / 2, H - 3, 26, 8);
    armor.fillStyle(0x2f3640, 1);
    armor.fillRoundedRect(4, 10, W - 8, 20, 3);
    armor.fillStyle(0x4cd137, 1);
    armor.fillRect(8, 14, W - 16, 7);
    armor.generateTexture('loot_armor', W, H);
    armor.destroy();
  }
}
