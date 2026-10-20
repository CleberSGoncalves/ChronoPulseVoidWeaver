// Gerenciador Centralizado de Modais & Anti-Softlock (Fim do "Trava e Não Volta")
export class ModalController {
  static modalStack = [];
  static activeModal = null;
  static gameInstance = null;

  static setGameInstance(game) {
    this.gameInstance = game;
  }

  // Abre um modal e adiciona na pilha para permitir 'Voltar' seguro
  static open(modalId, options = { pushToStack: true }) {
    const el = document.getElementById(modalId);
    if (!el) {
      console.warn(`[MODAL] Elemento #${modalId} não encontrado.`);
      return;
    }

    // Se já havia um modal ativo diferente
    if (this.activeModal && this.activeModal !== modalId && options.pushToStack) {
      this.modalStack.push(this.activeModal);
      const prevEl = document.getElementById(this.activeModal);
      if (prevEl) prevEl.classList.add('hidden');
    }

    el.classList.remove('hidden');
    this.activeModal = modalId;

    // Notifica o jogo para pausar se não estiver pausado
    if (this.gameInstance && !this.gameInstance.isRoundOver) {
      this.gameInstance.isPaused = true;
    }
  }

  // Fecha o modal atual e desempilha o modal anterior (ou resolve estado)
  static close(modalId) {
    const idToClose = modalId || this.activeModal;
    if (!idToClose) return;

    const el = document.getElementById(idToClose);
    if (el) el.classList.add('hidden');

    if (this.activeModal === idToClose) {
      this.activeModal = null;
    }

    // Se havia modal na pilha anterior (ex: abriu Seletor de Fases a partir da Vitória)
    if (this.modalStack.length > 0) {
      const prevModal = this.modalStack.pop();
      const prevEl = document.getElementById(prevModal);
      if (prevEl) {
        prevEl.classList.remove('hidden');
        this.activeModal = prevModal;
        return;
      }
    }

    // PROTOCOLO ANTI-SOFTLOCK:
    // Se o modal foi fechado no "X" ou botão fechar, mas a rodada acabou (isRoundOver = true),
    // NÃO podemos deixar a tela vazia sem botões! Reabrimos o modal de Vitória ou Derrota.
    if (this.gameInstance && this.gameInstance.isRoundOver) {
      if (this.gameInstance.hasWon) {
        this.open('modal-victory', { pushToStack: false });
        return;
      } else {
        this.open('modal-defeat', { pushToStack: false });
        return;
      }
    }

    // Se a rodada ainda está ativa e não há mais modais na pilha, despausa o jogo
    if (this.gameInstance && !this.gameInstance.isRoundOver) {
      this.gameInstance.isPaused = false;
      this.gameInstance.lastTime = performance.now();
      requestAnimationFrame((t) => this.gameInstance.loop(t));
    }
  }

  // Fecha todos os modais incondicionalmente (usado em loadSector)
  static closeAll() {
    this.modalStack = [];
    this.activeModal = null;
    const allModals = document.querySelectorAll('.game-modal');
    allModals.forEach(m => m.classList.add('hidden'));
  }

  static isOpen(modalId) {
    if (!modalId) return this.activeModal !== null;
    return this.activeModal === modalId;
  }
}
