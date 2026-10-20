// Gerenciador de Persistência Versionada e Segura (localStorage)
const STORAGE_KEY = 'chronopulse_save_v1';

const DEFAULT_SAVE = {
  version: 1,
  crystals: 150,
  highScore: 0,
  currentSector: 1,
  totalStars: 0,
  // 15 Setores de progressão
  sectors: Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    unlocked: i === 0, // Apenas setor 1 liberado inicialmente
    stars: 0,
    highScore: 0
  })),
  // Cosméticos
  equippedSkin: 'skin_cyan',
  unlockedSkins: ['skin_cyan'],
  equippedTrail: 'trail_wave',
  unlockedTrails: ['trail_wave'],
  // Upgrades permanentes (nível 1 a 5)
  upgrades: {
    shield: 1,  // Carga máxima de escudo temporal
    magnet: 1,  // Raio de atração gravitacional
    chrono: 1   // Bônus multiplicador de pontuação e cristais
  },
  // Recompensas Diárias (Calendário 7 Dias)
  dailyLogin: {
    dayStreak: 0,
    lastClaimDate: null,
    history: []
  },
  // Missões
  quests: {
    lastResetDate: null,
    daily: [
      { id: 'd1', descEn: 'Collect 25 Quantum Crystals', descPt: 'Colete 25 Cristais Quânticos', target: 25, progress: 0, reward: 80, completed: false, claimed: false },
      { id: 'd2', descEn: 'Pass 1 Sector with 3 Stars', descPt: 'Conclua 1 Setor com 3 Estrelas', target: 1, progress: 0, reward: 120, completed: false, claimed: false },
      { id: 'd3', descEn: 'Fly 4,000 meters in the Rift', descPt: 'Voe 4.000 metros na Fenda', target: 4000, progress: 0, reward: 100, completed: false, claimed: false }
    ],
    weekly: [
      { id: 'w1', descEn: 'Earn 10 Stars across sectors', descPt: 'Conquiste 10 Estrelas nos setores', target: 10, progress: 0, reward: 350, completed: false, claimed: false },
      { id: 'w2', descEn: 'Gather 200 Total Crystals', descPt: 'Colete 200 Cristais no total', target: 200, progress: 0, reward: 400, completed: false, claimed: false }
    ]
  },
  // Roleta da Sorte (12h cooldown)
  lastFreeSpinTime: 0,
  // Estatísticas globais
  stats: {
    totalRuns: 0,
    totalCrystalsCollected: 0,
    totalDistance: 0,
    totalRevives: 0
  }
};

export class SaveManager {
  static data = null;

