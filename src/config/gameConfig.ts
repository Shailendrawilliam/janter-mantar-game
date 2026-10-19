import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import { BootScene } from '../scenes/BootScene';
import { MenuScene } from '../scenes/MenuScene';
import { LevelSelectScene } from '../scenes/LevelSelectScene';
import { GameScene } from '../scenes/GameScene';
import { UIScene } from '../scenes/UIScene';
import { VictoryScene } from '../scenes/VictoryScene';
import { GameOverScene } from '../scenes/GameOverScene';

export const createGameConfig = (parent: HTMLElement | string): Phaser.Types.Core.GameConfig => {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    input: {
      activePointers: 3, // Multi-touch support for iOS / Mobile devices
    },
    backgroundColor: '#0e141a',
    scene: [
      BootScene,
      MenuScene,
      LevelSelectScene,
      GameScene,
      UIScene,
      VictoryScene,
      GameOverScene,
    ],
  };
};
