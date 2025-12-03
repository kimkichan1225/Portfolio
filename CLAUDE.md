# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a dual-mode interactive portfolio built with React 19 and Three.js. The project features both a traditional web portfolio and an immersive 3D game environment where users can control a character to explore different levels and interact with portfolio content.

## Common Commands

### Development
```bash
npm start                # Start development server on http://localhost:3000
npm run build           # Create production build in build/ folder
npm test                # Run test suite
```

### Deployment
```bash
netlify deploy --prod   # Deploy to Netlify production
```

## Architecture

### Dual Mode System

The application has two distinct modes managed by the `isWebMode` state:

1. **Web Mode**: Traditional scrolling portfolio with project gallery, profile information, and contact details
2. **Game Mode**: 3D interactive environment with 4 explorable levels

### Game State Machine

The game uses a state machine pattern with the following states:
- `playing_level1` - Starting area with portals to Level 2 and Level 3
- `playing_level2` - Project gallery with interactive cabinets
- `playing_level3` - Tech stack office with skill tables
- `playing_level4` - Personal workspace with contact/profile information
- `returning_to_level1` - Transition from Level 2 back to Level 1
- `returning_to_level1_from_level3` - Transition from Level 3 back to Level 1
- `returning_to_level3_from_level4` - Transition from Level 4 back to Level 3

Level transitions use `setGameStateWithFade()` which handles fade effects and sets spawn positions.

### Key Components

**App.js** (main application file ~2500+ lines)
- Contains all game logic, character system, level definitions, and web mode content
- Houses project data in `projectsData` array (lines 14-213)
- Implements custom GLSL shader for gradient floor material
- Manages all interaction systems (doors, cabinets, tables, etc.)

**Model Component** (character system)
- RigidBody-based physics movement using Rapier
- GLTF character model with 3 animations: Idle, Walk, Run
- Distance-based interaction detection (7 units range)
- Footstep audio system with dynamic intervals (0.6s walk, 0.45s run)
- 500ms cooldown on E key interactions

**CameraController Component**
- Fixed offset camera at position `(-0.00, 28.35, 19.76)`
- Smooth lerp-based character tracking (delta * 2.0 for camera, delta * 12.0 for target)
- Automatic reset on level transitions

**Custom Hooks**
- `useKeyboardControls` - WASD, Shift, E, C key detection
- `useScrollAnimation` - IntersectionObserver-based scroll animations for web mode

### Physics System

Uses `@react-three/rapier` for physics:
- Character: Dynamic RigidBody with CapsuleCollider `[2, 1.3]` at position `[0, 3.2, 0]`
- Movement speeds: Walk = 8, Run = 18
- Rotation locked on physics body, applied separately to character model via quaternion slerp (0.25)
- Linear damping: 2.0, Angular damping: 1.0
- Physics component uses `key` prop to force recreation and reset Rapier world on level changes

### Level System

**Spawn Positions**: Each level has specific spawn positions set in `setGameStateWithFade()`:
- Level 1: `[0, 1.7, -60]` (default), `[0, 1.7, 60]` (from Level 2), `[-34, 1.7, 13]` (from Level 3)
- Level 2: `[0, 1.7, 57]`
- Level 3: `[-43.50, 1.7, 12.52]` (from Level 1), `[65, 1.7, -10]` (from Level 4)
- Level 4: `[65, 1.7, -10]`

**Level Maps**: GLB files located in `public/resources/` (multiple versions exist)
- Level1Map.glb (and variants: -v2, -v3, -snow)
- Level2Map.glb (and -v2)
- Level3Map.glb (and -v2)
- Level4Map.glb (and -v2)

**Interactive Objects**: Each level component extracts object positions from GLB scene using `scene.getObjectByName()`:
- Level 1: door001, door (portal doors)
- Level 2: AsuraCabinet, ConviCabinet, VoidCabinet, door001
- Level 3: FrontendTable, BackendTable, GameDevTable, ToolsTable, door, door002
- Level 4: cabinetTelevision, wall, deskCorner, door002

### Custom GLSL Shader

**GradientFloorMaterial**: Screen-space gradient shader with shadow support
- Uses screen coordinates for diagonal gradient (darker top-left to brighter bottom-right)
- Integrates Three.js shadow mapping system
- Applied to floor meshes in levels

### Project Data Structure

Projects are defined in the `projectsData` array with fields:
- `id`, `title`, `description`, `image`, `video`
- `tech` - Array of technology stack strings
- `overview` - Array of feature/system descriptions
- `achievements` - Array of accomplishment strings
- `challenges` - Array of objects with `title` and `description`
- `github`, `demo` - URLs
- `reports` - Array of objects with `title` and `file` (PDF paths)

### Interaction System

**Distance-based Detection**: All interactions use 7-unit distance threshold
**E Key Interaction**: 500ms cooldown managed by `lastDoorInteractionTimeRef`
**Object Types**:
- Doors: Play door sound, trigger level transition
- Cabinets (Level 2): Display project modals
- Tables (Level 3): Display tech stack information (auto-show when near)
- Objects (Level 4): Display contact/profile/portfolio information

### Asset Paths

**Character**: `/resources/GameView/Suit.glb` (scale: 2)
**Sounds**:
- Footsteps: `/resources/Sounds/Step2.wav`
- Door: `/sounds/opendoor.mp3`
**Project Media**: `/FirstProject.png`, `/SecondProject.png`, `/ThirdProject.png`
**Project Videos**: `/FirstProjectGamePlay.mp4`, `/SecondProjectPlay.mov`
**PDFs**: Various report PDFs in `/public/`

## Adding New Features

### Adding a New Project (Web Mode)
1. Add project object to `projectsData` array in App.js (line 14)
2. Place project assets (images, videos, PDFs) in `/public/` folder
3. Follow existing structure with required fields

### Adding a New Level
1. Create new game state (e.g., `playing_level5`)
2. Create GLB map file and place in `public/resources/`
3. Create Level component following pattern of existing levels
4. Add door interaction logic in Model component's `useFrame`
5. Add spawn position case in `setGameStateWithFade()`
6. Add conditional rendering in main Canvas component

### Adding Interactive Objects
1. Name the object in your GLB file
2. Extract position using `scene.getObjectByName('objectName')` in level component
3. Add state for position and proximity (e.g., `objectPosition`, `isNearObject`)
4. Add distance detection logic in Model component's `useFrame`
5. Create UI indicator component
6. Define E key interaction behavior

## Build Configuration

Uses Create React App (react-scripts 5.0.1):
- No custom webpack config exposed
- Builds to `/build` directory
- Configured for Netlify SPA deployment
- No TypeScript (pure JavaScript/JSX)

## Important Constants

**Character Movement**:
- Walk speed: 8
- Run speed: 18
- Footstep interval: Walk 0.6s, Run 0.45s

**Interaction**:
- Distance threshold: 7 units
- E key cooldown: 500ms

**Camera**:
- Fixed offset: `(-0.00, 28.35, 19.76)`
- Position lerp speed: 2.0
- Target lerp speed: 12.0

**Character Physics**:
- Mass: 1
- Linear damping: 2.0
- Angular damping: 1.0
- Collider: CapsuleCollider with args `[2, 1.3]` at position `[0, 3.2, 0]`
