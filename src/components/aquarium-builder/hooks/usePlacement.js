import { DECORATIONS } from '../data/index.js';

// ============================================================================
// SMART DECORATION PLACEMENT
//
// Collision-aware positioning that accounts for decoration footprints,
// plant types (background/midground/foreground/floating/carpet/epiphyte),
// and natural aquascaping layouts.
// ============================================================================

const FLOATING_TYPES = ["frogbit", "salvinia", "duck"];
const CARPET_TYPES = ["carpet"];
const EPIPHYTE_TYPES = ["moss", "anubias", "bucep", "javafern"]; // attach to hardscape
const BACKGROUND_TYPES = ["val", "sword", "hornwort", "elodea", "wisteria", "rotala", "ludwigia"];
const FOREGROUND_TYPES = ["carpet", "dwarfsag", "staurogyne", "pogostemon", "crypto"];

// Estimate how much horizontal space a decoration occupies (0-1 normalized)
function getFootprint(dec, userScale = 1) {
  const s = (dec.scale || 1) * userScale;
  // Base width depends on the category
  if (dec.isPlant) {
    if (CARPET_TYPES.includes(dec.drawType)) return s * 0.12;
    if (FLOATING_TYPES.includes(dec.drawType)) return s * 0.08;
    if (BACKGROUND_TYPES.includes(dec.drawType)) return s * 0.05;
    return s * 0.04; // small plants
  }
  // Hardscape — larger footprints
  if (dec.size === 3) return s * 0.14; // castle, ship
  if (dec.size === 2) return s * 0.09; // rocks, driftwood
  return s * 0.06; // small items
}

// Build a list of all occupied zones: { center, halfWidth }
function getOccupiedZones(existingDecs) {
  const zones = [];
  existingDecs.forEach(d => {
    const dec = DECORATIONS.find(dd => dd.id === d.id);
    if (!dec) return;
    const positions = d.positions || [];
    const us = d.userScale || 1;
    const fp = getFootprint(dec, us);
    positions.forEach(pos => {
      if (FLOATING_TYPES.includes(dec.drawType)) return; // floaters don't block ground
      zones.push({ center: pos.x, halfWidth: fp / 2 });
    });
  });
  return zones;
}

// Find the best X position that avoids collisions
function findBestX(zones, footprint, preferredX = null, margin = 0.05) {
  const halfFP = footprint / 2;

  // If nothing placed yet, use preferred or center
  if (zones.length === 0) return preferredX || 0.5;

  // Build sorted edge list with wall boundaries
  const edges = [margin];
  zones.forEach(z => {
    edges.push(z.center - z.halfWidth);
    edges.push(z.center + z.halfWidth);
  });
  edges.push(1 - margin);
  edges.sort((a, b) => a - b);

  // Find all gaps between occupied zones
  let bestX = preferredX || 0.5;
  let bestScore = -Infinity;

  for (let i = 0; i < edges.length - 1; i += 1) {
    const gapStart = edges[i];
    const gapEnd = edges[i + 1];
    const gapWidth = gapEnd - gapStart;

    // Skip gaps that are too narrow
    if (gapWidth < footprint + 0.02) continue;

    const center = (gapStart + gapEnd) / 2;

    // Score: prefer wider gaps, penalize edges, bonus for preferred position
    let score = gapWidth * 10;
    // Prefer center-ish
    score -= Math.abs(center - 0.5) * 2;
    // Bonus if close to preferred position
    if (preferredX !== null) {
      score += Math.max(0, 0.3 - Math.abs(center - preferredX)) * 5;
    }

    if (score > bestScore) {
      bestScore = score;
      bestX = center;
    }
  }

  // Clamp
  return Math.max(margin + halfFP, Math.min(1 - margin - halfFP, bestX));
}

// Find X position near existing hardscape (for epiphytes like moss, anubias)
function findNearHardscape(existingDecs, zones, footprint) {
  // Collect hardscape positions
  const hardscapeXs = [];
  existingDecs.forEach(d => {
    const dec = DECORATIONS.find(dd => dd.id === d.id);
    if (!dec || dec.isPlant) return;
    (d.positions || []).forEach(pos => hardscapeXs.push(pos.x));
  });

  if (hardscapeXs.length === 0) return findBestX(zones, footprint);

  // Try to place near a random hardscape piece with slight offset
  const target = hardscapeXs[Math.floor(Math.random() * hardscapeXs.length)];
  const offset = (Math.random() - 0.5) * 0.08; // slight randomness
  return findBestX(zones, footprint, target + offset);
}

