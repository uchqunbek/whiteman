const Sounds = {
  ctx: null,
  enabled: true,

  getContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  },

  play(type) {
    if (!this.enabled) return;
    switch (type) {
      case 'tap': this._beep(800, 0.05, 'sine'); break;
      case 'reveal': this._sweep(300, 900, 0.3); break;
      case 'hide': this._sweep(900, 300, 0.2); break;
      case 'confirm': this._chime(); break;
      case 'vote': this._beep(150, 0.15, 'square'); break;
      case 'victory': this._playMP3('audio/victory.mp3'); break;
      case 'wrong': this._playMP3('audio/wrong.mp3'); break;
      case 'evil': this._playMP3('audio/evil-laugh.mp3'); break;
    }
  },

  _beep(freq, duration, type) {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  },

  _sweep(startFreq, endFreq, duration) {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  },

  _chime() {
    const ctx = this.getContext();
    const notes = [523, 659, 784];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const startTime = ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  },

  _playMP3(src) {
    const audio = new Audio(src);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  }
};
