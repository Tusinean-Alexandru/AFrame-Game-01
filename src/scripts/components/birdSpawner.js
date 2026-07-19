import {
  BIRD_FALL_FORWARD_DISTANCE,
  BIRD_FALL_MS,
  BIRD_HITBOX_OFFSET,
  BIRD_HITBOX_RADIUS,
  BIRD_MODEL_OFFSET,
  BIRD_MULTIPLIER_STEP_MS,
  DEFAULT_WATER_PLANE_Y,
  GAME_END_EVENT,
  GAME_PAUSE_EVENT,
  GAME_RESUME_EVENT,
  GAME_RESTART_EVENT,
  GAME_START_EVENT
} from '../core/config.js';
import { UI, setScoreDisplay } from '../core/ui.js';

const AFRAME = window.AFRAME;

AFRAME.registerComponent('bird-spawner', {
  init: function () {
    this.spawnIntervalMs = 5000;
    this.multiplierStepMs = BIRD_MULTIPLIER_STEP_MS;
    this.flightMs = 15000;
    this.birdScale = '0.45 0.45 0.45';
    this.yMin = 6;
    this.yMax = 15;
    this.zMin = -25;
    this.zMax = -65;
    this.xEdge = 75;
    this.birdAssetId = '#birdModel';
    this.activeBirds = new Set();
    this.score = 0;
    this.waterPlaneY = DEFAULT_WATER_PLANE_Y;
    this.gameStarted = false;
    this.gamePaused = false;
    this.birdsPerWave = 1;
    this.multiplierIntervalId = null;

    this.spawnBird = this.spawnBird.bind(this);
    this.onBirdEscape = this.onBirdEscape.bind(this);
    this.onGameStart = this.onGameStart.bind(this);
    this.onGamePause = this.onGamePause.bind(this);
    this.onGameResume = this.onGameResume.bind(this);
    this.onGameEnd = this.onGameEnd.bind(this);
    this.onGameRestart = this.onGameRestart.bind(this);

    this.updateScore(0);

    if (UI.waterBackdrop) {
      const waterPos = UI.waterBackdrop.getAttribute('position');
      if (waterPos && typeof waterPos.y === 'number') {
        this.waterPlaneY = waterPos.y;
      }
    }

    window.addEventListener(GAME_START_EVENT, this.onGameStart);
    window.addEventListener(GAME_PAUSE_EVENT, this.onGamePause);
    window.addEventListener(GAME_RESUME_EVENT, this.onGameResume);
    window.addEventListener(GAME_END_EVENT, this.onGameEnd);
    window.addEventListener(GAME_RESTART_EVENT, this.onGameRestart);
  },

  startWaves: function () {
    this.spawnBird();
    this.intervalId = window.setInterval(this.spawnBird, this.spawnIntervalMs);
    this.multiplierIntervalId = window.setInterval(() => {
      this.birdsPerWave = Math.min(this.birdsPerWave + 1, 5);
    }, this.multiplierStepMs);
  },

  stopWaves: function () {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.multiplierIntervalId) {
      window.clearInterval(this.multiplierIntervalId);
      this.multiplierIntervalId = null;
    }
  },

  clearBirds: function () {
    this.activeBirds.forEach((bird) => {
      this.removeBird(bird);
    });

    this.activeBirds.clear();
  },

  onGameStart: function () {
    if (this.gameStarted) {
      return;
    }

    this.gameStarted = true;
    this.gamePaused = false;
    this.startWaves();
  },

  onGamePause: function () {
    if (!this.gameStarted || this.gamePaused) {
      return;
    }

    this.gamePaused = true;
    this.stopWaves();

    this.activeBirds.forEach((bird) => {
      bird.pause();

      const birdModel = bird.firstElementChild;
      if (birdModel) {
        birdModel.pause();
      }

      if (bird.__fallTimeoutId) {
        bird.__fallRemainingMs = Math.max(0, bird.__fallRemoveAt - performance.now());
        window.clearTimeout(bird.__fallTimeoutId);
        delete bird.__fallTimeoutId;
      }
    });
  },

  onGameResume: function () {
    if (!this.gameStarted || !this.gamePaused) {
      return;
    }

    this.gamePaused = false;

    this.activeBirds.forEach((bird) => {
      bird.play();

      const birdModel = bird.firstElementChild;
      if (birdModel && !bird.__resolved) {
        birdModel.play();
      }

      if (typeof bird.__fallRemainingMs === 'number') {
        bird.__fallRemoveAt = performance.now() + bird.__fallRemainingMs;
        bird.__fallTimeoutId = window.setTimeout(() => {
          this.removeBird(bird);
        }, bird.__fallRemainingMs);
        delete bird.__fallRemainingMs;
      }
    });

    this.startWaves();
  },

  onGameEnd: function () {
    this.stopWaves();
    this.clearBirds();
    this.gameStarted = false;
    this.gamePaused = false;
  },

  onGameRestart: function () {
    this.stopWaves();
    this.clearBirds();
    this.score = 0;
    this.birdsPerWave = 1;
    this.updateScore(0);
    this.gameStarted = true;
    this.gamePaused = false;
    this.startWaves();
  },

  spawnBird: function () {
    if (!this.gameStarted || this.gamePaused) {
      return;
    }

    for (let index = 0; index < this.birdsPerWave; index += 1) {
      this.spawnSingleBird();
    }
  },

  spawnSingleBird: function () {
    if (!this.gameStarted || this.gamePaused) {
      return;
    }

    const fromLeft = Math.random() >= 0.5;
    const startX = fromLeft ? -this.xEdge : this.xEdge;
    const endX = fromLeft ? this.xEdge : -this.xEdge;
    const y = this.yMin + Math.random() * (this.yMax - this.yMin);
    const z = this.zMin + Math.random() * (this.zMax - this.zMin);

    const bird = document.createElement('a-entity');
    bird.setAttribute('position', `${startX} ${y} ${z}`);
    bird.setAttribute('rotation', fromLeft ? '0 90 0' : '0 -90 0');
    bird.__ownerBird = bird;

    const birdModel = document.createElement('a-entity');
    birdModel.setAttribute('gltf-model', this.birdAssetId);
    birdModel.setAttribute('animation-mixer', 'clip: *; loop: repeat; timeScale: 1');
    birdModel.setAttribute('scale', this.birdScale);
    birdModel.setAttribute('position', BIRD_MODEL_OFFSET);
    bird.appendChild(birdModel);

    const hitbox = document.createElement('a-sphere');
    hitbox.setAttribute('class', 'shootable-bird');
    hitbox.setAttribute('bird-target', '');
    hitbox.setAttribute('radius', `${BIRD_HITBOX_RADIUS}`);
    hitbox.setAttribute('position', BIRD_HITBOX_OFFSET);
    hitbox.setAttribute('material', 'color: #ffffff; transparent: true; opacity: 0; side: double');
    hitbox.__ownerBird = bird;
    bird.appendChild(hitbox);

    bird.__resolved = false;
    bird.setAttribute('animation__fly', {
      property: 'position',
      from: `${startX} ${y} ${z}`,
      to: `${endX} ${y} ${z}`,
      dur: this.flightMs,
      easing: 'linear'
    });

    bird.__onFlyComplete = () => {
      this.onBirdEscape(bird);
    };
    bird.addEventListener('animationcomplete__fly', bird.__onFlyComplete);

    this.el.appendChild(bird);
    this.activeBirds.add(bird);
  },

  onBirdShot: function (bird) {
    if (!bird || bird.__resolved) {
      return;
    }

    bird.__resolved = true;
    this.updateScore(1);

    const birdModel = bird.firstElementChild;
    if (birdModel) {
      birdModel.setAttribute('animation-mixer', 'clip: *; loop: repeat; timeScale: 0');
      birdModel.pause();
    }

    bird.removeAttribute('animation__fly');

    const currentPos = bird.getAttribute('position');
    const currentRot = bird.getAttribute('rotation');
    const forwardDirX = currentRot && currentRot.y >= 0 ? 1 : -1;
    const endX = currentPos.x + (forwardDirX * BIRD_FALL_FORWARD_DISTANCE);
    const endY = this.waterPlaneY;

    bird.setAttribute('animation__fall', {
      property: 'position',
      from: `${currentPos.x} ${currentPos.y} ${currentPos.z}`,
      to: `${endX} ${endY} ${currentPos.z}`,
      dur: BIRD_FALL_MS,
      easing: 'easeOutQuad'
    });

    bird.__fallTimeoutId = window.setTimeout(() => {
      this.removeBird(bird);
    }, BIRD_FALL_MS);
    bird.__fallRemoveAt = performance.now() + BIRD_FALL_MS;
  },

  onBirdEscape: function (bird) {
    if (!bird || bird.__resolved) {
      return;
    }

    bird.__resolved = true;
    this.updateScore(-1);
    this.removeBird(bird);
  },

  removeBird: function (bird) {
    this.activeBirds.delete(bird);

    if (bird.__fallTimeoutId) {
      window.clearTimeout(bird.__fallTimeoutId);
      delete bird.__fallTimeoutId;
    }

    if (typeof bird.__fallRemainingMs === 'number') {
      delete bird.__fallRemainingMs;
    }

    if (typeof bird.__fallRemoveAt === 'number') {
      delete bird.__fallRemoveAt;
    }

    if (bird.__onFlyComplete) {
      bird.removeEventListener('animationcomplete__fly', bird.__onFlyComplete);
      delete bird.__onFlyComplete;
    }

    if (bird.parentNode) {
      bird.parentNode.removeChild(bird);
    }
  },

  updateScore: function (delta) {
    this.score += delta;
    setScoreDisplay(this.score);
  },

  remove: function () {
    window.removeEventListener(GAME_START_EVENT, this.onGameStart);
    window.removeEventListener(GAME_PAUSE_EVENT, this.onGamePause);
    window.removeEventListener(GAME_RESUME_EVENT, this.onGameResume);
    window.removeEventListener(GAME_END_EVENT, this.onGameEnd);
    window.removeEventListener(GAME_RESTART_EVENT, this.onGameRestart);

    this.stopWaves();
    this.clearBirds();
  }
});