// ============================================================================
// MAIN PLACEMENT FUNCTION
// ============================================================================
export function smartPosition(id, existingDecs) {
  const dec = DECORATIONS.find(d => d.id === id);
  if (!dec) return { x: 0.5, y: 0.85 };

  // --- Floating plants: spread along surface ---
  if (FLOATING_TYPES.includes(dec.drawType)) {
    const floaterXs = [];
    existingDecs.forEach(d => {
      const dd = DECORATIONS.find(x => x.id === d.id);
      if (dd && FLOATING_TYPES.includes(dd.drawType)) {
        (d.positions || []).forEach(p => floaterXs.push(p.x));
      }
    });
    // Spread evenly across surface
    let x;
    if (floaterXs.length === 0) {
      x = 0.2 + Math.random() * 0.6;
    } else {
      const sorted = [0.05, ...floaterXs.sort((a, b) => a - b), 0.95];
      let maxGap = 0;
      x = 0.5;
      for (let i = 0; i < sorted.length - 1; i++) {
        const gap = sorted[i + 1] - sorted[i];
        if (gap > maxGap) { maxGap = gap; x = (sorted[i] + sorted[i + 1]) / 2; }
      }
    }
    return { x, y: 0.02 + Math.random() * 0.03 };
  }

  // --- Carpet plants: spread across foreground ---
  if (CARPET_TYPES.includes(dec.drawType)) {
    const carpetXs = [];
    existingDecs.forEach(d => {
      const dd = DECORATIONS.find(x => x.id === d.id);
      if (dd && CARPET_TYPES.includes(dd.drawType)) {
        (d.positions || []).forEach(p => carpetXs.push(p.x));
      }
    });
    let x;
    if (carpetXs.length === 0) {
      x = 0.35 + Math.random() * 0.3;
    } else {
      const sorted = [0.08, ...carpetXs.sort((a, b) => a - b), 0.92];
      let maxGap = 0;
      x = 0.5;
      for (let i = 0; i < sorted.length - 1; i++) {
        const gap = sorted[i + 1] - sorted[i];
        if (gap > maxGap) { maxGap = gap; x = (sorted[i] + sorted[i + 1]) / 2; }
      }
    }
    return { x, y: 0.93 + Math.random() * 0.02 };
  }

  const zones = getOccupiedZones(existingDecs);
  const fp = getFootprint(dec);

  // --- Epiphyte plants: place near hardscape ---
  if (dec.isPlant && EPIPHYTE_TYPES.includes(dec.drawType)) {
    const x = findNearHardscape(existingDecs, zones, fp);
    return { x, y: 0.82 + Math.random() * 0.06 };
  }

  // --- Background plants: prefer edges/back ---
  if (dec.isPlant && BACKGROUND_TYPES.includes(dec.drawType)) {
    // Alternate between left and right thirds
    const bgCount = existingDecs.reduce((sum, d) => {
      const dd = DECORATIONS.find(x => x.id === d.id);
      return sum + (dd && dd.isPlant && BACKGROUND_TYPES.includes(dd.drawType) ? (d.count || 1) : 0);
    }, 0);
    const preferSide = bgCount % 2 === 0 ? 0.15 + Math.random() * 0.15 : 0.7 + Math.random() * 0.15;
    const x = findBestX(zones, fp, preferSide);
    return { x, y: 0.83 + Math.random() * 0.04 };
  }

  // --- Foreground plants: prefer center-front ---
  if (dec.isPlant && FOREGROUND_TYPES.includes(dec.drawType)) {
    const x = findBestX(zones, fp, 0.4 + Math.random() * 0.2);
    return { x, y: 0.88 + Math.random() * 0.04 };
  }

  // --- Generic plants ---
  if (dec.isPlant) {
    const x = findBestX(zones, fp);
    return { x, y: 0.83 + Math.random() * 0.05 };
  }

  // --- Hardscape: collision-aware gap finding ---
  // Large items get more central placement, small items fill edges
  let preferredX = null;
  if (dec.size === 3) preferredX = 0.35 + Math.random() * 0.3; // centerpiece
  else if (dec.size === 1) preferredX = Math.random() > 0.5 ? 0.15 + Math.random() * 0.15 : 0.7 + Math.random() * 0.15;

  const x = findBestX(zones, fp, preferredX);
  return { x, y: 0.84 + Math.random() * 0.04 };
}

// ============================================================================
// PRESET LAYOUT ENGINE
// Places all decorations from a preset at once with intelligent layout
// ============================================================================
export function layoutPreset(preset) {
  const decorations = [];
  const placed = []; // running list for collision checking

  // Phase 1: Place hardscape first (they're the anchors)
  const hardscapeIds = preset.decor || [];
  // Sort: largest items first for best placement
  const sortedHardscape = [...hardscapeIds].sort((a, b) => {
    const da = DECORATIONS.find(d => d.id === a);
    const db = DECORATIONS.find(d => d.id === b);
    return ((db?.scale || 1) * (db?.size || 1)) - ((da?.scale || 1) * (da?.size || 1));
  });

  sortedHardscape.forEach(id => {
    const dec = DECORATIONS.find(d => d.id === id);
    if (!dec) return;
    const pos = smartPosition(id, placed);
    const entry = { id, count: 1, positions: [pos], userScale: 1 };
    decorations.push(entry);
    placed.push(entry);
  });

  // Phase 2: Place plants (they fill around the hardscape)
  const plantIds = preset.plants || [];
  plantIds.forEach(id => {
    const existing = decorations.find(d => d.id === id);
    if (existing) {
      // Add another instance
      const pos = smartPosition(id, placed);
      existing.count++;
      existing.positions.push(pos);
      // Update placed list
      const placedEntry = placed.find(p => p.id === id);
      if (placedEntry) { placedEntry.count++; placedEntry.positions.push(pos); }
    } else {
      const pos = smartPosition(id, placed);
      const entry = { id, count: 1, positions: [pos], userScale: 1 };
      decorations.push(entry);
      placed.push(entry);
    }
  });

  return decorations;
}
