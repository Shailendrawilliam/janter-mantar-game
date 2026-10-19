import Phaser from 'phaser';
import { LEVELS, type LevelConfig } from '../config/levelData';
import { ROAD_BOUNDS } from '../config/constants';
import { InputHandler } from '../core/InputHandler';
import { SoundSystem } from '../core/SoundSystem';
import { SpeechVoiceSystem } from '../core/SpeechVoiceSystem';
import { Player } from '../entities/Player';
import { CrowdMember } from '../entities/CrowdMember';
import { PoliceOfficer } from '../entities/PoliceOfficer';
import { Barricade } from '../entities/Barricade';
import { Vehicle } from '../entities/Vehicle';
import { MediaCrew } from '../entities/MediaCrew';
import { PowerUp, type PowerUpType } from '../entities/PowerUp';
import { RallyTractor } from '../entities/Tractor';
import { ShockwaveRing } from '../entities/Shockwave';
import { TearGasHazard, WaterJetHazard } from '../entities/Hazards';
import { SaveManager } from '../core/SaveManager';
import type { UIScene, MinimapEntity } from './UIScene';

export class GameScene extends Phaser.Scene {
  private levelIndex = 0;
  private config!: LevelConfig;
  private inputHandler!: InputHandler;
  private soundSystem!: SoundSystem;
  private speechSystem!: SpeechVoiceSystem;

  // Entities
  private player!: Player;
  private crowd: CrowdMember[] = [];
  private police: PoliceOfficer[] = [];
  private barricades: Barricade[] = [];
  private vehicles: Vehicle[] = [];
  private mediaCrews: MediaCrew[] = [];
  private powerUps: PowerUp[] = [];
  private tractors: RallyTractor[] = [];
  private tearGasHazards: TearGasHazard[] = [];
  private waterJets: WaterJetHazard[] = [];
  private finishMonument!: Phaser.GameObjects.Sprite;

  // State & Ultimate
  private barricadesBreached = 0;
  private isGameOver = false;
  private isVictory = false;
  private tearGasTimer = 0;
  private jammerActive = false;

