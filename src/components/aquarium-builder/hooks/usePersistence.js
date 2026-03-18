import { useEffect, useCallback, useRef } from 'react';

// ============================================================================
// PERSISTENCE & SHARING
// - Auto-saves to localStorage on every state change (debounced)
// - Named save slots (up to 10 builds)
// - URL sharing via compressed base64 state encoding
// ============================================================================

const STORAGE_KEY = 'aquarium_builder_state';
const SAVES_KEY = 'aquarium_builder_saves';
const SAVE_DELAY = 800; // ms debounce

// ---- Default state (used for reset) ----
export const DEFAULT_STATE = {
  tankSize: "medium", waterType: "fresh", substrate: "gravel", light: "basic", filter: "hob", heater: "100w", decorations: [], fish: [],
  customTank: { width: 80, height: 40, depth: 35 },
  customHeater: { watts: 100 },
  customLight: { r: 255, g: 240, b: 200, strength: 0.2, intensity: 2 },
  substrateDepth: 12,
  cabinet: { style: "none", color: "#3A2A1A", material: "wood" },
  background: { id: "none", brightness: 0.5 },
};

// ---- Load state from localStorage ----
export function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Merge with defaults so new fields don't break old saves
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return null;
  }
}

// ---- Load from URL if share param exists ----
export function loadFromURL() {
  try {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('build');
    if (!shared) return null;
    const json = atob(shared);
    const parsed = JSON.parse(json);
    // Clean the URL after loading (don't keep the long param)
    window.history.replaceState({}, '', window.location.pathname);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return null;
  }
}

// ---- Generate share URL ----
export function generateShareURL(state) {
  // Strip out stuff that doesn't need sharing (positions are random anyway)
  const slim = {
    tankSize: state.tankSize,
    waterType: state.waterType,
    substrate: state.substrate,
    light: state.light,
    filter: state.filter,
    heater: state.heater,
    substrateDepth: state.substrateDepth,
    cabinet: state.cabinet,
    background: state.background,
    // Decorations: keep id, count, userScale (skip positions — they auto-generate)
    decorations: state.decorations.map(d => ({ id: d.id, count: d.count, userScale: d.userScale })),
    fish: state.fish,
    // Only include custom values if they're in use
    ...(state.tankSize === "custom" ? { customTank: state.customTank } : {}),
    ...(state.heater === "custom" ? { customHeater: state.customHeater } : {}),
    ...(state.light === "custom" ? { customLight: state.customLight } : {}),
  };
  const json = JSON.stringify(slim);
  const encoded = btoa(json);
  return `${window.location.origin}${window.location.pathname}?build=${encoded}`;
}

// ---- Named save slots ----
export function getSavedBuilds() {
  try {
    const raw = localStorage.getItem(SAVES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBuild(name, state) {
  const saves = getSavedBuilds();
  const entry = {
    name,
    date: new Date().toISOString(),
    state: { ...state },
  };
  // Replace if same name exists, otherwise prepend
  const idx = saves.findIndex(s => s.name === name);
  if (idx >= 0) saves[idx] = entry;
  else saves.unshift(entry);
  // Max 10 saves
  const trimmed = saves.slice(0, 10);
  localStorage.setItem(SAVES_KEY, JSON.stringify(trimmed));
  return trimmed;
}

export function deleteBuild(name) {
  const saves = getSavedBuilds().filter(s => s.name !== name);
  localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
  return saves;
}

// ---- Auto-save hook ----
export function useAutoSave(state) {
  const timerRef = useRef(null);

  useEffect(() => {
    // Debounced save
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch { /* storage full, ignore */ }
    }, SAVE_DELAY);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state]);
}
