export interface GameSaveData {
  highScores: {
    maxScore: number;
    endlessDistance: number;
    endlessCrowd: number;
  };
  playerName: string;
  levelStars: { [levelIndex: number]: number };
  soundMuted: boolean;
  voiceEnabled: boolean;
}

export const RALLY_LEADER_NAMES = [
  'धाकड़ ताऊ (Dhaakad Tau)',
  'किसान योद्धा (Kisan Yoddha)',
  'छात्र नेता रोहन (Student Leader)',
  'कड़क चायवाला (Kadak Chaiwala)',
  'क्रांतिकारी बंटी (Krantikari Bunty)',
  'अन्ना का चेला (Anna Ka Chela)',
  'देसी कामरेड (Desi Comrade)',
  'ट्रैक्टर उस्ताद (Tractor Ustaad)',
  'इंकलाबी गुंजन (Inquilab Gunjan)',
  'सत्याग्रही भगत (Satyagrahi)',
  'दिल्ली का दिलदार (Delhi Dildaar)',
  'प्रेस रिपोर्टर रमन (Reporter Raman)',
];

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

  private getRandomDefaultName(): string {
    const idx = Math.floor(Math.random() * RALLY_LEADER_NAMES.length);
    return RALLY_LEADER_NAMES[idx];
  }

  private loadFromStorage(): GameSaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          highScores: {
            maxScore: parsed.highScores?.maxScore ?? 0,
            endlessDistance: parsed.highScores?.endlessDistance ?? 0,
            endlessCrowd: parsed.highScores?.endlessCrowd ?? 0,
          },
          playerName: parsed.playerName || this.getRandomDefaultName(),
          levelStars: parsed.levelStars || { 0: 0, 1: 0, 2: 0 },
          soundMuted: !!parsed.soundMuted,
          voiceEnabled: parsed.voiceEnabled !== false,
        };
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
    return {
      highScores: {
        maxScore: 0,
        endlessDistance: 0,
        endlessCrowd: 0,
      },
      playerName: this.getRandomDefaultName(),
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

  public getPlayerName(): string {
    if (!this.data.playerName) {
      this.data.playerName = this.getRandomDefaultName();
      this.save();
    }
    return this.data.playerName;
  }

  public setPlayerName(name: string): void {
    this.data.playerName = name.trim() || this.getRandomDefaultName();
    this.save();
  }

  public rollRandomName(): string {
    const current = this.data.playerName;
    const pool = RALLY_LEADER_NAMES.filter((n) => n !== current);
    const chosen = pool[Math.floor(Math.random() * pool.length)] || this.getRandomDefaultName();
    this.data.playerName = chosen;
    this.save();
    return chosen;
  }

  public updateEndlessScore(distance: number, crowd: number, score = 0): boolean {
    let isNewHigh = false;
    const calculatedScore = score > 0 ? score : Math.round(distance * 5 + crowd * 100);

    if (calculatedScore > (this.data.highScores.maxScore || 0)) {
      this.data.highScores.maxScore = calculatedScore;
      isNewHigh = true;
    }
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

  public getMaxScore(): number {
    return this.data.highScores.maxScore || 0;
  }

  public getHighScores(): { maxScore: number; endlessDistance: number; endlessCrowd: number } {
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
