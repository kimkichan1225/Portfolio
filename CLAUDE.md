# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a dual-mode 3D interactive portfolio built with React, Three.js, and React Three Fiber. The application features:
- **Web Mode**: Traditional portfolio website with About, Projects, and Contact sections
- **Game Mode**: 3D game with three distinct levels where users control an animated character to explore projects and interact with various 3D elements including portals, vehicles, and environmental objects

The application defaults to Web Mode on load, with seamless toggling between modes via the navigation bar.

## Development Commands

### Start Development Server
```bash
npm start
```
Runs the app in development mode on `http://localhost:3000`

### Build Production
```bash
npm run build
```
Creates an optimized production build in the `build/` folder

### Run Tests
```bash
npm test
```
Launches the test runner in interactive watch mode

### Deploy to Netlify
```bash
netlify deploy --prod
```
Deploys the production build to Netlify. The project includes `netlify.toml` configuration file with optimized settings for React SPA deployment.

## Core Architecture

### Application Mode Management
The application has two primary modes controlled by `isWebMode` state:
- **Web Mode** (`isWebMode: true`): Displays `WebModeContent` component with portfolio sections
- **Game Mode** (`isWebMode: false`): Displays 3D Canvas with game levels

### Game State Management
Within Game Mode, a state machine pattern manages level transitions:
- `playing_level1`: Natural environment with palm trees, NPC, and portals
- `entering_portal`: Transition state when entering Level 2 portal
- `playing_level2`: Urban racing environment with drivable car
- `entering_portal_level3`: Transition state when entering Level 3 portal
- `playing_level3`: Architectural/building environment

### Key System Components

**Character System** (`src/App.js` - `Model` component)
- Uses GLTF animated character from Ultimate Animated Character Pack
- Animations: Idle, Walk, Run controlled by `useAnimations` hook
- Movement speed: ~0.1 units for walking, ~0.2 units for running
- Position tracking via `characterRef` shared across components
- Audio integration: footstep sounds synchronized with walk/run animations

**Vehicle System** (Level 2 only - `RaceFuture` component)
- Front-wheel steering with rear-wheel drive physics
- Enter/exit vehicle with 'E' key
- Realistic wheel animations (front wheels steer, all wheels rotate)
- Speed system: gradual acceleration/deceleration with max speed ~0.3 units
- Steering angle: max ±0.5 radians
- Character becomes invisible when in car, reappears on exit

**Camera System** (`CameraController` component)
- Fixed offset camera following character/vehicle: `(-0.00, 28.35, 19.76)`
- Smooth lerp-based tracking (delta * 5.0 for normal, delta * 2.0 for portal transitions)
- Special behavior during portal transitions: closer follow with lookAt character
- Camera automatically tracks vehicle when character is in car

**Portal System** (`PortalVortex.js`)
- Custom GLSL shader-based portal visuals with swirling vortex effect
- Two portal variants: blue-white for Level 2, white-orange for Level 3
- Collision detection via distance checking (portalRadius = 2 units)
- Portal positions defined as constants at top of App.js (e.g., `portalPosition`, `portalLevel3Position`)

### Input Handling

Keyboard controls via `useKeyboardControls.js`:
- WASD: Character movement
- Shift: Sprint modifier
- E: Car interaction (Level 2)
- C: Camera debug logging
- Enter: UI interactions

### UI System

**NavigationBar Component** (`src/App.js` - `NavigationBar` component)
- Toggle between Web Mode and Game Mode
- Auto-hide in Game Mode: navigation bar appears when mouse moves to top 80px of screen
- Always visible in Web Mode
- Mode toggle button switches between 🎮 (Game) and 🌐 (Web) icons
- Web Mode is the default state on initial load
- Contains navigation links (About, Projects, Contact) that work in Web Mode

**WebModeContent Component** (`src/App.js` - `WebModeContent` component)
- Traditional portfolio website layout
- Three main sections: About, Projects, Contact
- Scroll-based animations using `useScrollAnimation` hook
- Project cards displayed in grid layout
- Clicking project cards opens detailed modal via `ProjectModal` component
- Typing animation effect for name using `TypingAnimation` component

**ProjectModal Component** (`src/ProjectModal.js`)
- Modal overlay for displaying project details
- Displays project title, description, tech stack, and detailed features
- Links to GitHub and live demo (when available)
- Closes on ESC key or clicking outside modal
- Prevents body scroll when open

