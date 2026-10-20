// Safe DOM Controller para HUD Flutuante Sobreposto e Indicadores de Fase
import { I18n } from './i18n.js';

export class GameHUD {
  static safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  static safeSetWidth(id, pct) {
    const el = document.getElementById(id);
    if (el) el.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }

  static safeSetClass(id, className, add = true) {
    const el = document.getElementById(id);
    if (el) {
      if (add) el.classList.add(className);
      else el.classList.remove(className);
    }
  }

  static showHUD() {
    const el = document.getElementById('in-game-hud');
    if (el) el.classList.remove('hidden');
  }

  static hideHUD() {
    const el = document.getElementById('in-game-hud');
    if (el) el.classList.add('hidden');
  }

  // Atualiza barra de progresso e ativa marcos de estrelas (1★: 35%, 2★: 70%, 3★: 100%)
  static updateProgress(pct, starsReached = 0) {
    this.safeSetWidth('hud-progress-fill', pct);
    this.safeSetText('hud-progress-text', `${Math.floor(pct)}%`);

    // Marcos de Estrelas Visuais no HUD
    const pin1 = document.getElementById('star-pin-1');
    const pin2 = document.getElementById('star-pin-2');
    const pin3 = document.getElementById('star-pin-3');

    if (pin1) {
      if (pct >= 35 || starsReached >= 1) pin1.classList.add('active');
      else pin1.classList.remove('active');
    }
    if (pin2) {
      if (pct >= 70 || starsReached >= 2) pin2.classList.add('active');
      else pin2.classList.remove('active');
    }
    if (pin3) {
      if (pct >= 99 || starsReached >= 3) pin3.classList.add('active');
      else pin3.classList.remove('active');
    }

    // Botão "Concluir Fase (★)" surge imediatamente ao atingir 1 estrela (35%)
    const btnPass = document.getElementById('btn-conclude-star');
    if (btnPass) {
      if (pct >= 35 || starsReached >= 1) {
        btnPass.classList.remove('hidden');
      } else {
        btnPass.classList.add('hidden');
      }
    }
  }

  static updateScore(score) {
    this.safeSetText('hud-score-val', String(score));
  }

  static updateHighScore(best) {
    this.safeSetText('hud-best-val', String(best));
  }

  static updateCrystals(crystals) {
    this.safeSetText('hud-crystals-val', String(crystals));
  }

  static updateSector(sec) {
    this.safeSetText('hud-level-val', String(sec).padStart(2, '0'));
  }

  static updateShield(current, max) {
    this.safeSetText('hud-shield-val', `${current}/${max}`);
    const shieldBadge = document.getElementById('badge-shield');
    if (shieldBadge) {
      if (current > 0) shieldBadge.classList.remove('depleted');
      else shieldBadge.classList.add('depleted');
    }
  }
}
