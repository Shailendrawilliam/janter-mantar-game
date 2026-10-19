export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 768;

// Calibrated real-pixel speeds: smooth, controlled, realistic walking pace
export const SPEEDS = {
  PLAYER_WALK: 135,    // 135 px/s: Steady, natural walking pace
  PLAYER_SPRINT: 210,  // 210 px/s: Controlled tactical jog
  CROWD_WALK: 125,     // Follows smoothly
  POLICE_PATROL: 75,   // Slow constable stroll
  POLICE_CHASE: 110,   // Firm pursuit, easily dodgeable with skill
  VEHICLE_BUS: 35,     // Crawling DTC bus
  VEHICLE_AUTO: 55,    // Delhi auto-rickshaw
  VEHICLE_PCR: 75,     // Police Gypsy patrol
  WATER_JET: 220,
};

export const ROAD_BOUNDS = {
  TOP_Y: 200,          // North sidewalk edge
  BOTTOM_Y: 580,       // South sidewalk edge
  WIDTH_Y: 380,        // 4 lanes of road
  LANE_HEIGHT: 95,
};

export const DIFFICULTY = {
  LOW: 'LOW',
  MID: 'MID',
  HARD: 'HARD',
} as const;

export type DifficultyLevel = (typeof DIFFICULTY)[keyof typeof DIFFICULTY];
