export interface GameSaveData {
  highScores: {
    endlessDistance: number;
    endlessCrowd: number;
  };
  levelStars: { [levelIndex: number]: number };
  soundMuted: boolean;
  voiceEnabled: boolean;
}

const STORAGE_KEY = 'chalo_jantar_mantar_save';

export class SaveManager {
  private static instance: SaveManager;
  private data: GameSaveData;

  private constructor() {
    this.data = this.loadFromStorage();
  }

  public static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  private loadFromStorage(): GameSaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
    return {
      highScores: {
        endlessDistance: 0,
        endlessCrowd: 0,
      },
      levelStars: { 0: 0, 1: 0, 2: 0 },
      soundMuted: false,
      voiceEnabled: true,
    };
  }

  public save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Ignore
    }
  }

  public updateEndlessScore(distance: number, crowd: number): boolean {
    let isNewHigh = false;
    if (distance > this.data.highScores.endlessDistance) {
      this.data.highScores.endlessDistance = Math.round(distance);
      isNewHigh = true;
    }
    if (crowd > this.data.highScores.endlessCrowd) {
      this.data.highScores.endlessCrowd = crowd;
      isNewHigh = true;
    }
    if (isNewHigh) {
      this.save();
    }
    return isNewHigh;
  }

  public getHighScores(): { endlessDistance: number; endlessCrowd: number } {
    return this.data.highScores;
  }

  public setSoundMuted(muted: boolean): void {
    this.data.soundMuted = muted;
    this.save();
  }

  public isSoundMuted(): boolean {
    return this.data.soundMuted;
  }

  public setVoiceEnabled(enabled: boolean): void {
    this.data.voiceEnabled = enabled;
    this.save();
  }

  public isVoiceEnabled(): boolean {
    return this.data.voiceEnabled;
  }
}
