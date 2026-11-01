/**
 * Resilient Audio & Voice Announcement Manager for IT Club Lab.
 * Supports:
 * 1. Web Audio API synthesized tones (Dual-tone RFID beep & error buzz)
 * 2. Pre-decoded AudioBuffer for MP3 voice announcements (Zero-latency & immune to autoplay drops)
 * 3. Fresh HTML5 Audio Element fallback with synchronous play
 * 4. Web Speech API (TTS) ultimate safety fallback in Indonesian
 */
class SoundEffects {
  private ctx: AudioContext | null = null;
  private masukBuffer: AudioBuffer | null = null;
  private pulangBuffer: AudioBuffer | null = null;
  private isMuted: boolean = false;
  private volume: number = 1.0;
  private isPreloading: boolean = false;

  private readonly MASUK_URL = '/assets/aistudio/Selamat_datang_Aiti_Club_eb2f80b2.mp3';
  private readonly PULANG_URL = '/assets/aistudio/Pesan_hati-hati_di_jalan_f7d9e899.mp3';

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedMute = localStorage.getItem('itclub_audio_muted');
        if (savedMute !== null) {
          this.isMuted = savedMute === 'true';
        }
      } catch {
        this.isMuted = false;
      }

      // Auto-unlock audio context on first user interaction
      const unlockAudio = () => {
        this.unlockContext();
        this.preloadBuffers();
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };

      window.addEventListener('click', unlockAudio, { once: true, passive: true });
      window.addEventListener('keydown', unlockAudio, { once: true, passive: true });
      window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });

      // Start preloading buffers immediately
      this.preloadBuffers();
    }
  }

  public getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    return this.ctx;
  }

  public unlockContext(): void {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch((err) => console.warn('[Audio] ctx resume note:', err));
    }
  }

  public preloadBuffers(): void {
    if (this.isPreloading || (this.masukBuffer && this.pulangBuffer)) return;
    this.isPreloading = true;

    const ctx = this.getContext();
    if (!ctx) return;

    // Load Masuk audio buffer
    fetch(this.MASUK_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .then((arr) => ctx.decodeAudioData(arr))
      .then((decoded) => {
        this.masukBuffer = decoded;
      })
      .catch((err) => {
        console.warn('[Audio] Note loading masuk buffer:', err);
      });

    // Load Pulang audio buffer
    fetch(this.PULANG_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .then((arr) => ctx.decodeAudioData(arr))
      .then((decoded) => {
        this.pulangBuffer = decoded;
      })
      .catch((err) => {
        console.warn('[Audio] Note loading pulang buffer:', err);
      });
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('itclub_audio_muted', muted ? 'true' : 'false');
    } catch {
      // ignore
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  // Web Speech API fallback for Indonesian voice
  private speakText(text: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.volume = this.volume;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('[Audio] Speech synthesis fallback error:', e);
    }
  }

  // Dual tone success beep (standard RFID reader tone)
  playRfidSuccess(): void {
    if (this.isMuted) return;
    this.unlockContext();
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1400, now);
      osc1.frequency.exponentialRampToValueAtTime(1800, now + 0.08);

      gain1.gain.setValueAtTime(0.18 * this.volume, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.14);

      // Second affirmative chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(2100, now + 0.09);
      gain2.gain.setValueAtTime(0.15 * this.volume, now + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.09);
      osc2.stop(now + 0.22);
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  // Error buzz
  playRfidError(): void {
    if (this.isMuted) return;
    this.unlockContext();
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(180, now + 0.15);

      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Audio context error
    }
  }

  // Voice announcement: "Selamat datang di IT Club" for Tap Masuk
  playTapMasuk(): void {
    if (this.isMuted) return;
    this.unlockContext();
    this.playRfidSuccess();

    // Strategy 1: Web Audio decoded AudioBuffer
    const ctx = this.getContext();
    if (ctx && this.masukBuffer) {
      try {
        const source = ctx.createBufferSource();
        source.buffer = this.masukBuffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.volume, ctx.currentTime);
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(ctx.currentTime + 0.12);
        return;
      } catch (err) {
        console.warn('[Audio] Buffer playback error, trying HTML5 Audio fallback:', err);
      }
    }

    // Strategy 2: HTML5 Audio instance with immediate synchronous play
    try {
      const audio = new Audio(this.MASUK_URL);
      audio.volume = this.volume;
      audio.preload = 'auto';
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[Audio] HTML5 Audio play error:', err);
          // Strategy 3: TTS speech synthesis fallback
          this.speakText('Selamat datang di IT Club');
        });
      }
    } catch {
      this.speakText('Selamat datang di IT Club');
    }
  }

  // Voice announcement: "Terima kasih, hati-hati di jalan ya" for Tap Pulang
  playTapPulang(): void {
    if (this.isMuted) return;
    this.unlockContext();
    this.playRfidSuccess();

    // Strategy 1: Web Audio decoded AudioBuffer
    const ctx = this.getContext();
    if (ctx && this.pulangBuffer) {
      try {
        const source = ctx.createBufferSource();
        source.buffer = this.pulangBuffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.volume, ctx.currentTime);
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(ctx.currentTime + 0.12);
        return;
      } catch (err) {
        console.warn('[Audio] Buffer playback error, trying HTML5 Audio fallback:', err);
      }
    }

    // Strategy 2: HTML5 Audio instance with immediate synchronous play
    try {
      const audio = new Audio(this.PULANG_URL);
      audio.volume = this.volume;
      audio.preload = 'auto';
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[Audio] HTML5 Audio play error:', err);
          // Strategy 3: TTS speech synthesis fallback
          this.speakText('Terima kasih, hati-hati di jalan ya');
        });
      }
    } catch {
      this.speakText('Terima kasih, hati-hati di jalan ya');
    }
  }

  // Direct test voice helper
  testVoice(type: 'masuk' | 'pulang'): void {
    this.unlockContext();
    if (type === 'masuk') {
      this.playTapMasuk();
    } else {
      this.playTapPulang();
    }
  }
}

export const soundEffects = new SoundEffects();
