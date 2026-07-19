import { isVrModeActive } from '../core/ui.js';

const AFRAME = window.AFRAME;
const THREE = window.THREE;

AFRAME.registerComponent('vr-screen-anchor', {
  schema: {
    anchor: { type: 'string', default: 'center' },
    distance: { type: 'number', default: 1.2 },
    marginX: { type: 'number', default: 0.18 },
    marginY: { type: 'number', default: 0.16 },
    offsetX: { type: 'number', default: 0 },
    offsetY: { type: 'number', default: 0 }
  },

  init: function () {
    this.updatePosition = this.updatePosition.bind(this);

    const scene = this.el.sceneEl;
    if (scene) {
      scene.addEventListener('enter-vr', this.updatePosition);
      scene.addEventListener('exit-vr', this.updatePosition);
    }

    window.addEventListener('resize', this.updatePosition);
  },

  tick: function () {
    if (!isVrModeActive()) {
      return;
    }

    this.updatePosition();
  },

  updatePosition: function () {
    const cameraEl = this.el.parentEl;
    const cameraObject = cameraEl && cameraEl.getObject3D('camera');
    if (!cameraObject) {
      return;
    }

    const distance = this.data.distance;
    const fov = THREE.MathUtils.degToRad(cameraObject.fov || 80);
    const aspect = cameraObject.aspect || (window.innerWidth / Math.max(window.innerHeight, 1));
    const halfHeight = Math.tan(fov / 2) * distance;
    const halfWidth = halfHeight * aspect;

    let x = this.data.offsetX;
    let y = this.data.offsetY;

    if (this.data.anchor === 'top-right') {
      x += halfWidth - this.data.marginX;
      y += halfHeight - this.data.marginY;
    }

    if (this.data.anchor === 'top-center') {
      y += halfHeight - this.data.marginY;
    }

    this.el.setAttribute('position', `${x} ${y} ${-distance}`);
  },

  remove: function () {
    const scene = this.el.sceneEl;
    if (scene) {
      scene.removeEventListener('enter-vr', this.updatePosition);
      scene.removeEventListener('exit-vr', this.updatePosition);
    }

    window.removeEventListener('resize', this.updatePosition);
  }
});