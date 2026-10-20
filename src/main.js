// Ponto de Entrada Principal (Main Boot & Event Bindings)
import { I18n } from './i18n.js';
import { SaveManager } from './storage.js';
import { sound } from './audio.js';
import { GameHUD } from './hud.js';
import { RhythmWaveGame } from './game.js';
import { FluidClebIntro } from './intro.js';
import { ModalController } from './modalController.js';
import { MetaGameUI } from './metaGame.js';
import { LuckySpin } from './luckySpin.js';
import { crazyGames } from './crazygames.js';

window.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializa Localização e Savegame Seguro
  I18n.init();
  const save = SaveManager.load();

  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  const game = new RhythmWaveGame(canvas);
  let luckySpinInstance = null;

  // Função para atualizar todos os textos traduzíveis no DOM
  const updateLocalizationTexts = () => {
    GameHUD.safeSetText('label-hud-sector', I18n.t('hudSector'));
    GameHUD.safeSetText('label-hud-shield', I18n.t('hudShield'));
    GameHUD.safeSetText('label-hud-crystals', I18n.t('hudCrystals'));
    GameHUD.safeSetText('label-hud-score', I18n.t('hudScore'));
    GameHUD.safeSetText('text-touch-hint', I18n.t('touchHint'));
    GameHUD.safeSetText('btn-conclude-star', I18n.t('btnFinishPhaseStar'));

    // Start Modal
    GameHUD.safeSetText('start-title', I18n.t('gameTitle'));
    GameHUD.safeSetText('start-subtitle', I18n.t('gameSubtitle'));
    GameHUD.safeSetText('start-lore', I18n.t('loreText'));
    GameHUD.safeSetText('guide-ascend', I18n.t('guideAscend'));
    GameHUD.safeSetText('guide-descend', I18n.t('guideDescend'));
    GameHUD.safeSetText('guide-dodge', I18n.t('guideDodge'));
    GameHUD.safeSetText('guide-collect', I18n.t('guideCollect'));
    GameHUD.safeSetText('btn-start-game', I18n.t('btnPlayNow'));

    // Pause Modal
    GameHUD.safeSetText('pause-title', I18n.t('pauseTitle'));
    GameHUD.safeSetText('btn-resume-game', I18n.t('btnResume'));
    GameHUD.safeSetText('btn-restart-from-pause', I18n.t('btnRestart'));
    GameHUD.safeSetText('btn-pause-to-levels', I18n.t('btnQuitSector'));

    // Victory Modal
    GameHUD.safeSetText('vic-title', I18n.t('victoryTitle'));
    GameHUD.safeSetText('vic-sub', I18n.t('victorySub'));
    GameHUD.safeSetText('btn-next-level', I18n.t('btnNextSector'));
    GameHUD.safeSetText('btn-replay-level', I18n.t('btnReplay'));
    GameHUD.safeSetText('btn-double-victory-rewards', I18n.t('btnDoubleRewards'));
    GameHUD.safeSetText('btn-victory-to-levels', I18n.t('btnQuitSector'));

    // Defeat Modal
    GameHUD.safeSetText('defeat-title', I18n.t('defeatTitle'));
    GameHUD.safeSetText('defeat-sub', I18n.t('defeatSub'));
    GameHUD.safeSetText('btn-revive-ad', I18n.t('btnReviveAd'));
    GameHUD.safeSetText('btn-defeat-retry', I18n.t('btnTryAgain'));
    GameHUD.safeSetText('btn-defeat-to-levels', I18n.t('btnQuitSector'));

    // Lang toggle button
    GameHUD.safeSetText('btn-lang-toggle', I18n.t('langToggle'));
  };

  I18n.onChange(() => updateLocalizationTexts());
  updateLocalizationTexts();

  // 2. Executa Splash Screen Procedural da FluidCleb Interactive (0.0s a 2.8s)
  new FluidClebIntro(canvas, () => {
    // Ao finalizar a intro, exibe a apresentação dinâmica da Lore (1 clique para jogar)
    ModalController.open('modal-start');
  }).start();

  // 3. Vinculação de Botões de Ação Primária

  // Botão Iniciar Partida (Entra na gameplay com 1 clique)
  const btnStart = document.getElementById('btn-start-game');
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      sound.init();
      sound.playClick();
      ModalController.close('modal-start');
      game.loadSector(1);
    });
  }

  // Botão Instantâneo de Conclusão ao atingir 1 Estrela (35%)
  const btnConcludeStar = document.getElementById('btn-conclude-star');
  if (btnConcludeStar) {
    btnConcludeStar.addEventListener('click', () => {
      sound.playClick();
      game.onVictory(1); // Conclui com 1 estrela imediata
    });
  }

  // Botão Pausa
  const btnPause = document.getElementById('btn-pause-toggle');
  if (btnPause) {
    btnPause.addEventListener('click', () => {
      sound.playClick();
      game.pause();
    });
  }

  // Botão Continuar
  const btnResume = document.getElementById('btn-resume-game');
  if (btnResume) {
    btnResume.addEventListener('click', () => {
      sound.playClick();
      game.resume();
    });
  }

  // Botão Reiniciar Fase a partir da Pausa (Anti-Reload)
  const btnRestartPause = document.getElementById('btn-restart-from-pause');
  if (btnRestartPause) {
    btnRestartPause.addEventListener('click', () => {
      sound.playClick();
      game.loadSector(game.sector);
    });
  }

  // Próximo Setor na Vitória
  const btnNext = document.getElementById('btn-next-level');
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      sound.playClick();
      game.loadSector(game.sector + 1);
    });
  }

  // Repetir Setor na Vitória
  const btnReplay = document.getElementById('btn-replay-level');
  if (btnReplay) {
    btnReplay.addEventListener('click', () => {
      sound.playClick();
      game.loadSector(game.sector);
    });
  }

  // Tentar Novamente na Derrota
  const btnDefeatRetry = document.getElementById('btn-defeat-retry');
  if (btnDefeatRetry) {
    btnDefeatRetry.addEventListener('click', () => {
      sound.playClick();
      game.loadSector(game.sector);
    });
  }

  // Rewarded Ad: Dobrar Recompensas na Vitória
  const btnDoubleVic = document.getElementById('btn-double-victory-rewards');
  if (btnDoubleVic) {
    btnDoubleVic.addEventListener('click', () => {
      crazyGames.requestRewardedAd('victory_double', () => {
        sound.playWin();
        SaveManager.addCrystals(game.crystalsGathered); // Dobra cristais
        btnDoubleVic.classList.add('hidden');
        GameHUD.safeSetText('vic-crystals-val', `${game.crystalsGathered * 2} 💎`);
        GameHUD.updateCrystals(SaveManager.get().crystals);
      });
    });
  }

  // Rewarded Ad: Reviver Nave com 3s de Escudo
  const btnRevive = document.getElementById('btn-revive-ad');
  if (btnRevive) {
    btnRevive.addEventListener('click', () => {
      crazyGames.requestRewardedAd('revive_vessel', () => {
        game.revivePlayer();
      });
    });
  }

  // Mute / Desmute de Som
  const btnSound = document.getElementById('btn-sound-toggle');
  if (btnSound) {
    btnSound.addEventListener('click', () => {
      sound.init();
      const newMuted = !sound.isMuted;
      sound.setMuted(newMuted);
      btnSound.textContent = newMuted ? '🔇' : '🔊';
    });
  }

  // Toggle de Idioma (EN / PT-BR)
  const btnLang = document.getElementById('btn-lang-toggle');
  if (btnLang) {
    btnLang.addEventListener('click', () => {
      sound.playClick();
      I18n.toggleLang();
    });
  }

  // 4. Modais do Meta-Game e Retenção (Subagente 5)

  // Abrir Calendário Diário (7 Dias)
  const btnOpenDaily = document.getElementById('btn-open-daily');
  if (btnOpenDaily) {
    btnOpenDaily.addEventListener('click', () => {
      sound.playClick();
      MetaGameUI.renderDailyRewards('daily-rewards-container', () => {
        GameHUD.updateCrystals(SaveManager.get().crystals);
      });
      ModalController.open('modal-daily');
    });
  }

  // Abrir Missões
  const btnOpenQuests = document.getElementById('btn-open-quests');
  if (btnOpenQuests) {
    btnOpenQuests.addEventListener('click', () => {
      sound.playClick();
      MetaGameUI.renderQuests('quests-container', () => {
        GameHUD.updateCrystals(SaveManager.get().crystals);
      });
      ModalController.open('modal-quests');
    });
  }

  // Abrir Loja Meta
  const btnOpenShop = document.getElementById('btn-open-shop');
  if (btnOpenShop) {
    btnOpenShop.addEventListener('click', () => {
      sound.playClick();
      MetaGameUI.renderShop('shop-container', 'skins', () => {
        GameHUD.updateCrystals(SaveManager.get().crystals);
      });
      ModalController.open('modal-shop');
    });
  }

  // Abrir Roleta da Sorte (Lucky Spin)
  const btnOpenSpin = document.getElementById('btn-open-spin');
  if (btnOpenSpin) {
    btnOpenSpin.addEventListener('click', () => {
      sound.playClick();
      ModalController.open('modal-spin');
      if (!luckySpinInstance) {
        luckySpinInstance = new LuckySpin('spin-canvas');
      } else {
        luckySpinInstance.draw();
      }

      const btnSpinAction = document.getElementById('btn-spin-action');
      if (btnSpinAction) {
        const canFree = luckySpinInstance.canFreeSpin();
        btnSpinAction.textContent = canFree ? I18n.t('btnSpinFree') : I18n.t('btnSpinAd');
      }
    });
  }

  // Ação de Girar a Roleta
  const btnSpinAction = document.getElementById('btn-spin-action');
  if (btnSpinAction) {
    btnSpinAction.addEventListener('click', () => {
      if (!luckySpinInstance || luckySpinInstance.isSpinning) return;
      const canFree = luckySpinInstance.canFreeSpin();

      const doSpin = () => {
        btnSpinAction.textContent = I18n.t('spinning');
        luckySpinInstance.spin((prize) => {
          GameHUD.updateCrystals(SaveManager.get().crystals);
          const canNow = luckySpinInstance.canFreeSpin();
          btnSpinAction.textContent = canNow ? I18n.t('btnSpinFree') : I18n.t('btnSpinAd');
        });
      };

      if (canFree) {
        SaveManager.get().lastFreeSpinTime = Date.now();
        SaveManager.save();
        doSpin();
      } else {
        // Giro via Rewarded Ad
        crazyGames.requestRewardedAd('lucky_spin', () => {
          doSpin();
        });
      }
    });
  }

  // Abrir Seletor de Setores (15 Setores)
  const openLevelSelector = () => {
    sound.playClick();
    MetaGameUI.renderLevelSelect('levels-container', (selectedSec) => {
      ModalController.close('modal-levels');
      game.loadSector(selectedSec);
    });
    ModalController.open('modal-levels');
  };

  const btnOpenLevels = document.getElementById('btn-open-levels');
  if (btnOpenLevels) btnOpenLevels.addEventListener('click', openLevelSelector);

  const btnPauseToLevels = document.getElementById('btn-pause-to-levels');
  if (btnPauseToLevels) btnPauseToLevels.addEventListener('click', openLevelSelector);

  const btnVicToLevels = document.getElementById('btn-victory-to-levels');
  if (btnVicToLevels) btnVicToLevels.addEventListener('click', openLevelSelector);

  const btnDefeatToLevels = document.getElementById('btn-defeat-to-levels');
  if (btnDefeatToLevels) btnDefeatToLevels.addEventListener('click', openLevelSelector);

  // Botões de Fechar Modal genéricos (X)
  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      sound.playClick();
      ModalController.close(modalId);
    });
  });
});
