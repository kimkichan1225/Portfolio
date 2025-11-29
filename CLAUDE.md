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
- `playing_level1`: Natural environment with doors to Level 2 and Level 3
- `playing_level2`: Urban racing environment with drivable car
- `playing_level3`: Architectural/building environment with door to Level 4
- `playing_level4`: Dark space environment with return door to Level 3

Level transitions use a fade effect system (`isFading` state) with door interaction:
- E key near doors triggers `setGameStateWithFade()` function
- Fade out (400ms) → State change + spawn position update → Fade in (1800ms total)
- Physics engine is recreated on each level transition using dynamic `key` prop

### Key System Components

**Character System** (`src/App.js` - `Model` component)
- Uses GLTF animated character from Ultimate Animated Character Pack (Suit.glb)
- Animations: Idle, Walk, Run controlled by `useAnimations` hook
- Physics-based movement using Rapier RigidBody with speed values (walking: 8, running: 18)
- Position tracking via `characterRef` shared across components
- Audio integration: footstep sounds synchronized with walk/run animations
- Spawn position controlled by `spawnPosition` state prop passed to RigidBody

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

**Door Interaction System**
- Interactive doors with 3D models positioned in each level
- Door positions discovered via `onDoorPositionFound` callback from level components
- Distance-based interaction detection (doorInteractionDistance = 8 units)
- UI indicator appears when character is near door ("E키를 눌러..." prompts)
- 5-second cooldown between door interactions to prevent spam (doorCooldownDuration = 5000ms)
- Door open sound effect plays on interaction

### Input Handling

Keyboard controls via `useKeyboardControls.js`:
- WASD: Character movement
- Shift: Sprint modifier
- E: Door interaction (all levels) and car interaction (Level 2 only)
- C: Character position debug logging
- Enter: UI interactions

### UI System

**NavigationBar Component** (`src/App.js` - `NavigationBar` component)
- Toggle between Web Mode and Game Mode
- Auto-hide in Game Mode: navigation bar appears when mouse moves to top 80px of screen
- Always visible in Web Mode
- Mode toggle button switches between 🎮 (Game) and 🌐 (Web) icons
- Dark mode toggle button switches between ☀️ (Light) and 🌙 (Dark) icons
- Web Mode is the default state on initial load
- Contains navigation links (About, Projects, Contact) that work in Web Mode

**WebModeContent Component** (`src/App.js` - `WebModeContent` component)
- Traditional portfolio website layout
- Four main sections: Home, About, Projects, Contact & Skills
- Scroll-based animations using `useScrollAnimation` hook
- Project cards displayed in grid layout with image or video preview
- Clicking project cards opens detailed modal via `ProjectModal` component
- Typing animation effect for name using `TypingAnimation` component
- Email copy-to-clipboard feature in Contact section with custom popup notification
- Floating particle background animations

**ProjectModal Component** (`src/ProjectModal.js`)
- Modal overlay for displaying project details
- Displays project title, description, tech stack, overview, achievements, and challenges
- Video preview support with fallback to image
- Links to GitHub, live demo, and downloadable reports (PDF)
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
- **Audio**:
  - `/sounds/` - Car sounds (opencar.mp3, closecar.mp3)
  - `/resources/Sounds/` - Footstep sounds (Step2.wav, step2.mp3)

Models use `useGLTF.preload()` or `useFBX()` for loading. All meshes should have `castShadow` and `receiveShadow` enabled via `traverse()`.

## Level Structure

Each level is a separate component that receives `characterRef`:

**Level1** (`src/App.js` - `Level1` component)
- Natural village/town theme with level1map.png texture
- Two doors: door001 (to Level 2 - "프로젝트 갤러리"), door (to Level 3 - "기술 스택 사무실")
- Decorative 3D models and environmental objects
- Starting level with default spawn at `[0, 2, 0]`

**Level2** (`src/App.js` - `Level2` component)
- Urban/racing theme with level2map.png texture
- Drivable car (`RaceFuture` component) at origin with scale 5
- Return door001 to Level 1
- Vehicle physics and interaction system
- Spawn position when returning to Level1: `[9.96, 0.29, -61.47]`

