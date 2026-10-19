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

    this.player = new Player(this, 120, 390);

    for (let i = 0; i < 2; i++) {
      const c = new CrowdMember(this, 90 - i * 30, 390 + (i === 0 ? -25 : 25), i);
      c.recruit(-30 - i * 25, (i === 0 ? -25 : 25));
      this.crowd.push(c);
    }

    this.spawnEntities();

    this.cameras.main.setBounds(0, 0, this.config.roadLength + 600, 768);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.showComicSpeechBubble(120, 330, 'चलो जंतर मंतर!', '#f2a900');
  }

  private buildDelhiBoulevard(): void {
    const roadLength = this.config.roadLength;
    const totalW = roadLength + 600;

    const northPave = this.add.tileSprite(totalW / 2, 150, totalW, 90, 'sidewalk_tile');
    northPave.setDepth(-1000);

    const northCurb = this.add.tileSprite(totalW / 2, 200, totalW, 12, 'delhi_curb');
    northCurb.setDepth(-995);

    const road = this.add.tileSprite(totalW / 2, 392, totalW, 376, 'road_asphalt');
    road.setDepth(-990);

    const laneY = [298, 392, 486];
    laneY.forEach((ly) => {
      for (let x = 60; x < totalW; x += 96) {
        const stripe = this.add.image(x, ly, 'road_lane_stripe');
        stripe.setDepth(-985);
      }
    });

    const zebra1 = this.add.image(380, 392, 'zebra_crossing');
    zebra1.setDepth(-980);
    const zebra2 = this.add.image(1300, 392, 'zebra_crossing');
    zebra2.setDepth(-980);

    const southCurb = this.add.tileSprite(totalW / 2, 584, totalW, 12, 'delhi_curb');
    southCurb.setDepth(-975);

    const southPave = this.add.tileSprite(totalW / 2, 635, totalW, 90, 'sidewalk_tile');
    southPave.setDepth(-970);

    for (let x = 100; x < roadLength; x += 180) {
      const treeN = this.add.image(x, 150, 'delhi_tree');
      treeN.setOrigin(0.5, 0.9);
      treeN.setDepth(150 * 10);

      const treeS = this.add.image(x + 90, 640, 'delhi_tree');
      treeS.setOrigin(0.5, 0.9);
      treeS.setDepth(640 * 10);

      if (x % 360 === 0) {
        const lamp = this.add.image(x + 40, 185, 'street_lamp');
        lamp.setOrigin(0.5, 0.95);
        lamp.setDepth(185 * 10);
      }
    }

    if (!this.config.isEndless) {
      const finishX = this.config.targetDistance + 160;
      this.finishMonument = this.add.sprite(finishX, 390, 'jantar_mantar_monument');
      this.finishMonument.setOrigin(0.5, 0.85);
      this.finishMonument.setDepth(390 * 10 + 5);

      const bannerText = this.add.text(
        this.config.targetDistance,
        175,
        '★ JANTAR MANTAR PROTEST STAGE ★',
        {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '22px',
          fontStyle: 'bold',
          color: '#f2a900',
          backgroundColor: '#922b21',
          padding: { x: 14, y: 6 },
        }
      ).setOrigin(0.5);
      bannerText.setDepth(20000);
    }
  }

  private spawnEntities(): void {
    const roadLength = this.config.roadLength;
    const laneY = [260, 390, 520];
    const barricadeInterval = (roadLength - 400) / this.config.barricadeCount;

    for (let i = 1; i <= this.config.barricadeCount; i++) {
      const bx = 320 + i * barricadeInterval;
      laneY.forEach((by) => {
        const b = new Barricade(this, bx, by, this.config.barricadeTiers);
        this.barricades.push(b);
      });
    }

    for (let i = 0; i < this.config.bystanderCount; i++) {
      const bx = Phaser.Math.Between(200, roadLength - 200);
      const isNorth = Math.random() < 0.5;
      const by = isNorth ? Phaser.Math.Between(140, 185) : Phaser.Math.Between(595, 640);
      const bystander = new CrowdMember(this, bx, by, i);
      this.crowd.push(bystander);
    }

    for (let i = 0; i < this.config.policeCount; i++) {
      const px = Phaser.Math.Between(450, roadLength - 100);
      const py = Phaser.Math.Between(ROAD_BOUNDS.TOP_Y + 30, ROAD_BOUNDS.BOTTOM_Y - 30);
      const isRiot = this.config.difficulty === 'HARD' || (this.config.difficulty === 'MID' && i % 2 === 0);
      const cop = new PoliceOfficer(this, px, py, isRiot ? 'RIOT' : 'CONSTABLE');
      this.police.push(cop);
    }

    for (let i = 0; i < this.config.dtcBusCount; i++) {
      const vx = 400 + i * 550;
      const vy = i % 2 === 0 ? 260 : 520;
      const bus = new Vehicle(this, vx, vy, 'DTC', vx - 180, vx + 180);
      this.vehicles.push(bus);
    }

    for (let i = 0; i < this.config.autoRickshawCount; i++) {
      const ax = 250 + i * 450;
      const ay = i % 2 === 0 ? 330 : 450;
      const auto = new Vehicle(this, ax, ay, 'AUTO', ax - 120, ax + 120);
      this.vehicles.push(auto);
    }

    if (this.config.hasWaterCannon) {
      const vajra1 = new Vehicle(this, roadLength * 0.55, 390, 'VAJRA', roadLength * 0.5, roadLength * 0.65);
      const vajra2 = new Vehicle(this, roadLength * 0.85, 390, 'VAJRA', roadLength * 0.8, roadLength * 0.95);
      this.vehicles.push(vajra1, vajra2);
    }

    if (this.config.hasInternetJammer) {
      const jammer = new Vehicle(this, roadLength * 0.45, 230, 'JAMMER');
      this.vehicles.push(jammer);
    }

    for (let i = 0; i < this.config.mediaCrewsCount; i++) {
      const mx = 350 + i * 650;
      const my = i % 2 === 0 ? 170 : 610;
      const media = new MediaCrew(this, mx, my);
      this.mediaCrews.push(media);
    }

    // Power-up loot crates including Tractor and N95 Mask!
    const powerTypes: PowerUpType[] = ['LANGAR', 'MEGAPHONE', 'ARMOR'];
    for (let i = 0; i < 7; i++) {
      const px = 350 + i * 450 + Phaser.Math.Between(-30, 30);
      const py = Phaser.Math.Between(260, 520);
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
      { x: this.config.targetDistance - this.player.x, y: 390 - this.player.y, type: 'target' },
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

    const distanceRem = this.config.targetDistance - this.player.x;
    const progress = this.player.x / this.config.targetDistance;
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
    const tr = new RallyTractor(this, this.player.x + 40, this.player.y);
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
          this.player.x -= 12;
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
        const gasX = this.player.x + Phaser.Math.Between(90, 210);
        const gasY = this.player.y + Phaser.Math.Between(-70, 70);
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
          this.player.x -= 30;
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

    if (this.player.x >= this.config.targetDistance) {
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
        this.player.x = this.config.targetDistance - 18;
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
    SaveManager.getInstance().updateEndlessScore(this.player.x, finalCrowd);

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
