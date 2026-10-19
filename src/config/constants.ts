export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 768;

// Calibrated real-pixel speeds
export const SPEEDS = {
  PLAYER_WALK: 135,    // 135 px/s: Steady, natural walking pace
  PLAYER_SPRINT: 210,  // 210 px/s: Controlled tactical jog
  CROWD_WALK: 125,     // Follows smoothly
  POLICE_PATROL: 75,   // Slow constable stroll
  POLICE_CHASE: 110,   // Firm pursuit
  VEHICLE_BUS: 35,     // Crawling DTC bus
  VEHICLE_AUTO: 55,    // Delhi auto-rickshaw
  VEHICLE_PCR: 75,     // Police Gypsy patrol
  WATER_JET: 220,
};

// Vertical Road Layout: Road runs Northwards (Upwards from bottom to top)
export const ROAD_BOUNDS = {
  // Road surface edges
  ROAD_LEFT_X: 250,        // West road curb
  ROAD_RIGHT_X: 774,       // East road curb
  CENTER_X: 512,          // Center line of boulevard
  ROAD_WIDTH: 524,        // 4 lanes
  LANE_WIDTH: 131,
  // Walkable corridor (including wide Delhi tree-lined sidewalks)
  WALK_MIN_X: 90,
  WALK_MAX_X: 934,
  // Sidewalk centers
  SIDEWALK_LEFT_X: 130,
  SIDEWALK_RIGHT_X: 894,
  // Finish coordinate at North top
  FINISH_Y: 220,
};

export const DIFFICULTY = {
  LOW: 'LOW',
  MID: 'MID',
  HARD: 'HARD',
} as const;

export type DifficultyLevel = (typeof DIFFICULTY)[keyof typeof DIFFICULTY];
