const AFRAME = window.AFRAME;

AFRAME.registerComponent('right-click-zoom', {
  schema: {
    zoomFov: { type: 'number', default: 45 }
  },

  init: function () {
    this.cameraObject = null;
    this.normalFov = null;

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleWindowBlur = this.handleWindowBlur.bind(this);

    this.cacheCamera();

    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('contextmenu', this.handleContextMenu);
    window.addEventListener('blur', this.handleWindowBlur);
  },

  cacheCamera: function () {
    if (!this.cameraObject) {
      this.cameraObject = this.el.getObject3D('camera');
    }

    if (this.cameraObject && this.normalFov === null) {
      this.normalFov = this.cameraObject.fov || 80;
    }
  },

  isEventOnSceneCanvas: function (event) {
    const scene = this.el.sceneEl;
    const canvas = scene && scene.canvas;

    if (!canvas) {
      return false;
    }

    return event.target === canvas;
  },

  setZoom: function (zoomIn) {
    this.cacheCamera();
    if (!this.cameraObject) {
      return;
    }

    const nextFov = zoomIn ? this.data.zoomFov : this.normalFov;
    this.cameraObject.fov = nextFov;
    this.cameraObject.updateProjectionMatrix();
  },

  handleMouseDown: function (event) {
    if (event.button !== 2 || !this.isEventOnSceneCanvas(event)) {
      return;
    }

    event.preventDefault();
    this.setZoom(true);
  },

  handleMouseUp: function (event) {
    if (event.button !== 2) {
      return;
    }

    event.preventDefault();
    this.setZoom(false);
  },

  handleContextMenu: function (event) {
    if (!this.isEventOnSceneCanvas(event)) {
      return;
    }

    event.preventDefault();
  },

  handleWindowBlur: function () {
    this.setZoom(false);
  },

  remove: function () {
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('contextmenu', this.handleContextMenu);
    window.removeEventListener('blur', this.handleWindowBlur);
    this.setZoom(false);
  }
});