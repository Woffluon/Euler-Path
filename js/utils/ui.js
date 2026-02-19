/**
 * UI utilities for screen management, message display, and icon rendering.
 * Provides functions for navigating between screens, showing user messages,
 * and rendering SVG icons.
 * @module utils/ui
 */

const appContainer = document.getElementById('app-container');

/**
 * Clears all content from the app container.
 * Removes all child elements from the main application container.
 */
export function clearAppContainer() {
  if (appContainer) {
    appContainer.innerHTML = '';
  } else {
    console.error('App container not found!');
  }
}

/**
 * Shows a screen by dynamically importing and loading the appropriate screen module.
 * Uses code splitting to load screens on-demand for better performance.
 *
 * @param {string} screenType - The type of screen to show ('menu', 'level-select', 'game')
 * @param {Object} [options={}] - Optional parameters for the screen
 * @param {number} [options.levelIndex] - Required for 'game' screen - the level index to load
 * @returns {Promise<void>}
 * @throws {Error} If screen loading fails
 */
export async function showScreen(screenType, options = {}) {
  clearAppContainer();
  if (!appContainer) return;

  try {
    switch (screenType) {
      case 'menu': {
        const { loadMainMenuScreen } = await import('../mainMenu.js');
        loadMainMenuScreen(appContainer);
        break;
      }
      case 'level-select': {
        const { loadLevelSelectScreen } = await import('../levelSelect.js');
        loadLevelSelectScreen(appContainer);
        break;
      }
      case 'game': {
        if (options.levelIndex !== undefined) {
          const { loadGameScreen } = await import('@screens/GameScreen.js');
          loadGameScreen(appContainer, options.levelIndex);
        } else {
          console.error('Level index not provided for game screen');
          await showScreen('menu'); // Fallback to menu
        }
        break;
      }
      default: {
        console.error(`Unknown screen type: ${screenType}`);
        const { loadMainMenuScreen } = await import('../mainMenu.js');
        loadMainMenuScreen(appContainer); // Fallback to menu
      }
    }
  } catch (error) {
    console.error(`Failed to load screen ${screenType}:`, error);
    // Show error message to user
    showMessage('Ekran yüklenemedi. Lütfen sayfayı yenileyin.', 'error', 0);
  }
}

// --- Message Handling ---
let messageTimeoutId = null;

/**
 * Displays a message to the user with specified type and duration.
 * Messages are announced to screen readers via aria-live regions.
 *
 * @param {string} text - The message text to display
 * @param {string} [type='warning'] - The message type ('success', 'warning', 'error', 'info')
 * @param {number} [duration=2000] - Duration in milliseconds (0 = no auto-hide)
 */
export function showMessage(text, type = 'warning', duration = 2000) {
  const messageArea = document.getElementById('message-area');
  const messageElement = document.getElementById('message-content');
  const iconElement = document.getElementById('message-icon');

  if (!messageArea || !messageElement || !iconElement) {
    console.warn('Message area elements not found in the current screen.');
    // Attempt to create a temporary message if area doesn't exist (optional)
    if (appContainer) {
      const tempMessage = document.createElement('div');
      tempMessage.textContent = text;
      tempMessage.style.position = 'fixed';
      tempMessage.style.bottom = '20px';
      tempMessage.style.left = '50%';
      tempMessage.style.transform = 'translateX(-50%)';
      tempMessage.style.padding = '10px 20px';
      tempMessage.style.borderRadius = '5px';
      tempMessage.style.backgroundColor = type === 'success' ? 'lightgreen' : 'lightcoral';
      tempMessage.style.color = 'black';
      tempMessage.style.zIndex = '1000';
      tempMessage.setAttribute('role', 'status');
      tempMessage.setAttribute('aria-live', 'polite');
      appContainer.appendChild(tempMessage);
      setTimeout(() => tempMessage.remove(), duration);
    }
    return;
  }

  // Clear any existing timeout
  if (messageTimeoutId) {
    clearTimeout(messageTimeoutId);
    messageTimeoutId = null;
  }

  messageElement.textContent = text;
  messageArea.classList.remove('success', 'warning'); // Remove previous types
  messageArea.classList.add(type); // Add current type
  iconElement.innerHTML = getIconSvg(type === 'success' ? 'Check' : 'AlertTriangle'); // Update icon

  messageArea.classList.add('visible');

  // Announce to screen readers by updating aria-live region
  // The aria-live="polite" attribute on messageArea will automatically announce the change

  // Set timeout to hide the message
  if (duration > 0) {
    messageTimeoutId = setTimeout(() => {
      hideMessage();
    }, duration);
  }
}

/**
 * Hides the currently displayed message.
 * Removes the visible class and clears any pending auto-hide timeout.
 */
export function hideMessage() {
  const messageArea = document.getElementById('message-area');
  if (messageArea) {
    messageArea.classList.remove('visible');
    // Optionally clear text after fade out
    // setTimeout(() => {
    //     const messageElement = document.getElementById('message-content');
    //     if(messageElement) messageElement.textContent = '';
    // }, 300); // Match transition duration
  }
  if (messageTimeoutId) {
    clearTimeout(messageTimeoutId);
    messageTimeoutId = null;
  }
}

// --- Icon Helper ---
// Basic SVG strings for icons (replace with actual SVG content or library calls)
// Using simple placeholders for now. Consider using lucide-static if installed.

/**
 * Returns an SVG string for the specified icon name.
 * Provides inline SVG icons for UI elements.
 *
 * @param {string} iconName - The name of the icon ('Play', 'Info', 'ArrowLeft', 'RotateCcw', 'AlertTriangle', 'Check', 'Lock')
 * @returns {string} SVG markup string for the icon, or empty string if icon not found
 */
export function getIconSvg(iconName) {
  // In a real app, you'd fetch these from lucide-static or have them defined
  switch (iconName) {
    case 'Play':
      return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    case 'Info':
      return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    case 'ArrowLeft':
      return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`;
    case 'RotateCcw':
      return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 2v6h6"></path><path d="M3 13a9 9 0 1 0 3-7.7L3 8"></path></svg>`;
    case 'AlertTriangle':
      return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    case 'Check':
      return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    case 'Lock':
      return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
    default:
      return ''; // Return empty string for unknown icons
  }
}
