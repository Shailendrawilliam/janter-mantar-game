import { DIFFICULTY, type DifficultyLevel } from './constants';

export interface LevelConfig {
  id: number;
  key: string;
  name: string;
  subtitle: string;
  difficulty: DifficultyLevel | 'ENDLESS';
  difficultyLabel: string;
  roadLength: number;
  roadWidth: number;
  minCrowdForVictory: number;
  targetDistance: number;
  barricadeCount: number;
  barricadeTiers: number;
  bystanderCount: number;
  policeCount: number;
  hasTearGas: boolean;
  hasWaterCannon: boolean;
  hasInternetJammer: boolean;
  hasTrafficJam: boolean;
  dtcBusCount: number;
  autoRickshawCount: number;
  mediaCrewsCount: number;
  policeAggression: number;
  isEndless?: boolean;
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    key: 'level_1',
    name: 'ITO Chowk to Tilak Marg',
    subtitle: 'Low Hardness - Build the Kafila',
    difficulty: DIFFICULTY.LOW,
    difficultyLabel: 'EASY / LOW',
    roadLength: 2200,
    roadWidth: 380,
    minCrowdForVictory: 8,
    targetDistance: 2000,
    barricadeCount: 5,
    barricadeTiers: 1,
    bystanderCount: 18,
    policeCount: 6,
    hasTearGas: false,
    hasWaterCannon: false,
    hasInternetJammer: false,
    hasTrafficJam: true,
    dtcBusCount: 2,
    autoRickshawCount: 3,
    mediaCrewsCount: 3,
    policeAggression: 1.0,
  },
  {
    id: 2,
    key: 'level_2',
    name: 'Mandi House to CP Circle',
    subtitle: 'Mid Hardness - Section 144 & Tear Gas',
    difficulty: DIFFICULTY.MID,
    difficultyLabel: 'MID HARDNESS',
    roadLength: 3000,
    roadWidth: 380,
    minCrowdForVictory: 16,
    targetDistance: 2800,
    barricadeCount: 9,
    barricadeTiers: 2,
    bystanderCount: 26,
    policeCount: 14,
    hasTearGas: true,
    hasWaterCannon: false,
    hasInternetJammer: true,
    hasTrafficJam: true,
    dtcBusCount: 4,
    autoRickshawCount: 5,
    mediaCrewsCount: 4,
    policeAggression: 1.4,
  },
  {
    id: 3,
    key: 'level_3',
    name: 'Parliament St to Jantar Mantar',
    subtitle: 'Tough Hardness - Water Cannon & Riot Shields',
    difficulty: DIFFICULTY.HARD,
    difficultyLabel: 'TOUGH / HARD',
    roadLength: 3800,
    roadWidth: 380,
    minCrowdForVictory: 28,
    targetDistance: 3600,
    barricadeCount: 15,
    barricadeTiers: 3,
    bystanderCount: 36,
    policeCount: 22,
    hasTearGas: true,
    hasWaterCannon: true,
    hasInternetJammer: true,
    hasTrafficJam: true,
    dtcBusCount: 6,
    autoRickshawCount: 6,
    mediaCrewsCount: 5,
    policeAggression: 2.0,
  },
  {
    id: 4,
    key: 'level_endless',
    name: '♾️ Endless Delhi Rally',
    subtitle: 'Infinite Marathon - How Far Can Your Kafila March?',
    difficulty: 'ENDLESS',
    difficultyLabel: '♾️ INFINITE MARCH',
    roadLength: 25000,
    roadWidth: 380,
    minCrowdForVictory: 99999,
    targetDistance: 24000,
    barricadeCount: 50,
    barricadeTiers: 2,
    bystanderCount: 120,
    policeCount: 45,
    hasTearGas: true,
    hasWaterCannon: true,
    hasInternetJammer: true,
    hasTrafficJam: true,
    dtcBusCount: 12,
    autoRickshawCount: 14,
    mediaCrewsCount: 12,
    policeAggression: 1.8,
    isEndless: true,
  },
];
