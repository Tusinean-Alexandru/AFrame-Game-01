const AFRAME = window.AFRAME;
const THREE = window.THREE;

AFRAME.registerComponent('water-surface-fix', {
  init: function () {
    this.handleLoaded = this.handleLoaded.bind(this);
    this.el.addEventListener('model-loaded', this.handleLoaded);
  },

  handleLoaded: function () {
    const mesh = this.el.getObject3D('mesh');

    if (!mesh) {
      return;
    }

    mesh.traverse((node) => {
      if (!node.isMesh || !node.material) {
        return;
      }

      const applyWaterStyle = (material) => {
        material.color = new THREE.Color('#2f6f8d');
        material.emissive = new THREE.Color('#0b2230');
        material.emissiveIntensity = 0.1;
        material.roughness = 0.24;
        material.metalness = 0.02;
        material.transparent = true;
        material.opacity = 0.88;
        material.depthWrite = true;
        material.side = THREE.DoubleSide;
        material.needsUpdate = true;
      };

      if (Array.isArray(node.material)) {
        node.material.forEach(applyWaterStyle);
        return;
      }

      applyWaterStyle(node.material);
    });
  },

  remove: function () {
    this.el.removeEventListener('model-loaded', this.handleLoaded);
  }
});