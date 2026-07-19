import {
  GAME_END_EVENT,
  GAME_PAUSE_EVENT,
  GAME_RESUME_EVENT,
  GAME_RESTART_EVENT,
  GAME_START_EVENT
} from '../core/config.js';

const AFRAME = window.AFRAME;

AFRAME.registerComponent('desktop-pointer-lock', {
  init: function () {
    this.gameStarted = false;
    this.gamePaused = false;
    this.onGameStart = this.onGameStart.bind(this);
    this.onGamePause = this.onGamePause.bind(this);
    this.onGameResume = this.onGameResume.bind(this);
    this.onGameEnd = this.onGameEnd.bind(this);
    this.onGameRestart = this.onGameRestart.bind(this);
    this.requestLock = this.requestLock.bind(this);

    window.addEventListener(GAME_START_EVENT, this.onGameStart);
    window.addEventListener(GAME_PAUSE_EVENT, this.onGamePause);
    window.addEventListener(GAME_RESUME_EVENT, this.onGameResume);
    window.addEventListener(GAME_END_EVENT, this.onGameEnd);
    window.addEventListener(GAME_RESTART_EVENT, this.onGameRestart);
    this.el.addEventListener('click', this.requestLock);
    this.el.addEventListener('touchstart', this.requestLock, { passive: true });
  },

  onGameStart: function () {
    this.gameStarted = true;
  },

  onGamePause: function () {
    this.gamePaused = true;

    if (document.pointerLockElement && document.exitPointerLock) {
      document.exitPointerLock();
    }
  },

  onGameResume: function () {
    this.gamePaused = false;
  },

  onGameEnd: function () {
    this.gameStarted = false;
    this.gamePaused = false;

    if (document.pointerLockElement && document.exitPointerLock) {
      document.exitPointerLock();
    }
  },

  onGameRestart: function () {
    this.gameStarted = true;
    this.gamePaused = false;
  },

  requestLock: function () {
    if (!this.gameStarted || this.gamePaused) {
      return;
    }

    const scene = this.el;
    if (!scene || scene.is('vr-mode')) {
      return;
    }

    const canvas = scene.canvas;
    if (!canvas || document.pointerLockElement === canvas) {
      return;
    }

    if (canvas.requestPointerLock) {
      canvas.requestPointerLock();
    }
  },

  remove: function () {
    window.removeEventListener(GAME_START_EVENT, this.onGameStart);
    window.removeEventListener(GAME_PAUSE_EVENT, this.onGamePause);
    window.removeEventListener(GAME_RESUME_EVENT, this.onGameResume);
    window.removeEventListener(GAME_END_EVENT, this.onGameEnd);
    window.removeEventListener(GAME_RESTART_EVENT, this.onGameRestart);
    this.el.removeEventListener('click', this.requestLock);
    this.el.removeEventListener('touchstart', this.requestLock);
  }
});