  static load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.data = JSON.parse(JSON.stringify(DEFAULT_SAVE));
        this.save();
        return this.data;
      }
      const parsed = JSON.parse(raw);
      // Mescla com defaults para garantir integridade caso novas chaves sejam adicionadas
      this.data = this.migrate(parsed);
      this.recalculateTotalStars();
      return this.data;
    } catch (e) {
      console.warn('[STORAGE] Erro ao carregar savegame. Restaurando defaults:', e);
      this.data = JSON.parse(JSON.stringify(DEFAULT_SAVE));
      this.save();
      return this.data;
    }
  }

  static migrate(saved) {
    const merged = { ...DEFAULT_SAVE, ...saved };
    merged.upgrades = { ...DEFAULT_SAVE.upgrades, ...(saved.upgrades || {}) };
    merged.stats = { ...DEFAULT_SAVE.stats, ...(saved.stats || {}) };
    merged.dailyLogin = { ...DEFAULT_SAVE.dailyLogin, ...(saved.dailyLogin || {}) };
    merged.quests = { ...DEFAULT_SAVE.quests, ...(saved.quests || {}) };
    
    // Garante que existam 15 setores
    if (!Array.isArray(merged.sectors) || merged.sectors.length < 15) {
      const existing = merged.sectors || [];
      merged.sectors = Array.from({ length: 15 }, (_, i) => {
        const found = existing.find(s => s && s.id === i + 1);
        return found || { id: i + 1, unlocked: i === 0, stars: 0, highScore: 0 };
      });
    }

    // Validação de NaN e tipos numéricos
    if (!Number.isFinite(merged.crystals)) merged.crystals = 150;
    if (!Number.isFinite(merged.highScore)) merged.highScore = 0;
    if (!Array.isArray(merged.unlockedSkins)) merged.unlockedSkins = ['skin_cyan'];
    if (!Array.isArray(merged.unlockedTrails)) merged.unlockedTrails = ['trail_wave'];

    return merged;
  }

  static save() {
    if (!this.data) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('[STORAGE] Falha ao gravar savegame:', e);
    }
  }

  static get() {
    if (!this.data) this.load();
    return this.data;
  }

  static addCrystals(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    this.data.crystals += Math.floor(amount);
    this.data.stats.totalCrystalsCollected += Math.floor(amount);
    this.updateQuestProgress('gather_crystals', Math.floor(amount));
    this.save();
  }

  static spendCrystals(amount) {
    if (!Number.isFinite(amount) || amount < 0) return false;
    if (amount === 0) return true;
    if (this.data.crystals >= amount) {
      this.data.crystals -= Math.floor(amount);
      this.save();
      return true;
    }
    return false;
  }

  static updateSectorResult(sectorId, starsEarned, score) {
    const sector = this.data.sectors.find(s => s.id === sectorId);
    if (!sector) return;

    if (starsEarned > sector.stars) {
      sector.stars = starsEarned;
    }
    if (score > sector.highScore) {
      sector.highScore = score;
    }
    if (score > this.data.highScore) {
      this.data.highScore = score;
    }

    this.recalculateTotalStars();

    // Desbloqueia próximo setor se concluiu ao menos 1 estrela
    if (starsEarned >= 1 && sectorId < 15) {
      const next = this.data.sectors.find(s => s.id === sectorId + 1);
      if (next) next.unlocked = true;
    }

    // Atualiza missões
    if (starsEarned >= 3) {
      this.updateQuestProgress('pass_3stars', 1);
    }
    this.save();
  }

  static recalculateTotalStars() {
    let total = 0;
    for (const s of this.data.sectors) {
      total += (s.stars || 0);
    }
    this.data.totalStars = total;

    // Desbloqueia setores baseados em estrelas totais requeridas
    // Setor 1: 0★, Setor 2: 1★, Setor 3: 3★, Setor 4: 6★, etc.
    for (let i = 1; i < 15; i++) {
      const starsNeeded = i * 2;
      if (this.data.totalStars >= starsNeeded) {
        this.data.sectors[i].unlocked = true;
      }
    }

    // Sincroniza progresso da missão de estrelas (w1)
    this.updateQuestProgress('earn_stars', 0);
  }

  static updateQuestProgress(type, amount) {
    const checkQuest = (q) => {
      if (q.completed) return;
      if (type === 'gather_crystals' && (q.id === 'd1' || q.id === 'w2')) {
        q.progress = Math.min(q.target, q.progress + amount);
      } else if (type === 'pass_3stars' && q.id === 'd2') {
        q.progress = Math.min(q.target, q.progress + amount);
      } else if (type === 'fly_distance' && q.id === 'd3') {
        q.progress = Math.min(q.target, q.progress + amount);
      } else if (type === 'earn_stars' && q.id === 'w1') {
        q.progress = Math.min(q.target, this.data.totalStars);
      }
      if (q.progress >= q.target) {
        q.completed = true;
      }
    };

    if (this.data.quests.daily) this.data.quests.daily.forEach(checkQuest);
    if (this.data.quests.weekly) this.data.quests.weekly.forEach(checkQuest);
    this.save();
  }

  // Verifica se o dia mudou para reset de missões diárias
  static checkDailyReset() {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (this.data.quests.lastResetDate !== todayStr) {
      this.data.quests.lastResetDate = todayStr;
      this.data.quests.daily.forEach(q => {
        q.progress = 0;
        q.completed = false;
        q.claimed = false;
      });
      this.save();
    }
  }

  // Verifica status do Login Diário (Calendário de 7 dias)
  static checkDailyLoginStatus() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const lastClaim = this.data.dailyLogin.lastClaimDate;

    if (!lastClaim) {
      return { canClaim: true, day: 1 };
    }

    const lastDate = new Date(lastClaim);
    const todayDate = new Date(todayStr);
    const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { canClaim: false, day: (this.data.dailyLogin.dayStreak % 7) || 7 };
    } else if (diffDays === 1) {
      const nextDay = ((this.data.dailyLogin.dayStreak % 7) + 1);
      return { canClaim: true, day: nextDay };
    } else {
      // Perdeu o streak: reseta para o Dia 1
      return { canClaim: true, day: 1, streakReset: true };
    }
  }

  static claimDailyLogin(multiplier = 1) {
    const status = this.checkDailyLoginStatus();
    if (!status.canClaim) return null;

    const day = status.day;
    const rewards = [
      { crystals: 100 },
      { crystals: 250 },
      { crystals: 400, bonus: 'shield_boost' },
      { crystals: 600 },
      { crystals: 850, bonus: 'trail_matrix' },
      { crystals: 1200 },
      { crystals: 2000, bonus: 'skin_void_lord' }
    ];

    const currentReward = rewards[day - 1] || rewards[0];
    const finalCrystals = currentReward.crystals * multiplier;
    this.addCrystals(finalCrystals);

    if (currentReward.bonus === 'shield_boost') {
      if ((this.data.upgrades.shield || 1) < 5) {
        this.data.upgrades.shield = (this.data.upgrades.shield || 1) + 1;
      } else {
        this.addCrystals(200); // Converte em cristais se já estiver no nível máximo
      }
    }
    if (currentReward.bonus === 'trail_matrix' && !this.data.unlockedTrails.includes('trail_matrix')) {
      this.data.unlockedTrails.push('trail_matrix');
    }
    if (currentReward.bonus === 'skin_void_lord' && !this.data.unlockedSkins.includes('skin_gold')) {
      this.data.unlockedSkins.push('skin_gold');
    }

    this.data.dailyLogin.dayStreak = status.streakReset ? 1 : (this.data.dailyLogin.dayStreak + 1);
    this.data.dailyLogin.lastClaimDate = new Date().toISOString().slice(0, 10);
    this.save();

    return { day, crystals: finalCrystals, bonus: currentReward.bonus };
  }
}
