import { GAME_START_EVENT } from '../core/config.js';
import { UI, isVrModeActive, setElementHidden, setEntityVisible } from '../core/ui.js';

export function setupStartSplash() {
  const syncStartUi = (showStart) => {
    const vrMode = isVrModeActive();
    setElementHidden(UI.startSplash, !showStart || vrMode);
    setEntityVisible(UI.vrUiRoot, vrMode);
    setEntityVisible(UI.vrStartSplash, showStart && vrMode);
  };

  if (!UI.startSplash || !UI.startButton) {
    syncStartUi(false);
    window.dispatchEvent(new CustomEvent(GAME_START_EVENT));
    return;
  }

  const beginGame = () => {
    if (UI.startSplash.classList.contains('hidden') && (!UI.vrStartSplash || UI.vrStartSplash.getAttribute('visible') === false)) {
      return;
    }

    syncStartUi(false);
    UI.body.classList.remove('pre-game');
    window.dispatchEvent(new CustomEvent(GAME_START_EVENT));
  };

  syncStartUi(true);

  if (UI.scene) {
    UI.scene.addEventListener('enter-vr', () => {
      if (UI.body.classList.contains('pre-game')) {
        syncStartUi(true);
      }
    });

    UI.scene.addEventListener('exit-vr', () => {
      if (UI.body.classList.contains('pre-game')) {
        syncStartUi(true);
      }
    });
  }

  UI.startButton.addEventListener('click', beginGame);
  window.addEventListener('keydown', (event) => {
    if (event.code !== 'Enter' && event.code !== 'Space') {
      return;
    }

    event.preventDefault();
    beginGame();
  });
}