**Level3** (`src/App.js` - `Level3` component)
- Office/architectural environment with beige floor (#FFE4B5)
- Game map models (`GameMap.glb`, `GameMap2.glb`)
- Two doors: door (to Level 1), door002 (to Level 4 - "개인 작업실")
- Spawn position when returning to Level1: `[-41.16, 0.29, -26.00]`
- Spawn position when returning from Level4: `[-40.53, 0.32, -16.26]`

**Level4** (`src/App.js` - `Level4` component)
- Dark space environment with black background (`#000000`)
- Level4Map component with custom geometry and physics
- Return door002 to Level 3
- Overhead directional lighting from `[0, 50, 0]`

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

**Door Collision Detection**
Distance-based checking in `useFrame` within Model component:
```javascript
const charPos = new THREE.Vector3(posX, posY, posZ);
const distance = charPos.distanceTo(doorPosition);
if (distance < doorInteractionDistance) {
  setIsNearDoor(true);
  if (e) { // E key pressed
    playDoorSound();
    setGameStateWithFade('target_level');
  }
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
  video: string | null,
  tech: string[],
  overview: string[],
  achievements: string[],
  challenges: Array<{
    title: string,
    description: string
  }>,
  github: string | null,
  demo: string | null,
  reports: Array<{
    title: string,
    file: string
  }>
}
```

## Important Constants and Positions

**Character Spawn Positions** (controlled by `spawnPosition` state in App component):
- Level 1 default: `[0, 2, 0]`
- Level 2 default: `[0, 2, 0]`
- Level 3 default: `[0, 2, 0]`
- Level 4 default: `[0, 2, 0]`
- Return to Level 1 from Level 2: `[9.96, 0.29, -61.47]`
- Return to Level 1 from Level 3: `[-41.16, 0.29, -26.00]`
- Return to Level 3 from Level 4: `[-40.53, 0.32, -16.26]`

**Door Interaction**:
- `doorInteractionDistance`: 8 units
- `doorCooldownDuration`: 5000ms (5 seconds)

**Camera Settings**:
- Camera offset: `new THREE.Vector3(-0.00, 28.35, 19.76)`
- Camera follows character via `CameraController` component

## Physics System (@react-three/rapier)

The game uses Rapier physics engine for character movement and collision detection:
- **Physics Component Key**: Dynamically generated using `${gameState}-${spawnPosition.join(',')}` to force recreation on level/spawn changes
- **Character RigidBody**: Dynamic type with capsule collider, position controlled by `spawnPosition` prop
- **Physics Recreation**: When transitioning levels, the entire Physics component unmounts and remounts with a new key, preventing Rust borrow checker violations
- **Linear/Angular Damping**: Character has linearDamping=2.0 and angularDamping=1.0 to prevent sliding
- **Rotation Locking**: Character rotations are disabled (`enabledRotations={[false, false, false]}`) to prevent tipping over

**CRITICAL**: Never attempt to mutate Rapier RigidBody positions after the physics world is created. Always use the `spawnPosition` prop approach to set initial positions before Physics component mounts.

### Level Transition Flow

When a door is activated (E key pressed near door):

1. **User Action**: `setGameStateWithFade('target_state')` is called (e.g., `'returning_to_level1'`)
2. **Fade Out**: `setIsFading(true)` triggers CSS fade overlay (400ms duration)
3. **State Update** (after 400ms):
   - `setSpawnPosition([x, y, z])` updates spawn position based on target state
   - `setGameState('playing_levelX')` changes to target level state
4. **Physics Regeneration**:
   - `getPhysicsKey()` returns new key based on `gameState` and `spawnPosition`
   - React detects key change → Physics component unmounts (destroying Rapier world)
   - Physics component remounts with clean Rapier world
   - Model component's RigidBody spawns at new `spawnPosition`
5. **Fade In**: After 1800ms total, `setIsFading(false)` removes overlay

This architecture avoids Rust borrow checker errors by never mutating existing RigidBody positions; instead, it creates a fresh physics world with the correct initial position.

## Shadow System

The game uses Three.js shadow mapping:
- Directional light with shadows enabled
- Shadow map size: typically 8192x8192 for high quality
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
1. Add project object to `projectsData` array in App.js (starts at line ~14)
2. Include all required fields: id, title, description, tech, overview, achievements, challenges
3. Optional: Add project image or video to public folder and reference in image/video field
4. Optional: Add GitHub and demo URLs
5. Optional: Add PDF reports to public folder and reference in reports array

**Adding a new 3D object:**
1. Place asset file in appropriate `public/resources/` subdirectory
2. Create component using `useGLTF()` or `useFBX()`
3. Clone scene and enable shadows in `useMemo()`
4. Add `useGLTF.preload()` call after component
5. Place component in desired level with position/scale/rotation props

**Adding a new door/level transition:**
1. Add new game state to state machine (e.g., `playing_level5`)
2. Create new level component with `onDoorPositionFound` callback
3. Add door model to level that calls `onDoorPositionFound` with door position
4. Add state variable for door position and nearDoor UI state in App component
5. Add door collision detection in `Model` component's `useFrame`
6. Add spawn position logic in `setGameStateWithFade` function
7. Add UI indicator component for door interaction
8. Render new level conditionally based on `gameState === 'playing_levelX'`

**Modifying character movement:**
- Speed values are in `useFrame` within `Model` component
- Walking speed: 8, running speed: 18 (physics-based linear velocity)
- Movement applies forces to RigidBody using `applyImpulse()`
- Rotation is controlled separately via `currentRotationRef` quaternion

**Adding new audio:**
1. Place audio file in `public/sounds/` or `public/resources/Sounds/`
2. Create `useRef()` for audio element
3. Load in `useEffect()` with `new Audio(path)`
4. Set volume with `.volume` property (0.0 to 1.0)
5. Trigger playback with `.play()` at appropriate event
6. Consider multiple fallback paths for audio files

**Modifying Web Mode animations:**
- Adjust `useScrollAnimation` options (threshold, rootMargin) for trigger points
- Modify animation delays in style={{ transitionDelay }} props
- Edit CSS animation classes in App.css (fade-in, slide-in, scale-in)
