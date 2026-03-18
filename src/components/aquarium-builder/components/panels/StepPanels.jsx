import { useState } from 'react';
import {
  PRESETS,
  BACKGROUNDS,
  TANK_SIZES,
  SUBSTRATES,
  LIGHTS,
  FILTERS,
  HEATERS,
  HARDSCAPE,
  PLANTS,
  FISH_DB,
} from '../../data/index.js';
import { B, L, getSizeLabel, SIZE_OPTIONS } from '../styles.js';
import TempRangeChart from './TempRangeChart.jsx';
import PlantCareIndicator from './PlantCareIndicator.jsx';

// ============================================================================
// FISH SILHOUETTE — inline SVG showing body shape filled with species colors
// ============================================================================
function FishSilhouette({ fish, size = 32 }) {
  const w = size;
  const h = size * 0.65;
  const cx = w * 0.48, cy = h * 0.5;
  const c = fish.color, ac = fish.accentColor;

  // Body path varies by shape
  let bodyPath, tailPath, finPath;
  const s = h * 0.38; // body radius reference

  if (fish.bodyShape === "slim") {
    bodyPath = `M${cx+s*1.3},${cy} C${cx+s*1.2},${cy-s*0.65} ${cx+s*0.3},${cy-s*0.9} ${cx-s*0.2},${cy-s*0.75} C${cx-s*0.9},${cy-s*0.5} ${cx-s*1.2},${cy-s*0.1} ${cx-s*1.2},${cy} C${cx-s*1.2},${cy+s*0.1} ${cx-s*0.9},${cy+s*0.5} ${cx-s*0.2},${cy+s*0.75} C${cx+s*0.3},${cy+s*0.9} ${cx+s*1.2},${cy+s*0.65} ${cx+s*1.3},${cy} Z`;
    tailPath = `M${cx-s*1.1},${cy} L${cx-s*1.7},${cy-s*0.7} L${cx-s*1.7},${cy+s*0.7} Z`;
    finPath = `M${cx-s*0.2},${cy-s*0.7} Q${cx+s*0.1},${cy-s*1.2} ${cx+s*0.5},${cy-s*0.7}`;
  } else if (fish.bodyShape === "tall" || fish.bodyShape === "angel") {
    bodyPath = `M${cx},${cy-s*1.4} C${cx+s*0.7},${cy-s*1.2} ${cx+s*0.8},${cy+s*1.2} ${cx},${cy+s*1.4} C${cx-s*0.7},${cy+s*1.2} ${cx-s*0.8},${cy-s*1.2} ${cx},${cy-s*1.4} Z`;
    tailPath = `M${cx-s*0.7},${cy} L${cx-s*1.3},${cy-s*0.5} L${cx-s*1.3},${cy+s*0.5} Z`;
    finPath = `M${cx},${cy-s*1.4} Q${cx+s*0.2},${cy-s*2} ${cx+s*0.3},${cy-s*1.4}`;
  } else if (fish.bodyShape === "disc") {
    bodyPath = `M${cx},${cy} m${-s*1.1},0 a${s*1.1},${s*1.1} 0 1,0 ${s*2.2},0 a${s*1.1},${s*1.1} 0 1,0 ${-s*2.2},0 Z`;
    tailPath = `M${cx-s*1},${cy} L${cx-s*1.6},${cy-s*0.5} L${cx-s*1.6},${cy+s*0.5} Z`;
    finPath = null;
  } else if (fish.bodyShape === "flat") {
    bodyPath = `M${cx},${cy} m${-s*1.4},0 a${s*1.4},${s*0.5} 0 1,0 ${s*2.8},0 a${s*1.4},${s*0.5} 0 1,0 ${-s*2.8},0 Z`;
    tailPath = `M${cx-s*1.3},${cy} L${cx-s*1.7},${cy-s*0.35} L${cx-s*1.7},${cy+s*0.35} Z`;
    finPath = null;
  } else if (fish.bodyShape === "round") {
    bodyPath = `M${cx},${cy} m${-s*1.2},0 a${s*1.2},${s*0.9} 0 1,0 ${s*2.4},0 a${s*1.2},${s*0.9} 0 1,0 ${-s*2.4},0 Z`;
    tailPath = `M${cx-s*1.1},${cy} L${cx-s*1.6},${cy-s*0.55} L${cx-s*1.6},${cy+s*0.55} Z`;
    finPath = `M${cx-s*0.3},${cy-s*0.8} Q${cx},${cy-s*1.2} ${cx+s*0.4},${cy-s*0.8}`;
  } else if (fish.bodyShape === "shrimp") {
    bodyPath = `M${cx+s*1},${cy} Q${cx+s*0.5},${cy-s*0.9} ${cx-s*0.4},${cy-s*0.6} Q${cx-s*1.2},${cy-s*0.2} ${cx-s*1},${cy+s*0.4} Q${cx-s*0.4},${cy+s*0.9} ${cx+s*0.5},${cy+s*0.3} Z`;
    tailPath = null;
    finPath = null;
  } else if (fish.bodyShape === "snail") {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flexShrink: 0 }}>
        <circle cx={cx-1} cy={cy-1} r={s*0.9} fill={c} />
        <circle cx={cx-2} cy={cy-2} r={s*0.55} fill={ac} opacity="0.7" />
        <circle cx={cx-3} cy={cy-3} r={s*0.3} fill={c} opacity="0.8" />
        <ellipse cx={cx+2} cy={cy+s*0.5} rx={s*1} ry={s*0.3} fill={c} opacity="0.5" />
      </svg>
    );
  } else if (fish.bodyShape === "lobster") {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flexShrink: 0 }}>
        <defs><linearGradient id={`lb${fish.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={ac} /><stop offset="100%" stopColor={c} /></linearGradient></defs>
        <ellipse cx={cx} cy={cy} rx={s*0.8} ry={s*0.5} fill={`url(#lb${fish.id})`} />
        <ellipse cx={cx-s*0.9} cy={cy} rx={s*0.5} ry={s*0.35} fill={c} opacity="0.8" />
        <line x1={cx+s*0.7} y1={cy-s*0.3} x2={cx+s*1.4} y2={cy-s*0.6} stroke={ac} strokeWidth="1.5" strokeLinecap="round" />
        <line x1={cx+s*0.7} y1={cy+s*0.1} x2={cx+s*1.3} y2={cy+s*0.3} stroke={ac} strokeWidth="1.2" strokeLinecap="round" />
        <circle cx={cx+s*1.4} cy={cy-s*0.6} r={s*0.2} fill={ac} />
        <circle cx={cx+s*1.3} cy={cy+s*0.3} r={s*0.15} fill={c} />
      </svg>
    );
  } else if (fish.bodyShape === "axolotl") {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flexShrink: 0 }}>
        <defs><radialGradient id={`ax${fish.id}`}><stop offset="0%" stopColor={ac} /><stop offset="100%" stopColor={c} /></radialGradient></defs>
        <ellipse cx={cx} cy={cy} rx={s*1.1} ry={s*0.6} fill={`url(#ax${fish.id})`} />
        <ellipse cx={cx+s*0.9} cy={cy} rx={s*0.6} ry={s*0.55} fill={c} />
        {[-1,1].map(side => [0,1,2].map(g => <line key={`${side}${g}`} x1={cx+s*1.1} y1={cy+side*s*0.3} x2={cx+s*1.1+s*(0.3+g*0.12)} y2={cy+side*s*(0.6+g*0.15)} stroke={ac} strokeWidth="1" strokeLinecap="round" opacity="0.6" />))}
        <circle cx={cx+s*1.1} cy={cy-s*0.15} r={s*0.08} fill="#111" />
        <circle cx={cx+s*1.1} cy={cy+s*0.15} r={s*0.08} fill="#111" />
      </svg>
    );
  } else if (fish.bodyShape === "puffer") {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flexShrink: 0 }}>
        <defs><radialGradient id={`pf${fish.id}`} cx="0.55" cy="0.4"><stop offset="0%" stopColor={ac} /><stop offset="100%" stopColor={c} /></radialGradient></defs>
        <circle cx={cx} cy={cy} r={s*0.9} fill={`url(#pf${fish.id})`} />
        <ellipse cx={cx} cy={cy+s*0.3} rx={s*0.6} ry={s*0.35} fill="rgba(255,255,240,0.15)" />
        <polygon points={`${cx-s*0.8},${cy} ${cx-s*1.2},${cy-s*0.3} ${cx-s*1.2},${cy+s*0.3}`} fill={ac} opacity="0.5" />
        <circle cx={cx+s*0.5} cy={cy-s*0.25} r={s*0.2} fill="#FFF" />
        <circle cx={cx+s*0.55} cy={cy-s*0.25} r={s*0.12} fill="#111" />
      </svg>
    );
  } else if (fish.bodyShape === "frog") {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flexShrink: 0 }}>
        <ellipse cx={cx} cy={cy} rx={s*0.85} ry={s*0.6} fill={c} />
        <ellipse cx={cx+s*0.6} cy={cy-s*0.1} rx={s*0.45} ry={s*0.4} fill={c} />
        <circle cx={cx+s*0.8} cy={cy-s*0.35} r={s*0.15} fill="#DDD" />
        <circle cx={cx+s*0.85} cy={cy-s*0.35} r={s*0.08} fill="#111" />
        <circle cx={cx+s*0.8} cy={cy+s*0.15} r={s*0.15} fill="#DDD" />
        <circle cx={cx+s*0.85} cy={cy+s*0.15} r={s*0.08} fill="#111" />
        <line x1={cx-s*0.6} y1={cy+s*0.3} x2={cx-s*1.3} y2={cy+s*0.3} stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  } else {
    // Default oval
    bodyPath = `M${cx},${cy} m${-s*1.2},0 a${s*1.2},${s*0.75} 0 1,0 ${s*2.4},0 a${s*1.2},${s*0.75} 0 1,0 ${-s*2.4},0 Z`;
    tailPath = `M${cx-s*1.1},${cy} L${cx-s*1.6},${cy-s*0.55} L${cx-s*1.6},${cy+s*0.55} Z`;
    finPath = `M${cx-s*0.3},${cy-s*0.7} Q${cx},${cy-s*1.1} ${cx+s*0.4},${cy-s*0.7}`;
  }

  const gradId = `fg${fish.id}`;
  const eyeX = fish.bodyShape === "tall" ? cx + s * 0.3 : cx + s * 0.65;
  const eyeY = fish.bodyShape === "tall" ? cy - s * 0.3 : cy - s * 0.15;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="1" />
          <stop offset="100%" stopColor={ac} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {tailPath && <path d={tailPath} fill={ac} opacity="0.6" />}
      <path d={bodyPath} fill={`url(#${gradId})`} />
      {finPath && <path d={finPath} fill="none" stroke={ac} strokeWidth="0.8" opacity="0.5" />}
      {/* Eye */}
      <circle cx={eyeX} cy={eyeY} r={s*0.15} fill="#F8F8F0" />
      <circle cx={eyeX+s*0.04} cy={eyeY} r={s*0.09} fill="#111" />
      <circle cx={eyeX+s*0.06} cy={eyeY-s*0.03} r={s*0.04} fill="rgba(255,255,255,0.7)" />
      {/* Shine */}
      <ellipse cx={cx+s*0.15} cy={cy-s*0.25} rx={s*0.5} ry={s*0.12} fill="white" opacity="0.1" transform={`rotate(-10 ${cx+s*0.15} ${cy-s*0.25})`} />
    </svg>
  );
}

