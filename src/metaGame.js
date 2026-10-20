// Módulos de Meta-Game, Economia, Loja e Progressão (Subagente 5)
import { SaveManager } from './storage.js';
import { I18n } from './i18n.js';
import { sound } from './audio.js';
import { crazyGames } from './crazygames.js';

export class MetaGameUI {
  // 1. Renderiza Calendário de Login Diário (7 Dias)
  static renderDailyRewards(containerId, onClaimCallback) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const save = SaveManager.get();
    const status = SaveManager.checkDailyLoginStatus();
    const currentStreak = save.dailyLogin.dayStreak % 7;

    const rewardsConfig = [
      { day: 1, text: '100 💎', desc: '100 Cristais' },
      { day: 2, text: '250 💎', desc: '250 Cristais' },
      { day: 3, text: '400 💎 + 🛡️', desc: 'Escudo Extra' },
      { day: 4, text: '600 💎', desc: '600 Cristais' },
      { day: 5, text: '850 💎 + 🌌', desc: 'Rastro Matrix' },
      { day: 6, text: '1200 💎', desc: '1200 Cristais' },
      { day: 7, text: '2000 💎 + 👑', desc: 'Nave Void Lord' }
    ];

    let html = '<div class="daily-grid">';
    rewardsConfig.forEach(r => {
      let stateClass = '';
      if (r.day < status.day) stateClass = 'claimed';
      else if (r.day === status.day && status.canClaim) stateClass = 'ready';
      else stateClass = 'locked';

      html += `
        <div class="daily-card ${stateClass}">
          <div class="day-num">${I18n.t('dayLabel')} ${r.day}</div>
          <div class="reward-icon">${r.text}</div>
          <div class="reward-desc">${r.desc}</div>
          ${stateClass === 'claimed' ? `<span class="badge-claimed">✓</span>` : ''}
        </div>
      `;
    });
    html += '</div>';

    if (status.canClaim) {
      html += `
        <div class="daily-actions">
          <button id="btn-claim-daily" class="btn-play">${I18n.t('btnClaim')}</button>
          <button id="btn-claim-daily-double" class="btn-play gold">${I18n.t('btnClaimDouble')}</button>
        </div>
      `;
    } else {
      html += `<p class="daily-wait-msg">${I18n.t('claimed')} - Volte amanhã!</p>`;
    }

    container.innerHTML = html;

    const btnClaim = document.getElementById('btn-claim-daily');
    if (btnClaim) {
      btnClaim.addEventListener('click', () => {
        sound.playWin();
        const res = SaveManager.claimDailyLogin(1);
        if (onClaimCallback) onClaimCallback(res);
        this.renderDailyRewards(containerId, onClaimCallback);
      });
    }

