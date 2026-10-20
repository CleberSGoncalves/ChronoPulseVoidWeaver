// Sistema de Localização Bilíngue (EN padrão, PT-BR automático ou selecionável)
export class I18n {
  static currentLang = 'en';
  static listeners = [];

  static translations = {
    en: {
      // Intro & Lore
      gameTitle: 'ChronoPulse: The Void Weaver',
      gameSubtitle: 'Aethel Rift Temporal Symphony',
      introStudio: 'FLUIDCLEB INTERACTIVE',
      introStudios: 'STUDIOS',
      loreText: 'Within the frayed fabric of the Aethel Rift, a weaver of temporal particles channels harmonic pulses to mend quantum tapestries. Dodge antimatter needles, harness temporal pulse gates, and restore cosmic balance.',
      guideAscend: 'Press & Hold (Space / Touch / Click) to ascend at 45°',
      guideDescend: 'Release to dive at 45° with quantum gravity',
      guideDodge: 'Evade antimatter saws, energy lasers, and void barriers',
      guideCollect: 'Harvest Quantum Crystals to purchase ship cores & upgrades',
      btnPlayNow: 'PLAY NOW ➔',
      btnSkip: 'SKIP ➔',
      btnHowToPlay: 'HOW TO PLAY',

      // HUD
      hudSector: 'SECTOR',
      hudScore: 'SCORE',
      hudBest: 'BEST',
      hudCrystals: 'CRYSTALS',
      hudShield: 'SHIELD',
      hudGoalGuide: 'Goal: Mend the tapestry',
      btnFinishPhaseStar: '✅ COMPLETE SECTOR (★) ➔',
      touchHint: '⚡ HOLD TO ASCEND 45° • RELEASE TO DIVE 45°',

      // Modals
      pauseTitle: 'CHRONO PAUSE',
      btnResume: 'RESUME',
      btnRestart: 'RESTART SECTOR',
      btnQuitSector: 'SECTORS MAP',
      btnDailyRewards: 'DAILY REWARDS',
      btnQuests: 'MISSIONS',
      btnShop: 'META SHOP',
      btnLuckySpin: 'LUCKY SPIN',

      // Victory
      victoryTitle: 'TAPESTRY RESTORED!',
      victorySub: 'Sector successfully woven',
      labelStars: 'STARS EARNED',
      labelScore: 'Final Score',
      labelCrystals: 'Crystals Gathered',
      btnNextSector: 'NEXT SECTOR ➔',
      btnReplay: 'RETRY SECTOR',
      btnDoubleRewards: '🎬 DOUBLE REWARDS (2x)',

      // Game Over / Defeat
      defeatTitle: 'TEMPORAL DISRUPTION',
      defeatSub: 'Your vessel lost quantum coherence',
      btnReviveAd: '🎬 REVIVE VESSEL (3s SHIELD)',
      btnTryAgain: 'TRY AGAIN',

      // Daily Rewards
      dailyTitle: '7-DAY QUANTUM CALENDAR',
      dailySub: 'Log in daily to claim chronotokens and legendary ship cores',
      dayLabel: 'Day',
      btnClaim: 'CLAIM',
      btnClaimDouble: '🎬 CLAIM 2x WITH AD',
      claimed: 'CLAIMED',

      // Missions / Quests
      questsTitle: 'VOID WEAVER MISSIONS',
      dailyQuestsTab: 'DAILY TASKS',
      weeklyQuestsTab: 'WEEKLY PROTOCOLS',
      btnCollectQuest: 'COLLECT',

      // Shop
      shopTitle: 'QUANTUM CHRONO SHOP',
      tabSkins: 'VESSEL CORES',
      tabTrails: 'WARP TRAILS',
      tabUpgrades: 'SYSTEM UPGRADES',
      btnEquip: 'EQUIP',
      btnEquipped: 'EQUIPPED',
      btnBuy: 'BUY',
      upgradeShield: 'Temporal Shielding',
      upgradeShieldDesc: 'Increases shield recovery rate & max emergency charges',
      upgradeMagnet: 'Crystal Magnet',
      upgradeMagnetDesc: 'Widens magnetic gravitational pull for nearby crystals',
      upgradeChrono: 'Pulse Resonance',
      upgradeChronoDesc: 'Grants +15% bonus score and crystals per sector pass',

      // Lucky Spin
      spinTitle: 'CHRONO LUCKY WHEEL',
      spinSub: 'Spin every 12 hours or watch a rewarded video for extra spins',
      btnSpinFree: 'FREE SPIN',
      btnSpinAd: '🎬 SPIN VIA AD',
      spinning: 'WARPING...',

      // Level Select
      levelSelectTitle: 'SECTOR SELECTOR',
      sectorLocked: 'Requires',
      starsNeeded: 'stars to unlock',

      // Audio & Lang
      soundOn: 'SOUND: ON',
      soundOff: 'SOUND: OFF',
      langToggle: 'PT-BR'
    },
    pt: {
      // Intro & Lore
      gameTitle: 'ChronoPulse: The Void Weaver',
      gameSubtitle: 'Sinfonia Temporal na Fenda de Aethel',
      introStudio: 'FLUIDCLEB INTERACTIVE',
      introStudios: 'STUDIOS',
      loreText: 'No tecido esgarçado da Fenda de Aethel, um tecelão de partículas temporais canaliza pulsos harmônicos para restaurar tapeçarias quânticas. Desvie de agulhas de antimatéria, cruze portais de pulso temporal e restaure o equilíbrio cósmico.',
      guideAscend: 'Segure (Espaço / Toque / Clique) para ascender a 45°',
      guideDescend: 'Solte para mergulhar a 45° com gravidade quântica',
      guideDodge: 'Desvie de serras de antimatéria, lasers e barreiras',
      guideCollect: 'Colete Cristais Quânticos para liberar naves e melhorias',
      btnPlayNow: 'JOGAR AGORA ➔',
      btnSkip: 'PULAR ➔',
      btnHowToPlay: 'COMO JOGAR',

      // HUD
      hudSector: 'SETOR',
      hudScore: 'PONTOS',
      hudBest: 'RECORDE',
      hudCrystals: 'CRISTAIS',
      hudShield: 'ESCUDO',
      hudGoalGuide: 'Meta: Restaurar tapeçaria',
      btnFinishPhaseStar: '✅ CONCLUIR FASE (★) ➔',
      touchHint: '⚡ SEGURE PARA SUBIR EM 45° • SOLTE PARA DESCER EM 45°',

      // Modals
      pauseTitle: 'PAUSA TEMPORAL',
      btnResume: 'CONTINUAR',
      btnRestart: 'REINICIAR FASE',
      btnQuitSector: 'MAPA DE SETORES',
      btnDailyRewards: 'RECOMPENSAS DIÁRIAS',
      btnQuests: 'MISSÕES',
      btnShop: 'LOJA META',
      btnLuckySpin: 'ROLETA DA SORTE',

      // Victory
      victoryTitle: 'TAPEÇARIA RESTAURADA!',
      victorySub: 'Setor tecido com harmonia perfeita',
      labelStars: 'ESTRELAS CONQUISTADAS',
      labelScore: 'Pontuação Final',
      labelCrystals: 'Cristais Obtidos',
      btnNextSector: 'PRÓXIMO SETOR ➔',
      btnReplay: 'REPETIR SETOR',
      btnDoubleRewards: '🎬 DOBRAR RECOMPENSAS (2x)',

      // Game Over / Defeat
      defeatTitle: 'RUPTURA TEMPORAL',
      defeatSub: 'Sua nave perdeu a coerência quântica',
      btnReviveAd: '🎬 REVIVER NAVE (ESCUDO 3s)',
      btnTryAgain: 'TENTAR NOVAMENTE',

      // Daily Rewards
      dailyTitle: 'CALENDÁRIO QUÂNTICO (7 DIAS)',
      dailySub: 'Entre diariamente para coletar cristais e núcleos de nave lendários',
      dayLabel: 'Dia',
      btnClaim: 'COLETAR',
      btnClaimDouble: '🎬 DOBRAR 2x COM ANÚNCIO',
      claimed: 'COLETADO',

      // Missions / Quests
      questsTitle: 'MISSÕES DO TECELÃO DO VAZIO',
      dailyQuestsTab: 'TAREFAS DIÁRIAS',
      weeklyQuestsTab: 'PROTOCOLOS SEMANAIS',
      btnCollectQuest: 'RESGATAR',

      // Shop
      shopTitle: 'LOJA QUÂNTICA DE UPGRADES',
      tabSkins: 'NÚCLEOS DE NAVE',
      tabTrails: 'RASTROS NEON',
      tabUpgrades: 'MELHORIAS DO SISTEMA',
      btnEquip: 'EQUIPAR',
      btnEquipped: 'EQUIPADO',
      btnBuy: 'COMPRAR',
      upgradeShield: 'Blindagem Temporal',
      upgradeShieldDesc: 'Aumenta a regeneração do escudo e cargas de emergência',
      upgradeMagnet: 'Ímã Quântico',
      upgradeMagnetDesc: 'Expande o alcance gravitacional de atração de cristais',
      upgradeChrono: 'Ressonância de Pulso',
      upgradeChronoDesc: 'Concede +15% de bônus em pontos e cristais por setor',

      // Lucky Spin
      spinTitle: 'ROLETA DA SORTE TEMPORAL',
      spinSub: 'Gire grátis a cada 12 horas ou assista a um anúncio para giros extras',
      btnSpinFree: 'GIRAR GRÁTIS',
      btnSpinAd: '🎬 GIRAR COM ANÚNCIO',
      spinning: 'DOBRANDO O ESPAÇO...',

      // Level Select
      levelSelectTitle: 'SELEÇÃO DE SETORES',
      sectorLocked: 'Requer',
      starsNeeded: 'estrelas para desbloquear',

      // Audio & Lang
      soundOn: 'SOM: LIGADO',
      soundOff: 'SOM: MUTADO',
      langToggle: 'EN'
    }
  };

  static init() {
    // Detecta idioma do navegador
    const userLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    if (userLang.startsWith('pt')) {
      this.currentLang = 'pt';
    } else {
      this.currentLang = 'en';
    }
  }

  static t(key) {
    const dict = this.translations[this.currentLang] || this.translations.en;
    return dict[key] !== undefined ? dict[key] : (this.translations.en[key] || key);
  }

  static setLang(lang) {
    if (lang === 'en' || lang === 'pt') {
      this.currentLang = lang;
      this.notify();
    }
  }

  static toggleLang() {
    this.currentLang = this.currentLang === 'en' ? 'pt' : 'en';
    this.notify();
    return this.currentLang;
  }

  static onChange(cb) {
    this.listeners.push(cb);
  }

  static notify() {
    for (const cb of this.listeners) {
      try { cb(this.currentLang); } catch (e) {}
    }
  }
}