  private morale = 25;
  private isMassRushActive = false;
  private massRushTimer = 0;
  private activeBuff = '';
  private buffTimer = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { levelIndex?: number }): void {
    this.levelIndex = data.levelIndex ?? 0;
    this.config = LEVELS[this.levelIndex] || LEVELS[0];
    this.crowd = [];
    this.police = [];
    this.barricades = [];
    this.vehicles = [];
    this.mediaCrews = [];
    this.powerUps = [];
    this.tractors = [];
    this.tearGasHazards = [];
    this.waterJets = [];
    this.barricadesBreached = 0;
    this.isGameOver = false;
    this.isVictory = false;
    this.tearGasTimer = 0;
    this.jammerActive = false;
    this.morale = 25;
    this.isMassRushActive = false;
    this.massRushTimer = 0;
    this.activeBuff = '';
    this.buffTimer = 0;
  }

  create(): void {
    this.soundSystem = SoundSystem.getInstance();
    this.speechSystem = SpeechVoiceSystem.getInstance();
    this.inputHandler = new InputHandler(this);

    this.scene.launch('UIScene', { inputHandler: this.inputHandler });

    this.buildDelhiBoulevard();

    const startY = this.config.roadLength - 250;
    this.player = new Player(this, ROAD_BOUNDS.CENTER_X, startY);

    for (let i = 0; i < 2; i++) {
      const offsetX = i === 0 ? -40 : 40;
      const c = new CrowdMember(this, ROAD_BOUNDS.CENTER_X + offsetX, startY + 30, i);
      c.recruit(offsetX, 30);
      this.crowd.push(c);
    }

    this.spawnEntities();

    const totalH = this.config.roadLength + 400;
    this.cameras.main.setBounds(0, 0, 1024, totalH);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.showComicSpeechBubble(ROAD_BOUNDS.CENTER_X, startY - 45, 'चलो जंतर मंतर!', '#f2a900');
  }

  private buildDelhiBoulevard(): void {
    const totalH = this.config.roadLength + 400;

    // 1. West Sidewalk (Left side: 0 to 250)
    const westSidewalk = this.add.tileSprite(125, totalH / 2, 250, totalH, 'sidewalk_tile');
    westSidewalk.setDepth(-1000);

    // 2. East Sidewalk (Right side: 774 to 1024)
    const eastSidewalk = this.add.tileSprite(899, totalH / 2, 250, totalH, 'sidewalk_tile');
    eastSidewalk.setDepth(-1000);

    // 3. West Delhi Curb (Yellow & Black stripes along Left edge of road)
    const westCurb = this.add.tileSprite(ROAD_BOUNDS.ROAD_LEFT_X, totalH / 2, 12, totalH, 'delhi_curb_v');
    westCurb.setDepth(-995);

    // 4. East Delhi Curb (Yellow & Black stripes along Right edge of road)
    const eastCurb = this.add.tileSprite(ROAD_BOUNDS.ROAD_RIGHT_X, totalH / 2, 12, totalH, 'delhi_curb_v');
    eastCurb.setDepth(-995);

    // 5. Asphalt Central Road (4 Lanes: width 524, centered at 512)
    const road = this.add.tileSprite(ROAD_BOUNDS.CENTER_X, totalH / 2, ROAD_BOUNDS.ROAD_WIDTH, totalH, 'road_asphalt');
    road.setDepth(-990);

    // 6. Vertical Lane Dividers (Dashed yellow stripes dividing 4 lanes)
    const dividersX = [ROAD_BOUNDS.ROAD_LEFT_X + 131, ROAD_BOUNDS.CENTER_X, ROAD_BOUNDS.ROAD_RIGHT_X - 131];
    dividersX.forEach((dx) => {
      for (let y = 140; y < totalH; y += 96) {
        const stripe = this.add.image(dx, y, 'road_lane_stripe_v');
        stripe.setDepth(-985);
      }
    });

    // 7. Horizontal Zebra Crossings across the road
    const zebra1 = this.add.image(ROAD_BOUNDS.CENTER_X, this.config.roadLength - 380, 'zebra_crossing_h');
    zebra1.setDepth(-980);
    const zebra2 = this.add.image(ROAD_BOUNDS.CENTER_X, totalH * 0.45, 'zebra_crossing_h');
    zebra2.setDepth(-980);
    const zebra3 = this.add.image(ROAD_BOUNDS.CENTER_X, ROAD_BOUNDS.FINISH_Y + 160, 'zebra_crossing_h');
    zebra3.setDepth(-980);

    // 8. Sidewalk Trees and Delhi Street Lamps
    for (let y = 100; y < totalH; y += 180) {
      const treeW = this.add.image(110, y, 'delhi_tree');
      treeW.setOrigin(0.5, 0.9);
      treeW.setDepth(y * 10);

      const treeE = this.add.image(914, y + 90, 'delhi_tree');
      treeE.setOrigin(0.5, 0.9);
      treeE.setDepth((y + 90) * 10);

      if (y % 360 === 0) {
        const lampW = this.add.image(220, y + 30, 'street_lamp');
        lampW.setOrigin(0.5, 0.95);
        lampW.setDepth((y + 30) * 10);

        const lampE = this.add.image(804, y + 210, 'street_lamp');
        lampE.setOrigin(0.5, 0.95);
        lampE.setDepth((y + 210) * 10);
      }
    }

    // 9. Jantar Mantar Monument at the TOP (North Destination)
    if (!this.config.isEndless) {
      this.finishMonument = this.add.sprite(ROAD_BOUNDS.CENTER_X, ROAD_BOUNDS.FINISH_Y - 40, 'jantar_mantar_monument');
      this.finishMonument.setOrigin(0.5, 0.85);
      this.finishMonument.setDepth(ROAD_BOUNDS.FINISH_Y * 10 + 5);

      const bannerText = this.add.text(
        ROAD_BOUNDS.CENTER_X,
        ROAD_BOUNDS.FINISH_Y - 150,
        '★ JANTAR MANTAR PROTEST STAGE ★',
        {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '22px',
          fontStyle: 'bold',
          color: '#f2a900',
          backgroundColor: '#922b21',
          padding: { x: 16, y: 8 },
        }
      ).setOrigin(0.5);
      bannerText.setDepth(20000);
    }
  }

  private spawnEntities(): void {
    const startY = this.config.roadLength - 250;
    const finishY = ROAD_BOUNDS.FINISH_Y + 250;
    const marchSpan = startY - finishY;
    const lanesX = [ROAD_BOUNDS.ROAD_LEFT_X + 65, ROAD_BOUNDS.CENTER_X, ROAD_BOUNDS.ROAD_RIGHT_X - 65];

    // Barricade rows across lanes
    const barricadeInterval = marchSpan / (this.config.barricadeCount + 1);
    for (let i = 1; i <= this.config.barricadeCount; i++) {
      const by = startY - i * barricadeInterval;
      lanesX.forEach((bx) => {
        const b = new Barricade(this, bx, by, this.config.barricadeTiers);
        this.barricades.push(b);
      });
    }

    // Citizens / Bystanders on Sidewalks
    for (let i = 0; i < this.config.bystanderCount; i++) {
      const isWest = Math.random() < 0.5;
      const bx = isWest ? Phaser.Math.Between(100, 210) : Phaser.Math.Between(814, 924);
      const by = Phaser.Math.Between(ROAD_BOUNDS.FINISH_Y + 80, startY + 50);
      const bystander = new CrowdMember(this, bx, by, i);
      this.crowd.push(bystander);
    }

    // Police patrols
    for (let i = 0; i < this.config.policeCount; i++) {
      const px = Phaser.Math.Between(ROAD_BOUNDS.ROAD_LEFT_X + 30, ROAD_BOUNDS.ROAD_RIGHT_X - 30);
      const py = Phaser.Math.Between(ROAD_BOUNDS.FINISH_Y + 150, startY - 100);
      const isRiot = this.config.difficulty === 'HARD' || (this.config.difficulty === 'MID' && i % 2 === 0);
      const cop = new PoliceOfficer(this, px, py, isRiot ? 'RIOT' : 'CONSTABLE');
      this.police.push(cop);
    }

    // DTC Buses crossing horizontally across intersections
    for (let i = 0; i < this.config.dtcBusCount; i++) {
      const vy = startY - 380 - i * 550;
      const bus = new Vehicle(this, 350, vy, 'DTC', 'X', 240, 784);
      this.vehicles.push(bus);
    }

    // Auto-Rickshaws zipping horizontally or dodging
    for (let i = 0; i < this.config.autoRickshawCount; i++) {
      const ay = startY - 200 - i * 400;
      const auto = new Vehicle(this, 600, ay, 'AUTO', 'X', 250, 770);
      this.vehicles.push(auto);
    }

    // Vajra Water Cannon Truck
    if (this.config.hasWaterCannon) {
      const vajra1 = new Vehicle(this, ROAD_BOUNDS.CENTER_X, startY - marchSpan * 0.5, 'VAJRA', 'X', 320, 700);
      const vajra2 = new Vehicle(this, ROAD_BOUNDS.CENTER_X, startY - marchSpan * 0.8, 'VAJRA', 'X', 320, 700);
      this.vehicles.push(vajra1, vajra2);
    }

    // Jammer Van on curb
    if (this.config.hasInternetJammer) {
      const jammer = new Vehicle(this, 230, startY - marchSpan * 0.45, 'JAMMER', 'X', 210, 260);
      this.vehicles.push(jammer);
    }

    // Media News Crews along sidewalks
    for (let i = 0; i < this.config.mediaCrewsCount; i++) {
      const isWest = i % 2 === 0;
      const mx = isWest ? 180 : 844;
      const my = startY - 250 - i * 600;
      const media = new MediaCrew(this, mx, my);
      this.mediaCrews.push(media);
    }

    // Power-up loot crates
    const powerTypes: PowerUpType[] = ['LANGAR', 'MEGAPHONE', 'ARMOR'];
    for (let i = 0; i < 7; i++) {
      const px = lanesX[i % lanesX.length] + Phaser.Math.Between(-25, 25);
      const py = startY - 220 - i * 420;
      const pu = new PowerUp(this, px, py, powerTypes[i % powerTypes.length]);
      this.powerUps.push(pu);
    }
  }

  update(_time: number, delta: number): void {
    if (this.isGameOver || this.isVictory) return;

    const input = this.inputHandler.getInput();
    const dt = delta / 1000;

    if ((input.vx !== 0 || input.vy !== 0) && !this.soundSystem.isDholakPlaying) {
      this.soundSystem.startDholakBeat();
    }

    if (this.buffTimer > 0) {
      this.buffTimer -= dt;
      if (this.buffTimer <= 0) {
        this.activeBuff = '';
      }
    }

    if (this.isMassRushActive) {
      this.massRushTimer -= dt;
      if (this.massRushTimer <= 0) {
        this.isMassRushActive = false;
        const uiScene = this.scene.get('UIScene') as UIScene;
        if (uiScene?.addEventFeedItem) {
          uiScene.addEventFeedItem('⚡ Mass Rush ended, Kafila regrouping.', '#bdc3c7');
        }
      }
    }

    if (input.massRush && this.morale >= 100 && !this.isMassRushActive) {
      this.activateMassRush();
    }

    const speedMultiplier = this.isMassRushActive ? 1.6 : this.activeBuff === 'LANGAR' ? 1.4 : 1.0;
    this.player.updateMovement(input.vx * speedMultiplier, input.vy * speedMultiplier, delta, input.sprint);

    if (input.chant && this.player.chantCooldown <= 0) {
      this.triggerChant();
    }

    const followingCrowd = this.crowd.filter((c) => c.state === 'FOLLOWING');
    const crowdCount = followingCrowd.length + 1;

    this.updateCrowdMembers(delta, followingCrowd.length);
    this.updatePolice(delta, crowdCount);
    this.updateTractors(delta);
    this.updateBarricades(crowdCount);
    this.updateVehiclesAndHazards(delta);
    this.updateMediaCrews();
    this.updatePowerUps();
    this.checkVictory(crowdCount);

    // Prepare Radar Minimap
    const minimapEntities: MinimapEntity[] = [
      { x: 0, y: 0, type: 'player' },
      { x: ROAD_BOUNDS.CENTER_X - this.player.x, y: ROAD_BOUNDS.FINISH_Y - this.player.y, type: 'target' },
    ];

    this.crowd.forEach((c) => {
      const rx = c.x - this.player.x;
      const ry = c.y - this.player.y;
      if (Math.hypot(rx, ry) < 550) {
        minimapEntities.push({ x: rx, y: ry, type: c.state === 'FOLLOWING' ? 'crowd' : 'bystander' });
      }
    });

    this.police.forEach((p) => {
      const rx = p.x - this.player.x;
      const ry = p.y - this.player.y;
      if (Math.hypot(rx, ry) < 550) {
        minimapEntities.push({ x: rx, y: ry, type: 'police' });
      }
    });

    this.barricades.forEach((b) => {
      if (!b.isBreached) {
        const rx = b.x - this.player.x;
        const ry = b.y - this.player.y;
        if (Math.hypot(rx, ry) < 550) {
          minimapEntities.push({ x: rx, y: ry, type: 'barricade' });
        }
      }
    });

    this.tractors.forEach((tr) => {
      if (!tr.isFinished) {
        const rx = tr.x - this.player.x;
        const ry = tr.y - this.player.y;
        if (Math.hypot(rx, ry) < 550) {
          minimapEntities.push({ x: rx, y: ry, type: 'tractor' });
        }
      }
    });

    this.powerUps.forEach((pu) => {
      if (!pu.isCollected) {
        const rx = pu.x - this.player.x;
        const ry = pu.y - this.player.y;
        if (Math.hypot(rx, ry) < 550) {
          minimapEntities.push({ x: rx, y: ry, type: 'loot' });
        }
      }
    });

    const startY = this.config.roadLength - 250;
    const distanceRem = Math.max(0, this.player.y - ROAD_BOUNDS.FINISH_Y);
    const totalDist = startY - ROAD_BOUNDS.FINISH_Y;
    const progress = Phaser.Math.Clamp(1 - (distanceRem / totalDist), 0, 1);

    const uiScene = this.scene.get('UIScene') as UIScene;
    if (uiScene && uiScene.updateHUD) {
      uiScene.updateHUD(
        crowdCount,
        this.config.minCrowdForVictory,
        progress,
        distanceRem,
        this.player.detentionMeter / this.player.maxDetention,
        this.player.getSprintRatio(),
        this.morale / 100,
        this.activeBuff,
        this.jammerActive,
        this.player.headingAngle,
        minimapEntities
      );
    }

    if (this.player.detentionMeter >= this.player.maxDetention) {
      this.soundSystem.stopDholakBeat();
      this.triggerGameOver('Leader encircled and detained under Section 144.');
    }
  }

  public summonRallyTractor(): void {
    const tr = new RallyTractor(this, this.player.x, this.player.y - 45);
    this.tractors.push(tr);
    this.speechSystem.speakTractor();
    this.soundSystem.playMassRushAlarm();
    this.showComicSpeechBubble(tr.x, tr.y - 45, '🚜 RALLY TRACTOR AAGE BADHAO!', '#27ae60', 14);

    const uiScene = this.scene.get('UIScene') as UIScene;
    if (uiScene?.addEventFeedItem) {
      uiScene.addEventFeedItem('🚜 Rally Tractor summoned as Battering Ram!', '#2ecc71');
    }
  }

  private updateTractors(delta: number): void {
    this.tractors = this.tractors.filter((tr) => {
      const active = tr.updateTractor(delta);
      if (active) {
        // Tractor rams and obliterates barricades on contact
        this.barricades.forEach((b) => {
          if (!b.isBreached && Math.hypot(b.x - tr.x, b.y - tr.y) < 55) {
            b.damage(999);
            this.soundSystem.playHeavyBarricadeSmash();
            this.barricadesBreached++;
            this.cameras.main.shake(200, 0.008);
            new ShockwaveRing(this, b.x, b.y, 0x27ae60);
            this.showComicSpeechBubble(b.x, b.y - 35, '🚜 RAMMED BY TRACTOR!', '#27ae60', 14);
          }
        });
      }
      return active;
    });
  }

  private activateMassRush(): void {
    this.morale = 0;
    this.isMassRushActive = true;
    this.massRushTimer = 6.0;

    this.soundSystem.playMassRushAlarm();
    this.speechSystem.speakSlogan('इंक़लाब ज़िन्दाबाद! सब लोग आगे बढ़ो!');
    this.cameras.main.flash(350, 242, 169, 0);
    this.cameras.main.shake(350, 0.012);

    new ShockwaveRing(this, this.player.x, this.player.y, 0xff7700);

    const uiScene = this.scene.get('UIScene') as UIScene;
    if (uiScene?.addEventFeedItem) {
      uiScene.addEventFeedItem('🔥 MASS RUSH ACTIVATED! UNSTOPPABLE WAVE!', '#ff3b30');
    }

    this.showComicSpeechBubble(this.player.x, this.player.y - 45, '🔥 MASS RUSH! INQUILAB! 🔥', '#ff3b30');
  }

  private triggerChant(): void {
    this.player.chantCooldown = 1.3;
    this.morale = Math.min(100, this.morale + 15);

    this.soundSystem.playChantShockwave();
    new ShockwaveRing(this, this.player.x, this.player.y, 0xf2a900);

    const slogans = [
      'चलो जंतर मंतर!',
      'आज़ादी!',
      'हम होंगे कामयाब!',
      'इंक़लाब ज़िन्दाबाद!',
      'हमारी माँगें पूरी करो!',
    ];
    const slogan = Phaser.Utils.Array.GetRandom(slogans);
    this.showComicSpeechBubble(this.player.x, this.player.y - 45, slogan, '#f2a900');

    // Real Hindi Speech
    this.speechSystem.speakSlogan(slogan);

    const uiScene = this.scene.get('UIScene') as UIScene;
    if (uiScene?.addEventFeedItem) {
      uiScene.addEventFeedItem(`📢 Chanted: "${slogan}"`, '#f2a900');
    }

    const recruitRadius = this.activeBuff === 'MEGAPHONE' ? 260 : 160;
    this.crowd.forEach((member) => {
      if (member.state === 'BYSTANDER') {
        const dist = Math.hypot(member.x - this.player.x, member.y - this.player.y);
        if (dist < recruitRadius) {
          this.recruitBystander(member);
        }
      }
    });

    this.cameras.main.shake(140, 0.005);
  }

  private updateCrowdMembers(delta: number, currentFollowers: number): void {
    this.crowd.forEach((member) => {
      if (member.state === 'BYSTANDER') {
        const dist = Math.hypot(member.x - this.player.x, member.y - this.player.y);
        if (dist < 55) {
          this.recruitBystander(member);
        }
      }
      member.updateCrowd(this.player.x, this.player.y, delta);
    });

    if (currentFollowers > 10 && this.player.detentionMeter > 0) {
      this.player.adjustDetention(-delta * 0.015);
    }
  }

  private recruitBystander(member: CrowdMember): void {
    const following = this.crowd.filter((c) => c.state === 'FOLLOWING').length;
    const angle = (following * 137.5 * Math.PI) / 180;
    const radius = 26 + Math.sqrt(following) * 14;
    const offX = Math.cos(angle) * radius;
    const offY = Math.sin(angle) * (radius * 0.75);

    member.recruit(offX, offY);
    this.soundSystem.playRecruit();
    this.morale = Math.min(100, this.morale + 5);

    this.showComicSpeechBubble(member.x, member.y - 40, '+1 CITIZEN', '#2ecc71', 11);

    const uiScene = this.scene.get('UIScene') as UIScene;
    if (uiScene?.addEventFeedItem && Math.random() < 0.3) {
      uiScene.addEventFeedItem('👥 Citizen joined the Kafila!', '#2ecc71');
    }
  }

  private updatePolice(delta: number, crowdCount: number): void {
    let someoneDetaining = false;

    this.police.forEach((cop) => {
      if (this.isMassRushActive) {
        const distToPlayer = Math.hypot(cop.x - this.player.x, cop.y - this.player.y);
        if (distToPlayer < 75) {
          const pushAngle = Math.atan2(cop.y - this.player.y, cop.x - this.player.x);
          cop.applyCrowdPush(pushAngle, 45);
          this.showComicSpeechBubble(cop.x, cop.y - 40, 'अरे पीछे हटो!', '#f2a900', 11);
          return;
        }
      }

      const { detaining, blewWhistle } = cop.updateAI(this.player.x, this.player.y, crowdCount, delta);

      if (blewWhistle && Math.random() < 0.2) {
        this.soundSystem.playPoliceWhistle();
        this.speechSystem.speakPoliceWarning();
        const uiScene = this.scene.get('UIScene') as UIScene;
        if (uiScene?.addEventFeedItem && Math.random() < 0.15) {
          uiScene.addEventFeedItem('👮 Police warning: Section 144 enforced!', '#ff3b30');
        }
      }

      if (detaining && !this.isMassRushActive) {
        someoneDetaining = true;
        const crowdProtection = Math.min(0.85, (crowdCount - 1) * 0.06);
        const detentionRate = 28 * (1 - crowdProtection);
        this.player.adjustDetention((delta / 1000) * detentionRate);

        if (crowdCount > 6) {
          const pushAngle = Math.atan2(cop.y - this.player.y, cop.x - this.player.x);
          cop.applyCrowdPush(pushAngle, 22);
        }
      }
    });

    if (!someoneDetaining && this.player.detentionMeter > 0) {
      this.player.adjustDetention(-((delta / 1000) * 10));
    }
  }

  private updateBarricades(crowdCount: number): void {
    this.barricades.forEach((b) => {
      if (b.isBreached) return;

      const dist = Math.hypot(b.x - this.player.x, b.y - this.player.y);
      if (dist < 46) {
        if (this.isMassRushActive) {
          b.damage(999);
          this.soundSystem.playHeavyBarricadeSmash();
          this.barricadesBreached++;
          this.cameras.main.shake(260, 0.012);
          this.showComicSpeechBubble(b.x, b.y - 35, '💥 CHAKNACHOOR!', '#ff3b30', 15);
          new ShockwaveRing(this, b.x, b.y, 0xff3b30);
          return;
        }

        const requiredCrowd = b.tier === 1 ? 5 : b.tier === 2 ? 12 : 20;

        if (crowdCount >= requiredCrowd || this.player.isSprinting) {
          const dmg = (crowdCount * 12) + (this.player.isSprinting ? 25 : 0);
          const breached = b.damage(dmg);
          this.soundSystem.playHeavyBarricadeSmash();

          if (breached) {
            this.barricadesBreached++;
            this.cameras.main.shake(220, 0.009);
            this.showComicSpeechBubble(b.x, b.y - 35, 'BARRICADE DEMOLISHED!', '#f2a900', 15);
            new ShockwaveRing(this, b.x, b.y, 0xf2a900);

            const uiScene = this.scene.get('UIScene') as UIScene;
            if (uiScene?.addEventFeedItem) {
              uiScene.addEventFeedItem('💥 Delhi Police Barricade DEMOLISHED!', '#f2a900');
            }
          }
        } else {
          this.player.y += 14;
          this.showComicSpeechBubble(b.x, b.y - 35, `NEED ${requiredCrowd}+ CROWD!`, '#ff3b30', 12);
        }
      }
    });
  }

  private updateVehiclesAndHazards(delta: number): void {
    const dt = delta / 1000;
    let nearJammer = false;

    this.vehicles.forEach((v) => {
      const { firesWater } = v.updateVehicle(delta);

      if (firesWater && this.activeBuff !== 'ARMOR') {
        this.soundSystem.playWaterCannon();
        const angle = Math.atan2(this.player.y - v.y, this.player.x - v.x);
        for (let i = -1; i <= 1; i++) {
          const jet = new WaterJetHazard(this, v.x, v.y, angle + i * 0.18);
          this.waterJets.push(jet);
        }

        const uiScene = this.scene.get('UIScene') as UIScene;
        if (uiScene?.addEventFeedItem) {
          uiScene.addEventFeedItem('🌊 Vajra Water Cannon deployed!', '#00d2ff');
        }
      }

      if (v.vehicleType === 'JAMMER') {
        const dist = Math.hypot(v.x - this.player.x, v.y - this.player.y);
        if (dist < 320) {
          nearJammer = true;
        }
      }
    });

    this.jammerActive = nearJammer;

    if (this.config.hasTearGas && this.activeBuff !== 'ARMOR') {
      this.tearGasTimer += dt;
      if (this.tearGasTimer >= 7.0) {
        this.tearGasTimer = 0;
        const gasX = this.player.x + Phaser.Math.Between(-60, 60);
        const gasY = this.player.y - Phaser.Math.Between(80, 180);
        const gas = new TearGasHazard(this, gasX, gasY);
        this.tearGasHazards.push(gas);
        this.soundSystem.playTearGas();

        const uiScene = this.scene.get('UIScene') as UIScene;
        if (uiScene?.addEventFeedItem) {
          uiScene.addEventFeedItem('⚠️ Tear Gas Shell fired!', '#bdc3c7');
        }
      }
    }

    this.tearGasHazards.forEach((gas) => {
      if (this.activeBuff === 'ARMOR') return;
      this.crowd.forEach((member) => {
        if (member.state === 'FOLLOWING') {
          const dist = Math.hypot(member.x - gas.x, member.y - gas.y);
          if (dist < gas.radius) {
            const pushAngle = Math.atan2(member.y - gas.y, member.x - gas.x);
            member.disperse(pushAngle);
            this.showComicSpeechBubble(member.x, member.y - 35, 'TEAR GAS!', '#bdc3c7', 10);
          }
        }
      });
    });

    this.waterJets = this.waterJets.filter((jet) => {
      const active = jet.update(delta);
      if (active && this.activeBuff !== 'ARMOR') {
        const dist = Math.hypot(jet.x - this.player.x, jet.y - this.player.y);
        if (dist < 30) {
          this.player.y += 30;
          this.cameras.main.shake(120, 0.005);
        }
      }
      return active;
    });
  }

  private updateMediaCrews(): void {
    this.mediaCrews.forEach((media) => {
      if (media.isInteracted) return;

      const dist = Math.hypot(media.x - this.player.x, media.y - this.player.y);
      if (dist < 48) {
        media.interact();
        this.soundSystem.playRecruit();
        this.morale = Math.min(100, this.morale + 30);
        this.showComicSpeechBubble(media.x, media.y - 40, 'LIVE NEWS: +3 PROTESTERS!', '#9b59b6', 14);

        const uiScene = this.scene.get('UIScene') as UIScene;
        if (uiScene?.addEventFeedItem) {
          uiScene.addEventFeedItem('📺 National TV News Coverage: +3 Citizens!', '#9b59b6');
        }

        for (let i = 0; i < 3; i++) {
          const m = new CrowdMember(this, media.x, media.y, i);
          this.recruitBystander(m);
          this.crowd.push(m);
        }
      }
    });
  }

  private updatePowerUps(): void {
    this.powerUps.forEach((pu) => {
      if (pu.isCollected) return;

      const dist = Math.hypot(pu.x - this.player.x, pu.y - this.player.y);
      if (dist < 46) {
        pu.collect();
        this.soundSystem.playLootPickup();

        const uiScene = this.scene.get('UIScene') as UIScene;

        if (pu.powerUpType === 'LANGAR') {
          this.activeBuff = 'LANGAR';
          this.buffTimer = 8.0;
          this.player.sprintEnergy = 100;
          this.showComicSpeechBubble(pu.x, pu.y - 35, '🍵 LANGAR: CHAI-SAMOSA! (SPEED x1.5)', '#f1c40f', 13);
          if (uiScene?.addEventFeedItem) {
            uiScene.addEventFeedItem('🍵 Langar Crate: +100% Boost & Speed!', '#f2a900');
          }
        } else if (pu.powerUpType === 'MEGAPHONE') {
          this.activeBuff = 'MEGAPHONE';
          this.buffTimer = 10.0;
          new ShockwaveRing(this, pu.x, pu.y, 0xf2a900);
          this.showComicSpeechBubble(pu.x, pu.y - 35, '📢 SUPER MEGAPHONE!', '#2ecc71', 14);
          if (uiScene?.addEventFeedItem) {
            uiScene.addEventFeedItem('📢 Tactical Megaphone: Mega Slogan Range!', '#2ecc71');
          }
          this.crowd.forEach((c) => {
            if (c.state === 'BYSTANDER') {
              const d = Math.hypot(c.x - this.player.x, c.y - this.player.y);
              if (d < 240) this.recruitBystander(c);
            }
          });
        } else if (pu.powerUpType === 'ARMOR') {
          this.activeBuff = 'ARMOR';
          this.buffTimer = 10.0;
          this.player.detentionMeter = Math.max(0, this.player.detentionMeter - 50);
          this.showComicSpeechBubble(pu.x, pu.y - 35, '🦺 RIOT SHIELD: HAZARD IMMUNITY!', '#00d2ff', 13);
          if (uiScene?.addEventFeedItem) {
            uiScene.addEventFeedItem('🦺 Level 3 Armor: Immune to Tear Gas & Water!', '#00d2ff');
          }
        }

        // Random chance to also summon Tractor!
        if (Math.random() < 0.35 && this.tractors.length === 0) {
          this.summonRallyTractor();
        }
      }
    });
  }

  private checkVictory(crowdCount: number): void {
    if (this.config.isEndless) return; // Endless rally keeps marching!

    if (this.player.y <= ROAD_BOUNDS.FINISH_Y) {
      if (crowdCount >= this.config.minCrowdForVictory) {
        this.isVictory = true;
        this.soundSystem.stopDholakBeat();
        this.scene.stop('UIScene');
        this.scene.start('VictoryScene', {
          levelIndex: this.levelIndex,
          finalCrowd: crowdCount,
          barricadesBroken: this.barricadesBreached,
        });
      } else {
        this.player.y = ROAD_BOUNDS.FINISH_Y + 18;
        this.showComicSpeechBubble(
          this.player.x,
          this.player.y - 45,
          `NEED ${this.config.minCrowdForVictory}+ PROTESTERS!`,
          '#ff3b30',
          14
        );
      }
    }
  }

  private triggerGameOver(reason: string): void {
    this.isGameOver = true;
    this.soundSystem.stopDholakBeat();
    const finalCrowd = this.crowd.filter((c) => c.state === 'FOLLOWING').length + 1;
    const startY = this.config.roadLength - 250;
    const marchDist = Math.max(0, startY - this.player.y);
    SaveManager.getInstance().updateEndlessScore(marchDist, finalCrowd);

    this.scene.stop('UIScene');
    this.scene.start('GameOverScene', {
      levelIndex: this.levelIndex,
      reason,
    });
  }

  private showComicSpeechBubble(x: number, y: number, text: string, color: string, fontSize = 13): void {
    const container = this.add.container(x, y);

    const txt = this.add.text(0, -6, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: `${fontSize}px`,
      fontStyle: 'bold',
      color,
    }).setOrigin(0.5);

    const pad = 12;
    const bubbleW = txt.width + pad * 2;
    const bubbleH = txt.height + 14;

    const bubble = this.add.graphics();
    bubble.fillStyle(0x0a1018, 0.92);
    bubble.fillRoundedRect(-bubbleW / 2, -bubbleH / 2 - 6, bubbleW, bubbleH, 6);
    bubble.lineStyle(1.5, Phaser.Display.Color.HexStringToColor(color).color, 0.9);
    bubble.strokeRoundedRect(-bubbleW / 2, -bubbleH / 2 - 6, bubbleW, bubbleH, 6);

    bubble.fillStyle(0x0a1018, 0.92);
    bubble.fillTriangle(0, bubbleH / 2 - 6, -5, bubbleH / 2 - 6, 0, bubbleH / 2);

    container.add([bubble, txt]);
    container.setDepth(25000);

    this.tweens.add({
      targets: container,
      y: y - 35,
      alpha: 0,
      duration: 1400,
      ease: 'Quad.easeOut',
      onComplete: () => {
        container.destroy();
      },
    });
  }
}
