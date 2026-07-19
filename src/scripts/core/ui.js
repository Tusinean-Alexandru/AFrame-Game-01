export const UI = {
  body: document.body,
  scene: document.querySelector('a-scene'),
  startSplash: document.querySelector('#startSplash'),
  startButton: document.querySelector('#startGameButton'),
  pauseSplash: document.querySelector('#pauseSplash'),
  pauseFinishButton: document.querySelector('#pauseFinishButton'),
  gameOverSplash: document.querySelector('#gameOverSplash'),
  playAgainButton: document.querySelector('#playAgainButton'),
  finalScoreValue: document.querySelector('#finalScoreValue'),
  scoreOverlayValue: document.querySelector('#scoreOverlayValue'),
  ammoOverlayValue: document.querySelector('#ammoOverlayValue'),
  crosshair: document.querySelector('.crosshair'),
  vrReticle: document.querySelector('#vrReticle'),
  vrHudRoot: document.querySelector('#vrHudRoot'),
  vrScoreHudText: document.querySelector('#vrScoreHudText'),
  vrAmmoHudText: document.querySelector('#vrAmmoHudText'),
  vrUiRoot: document.querySelector('#vrUiRoot'),
  vrStartSplash: document.querySelector('#vrStartSplash'),
  vrPauseSplash: document.querySelector('#vrPauseSplash'),
  vrGameOverSplash: document.querySelector('#vrGameOverSplash'),
  vrFinalScoreText: document.querySelector('#vrFinalScoreText'),
  muzzleFlash: document.querySelector('#muzzleFlash'),
  waterBackdrop: document.querySelector('#waterBackdrop')
};

export function getScene() {
  return UI.scene;
}

export function getBirdSpawnerComponent() {
  const scene = getScene();
  return scene && scene.components ? scene.components['bird-spawner'] : null;
}

export function isVrModeActive() {
  const scene = getScene();
  return !!(scene && scene.is && scene.is('vr-mode'));
}

export function setElementHidden(element, hidden) {
  if (!element) {
    return;
  }

  element.classList.toggle('hidden', hidden);
}

export function setEntityVisible(element, visible) {
  if (!element) {
    return;
  }

  element.setAttribute('visible', visible);
}

export function setTextValue(element, value) {
  if (!element) {
    return;
  }

  element.setAttribute('text', 'value', value);
}

export function setScoreDisplay(score) {
  const scoreText = `Score: ${score}`;

  if (UI.scoreOverlayValue) {
    UI.scoreOverlayValue.textContent = scoreText;
  }

  setTextValue(UI.vrScoreHudText, scoreText);
}

export function setAmmoDisplay(value) {
  if (UI.ammoOverlayValue) {
    UI.ammoOverlayValue.textContent = value;
  }

  setTextValue(UI.vrAmmoHudText, value);
}