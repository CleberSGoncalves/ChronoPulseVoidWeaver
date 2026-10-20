// Engine Core do ChronoPulse: The Void Weaver
// Física com Delta Time, Anti-NaN, Game Juice (Hit-Stop, Screen Shake, Squash & Stretch)
import { sound } from './audio.js';
import { GameHUD } from './hud.js';
import { ParticleSystem } from './particles.js';
import { SaveManager } from './storage.js';
import { ModalController } from './modalController.js';
import { crazyGames } from './crazygames.js';
import { I18n } from './i18n.js';

export class RhythmWaveGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = new ParticleSystem();

    // Estados de Ciclo de Vida
    this.isRunning = false;
    this.isPaused = false;
    this.isAdPaused = false;
    this.isRoundOver = false;
    this.hasWon = false;
    this.isHitStopped = false;
    this.isPressing = false;
    this.hasRevivedThisRun = false;

    // Viewport Virtual
    this.w = window.innerWidth;
    this.h = window.innerHeight;

    // Nave do Jogador (Void Weaver Vessel)
    this.player = {
      x: 120,
      y: this.h / 2,
      size: 15,
      baseSpeed: 340,
      vx: 340,
      vy: 340,
      scaleX: 1.0,
      scaleY: 1.0,
      invulnerableTimer: 0,
      shields: 1,
      maxShields: 1,
      trail: [],
      maxTrail: 38
    };

    // Parâmetros de Nível / Setor
    this.sector = 1;
    this.levelLength = 8000;
    this.portalX = 8000;
    this.cameraX = 0;
    this.score = 0;
    this.crystalsGathered = 0;
    this.starsEarned = 0;

    // Entidades do Cenário
    this.obstacles = [];
    this.crystals = [];
    this.pulseGates = [];

    // Screen Shake & Camera
    this.trauma = 0;

    // Cores de Skins e Trilhas
    this.skinColors = {
      skin_cyan: '#00f0ff',
      skin_violet: '#a855f7',
      skin_solar: '#f97316',
      skin_emerald: '#10b981',
      skin_gold: '#facc15'
    };
    this.trailColors = {
      trail_wave: '#00f0ff',
      trail_stardust: '#ec4899',
      trail_plasma: '#3b82f6',
      trail_matrix: '#22c55e',
      trail_void: '#eab308'
    };

    ModalController.setGameInstance(this);
    this.initResize();
    this.initInputs();
  }

  initResize() {
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      this.w = window.innerWidth;
      this.h = window.innerHeight;
      this.canvas.width = this.w * dpr;
      this.canvas.height = this.h * dpr;
      this.ctx.resetTransform();
      this.ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', resize);
    resize();
  }

  initInputs() {
    const startPress = (e) => {
      // Ignora toques em botões de HUD ou modais
      if (e && e.target && (e.target.closest('button') || e.target.closest('.game-modal'))) return;
      if (!this.isRunning || this.isPaused || this.isAdPaused || this.isRoundOver) return;

      crazyGames.gameplayStart();
      this.isPressing = true;
      sound.playThrust();
    };

    const endPress = () => {
      this.isPressing = false;
    };

    window.addEventListener('mousedown', startPress);
    window.addEventListener('mouseup', endPress);
    window.addEventListener('touchstart', startPress, { passive: true });
    window.addEventListener('touchend', endPress, { passive: true });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!this.isRunning || this.isPaused || this.isAdPaused || this.isRoundOver) return;
        crazyGames.gameplayStart();
        this.isPressing = true;
        sound.playThrust();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        this.isPressing = false;
      }
    });
  }

  triggerHitStop(durationMs = 60) {
    this.isHitStopped = true;
    setTimeout(() => {
      this.isHitStopped = false;
    }, durationMs);
  }

  // Geração Procedural Homologada do Setor (1 a 15)
  generateSector(secNum) {
    this.sector = Math.max(1, Math.min(15, secNum));
    const speedMultiplier = 1.0 + (this.sector - 1) * 0.04;
    this.player.vx = this.player.baseSpeed * speedMultiplier;
    this.player.vy = this.player.baseSpeed * speedMultiplier;

    this.levelLength = 5500 + this.sector * 1200;
    this.portalX = this.levelLength;

    this.obstacles = [];
    this.crystals = [];
    this.pulseGates = [];
    this.particles.clear();

    const corridorHalfHeight = Math.max(130, 270 - this.sector * 8);
    let currentX = 500;

    while (currentX < this.levelLength - 500) {
      const freq = 0.0018 + this.sector * 0.0001;
      const midY = this.h / 2 + Math.sin(currentX * freq) * (this.h * 0.22);
      const topY = Math.max(45, midY - corridorHalfHeight);
      const botY = Math.min(this.h - 45, midY + corridorHalfHeight);

      // Serras Superiores e Inferiores de Antimatéria
      this.obstacles.push({
        x: currentX,
        y: topY,
        type: 'saw',
        radius: 20 + (this.sector % 4) * 3,
        rot: 0
      });

      this.obstacles.push({
        x: currentX + 160,
        y: botY,
        type: 'saw',
        radius: 20 + (this.sector % 4) * 3,
        rot: 0
      });

      // Pilares centrais a partir do setor 2
      if (this.sector >= 2 && Math.random() > 0.42) {
        this.obstacles.push({
          x: currentX + 320,
          y: midY + (Math.random() - 0.5) * 60,
          type: 'pillar',
          w: 22,
          h: 80 + this.sector * 2
        });
      }

      // Lasers Quânticos pulsantes a partir do setor 4
      if (this.sector >= 4 && Math.random() > 0.55) {
        this.obstacles.push({
          x: currentX + 480,
          y: midY,
          type: 'laser',
          h: corridorHalfHeight * 1.5,
          timer: 0,
          active: true
        });
      }

      // Portais de Pulso Temporal a cada ~1100 pixels
      if (currentX % 1100 < 350) {
        this.pulseGates.push({
          x: currentX + 220,
          y: midY,
          radius: 45,
          passed: false
        });
      }

      // Cristais Quânticos dispersos harmonicamente
      for (let c = 0; c < 3; c++) {
        const cy = midY + Math.sin((currentX + c * 50) * 0.02) * 50;
        this.crystals.push({
          x: currentX + 80 + c * 60,
          y: cy,
          collected: false
        });
      }

      currentX += 280 + Math.random() * 120;
    }
  }

  // Reset Incondicional com Anti-Softlock
  loadSector(secNum) {
    this.isRoundOver = false;
    this.isPaused = false;
    this.isAdPaused = false;
    this.hasWon = false;
    this.hasRevivedThisRun = false;
    sound.setAdMuted(false);
    ModalController.closeAll();

    this.score = 0;
    this.crystalsGathered = 0;
    this.starsEarned = 0;
    this.trauma = 0;

    // Carrega escudos do savegame
    const save = SaveManager.get();
    const shieldLvl = save.upgrades.shield || 1;
    this.player.maxShields = shieldLvl;
    this.player.shields = shieldLvl;

    this.generateSector(secNum);
    this.resetPlayer();

    GameHUD.showHUD();
    GameHUD.updateSector(this.sector);
    GameHUD.updateScore(this.score);
    GameHUD.updateHighScore(save.highScore || 0);
    GameHUD.updateCrystals(save.crystals || 0);
    GameHUD.updateShield(this.player.shields, this.player.maxShields);
    GameHUD.updateProgress(0, 0);

    this.isRunning = true;
    this.lastTime = performance.now();
    sound.startRhythmDrone();
    requestAnimationFrame((t) => this.loop(t));
  }

  resetPlayer() {
    this.player.x = 120;
    this.player.y = this.h / 2;
    this.player.trail = [];
    this.player.invulnerableTimer = 0;
    this.player.scaleX = 1.0;
    this.player.scaleY = 1.0;
    this.cameraX = 0;
  }

  pause() {
    if (this.isRoundOver) return;
    this.isPaused = true;
    crazyGames.gameplayStop();
    ModalController.open('modal-pause');
  }

  resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
    ModalController.close('modal-pause');
    crazyGames.gameplayStart();
    requestAnimationFrame((t) => this.loop(t));
  }

  // Revive Recompensado (Rewarded Ad) com 3s de Escudo Invulnerável
  revivePlayer() {
    this.hasRevivedThisRun = true;
    this.isRoundOver = false;
    this.hasWon = false;
    this.player.invulnerableTimer = 3.0; // 3 segundos de invulnerabilidade
    this.player.shields = Math.max(1, this.player.shields);

    // Destrói obstáculos num raio de 350px ao redor do jogador
    this.obstacles = this.obstacles.filter(obs => Math.abs(obs.x - this.player.x) > 350);

    this.particles.emitRing(this.player.x, this.player.y, '#00f0ff', 120);
    this.particles.addPopup(this.player.x, this.player.y - 30, 'REVIVED! 3s SHIELD', '#00f0ff');
    sound.playWin();

    ModalController.close('modal-defeat');
    GameHUD.updateShield(this.player.shields, this.player.maxShields);

    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    crazyGames.gameplayStart();
    requestAnimationFrame((t) => this.loop(t));
  }

  onDie() {
    if (this.player.invulnerableTimer > 0) return;

    // Se possui escudo temporal ativo, absorve o dano
    if (this.player.shields > 0) {
      this.player.shields--;
      this.player.invulnerableTimer = 1.6;
      this.trauma = 0.5;
      this.triggerHitStop(50);
      sound.playShieldPop();
      this.particles.emitRing(this.player.x, this.player.y, '#38bdf8', 90);
      this.particles.addPopup(this.player.x, this.player.y - 25, 'SHIELD POPPED!', '#38bdf8');
      GameHUD.updateShield(this.player.shields, this.player.maxShields);
      return;
    }

    // Sem escudo: Derrota
    this.isRoundOver = true;
    this.hasWon = false;
    crazyGames.gameplayStop();
    sound.playCrash();
    this.trauma = 0.85;
    this.triggerHitStop(70);

    this.particles.emit(this.player.x, this.player.y, 35, '#ef4444', 1.5);

    // Abre modal de Derrota
    setTimeout(() => {
      // Exibe ou oculta botão de Revive se já usado na rodada
      const btnRevive = document.getElementById('btn-revive-ad');
      if (btnRevive) {
        if (this.hasRevivedThisRun) btnRevive.classList.add('hidden');
        else btnRevive.classList.remove('hidden');
      }
      ModalController.open('modal-defeat');
    }, 280);
  }

  onVictory(forcedStars = null) {
    this.isRoundOver = true;
    this.hasWon = true;
    crazyGames.gameplayStop();

    // Cálculo de Estrelas:
    // Se forçado (ex: botão de concluir 1★): 1 estrela
    // Se completou 100%: 2 ou 3 estrelas dependendo dos cristais
    if (forcedStars) {
      this.starsEarned = forcedStars;
    } else {
      if (this.crystalsGathered >= 15 && !this.hasRevivedThisRun) {
        this.starsEarned = 3;
      } else if (this.crystalsGathered >= 8) {
        this.starsEarned = 2;
      } else {
        this.starsEarned = 1;
      }
    }

    sound.playWin();
    this.particles.emitVictoryConfetti(this.player.x, this.player.y);

    // Persistência de resultados no savegame
    SaveManager.updateSectorResult(this.sector, this.starsEarned, this.score);
    SaveManager.addCrystals(this.crystalsGathered);

    // Atualiza HUD e Modal de Vitória
    const starsText = '★'.repeat(this.starsEarned) + '☆'.repeat(3 - this.starsEarned);
    GameHUD.safeSetText('vic-stars-display', starsText);
    GameHUD.safeSetText('vic-score-val', String(this.score));
    GameHUD.safeSetText('vic-crystals-val', String(this.crystalsGathered));

    setTimeout(() => {
      // Solicita Midgame Ad com cooldown e watchdog em vitória
      crazyGames.requestMidgameAd(() => {
        ModalController.open('modal-victory');
      });
    }, 450);
  }

  loop(currentTime) {
    if (!this.isRunning || this.isPaused || this.isAdPaused || this.isRoundOver) return;

    if (this.isHitStopped) {
      this.render();
      requestAnimationFrame((t) => this.loop(t));
      return;
    }

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    // Anti-NaN Guarda
    if (!Number.isFinite(this.player.x) || !Number.isFinite(this.player.y)) {
      this.resetPlayer();
      return;
    }

    // Movimentação Contínua em 45°
    this.player.x += this.player.vx * dt;
    if (this.isPressing) {
      this.player.y -= this.player.vy * dt;
      // Squash & Stretch: alonga ao subir
      this.player.scaleX = Math.min(1.25, this.player.scaleX + dt * 3);
      this.player.scaleY = Math.max(0.85, this.player.scaleY - dt * 3);
    } else {
      this.player.y += this.player.vy * dt;
      // Retorna para escala normal
      this.player.scaleX = Math.max(0.9, this.player.scaleX - dt * 2);
      this.player.scaleY = Math.min(1.15, this.player.scaleY + dt * 2);
    }

    // Invulnerabilidade temporária
    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer = Math.max(0, this.player.invulnerableTimer - dt);
    }

    // Câmera fluida
    this.cameraX = this.player.x - 160;

    // Histórico de Rastro (Trail)
    this.player.trail.unshift({ x: this.player.x, y: this.player.y });
    if (this.player.trail.length > this.player.maxTrail) {
      this.player.trail.pop();
    }

    // Partículas e Trauma (Screen Shake)
    this.particles.update(dt);
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 1.8);
    }

    // Limites de Teto e Chão da Fenda
    if (this.player.y <= 24 || this.player.y >= this.h - 24) {
      this.onDie();
      return;
    }

    // Cálculo de Progresso (0 a 100%)
    const progressPct = Math.min(100, Math.max(0, (this.player.x / this.levelLength) * 100));
    const starsUnlocked = progressPct >= 99 ? 3 : (progressPct >= 70 ? 2 : (progressPct >= 35 ? 1 : 0));
    GameHUD.updateProgress(progressPct, starsUnlocked);

    // Pontuação baseada em distância e bônus de upgrade Chrono
    const save = SaveManager.get();
    const chronoBonus = 1.0 + ((save.upgrades.chrono || 1) - 1) * 0.15;
    this.score = Math.floor((this.player.x / 10) * chronoBonus);
    GameHUD.updateScore(this.score);

    // Atualiza progresso da missão de distância
    SaveManager.updateQuestProgress('fly_distance', Math.floor(this.player.vx * dt));

    // Coleta de Cristais Quânticos (com ímã de atração baseado em upgrades)
    const magnetRange = 40 + (save.upgrades.magnet || 1) * 18;
    for (const c of this.crystals) {
      if (c.collected) continue;
      const dx = this.player.x - c.x;
      const dy = this.player.y - c.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Efeito de atração gravitacional do ímã
      if (dist < magnetRange) {
        c.x += (this.player.x - c.x) * dt * 8;
        c.y += (this.player.y - c.y) * dt * 8;
      }

      // Coleta por contato
      if (dist < this.player.size + 14) {
        c.collected = true;
        this.crystalsGathered++;
        sound.playCrystal();
        this.particles.emit(c.x, c.y, 10, '#facc15', 0.8);
        this.particles.addPopup(c.x, c.y - 15, '+1 💎', '#facc15');
      }
    }

    // Travessia de Portais de Pulso Temporal
    for (const gate of this.pulseGates) {
      if (gate.passed) continue;
      const dx = this.player.x - gate.x;
      const dy = this.player.y - gate.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < gate.radius + this.player.size) {
        gate.passed = true;
        sound.playPulseGate();
        this.trauma = 0.35;
        this.particles.emitRing(gate.x, gate.y, '#00f0ff', 100);
        this.particles.addPopup(gate.x, gate.y - 30, 'TEMPORAL PULSE! +150', '#00f0ff');
        this.score += 150;
      }
    }

    // Colisão com Obstáculos
    for (const obs of this.obstacles) {
      // Pula obstáculos distantes da câmera
      if (obs.x < this.cameraX - 100 || obs.x > this.cameraX + this.w + 100) continue;

      if (obs.type === 'saw') {
        obs.rot += dt * 6.5;
        const dx = this.player.x - obs.x;
        const dy = this.player.y - obs.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < obs.radius + this.player.size * 0.65) {
          this.onDie();
          return;
        }
      } else if (obs.type === 'pillar') {
        if (
          this.player.x + this.player.size > obs.x - obs.w / 2 &&
          this.player.x - this.player.size < obs.x + obs.w / 2 &&
          this.player.y + this.player.size > obs.y - obs.h / 2 &&
          this.player.y - this.player.size < obs.y + obs.h / 2
        ) {
          this.onDie();
          return;
        }
      } else if (obs.type === 'laser') {
        obs.timer = (obs.timer || 0) + dt;
        obs.active = Math.sin(obs.timer * 3) > -0.2; // Pulso do laser
        if (obs.active) {
          if (
            Math.abs(this.player.x - obs.x) < 12 &&
            Math.abs(this.player.y - obs.y) < obs.h / 2
          ) {
            this.onDie();
            return;
          }
        }
      }
    }

    // Vitória por cruzamento do Portal Final
    if (this.player.x >= this.portalX) {
      this.onVictory();
    }
  }

  render() {
    const ctx = this.ctx;
    const save = SaveManager.get();

    // Screen Shake com Trauma²
    ctx.save();
    if (this.trauma > 0) {
      const shake = this.trauma * this.trauma * 18;
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    }

    // Fundo Cósmico Profundo com Gradiente
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.h);
    bgGrad.addColorStop(0, '#03050c');
    bgGrad.addColorStop(0.5, '#070c1e');
    bgGrad.addColorStop(1, '#050711');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.w, this.h);

    // Grade Quântica Parallax
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridOffset = -(this.cameraX % 50);
    for (let x = gridOffset; x < this.w; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.h);
      ctx.stroke();
    }
    for (let y = 0; y < this.h; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.w, y);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(-this.cameraX, 0);

    // Renderiza Bordas Neon Superior e Inferior da Fenda
    ctx.save();
    ctx.strokeStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.cameraX - 50, 20);
    ctx.lineTo(this.cameraX + this.w + 50, 20);
    ctx.moveTo(this.cameraX - 50, this.h - 20);
    ctx.lineTo(this.cameraX + this.w + 50, this.h - 20);
    ctx.stroke();
    ctx.restore();

    // Renderiza Portais de Pulso Temporal
    for (const gate of this.pulseGates) {
      if (gate.x < this.cameraX - 80 || gate.x > this.cameraX + this.w + 80) continue;
      ctx.save();
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = gate.passed ? 8 : 22;
      ctx.strokeStyle = gate.passed ? '#00f0ff40' : '#00f0ff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(gate.x, gate.y, gate.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = gate.passed ? 'rgba(0, 240, 255, 0.03)' : 'rgba(0, 240, 255, 0.15)';
      ctx.fill();
      ctx.restore();
    }

    // Renderiza Cristais Quânticos
    for (const c of this.crystals) {
      if (c.collected) continue;
      if (c.x < this.cameraX - 40 || c.x > this.cameraX + this.w + 40) continue;

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(Math.PI / 4);
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-6, -6, 12, 12);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-6, -6, 12, 12);
      ctx.restore();
    }

    // Renderiza Obstáculos
    for (const obs of this.obstacles) {
      if (obs.x < this.cameraX - 120 || obs.x > this.cameraX + this.w + 120) continue;

      if (obs.type === 'saw') {
        ctx.save();
        ctx.translate(obs.x, obs.y);
        ctx.rotate(obs.rot);
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 16;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        const teeth = 8;
        for (let i = 0; i < teeth * 2; i++) {
          const r = i % 2 === 0 ? obs.radius : obs.radius * 0.6;
          const a = (i * Math.PI) / teeth;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.fill();
        ctx.restore();
      } else if (obs.type === 'pillar') {
        ctx.save();
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(obs.x - obs.w / 2, obs.y - obs.h / 2, obs.w, obs.h);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(obs.x - obs.w / 2, obs.y - obs.h / 2, obs.w, obs.h);
        ctx.restore();
      } else if (obs.type === 'laser') {
        ctx.save();
        if (obs.active) {
          ctx.shadowColor = '#ec4899';
          ctx.shadowBlur = 18;
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y - obs.h / 2);
          ctx.lineTo(obs.x, obs.y + obs.h / 2);
          ctx.stroke();
        } else {
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.2)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y - obs.h / 2);
          ctx.lineTo(obs.x, obs.y + obs.h / 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // Renderiza Portal Final da Tapeçaria
    ctx.save();
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 32;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(this.portalX, 0);
    ctx.lineTo(this.portalX, this.h);
    ctx.stroke();
    ctx.restore();

    // Rastro da Nave (Trail Personalizado)
    const trailColor = this.trailColors[save.equippedTrail] || '#00f0ff';
    if (this.player.trail.length > 1) {
      ctx.save();
      for (let i = 0; i < this.player.trail.length - 1; i++) {
        const pt1 = this.player.trail[i];
        const pt2 = this.player.trail[i + 1];
        const alpha = 1.0 - i / this.player.trail.length;
        ctx.strokeStyle = trailColor;
        ctx.shadowColor = trailColor;
        ctx.shadowBlur = 12;
        ctx.lineWidth = (1.0 - i / this.player.trail.length) * 7;
        ctx.globalAlpha = alpha * 0.85;
        ctx.beginPath();
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Renderiza Nave Neon (Void Weaver)
    ctx.save();
    ctx.translate(this.player.x, this.player.y);
    const angle = this.isPressing ? -Math.PI / 4 : Math.PI / 4;
    ctx.rotate(angle);
    ctx.scale(this.player.scaleX, this.player.scaleY);

    const shipColor = this.skinColors[save.equippedSkin] || '#00f0ff';

    // Se estiver invulnerável, pisca
    if (this.player.invulnerableTimer > 0 && Math.floor(performance.now() / 80) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Escudo Temporal visível ao redor da nave
    if (this.player.shields > 0) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, this.player.size * 1.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.shadowColor = shipColor;
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffffff';

    // Forma aerodinâmica do tecelão quântico
    ctx.beginPath();
    ctx.moveTo(this.player.size * 1.5, 0);
    ctx.lineTo(-this.player.size, -this.player.size * 0.75);
    ctx.lineTo(-this.player.size * 0.4, 0);
    ctx.lineTo(-this.player.size, this.player.size * 0.75);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = shipColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();

    // Partículas e Popups
    this.particles.render(ctx);

    ctx.restore(); // Restaura câmera
    ctx.restore(); // Restaura trauma
  }
}
