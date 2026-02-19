/**
 * Game screen module.
 * Loads and initializes the game for a specific level.
 * Creates the game UI and manages the GameController lifecycle.
 * @module screens/GameScreen
 */

import { GameController } from '@core/game/GameController.js';
import { GameState } from '@core/GameState.js';
import { levels } from '@data/levels.js';
import { showScreen, showMessage, getIconSvg } from '@/utils/ui.js';

// Module-level references
let gameController = null;
let gameState = null;

/**
 * Loads and initializes the game screen for a specific level.
 *
 * Creates the game UI structure, instantiates GameController with GameState,
 * and handles initialization errors gracefully.
 *
 * @param {HTMLElement} container - The DOM container to render the game screen into
 * @param {number} levelIndex - The index of the level to load
 * @returns {Promise<void>}
 */
export async function loadGameScreen(container, levelIndex) {
  console.log(`GameScreen: Loading level ${levelIndex}`);

  // Validate level index
  if (levelIndex < 0 || levelIndex >= levels.length) {
    console.error(`GameScreen: Invalid level index: ${levelIndex}`);
    showMessage('Geçersiz seviye!', 'error', 3000);
    showScreen('level-select');
    return;
  }

  const levelData = levels[levelIndex];
  if (!levelData || !levelData.svgPath) {
    console.error(`GameScreen: Level data or svgPath not found for index: ${levelIndex}`);
    showMessage('Seviye verisi bulunamadı!', 'error', 3000);
    showScreen('level-select');
    return;
  }

  // Create game screen structure
  container.innerHTML = `
    <div class="game-screen">
      <div class="game-header">
        <button id="game-back-button" class="back-button btn-secondary" aria-label="Seviye seçimine geri dön">${getIconSvg('ArrowLeft')} Seviye Seçimi</button>
        <h2 id="level-title">${levelData.name}</h2>
        <button id="game-reset-button" class="reset-button btn-danger" disabled aria-label="Oyunu sıfırla">${getIconSvg('RotateCcw')} Sıfırla</button>
      </div>
      <div class="svg-container">
        <svg id="game-svg" class="game-svg" preserveAspectRatio="xMidYMid meet"></svg>
      </div>
      <div class="game-info">
        <div id="message-area" class="message-area" role="status" aria-live="polite" aria-atomic="true">
           <span id="message-icon" class="icon"></span>
           <span id="message-content"></span>
        </div>
        <div id="bridge-counter" class="bridge-counter" aria-live="polite">Geçilen Köprüler: 0 / 0</div>
        <div id="completion-actions" class="completion-actions hidden">
           <button id="completion-back-button" class="btn-primary" aria-label="Seviye seçimine geri dön">${getIconSvg('ArrowLeft')} Seviye Seçimine Dön</button>
        </div>
      </div>
    </div>
  `;

  // Get back button reference for event listener
  const backButton = container.querySelector('#game-back-button');
  const completionBackButton = container.querySelector('#completion-back-button');

  // Set up back button to destroy controller before navigation
  if (backButton) {
    backButton.addEventListener('click', () => {
      if (gameController) {
        gameController.destroy();
        gameController = null;
      }
      gameState = null;
      showScreen('level-select');
    });
  }

  // Set up completion back button
  if (completionBackButton) {
    completionBackButton.addEventListener('click', () => {
      if (gameController) {
        gameController.destroy();
        gameController = null;
      }
      gameState = null;
      showScreen('level-select');
    });
  }

  // Create GameState instance
  gameState = new GameState();

  // Create GameController instance
  gameController = new GameController(container, levelIndex, gameState);

  // Initialize the game controller
  try {
    await gameController.initialize();
    console.log('GameScreen: GameController initialized successfully');
  } catch (error) {
    console.error('GameScreen: Failed to initialize GameController', error);
    showMessage(`Oyun başlatılamadı: ${error.message}`, 'error', 0);

    // Clean up on error
    if (gameController) {
      gameController.destroy();
      gameController = null;
    }
    gameState = null;

    // Show retry option
    setTimeout(() => {
      showScreen('level-select');
    }, 3000);
  }
}
