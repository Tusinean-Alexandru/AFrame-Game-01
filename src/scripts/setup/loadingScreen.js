export function setupLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  const loadingProgress = document.querySelector('.loading-progress');
  const loadingText = document.querySelector('.loading-text');
  const scene = document.querySelector('a-scene');

  if (!loadingScreen || !loadingProgress || !scene) {
    return;
  }

  let hasHidden = false;

  const hideLoadingScreen = () => {
    if (hasHidden) return;
    hasHidden = true;

    loadingProgress.style.width = '100%';
    loadingText.textContent = 'Ready!';
    
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
    }, 300);
  };

  // A-Frame emits 'loaded' event on a-assets when all assets are loaded
  const assets = scene.querySelector('a-assets');
  
  if (assets) {
    // Listen for when all assets in a-assets finish loading
    assets.addEventListener('loaded', () => {
      hideLoadingScreen();
    });
    
    // Also check if already loaded (in case event already fired)
    if (assets.hasLoaded) {
      hideLoadingScreen();
    }
  } else {
    // No assets element, hide immediately
    hideLoadingScreen();
  }

  // Fallback timeout in case something goes wrong
  setTimeout(() => {
    hideLoadingScreen();
  }, 60000);
}
