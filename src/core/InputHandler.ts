import Phaser from 'phaser';

export interface MovementInput {
  vx: number;
  vy: number;
  sprint: boolean;
  chant: boolean;
  massRush: boolean;
  bail: boolean;
  foodOrder: boolean;
}

export class InputHandler {
  private scene: Phaser.Scene;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    SHIFT: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
    C: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
    Q: Phaser.Input.Keyboard.Key;
    B: Phaser.Input.Keyboard.Key;
    F: Phaser.Input.Keyboard.Key;
  };

  // Virtual touch controls state
  public touchVx = 0;
  public touchVy = 0;
  public touchSprint = false;
  public touchChant = false;
  public touchMassRush = false;
  public touchBail = false;
  public touchFoodOrder = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    if (this.scene.input.keyboard) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        SHIFT: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
        SPACE: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        C: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C),
        E: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        Q: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
        B: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B),
        F: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
      };
    }
  }

  public getInput(): MovementInput {
    let vx = 0;
    let vy = 0;
    let sprint = false;
    let chant = false;
    let massRush = false;
    let bail = false;
    let foodOrder = false;

    // Keyboard controls
    if (this.wasd && this.cursors) {
      if (this.wasd.A.isDown || this.cursors.left.isDown) vx -= 1;
      if (this.wasd.D.isDown || this.cursors.right.isDown) vx += 1;
      if (this.wasd.W.isDown || this.cursors.up.isDown) vy -= 1;
      if (this.wasd.S.isDown || this.cursors.down.isDown) vy += 1;

      if (this.wasd.SHIFT.isDown) {
        sprint = true;
      }
      if (
        Phaser.Input.Keyboard.JustDown(this.wasd.SPACE) ||
        Phaser.Input.Keyboard.JustDown(this.wasd.C) ||
        Phaser.Input.Keyboard.JustDown(this.wasd.E)
      ) {
        chant = true;
      }
      if (Phaser.Input.Keyboard.JustDown(this.wasd.Q)) {
        massRush = true;
      }
      if (Phaser.Input.Keyboard.JustDown(this.wasd.B)) {
        bail = true;
      }
      if (Phaser.Input.Keyboard.JustDown(this.wasd.F)) {
        foodOrder = true;
      }
    }

    // Touch controls merge
    if (Math.abs(this.touchVx) > 0.1 || Math.abs(this.touchVy) > 0.1) {
      vx = this.touchVx;
      vy = this.touchVy;
    }
    if (this.touchSprint) {
      sprint = true;
    }
    if (this.touchChant) {
      chant = true;
      this.touchChant = false;
    }
    if (this.touchMassRush) {
      massRush = true;
      this.touchMassRush = false;
    }
    if (this.touchBail) {
      bail = true;
      this.touchBail = false;
    }
    if (this.touchFoodOrder) {
      foodOrder = true;
      this.touchFoodOrder = false;
    }

    return { vx, vy, sprint, chant, massRush, bail, foodOrder };
  }
}