// ============================================================================
// PLANT ICON — small SVG leaf/stem colored by plant type
// ============================================================================
function PlantSvgIcon({ plant, size = 20 }) {
  const w = size, h = size;
  const cx = w * 0.5, cy = h * 0.5;
  const dt = plant.drawType;

  // Floating plants
  if (dt === "frogbit" || dt === "salvinia") {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flexShrink: 0 }}>
        <ellipse cx={cx-2} cy={cy-1} rx={4} ry={3} fill="#3A9C4A" opacity="0.8" />
        <ellipse cx={cx+2} cy={cy} rx={4} ry={3} fill="#2D8A3A" opacity="0.7" />
        <line x1={cx} y1={cy+2} x2={cx} y2={cy+7} stroke="#4A8050" strokeWidth="0.6" opacity="0.4" />
      </svg>
    );
  }
  // Carpet
  if (dt === "carpet") {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flexShrink: 0 }}>
        {[-4,-2,0,2,4].map((ox,i) => (
          <line key={i} x1={cx+ox} y1={h-2} x2={cx+ox+Math.sin(i)*1} y2={h-7-i%2*2} stroke={`rgb(40,${120+i*10},50)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        ))}
      </svg>
    );
  }
  // Moss
  if (dt === "moss") {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flexShrink: 0 }}>
        {[[-3,-2],[0,-3],[3,-1],[-2,1],[2,2]].map(([ox,oy],i) => (
          <circle key={i} cx={cx+ox} cy={cy+oy} r={2+i%2} fill={`rgb(${35+i*5},${105+i*10},${35+i*4})`} opacity="0.6" />
        ))}
      </svg>
    );
  }
  // Stem plants (val, rotala, hornwort, elodea, ludwigia, wisteria)
  const isStem = ["val","rotala","hornwort","elodea","ludwigia","wisteria","dwarfsag","staurogyne"].includes(dt);
  if (isStem) {
    const isRed = dt === "rotala" || dt === "ludwigia";
    const stemColor = isRed ? "#8B3030" : "#2A7030";
    const leafColor = isRed ? "#CC5040" : "#3A9545";
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flexShrink: 0 }}>
        <line x1={cx} y1={h-2} x2={cx+1} y2={3} stroke={stemColor} strokeWidth="1.5" strokeLinecap="round" />
        {[0.25,0.45,0.65,0.85].map((t,i) => (
          <ellipse key={i} cx={cx+(i%2===0?3:-3)} cy={h-2-(h-5)*t} rx={3} ry={1.5} fill={leafColor} opacity={0.6+i*0.05} transform={`rotate(${i%2===0?15:-15} ${cx+(i%2===0?3:-3)} ${h-2-(h-5)*t})`} />
        ))}
      </svg>
    );
  }
  // Rosette plants (anubias, sword, crypto, bucep, javafern, pogostemon, lotus)
  const leafColor = dt === "lotus" ? "#993344" : "#2D8A3A";
  const darkLeaf = dt === "lotus" ? "#772233" : "#1F6528";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flexShrink: 0 }}>
      {[-0.5,0,0.5].map((angle,i) => (
        <g key={i} transform={`rotate(${angle*25} ${cx} ${h-2})`}>
          <line x1={cx} y1={h-2} x2={cx} y2={h-2-(h*0.4)} stroke={darkLeaf} strokeWidth="0.8" />
          <ellipse cx={cx} cy={4+i*1.5} rx={3.5-i*0.3} ry={5-i*0.5} fill={leafColor} opacity={0.7-i*0.05} />
          <line x1={cx} y1={2+i} x2={cx} y2={8+i} stroke={darkLeaf} strokeWidth="0.3" opacity="0.4" />
        </g>
      ))}
    </svg>
  );
}

// ============================================================================
// SEARCH INPUT — reusable across fish/plant/decor panels
// ============================================================================
function SearchInput({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", marginBottom: 10 }}>
      <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, opacity: 0.3, pointerEvents: "none" }}>🔍</span>
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "10px 12px 10px 32px", borderRadius: 10, fontSize: 12,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          color: "#D0D8E4", fontFamily: "inherit", outline: "none",
          WebkitAppearance: "none",
        }}
      />
      {value && (
        <button onClick={() => onChange('')} style={{
          position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
          width: 20, height: 20, borderRadius: 10, border: "none",
          background: "rgba(255,255,255,0.08)", color: "#8899AA",
          cursor: "pointer", fontSize: 10, fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>✕</button>
      )}
    </div>
  );
}

// ============================================================================
// TAG FILTER — toggle-able filter chips
// ============================================================================
function TagFilters({ tags, active, onToggle }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
      {tags.map(t => {
        const isActive = active.includes(t.id);
        return (
          <button key={t.id} onClick={() => onToggle(t.id)} style={{
            padding: "5px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600,
            fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s",
            background: isActive ? `rgba(${t.color || "60,140,255"},0.15)` : "rgba(255,255,255,0.03)",
            border: isActive ? `1px solid rgba(${t.color || "60,140,255"},0.35)` : "1px solid rgba(255,255,255,0.06)",
            color: isActive ? (t.activeColor || "#7CB8FF") : "#667788",
            WebkitTapHighlightColor: "transparent",
          }}>{t.icon} {t.label}</button>
        );
      })}
    </div>
  );
}

// Fish filter tag definitions
const FISH_TAGS = [
  { id: "peaceful", label: "Peaceful", icon: "✓", color: "80,250,123", activeColor: "#50FA7B" },
  { id: "schooling", label: "Schooling", icon: "🐟", color: "60,140,255", activeColor: "#7CB8FF" },
  { id: "bottom", label: "Bottom", icon: "⬇", color: "255,180,80", activeColor: "#FFB86C" },
  { id: "mid", label: "Mid", icon: "↔", color: "200,180,255", activeColor: "#C0B4FF" },
  { id: "top", label: "Top", icon: "⬆", color: "100,220,255", activeColor: "#64DCFF" },
  { id: "tiny", label: "Tiny", icon: "·", color: "255,255,255", activeColor: "#CCC" },
  { id: "shrimp", label: "Shrimp/Snails", icon: "🦐", color: "255,100,100", activeColor: "#FF8888" },
];

// Background category grouping
const BG_CATEGORIES = [
  { label: "Solid", ids: ["none","black","deep_blue","dark_green","blue_poster","white_frost","forest_green"] },
  { label: "Tropical", ids: ["trop_green","trop_green_light","trop_blue","trop_blue_light","trop_teal"] },
  { label: "Photo", ids: ["tropical_reef","amazon_river","rocky_lake","coral_lagoon"] },
  { label: "Mood", ids: ["misty_stream","sunset_pond","moonlit"] },
  { label: "Glow", ids: ["center_blue","center_green","center_teal","center_warm","center_purple"] },
];

// ============================================================================
// STEP PANELS
// All 8 configuration panels: Style, Tank, Water, Substrate, Equipment,
// Decor, Plants, Fish. Rendered based on current step index.
// ============================================================================
export default function StepPanels({
  step, state, setState, openGroups, setOpenGroups,
  addFish, removeFish, addPlant, removePlant, toggleDec, resizeDecor,
  applyPreset, setStep, setLastAdded, light, availFish,
}) {
  const [fishSearch, setFishSearch] = useState('');
  const [fishFilters, setFishFilters] = useState([]);
  const [plantSearch, setPlantSearch] = useState('');
  const [decorSearch, setDecorSearch] = useState('');

  const toggleFilter = (id) => {
    setFishFilters(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  // Filter fish based on search + tags
  const getFilteredFish = () => {
    let fish = availFish;
    if (fishSearch) {
      const q = fishSearch.toLowerCase();
      fish = fish.filter(f => f.name.toLowerCase().includes(q) || f.group?.toLowerCase().includes(q) || f.id.includes(q));
    }
    if (fishFilters.length > 0) {
      fish = fish.filter(f => {
        return fishFilters.every(tag => {
          if (tag === "peaceful") return f.peaceful;
          if (tag === "schooling") return f.schooling;
          if (tag === "bottom") return f.level === "bottom";
          if (tag === "mid") return f.level === "mid";
          if (tag === "top") return f.level === "top";
          if (tag === "tiny") return f.size === "tiny";
          if (tag === "shrimp") return f.bodyShape === "shrimp" || f.bodyShape === "snail" || f.bodyShape === "lobster";
          return true;
        });
      });
    }
    return fish;
  };
  return (
      <div style={{ padding: "10px 20px 120px" }}>
        {step === 0 && (<div>
          <div style={L}>Choose a Style</div>
          <div style={{ fontSize: 11, opacity: 0.35, marginBottom: 12, lineHeight: 1.5 }}>Pick a preset to auto-configure your tank, or skip to build from scratch.</div>
          {PRESETS.map(cat => (
            <div key={cat.cat} style={{ marginBottom: 4 }}>
              <button onClick={() => setOpenGroups(p => ({ ...p, [`preset_${cat.cat}`]: !p[`preset_${cat.cat}`] }))}
                style={{
                  width: "100%", padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: openGroups[`preset_${cat.cat}`] ? "rgba(120,100,255,0.08)" : "rgba(255,255,255,0.02)",
                  border: openGroups[`preset_${cat.cat}`] ? "1px solid rgba(120,100,255,0.2)" : "1px solid rgba(255,255,255,0.04)",
                  borderRadius: openGroups[`preset_${cat.cat}`] ? "8px 8px 0 0" : 8,
                  cursor: "pointer", fontFamily: "inherit", color: openGroups[`preset_${cat.cat}`] ? "#AA99FF" : "#8899AA",
                  fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                }}>
                <span>{cat.cat}</span>
                <span style={{ fontSize: 14, transition: "transform 0.2s", transform: openGroups[`preset_${cat.cat}`] ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
              </button>
              {openGroups[`preset_${cat.cat}`] && (
                <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderTop: "none", borderRadius: "0 0 8px 8px", padding: "4px" }}>
                  {cat.items.map(p => (
                    <button key={p.id} onClick={() => applyPreset(p)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                        background: "transparent", border: "1px solid transparent", borderRadius: 8,
                        cursor: "pointer", fontFamily: "inherit", color: "#D0D8E4", textAlign: "left",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(120,100,255,0.06)"; e.currentTarget.style.borderColor = "rgba(120,100,255,0.15)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
                    >
                      <span style={{ fontSize: 22, width: 32, textAlign: "center", flexShrink: 0 }}>{p.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#C0B8FF" }}>{p.name}</div>
                        <div style={{ fontSize: 10, opacity: 0.4, marginTop: 1 }}>{p.desc}</div>
                        <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
                          {[
                            p.water === "salt" ? "🧂 Salt" : "💧 Fresh",
                            p.tank ? (TANK_SIZES.find(t => t.id === p.tank)?.name || p.tank) : null,
                            p.plants?.length ? `🌿${p.plants.length}` : null,
                            p.fish?.length ? `🐟${p.fish.length}` : null,
                          ].filter(Boolean).map((tag, i) => (
                            <span key={i} style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", opacity: 0.5 }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                      <span style={{ fontSize: 10, opacity: 0.2, flexShrink: 0 }}>Apply →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button onClick={() => setStep(1)} style={{ ...B(false), width: "100%", textAlign: "center", marginTop: 12, padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>🔧 Build from Scratch</div>
            <div style={{ fontSize: 10, opacity: 0.4, marginTop: 2 }}>Skip presets, configure everything manually</div>
          </button>
        </div>)}

        {step === 1 && (<div><div style={L}>Tank Size</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {TANK_SIZES.map(t => (<button key={t.id} onClick={() => setState(s => ({ ...s, tankSize: t.id }))} style={B(state.tankSize === t.id)}><div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div><div style={{ fontSize: 10, opacity: 0.45, marginTop: 2 }}>{t.liters}L · {t.width}×{t.height}×{t.depth}cm</div></button>))}
            <button onClick={() => setState(s => ({ ...s, tankSize: "custom" }))} style={{ ...B(state.tankSize === "custom"), gridColumn: "1 / -1" }}><div style={{ fontSize: 13, fontWeight: 600 }}>⚙️ Custom Size</div><div style={{ fontSize: 10, opacity: 0.45, marginTop: 2 }}>Set your own dimensions</div></button>
          </div>
          {state.tankSize === "custom" && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10, padding: "12px", background: "rgba(60,140,255,0.05)", border: "1px solid rgba(60,140,255,0.12)", borderRadius: 10 }}>
              {[
                { label: "Width", key: "width", min: 20, max: 200, unit: "cm" },
                { label: "Height", key: "height", min: 15, max: 80, unit: "cm" },
                { label: "Depth", key: "depth", min: 15, max: 80, unit: "cm" },
              ].map(s => (
                <div key={s.key}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                    <span style={{ opacity: 0.5 }}>{s.label}</span>
                    <span style={{ color: "#7CB8FF", fontWeight: 600 }}>{state.customTank[s.key]} {s.unit}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} value={state.customTank[s.key]}
                    onChange={e => setState(st => ({ ...st, customTank: { ...st.customTank, [s.key]: parseInt(e.target.value) } }))}
                    style={{ width: "100%", accentColor: "#3C88FF", height: 4 }} />
                </div>
              ))}
              <div style={{ fontSize: 11, opacity: 0.4, textAlign: "center", marginTop: 2 }}>
                Volume: <span style={{ color: "#7CB8FF", fontWeight: 600 }}>{Math.round(state.customTank.width * state.customTank.height * state.customTank.depth / 1000)}L</span>
                {" "}({state.customTank.width} × {state.customTank.height} × {state.customTank.depth} cm)
              </div>
            </div>
          )}

          {/* BACKGROUND */}
          <div style={{ marginTop: 20 }}>
            <div style={L}>Background</div>
            {BG_CATEGORIES.map(cat => (
              <div key={cat.label} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 9, opacity: 0.25, letterSpacing: 1, marginBottom: 4 }}>{cat.label.toUpperCase()}</div>
                <div style={{ display: "flex", gap: 4, overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", paddingBottom: 4 }}>
                  {cat.ids.map(bgId => {
                    const bg = BACKGROUNDS.find(b => b.id === bgId);
                    if (!bg) return null;
                    const active = state.background.id === bg.id;
                    const previewBg = bg.colors
                      ? bg.gradient === "center"
                        ? `radial-gradient(circle at 50% 50%, ${bg.colors[0]}, ${bg.colors[1]})`
                        : `linear-gradient(180deg, ${bg.colors.join(", ")})`
                      : "none";
                    return (
                      <button key={bg.id} onClick={() => setState(st => ({ ...st, background: { ...st.background, id: bg.id } }))}
                        style={{
                          ...B(active), flex: "0 0 auto", width: 64, textAlign: "center", padding: "8px 4px", position: "relative", overflow: "hidden",
                        }}>
                        {bg.colors && (
                          <div style={{
                            position: "absolute", inset: 0, borderRadius: 9, opacity: active ? 0.5 : 0.25,
                            background: previewBg,
                          }} />
                        )}
                        <div style={{ position: "relative", fontSize: 14 }}>{bg.icon}</div>
                        <div style={{ position: "relative", fontSize: 7, marginTop: 2, opacity: 0.7, lineHeight: 1.2, whiteSpace: "nowrap" }}>{bg.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {state.background.id !== "none" && (
              <div style={{ padding: "8px 12px", background: "rgba(60,140,255,0.05)", border: "1px solid rgba(60,140,255,0.12)", borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span style={{ opacity: 0.5 }}>Brightness</span>
                  <span style={{ color: "#7CB8FF", fontWeight: 600 }}>{Math.round(state.background.brightness * 100)}%</span>
                </div>
                <input type="range" min={5} max={100} value={Math.round(state.background.brightness * 100)}
                  onChange={e => setState(s => ({ ...s, background: { ...s.background, brightness: parseInt(e.target.value) / 100 } }))}
                  style={{ width: "100%", accentColor: "#3C88FF" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, opacity: 0.25, marginTop: 3 }}>
                  <span>Dark</span>
                  <span>Bright</span>
                </div>
              </div>
            )}
          </div>

          {/* CABINET / STAND */}
          <div style={{ marginTop: 20 }}>
            <div style={L}>Cabinet / Stand</div>
            <div style={{ fontSize: 9, opacity: 0.25, letterSpacing: 1.5, marginBottom: 6 }}>STYLE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 12 }}>
              {[
                { id: "none", name: "No Cabinet", icon: "∅" },
                { id: "classic", name: "Classic", icon: "🪵" },
                { id: "modern", name: "Modern", icon: "◼️" },
                { id: "handleless", name: "Handleless", icon: "▬" },
                { id: "open", name: "Open Shelf", icon: "☰" },
                { id: "floating", name: "Wall Mount", icon: "⬒" },
              ].map(s => (
                <button key={s.id} onClick={() => setState(st => ({ ...st, cabinet: { ...st.cabinet, style: s.id } }))}
                  style={{ ...B(state.cabinet.style === s.id), textAlign: "center", padding: "8px 4px" }}>
                  <div style={{ fontSize: 16 }}>{s.icon}</div>
                  <div style={{ fontSize: 9, marginTop: 2, opacity: 0.7 }}>{s.name}</div>
                </button>
              ))}
            </div>
            {state.cabinet.style !== "none" && (<>
              <div style={{ fontSize: 9, opacity: 0.25, letterSpacing: 1.5, marginBottom: 6 }}>MATERIAL</div>
              <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                {[
                  { id: "wood", name: "Wood" },
                  { id: "matte", name: "Matte" },
                  { id: "gloss", name: "Gloss" },
                  { id: "metal", name: "Metal" },
                ].map(m => (
                  <button key={m.id} onClick={() => setState(st => ({ ...st, cabinet: { ...st.cabinet, material: m.id } }))}
                    style={{ ...B(state.cabinet.material === m.id), flex: 1, textAlign: "center", padding: "8px 6px", fontSize: 11 }}>
                    {m.name}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 9, opacity: 0.25, letterSpacing: 1.5, marginBottom: 6 }}>COLOR</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                {[
                  { color: "#3A2A1A", name: "Dark Walnut" },
                  { color: "#6B4E2F", name: "Oak" },
                  { color: "#8B6F4E", name: "Light Oak" },
                  { color: "#C4A87C", name: "Birch" },
                  { color: "#F0E4D0", name: "White Wash" },
                  { color: "#1A1A1A", name: "Black" },
                  { color: "#F5F0E8", name: "White" },
                  { color: "#4A4A4A", name: "Anthracite" },
                  { color: "#2C3E50", name: "Navy" },
                  { color: "#5D4037", name: "Espresso" },
                  { color: "#8D6E63", name: "Mocha" },
                  { color: "#B0BEC5", name: "Silver" },
                ].map(c => (
                  <button key={c.color} onClick={() => setState(st => ({ ...st, cabinet: { ...st.cabinet, color: c.color } }))}
                    title={c.name}
                    style={{
                      width: 30, height: 30, borderRadius: 7, padding: 0,
                      background: c.color,
                      border: state.cabinet.color === c.color ? "2px solid #7CB8FF" : "2px solid rgba(255,255,255,0.08)",
                      cursor: "pointer", transition: "all 0.15s",
                      boxShadow: state.cabinet.color === c.color ? "0 0 8px rgba(60,140,255,0.3)" : "none",
                    }} />
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, opacity: 0.3 }}>Custom:</span>
                <input type="color" value={state.cabinet.color}
                  onChange={e => setState(st => ({ ...st, cabinet: { ...st.cabinet, color: e.target.value } }))}
                  style={{ width: 28, height: 22, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, background: "transparent", cursor: "pointer" }} />
                <span style={{ fontSize: 9, opacity: 0.25, fontFamily: "monospace" }}>{state.cabinet.color}</span>
              </div>
            </>)}
          </div>
        </div>)}

        {step === 2 && (<div><div style={L}>Water Type</div><div style={{ display: "flex", gap: 8 }}>{[{ id: "fresh", n: "Freshwater", i: "💧", d: "Tropical · Planted · Community" }, { id: "salt", n: "Saltwater", i: "🧂", d: "Reef · Marine · Corals" }].map(w => (<button key={w.id} onClick={() => setState(s => ({ ...s, waterType: w.id, fish: [] }))} style={{ ...B(state.waterType === w.id), flex: 1, textAlign: "center", padding: 16 }}><div style={{ fontSize: 28 }}>{w.i}</div><div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>{w.n}</div><div style={{ fontSize: 10, opacity: 0.4, marginTop: 2 }}>{w.d}</div></button>))}</div></div>)}

        {step === 3 && (<div>
          <div style={L}>Substrate</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {SUBSTRATES.map(s => (
              <button key={s.id} onClick={() => setState(st => ({ ...st, substrate: s.id, ...(s.id === "bare" ? { substrateDepth: 1 } : st.substrateDepth < 5 ? { substrateDepth: 12 } : {}) }))} style={{ ...B(state.substrate === s.id), display: "flex", alignItems: "center", gap: 10, padding: "8px 12px" }}>
                {s.id !== "bare" ? (
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg,${s.accent},${s.color},${s.darkColor})`, flexShrink: 0, border: "1px solid rgba(255,255,255,0.06)" }} />
                ) : (
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.03)", flexShrink: 0, border: "1px dashed rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, opacity: 0.3 }}>∅</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{s.name}</div>
                  <div style={{ fontSize: 9, opacity: 0.4 }}>
                    {s.plantFriendly ? "🌱 Plant-friendly" : s.type === "alkaline" ? "⬆ Raises pH" : s.id === "bare" ? "No substrate" : "Neutral pH"}
                    {s.type === "active" ? " · Nutrients" : ""}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {state.substrate !== "bare" && (
            <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(60,140,255,0.05)", border: "1px solid rgba(60,140,255,0.12)", borderRadius: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                <span style={{ opacity: 0.5 }}>Substrate Depth</span>
                <span style={{ color: "#7CB8FF", fontWeight: 600 }}>
                  {state.substrateDepth < 8 ? "Thin" : state.substrateDepth < 15 ? "Medium" : state.substrateDepth < 22 ? "Thick" : "Very Thick"}
                  {" "}({state.substrateDepth}%)
                </span>
              </div>
              <input type="range" min={3} max={30} value={state.substrateDepth}
                onChange={e => setState(s => ({ ...s, substrateDepth: parseInt(e.target.value) }))}
                style={{ width: "100%", accentColor: "#3C88FF" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, opacity: 0.25, marginTop: 3 }}>
                <span>Thin layer</span>
                <span>Deep bed</span>
              </div>
              {state.substrateDepth >= 20 && (
                <div style={{ marginTop: 6, fontSize: 10, color: "#FFBB77", opacity: 0.7 }}>
                  ⚠ Deep substrate can trap gas pockets — poke it weekly
                </div>
              )}
              {state.substrateDepth < 8 && SUBSTRATES.find(s => s.id === state.substrate)?.plantFriendly && (
                <div style={{ marginTop: 6, fontSize: 10, color: "#FFBB77", opacity: 0.7 }}>
                  💡 Rooted plants need at least 8-10% depth for healthy roots
                </div>
              )}
            </div>
          )}
        </div>)}

        {step === 4 && (<div>
          {/* LIGHTING */}
          <div style={{ marginBottom: 16 }}>
            <div style={L}>Lighting</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {LIGHTS.map(item => (
                <button key={item.id} onClick={() => setState(s => ({ ...s, light: item.id }))} style={{ ...B(state.light === item.id), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{item.name}</span>
                  <span style={{ fontSize: 10, opacity: 0.4 }}>{item.price > 0 ? "€" + item.price : "Free"}{item.planted ? " · 🌱" : ""}</span>
                </button>
              ))}
              <button onClick={() => setState(s => ({ ...s, light: "custom" }))} style={{ ...B(state.light === "custom"), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>⚙️ Custom Light</span><span style={{ fontSize: 10, opacity: 0.4 }}>Set your own</span>
              </button>
            </div>
            {state.light === "custom" && (
              <div style={{ marginTop: 8, padding: "10px 12px", background: "rgba(60,140,255,0.05)", border: "1px solid rgba(60,140,255,0.12)", borderRadius: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                    <span style={{ opacity: 0.5 }}>Intensity</span>
                    <span style={{ color: "#7CB8FF", fontWeight: 600 }}>{["Off", "Low", "Medium", "High"][state.customLight.intensity]}</span>
                  </div>
                  <input type="range" min={0} max={3} value={state.customLight.intensity}
                    onChange={e => setState(s => ({ ...s, customLight: { ...s.customLight, intensity: parseInt(e.target.value) } }))}
                    style={{ width: "100%", accentColor: "#3C88FF" }} />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                    <span style={{ opacity: 0.5 }}>Brightness</span>
                    <span style={{ color: "#7CB8FF", fontWeight: 600 }}>{Math.round(state.customLight.strength * 100)}%</span>
                  </div>
                  <input type="range" min={5} max={80} value={Math.round(state.customLight.strength * 100)}
                    onChange={e => setState(s => ({ ...s, customLight: { ...s.customLight, strength: parseInt(e.target.value) / 100 } }))}
                    style={{ width: "100%", accentColor: "#3C88FF" }} />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[
                    { label: "R", key: "r", accent: "#FF6666" },
                    { label: "G", key: "g", accent: "#66FF66" },
                    { label: "B", key: "b", accent: "#6666FF" },
                  ].map(c => (
                    <div key={c.key} style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, opacity: 0.4, textAlign: "center", marginBottom: 2 }}>{c.label}: {state.customLight[c.key]}</div>
                      <input type="range" min={0} max={255} value={state.customLight[c.key]}
                        onChange={e => setState(s => ({ ...s, customLight: { ...s.customLight, [c.key]: parseInt(e.target.value) } }))}
                        style={{ width: "100%", accentColor: c.accent }} />
                    </div>
                  ))}
                </div>
                <div style={{ height: 20, borderRadius: 6, background: `rgb(${state.customLight.r},${state.customLight.g},${state.customLight.b})`, opacity: state.customLight.strength + 0.1, border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>
            )}
          </div>
          {/* FILTER */}
          <div style={{ marginBottom: 16 }}>
            <div style={L}>Filter</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {FILTERS.map(item => (
                <button key={item.id} onClick={() => setState(s => ({ ...s, filter: item.id }))} style={{ ...B(state.filter === item.id), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{item.name}</span>
                  <span style={{ fontSize: 10, opacity: 0.4 }}>{item.capacity > 0 ? item.capacity + "L" : "—"} · €{item.price}</span>
                </button>
              ))}
            </div>
          </div>
          {/* HEATER */}
          <div>
            <div style={L}>Heater</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {HEATERS.map(item => (
                <button key={item.id} onClick={() => setState(s => ({ ...s, heater: item.id }))} style={{ ...B(state.heater === item.id), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{item.name}</span>
                  <span style={{ fontSize: 10, opacity: 0.4 }}>{item.maxLiters ? "≤" + item.maxLiters + "L" : "—"} · €{item.price}</span>
                </button>
              ))}
              <button onClick={() => setState(s => ({ ...s, heater: "custom" }))} style={{ ...B(state.heater === "custom"), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>⚙️ Custom Heater</span><span style={{ fontSize: 10, opacity: 0.4 }}>Set wattage</span>
              </button>
            </div>
            {state.heater === "custom" && (
              <div style={{ marginTop: 8, padding: "10px 12px", background: "rgba(60,140,255,0.05)", border: "1px solid rgba(60,140,255,0.12)", borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span style={{ opacity: 0.5 }}>Wattage</span>
                  <span style={{ color: "#7CB8FF", fontWeight: 600 }}>{state.customHeater.watts}W</span>
                </div>
                <input type="range" min={10} max={500} step={5} value={state.customHeater.watts}
                  onChange={e => setState(s => ({ ...s, customHeater: { ...s.customHeater, watts: parseInt(e.target.value) } }))}
                  style={{ width: "100%", accentColor: "#FF8844" }} />
                <div style={{ fontSize: 10, opacity: 0.35, marginTop: 4, textAlign: "center" }}>
                  Suitable for ≤{Math.round(state.customHeater.watts * 1.5)}L tanks
                </div>
              </div>
            )}
          </div>
        </div>)}

        {step === 5 && (<div>
          <div style={L}>Hardscape & Accessories</div>

          {/* IN TANK */}
          {state.decorations.filter(d => HARDSCAPE.some(h => h.id === d.id)).length > 0 && (
            <div style={{ marginBottom: 14, padding: "8px 10px", background: "rgba(255,180,80,0.04)", border: "1px solid rgba(255,180,80,0.1)", borderRadius: 10 }}>
              <div style={{ fontSize: 9, opacity: 0.3, letterSpacing: 1.5, marginBottom: 6 }}>IN TANK</div>
              {state.decorations.filter(d => HARDSCAPE.some(h => h.id === d.id)).map(d => {
                const hd = HARDSCAPE.find(h => h.id === d.id);
                if (!hd) return null;
                const us = d.userScale || 1;
                const sizeLabel = us <= 0.55 ? "S" : us <= 0.85 ? "M" : us <= 1.15 ? "L" : "XL";
                return (
                  <div key={d.id} style={{ padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14 }}>{hd.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "#FFB86C" }}>{hd.name}</span>
                      </div>
                      <button onClick={() => toggleDec(d.id)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid rgba(255,80,80,0.2)", background: "rgba(255,80,80,0.06)", color: "#FF8888", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>×</button>
                    </div>
                    {/* S M L XL size picker */}
                    <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
                      <span style={{ fontSize: 9, opacity: 0.3, lineHeight: "22px", marginRight: 4 }}>size</span>
                      {[
                        { label: "S", val: 0.45 },
                        { label: "M", val: 0.75 },
                        { label: "L", val: 1.0 },
                        { label: "XL", val: 1.5 },
                      ].map(sz => (
                        <button key={sz.label} onClick={() => resizeDecor(d.id, sz.val - (d.userScale || 1))} style={{
                          flex: 1, padding: "3px 0", borderRadius: 5, fontSize: 10, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
                          background: sizeLabel === sz.label ? "rgba(255,180,80,0.15)" : "rgba(255,255,255,0.02)",
                          border: sizeLabel === sz.label ? "1px solid rgba(255,180,80,0.4)" : "1px solid rgba(255,255,255,0.06)",
                          color: sizeLabel === sz.label ? "#FFB86C" : "rgba(255,255,255,0.3)",
                        }}>{sz.label}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SEARCH + AVAILABLE DECOR */}
          <SearchInput value={decorSearch} onChange={setDecorSearch} placeholder="Search decorations..." />
          {(() => {
            const q = decorSearch.toLowerCase();
            const categories = [
              { label: "Natural", items: HARDSCAPE.filter(d => ["driftwood","driftwood2","rock","rock2","cave","coconut","slate","branch","bonsai","arch","stump","bamboo","terracotta","reef_rock"].includes(d.id)) },
              { label: "Classic Decor", items: HARDSCAPE.filter(d => ["treasure","ship","skull","castle","column","bridge","volcano"].includes(d.id)) },
              { label: "Funny / Meme", items: HARDSCAPE.filter(d => ["diver","nofish","toilet","duck","pineapple","ufo","gnome","pizza","tv","moai","lighthouse"].includes(d.id)) },
              { label: "Equipment", items: HARDSCAPE.filter(d => ["bubbler","thermometer"].includes(d.id)) },
            ];
            // When searching, show flat filtered results
            if (q) {
              const all = HARDSCAPE.filter(d => d.name.toLowerCase().includes(q) || d.id.includes(q));
              if (all.length === 0) return <div style={{ textAlign: "center", padding: 20, opacity: 0.3, fontSize: 12 }}>No decorations match</div>;
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ fontSize: 9, opacity: 0.3, letterSpacing: 1.5, marginBottom: 4 }}>{all.length} RESULTS</div>
                  {all.map(d => {
                    const inTank = state.decorations.some(dd => dd.id === d.id);
                    return (
                      <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, background: inTank ? "rgba(255,180,80,0.04)" : "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 16 }}>{d.icon}</span>
                          <span style={{ fontSize: 12, fontWeight: 500 }}>{d.name}</span>
                        </div>
                        {inTank ? (
                          <button onClick={() => toggleDec(d.id)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(255,80,80,0.2)", background: "rgba(255,80,80,0.06)", color: "#FF8888", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>×</button>
                        ) : (
                          <button onClick={() => { toggleDec(d.id); setLastAdded({ name: d.name, color: "#FFB86C", time: Date.now() }); }} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(255,180,80,0.25)", background: "rgba(255,180,80,0.08)", color: "#FFB86C", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>+</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }
            // Grouped accordion when browsing
            return categories.map(cat => (
            <div key={cat.label} style={{ marginBottom: 4 }}>
              <button onClick={() => setOpenGroups(p => ({ ...p, [`dec_${cat.label}`]: !p[`dec_${cat.label}`] }))}
                style={{
                  width: "100%", padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: openGroups[`dec_${cat.label}`] ? "rgba(255,180,80,0.08)" : "rgba(255,255,255,0.02)",
                  border: openGroups[`dec_${cat.label}`] ? "1px solid rgba(255,180,80,0.15)" : "1px solid rgba(255,255,255,0.04)",
                  borderRadius: openGroups[`dec_${cat.label}`] ? "8px 8px 0 0" : 8,
                  cursor: "pointer", fontFamily: "inherit", color: openGroups[`dec_${cat.label}`] ? "#FFB86C" : "#8899AA",
                  fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                }}>
                <span>{cat.label}</span>
                <span style={{ fontSize: 10, opacity: 0.4, display: "flex", alignItems: "center", gap: 4 }}>
                  <span>{cat.items.length}</span>
                  <span style={{ fontSize: 14, transition: "transform 0.2s", transform: openGroups[`dec_${cat.label}`] ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                </span>
              </button>
              {openGroups[`dec_${cat.label}`] && (
                <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderTop: "none", borderRadius: "0 0 8px 8px", padding: "4px" }}>
                  {cat.items.map(d => {
                    const inTank = state.decorations.some(dd => dd.id === d.id);
                    return (
                      <div key={d.id} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px",
                        borderRadius: 6, marginBottom: 1,
                        background: inTank ? "rgba(255,180,80,0.04)" : "transparent",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 16 }}>{d.icon}</span>
                          <span style={{ fontSize: 12, fontWeight: 500 }}>{d.name}</span>
                        </div>
                        {inTank ? (
                          <button onClick={() => toggleDec(d.id)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid rgba(255,80,80,0.2)", background: "rgba(255,80,80,0.06)", color: "#FF8888", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>×</button>
                        ) : (
                          <button onClick={() => { toggleDec(d.id); setLastAdded({ name: d.name, color: "#FFB86C", time: Date.now() }); }} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid rgba(255,180,80,0.25)", background: "rgba(255,180,80,0.08)", color: "#FFB86C", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>+</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ));
          })()}
        </div>)}

        {step === 6 && (<div>
          <div style={L}>Live Plants</div>

          {/* IN TANK */}
          {state.decorations.filter(d => PLANTS.some(p => p.id === d.id)).length > 0 && (
            <div style={{ marginBottom: 14, padding: "8px 10px", background: "rgba(80,250,123,0.04)", border: "1px solid rgba(80,250,123,0.1)", borderRadius: 10 }}>
              <div style={{ fontSize: 9, opacity: 0.3, letterSpacing: 1.5, marginBottom: 6 }}>IN TANK · {state.decorations.filter(d => PLANTS.some(p => p.id === d.id)).reduce((s, d) => s + (d.count || 1), 0)} total</div>
              {state.decorations.filter(d => PLANTS.some(p => p.id === d.id)).map(d => {
                const pd = PLANTS.find(p => p.id === d.id);
                if (!pd) return null;
                const us = d.userScale || 1;
                const sizeLabel = us <= 0.55 ? "S" : us <= 0.85 ? "M" : us <= 1.15 ? "L" : "XL";
                return (
                  <div key={d.id} style={{ padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14 }}>{pd.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "#70E090" }}>{pd.name}</span>
                        <span style={{ fontSize: 10, opacity: 0.35 }}>×{d.count}</span>
                      </div>
                      <div style={{ display: "flex", gap: 3 }}>
                        <button onClick={() => removePlant(d.id)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid rgba(255,80,80,0.2)", background: "rgba(255,80,80,0.06)", color: "#FF8888", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>−</button>
                        <button onClick={() => { addPlant(d.id); setLastAdded({ name: pd.name, color: "#50FA7B", time: Date.now() }); }} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid rgba(80,250,123,0.2)", background: "rgba(80,250,123,0.06)", color: "#50FA7B", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>+</button>
                      </div>
                    </div>
                    {/* S M L XL size */}
                    <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
                      <span style={{ fontSize: 9, opacity: 0.3, lineHeight: "22px", marginRight: 4 }}>size</span>
                      {[
                        { label: "S", val: 0.45 },
                        { label: "M", val: 0.75 },
                        { label: "L", val: 1.0 },
                        { label: "XL", val: 1.5 },
                      ].map(sz => (
                        <button key={sz.label} onClick={() => resizeDecor(d.id, sz.val - (d.userScale || 1))} style={{
                          flex: 1, padding: "3px 0", borderRadius: 5, fontSize: 10, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
                          background: sizeLabel === sz.label ? "rgba(80,250,123,0.15)" : "rgba(255,255,255,0.02)",
                          border: sizeLabel === sz.label ? "1px solid rgba(80,250,123,0.4)" : "1px solid rgba(255,255,255,0.06)",
                          color: sizeLabel === sz.label ? "#50FA7B" : "rgba(255,255,255,0.3)",
                        }}>{sz.label}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SEARCH + AVAILABLE PLANTS */}
          <SearchInput value={plantSearch} onChange={setPlantSearch} placeholder="Search plants..." />
          {(() => {
            const q = plantSearch.toLowerCase();
            const allPlants = q
              ? PLANTS.filter(p => p.name.toLowerCase().includes(q) || p.desc?.toLowerCase().includes(q) || p.id.includes(q))
              : PLANTS;

            if (q && allPlants.length === 0) {
              return <div style={{ textAlign: "center", padding: 20, opacity: 0.3, fontSize: 12 }}>No plants match</div>;
            }

            // Flat list when searching
            if (q) {
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ fontSize: 9, opacity: 0.3, letterSpacing: 1.5, marginBottom: 4 }}>{allPlants.length} RESULTS</div>
                  {allPlants.map(p => {
                    const inTank = state.decorations.find(dd => dd.id === p.id);
                    return (
                      <div key={p.id} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px",
                        borderRadius: 8, background: inTank ? "rgba(80,250,123,0.04)" : "rgba(255,255,255,0.015)",
                        border: "1px solid rgba(255,255,255,0.04)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                          <PlantSvgIcon plant={p} size={22} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 500 }}>{p.name}</div>
                            <div style={{ fontSize: 9, opacity: 0.3 }}>{p.desc}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0, marginLeft: 6 }}>
                          {inTank && (
                            <>
                              <button onClick={() => removePlant(p.id)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(255,80,80,0.2)", background: "rgba(255,80,80,0.06)", color: "#FF8888", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>−</button>
                              <span style={{ fontSize: 11, color: "#70E090", width: 20, textAlign: "center" }}>{inTank.count}</span>
                            </>
                          )}
                          <button onClick={() => { addPlant(p.id); setLastAdded({ name: p.name, color: "#50FA7B", time: Date.now() }); }} style={{
                            width: 28, height: 28, borderRadius: 6,
                            border: "1px solid rgba(80,250,123,0.25)", background: "rgba(80,250,123,0.08)",
                            color: "#50FA7B", cursor: "pointer", fontSize: 14, fontFamily: "inherit",
                          }}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            // Grouped accordion when browsing
            const groups = {};
            allPlants.forEach(p => {
              const g = p.needsSubstrate ? "Carpet & Foreground"
                : p.drawType === "frogbit" || p.drawType === "salvinia" ? "Floating"
                : p.needsLight ? "Mid & Background (high light)" : "Easy (low light)";
              if (!groups[g]) groups[g] = [];
              groups[g].push(p);
            });
            return Object.entries(groups).map(([groupName, plants]) => (
              <div key={groupName} style={{ marginBottom: 4 }}>
                <button onClick={() => setOpenGroups(p => ({ ...p, [`pl_${groupName}`]: !p[`pl_${groupName}`] }))}
                  style={{
                    width: "100%", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: openGroups[`pl_${groupName}`] ? "rgba(80,250,123,0.08)" : "rgba(255,255,255,0.02)",
                    border: openGroups[`pl_${groupName}`] ? "1px solid rgba(80,250,123,0.15)" : "1px solid rgba(255,255,255,0.04)",
                    borderRadius: openGroups[`pl_${groupName}`] ? "8px 8px 0 0" : 8,
                    cursor: "pointer", fontFamily: "inherit", color: openGroups[`pl_${groupName}`] ? "#70E090" : "#8899AA",
                    fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                    WebkitTapHighlightColor: "transparent",
                  }}>
                  <span>{groupName}</span>
                  <span style={{ fontSize: 10, opacity: 0.4, display: "flex", alignItems: "center", gap: 4 }}>
                    <span>{plants.length}</span>
                    <span style={{ fontSize: 14, transition: "transform 0.2s", transform: openGroups[`pl_${groupName}`] ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                  </span>
                </button>
                {openGroups[`pl_${groupName}`] && (
                  <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderTop: "none", borderRadius: "0 0 8px 8px", padding: "4px" }}>
                    {plants.map(p => {
                      const inTank = state.decorations.find(dd => dd.id === p.id);
                      return (
                        <div key={p.id} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px",
                          borderRadius: 6, marginBottom: 1,
                          background: inTank ? "rgba(80,250,123,0.04)" : "transparent",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                            <PlantSvgIcon plant={p} size={22} />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                              <div style={{ fontSize: 9, opacity: 0.3 }}>{p.desc}</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0, marginLeft: 6 }}>
                            {inTank && (
                              <>
                                <button onClick={() => removePlant(p.id)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(255,80,80,0.2)", background: "rgba(255,80,80,0.06)", color: "#FF8888", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>−</button>
                                <span style={{ fontSize: 11, color: "#70E090", width: 20, textAlign: "center" }}>{inTank.count}</span>
                              </>
                            )}
                            <button onClick={() => { addPlant(p.id); setLastAdded({ name: p.name, color: "#50FA7B", time: Date.now() }); }} style={{
                              width: 28, height: 28, borderRadius: 6,
                              border: "1px solid rgba(80,250,123,0.25)", background: "rgba(80,250,123,0.08)",
                              color: "#50FA7B", cursor: "pointer", fontSize: 14, fontFamily: "inherit",
                            }}>+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ));
          })()}
          {/* PLANT CARE ANALYSIS — CO2, fertilizers, difficulty */}
          <PlantCareIndicator state={state} light={light} />
        </div>)}

        {step === 7 && (<div>
          <div style={L}>{state.waterType === "salt" ? "Saltwater" : "Freshwater"} Fish & Inverts</div>

          {/* IN TANK - always visible sticky summary with silhouettes */}
          {state.fish.length > 0 && (
            <div style={{ marginBottom: 14, padding: "10px 10px 6px", background: "rgba(60,140,255,0.04)", border: "1px solid rgba(60,140,255,0.1)", borderRadius: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 9, opacity: 0.3, letterSpacing: 1.5 }}>IN TANK · {state.fish.reduce((s, f) => s + f.count, 0)} total</div>
                <div style={{ fontSize: 9, opacity: 0.25 }}>
                  ${state.fish.reduce((s, f) => { const fd = FISH_DB.find(d => d.id === f.id); return s + (fd?.price || 0) * f.count; }, 0)}
                </div>
              </div>
              {state.fish.map(f => { const fd = FISH_DB.find(d => d.id === f.id); if (!fd) return null;
                const schoolOk = !fd.schooling || f.count >= fd.minSchool;
                return (
                <div key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0 5px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
                    <FishSilhouette fish={fd} size={30} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "#7CB8FF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fd.name}</span>
                        <span style={{ fontSize: 10, opacity: 0.35 }}>×{f.count}</span>
                        {!schoolOk && (
                          <span style={{ fontSize: 8, padding: "1px 4px", borderRadius: 3, background: "rgba(255,180,80,0.1)", border: "1px solid rgba(255,180,80,0.2)", color: "#FFB86C" }}>
                            need {fd.minSchool - f.count}+
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 9, opacity: 0.25, marginTop: 1 }}>
                        {fd.size} · {fd.level} · bio {fd.bio * f.count}{fd.price ? ` · $${fd.price * f.count}` : ""}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 3, flexShrink: 0, marginLeft: 6 }}>
                    <button onClick={() => removeFish(f.id)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(255,80,80,0.2)", background: "rgba(255,80,80,0.06)", color: "#FF8888", cursor: "pointer", fontSize: 14, fontFamily: "inherit", lineHeight: "26px" }}>−</button>
                    <button onClick={() => { addFish(f.id); setLastAdded({ name: fd.name, color: fd.color, time: Date.now() }); }} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(80,250,123,0.2)", background: "rgba(80,250,123,0.06)", color: "#50FA7B", cursor: "pointer", fontSize: 14, fontFamily: "inherit", lineHeight: "26px" }}>+</button>
                  </div>
                </div>
              ); })}
            </div>
          )}

          {/* TEMPERATURE RANGE CHART */}
          {state.fish.length > 0 && <TempRangeChart fishList={state.fish} />}

          {/* SEARCH + FILTERS */}
          <SearchInput value={fishSearch} onChange={setFishSearch} placeholder="Search fish, shrimp, snails..." />
          <TagFilters tags={FISH_TAGS} active={fishFilters} onToggle={toggleFilter} />

          {/* FISH LIST — flat when searching/filtering, grouped when browsing */}
          {(() => {
            const filtered = getFilteredFish();
            const isFiltering = fishSearch || fishFilters.length > 0;

            if (filtered.length === 0) {
              return <div style={{ textAlign: "center", padding: 20, opacity: 0.3, fontSize: 12 }}>No fish match your search</div>;
            }

            // Flat list when searching
            if (isFiltering) {
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ fontSize: 9, opacity: 0.3, letterSpacing: 1.5, marginBottom: 4 }}>{filtered.length} RESULTS</div>
                  {filtered.map(f => {
                    const inTank = state.fish.find(ff => ff.id === f.id);
                    return (
                      <div key={f.id} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px",
                        borderRadius: 8, background: inTank ? "rgba(60,140,255,0.04)" : "rgba(255,255,255,0.015)",
                        border: "1px solid rgba(255,255,255,0.04)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                          <FishSilhouette fish={f} size={36} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</div>
                            <div style={{ fontSize: 9, opacity: 0.3, whiteSpace: "nowrap" }}>
                              {f.size} · {f.level} · {f.schooling ? `school ≥${f.minSchool}` : "solo"} · {f.peaceful ? "✓ peaceful" : "⚡ semi-aggressive"}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0, marginLeft: 6 }}>
                          {inTank && (
                            <>
                              <button onClick={() => removeFish(f.id)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(255,80,80,0.2)", background: "rgba(255,80,80,0.06)", color: "#FF8888", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>−</button>
                              <span style={{ fontSize: 11, color: "#7CB8FF", width: 20, textAlign: "center" }}>{inTank.count}</span>
                            </>
                          )}
                          <button onClick={() => { addFish(f.id); setLastAdded({ name: f.name, color: f.color, time: Date.now() }); }} style={{
                            width: 28, height: 28, borderRadius: 6,
                            border: "1px solid rgba(60,140,255,0.25)", background: "rgba(60,140,255,0.08)",
                            color: "#7CB8FF", cursor: "pointer", fontSize: 14, fontFamily: "inherit",
                          }}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            // Grouped accordion when browsing
            const groups = {};
            filtered.forEach(f => { const g = f.group || "Other"; if (!groups[g]) groups[g] = []; groups[g].push(f); });
            return Object.entries(groups).map(([groupName, fishes]) => (
              <div key={groupName} style={{ marginBottom: 4 }}>
                <button
                  onClick={() => setOpenGroups(p => ({ ...p, [groupName]: !p[groupName] }))}
                  style={{
                    width: "100%", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: openGroups[groupName] ? "rgba(60,140,255,0.08)" : "rgba(255,255,255,0.02)",
                    border: openGroups[groupName] ? "1px solid rgba(60,140,255,0.15)" : "1px solid rgba(255,255,255,0.04)",
                    borderRadius: openGroups[groupName] ? "8px 8px 0 0" : 8,
                    cursor: "pointer", fontFamily: "inherit", color: openGroups[groupName] ? "#7CB8FF" : "#8899AA",
                    fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                    WebkitTapHighlightColor: "transparent",
                  }}>
                  <span>{groupName}</span>
                  <span style={{ fontSize: 10, opacity: 0.4, display: "flex", alignItems: "center", gap: 4 }}>
                    <span>{fishes.length}</span>
                    <span style={{ fontSize: 14, transition: "transform 0.2s", transform: openGroups[groupName] ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                  </span>
                </button>
                {openGroups[groupName] && (
                  <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderTop: "none", borderRadius: "0 0 8px 8px", padding: "4px" }}>
                    {fishes.map(f => {
                      const inTank = state.fish.find(ff => ff.id === f.id);
                      return (
                        <div key={f.id} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px",
                          borderRadius: 6, marginBottom: 1,
                          background: inTank ? "rgba(60,140,255,0.04)" : "transparent",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                            <FishSilhouette fish={f} size={36} />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</div>
                              <div style={{ fontSize: 9, opacity: 0.3, whiteSpace: "nowrap" }}>
                                {f.size} · {f.level} · {f.schooling ? `school ≥${f.minSchool}` : "solo"} · {f.peaceful ? "✓" : "⚡"} · {f.tempMin}–{f.tempMax}°C
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0, marginLeft: 6 }}>
                            {inTank && (
                              <>
                                <button onClick={() => removeFish(f.id)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(255,80,80,0.2)", background: "rgba(255,80,80,0.06)", color: "#FF8888", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>−</button>
                                <span style={{ fontSize: 11, color: "#7CB8FF", width: 20, textAlign: "center" }}>{inTank.count}</span>
                              </>
                            )}
                            <button onClick={() => { addFish(f.id); setLastAdded({ name: f.name, color: f.color, time: Date.now() }); }} style={{
                              width: 28, height: 28, borderRadius: 6,
                              border: "1px solid rgba(60,140,255,0.25)", background: "rgba(60,140,255,0.08)",
                              color: "#7CB8FF", cursor: "pointer", fontSize: 14, fontFamily: "inherit",
                            }}>+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ));
          })()}
        </div>)}
      </div>
  );
}
