// ============================================================================
// AQUARIUM BUILDER — Main Entry Point
//
// Module structure:
//   data/          → Pure data: fish, plants, equipment, presets (JSON-like)
//   rendering/     → Canvas drawing functions (pure, no React dependency)
//   hooks/         → Logic helpers (warnings, validation)
//   components/    → React components (AquariumCanvas, AquariumBuilder)
//
// Usage:
//   import AquariumBuilder from './aquarium-builder/index.js';
//   <AquariumBuilder />
// ============================================================================
export { default } from './components/AquariumBuilder.jsx';
