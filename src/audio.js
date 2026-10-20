// Sistema de Áudio Procedural Avançado via Web Audio API
// Zero arquivos externos, Zero erros 404, Mudo garantido em anúncios e background tab

class ProceduralAudio {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.isMuted = false;
    this.isAdMuted = false;
    this.isTabHidden = false;

    // Gerador de Drone / Pulso Rítmico de Fundo
    this.ambientInterval = null;
    this.ambientStep = 0;
    this.tempoBpm = 128;

    this.initLifecycleListeners();
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended' && !this.isTabHidden && !this.isAdMuted) {
      this.ctx.resume().catch(() => {});
    }
  }

  initLifecycleListeners() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isTabHidden = true;
        this.pauseAll();
      } else {
        this.isTabHidden = false;
        if (!this.isAdMuted && !this.isMuted) {
          this.resumeAll();
        }
      }
    });

    window.addEventListener('blur', () => {
      if (document.hidden) {
        this.isTabHidden = true;
        this.pauseAll();
      }
    });

    window.addEventListener('focus', () => {
      this.isTabHidden = false;
      if (!this.isAdMuted && !this.isMuted) {
        this.resumeAll();
      }
    });
  }

  pauseAll() {
    if (this.ctx && this.ctx.state === 'running') {
      try { this.ctx.suspend(); } catch (e) {}
    }
  }

  resumeAll() {
    if (this.ctx && this.ctx.state === 'suspended' && !this.isAdMuted && !this.isMuted) {
      try { this.ctx.resume(); } catch (e) {}
    }
  }

  playOsc(type, freqStart, freqEnd, duration, gainMax = 0.2, pitchRandomness = 0.0) {
    if (this.isMuted || this.isAdMuted || this.isTabHidden) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      let pitchMod = 1.0;
      if (pitchRandomness > 0) {
        pitchMod = 1.0 + (Math.random() * 2 - 1) * pitchRandomness;
      }

      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, freqStart * pitchMod), now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd * pitchMod), now + duration);

      gain.gain.setValueAtTime(gainMax, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  // 1. Som de Ascensão / Propulsão (Sutil pulso de frequências harmônicas)
  playThrust() {
    this.playOsc('sine', 160, 290, 0.09, 0.07, 0.04);
  }

  // 2. Coleta de Cristal Quântico (Arpeggio com pitch randômico agradável)
  playCrystal() {
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C E G C E
    const note = notes[Math.floor(Math.random() * notes.length)];
    this.playOsc('triangle', note, note * 1.5, 0.16, 0.18, 0.08);
  }

  // 3. Travessia de Portal de Pulso Temporal
  playPulseGate() {
    this.playOsc('sine', 120, 480, 0.25, 0.22);
    setTimeout(() => this.playOsc('triangle', 480, 880, 0.2, 0.15), 60);
  }

  // 4. Absorção de Impacto pelo Escudo Temporal
  playShieldPop() {
    this.playOsc('sine', 440, 110, 0.18, 0.25);
    this.playOsc('triangle', 880, 220, 0.12, 0.18);
  }

  // 5. Ruptura Temporal / Colisão Fatal
  playCrash() {
    this.playOsc('sawtooth', 320, 35, 0.35, 0.32);
    this.playOsc('square', 140, 28, 0.28, 0.2);
  }

  // 6. Fanfarra de Vitória no Setor
  playWin() {
    if (this.isMuted || this.isAdMuted || this.isTabHidden) return;
    this.init();
    const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    chords.forEach((freq, i) => {
      setTimeout(() => {
        this.playOsc('triangle', freq, freq, 0.28, 0.18);
      }, i * 90);
    });
  }

  // 7. Clique de Botão / Interface
  playClick() {
    this.playOsc('sine', 700, 350, 0.04, 0.08);
  }

  // 8. Acorde Procedural Cósmico para Intro FluidCleb Interactive (0s a 2.8s)
  playIntroChords() {
    if (this.isMuted || this.isAdMuted || this.isTabHidden) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Tríade expansiva límpida: C4 (261.63), E4 (329.63), G4 (392.00), B4 (493.88), D5 (587.33)
      const freqs = [261.63, 329.63, 392.00, 587.33];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        gain.gain.setValueAtTime(0.001, now + idx * 0.15);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.15 + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);

        osc.start(now + idx * 0.15);
        osc.stop(now + 2.6);
      });
    } catch (e) {}
  }

  // 9. Sintetizador de Ritmo Cósmico em Background (Sub-bass e Pulso Harmônico)
  startRhythmDrone() {
    if (this.ambientInterval) return;
    const intervalMs = (60 / this.tempoBpm) * 1000 / 2; // Colcheias a 128 BPM

    this.ambientInterval = setInterval(() => {
      if (this.isMuted || this.isAdMuted || this.isTabHidden) return;
      if (!this.ctx || this.ctx.state !== 'running') return;

      const step = this.ambientStep % 16;
      this.ambientStep++;

      // Bumbo quântico nos tempos 0, 4, 8, 12
      if (step % 4 === 0) {
        this.playOsc('sine', 110, 40, 0.08, 0.09);
      }
      // Pulso harmônico suave sincopado
      if (step === 2 || step === 6 || step === 10 || step === 14) {
        this.playOsc('triangle', 330, 220, 0.06, 0.03);
      }
    }, intervalMs);
  }

  stopRhythmDrone() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
    this.ambientStep = 0;
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.7, this.ctx.currentTime);
    }
  }

  setAdMuted(muted) {
    this.isAdMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : (this.isMuted ? 0 : 0.7), this.ctx.currentTime);
    }
  }
}

export const sound = new ProceduralAudio();
