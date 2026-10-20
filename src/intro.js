// Intro FluidCleb Interactive Procedural em Canvas (0.0s a 2.8s)
import { sound } from './audio.js';

export class FluidClebIntro {
  constructor(canvas, onComplete) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onComplete = onComplete;
    this.startTime = null;
    this.duration = 2.8; // 2.8 segundos de duração exata
    this.isActive = true;

    // Dispara acorde procedural límpido
    sound.playIntroChords();
  }

  start() {
    this.startTime = performance.now();
    requestAnimationFrame((t) => this.render(t));
  }

  render(currentTime) {
    if (!this.isActive) return;

    const elapsed = (currentTime - this.startTime) / 1000;
    const progress = Math.min(1.0, elapsed / this.duration);

    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);
    const ctx = this.ctx;

    // Fundo Negro Cósmico
    ctx.save();
    ctx.fillStyle = '#050711';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 - 20;

    // Fase 1 (0.0s a 1.2s): Orbes cósmicos (#00f5ff, #38bdf8) orbitando e convergindo
    if (elapsed < 1.4) {
      const orbProgress = elapsed / 1.4;
      const radius = (1 - orbProgress) * 90;
      const angle = elapsed * 4.5;

      // Orbe Ciano
      const x1 = cx + Math.cos(angle) * radius;
      const y1 = cy + Math.sin(angle) * radius;
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 24;
      ctx.fillStyle = '#00f5ff';
      ctx.beginPath();
      ctx.arc(x1, y1, 12, 0, Math.PI * 2);
      ctx.fill();

      // Orbe Azul Céu
      const x2 = cx + Math.cos(angle + Math.PI) * radius;
      const y2 = cy + Math.sin(angle + Math.PI) * radius;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 24;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(x2, y2, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fase 2 (1.0s a 2.8s): Fusão central, gota metálica (#94a3b8) e onda de choque
    if (elapsed >= 1.0) {
      const fusionElapsed = elapsed - 1.0;
      const shockwaveRadius = fusionElapsed * 160;
      const shockwaveAlpha = Math.max(0, 1 - fusionElapsed / 1.5);

      // Anel de choque ciano
      ctx.strokeStyle = `rgba(0, 245, 255, ${shockwaveAlpha})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(cx, cy, shockwaveRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Gota metálica central estilizada
      const dropScale = Math.min(1.0, fusionElapsed * 2.5);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(dropScale, dropScale);

      // Gradiente da gota metálica
      const dropGrad = ctx.createLinearGradient(-15, -15, 15, 15);
      dropGrad.addColorStop(0, '#ffffff');
      dropGrad.addColorStop(0.4, '#94a3b8');
      dropGrad.addColorStop(1, '#334155');

      ctx.fillStyle = dropGrad;
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Fase 3 (1.4s a 2.8s): Texto Neon Ciano 'FLUIDCLEB INTERACTIVE'
    if (elapsed >= 1.3) {
      const textElapsed = elapsed - 1.3;
      const textAlpha = Math.min(1.0, textElapsed * 2.2);

      ctx.save();
      ctx.globalAlpha = textAlpha;
      ctx.textAlign = 'center';

      // Título
      ctx.font = "900 24px 'Orbitron', sans-serif";
      ctx.shadowColor = '#00f5ff';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#00f5ff';
      ctx.fillText('FLUIDCLEB INTERACTIVE', cx, cy + 65);

      // Subtítulo
      ctx.font = "700 13px 'Rajdhani', sans-serif";
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#94a3b8';
      ctx.letterSpacing = '6px';
      ctx.fillText('STUDIOS', cx, cy + 88);

      ctx.restore();
    }

    // Fade final para transição fluida (2.4s a 2.8s)
    if (elapsed >= 2.4) {
      const fadeOut = (elapsed - 2.4) / 0.4;
      ctx.fillStyle = `rgba(5, 7, 17, ${fadeOut})`;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();

    if (progress < 1.0) {
      requestAnimationFrame((t) => this.render(t));
    } else {
      this.isActive = false;
      if (this.onComplete) this.onComplete();
    }
  }
}
