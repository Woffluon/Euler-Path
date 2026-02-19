import { showScreen, showMessage } from '../utils/ui.js';
import { levels } from '../data/levels.js';
import CONFIG from '../data/config.js';

/**
 * App - Application bootstrap and initialization
 *
 * Manages application lifecycle, error boundaries, and asset preloading.
 * Provides loading indicators and user-friendly error handling with retry functionality.
 *
 * @class App
 */
export class App {
  /**
   * Creates an App instance
   */
  constructor() {
    this.loadingElement = null;
    this.errorElement = null;
    this.initialized = false;
  }

  /**
   * Initializes the application
   * Loads critical assets, checks storage, and sets up error handlers
   *
   * @returns {Promise<void>}
   * @throws {Error} If initialization fails
   */
  async initialize() {
    try {
      this.showLoading();

      // Preload critical SVG assets
      await this.preloadAssets();

      // Mark as initialized
      this.initialized = true;

      this.hideLoading();
    } catch (error) {
      console.error('Application initialization failed:', error);
      this.hideLoading();
      this.showError(error);
      throw error;
    }
  }

  /**
   * Starts the application by showing the main menu
   * Should be called after successful initialization
   */
  start() {
    if (!this.initialized) {
      console.warn('App.start() called before initialization');
    }

    // Show the main menu
    showScreen('menu');
  }

  /**
   * Displays a loading indicator during initialization
   */
  showLoading() {
    // Remove any existing loading element
    this.hideLoading();

    // Create loading element
    this.loadingElement = document.createElement('div');
    this.loadingElement.id = 'app-loading';
    this.loadingElement.className = 'app-loading';
    this.loadingElement.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p class="loading-text">Yükleniyor...</p>
      </div>
    `;

    // Add to body
    document.body.appendChild(this.loadingElement);
  }

  /**
   * Removes the loading indicator
   */
  hideLoading() {
    if (this.loadingElement && this.loadingElement.parentNode) {
      this.loadingElement.parentNode.removeChild(this.loadingElement);
      this.loadingElement = null;
    }
  }

  /**
   * Displays an error UI with retry button
   *
   * @param {Error} error - The error that occurred
   */
  showError(error) {
    // Remove any existing error element
    this.hideError();

    // Create error element
    this.errorElement = document.createElement('div');
    this.errorElement.id = 'app-error';
    this.errorElement.className = 'app-error';

    // Determine error message based on environment
    const errorMessage = CONFIG.game.enableDebug
      ? `Hata: ${error.message}`
      : 'Uygulama başlatılamadı. Lütfen sayfayı yenileyin.';

    this.errorElement.innerHTML = `
      <div class="error-content">
        <div class="error-icon">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <h2 class="error-title">Bir Hata Oluştu</h2>
        <p class="error-message">${errorMessage}</p>
        <button id="error-retry-btn" class="btn btn-primary">Tekrar Dene</button>
      </div>
    `;

    // Add to body
    document.body.appendChild(this.errorElement);

    // Add retry button handler
    const retryBtn = this.errorElement.querySelector('#error-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.hideError();
        this.retry();
      });
    }
  }

  /**
   * Removes the error UI
   */
  hideError() {
    if (this.errorElement && this.errorElement.parentNode) {
      this.errorElement.parentNode.removeChild(this.errorElement);
      this.errorElement = null;
    }
  }

  /**
   * Retries initialization after an error
   */
  async retry() {
    try {
      await this.initialize();
      this.start();
    } catch (error) {
      // Error UI is already shown by initialize()
      console.error('Retry failed:', error);
    }
  }

  /**
   * Preloads critical SVG assets to avoid loading delays
   * Fetches the first level SVG to ensure it's cached
   *
   * @returns {Promise<void>}
   * @throws {Error} If critical assets fail to load
   */
  async preloadAssets() {
    try {
      // Preload the first level SVG (most critical)
      if (levels.length > 0 && levels[0].svgPath) {
        const firstLevelPath = levels[0].svgPath;
        const response = await fetch(firstLevelPath);

        if (!response.ok) {
          throw new Error(`Failed to preload ${firstLevelPath}: HTTP ${response.status}`);
        }

        // Read the response to ensure it's cached
        await response.text();

        if (CONFIG.game.enableDebug) {
          console.warn(`Preloaded critical asset: ${firstLevelPath}`);
        }
      }

      // Could preload additional critical assets here
      // For example: fonts, images, additional SVGs
    } catch (error) {
      console.error('Asset preloading failed:', error);
      // Don't throw - allow app to continue even if preloading fails
      // The assets will be loaded on-demand instead
      if (CONFIG.game.enableDebug) {
        showMessage('Bazı kaynaklar önceden yüklenemedi', 'warning', 3000);
      }
    }
  }
}
