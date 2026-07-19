import {
  GAME_END_EVENT,
  GAME_PAUSE_EVENT,
  GAME_RESUME_EVENT,
  GAME_RESTART_EVENT,
  GAME_START_EVENT
} from '../core/config.js';
import { UI, getBirdSpawnerComponent, isVrModeActive, setElementHidden, setEntityVisible, setTextValue } from '../core/ui.js';

export function setupPauseToggle() {
  let gameStarted = false;
  let gamePaused = false;
  let gameFinished = false;

  const getCurrentScore = () => {
    const spawner = getBirdSpawnerComponent();
    return spawner ? spawner.score : 0;
  };

  const setPauseUi = (paused) => {
    const vrMode = isVrModeActive();
    setElementHidden(UI.pauseSplash, !paused || vrMode);
    setEntityVisible(UI.vrUiRoot, vrMode && (paused || (UI.vrGameOverSplash && UI.vrGameOverSplash.getAttribute('visible'))));
    setEntityVisible(UI.vrPauseSplash, paused && vrMode);
    setEntityVisible(UI.vrHudRoot, vrMode && !paused && !gameFinished && !UI.body.classList.contains('pre-game'));

    UI.body.classList.toggle('game-paused', paused);
  };

  const setGameOverUi = (visible, score) => {
    const vrMode = isVrModeActive();
    setElementHidden(UI.gameOverSplash, !visible || vrMode);
    setEntityVisible(UI.vrUiRoot, vrMode && (visible || (UI.vrPauseSplash && UI.vrPauseSplash.getAttribute('visible'))));
    setEntityVisible(UI.vrGameOverSplash, visible && vrMode);
    setEntityVisible(UI.vrHudRoot, vrMode && !visible && !gamePaused && !UI.body.classList.contains('pre-game'));

    if (UI.finalScoreValue && typeof score === 'number') {
      UI.finalScoreValue.textContent = `Score: ${score}`;
    }

    if (UI.vrFinalScoreText && typeof score === 'number') {
      setTextValue(UI.vrFinalScoreText, `Score: ${score}`);
    }
  };

  const syncOverlayMode = () => {
    const vrMode = isVrModeActive();

    setEntityVisible(UI.vrUiRoot, vrMode && (UI.body.classList.contains('pre-game') || gamePaused || gameFinished));
    setEntityVisible(UI.vrHudRoot, vrMode && !UI.body.classList.contains('pre-game') && !gamePaused && !gameFinished);
    setElementHidden(UI.pauseSplash, !gamePaused || vrMode);
    setElementHidden(UI.gameOverSplash, !gameFinished || vrMode);
    setEntityVisible(UI.vrPauseSplash, gamePaused && vrMode);
    setEntityVisible(UI.vrGameOverSplash, gameFinished && vrMode);
  };

  window.addEventListener(GAME_START_EVENT, () => {
    gameStarted = true;
    gameFinished = false;
    setPauseUi(false);
    setGameOverUi(false);
  });

  window.addEventListener(GAME_RESTART_EVENT, () => {
    gameStarted = true;
    gamePaused = false;
    gameFinished = false;
    setPauseUi(false);
    setGameOverUi(false);
  });

  window.addEventListener(GAME_END_EVENT, (event) => {
    gameStarted = false;
    gamePaused = false;
    gameFinished = true;
    setPauseUi(false);
    setGameOverUi(true, event.detail && typeof event.detail.score === 'number' ? event.detail.score : 0);
  });

  window.addEventListener('keydown', (event) => {
    if (gameFinished && (event.code === 'KeyR' || event.code === 'Enter')) {
      event.preventDefault();
      window.dispatchEvent(new CustomEvent(GAME_RESTART_EVENT));
      return;
    }

    if (gamePaused && event.code === 'KeyF') {
      event.preventDefault();
      window.dispatchEvent(new CustomEvent(GAME_END_EVENT, {
        detail: { score: getCurrentScore() }
      }));
      return;
    }

    if (event.code !== 'KeyP') {
      return;
    }

    if (!gameStarted || gameFinished) {
      return;
    }

    event.preventDefault();

    if (gamePaused) {
      gamePaused = false;
      setPauseUi(false);
      window.dispatchEvent(new CustomEvent(GAME_RESUME_EVENT));
      return;
    }

    gamePaused = true;
    setPauseUi(true);
    window.dispatchEvent(new CustomEvent(GAME_PAUSE_EVENT));
  });

  if (UI.pauseFinishButton) {
    UI.pauseFinishButton.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent(GAME_END_EVENT, {
        detail: { score: getCurrentScore() }
      }));
    });
  }

  if (UI.playAgainButton) {
    UI.playAgainButton.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent(GAME_RESTART_EVENT));
    });
  }

  if (UI.scene) {
    UI.scene.addEventListener('enter-vr', syncOverlayMode);
    UI.scene.addEventListener('exit-vr', syncOverlayMode);
  }
}