# 🎮 Euler's Path (Eulerin Yolu)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Built%20with-Vite-646CFF.svg)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

A captivating puzzle game based on the famous Seven Bridges of Königsberg problem, where players must find an Eulerian path through various levels of increasing complexity.

## 🌟 Features

- 🧩 Multiple challenging levels based on graph theory
- 🎨 Beautiful SVG-based graphics
- 📱 Responsive design that works on desktop and mobile
- 🏆 Level progression system
- 🎮 Intuitive touch and mouse controls
- ⌨️ Full keyboard navigation support
- ♿ WCAG 2.1 AA accessibility compliant
- 📊 Progress saving with local storage
- 🔒 Security-hardened with CSP and XSS prevention
- ⚡ Optimized performance with code splitting and lazy loading

## 🏗️ Architecture

This project follows a modular architecture with clear separation of concerns:

```
js/
├── core/                      # Core application logic
│   ├── App.js                 # Application bootstrap and initialization
│   ├── GameState.js           # Centralized state management
│   ├── StorageManager.js      # localStorage with error handling
│   └── game/                  # Game-specific modules
│       ├── GameController.js  # Main game orchestrator
│       ├── SVGLoader.js       # SVG fetching and parsing
│       ├── BridgeManager.js   # Bridge state and validation
│       ├── PathDrawer.js      # Drawing logic and rendering
│       └── InteractionHandler.js # Mouse/touch event processing
├── screens/                   # Screen components
│   └── GameScreen.js          # Game UI wrapper
├── data/                      # Configuration and data
│   ├── config.js              # Centralized configuration
│   └── levels.js              # Level definitions
└── utils/                     # Utility functions
    ├── ui.js                  # UI utilities and screen management
    └── utils.js               # General utility functions
```

### Key Design Patterns

- **Single Responsibility**: Each module has one clear purpose
- **Observer Pattern**: GameState notifies subscribers of changes
- **Dependency Injection**: Classes receive dependencies via constructor
- **Module Pattern**: ES6 modules with explicit exports

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/eulerin-yolu.git
   cd eulerin-yolu
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy environment variables:

   ```bash
   cp .env.example .env.development
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## 📜 Development Commands

```bash
# Development
npm run dev              # Start development server with HMR

# Building
npm run build            # Build for production
npm run build:analyze    # Build with bundle analysis visualization
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Check code for errors
npm run lint:fix         # Auto-fix linting errors
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting

