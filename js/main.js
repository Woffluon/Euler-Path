/**
 * Main entry point for the Euler's Path game application.
 * Sets up global error handlers and initializes the App on DOM ready.
 *
 * @module main
 */

import { App } from './core/App.js';
import { showMessage } from './utils/ui.js';
import CONFIG from './data/config.js';

/**
 * Global error handler for uncaught exceptions.
 * Logs errors and displays user-friendly messages based on environment.
 *
 * @param {ErrorEvent} event - The error event
 */
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);

  // Show detailed error in development, generic message in production
  if (CONFIG.game.enableDebug) {
    showMessage(`Error: ${event.error.message}`, 'error', 0);
  } else {
    showMessage('Bir hata oluştu. Lütfen sayfayı yenileyin.', 'error', 0);
  }

  // Prevent default browser error handling
  event.preventDefault();
});

/**
 * Global handler for unhandled promise rejections.
 * Logs promise errors and displays user-friendly messages based on environment.
 *
 * @param {PromiseRejectionEvent} event - The promise rejection event
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);

  // Show detailed error in development, generic message in production
  if (CONFIG.game.enableDebug) {
    showMessage(`Promise error: ${event.reason}`, 'error', 0);
  } else {
    showMessage('Bir hata oluştu. Lütfen sayfayı yenileyin.', 'error', 0);
  }

  // Prevent default browser error handling
  event.preventDefault();
});

/**
 * Application initialization on DOM ready.
 * Instantiates App, initializes with asset preloading, and starts the application.
 * Provides fallback error UI if initialization fails completely.
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Create App instance
    const app = new App();

    // Initialize the application (preload assets, setup)
    await app.initialize();

    // Start the application (show main menu)
    app.start();
  } catch (error) {
    // Fallback error UI if App initialization fails completely
    console.error('Critical initialization error:', error);

    // Create fallback error UI
    const appContainer = document.getElementById('app');
    if (appContainer) {
      const errorMessage = CONFIG.game.enableDebug
        ? `Kritik Hata: ${error.message}`
        : 'Uygulama başlatılamadı. Lütfen sayfayı yenileyin.';

      appContainer.innerHTML = `
        <div class="app-error">
          <div class="error-content">
            <h2>Bir Hata Oluştu</h2>
            <p>${errorMessage}</p>
            <button id="reload-button" class="btn btn-primary">
              Sayfayı Yenile
            </button>
          </div>
        </div>
      `;

      // Add event listener for reload button (CSP-compliant)
      const reloadButton = document.getElementById('reload-button');
      if (reloadButton) {
        reloadButton.addEventListener('click', () => {
          window.location.reload();
        });
      }
    }
  }
});
