import './components/waterSurfaceFix.js';
import './components/vrScreenAnchor.js';
import './components/birdTarget.js';
import './components/birdSpawner.js';
import './components/desktopPointerLock.js';
import './components/birdShooter.js';
import './components/rightClickZoom.js';
import { setupVrHud } from './setup/vrHud.js';
import { setupStartSplash } from './setup/startSplash.js';
import { setupPauseToggle } from './setup/pauseToggle.js';
import { setupLoadingScreen } from './setup/loadingScreen.js';

setupLoadingScreen();
setupStartSplash();
setupPauseToggle();
setupVrHud();