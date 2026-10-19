/**
 * Real Hindi Speech Synthesis for 'Chalo Jantar Mantar'.
 * Uses Web Speech API with fallbacks, giving authentic vocal slogans
 * and police announcements.
 */
export class SpeechVoiceSystem {
  private static instance: SpeechVoiceSystem;
  private synth: SpeechSynthesis | null = null;
  private hindiVoice: SpeechSynthesisVoice | null = null;
  private isEnabled = true;
  private lastSpeakTime = 0;

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  public static getInstance(): SpeechVoiceSystem {
    if (!SpeechVoiceSystem.instance) {
      SpeechVoiceSystem.instance = new SpeechVoiceSystem();
    }
    return SpeechVoiceSystem.instance;
  }

  private loadVoices(): void {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Search for Hindi voice, else Indian English, else default
    this.hindiVoice =
      voices.find((v) => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi')) ||
      voices.find((v) => v.lang.includes('en-IN') || v.name.toLowerCase().includes('india')) ||
      voices[0] ||
      null;
  }

  public toggleVoice(): boolean {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }

  /**
   * Protester Slogans spoken in authentic Hindi voice
   */
  public speakSlogan(text?: string): void {
    if (!this.isEnabled || !this.synth) return;
    const now = Date.now();
    if (now - this.lastSpeakTime < 1800) return; // Prevent spam
    this.lastSpeakTime = now;

    const slogans = [
      'चलो जंतर मंतर!',
      'इंक़लाब ज़िन्दाबाद!',
      'आज़ादी!',
      'हम होंगे कामयाब!',
      'हमारी माँगें पूरी करो!',
    ];
    const phrase = text || slogans[Math.floor(Math.random() * slogans.length)];

    try {
      this.synth.cancel(); // Cancel previous speech
      const utter = new SpeechSynthesisUtterance(phrase);
      if (this.hindiVoice) utter.voice = this.hindiVoice;
      utter.rate = 1.05;
      utter.pitch = 1.15;
      utter.volume = 0.9;
      this.synth.speak(utter);
    } catch {
      // Graceful fallback if audio permissions restricted
    }
  }

  /**
   * Delhi Police megaphone warning
   */
  public speakPoliceWarning(): void {
    if (!this.isEnabled || !this.synth) return;
    const now = Date.now();
    if (now - this.lastSpeakTime < 2400) return;
    this.lastSpeakTime = now;

    const warnings = [
      'रुक जाओ, धारा 144 लागू है!',
      'पीछे हटो, आगे जाना मना है!',
      'सरकारी काम में बाधा मत डालो!',
      'सब लोग अपनी गाड़ियों में बैठो!',
    ];
    const phrase = warnings[Math.floor(Math.random() * warnings.length)];

    try {
      this.synth.cancel();
      const utter = new SpeechSynthesisUtterance(phrase);
      if (this.hindiVoice) utter.voice = this.hindiVoice;
      utter.rate = 1.1;
      utter.pitch = 0.85; // Authoritative deeper police tone
      utter.volume = 1.0;
      this.synth.speak(utter);
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Rally Tractor war cry
   */
  public speakTractor(): void {
    if (!this.isEnabled || !this.synth) return;
    try {
      this.synth.cancel();
      const utter = new SpeechSynthesisUtterance('ट्रैक्टर आगे बढ़ाओ! रास्ता खोलो!');
      if (this.hindiVoice) utter.voice = this.hindiVoice;
      utter.rate = 1.1;
      utter.pitch = 1.0;
      this.synth.speak(utter);
    } catch {
      // Fallback
    }
  }
}
