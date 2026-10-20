// Blindagem de Anúncios CrazyGames SDK v3 (Watchdog de 2.5s, _canRequestLiveAds, Finally Garantido)
import { sound } from './audio.js';

class CrazyGamesManager {
  constructor() {
    this.sdk = null;
    this.isInitialized = false;
    this.isAdActive = false;
    this.lastMidgameTime = 0;
    this.midgameCooldown = 210 * 1000; // 3.5 minutos entre midgame ads

    this.initSDK();
  }

  async initSDK() {
    try {
      if (window.CrazyGames && window.CrazyGames.SDK) {
        this.sdk = window.CrazyGames.SDK;
        await this.sdk.init();
        this.isInitialized = true;
        console.log('[CRAZYGAMES] SDK v3 Inicializado com sucesso.');
      } else {
        console.log('[CRAZYGAMES] SDK v3 não detectado no escopo global (Modo Local/Dev).');
      }
    } catch (e) {
      console.warn('[CRAZYGAMES] Erro durante init do SDK:', e);
    }
  }

  _canRequestLiveAds() {
    if (!this.sdk || !this.isInitialized) return false;
    
    // Verifica ambiente CrazyGames
    try {
      const env = this.sdk.environment;
      if (env === 'disabled') return false;

      const host = window.location.hostname || '';
      const isCrazyHost = host.includes('crazygames.com') || 
                          host.includes('1001juegos.com') ||
                          host.includes('crazygames.developer');

      // Se estiver em localhost ou ambiente de homologação externa sem SDK ativo, faz bypass instantâneo
      if (!isCrazyHost && (host === 'localhost' || host === '127.0.0.1' || host.includes('kinomuse.com.br'))) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  gameplayStart() {
    try {
      if (this.sdk && this.sdk.game && typeof this.sdk.game.gameplayStart === 'function') {
        this.sdk.game.gameplayStart();
      }
    } catch (e) {}
  }

  gameplayStop() {
    try {
      if (this.sdk && this.sdk.game && typeof this.sdk.game.gameplayStop === 'function') {
        this.sdk.game.gameplayStop();
      }
    } catch (e) {}
  }

  // Interstitial Midgame Ad com Watchdog de 2.5s
  requestMidgameAd(onComplete, onStartCallback) {
    const now = Date.now();
    // Respeita cooldown de 3.5 minutos
    if (now - this.lastMidgameTime < this.midgameCooldown) {
      if (onComplete) onComplete();
      return;
    }

    if (!this._canRequestLiveAds()) {
      if (onComplete) onComplete();
      return;
    }

    let hasFinished = false;
    this.isAdActive = true;
    sound.setAdMuted(true);
    if (onStartCallback) onStartCallback();

    const finish = () => {
      if (!hasFinished) {
        hasFinished = true;
        clearTimeout(watchdogTimer);
        this.isAdActive = false;
        this.lastMidgameTime = Date.now();
        sound.setAdMuted(false);
        if (onComplete) onComplete();
      }
    };

    // Watchdog de 2.5s: se o SDK travar ou demorar mais de 2.5s, destrava o jogo
    const watchdogTimer = setTimeout(() => {
      console.warn('[CRAZYGAMES] Watchdog disparado (Midgame Ad timeout de 2.5s).');
      finish();
    }, 2500);

    try {
      this.sdk.ad.requestAd('midgame', {
        adStarted: () => {
          clearTimeout(watchdogTimer);
          sound.setAdMuted(true);
        },
        adFinished: () => finish(),
        adError: (err) => {
          console.warn('[CRAZYGAMES] Midgame Ad error:', err);
          finish();
        }
      });
    } catch (e) {
      console.warn('[CRAZYGAMES] Exceção ao requisitar Midgame Ad:', e);
      finish();
    }
  }

  // Rewarded Ad com Watchdog de 2.5s (Para Revive, Dobrar Recompensas, Roleta)
  requestRewardedAd(rewardKey, onRewardGranted, onFailed, onStartCallback) {
    if (!this._canRequestLiveAds()) {
      // Em ambiente de teste/dev, simula sucesso para permitir testes de fluxo
      console.log('[CRAZYGAMES] Dev/Local: Simulando concessão de recompensa para', rewardKey);
      if (onRewardGranted) onRewardGranted();
      return;
    }

    let hasFinished = false;
    let earnedReward = false;
    this.isAdActive = true;
    sound.setAdMuted(true);
    if (onStartCallback) onStartCallback();

    const finish = () => {
      if (!hasFinished) {
        hasFinished = true;
        clearTimeout(watchdogTimer);
        this.isAdActive = false;
        sound.setAdMuted(false);

        if (earnedReward && onRewardGranted) {
          onRewardGranted();
        } else if (!earnedReward && onFailed) {
          onFailed();
        }
      }
    };

    const watchdogTimer = setTimeout(() => {
      console.warn('[CRAZYGAMES] Watchdog disparado (Rewarded Ad timeout de 2.5s).');
      finish();
    }, 2500);

    try {
      this.sdk.ad.requestAd('rewarded', {
        adStarted: () => {
          clearTimeout(watchdogTimer);
          sound.setAdMuted(true);
        },
        adFinished: () => {
          earnedReward = true;
          finish();
        },
        adError: (err) => {
          console.warn('[CRAZYGAMES] Rewarded Ad error (AdBlock ou falha):', err);
          earnedReward = false; // NUNCA concede recompensa em caso de AdBlock/erro
          finish();
        }
      });
    } catch (e) {
      console.warn('[CRAZYGAMES] Exceção ao requisitar Rewarded Ad:', e);
      finish();
    }
  }
}

export const crazyGames = new CrazyGamesManager();
