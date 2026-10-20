// Sistema de Partículas e Popups Flutuantes Procedurais (Game Juice Completo)
export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.popups = [];
    this.rings = [];
  }

  // 1. Emissão de Faíscas e Detritos Físicos
  emit(x, y, count = 16, color = '#00f0ff', speedMultiplier = 1.0) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (60 + Math.random() * 220) * speedMultiplier;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 120 + Math.random() * 80,
        size: 2.5 + Math.random() * 3.5,
        alpha: 1.0,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.5,
        color
      });
    }
  }

  // 2. Anéis de Pulso / Ondas de Choque Harmônicas
  emitRing(x, y, color = '#00f0ff', maxRadius = 70) {
    this.rings.push({
      x,
      y,
      radius: 6,
      maxRadius,
      growthRate: 180,
      lineWidth: 3.5,
      alpha: 1.0,
      color
    });
  }

  // 3. Popups Numéricos Flutuantes (+50, +100, ESCUDO!, etc.)
  addPopup(x, y, text, color = '#facc15') {
    this.popups.push({
      x,
      y,
      text,
      vy: -75,
      alpha: 1.0,
      life: 0,
      maxLife: 0.85,
      color,
      scale: 1.3
    });
  }

  // 4. Confetes de Celebração de Vitória (★★★)
  emitVictoryConfetti(centerX, centerY) {
    const colors = ['#00f0ff', '#facc15', '#a855f7', '#ec4899', '#38bdf8', '#ffffff'];
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 320;
      this.particles.push({
        x: centerX + (Math.random() - 0.5) * 80,
        y: centerY + (Math.random() - 0.5) * 80,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100,
        gravity: 240,
        size: 3 + Math.random() * 4,
        alpha: 1.0,
        life: 0,
        maxLife: 1.2 + Math.random() * 0.8,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  update(dt) {
    // Atualiza partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += (p.vy + p.gravity * (p.life / p.maxLife)) * dt;
      
      const lifeRatio = Math.max(0, 1 - p.life / p.maxLife);
      p.alpha = lifeRatio * lifeRatio; // Fade não-linear suave

      if (p.life >= p.maxLife || p.alpha <= 0.01) {
        this.particles.splice(i, 1);
      }
    }

    // Atualiza anéis
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.radius += r.growthRate * dt;
      const ringRatio = Math.max(0, 1 - r.radius / r.maxRadius);
      r.alpha = ringRatio * ringRatio; // Fade quadrático
      if (r.radius >= r.maxRadius || r.alpha <= 0.01) {
        this.rings.splice(i, 1);
      }
    }

    // Atualiza popups
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.life += dt;
      pop.y += pop.vy * dt;
      pop.vy *= Math.pow(0.04, dt); // Amortecimento framerate-independent
      pop.scale = Math.max(1.0, pop.scale - dt * 0.8);
      const popRatio = Math.max(0, 1 - pop.life / pop.maxLife);
      pop.alpha = popRatio * popRatio; // Fade quadrático
      if (pop.life >= pop.maxLife) {
        this.popups.splice(i, 1);
      }
    }
  }

  render(ctx) {
    ctx.save();

    // Renderiza anéis de choque
    for (const r of this.rings) {
      ctx.save();
      ctx.globalAlpha = r.alpha;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = r.lineWidth * r.alpha;
      ctx.shadowColor = r.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Renderiza partículas
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Renderiza popups numéricos
    for (const pop of this.popups) {
      ctx.save();
      ctx.globalAlpha = pop.alpha;
      ctx.font = `bold ${Math.floor(16 * pop.scale)}px 'Orbitron', sans-serif`;
      ctx.fillStyle = pop.color;
      ctx.shadowColor = pop.color;
      ctx.shadowBlur = 10;
      ctx.textAlign = 'center';
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    }

    ctx.restore();
  }

  clear() {
    this.particles = [];
    this.popups = [];
    this.rings = [];
  }
}
