const AFRAME = window.AFRAME;

AFRAME.registerComponent('bird-target', {
  init: function () {
    this.handleClick = this.handleClick.bind(this);
    this.el.addEventListener('click', this.handleClick);
  },

  handleClick: function () {
    const spawner = this.el.sceneEl && this.el.sceneEl.components['bird-spawner'];
    const ownerBird = this.el.__ownerBird || this.el;

    if (spawner) {
      spawner.onBirdShot(ownerBird);
    }
  },

  remove: function () {
    this.el.removeEventListener('click', this.handleClick);
  }
});