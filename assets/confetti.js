const Confetti = {
  canvas: null,
  ctx: null,
  particles: [],
  running: false,

  fire(duration) {
    duration = duration || 3000;

    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
      document.body.appendChild(this.canvas);
    }
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];

    var colors = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#6c5ce7', '#00b894', '#fd79a8', '#0984e3'];
    for (var i = 0; i < 120; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: -10 - Math.random() * 200,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    this.running = true;
    this._animate();

    var self = this;
    setTimeout(function() {
      self.running = false;
      setTimeout(function() {
        if (self.canvas) self.canvas.width = 0;
      }, 2000);
    }, duration);
  },

  _animate() {
    var self = this;
    if (!this.running && this.particles.every(function(p) { return p.opacity <= 0; })) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(function(p) {
      p.x += p.vx;
      p.vy += 0.1;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      if (!self.running) {
        p.opacity -= 0.02;
      }
      if (p.opacity <= 0) return;

      self.ctx.save();
      self.ctx.translate(p.x, p.y);
      self.ctx.rotate((p.rotation * Math.PI) / 180);
      self.ctx.globalAlpha = Math.max(0, p.opacity);
      self.ctx.fillStyle = p.color;
      self.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      self.ctx.restore();
    });

    requestAnimationFrame(function() { self._animate(); });
  }
};
