// Web Audio API Procedural Sound Engine for Werewolf
// No external MP3/WAV files needed, runs seamlessly in any browser!

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.ambientNodes = [];
    this.currentAmbient = null;
    
    // Load persisted mute state if available
    try {
      const saved = localStorage.getItem('warewolf_audio_muted');
      if (saved !== null) {
        this.muted = JSON.parse(saved);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    try {
      localStorage.setItem('warewolf_audio_muted', JSON.stringify(this.muted));
    } catch (e) {}

    if (this.muted) {
      this.stopAmbient();
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // --- Sound Effects ---

  // Wolf Howl (Ominous sliding low-to-high-to-low eerie tone with harmonic vibrato)
  playWolfHowl() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, t);
    filter.Q.setValueAtTime(4, t);

    // Wolf pitch envelope: starts mid, dips, howls high, slow decay
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.3);
    osc.frequency.exponentialRampToValueAtTime(320, t + 1.2);
    osc.frequency.exponentialRampToValueAtTime(360, t + 1.8);
    osc.frequency.exponentialRampToValueAtTime(160, t + 3.0);

    // Gain envelope
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.8);
    gain.gain.linearRampToValueAtTime(0.22, t + 1.8);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 3.3);
  }

  // Village Bell / Rooster at Dawn (Clear metallic resonant chime)
  playDawnBell() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const freqs = [330, 440, 660, 880];
    freqs.forEach((freq, idx) => {
      const t = this.ctx.currentTime + (idx * 0.15);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.15 / (idx + 1), t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 2.6);
    });
  }

  // Nightfall Whisper / Deep Gong
  playNightfall() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 2.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, t);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.0);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 3.1);
  }

  // Gavel / Lynch / Vote Strike
  playGavel() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.25);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  // Heartbeat / Clock Tick (for last 10 seconds of timer)
  playHeartbeat() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(75, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  // Card Flip / Whoosh (Role Reveal)
  playCardFlip() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(540, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.3);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, t);
    filter.Q.setValueAtTime(2, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.38);
  }

  // Victory Fanfare
  playVictory(isWolves = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const chord = isWolves ? [130.81, 155.56, 196.00, 246.94] : [261.63, 329.63, 392.00, 523.25];
    chord.forEach((freq, idx) => {
      const t = this.ctx.currentTime + (idx * 0.12);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isWolves ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(isWolves ? 0.08 : 0.12, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 2.1);
    });
  }

  // Button Click / Tap Feedback
  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.04);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  // --- Background Ambience Loops ---
  startAmbient(type) {
    if (this.muted) return;
    if (this.currentAmbient === type) return;
    this.stopAmbient();
    this.init();
    if (!this.ctx) return;

    this.currentAmbient = type;

    // Sub-bass atmospheric drone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    if (type === 'night') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, this.ctx.currentTime); // low A
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(110, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
    } else if (type === 'day') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, this.ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
    } else {
      // Lobby / mystic
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(73.42, this.ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    this.ambientNodes.push({ osc, gain });
  }

  stopAmbient() {
    this.ambientNodes.forEach(({ osc, gain }) => {
      try {
        gain.gain.linearRampToValueAtTime(0.0001, this.ctx?.currentTime || 0);
        setTimeout(() => {
          try { osc.stop(); } catch(e) {}
        }, 50);
      } catch (e) {}
    });
    this.ambientNodes = [];
    this.currentAmbient = null;
  }
}

export const sound = new SoundEngine();

