import {
  GAME_END_EVENT,
  GAME_PAUSE_EVENT,
  GAME_RESUME_EVENT,
  GAME_RESTART_EVENT,
  GAME_START_EVENT,
  MAGAZINE_SIZE,
  RELOAD_MS
} from '../core/config.js';
import { UI, setAmmoDisplay } from '../core/ui.js';

const AFRAME = window.AFRAME;
const THREE = window.THREE;

AFRAME.registerComponent('bird-shooter', {
  init: function () {
    this.raycaster = new THREE.Raycaster();
    this.origin = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.magazineSize = MAGAZINE_SIZE;
    this.shotsRemaining = MAGAZINE_SIZE;
    this.reloadMs = RELOAD_MS;
    this.isReloading = false;
    this.reloadEndAt = 0;
    this.reloadTimeoutId = null;
    this.reloadIntervalId = null;
    this.ammoOverlay = UI.ammoOverlayValue;
    this.crosshairEl = UI.crosshair;
    this.vrReticleEl = UI.vrReticle;
    this.muzzleFlashEl = UI.muzzleFlash;
    this.hitFlashTimeoutId = null;
    this.muzzleFlashTimeoutId = null;
    this.gameStarted = false;
    this.gamePaused = false;
    this.reloadRemainingMs = 0;

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.onGameStart = this.onGameStart.bind(this);
    this.onGamePause = this.onGamePause.bind(this);
    this.onGameResume = this.onGameResume.bind(this);
    this.onGameEnd = this.onGameEnd.bind(this);
    this.onGameRestart = this.onGameRestart.bind(this);

    this.updateAmmoOverlay();

    window.addEventListener(GAME_START_EVENT, this.onGameStart);
    window.addEventListener(GAME_PAUSE_EVENT, this.onGamePause);
    window.addEventListener(GAME_RESUME_EVENT, this.onGameResume);
    window.addEventListener(GAME_END_EVENT, this.onGameEnd);
    window.addEventListener(GAME_RESTART_EVENT, this.onGameRestart);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    window.addEventListener('keydown', this.handleKeyDown);
  },

  onGameStart: function () {
    this.gameStarted = true;
    this.gamePaused = false;
  },

  onGamePause: function () {
    if (!this.gameStarted || this.gamePaused) {
      return;
    }

    this.gamePaused = true;

    if (this.isReloading) {
      this.reloadRemainingMs = Math.max(0, this.reloadEndAt - performance.now());

      if (this.reloadIntervalId) {
        window.clearInterval(this.reloadIntervalId);
        this.reloadIntervalId = null;
      }

      if (this.reloadTimeoutId) {
        window.clearTimeout(this.reloadTimeoutId);
        this.reloadTimeoutId = null;
      }
    }
  },

  onGameResume: function () {
    if (!this.gameStarted || !this.gamePaused) {
      return;
    }

    this.gamePaused = false;

    if (this.isReloading) {
      const remaining = this.reloadRemainingMs > 0 ? this.reloadRemainingMs : this.reloadMs;
      this.reloadEndAt = performance.now() + remaining;
      this.reloadRemainingMs = 0;

      this.reloadIntervalId = window.setInterval(() => {
        this.updateAmmoOverlay();
      }, 100);

      this.reloadTimeoutId = window.setTimeout(() => {
        this.finishReload();
      }, remaining);

      this.updateAmmoOverlay();
    }
  },

  resetWeaponState: function () {
    this.isReloading = false;
    this.reloadEndAt = 0;
    this.reloadRemainingMs = 0;
    this.shotsRemaining = this.magazineSize;

    if (this.reloadIntervalId) {
      window.clearInterval(this.reloadIntervalId);
      this.reloadIntervalId = null;
    }

    if (this.reloadTimeoutId) {
      window.clearTimeout(this.reloadTimeoutId);
      this.reloadTimeoutId = null;
    }

    this.setReloadCursorState(false);
    this.updateAmmoOverlay();
  },

  onGameEnd: function () {
    this.gameStarted = false;
    this.gamePaused = false;
    this.resetWeaponState();
  },

  onGameRestart: function () {
    this.gameStarted = true;
    this.gamePaused = false;
    this.resetWeaponState();
  },

  updateAmmoOverlay: function () {
    if (!this.ammoOverlay) {
      return;
    }

    if (this.isReloading) {
      const remainingMs = Math.max(0, this.reloadEndAt - performance.now());
      const remainingSec = (remainingMs / 1000).toFixed(1);
      setAmmoDisplay(`Reloading: ${remainingSec}s`);
      return;
    }

    setAmmoDisplay(`Ammo: ${this.shotsRemaining}/${this.magazineSize}`);
  },

  maybeStartReload: function () {
    if (this.shotsRemaining === 0 && !this.isReloading) {
      this.startReload();
    }
  },

  startReload: function () {
    this.isReloading = true;
    this.reloadEndAt = performance.now() + this.reloadMs;
    this.setReloadCursorState(true);
    this.updateAmmoOverlay();

    if (this.reloadIntervalId) {
      window.clearInterval(this.reloadIntervalId);
    }

    this.reloadIntervalId = window.setInterval(() => {
      this.updateAmmoOverlay();
    }, 100);

    if (this.reloadTimeoutId) {
      window.clearTimeout(this.reloadTimeoutId);
    }

    this.reloadTimeoutId = window.setTimeout(() => {
      this.finishReload();
    }, this.reloadMs);
  },

  finishReload: function () {
    this.isReloading = false;
    this.shotsRemaining = this.magazineSize;
    this.setReloadCursorState(false);

    if (this.reloadIntervalId) {
      window.clearInterval(this.reloadIntervalId);
      this.reloadIntervalId = null;
    }

    if (this.reloadTimeoutId) {
      window.clearTimeout(this.reloadTimeoutId);
      this.reloadTimeoutId = null;
    }

    this.updateAmmoOverlay();
  },

  flashHitCursor: function () {
    if (this.crosshairEl) {
      this.crosshairEl.classList.add('hit');
    }

    this.setVrReticleColor('#ef4444');

    if (this.hitFlashTimeoutId) {
      window.clearTimeout(this.hitFlashTimeoutId);
    }

    this.hitFlashTimeoutId = window.setTimeout(() => {
      if (this.crosshairEl) {
        this.crosshairEl.classList.remove('hit');
      }

      this.setVrReticleColor(this.isReloading ? '#facc15' : '#ffffff');
      this.hitFlashTimeoutId = null;
    }, 140);
  },

  setVrReticleColor: function (color) {
    if (!this.vrReticleEl) {
      return;
    }

    this.vrReticleEl.setAttribute('material', 'color', color);
  },

  setReloadCursorState: function (isReloading) {
    if (this.crosshairEl) {
      this.crosshairEl.classList.toggle('reloading', isReloading);
    }

    this.setVrReticleColor(isReloading ? '#facc15' : '#ffffff');
  },

  flashMuzzle: function () {
    if (!this.muzzleFlashEl) {
      return;
    }

    this.muzzleFlashEl.setAttribute('visible', 'true');

    if (this.muzzleFlashTimeoutId) {
      window.clearTimeout(this.muzzleFlashTimeoutId);
    }

    this.muzzleFlashTimeoutId = window.setTimeout(() => {
      if (this.muzzleFlashEl) {
        this.muzzleFlashEl.setAttribute('visible', 'false');
      }

      this.muzzleFlashTimeoutId = null;
    }, 70);
  },

  handleMouseDown: function (event) {
    if (event.button !== 0) {
      return;
    }

    this.shoot();
  },

  handleTouchStart: function () {
    this.shoot();
  },

  handleKeyDown: function (event) {
    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault();
      this.shoot();
    }
  },

  shoot: function () {
    if (!this.gameStarted || this.gamePaused || this.isReloading) {
      return;
    }

    if (this.shotsRemaining <= 0) {
      this.maybeStartReload();
      return;
    }

    this.shotsRemaining -= 1;
    this.flashMuzzle();
    this.updateAmmoOverlay();

    const scene = this.el.sceneEl;
    const spawner = scene && scene.components['bird-spawner'];
    if (!scene || !spawner) {
      this.maybeStartReload();
      return;
    }

    const shootableEntities = scene.querySelectorAll('.shootable-bird');
    if (!shootableEntities.length) {
      this.maybeStartReload();
      return;
    }

    const targetMeshes = [];
    shootableEntities.forEach((entity) => {
      entity.object3D.traverse((node) => {
        if (node.isMesh) {
          targetMeshes.push(node);
        }
      });
    });

    if (!targetMeshes.length) {
      this.maybeStartReload();
      return;
    }

    this.el.object3D.getWorldPosition(this.origin);
    this.direction.set(0, 0, -1).applyQuaternion(this.el.object3D.getWorldQuaternion(new THREE.Quaternion()));
    this.raycaster.set(this.origin, this.direction.normalize());

    const intersections = this.raycaster.intersectObjects(targetMeshes, true);
    if (!intersections.length) {
      this.maybeStartReload();
      return;
    }

    let current = intersections[0].object;
    let ownerBird = null;

    while (current) {
      if (current.el) {
        if (current.el.__ownerBird) {
          ownerBird = current.el.__ownerBird;
          break;
        }

        if (current.el.classList && current.el.classList.contains('shootable-bird')) {
          ownerBird = current.el;
          break;
        }
      }

      if (current.userData && current.userData.ownerBird) {
        ownerBird = current.userData.ownerBird;
        break;
      }

      current = current.parent;
    }

    if (!ownerBird) {
      this.maybeStartReload();
      return;
    }

    if (!ownerBird.__resolved) {
      this.flashHitCursor();
    }

    spawner.onBirdShot(ownerBird);
    this.maybeStartReload();
  },

  remove: function () {
    window.removeEventListener(GAME_START_EVENT, this.onGameStart);
    window.removeEventListener(GAME_PAUSE_EVENT, this.onGamePause);
    window.removeEventListener(GAME_RESUME_EVENT, this.onGameResume);
    window.removeEventListener(GAME_END_EVENT, this.onGameEnd);
    window.removeEventListener(GAME_RESTART_EVENT, this.onGameRestart);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('keydown', this.handleKeyDown);

    if (this.reloadIntervalId) {
      window.clearInterval(this.reloadIntervalId);
      this.reloadIntervalId = null;
    }

    if (this.reloadTimeoutId) {
      window.clearTimeout(this.reloadTimeoutId);
      this.reloadTimeoutId = null;
    }

    if (this.hitFlashTimeoutId) {
      window.clearTimeout(this.hitFlashTimeoutId);
      this.hitFlashTimeoutId = null;
    }

    if (this.muzzleFlashTimeoutId) {
      window.clearTimeout(this.muzzleFlashTimeoutId);
      this.muzzleFlashTimeoutId = null;
    }

    if (this.crosshairEl) {
      this.crosshairEl.classList.remove('hit');
      this.crosshairEl.classList.remove('reloading');
    }

    this.setVrReticleColor('#ffffff');

    if (this.muzzleFlashEl) {
      this.muzzleFlashEl.setAttribute('visible', 'false');
    }
  }
});