**Custom Popup System** (`showCustomPopup` function)
- Custom styled notification system with gradient background
- Auto-dismisses after 2 seconds with slide-out animation
- Used for user feedback (e.g., portal transitions, interactions)
- Replaces browser's native alert/popup for better UX

## Custom Shaders

**GradientFloorMaterial** (`src/App.js`)
- Vertex shader passes world position and screen position to fragment shader
- Fragment shader creates diagonal gradient from screen coordinates
- Includes Three.js shadow mapping support (`#include <shadowmap_pars_fragment>`)
- Colors: `#90EE90` (start) to `#E0FFE0` (end) for Level 1

**VortexMaterial** (`src/PortalVortex.js`)
- Time-based animation via `uTime` uniform updated in `useFrame`
- Polar coordinate transformation for swirl effect
- Noise-based pattern generation
- Transparency with intensity fade toward center

## 3D Asset Organization

Assets are located in `public/` directory:
- **Characters**: `resources/Ultimate Animated Character Pack/glTF/Worker_Male.gltf`
- **Vehicles**: `resources/kenney_car-kit/Models/GLB-format/race-future.glb`
- **Nature**: `resources/Nature-Kit/Models/GLTF-format/` (stones, paths, etc.)
- **Trees**: `resources/Ultimate Nature Pack/FBX/PalmTree_4.fbx`
- **Custom Models**: Portal bases, game maps, decorative elements (githubcat.glb, mailbox.glb, toolbox.glb, etc.)
- **Audio**: `sounds/` (footsteps, car sounds)

Models use `useGLTF.preload()` or `useFBX()` for loading. All meshes should have `castShadow` and `receiveShadow` enabled via `traverse()`.

## Level Structure

Each level is a separate component that receives `characterRef`:

**Level1** (`src/App.js` - `Level1` component)
- Green gradient floor with natural theme using level1map.png texture
- NPC character with speech bubble
- Two portals: one to Level 2 (blue-white vortex), one to Level 3 (white-orange vortex)
- Palm trees and stone decorations
- Social media objects (GitHub cat, Instagram logo, mailbox)
- Toolbox and other decorative elements

**Level2** (`src/App.js` - `Level2` component)
- Urban/racing theme with level2map.png texture
- Drivable car (`RaceFuture` component) at origin with scale 5
- Return portal to Level 1 (blue-white vortex)
- Vehicle physics and interaction system
- Simpler environment focused on racing experience

