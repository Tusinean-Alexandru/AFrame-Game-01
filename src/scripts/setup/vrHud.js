import {
  GAME_END_EVENT,
  GAME_PAUSE_EVENT,
  GAME_RESUME_EVENT,
  GAME_RESTART_EVENT,
  GAME_START_EVENT
} from '../core/config.js';
import { UI, isVrModeActive, setEntityVisible, setTextValue } from '../core/ui.js';

export function setupVrHud() {
  const updateVisibility = () => {
    const vrMode = isVrModeActive();
    const inPreGame = UI.body.classList.contains('pre-game');
    const isPaused = UI.body.classList.contains('game-paused');
    const gameOverVisible = UI.gameOverSplash && !UI.gameOverSplash.classList.contains('hidden');

    setEntityVisible(UI.vrHudRoot, vrMode && !inPreGame && !isPaused && !gameOverVisible);
  };

  const updateValues = () => {
    if (UI.scoreOverlayValue) {
      setTextValue(UI.vrScoreHudText, UI.scoreOverlayValue.textContent);
    }

    if (UI.ammoOverlayValue) {
      setTextValue(UI.vrAmmoHudText, UI.ammoOverlayValue.textContent);
    }
  };

  updateValues();
  updateVisibility();

  if (UI.scene) {
    UI.scene.addEventListener('enter-vr', updateVisibility);
    UI.scene.addEventListener('exit-vr', updateVisibility);
  }

  window.addEventListener(GAME_START_EVENT, () => {
    updateValues();
    updateVisibility();
  });

  window.addEventListener(GAME_PAUSE_EVENT, updateVisibility);
  window.addEventListener(GAME_RESUME_EVENT, updateVisibility);
  window.addEventListener(GAME_END_EVENT, updateVisibility);
  window.addEventListener(GAME_RESTART_EVENT, () => {
    updateValues();
    updateVisibility();
  });
}