# Asset Optimization
npm run optimize:svg     # Optimize SVG files with SVGO
```

## 🎮 How to Play

1. **Objective**: Traverse each bridge exactly once to solve the puzzle.
2. **Controls**:
   - **Mouse**: Click and drag to draw your path
   - **Touch**: Tap and drag on mobile devices
   - **Keyboard**:
     - Tab: Navigate between interactive elements
     - Enter/Space: Start/end drawing
     - Arrow keys: Move drawing cursor
     - Escape: Cancel drawing and reset
3. **Rules**:
   - Cross each bridge exactly once
   - Stay on land or bridges (cannot cross water)
   - Complete the level by crossing all bridges
4. **Hints**:
   - Look for nodes with an odd number of connections
   - An Eulerian path starts and ends at different nodes if there are exactly two nodes of odd degree

## 🗺️ Level Guide

1. **Königsberg** - The classic Seven Bridges problem
2. **Circular Path** - A simple circular challenge
3. **Advanced Crossing** - More complex bridge arrangements
4. **Expert Challenge** - The ultimate test of your pathfinding skills

## 📁 Directory Structure

```
eulerin-yolu/
├── js/                        # JavaScript source files
│   ├── core/                  # Core application modules
│   │   ├── App.js             # Application initialization
│   │   ├── GameState.js       # State management
│   │   ├── StorageManager.js  # localStorage wrapper
│   │   └── game/              # Game logic modules
│   ├── screens/               # Screen components
│   ├── data/                  # Configuration and level data
│   └── utils/                 # Utility functions
├── public/                    # Static assets
│   ├── svgs/                  # Level SVG files
│   └── images/                # Image assets
├── dist/                      # Production build output
├── .env.example               # Environment variables template
├── vite.config.js             # Vite configuration
├── netlify.toml               # Netlify deployment config
└── vercel.json                # Vercel deployment config
```

## 🔧 Module Responsibilities

### Core Modules

- **App.js**: Application lifecycle, error boundaries, asset preloading
- **GameState.js**: Observable state store with pub/sub pattern for centralized state management
- **StorageManager.js**: Robust localStorage wrapper with fallbacks and error handling
- **GameController.js**: Coordinates game modules and manages game flow
- **SVGLoader.js**: Async SVG loading, CDATA handling, viewBox parsing
- **BridgeManager.js**: Bridge initialization, crossing validation, visual updates
- **PathDrawer.js**: Polyline rendering, point management, path validation
- **InteractionHandler.js**: Event delegation, coordinate transformation, gesture handling

### Screen Modules

- **MainMenuScreen.js**: Renders main menu and handles navigation
- **LevelSelectScreen.js**: Displays level grid with completion status
- **GameScreen.js**: Renders game UI and coordinates with GameController

### Data Modules

- **config.js**: All constants (colors, timing, thresholds, storage keys)
- **levels.js**: Level metadata (names, SVG paths)

### Utility Modules

- **ui.js**: Screen transitions, message display, icon rendering
- **utils.js**: SVG coordinate conversion, geometry calculations

## 🛠️ Built With

- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [Lucide Icons](https://lucide.dev/) - Beautiful & consistent icons
- Vanilla JavaScript - No frameworks, just pure web standards
- ES6+ Modules - Modern JavaScript module system
- CSS Custom Properties - For theming and design tokens

## 🔒 Security Features

- **Content Security Policy (CSP)**: Restrictive policy preventing XSS attacks
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- **Local Assets**: All resources served from local sources (no external dependencies)
- **Secure Storage**: localStorage operations wrapped with error handling and fallbacks
- **Input Sanitization**: Minimal innerHTML usage with proper sanitization

## ♿ Accessibility

This application is built with accessibility in mind and aims for WCAG 2.1 AA compliance:

- **Keyboard Navigation**: Full keyboard support (Tab, Enter, Space, Arrow keys, Escape)
- **Screen Reader Support**: ARIA labels, roles, and live regions
- **Focus Indicators**: Visible focus indicators on all interactive elements
- **Color Contrast**: All text meets 4.5:1 contrast ratio
- **Touch Targets**: Minimum 44x44px touch target sizes
- **Responsive Design**: Works on all device sizes and orientations

## ⚡ Performance Optimizations

### Code Splitting

Dynamic imports are used for screen components to reduce initial bundle size:

```javascript
// Screens are loaded on-demand
const { loadGameScreen } = await import('@screens/GameScreen.js');
```

### SVG Optimization

All SVG level files are optimized using [SVGO](https://github.com/svg/svgo) to reduce file sizes while maintaining visual quality. The optimization process:

- Removes unnecessary metadata and comments
- Cleans up attributes and numeric values
- Converts colors to shorter formats
- Preserves viewBox and bridge IDs for game functionality
- Achieves ~36% file size reduction on average

To re-optimize SVG files after making changes:

```bash
npm run optimize:svg
```

**Optimization Results:**

- `konigsberg.svg`: 21.25 KB → 21.24 KB (minimal change, already optimized)
- `circular.svg`: 32.99 KB → 32.99 KB (minimal change, already optimized)
- `third.svg`: 20.10 KB → 8.27 KB (58.9% reduction)
- `fourth.svg`: 53.63 KB → 19.57 KB (63.5% reduction)
- **Total reduction: 35.86%** (from 128 KB to 82 KB)

### Build Optimizations

- **Minification**: Terser minification with console.log removal in production
- **Code Splitting**: Separate chunks for vendor, game-core, and UI code
- **Asset Inlining**: Small assets (<4KB) inlined to reduce HTTP requests
- **Tree Shaking**: Unused code eliminated during build
- **Source Maps**: Hidden in production for security

### Performance Targets

- Bundle size: < 200KB (gzipped)
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse score: > 90

## 🌐 Browser Support

- Chrome/Edge: last 2 versions
- Firefox: last 2 versions
- Safari: last 2 versions
- iOS Safari: last 2 versions
- Chrome Android: last 2 versions

## 🚀 Deployment

### Netlify

The project includes a `netlify.toml` configuration file. Simply connect your repository to Netlify and it will automatically deploy.

```bash
# Manual deployment
npm run build
netlify deploy --prod --dir=dist
```

### Vercel

The project includes a `vercel.json` configuration file. Connect your repository to Vercel for automatic deployments.

```bash
# Manual deployment
npm run build
vercel --prod
```

### GitHub Pages

A GitHub Actions workflow is included for automated deployments to GitHub Pages:

1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"
3. Push to main branch to trigger deployment

The workflow file is located at `.github/workflows/deploy.yml`.

## 📚 Learn More

This game is based on the [Seven Bridges of Königsberg](https://en.wikipedia.org/wiki/Seven_Bridges_of_K%C3%B6nigsberg) problem, a famous problem in mathematics that laid the foundations of graph theory and topology.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Acknowledgments

- Inspired by Leonhard Euler's work on graph theory
- Special thanks to all contributors who helped with testing and feedback
- Thanks to the open source community for the amazing tools and resources
