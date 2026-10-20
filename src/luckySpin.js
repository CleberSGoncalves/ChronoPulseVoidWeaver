// Sistema de Roleta da Sorte (Lucky Spin) Procedural em Canvas
import { SaveManager } from './storage.js';
import { sound } from './audio.js';
import { crazyGames } from './crazygames.js';
import { I18n } from './i18n.js';

export class LuckySpin {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.slices = [
      { text: '50 💎', value: 50, type: 'crystals', color: '#0f172a' },
      { text: '100 💎', value: 100, type: 'crystals', color: '#1e293b' },
      { text: '🛡️ ESCUDO', value: 1, type: 'shield', color: '#0369a1' },
      { text: '200 💎', value: 200, type: 'crystals', color: '#0f172a' },
      { text: '350 💎', value: 350, type: 'crystals', color: '#581c87' },
      { text: '🧲 SUPER ÍMÃ', value: 1, type: 'magnet', color: '#7c3aed' },
      { text: '500 💎', value: 500, type: 'crystals', color: '#0f172a' },
      { text: '1000 💎', value: 1000, type: 'crystals', color: '#b45309' }
    ];

    this.currentAngle = 0;
    this.angularVelocity = 0;
    this.isSpinning = false;
    this.cooldownHours = 12;

    this.initCanvas();
    this.draw();
  }

  initCanvas() {
    const size = 300;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this.ctx.scale(dpr, dpr);
  }

  canFreeSpin() {
    const save = SaveManager.get();
    const lastSpin = save.lastFreeSpinTime || 0;
    const now = Date.now();
    const diffHours = (now - lastSpin) / (1000 * 60 * 60);
    return diffHours >= this.cooldownHours;
  }

  spin(onFinish) {
    if (this.isSpinning) return;
    this.isSpinning = true;

    // Velocidade inicial alta com desaceleração suave
    this.angularVelocity = 12 + Math.random() * 8;
    this.friction = 0.985;

    let lastTickAngle = this.currentAngle;

    const animate = () => {
      this.currentAngle += this.angularVelocity * 0.05;
      this.angularVelocity *= this.friction;

      // Som de tick a cada passagem de fatia
      const sliceAngle = (Math.PI * 2) / this.slices.length;
      if (Math.abs(this.currentAngle - lastTickAngle) >= sliceAngle) {
        sound.playClick();
        lastTickAngle = this.currentAngle;
      }

      this.draw();

      if (this.angularVelocity > 0.03) {
        requestAnimationFrame(animate);
      } else {
        this.angularVelocity = 0;
        this.isSpinning = false;
        const prize = this.getSelectedSlice();
        this.awardPrize(prize);
        if (onFinish) onFinish(prize);
      }
    };

    requestAnimationFrame(animate);
  }

  getSelectedSlice() {
    const sliceAngle = (Math.PI * 2) / this.slices.length;
    // O ponteiro aponta para o topo (-Math.PI / 2)
    const normalizedAngle = (Math.PI * 2 - (this.currentAngle % (Math.PI * 2))) % (Math.PI * 2);
    // Ajuste para ponteiro no topo
    const pointerAngle = (normalizedAngle + Math.PI / 2) % (Math.PI * 2);
    const index = Math.floor(pointerAngle / sliceAngle) % this.slices.length;
    return this.slices[index];
  }

  awardPrize(prize) {
    if (prize.type === 'crystals') {
      SaveManager.addCrystals(prize.value);
    } else if (prize.type === 'shield') {
      SaveManager.addCrystals(150); // Converte em cristais de escudo
    } else if (prize.type === 'magnet') {
      SaveManager.addCrystals(180);
    }
    sound.playWin();
  }

  draw() {
    const ctx = this.ctx;
    const cx = 150;
    const cy = 150;
    const radius = 135;
    const sliceAngle = (Math.PI * 2) / this.slices.length;

    ctx.clearRect(0, 0, 300, 300);

    // Desenha fatias
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.currentAngle);

    for (let i = 0; i < this.slices.length; i++) {
      const startA = i * sliceAngle;
      const endA = startA + sliceAngle;
      const slice = this.slices[i];

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startA, endA);
      ctx.closePath();

      ctx.fillStyle = slice.color;
      ctx.fill();
      ctx.strokeStyle = '#00f0ff80';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Texto na fatia
      ctx.save();
      ctx.rotate(startA + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.font = "bold 13px 'Orbitron', sans-serif";
      ctx.fillText(slice.text, radius - 16, 5);
      ctx.restore();
    }

    // Centro da roleta
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fillStyle = '#050711';
    ctx.fill();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();

    // Ponteiro superior fixo
    ctx.save();
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - radius - 8);
    ctx.lineTo(cx + 10, cy - radius - 8);
    ctx.lineTo(cx, cy - radius + 14);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
