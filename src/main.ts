import Phaser from 'phaser';
import './style.css';
import { createGameConfig } from './config/gameConfig';

window.addEventListener('DOMContentLoaded', () => {
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    const config = createGameConfig(gameContainer);
    new Phaser.Game(config);
  }
});