    const btnDouble = document.getElementById('btn-claim-daily-double');
    if (btnDouble) {
      btnDouble.addEventListener('click', () => {
        crazyGames.requestRewardedAd('daily_double', () => {
          sound.playWin();
          const res = SaveManager.claimDailyLogin(2);
          if (onClaimCallback) onClaimCallback(res);
          this.renderDailyRewards(containerId, onClaimCallback);
        });
      });
    }
  }

  // 2. Renderiza Missões Diárias & Semanais
  static renderQuests(containerId, onClaimQuestCallback) {
    const container = document.getElementById(containerId);
    if (!container) return;

    SaveManager.checkDailyReset();
    const save = SaveManager.get();
    const isPt = I18n.currentLang === 'pt';

    let html = `
      <div class="quest-section">
        <h3>${I18n.t('dailyQuestsTab')}</h3>
        <div class="quest-list">
    `;

    save.quests.daily.forEach(q => {
      const desc = isPt ? q.descPt : q.descEn;
      const pct = Math.min(100, Math.floor((q.progress / q.target) * 100));
      html += `
        <div class="quest-card ${q.claimed ? 'claimed' : (q.completed ? 'ready' : '')}">
          <div class="quest-info">
            <span class="quest-desc">${desc}</span>
            <span class="quest-count">${q.progress}/${q.target}</span>
          </div>
          <div class="quest-bar-bg">
            <div class="quest-bar-fill" style="width: ${pct}%;"></div>
          </div>
          <div class="quest-action">
            <span class="reward-val">+${q.reward} 💎</span>
            ${q.claimed 
              ? `<span class="btn-quest-claimed">✓</span>`
              : (q.completed 
                ? `<button class="btn-quest-claim" data-qid="${q.id}">${I18n.t('btnCollectQuest')}</button>`
                : `<span class="badge-pending">...</span>`)}
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
      <div class="quest-section">
        <h3>${I18n.t('weeklyQuestsTab')}</h3>
        <div class="quest-list">
    `;

    save.quests.weekly.forEach(q => {
      const desc = isPt ? q.descPt : q.descEn;
      const pct = Math.min(100, Math.floor((q.progress / q.target) * 100));
      html += `
        <div class="quest-card ${q.claimed ? 'claimed' : (q.completed ? 'ready' : '')}">
          <div class="quest-info">
            <span class="quest-desc">${desc}</span>
            <span class="quest-count">${q.progress}/${q.target}</span>
          </div>
          <div class="quest-bar-bg">
            <div class="quest-bar-fill" style="width: ${pct}%;"></div>
          </div>
          <div class="quest-action">
            <span class="reward-val">+${q.reward} 💎</span>
            ${q.claimed 
              ? `<span class="btn-quest-claimed">✓</span>`
              : (q.completed 
                ? `<button class="btn-quest-claim" data-qid="${q.id}">${I18n.t('btnCollectQuest')}</button>`
                : `<span class="badge-pending">...</span>`)}
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Vincula botões de coleta de missão
    container.querySelectorAll('.btn-quest-claim').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const qid = e.target.getAttribute('data-qid');
        const q = [...save.quests.daily, ...save.quests.weekly].find(item => item.id === qid);
        if (q && q.completed && !q.claimed) {
          q.claimed = true;
          SaveManager.addCrystals(q.reward);
          sound.playWin();
          SaveManager.save();
          if (onClaimQuestCallback) onClaimQuestCallback(q);
          this.renderQuests(containerId, onClaimQuestCallback);
        }
      });
    });
  }

  // 3. Renderiza Seletor de Fases / Setores (15 Setores)
  static renderLevelSelect(containerId, onSelectSector) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const save = SaveManager.get();
    let html = '<div class="sector-grid">';

    save.sectors.forEach(s => {
      const starsStr = '★'.repeat(s.stars) + '☆'.repeat(3 - s.stars);
      const isLocked = !s.unlocked;

      html += `
        <div class="sector-card ${isLocked ? 'locked' : ''}" data-sector="${s.id}">
          <div class="sec-num">${I18n.t('hudSector')} ${String(s.id).padStart(2, '0')}</div>
          <div class="sec-stars">${starsStr}</div>
          <div class="sec-score">${s.highScore > 0 ? `${s.highScore} pts` : '--'}</div>
          ${isLocked ? `<div class="lock-overlay">🔒</div>` : ''}
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;

    container.querySelectorAll('.sector-card:not(.locked)').forEach(card => {
      card.addEventListener('click', () => {
        const secId = parseInt(card.getAttribute('data-sector'), 10);
        sound.playClick();
        if (onSelectSector) onSelectSector(secId);
      });
    });
  }

  // 4. Renderiza Loja Meta (Skins, Rastros, Upgrades)
  static renderShop(containerId, currentTab = 'skins', onShopUpdate) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const save = SaveManager.get();

    const skinsConfig = [
      { id: 'skin_cyan', name: 'Chronos Cyan', price: 0, color: '#00f0ff' },
      { id: 'skin_violet', name: 'Quantum Violet', price: 300, color: '#a855f7' },
      { id: 'skin_solar', name: 'Solar Flare', price: 600, color: '#f97316' },
      { id: 'skin_emerald', name: 'Void Emerald', price: 1000, color: '#10b981' },
      { id: 'skin_gold', name: 'Neon Sovereign', price: 2000, color: '#facc15' }
    ];

    const trailsConfig = [
      { id: 'trail_wave', name: 'Pulse Wave', price: 0, color: '#00f0ff' },
      { id: 'trail_stardust', name: 'Stardust Rain', price: 250, color: '#ec4899' },
      { id: 'trail_plasma', name: 'Plasma Beam', price: 500, color: '#3b82f6' },
      { id: 'trail_matrix', name: 'Matrix Glitch', price: 800, color: '#22c55e' },
      { id: 'trail_void', name: 'Void Chrono Fire', price: 1500, color: '#eab308' }
    ];

    const upgradesConfig = [
      { id: 'shield', title: I18n.t('upgradeShield'), desc: I18n.t('upgradeShieldDesc'), basePrice: 200 },
      { id: 'magnet', title: I18n.t('upgradeMagnet'), desc: I18n.t('upgradeMagnetDesc'), basePrice: 250 },
      { id: 'chrono', title: I18n.t('upgradeChrono'), desc: I18n.t('upgradeChronoDesc'), basePrice: 300 }
    ];

    let html = `
      <div class="shop-tabs">
        <button class="shop-tab ${currentTab === 'skins' ? 'active' : ''}" data-tab="skins">${I18n.t('tabSkins')}</button>
        <button class="shop-tab ${currentTab === 'trails' ? 'active' : ''}" data-tab="trails">${I18n.t('tabTrails')}</button>
        <button class="shop-tab ${currentTab === 'upgrades' ? 'active' : ''}" data-tab="upgrades">${I18n.t('tabUpgrades')}</button>
      </div>
      <div class="shop-content">
    `;

    if (currentTab === 'skins') {
      html += '<div class="shop-items-grid">';
      skinsConfig.forEach(s => {
        const isUnlocked = save.unlockedSkins.includes(s.id);
        const isEquipped = save.equippedSkin === s.id;
        html += `
          <div class="shop-item-card ${isEquipped ? 'equipped' : ''}">
            <div class="item-preview" style="border-color: ${s.color}; box-shadow: 0 0 15px ${s.color}66;">
              <span style="color: ${s.color}; font-size: 24px;">🚀</span>
            </div>
            <div class="item-name">${s.name}</div>
            <div class="item-price">${isUnlocked ? (isEquipped ? I18n.t('btnEquipped') : I18n.t('btnEquip')) : `${s.price} 💎`}</div>
            <button class="btn-shop-action ${isEquipped ? 'disabled' : ''}" data-type="skin" data-id="${s.id}" data-price="${s.price}">
              ${isEquipped ? I18n.t('btnEquipped') : (isUnlocked ? I18n.t('btnEquip') : I18n.t('btnBuy'))}
            </button>
          </div>
        `;
      });
      html += '</div>';
    } else if (currentTab === 'trails') {
      html += '<div class="shop-items-grid">';
      trailsConfig.forEach(t => {
        const isUnlocked = save.unlockedTrails.includes(t.id);
        const isEquipped = save.equippedTrail === t.id;
        html += `
          <div class="shop-item-card ${isEquipped ? 'equipped' : ''}">
            <div class="item-preview" style="border-color: ${t.color}; box-shadow: 0 0 15px ${t.color}66;">
              <div style="width: 40px; height: 6px; background: ${t.color}; border-radius: 4px; box-shadow: 0 0 10px ${t.color};"></div>
            </div>
            <div class="item-name">${t.name}</div>
            <div class="item-price">${isUnlocked ? (isEquipped ? I18n.t('btnEquipped') : I18n.t('btnEquip')) : `${t.price} 💎`}</div>
            <button class="btn-shop-action ${isEquipped ? 'disabled' : ''}" data-type="trail" data-id="${t.id}" data-price="${t.price}">
              ${isEquipped ? I18n.t('btnEquipped') : (isUnlocked ? I18n.t('btnEquip') : I18n.t('btnBuy'))}
            </button>
          </div>
        `;
      });
      html += '</div>';
    } else if (currentTab === 'upgrades') {
      html += '<div class="upgrades-list">';
      upgradesConfig.forEach(u => {
        const currentLvl = save.upgrades[u.id] || 1;
        const isMax = currentLvl >= 5;
        const upgradeCost = u.basePrice * currentLvl;
        html += `
          <div class="upgrade-row">
            <div class="upgrade-info">
              <span class="up-title">${u.title} (Nv. ${currentLvl}/5)</span>
              <span class="up-desc">${u.desc}</span>
            </div>
            <div class="upgrade-action">
              ${isMax 
                ? `<span class="badge-max">MAX</span>`
                : `<button class="btn-shop-action up-btn" data-type="upgrade" data-id="${u.id}" data-price="${upgradeCost}">
                    ${upgradeCost} 💎 Nv.${currentLvl + 1}
                   </button>`}
            </div>
          </div>
        `;
      });
      html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;

    // Tab buttons
    container.querySelectorAll('.shop-tab').forEach(tb => {
      tb.addEventListener('click', () => {
        const tab = tb.getAttribute('data-tab');
        sound.playClick();
        this.renderShop(containerId, tab, onShopUpdate);
      });
    });

    // Action buttons
    container.querySelectorAll('.btn-shop-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        const id = btn.getAttribute('data-id');
        const price = parseInt(btn.getAttribute('data-price'), 10);

        if (type === 'skin') {
          if (save.unlockedSkins.includes(id)) {
            save.equippedSkin = id;
            sound.playClick();
          } else {
            if (SaveManager.spendCrystals(price)) {
              save.unlockedSkins.push(id);
              save.equippedSkin = id;
              sound.playWin();
            } else {
              sound.playCrash();
            }
          }
        } else if (type === 'trail') {
          if (save.unlockedTrails.includes(id)) {
            save.equippedTrail = id;
            sound.playClick();
          } else {
            if (SaveManager.spendCrystals(price)) {
              save.unlockedTrails.push(id);
              save.equippedTrail = id;
              sound.playWin();
            } else {
              sound.playCrash();
            }
          }
        } else if (type === 'upgrade') {
          if (SaveManager.spendCrystals(price)) {
            save.upgrades[id] = (save.upgrades[id] || 1) + 1;
            sound.playWin();
          } else {
            sound.playCrash();
          }
        }

        SaveManager.save();
        if (onShopUpdate) onShopUpdate();
        this.renderShop(containerId, currentTab, onShopUpdate);
      });
    });
  }
}