**Level3** (`src/App.js` - `Level3` component)
- Architectural environment with beige floor (#FFE4B5)
- Game map models (`GameMap.glb`, `GameMap2.glb`)
- Return portal to Level 1 (white-orange vortex)
- Complex building structures for exploration

## Utility Hooks

**useKeyboardControls** (`src/useKeyboardControls.js`)
- Custom hook for keyboard input handling
- Tracks key states: forward, backward, left, right, shift, log, e, enter
- Uses event listeners for keydown/keyup
- Returns object with boolean values for each key state

**useScrollAnimation** (`src/useScrollAnimation.js`)
- Custom hook for scroll-triggered animations
- Uses IntersectionObserver API to detect when elements enter viewport
- Configurable threshold and rootMargin options
- Option for one-time or repeating animations
- Returns `[elementRef, isVisible]` tuple

**TypingAnimation Component** (`src/TypingAnimation.js`)
- Animated text typing effect
- Configurable speed and delay parameters
- Optional onComplete callback
- Includes blinking cursor animation

## Component Patterns

**Model Cloning**
Most 3D models are cloned using `useMemo()` to allow multiple independent instances:
```javascript
const clonedScene = useMemo(() => {
  const cloned = scene.clone();
  cloned.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return cloned;
}, [scene]);
```

**Portal Collision Detection**
Distance-based checking in `useFrame`:
```javascript
const distance = characterRef.current.position.distanceTo(portalPosition);
if (distance < portalRadius) {
  // Trigger portal transition
}
```

**Animation State Management**
Animations use fade in/out transitions (0.5s duration) when switching states.

**Project Data Structure**
Projects are stored in `projectsData` array at top of App.js with structure:
```javascript
{
  id: number,
  title: string,
  description: string,
  image: string | null,
  tech: string[],
  details: string[],
  github: string | null,
  demo: string | null
}
```

## Important Constants and Positions

Portal positions and radii are defined at the top of App.js (~line 225):
- `portalPosition`: Level 1 to Level 2 portal at `(-20, 7.5, -20)`
- `portalLevel3Position`: Level 1 to Level 3 portal at `(20, 7.5, -20)`
- `portalLevel2ToLevel1Position`: Return portal in Level 2 at `(0, 7.5, 23.5)`
- `portalLevel3ToLevel1Position`: Return portal in Level 3 at `(0, 7.5, 23.5)`
- `level2PortalFrontPosition`: Spawn position after entering Level 2 portal at `(-20, 0, -15)`
- `level3PortalFrontPosition`: Spawn position after entering Level 3 portal at `(20, 0, -15)`
- Portal radii: 2 units for all portals
- Character spawn positions: Level 2 at `(0, 0, 10)`, Level 3 at `(0, 0, 15)`

Camera offset: `new THREE.Vector3(-0.00, 28.35, 19.76)` (defined at line ~238)

## Shadow System

The game uses Three.js shadow mapping:
- Directional light with shadows enabled
- Shadow map size: typically 2048x2048
- All meshes should have both `castShadow` and `receiveShadow` set to true
- Custom shaders must include shadow mapping shader chunks

## Performance Considerations

- Use `useMemo()` for cloned 3D models to prevent unnecessary re-renders
- Preload GLTF models with `useGLTF.preload()`
- Audio files are preloaded with `preload='auto'`
- Shadow maps are performance-intensive; camera settings optimized for balance

## Styling and CSS

The application uses multiple CSS files for styling:
- **src/App.css**: Main application styles including Web Mode layout, navigation bar, project cards, and animations
- **src/ProjectModal.css**: Modal-specific styles for project detail overlay
- **src/index.css**: Global styles and CSS reset

CSS animations include:
- Fade-in, slide-in, and scale-in animations for scroll-triggered effects
- Typing cursor blink animation
- Popup slide-in/slide-out animations
- Navigation bar show/hide transitions

## File Structure

```
portfolio-game/
├── public/
│   ├── resources/              # 3D models and textures
│   │   ├── kenney_car-kit/
│   │   ├── Nature-Kit/
│   │   ├── Ultimate Animated Character Pack/
│   │   └── Ultimate Nature Pack/
│   ├── sounds/                 # Audio files
│   └── *.glb                   # Additional 3D models
├── src/
│   ├── App.js                  # Main application component
│   ├── App.css                 # Main styles
│   ├── PortalVortex.js         # Portal shader component
│   ├── ProjectModal.js         # Project detail modal
│   ├── ProjectModal.css        # Modal styles
│   ├── TypingAnimation.js      # Typing effect component
│   ├── useKeyboardControls.js  # Keyboard input hook
│   ├── useScrollAnimation.js   # Scroll animation hook
│   ├── index.js                # React entry point
│   └── index.css               # Global styles
├── netlify.toml                # Netlify deployment config
└── package.json                # Dependencies and scripts
```

## Common Development Tasks

**Adding a new project to Web Mode:**
1. Add project object to `projectsData` array in App.js
2. Include all required fields: id, title, description, tech, details
3. Optional: Add project image to public folder and reference in image field
4. Optional: Add GitHub and demo URLs

**Adding a new 3D object:**
1. Place asset file in appropriate `public/resources/` subdirectory
2. Create component using `useGLTF()` or `useFBX()`
3. Clone scene and enable shadows in `useMemo()`
4. Add `useGLTF.preload()` call after component
5. Place component in desired level with position/scale/rotation props

**Adding a new portal:**
1. Define portal position and radius constants at top of App.js
2. Add portal collision detection in `Model` component's `useFrame`
3. Create new game state for transition
4. Add `PortalVortex` visual component at portal location
5. Add `PortalBase` model beneath vortex

**Modifying character movement:**
- Speed values are in `useFrame` within `Model` component (~line 500-700)
- Walking speed: ~0.1, running speed: ~0.2
- Rotation speed: delta * 3.0

**Adding new audio:**
1. Place audio file in `public/sounds/`
2. Create `useRef()` for audio element
3. Load in `useEffect()` with `new Audio(path)`
4. Trigger playback with `.play()` at appropriate event

**Modifying Web Mode animations:**
- Adjust `useScrollAnimation` options (threshold, rootMargin) for trigger points
- Modify animation delays in style={{ transitionDelay }} props
- Edit CSS animation classes in App.css (fade-in, slide-in, scale-in)
