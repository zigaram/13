// ============================================================================
// FISH BEHAVIOR SIMULATION ENGINE
//
// Species-specific movement patterns based on real aquarium fish behavior:
//
// SCHOOLING FISH (neons, cardinals, rasboras, rummynose):
//   - Loose shoaling when calm, tight schooling when startled
//   - Periodic coordinated direction changes
//   - Individual fish drift apart then regroup
//   - Rummynose school tighter than neons
//
// BETTAS:
//   - Slow, elegant gliding with long pauses
//   - Periodic fin flaring (body stiffens, size pulses)
//   - Patrol territory in slow loops
//   - Surface breather — visits top regularly
//
// CORYDORAS:
//   - Bottom foraging with nose-digging animation
//   - Periodic dash to surface for air gulp, then dive back
//   - Glass surfing (swim up/down along walls)
//   - Rest periods where they sit motionless
//   - Group together when resting
//
// PLECOS:
//   - Stick to glass/surfaces for long periods
//   - Very slow movement, mostly stationary
//   - Occasional repositioning at night
//
// GOURAMIS:
//   - Surface dwelling, slow graceful movement
//   - Feeler antenna probing (wobble animation)
//   - Territorial patrol at top level
//
// ANGELFISH:
//   - Tall body, slow majestic gliding
//   - Drift through mid-water with minimal tail movement
//   - Occasional sudden dart to chase smaller fish
//
// DISCUS:
//   - Very slow, regal movement
//   - School loosely, prefer center of tank
//   - Shy — retreat from sudden changes
//
// SHRIMP:
//   - Grazing walk along surfaces
//   - Occasional quick backward flip (escape reflex)
//   - Fan feeding (bamboo shrimp)
//
// SNAILS:
//   - Extremely slow gliding
//   - Glass climbing — move up walls
//   - Retract into shell (stop completely) periodically
//
// LOBSTERS/CRAYFISH:
//   - Slow bottom walking with direction locks
//   - Claw threat displays
//   - Hide in caves, emerge to forage
//
// AXOLOTL:
//   - Ambush predator — sits still for very long
//   - Rare slow glide, then stops again
//   - Gill flutter animation
//
// PUFFERS:
//   - Curious hovering, inspects objects
//   - Quick darts followed by abrupt stops
//   - Watches observer (tracks focal point)
//
// FROGS:
//   - Bottom sitting with occasional surface dash for air
//   - Kicking leg animation during surface swim
//   - Float at surface briefly then sink back
//
// BEHAVIORAL EVENTS:
//   - Glass tap startle — click scatters nearby fish, schools tighten
//   - Feeding response — food drops from surface, fish rush to eat
//   - Activity cycles — energy ebbs and flows in ~2 min waves
//   - Social awareness — curiosity, yielding space, following
// ============================================================================

// ---- GLOBAL AQUARIUM STATE ----
// Persists across frames, tracks events and mood
const _aquariumState = {
  frameCount: 0,
  // Startle event
  startleX: 0,
  startleY: 0,
  startleTimer: 0,       // frames remaining
  startleRadius: 150,     // how far the scare reaches
  // Feeding event
  feeding: false,
  feedX: 0,
  feedTimer: 0,           // frames remaining
  foodParticles: [],      // { x, y, vy, eaten, size }
  // Activity cycle — sinusoidal energy that affects all fish
  activityPhase: Math.random() * Math.PI * 2,
};

/**
 * Trigger a behavioral event from outside (e.g. canvas click handler).
 * @param {"startle"|"feed"} type
 * @param {number} x - pixel x position in tank
 * @param {number} y - pixel y position in tank
 * @param {number} tankHeight - for food spawning
 */
export function triggerEvent(type, x, y, tankHeight) {
  if (type === "startle") {
    _aquariumState.startleX = x;
    _aquariumState.startleY = y;
    _aquariumState.startleTimer = 90; // ~1.5 sec at 60fps
  } else if (type === "feed") {
    _aquariumState.feeding = true;
    _aquariumState.feedX = x;
    _aquariumState.feedTimer = 600; // ~10 sec feeding frenzy
    // Spawn 6-10 food particles from the click point at surface
    const count = 6 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      _aquariumState.foodParticles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: 4 + Math.random() * 6,
        vy: 0.08 + Math.random() * 0.12,
        vx: (Math.random() - 0.5) * 0.15,
        size: 1.5 + Math.random() * 1.5,
        eaten: false,
        life: 0,
      });
    }
  }
}

/**
 * Get the current food particles for rendering.
 * Called from the canvas render loop.
 */
export function getFoodParticles() {
  return _aquariumState.foodParticles.filter(p => !p.eaten);
}

/**
 * Get current activity level (0-1) for external use if needed.
 */
export function getActivityLevel() {
  // Smooth sinusoidal cycle: ~2 minutes period
  return 0.5 + 0.5 * Math.sin(_aquariumState.activityPhase);
}

/**
 * Clear all active events (food, startle).
 * Call when switching tanks, resetting, loading saves, etc.
 */
export function clearEvents() {
  _aquariumState.startleTimer = 0;
  _aquariumState.feeding = false;
  _aquariumState.feedTimer = 0;
  _aquariumState.foodParticles = [];
}

// How strongly same-species schoolers attract each other
const SCHOOL_PULL = {
  rummy: 0.003,      // rummynose school very tightly
  cardinal: 0.0015,  // cardinals school moderately
  neon: 0.001,       // neons shoal loosely
  default: 0.0008,   // other schoolers
};

/**
 * Pick a random waypoint for a fish to swim toward.
 * Respects level preferences and tank bounds, with variety.
 */
function _pickWaypoint(f, tankWidth, tankHeight, subH, fd) {
  const pad = f.pixelSize * 2;
  const x = pad + Math.random() * (tankWidth - pad * 2);
  let yCenter;
  if (fd.level === "top") yCenter = tankHeight * 0.15;
  else if (fd.level === "bottom") yCenter = tankHeight - subH - tankHeight * 0.12;
  else yCenter = tankHeight * 0.35 + Math.random() * tankHeight * 0.2;
  const ySpread = tankHeight * 0.25;
  let y = yCenter + (Math.random() - 0.5) * ySpread;
  y = Math.max(15, Math.min(tankHeight - subH - f.pixelSize, y));
  return { x, y };
}

/**
 * Species-specific schooling parameters.
 * Controls how tight/loose the school is, what formation shape,
 * and how strongly each boids rule applies.
 */
function _getSchoolParams(speciesId) {
  switch (speciesId) {
    case "rummy":
      // Rummynose: extremely tight, elongated column formation
      return {
        sepRadius: 12, alignRadius: 100, cohRadius: 140,
        sepWeight: 5, alignWeight: 3, cohWeight: 2.5,
        comfortDist: 15, formation: "column",
      };
    case "cardinal":
      // Cardinals: moderately tight, rounded formation
      return {
        sepRadius: 18, alignRadius: 90, cohRadius: 130,
        sepWeight: 4.5, alignWeight: 2, cohWeight: 1.8,
        comfortDist: 25, formation: "cloud",
      };
    case "neon":
      // Neons: loose shoal, more spread out
      return {
        sepRadius: 22, alignRadius: 80, cohRadius: 120,
        sepWeight: 4, alignWeight: 1.5, cohWeight: 1.2,
        comfortDist: 35, formation: "cloud",
      };
    case "ember":
      // Embers: tiny, loose cloud
      return {
        sepRadius: 15, alignRadius: 70, cohRadius: 100,
        sepWeight: 4, alignWeight: 1.5, cohWeight: 1,
        comfortDist: 30, formation: "cloud",
      };
    case "rasbora":
    case "cpd":
      // Rasboras/CPD: mid-tight, flowing
      return {
        sepRadius: 18, alignRadius: 85, cohRadius: 120,
        sepWeight: 4, alignWeight: 2, cohWeight: 1.5,
        comfortDist: 28, formation: "cloud",
      };
    case "guppy":
    case "endler":
      // Livebearers: loose social group, less coordinated
      return {
        sepRadius: 20, alignRadius: 60, cohRadius: 100,
        sepWeight: 3.5, alignWeight: 1, cohWeight: 0.8,
        comfortDist: 35, formation: "cloud",
      };
    case "molly":
    case "platy":
    case "swordtail":
      // Larger livebearers: loose groups
      return {
        sepRadius: 25, alignRadius: 70, cohRadius: 110,
        sepWeight: 3.5, alignWeight: 1, cohWeight: 0.7,
        comfortDist: 40, formation: "cloud",
      };
    case "corydoras":
    case "kuhli":
    case "otocinclus":
      // Bottom dwellers: loose cluster on the bottom
      return {
        sepRadius: 15, alignRadius: 50, cohRadius: 80,
        sepWeight: 3, alignWeight: 0.8, cohWeight: 1,
        comfortDist: 25, formation: "cluster",
      };
    case "scat":
      // Scats: loose social group, big fish need more space
      return {
        sepRadius: 35, alignRadius: 100, cohRadius: 150,
        sepWeight: 3, alignWeight: 1, cohWeight: 0.6,
        comfortDist: 50, formation: "cloud",
      };
    default:
      return {
        sepRadius: 20, alignRadius: 75, cohRadius: 110,
        sepWeight: 4, alignWeight: 1.5, cohWeight: 1,
        comfortDist: 30, formation: "cloud",
      };
  }
}

/**
 * Simulate one frame of fish movement for all fish.
 * Called every animation frame from the render loop.
 *
 * @param {Array} fishArr - fishRef.current (mutable array of fish objects)
 * @param {number} tankWidth
 * @param {number} tankHeight
 * @param {number} subH - substrate height in pixels
 * @param {Array} expandedDecs - decoration positions for hiding/interaction
 * @param {Array} bgFish - output: fish to render behind all decor (zDepth < 0.33)
 * @param {Array} fgFish - output: fish to render in front of all decor (zDepth > 0.66)
 * @param {Array} midFish - output: fish to render between back and front decor (0.33-0.66)
 */
export function simulateFish(fishArr, tankWidth, tankHeight, subH, expandedDecs, bgFish, fgFish, midFish) {
  const aq = _aquariumState;
  aq.frameCount++;

  // ---- ACTIVITY CYCLE — natural energy ebb and flow ----
  // ~2 minute period: fish go through busy and calm phases
  aq.activityPhase += 0.00055; // full cycle ~11400 frames ≈ 190sec at 60fps
  const activityLevel = 0.5 + 0.5 * Math.sin(aq.activityPhase);
  // activityLevel: 0 = very calm (slow, lots of idle), 1 = very active (fast, few idles)

  // ---- STARTLE EVENT DECAY ----
  if (aq.startleTimer > 0) aq.startleTimer--;

  // ---- FEEDING EVENT ----
  if (aq.feedTimer > 0) {
    aq.feedTimer--;
    if (aq.feedTimer <= 0) aq.feeding = false;
    // Update food particles — sink slowly, drift
    aq.foodParticles.forEach(p => {
      if (p.eaten) return;
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.life * 0.05) * 0.1;
      p.vy *= 0.999; // slow deceleration
      p.life++;
      // Food sinks to bottom and disappears
      if (p.y > tankHeight - subH - 5) p.eaten = true;
      // Timeout after ~15 seconds
      if (p.life > 900) p.eaten = true;
    });
    // Clean up old eaten particles
    if (aq.frameCount % 60 === 0) {
      aq.foodParticles = aq.foodParticles.filter(p => !p.eaten);
    }
  }

  // Pre-compute school centers for schooling species
  const schoolCenters = {};
  fishArr.forEach(f => {
    if (f.data.schooling && !f.hiding) {
      const key = f.data.id;
      if (!schoolCenters[key]) schoolCenters[key] = { x: 0, y: 0, count: 0 };
      schoolCenters[key].x += f.x;
      schoolCenters[key].y += f.y;
      schoolCenters[key].count++;
    }
  });
  Object.values(schoolCenters).forEach(sc => {
    if (sc.count > 0) { sc.x /= sc.count; sc.y /= sc.count; }
  });

  fishArr.forEach(f => {
    const fd = f.data;

    // ---- Initialize per-fish state on first frame ----
    if (!f.behaviorTimer) f.behaviorTimer = Math.random() * 200;
    if (!f.idleTimer) f.idleTimer = 0;
    if (!f.dartTimer) f.dartTimer = 0;
    if (!f.baseSpeed) {
      if (fd.bodyShape === "snail") f.baseSpeed = 0.014 + Math.random() * 0.0084;
      else if (fd.bodyShape === "shrimp") f.baseSpeed = 0.042 + Math.random() * 0.028;
      else if (fd.size === "tiny") f.baseSpeed = 0.084 + Math.random() * 0.042;
      else if (fd.size === "small") f.baseSpeed = 0.063 + Math.random() * 0.035;
      else if (fd.size === "medium") f.baseSpeed = 0.042 + Math.random() * 0.021;
      else if (fd.size === "huge") f.baseSpeed = 0.035 + Math.random() * 0.014;
      else f.baseSpeed = 0.028 + Math.random() * 0.017;
    }
    if (!f.wobbleSpeed) {
      f.wobbleSpeed = fd.bodyShape === "snail" ? 0.0008 :
        fd.bodyShape === "shrimp" ? 0.0015 : 0.0015 + Math.random() * 0.001;
    }
    if (!f.wobbleAmp) f.wobbleAmp = fd.bodyShape === "snail" ? 0 : 0.008 + Math.random() * 0.008;
    if (f.zDepth === undefined) f.zDepth = 0.2 + Math.random() * 0.6;

    // ---- SUBSTRATE DEPTH LANES for bottom dwellers ----
    // Bottom creatures get assigned to 1 of 5 depth lanes, affecting:
    // - Y position (deeper lanes = further into substrate = lower on screen)
    // - zDepth (deeper lanes = rendered further in front)
    // - Opacity (back lanes slightly faded)
    const isBottomCreature = fd.level === "bottom" && (
      fd.bodyShape === "snail" || fd.bodyShape === "shrimp" || fd.bodyShape === "lobster" ||
      fd.id === "corydoras" || fd.id === "kuhli" || fd.id === "otocinclus" ||
      fd.id === "pleco" || fd.id === "siamese_ae" || fd.id === "hermit_crab" ||
      fd.id === "emerald_crab"
    );
    if (f._subDepth === undefined) {
      if (isBottomCreature) {
        f._subDepth = Math.floor(Math.random() * 5); // 0-4
        // Align zDepth to substrate lane so rendering order matches
        f.zDepth = 0.1 + f._subDepth * 0.18; // 0.1, 0.28, 0.46, 0.64, 0.82
        // Occasional lane changes
        f._laneChangeTimer = 300 + Math.floor(Math.random() * 600);
      } else {
        f._subDepth = -1; // not a bottom creature
      }
    }
    // Bottom creatures periodically shift between depth lanes
    if (isBottomCreature && f._laneChangeTimer !== undefined) {
      f._laneChangeTimer--;
      if (f._laneChangeTimer <= 0) {
        // Move to adjacent lane (natural — don't teleport across tank)
        const oldLane = f._subDepth;
        if (Math.random() < 0.5 && oldLane > 0) f._subDepth = oldLane - 1;
        else if (oldLane < 4) f._subDepth = oldLane + 1;
        f.zDepth = 0.1 + f._subDepth * 0.18;
        f._laneChangeTimer = 400 + Math.floor(Math.random() * 800);
      }
    }
    // Compute the substrate Y for this creature's depth lane
    const subLaneY = isBottomCreature
      ? (tankHeight - subH) + subH * (0.15 + f._subDepth * 0.14) // 5 levels: 15%, 29%, 43%, 57%, 71% into substrate
      : (tankHeight - subH);

    f.wobble += f.wobbleSpeed;
    f.behaviorTimer++;

    // Global velocity smoothing — prevents jitter accumulation
    f.vx *= 0.996;
    f.vy *= 0.993;

    // ---- STARTLE RESPONSE — glass tap scatters nearby fish ----
    if (aq.startleTimer > 0 && !f.hiding) {
      const sdx = f.x - aq.startleX;
      const sdy = f.y - aq.startleY;
      const sDist = Math.sqrt(sdx * sdx + sdy * sdy);
      if (sDist < aq.startleRadius && sDist > 1) {
        // Intensity fades with distance and time
        const intensity = (1 - sDist / aq.startleRadius) * (aq.startleTimer / 90);
        const fleeForce = intensity * 0.06;
        f.vx += (sdx / sDist) * fleeForce;
        f.vy += (sdy / sDist) * fleeForce * 0.5;
        // Schooling fish tighten formation when startled
        if (fd.schooling && schoolCenters[fd.id]) {
          const sc = schoolCenters[fd.id];
          f.vx += (sc.x - f.x) * 0.003 * intensity;
          f.vy += (sc.y - f.y) * 0.002 * intensity;
        }
        // Small fish dart, large fish just flinch
        if (fd.size === "tiny" || fd.size === "small") {
          f.dartTimer = Math.max(f.dartTimer, Math.floor(intensity * 15));
        }
        // Override idle — startled fish don't just sit there
        if (f.idleTimer > 0 && intensity > 0.3) f.idleTimer = 0;
      }
    }

    // ---- FEEDING RESPONSE — fish sprint toward food ----
    if (aq.feeding && !f.hiding && fd.bodyShape !== "snail" && fd.bodyShape !== "lobster") {
      // Find nearest uneaten food particle
      let nearestFood = null, nearestFoodDist = Infinity;
      for (let fi = 0; fi < aq.foodParticles.length; fi++) {
        const fp = aq.foodParticles[fi];
        if (fp.eaten) continue;
        const fdx = fp.x - f.x;
        const fdy = fp.y - f.y;
        const fDist = Math.sqrt(fdx * fdx + fdy * fdy);
        if (fDist < nearestFoodDist) {
          nearestFoodDist = fDist;
          nearestFood = fp;
        }
      }
      // Detection range is the whole tank — everyone notices food
      if (nearestFood && nearestFoodDist < 500) {
        const urgency = Math.max(0.4, 1 - nearestFoodDist / 500);
        const fdx = nearestFood.x - f.x;
        const fdy = nearestFood.y - f.y;
        const norm = Math.sqrt(fdx * fdx + fdy * fdy) + 0.001;
        // Species-specific food drive
        let foodDrive = 0.012; // default — strong pull
        if (fd.size === "tiny") foodDrive = 0.018; // small fish are frantic
        else if (fd.bodyShape === "shrimp") foodDrive = 0.006; // shrimp are cautious
        else if (fd.id === "betta" || fd.id === "angelfish") foodDrive = 0.015; // predatory = aggressive
        else if (fd.id === "oscar") foodDrive = 0.02; // oscars are voracious
        else if (fd.id === "pleco" || fd.id === "otocinclus") foodDrive = 0.003; // algae eaters less interested
        else if (fd.size === "medium") foodDrive = 0.01;
        else if (fd.size === "large") foodDrive = 0.008;

        // Steer toward food — normalized direction * drive * urgency
        f.vx += (fdx / norm) * foodDrive * urgency;
        f.vy += (fdy / norm) * foodDrive * urgency;

        // SPEED BOOST — override base speed during feeding frenzy
        // Fish swim 2-3x faster when chasing food
        f._feedingBoost = Math.max(f._feedingBoost || 0, 1.5 + urgency);

        // Cancel idle — food overrides rest
        if (f.idleTimer > 0) f.idleTimer = 0;
        // Fire burst-glide thrust for sprint animation
        if (f._thrust !== undefined) f._thrust = Math.max(f._thrust, 0.8);
        // Set waypoint to food location so waypoint navigation doesn't fight the feeding
        if (f._wp && nearestFoodDist < 150) {
          f._wp.x = nearestFood.x + (Math.random() - 0.5) * 20;
          f._wp.y = nearestFood.y + (Math.random() - 0.5) * 15;
          f._wpTimer = 0;
        }

        // "Eat" food when close enough
        if (nearestFoodDist < f.pixelSize * 1.5) {
          nearestFood.eaten = true;
          // Brief satisfied pause
          f.idleTimer = 5 + Math.floor(Math.random() * 8);
          f._feedingBoost = 0;
        }
      }
    }
    // Decay feeding boost when not chasing food
    if (f._feedingBoost > 0 && !aq.feeding) {
      f._feedingBoost *= 0.95;
      if (f._feedingBoost < 0.1) f._feedingBoost = 0;
    }

    // Universal feeding boost factor — used by all species speed limits
    const _fb = 1 + (f._feedingBoost || 0) * 0.8; // 1.0 normally, up to ~2.5 when feeding
    // Redirect cruise/patrol waypoints toward food during feeding
    if ((f._feedingBoost || 0) > 0.3 && aq.foodParticles.length > 0) {
      const fp = aq.foodParticles.find(p => !p.eaten);
      if (fp) {
        if (f._cruiseWp) { f._cruiseWp.x = fp.x + (Math.random()-0.5)*30; f._cruiseWp.y = fp.y + (Math.random()-0.5)*20; }
        if (f._wp) { f._wp.x = fp.x + (Math.random()-0.5)*20; f._wp.y = fp.y + (Math.random()-0.5)*15; }
      }
    }

    // ---- ACTIVITY CYCLE MODULATION ----
    // Adjusts base speed and idle probability based on global activity level
    // Each fish has a slight individual offset so they're not all in perfect sync
    if (f._activityOffset === undefined) f._activityOffset = Math.random() * 0.3 - 0.15;
    const fishActivity = Math.max(0.15, Math.min(1, activityLevel + f._activityOffset));
    // Speed modulation: 70% at calm, 115% at peak activity
    const speedMod = 0.7 + fishActivity * 0.45;
    // During calm phases, trigger idle more easily (handled per-species below)
    // During calm phases, apply more friction to slow everything down gently
    const calmFriction = 1 - (1 - fishActivity) * 0.003; // up to 0.3% extra friction

    // ==================================================================
    // SNAIL
    // ==================================================================
    if (fd.bodyShape === "snail") {
      f.tailPhase += 0.003;
      // Glass climbing: snails slowly move upward along walls
      if (!f.climbingWall && Math.random() < 0.0005) {
        f.climbingWall = true;
        f.climbDir = f.x < tankWidth / 2 ? -1 : 1; // head toward nearest wall
      }
      if (f.climbingWall) {
        f.x += f.climbDir * f.baseSpeed * 0.3;
        f.y -= f.baseSpeed * 0.15; // slowly rise
        // Reached wall? climb up it
        if (f.x < 8 || f.x > tankWidth - 8) {
          f.y -= f.baseSpeed * 0.5;
          f.x = f.x < 8 ? 8 : tankWidth - 8;
        }
        // Stop climbing after a while or reaching high enough
        if (f.y < tankHeight * 0.2 || Math.random() < 0.001) {
          f.climbingWall = false;
          f.vy = f.baseSpeed * 0.3; // detach and sink
        }
      } else if (f.idleTimer > 0) {
        // Shell retraction — completely still
        f.idleTimer--;
      } else {
        // Normal bottom gliding
        f.x += f.vx;
        f.y += (subLaneY - f.pixelSize * 0.5 - f.y) * 0.02; // settle to bottom
        f.vx += (Math.random() - 0.5) * 0.001;
        f.vx = Math.max(-f.baseSpeed * _fb, Math.min(f.baseSpeed * _fb, f.vx));
        // Retract into shell periodically
        if (Math.random() < 0.0008) f.idleTimer = 150 + Math.random() * 300;
        // Start glass climbing
        if (Math.random() < 0.0003) f.climbingWall = true;
      }
      if (f.x < f.pixelSize) { f.x = f.pixelSize; f.vx = Math.abs(f.vx); }
      if (f.x > tankWidth - f.pixelSize) { f.x = tankWidth - f.pixelSize; f.vx = -Math.abs(f.vx); }
      if (!f.hiding) { if (f.zDepth < 0.33) bgFish.push(f); else if (f.zDepth < 0.66) (midFish || fgFish).push(f); else fgFish.push(f); }
      return;
    }

    // ==================================================================
    // SHRIMP (Cherry, Amano, Blue Dream, Bamboo, Cleaner, etc.)
    // ==================================================================
    if (fd.bodyShape === "shrimp") {
      f.tailPhase += 0.012 + Math.abs(f.vx) * 0.03;
      const beh = fd.behavior;

      if (beh === "filter_feeder") {
        // Bamboo shrimp: stands in current with fans open
        f.tailPhase += 0.015;
        if (f.idleTimer > 0) {
          f.idleTimer--;
          f.y = subLaneY - f.pixelSize * 0.5 + Math.sin(f.wobble) * 0.1;
        } else {
          f.x += f.vx;
          f.y = Math.max(subLaneY - tankHeight * 0.12, Math.min(subLaneY - f.pixelSize * 0.5, f.y));
          f.vx += (Math.random() - 0.5) * 0.002;
          f.vx = Math.max(-f.baseSpeed * 0.6 * _fb, Math.min(f.baseSpeed * 0.6 * _fb, f.vx));
          if (Math.random() < 0.008) f.idleTimer = 200 + Math.random() * 400;
        }
      } else if (beh === "cleaner") {
        // Cleaner shrimp: perches, waves antennae, approaches fish
        if (f.idleTimer > 0) { f.idleTimer--; f.vx *= 0.95; }
        else {
          f.x += f.vx;
          f.vx += (Math.random() - 0.5) * 0.003;
          f.vx = Math.max(-f.baseSpeed * _fb, Math.min(f.baseSpeed * _fb, f.vx));
          if (Math.random() < 0.012) f.idleTimer = 60 + Math.random() * 150;
        }
        f.y += (subLaneY - f.pixelSize * 0.5 - f.y) * 0.03;
      } else {
        // Grazer / scavenger shrimp
        if (f.idleTimer > 0) {
          f.idleTimer--;
          f.vx *= 0.92;
        } else {
          f.x += f.vx;
          f.vx += (Math.random() - 0.5) * 0.003;
          f.vx = Math.max(-f.baseSpeed * _fb, Math.min(f.baseSpeed * _fb, f.vx));
          // Backward flip escape reflex (random rare event)
          if (Math.random() < 0.0004) {
            f.vx = -(f.vx > 0 ? 1 : -1) * f.baseSpeed * 1.8;
            f.vy = -f.baseSpeed * 1.2;
            f.dartTimer = 5;
          }
          if (Math.random() < 0.005) f.idleTimer = 30 + Math.random() * 80;
          // Amano shrimp sometimes swim mid-water
          if (fd.id === "amano" && Math.random() < 0.001) f.vy = -f.baseSpeed * 2;
        }
        f.y += (subLaneY - f.pixelSize * 0.5 - f.y) * 0.02;
        if (f.dartTimer > 0) { f.dartTimer--; f.x += f.vx * 1.5; f.y += f.vy; f.vy *= 0.9; }
      }
      if (f.x < f.pixelSize) { f.x = f.pixelSize; f.vx = Math.abs(f.vx); }
      if (f.x > tankWidth - f.pixelSize) { f.x = tankWidth - f.pixelSize; f.vx = -Math.abs(f.vx); }
      if (!f.hiding) { if (f.zDepth < 0.33) bgFish.push(f); else if (f.zDepth < 0.66) (midFish || fgFish).push(f); else fgFish.push(f); }
      return;
    }

    // ==================================================================
    // LOBSTER / CRAYFISH — detailed behavioral simulation
    // ==================================================================
    if (fd.bodyShape === "lobster") {
      f.tailPhase += 0.008 + Math.abs(f.vx) * 0.02;
      if (!f.threatTimer) f.threatTimer = 0;
      if (!f.hideTimer) f.hideTimer = 0;
      if (!f.dirTimer) f.dirTimer = 700 + Math.random() * 500;
      if (!f.hideCooldown) f.hideCooldown = 0;
      if (!f.dirLocked) { f.vx = (Math.random() > 0.5 ? 1 : -1) * f.baseSpeed * 0.6; f.dirLocked = true; }
      if (f.hideCooldown > 0) f.hideCooldown--;
      if (!f._forageTimer) f._forageTimer = 0;
      if (!f._escaping) f._escaping = false;
      if (!f._patrolCenter) f._patrolCenter = f.x;
      if (!f._foragePauseTimer) f._foragePauseTimer = 0;

      const isLarge = fd.size === "large" || fd.size === "medium";

      if (f._escaping) {
        // BACKWARD ESCAPE SWIM — rapid tail-flip propulsion
        f.tailPhase += 0.06; // rapid tail curling animation
        f.x -= (f.vx >= 0 ? 1 : -1) * f.baseSpeed * 3; // shoot backward
        f.vy = -f.baseSpeed * 0.8; // slight upward lift
        f.y += f.vy;
        f.vy *= 0.95;
        f._escaping--;
        if (f._escaping <= 0) {
          f._escaping = false;
          f.idleTimer = 20 + Math.random() * 40; // stunned pause after escape
        }
      } else if (f.hiding) {
        f.hideTimer--;
        f.vx = 0;
        if (f.hideTimer <= 0) {
          f.hiding = false;
          f.hideCooldown = 300;
          f.vx = (Math.random() > 0.5 ? 1 : -1) * f.baseSpeed * 0.6;
        }
      } else if (f.threatTimer > 0) {
        // THREAT DISPLAY — claws raised, body stiffened
        f.threatTimer--;
        f.vx *= 0.88;
        f.tailPhase += 0.025; // agitated claw movement
        // Slowly advance toward threat direction
        f.x += f.vx * 0.3;
      } else if (f._foragePauseTimer > 0) {
        // FORAGING PAUSE — stopped, probing substrate with antennae
        f._foragePauseTimer--;
        f.vx *= 0.9;
        f.tailPhase += 0.004; // slow antennae wave
      } else if (f.idleTimer > 0) {
        f.idleTimer--;
        f.vx *= 0.98;
      } else {
        // NORMAL WALKING — slow deliberate movement along bottom
        const dir = f.vx >= 0 ? 1 : -1;
        f.vx = dir * f.baseSpeed * (isLarge ? 0.5 : 0.6);
        f.x += f.vx * 0.7;
        f.y = subLaneY - f.pixelSize * 0.4;
        f.dirTimer--;

        // Direction change
        if (f.dirTimer <= 0) {
          f.vx = -f.vx;
          f.dirTimer = 500 + Math.random() * 700;
        }

        // FORAGING — periodic stops to probe substrate
        f._forageTimer++;
        if (f._forageTimer > 80 + Math.random() * 120) {
          f._foragePauseTimer = 30 + Math.random() * 60; // pause 0.5-1.5 sec
          f._forageTimer = 0;
        }

        // TERRITORIAL PATROL — stay within patrol range, return if strayed
        const distFromHome = Math.abs(f.x - f._patrolCenter);
        if (distFromHome > tankWidth * 0.35) {
          f.vx = (f._patrolCenter > f.x ? 1 : -1) * f.baseSpeed * 0.6;
          f.dirTimer = 400 + Math.random() * 300;
        }

        // Random idle
        if (Math.random() < 0.003) f.idleTimer = 80 + Math.random() * 200;
        // Threat display (random agitation)
        if (Math.random() < 0.0008) f.threatTimer = 40 + Math.random() * 80;
        // Rare backward escape (startled by nothing)
        if (Math.random() < 0.0002) f._escaping = 12 + Math.floor(Math.random() * 8);

        // Hide near decorations
        if (f.hideCooldown <= 0) {
          for (let di = 0; di < expandedDecs.length; di++) {
            const d = expandedDecs[di];
            if (d.drawType === "carpet") continue;
            if (Math.abs(f.x - d.px) < 10) {
              if (Math.random() < 0.3) { f.hiding = true; f.hideTimer = 60 + Math.random() * 150; }
              f.hideCooldown = 200;
              break;
            }
          }
        }
      }
      // Bounds
      if (f.x < f.pixelSize * 1.5) { f.x = f.pixelSize * 1.5; f.vx = f.baseSpeed * 0.6; f.dirTimer = 600 + Math.random() * 600; }
      if (f.x > tankWidth - f.pixelSize * 1.5) { f.x = tankWidth - f.pixelSize * 1.5; f.vx = -f.baseSpeed * 0.6; f.dirTimer = 600 + Math.random() * 600; }
      if (f.y > subLaneY - f.pixelSize * 0.3) f.y = subLaneY - f.pixelSize * 0.3;
      if (f.y < subLaneY - tankHeight * 0.15) f.y = subLaneY - tankHeight * 0.15;
      if (!f.hiding) { if (f.zDepth < 0.33) bgFish.push(f); else if (f.zDepth < 0.66) (midFish || fgFish).push(f); else fgFish.push(f); }
      return;
    }

    // ==================================================================
    // AXOLOTL — ambush predator, sits still for ages
    // ==================================================================
    if (fd.bodyShape === "axolotl") {
      f.tailPhase += 0.005 + Math.abs(f.vx) * 0.015;
      if (f.idleTimer > 0) {
        f.idleTimer--; f.vx *= 0.98; f.vy *= 0.98;
        f.y += Math.sin(f.wobble) * 0.02; // gentle gill flutter
      } else {
        f.x += f.vx; f.y += f.vy;
        f.y = Math.max(subLaneY - tankHeight * 0.2, Math.min(subLaneY - f.pixelSize * 0.4, f.y));
        f.vx += (Math.random() - 0.5) * 0.002;
        f.vy += (Math.random() - 0.5) * 0.001;
        f.vx = Math.max(-f.baseSpeed * 0.5, Math.min(f.baseSpeed * 0.5, f.vx));
        f.vy = Math.max(-f.baseSpeed * 0.2, Math.min(f.baseSpeed * 0.2, f.vy));
        // Very long idle (ambush predator)
        if (Math.random() < 0.008) f.idleTimer = 200 + Math.random() * 500;
      }
      if (f.x < f.pixelSize) { f.x = f.pixelSize; f.vx = Math.abs(f.vx) * 0.3; }
      if (f.x > tankWidth - f.pixelSize) { f.x = tankWidth - f.pixelSize; f.vx = -Math.abs(f.vx) * 0.3; }
      if (f.zDepth < 0.33) bgFish.push(f); else if (f.zDepth < 0.66) (midFish || fgFish).push(f); else fgFish.push(f);
      return;
    }

    // ==================================================================
    // PUFFER — curious hoverer, inspects objects, quick darts then stops
    // ==================================================================
    if (fd.bodyShape === "puffer") {
      f.tailPhase += 0.015 + Math.abs(f.vx) * 0.04;
      if (f.idleTimer > 0) {
        f.idleTimer--;
        f.vx *= 0.96; f.vy *= 0.96;
        f.y += Math.sin(f.wobble) * 0.04; // hover
      } else {
        f.x += f.vx; f.y += f.vy + Math.sin(f.wobble) * 0.03;
        f.vx += (Math.random() - 0.5) * 0.0015;
        f.vy += (Math.random() - 0.5) * 0.002;
        f.vx = Math.max(-f.baseSpeed * _fb, Math.min(f.baseSpeed * _fb, f.vx));
        f.vy = Math.max(-f.baseSpeed * 0.5 * _fb, Math.min(f.baseSpeed * 0.5 * _fb, f.vy));
        // Frequent "inspect" stops — curious behavior
        if (Math.random() < 0.006) f.idleTimer = 30 + Math.random() * 100;
        // Quick dart then abrupt stop
        if (Math.random() < 0.002) {
          f.vx = (Math.random() - 0.5) * f.baseSpeed * 1.8;
          f.vy = (Math.random() - 0.5) * f.baseSpeed * 1;
          f.dartTimer = 8;
        }
      }
      if (f.dartTimer > 0) { f.dartTimer--; f.x += f.vx; f.y += f.vy; }
      if (f.x < f.pixelSize) { f.x = f.pixelSize; f.vx = Math.abs(f.vx) * 0.3; }
      if (f.x > tankWidth - f.pixelSize) { f.x = tankWidth - f.pixelSize; f.vx = -Math.abs(f.vx) * 0.3; }
      if (f.y < 15) f.vy = Math.abs(f.vy) * 0.3 + 0.02;
      if (f.y > subLaneY - f.pixelSize) f.vy = -Math.abs(f.vy) * 0.3 - 0.02;
      if (f.zDepth < 0.33) bgFish.push(f); else if (f.zDepth < 0.66) (midFish || fgFish).push(f); else fgFish.push(f);
      return;
    }

    // ==================================================================
    // FROG — bottom sitter, surface air dash, kicking swim
    // ==================================================================
    if (fd.bodyShape === "frog") {
      if (!f.surfacing) f.surfacing = false;
      f.tailPhase += f.surfacing ? 0.04 : 0.005;
      if (f.surfacing) {
        f.y -= f.baseSpeed * 1.5;
        f.x += Math.sin(f.wobble) * 0.3;
        if (f.y < 15) { f.y = 15; f.surfacing = false; f.idleTimer = 30 + Math.random() * 60; f.vy = f.baseSpeed * 0.5; }
      } else if (f.idleTimer > 0) {
        f.idleTimer--; f.vx *= 0.95;
        if (f.y < subLaneY - f.pixelSize) f.y += 0.15;
      } else {
        f.x += f.vx;
        f.y = Math.min(f.y + 0.05, subLaneY - f.pixelSize * 0.4);
        f.vx += (Math.random() - 0.5) * 0.003;
        f.vx = Math.max(-f.baseSpeed * 0.5, Math.min(f.baseSpeed * 0.5, f.vx));
        if (Math.random() < 0.005) f.idleTimer = 100 + Math.random() * 300;
        if (Math.random() < 0.0008) f.surfacing = true;
      }
      if (f.x < f.pixelSize) { f.x = f.pixelSize; f.vx = Math.abs(f.vx); }
      if (f.x > tankWidth - f.pixelSize) { f.x = tankWidth - f.pixelSize; f.vx = -Math.abs(f.vx); }
      if (f.zDepth < 0.33) bgFish.push(f); else if (f.zDepth < 0.66) (midFish || fgFish).push(f); else fgFish.push(f);
      return;
    }

    // ==================================================================
    // BETTA — slow elegant gliding, fin flaring, territory patrol
    // ==================================================================
    if (fd.id === "betta") {
      f.tailPhase += 0.008 + Math.abs(f.vx) * 0.02;
      if (!f.flareTimer) f.flareTimer = 0;
      if (!f.patrolDir) f.patrolDir = 1;

      if (f.flareTimer > 0) {
        // Fin flare display — slow down, puff up
        f.flareTimer--;
        f.vx *= 0.92;
        f.vy *= 0.92;
        f.tailPhase += 0.015; // extra fin animation
      } else if (f.idleTimer > 0) {
        // Elegant pause — hover with gentle drift
        f.idleTimer--;
        f.vx *= 0.97;
        f.y += Math.sin(f.wobble * 2) * 0.03;
      } else {
        // Slow patrol — bettas glide gracefully
        f.x += f.vx;
        f.y += f.vy + Math.sin(f.wobble) * 0.02;
        f.vx += f.patrolDir * 0.0008;
        f.vy += (Math.random() - 0.5) * 0.001;
        f.vx = Math.max(-f.baseSpeed * 0.7 * _fb, Math.min(f.baseSpeed * 0.7 * _fb, f.vx));
        f.vy = Math.max(-f.baseSpeed * 0.3 * _fb, Math.min(f.baseSpeed * 0.3 * _fb, f.vy));
        // Surface breathing — bettas are labyrinth fish
        if (f.y > tankHeight * 0.35 && Math.random() < 0.001) f.vy = -f.baseSpeed * 0.8;
        // Reverse patrol direction
        if (Math.random() < 0.002) f.patrolDir = -f.patrolDir;
        // Elegant hover pause
        if (Math.random() < 0.004) f.idleTimer = 60 + Math.random() * 120;
        // Fin flare display (periodic)
        if (Math.random() < 0.0008) f.flareTimer = 40 + Math.random() * 60;
      }
      // Prefer top half
      f.vy += (tankHeight * 0.2 - f.y) * 0.0002;
      if (f.x < f.pixelSize) { f.x = f.pixelSize; f.vx = Math.abs(f.vx); f.patrolDir = 1; }
      if (f.x > tankWidth - f.pixelSize) { f.x = tankWidth - f.pixelSize; f.vx = -Math.abs(f.vx); f.patrolDir = -1; }
      if (f.y < 8) f.vy = Math.abs(f.vy) * 0.3 + 0.02;
      if (f.y > subLaneY - f.pixelSize) f.vy = -Math.abs(f.vy) * 0.3;
      if (f.zDepth < 0.33) bgFish.push(f); else if (f.zDepth < 0.66) (midFish || fgFish).push(f); else fgFish.push(f);
      return;
    }

    // ==================================================================
    // PLECO — glass sucker, mostly stationary, rare repositioning
    // ==================================================================
    if (fd.id === "pleco" || fd.id === "siamese_ae") {
      f.tailPhase += 0.003;
      if (f.idleTimer > 0) {
        f.idleTimer--;
        f.vx *= 0.95;
        // Slight body wobble while suckered to surface
        f.y += Math.sin(f.wobble) * 0.01;
      } else {
        f.x += f.vx;
        f.y += (subLaneY - f.pixelSize * 0.4 - f.y) * 0.01;
        f.vx += (Math.random() - 0.5) * 0.004;
        f.vx = Math.max(-f.baseSpeed * 0.4, Math.min(f.baseSpeed * 0.4, f.vx));
        // Very long suction periods
        if (Math.random() < 0.006) f.idleTimer = 300 + Math.random() * 600;
      }
      if (f.x < f.pixelSize) { f.x = f.pixelSize; f.vx = Math.abs(f.vx); }
      if (f.x > tankWidth - f.pixelSize) { f.x = tankWidth - f.pixelSize; f.vx = -Math.abs(f.vx); }
      if (f.zDepth < 0.33) bgFish.push(f); else if (f.zDepth < 0.66) (midFish || fgFish).push(f); else fgFish.push(f);
      return;
    }

    // ==================================================================
    // CORYDORAS — bottom forager, air gulps, glass surfing, rest groups
    // ==================================================================
    if (fd.id === "corydoras" || fd.id === "kuhli" || fd.id === "otocinclus") {
      f.tailPhase += 0.01 + Math.abs(f.vx) * 0.03;
      if (!f.airGulping) f.airGulping = false;
      if (!f.surfTimer) f.surfTimer = 0;

      if (f.airGulping) {
        // Dash to surface for air gulp
        f.y -= f.baseSpeed * 2.5;
        f.x += Math.sin(f.wobble * 3) * 0.5; // wiggly ascent
        if (f.y < 8) {
          f.airGulping = false;
          f.vy = f.baseSpeed * 1.5; // dive back down
          f.idleTimer = 10;
        }
      } else if (f.surfTimer > 0) {
        // Glass surfing — swim up and down along wall
        f.surfTimer--;
        f.y += Math.sin(f.behaviorTimer * 0.05) * f.baseSpeed * 1.5;
        f.x += (f.x < tankWidth / 2 ? -0.05 : 0.05); // drift toward wall
        if (f.surfTimer <= 0) { f.vy = f.baseSpeed; } // drop back down
      } else if (f.idleTimer > 0) {
        // Rest — sit motionless on bottom
        f.idleTimer--;
        f.vx *= 0.95;
        f.y += (subLaneY - f.pixelSize * 0.4 - f.y) * 0.05;
      } else {
        // Normal bottom foraging
        f.x += f.vx;
        f.y += (subLaneY - f.pixelSize * 0.4 - f.y) * 0.03;
        f.vx += (Math.random() - 0.5) * 0.004;
        f.vx = Math.max(-f.baseSpeed * _fb, Math.min(f.baseSpeed * _fb, f.vx));
        // Nose-dig animation (speed wobble)
        f.tailPhase += Math.abs(f.vx) * 0.05;
        // Air gulp (corydoras surface breathe)
        if (fd.id === "corydoras" && Math.random() < 0.0003) f.airGulping = true;
        // Glass surfing (normal cory behavior)
        if (Math.random() < 0.0004) f.surfTimer = 80 + Math.random() * 120;
        // Rest period
        if (Math.random() < 0.003) f.idleTimer = 60 + Math.random() * 200;
      }
      if (f.vy) { f.y += f.vy; f.vy *= 0.97; if (Math.abs(f.vy) < 0.01) f.vy = 0; }
      if (f.x < f.pixelSize) { f.x = f.pixelSize; f.vx = Math.abs(f.vx); }
      if (f.x > tankWidth - f.pixelSize) { f.x = tankWidth - f.pixelSize; f.vx = -Math.abs(f.vx); }
      if (f.y > subLaneY - f.pixelSize * 0.3) f.y = subLaneY - f.pixelSize * 0.3;
      if (f.y < 5) f.y = 5;
      if (f.zDepth < 0.33) bgFish.push(f); else if (f.zDepth < 0.66) (midFish || fgFish).push(f); else fgFish.push(f);
      return;
    }

    // ==================================================================
    // ANGELFISH / DISCUS — slow majestic gliders
    // ==================================================================
    if (fd.id === "angelfish" || fd.id === "discus") {
      const isDiscus = fd.id === "discus";
      f.tailPhase += 0.006 + Math.abs(f.vx) * 0.015;
      if (f.idleTimer > 0) {
        f.idleTimer--;
        f.vx *= 0.98; f.vy *= 0.98;
        f.y += Math.sin(f.wobble) * 0.02;
      } else {
        f.x += f.vx;
        f.y += f.vy + Math.sin(f.wobble) * 0.015;
        f.vx += (Math.random() - 0.5) * (isDiscus ? 0.002 : 0.003);
        f.vy += (Math.random() - 0.5) * 0.001;
        f.vx = Math.max(-f.baseSpeed * 0.6 * _fb, Math.min(f.baseSpeed * 0.6 * _fb, f.vx));
        f.vy = Math.max(-f.baseSpeed * 0.3 * _fb, Math.min(f.baseSpeed * 0.3 * _fb, f.vy));
        // Long pauses
        if (Math.random() < (isDiscus ? 0.005 : 0.003)) f.idleTimer = 80 + Math.random() * 200;
        // Angelfish occasional dart
        if (!isDiscus && Math.random() < 0.001) {
          f.vx = (Math.random() > 0.5 ? 1 : -1) * f.baseSpeed * 1.1;
          f.dartTimer = 10;
        }
      }
      if (f.dartTimer > 0) { f.dartTimer--; f.x += f.vx * 1.3; }
      // Prefer mid-water
      f.vy += (tankHeight * (isDiscus ? 0.4 : 0.35) - f.y) * 0.0003;
      if (f.x < f.pixelSize) { f.x = f.pixelSize; f.vx = Math.abs(f.vx) * 0.3; }
      if (f.x > tankWidth - f.pixelSize) { f.x = tankWidth - f.pixelSize; f.vx = -Math.abs(f.vx) * 0.3; }
      if (f.y < 15) f.vy = Math.abs(f.vy) * 0.3 + 0.02;
      if (f.y > subLaneY - f.pixelSize) f.vy = -Math.abs(f.vy) * 0.3;
      if (f.zDepth < 0.33) bgFish.push(f); else if (f.zDepth < 0.66) (midFish || fgFish).push(f); else fgFish.push(f);
      return;
    }

    // ==================================================================
    // GOURAMIS — surface dwellers, slow with feeler probe animation
    // ==================================================================
    if (fd.group === "Gouramis & Bettas" && fd.id !== "betta") {
      f.tailPhase += 0.008 + Math.abs(f.vx) * 0.02;
      if (f.idleTimer > 0) {
        f.idleTimer--;
        f.vx *= 0.97;
        f.y += Math.sin(f.wobble * 2) * 0.03;
      } else {
        f.x += f.vx;
        f.y += f.vy + Math.sin(f.wobble) * 0.02;
        f.vx += (Math.random() - 0.5) * 0.003;
        f.vy += (Math.random() - 0.5) * 0.001;
        f.vx = Math.max(-f.baseSpeed * 0.7 * _fb, Math.min(f.baseSpeed * 0.7 * _fb, f.vx));
        f.vy = Math.max(-f.baseSpeed * 0.3 * _fb, Math.min(f.baseSpeed * 0.3 * _fb, f.vy));
        if (Math.random() < 0.004) f.idleTimer = 50 + Math.random() * 120;
      }
      // Surface preference
      f.vy += (tankHeight * 0.15 - f.y) * 0.0003;
      if (f.x < f.pixelSize) { f.x = f.pixelSize; f.vx = Math.abs(f.vx) * 0.4; }
      if (f.x > tankWidth - f.pixelSize) { f.x = tankWidth - f.pixelSize; f.vx = -Math.abs(f.vx) * 0.4; }
      if (f.y < 8) f.vy = Math.abs(f.vy) * 0.3 + 0.02;
      if (f.y > subLaneY - f.pixelSize) f.vy = -Math.abs(f.vy) * 0.3;
      if (f.zDepth < 0.33) bgFish.push(f); else if (f.zDepth < 0.66) (midFish || fgFish).push(f); else fgFish.push(f);
      return;
    }

    // ==================================================================
    // SEA BREAM / SCAT — large slow cruisers with majestic gliding
    // ==================================================================
    if (fd.bodyShape === "bream" || fd.bodyShape === "scat") {
      f.tailPhase += 0.005 + Math.abs(f.vx) * 0.01;
      if (!f._cruiseWp) {
        f._cruiseWp = { x: Math.random() * tankWidth, y: tankHeight * (0.25 + Math.random() * 0.35) };
        f._cruiseTimer = 0;
      }
      if (!f._glidePhase) f._glidePhase = Math.random() * Math.PI * 2;
      f._glidePhase += 0.008;

      const feedBoost = f._feedingBoost || 0;

      if (f.idleTimer > 0 && feedBoost < 0.5) {
        // Majestic hovering pause — but skip if feeding
        f.idleTimer--;
        f.vx *= 0.985;
        f.vy *= 0.985;
        f.y += Math.sin(f._glidePhase) * 0.04;
        f.x += f.vx * 0.3;
      } else {
        // Smooth cruising toward waypoint
        f._cruiseTimer++;
        const dx = f._cruiseWp.x - f.x;
        const dy = f._cruiseWp.y - f.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 25 || f._cruiseTimer > 800) {
          f._cruiseWp = { x: f.pixelSize * 3 + Math.random() * (tankWidth - f.pixelSize * 6), y: tankHeight * (0.2 + Math.random() * 0.4) };
          f._cruiseTimer = 0;
          if (Math.random() < 0.35 && feedBoost < 0.3) f.idleTimer = 80 + Math.random() * 200;
        }

        if (dist > 1) {
          const steer = feedBoost > 0.5 ? 0.001 : 0.0004; // steer faster when chasing food
          f.vx += (dx / dist) * steer;
          f.vy += (dy / dist) * steer * (feedBoost > 0.5 ? 0.8 : 0.5);
        }

        f.y += Math.sin(f._glidePhase) * 0.025;
        f.x += f.vx;
        f.y += f.vy;

        // Occasional power stroke
        if (Math.random() < 0.003) {
          const speed = Math.sqrt(f.vx * f.vx + f.vy * f.vy) + 0.001;
          f.vx += (f.vx / speed) * f.baseSpeed * 0.3;
          f.tailPhase += 0.08;
        }

        // Scat schooling pull
        if (fd.bodyShape === "scat" && fd.schooling && schoolCenters[fd.id]) {
          const sc = schoolCenters[fd.id];
          if (sc.count > 1) {
            const sdist = Math.sqrt((sc.x - f.x) ** 2 + (sc.y - f.y) ** 2);
            if (sdist > 40) {
              f.vx += (sc.x - f.x) * 0.0003;
              f.vy += (sc.y - f.y) * 0.0002;
            }
          }
        }
      }

      // Speed limits — boosted during feeding
      const hmv = f.baseSpeed * (0.7 + feedBoost * 0.8);
      f.vx = Math.max(-hmv, Math.min(hmv, f.vx));
      f.vy = Math.max(-hmv * (feedBoost > 0.5 ? 0.6 : 0.35), Math.min(hmv * (feedBoost > 0.5 ? 0.6 : 0.35), f.vy));
      f.vx *= 0.997;
      f.vy *= 0.994;

      // Bounds — allow reaching surface when feeding
      const hm = f.pixelSize * 1.5;
      if (f.x < hm) { f.x = hm; f.vx = Math.abs(f.vx) * 0.2 + 0.01; }
      if (f.x > tankWidth - hm) { f.x = tankWidth - hm; f.vx = -Math.abs(f.vx) * 0.2 - 0.01; }
      if (f.y < f.pixelSize * 0.5) { f.y = f.pixelSize * 0.5; f.vy = Math.abs(f.vy) * 0.15 + 0.005; }
      if (f.y > subLaneY - f.pixelSize) { f.y = subLaneY - f.pixelSize; f.vy = -Math.abs(f.vy) * 0.15 - 0.005; }

      if (f.zDepth < 0.33) bgFish.push(f); else if (f.zDepth < 0.66) (midFish || fgFish).push(f); else fgFish.push(f);
      return;
    }

    // ==================================================================
    // DEFAULT FISH — waypoint navigation, burst-glide, proper boids
    // ==================================================================

    // --- INITIALIZE MOVEMENT STATE ---
    if (f._wp === undefined) {
      // Waypoint target — fish swims toward this, then picks a new one
      f._wp = _pickWaypoint(f, tankWidth, tankHeight, subH, fd);
      f._wpTimer = 0;
      // Burst-glide: thrust is the current propulsion force (decays over time)
      f._thrust = 0.5;
      f._thrustDecay = 0.993 + Math.random() * 0.004; // how fast thrust fades
      f._nextBurst = 40 + Math.random() * 80; // frames until next tail burst
      f._burstCounter = 0;
      // Smooth visual direction (for flip animation)
      if (f._visualDir === undefined) f._visualDir = f.vx >= 0 ? 1 : -1;
      if (f._flipProgress === undefined) f._flipProgress = 1; // 1 = fully settled
      if (f._flipPause === undefined) f._flipPause = 0;
    }

    const swimSpeed = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
    f.tailPhase += 0.008 + swimSpeed * 0.025 + f._thrust * 0.03;

    if (f.idleTimer > 0) {
      // --- IDLE: hovering in place with gentle drift ---
      f.idleTimer--;
      f.vx *= 0.97; f.vy *= 0.96;
      f.y += Math.sin(f.wobble) * f.wobbleAmp * 0.5;
      f._thrust *= 0.98;
    } else if (f.dartTimer > 0) {
      // --- DART: quick burst (flee/chase) ---
      f.dartTimer--;
      f.x += f.vx * 1.4;
      f.y += f.vy + Math.sin(f.wobble) * 0.03;
      f._thrust = 1.0;
    } else {
      // --- WAYPOINT NAVIGATION ---
      f._wpTimer++;
      const wpDx = f._wp.x - f.x;
      const wpDy = f._wp.y - f.y;
      const wpDist = Math.sqrt(wpDx * wpDx + wpDy * wpDy);

      // Arrived at waypoint or stuck too long? Pick new one
      if (wpDist < 15 || f._wpTimer > 600) {
        f._wp = _pickWaypoint(f, tankWidth, tankHeight, subH, fd);
        f._wpTimer = 0;
        // Small chance to idle at arrival
        if (Math.random() < 0.25) {
          f.idleTimer = 40 + Math.random() * 120;
        }
      }

      // Steering force toward waypoint (smooth curved path)
      if (wpDist > 1) {
        const steerX = (wpDx / wpDist);
        const steerY = (wpDy / wpDist);
        // Steering strength scales with distance — gentle curves, not sharp turns
        const steerForce = Math.min(0.0008, 0.04 / wpDist);
        f.vx += steerX * steerForce * (0.5 + f._thrust * 0.5);
        f.vy += steerY * steerForce * (0.5 + f._thrust * 0.5) * 0.6;
      }

      // --- BURST-GLIDE LOCOMOTION ---
      f._burstCounter++;
      if (f._burstCounter >= f._nextBurst) {
        // Tail flick burst — sudden acceleration
        f._thrust = 0.6 + Math.random() * 0.4;
        f._burstCounter = 0;
        f._nextBurst = 50 + Math.random() * 120;
        // Boost velocity in current heading
        const speed = Math.sqrt(f.vx * f.vx + f.vy * f.vy) + 0.001;
        f.vx += (f.vx / speed) * f.baseSpeed * 0.4 * f._thrust;
        f.vy += (f.vy / speed) * f.baseSpeed * 0.15 * f._thrust;
      }
      // Thrust decays — fish coasts between bursts
      f._thrust *= f._thrustDecay;
      if (f._thrust < 0.05) f._thrust = 0.05;

      // Apply velocity
      f.x += f.vx;
      f.y += f.vy + Math.sin(f.wobble) * f.wobbleAmp * (1 - f._thrust * 0.5);

      // Light random perturbation for organic feel
      f.vx += (Math.random() - 0.5) * 0.001;
      f.vy += (Math.random() - 0.5) * 0.0005;

      // --- PROPER BOIDS SCHOOLING ---
      // Full Reynolds boids with: field-of-view, separation, alignment,
      // cohesion, speed matching, wall avoidance, predator tightening,
      // leader-triggered turns, and species-specific school shapes.
      if (fd.schooling && schoolCenters[fd.id] && schoolCenters[fd.id].count > 1) {
        // Initialize per-fish school state
        if (f._schoolRole === undefined) {
          f._schoolRole = Math.random(); // 0-1: low = follower, high = leader tendency
        }

        // Species-specific parameters
        const speciesParams = _getSchoolParams(fd.id);
        const sepRadius = speciesParams.sepRadius + f.pixelSize;
        const alignRadius = speciesParams.alignRadius;
        const cohRadius = speciesParams.cohRadius;
        const sepWeight = speciesParams.sepWeight;
        const alignWeight = speciesParams.alignWeight;
        const cohWeight = speciesParams.cohWeight;

        // Predator proximity tightens the school
        let threatLevel = 0;
        for (let ti = 0; ti < fishArr.length; ti++) {
          const t = fishArr[ti];
          if (t.data.id === fd.id || t.hiding) continue;
          if (!t.data.peaceful || t.data.id === "angelfish" || t.data.id === "oscar") {
            const tdx = f.x - t.x;
            const tdy = f.y - t.y;
            const tDist = Math.sqrt(tdx * tdx + tdy * tdy);
            if (tDist < 100) {
              threatLevel = Math.max(threatLevel, 1 - tDist / 100);
            }
          }
        }
        // Under threat: tighten radii, increase cohesion
        const threatCoh = 1 + threatLevel * 3;  // up to 4x cohesion under threat
        const threatSep = 1 - threatLevel * 0.5; // halved separation (pack tighter)

        // Fish heading for field-of-view check
        const myHeading = Math.atan2(f.vy, f.vx);

        let sepX = 0, sepY = 0, sepCount = 0;
        let alignVx = 0, alignVy = 0, alignSpeed = 0, alignCount = 0;
        let cohX = 0, cohY = 0, cohCount = 0;
        let leaderX = f.x, leaderVx = f.vx; // track frontmost fish

        for (let si = 0; si < fishArr.length; si++) {
          const other = fishArr[si];
          if (other === f || other.data.id !== fd.id || other.hiding) continue;
          const dx = f.x - other.x;
          const dy = f.y - other.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 1) continue;
          const dist = Math.sqrt(distSq);

          // ---- FIELD OF VIEW CHECK ----
          // Fish can see ~270° (blind spot directly behind)
          // Skip neighbors in the blind 90° cone behind this fish
          if (dist > sepRadius) { // always react to very close fish regardless of FOV
            const angleToOther = Math.atan2(-dy, -dx); // direction toward other
            let angleDiff = angleToOther - myHeading;
            // Normalize to [-PI, PI]
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            if (Math.abs(angleDiff) > Math.PI * 0.75) continue; // behind us, skip
          }

          // Separation — inverse-square falloff for strong close repulsion
          if (dist < sepRadius) {
            const force = (sepRadius - dist) / sepRadius;
            sepX += (dx / dist) * force * force; // squared for stronger close repulsion
            sepY += (dy / dist) * force * force;
            sepCount++;
          }
          // Alignment — match heading AND speed
          if (dist < alignRadius) {
            alignVx += other.vx;
            alignVy += other.vy;
            alignSpeed += Math.sqrt(other.vx * other.vx + other.vy * other.vy);
            alignCount++;
          }
          // Cohesion — local neighbor average (not global center)
          if (dist < cohRadius) {
            cohX += other.x;
            cohY += other.y;
            cohCount++;
          }

          // Track the frontmost fish in swim direction (potential leader)
          const otherForward = other.x * Math.sign(f.vx || 1);
          const leaderForward = leaderX * Math.sign(f.vx || 1);
          if (otherForward > leaderForward) {
            leaderX = other.x;
            leaderVx = other.vx;
          }
        }

        const basePull = SCHOOL_PULL[fd.id] || SCHOOL_PULL.default;

        // --- Apply separation (strongest — fish hate overlapping) ---
        if (sepCount > 0) {
          f.vx += sepX * basePull * sepWeight * threatSep;
          f.vy += sepY * basePull * sepWeight * threatSep * 0.6;
        }

        // --- Apply alignment (match neighbors' heading + speed) ---
        if (alignCount > 0) {
          alignVx /= alignCount;
          alignVy /= alignCount;
          alignSpeed /= alignCount;
          // Heading alignment
          f.vx += (alignVx - f.vx) * basePull * alignWeight;
          f.vy += (alignVy - f.vy) * basePull * alignWeight * 0.6;
          // Speed matching — converge to group average speed
          const mySpeed = Math.sqrt(f.vx * f.vx + f.vy * f.vy) + 0.001;
          const speedDiff = alignSpeed - mySpeed;
          f.vx += (f.vx / mySpeed) * speedDiff * basePull * 0.8;
          f.vy += (f.vy / mySpeed) * speedDiff * basePull * 0.4;
        }

        // --- Apply cohesion (steer toward local neighbor center) ---
        if (cohCount > 0) {
          cohX /= cohCount;
          cohY /= cohCount;
          const cohDist = Math.sqrt((cohX - f.x) ** 2 + (cohY - f.y) ** 2);
          // Only pull when not already close — prevents oscillation
          if (cohDist > speciesParams.comfortDist) {
            const cohForce = Math.min(1, (cohDist - speciesParams.comfortDist) / 60);
            f.vx += (cohX - f.x) * basePull * cohWeight * cohForce * threatCoh;
            f.vy += (cohY - f.y) * basePull * cohWeight * cohForce * threatCoh * 0.5;
          }
        }

        // --- Wall avoidance for the school (soft steering before hitting walls) ---
        const wallMargin = 40 + f.pixelSize;
        if (f.x < wallMargin) f.vx += (wallMargin - f.x) * 0.001;
        if (f.x > tankWidth - wallMargin) f.vx -= (f.x - (tankWidth - wallMargin)) * 0.001;
        if (f.y < wallMargin * 0.5) f.vy += (wallMargin * 0.5 - f.y) * 0.001;
        if (f.y > tankHeight - subH - wallMargin) f.vy -= (f.y - (tankHeight - subH - wallMargin)) * 0.001;

        // --- Leader-triggered turns ---
        // When the frontmost fish turns (hits wall or random), followers adjust waypoints
        if (f._schoolRole > 0.85 && Math.random() < 0.0004) {
          // This fish is a leader — pick a new destination for the school
          const newWp = _pickWaypoint(f, tankWidth, tankHeight, subH, fd);
          fishArr.forEach(ff => {
            if (ff.data.id === fd.id && ff._wp) {
              // Followers get offset positions to maintain formation shape
              const offset = speciesParams.formation === "column"
                ? { x: (Math.random() - 0.5) * 15, y: (Math.random() - 0.5) * 8 }
                : { x: (Math.random() - 0.5) * 50, y: (Math.random() - 0.5) * 30 };
              ff._wp = { x: newWp.x + offset.x, y: newWp.y + offset.y };
              ff._wpTimer = 0;
            }
          });
        }

        // --- Coordinated school turn (rarer, whole school pivots) ---
        if (Math.random() < 0.00015) {
          const newWp = _pickWaypoint(f, tankWidth, tankHeight, subH, fd);
          fishArr.forEach(ff => {
            if (ff.data.id === fd.id && ff._wp) {
              const offset = speciesParams.formation === "column"
                ? { x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 6 }
                : { x: (Math.random() - 0.5) * 40, y: (Math.random() - 0.5) * 25 };
              ff._wp = { x: newWp.x + offset.x, y: newWp.y + offset.y };
              ff._wpTimer = 0;
            }
          });
        }
      }

      // Idle/dart behaviors — modulated by activity cycle
      // During calm phases, fish idle more often and for longer
      const baseIdleChance = fd.size === "large" ? 0.003 : fd.level === "bottom" ? 0.002 : 0.0015;
      const idleChance = baseIdleChance * (1.5 - fishActivity); // 50% more idle at low activity
      if (Math.random() < idleChance) {
        const idleDuration = (60 + Math.random() * 180) * (1.3 - fishActivity * 0.6); // longer idles when calm
        f.idleTimer = Math.floor(idleDuration);
      }
      // Darts are more likely during active phases
      if (fd.size === "tiny" && Math.random() < 0.001 * (0.5 + fishActivity)) {
        f.dartTimer = 6 + Math.random() * 8;
        f.vx = (Math.random() > 0.5 ? 1 : -1) * f.baseSpeed * 1.2 * speedMod;
        f.vy = (Math.random() - 0.5) * 0.05;
      }
    }

    // --- SMOOTH DIRECTION FLIP ---
    // Instead of instant flip, fish decelerates → brief pause → flips → accelerates
    const intendedDir = f.vx >= 0 ? 1 : -1;
    if (intendedDir !== f._visualDir && f._flipPause <= 0) {
      // Velocity has crossed zero — start the flip pause
      f._flipPause = 6 + Math.floor(Math.random() * 6); // ~6-12 frames pause
      f._flipProgress = 0;
    }
    if (f._flipPause > 0) {
      f._flipPause--;
      // Slow down during flip
      f.vx *= 0.92;
      if (f._flipPause <= 0) {
        // Execute the visual flip
        f._visualDir = intendedDir;
        f._flipProgress = 0;
      }
    }
    // Settle the flip progress (for any squash/stretch animation later)
    if (f._flipProgress < 1) f._flipProgress = Math.min(1, f._flipProgress + 0.12);

    // --- Wall bounce ---
    const margin = f.pixelSize * 1.2;
    if (f.x < margin) { f.x = margin; f.vx = Math.abs(f.vx) * 0.3 + 0.02; }
    if (f.x > tankWidth - margin) { f.x = tankWidth - margin; f.vx = -Math.abs(f.vx) * 0.3 - 0.02; }
    if (f.y < 12) { f.y = 12; f.vy = Math.abs(f.vy) * 0.2 + 0.01; }
    if (f.y > subLaneY - f.pixelSize) { f.y = subLaneY - f.pixelSize; f.vy = -Math.abs(f.vy) * 0.2 - 0.01; }

    // Speed limits — modulated by activity cycle and feeding boost
    const feedBoost = f._feedingBoost || 0;
    const mv = f.baseSpeed * speedMod * (1 + feedBoost);
    f.vx = Math.max(-mv, Math.min(mv, f.vx));
    f.vy = Math.max(-mv * (feedBoost > 0.5 ? 0.7 : 0.4), Math.min(mv * (feedBoost > 0.5 ? 0.7 : 0.4), f.vy));
    // Extra calm-phase friction
    f.vx *= calmFriction;
    f.vy *= calmFriction;

    // Level preference pull — gentle, to allow vertical spread
    const prefY = fd.level === "top" ? tankHeight * 0.15
      : fd.level === "bottom" ? subLaneY - tankHeight * 0.12
      : tankHeight * 0.4;
    f.vy += (prefY - f.y) * 0.00015;

    if (f.zDepth < 0.33) bgFish.push(f); else if (f.zDepth < 0.66) (midFish || fgFish).push(f); else fgFish.push(f);
  });

  // ====================================================================
  // ANTI-CLUSTERING — lightweight spatial repulsion every 5th frame
  // Prevents fish from piling up into dense clusters over time.
  // ====================================================================
  if (!simulateFish._antiClusterTick) simulateFish._antiClusterTick = 0;
  simulateFish._antiClusterTick++;
  if (simulateFish._antiClusterTick % 5 === 0) {
    const repelRadius = 25; // pixels — fish within this range push each other apart
    const repelStrength = 0.012;
    for (let i = 0; i < fishArr.length; i++) {
      const a = fishArr[i];
      if (a.hiding || a.data.bodyShape === "snail" || a.data.bodyShape === "lobster") continue;
      let crowdX = 0, crowdY = 0, neighbors = 0;
      for (let j = i + 1; j < fishArr.length; j++) {
        const b = fishArr[j];
        if (b.hiding) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < repelRadius * repelRadius && distSq > 1) {
          const dist = Math.sqrt(distSq);
          const force = (repelRadius - dist) / repelRadius * repelStrength;
          const nx = dx / dist * force;
          const ny = dy / dist * force;
          a.vx += nx;
          a.vy += ny * 0.5;
          b.vx -= nx;
          b.vy -= ny * 0.5;
          neighbors++;
        }
      }
      // Extra scatter kick when too many neighbors cluster together
      if (neighbors > 3) {
        a.vx += (Math.random() - 0.5) * 0.04;
        a.vy += (Math.random() - 0.5) * 0.02;
      }
    }
  }

  // ====================================================================
  // INTERACTIONS — processed on ~5% of frames to keep 60fps smooth
  // Each interaction sets velocity nudges that play out over many frames.
  // ====================================================================
  if (!simulateFish._tick) simulateFish._tick = 0;
  simulateFish._tick++;
  if (simulateFish._tick % 20 !== 0) return; // only every 20th frame (~3x/sec)

  const PLANT_TYPES = ["anubias","val","carpet","moss","sword","crypto","frogbit","bucep","rotala","monte","ludwigia","hornwort","javafern","dwarfsag","wisteria","lotus","salvinia","elodea","staurogyne","pogostemon"];
  const HIDE_TYPES = ["cave","coconut","castle","ship","skull","terracotta","stump","arch","bridge"];

  // Build spatial lookup for decorations
  const plantDecs = expandedDecs.filter(d => PLANT_TYPES.includes(d.drawType));
  const hideDecs = expandedDecs.filter(d => HIDE_TYPES.includes(d.drawType));
  const rockDecs = expandedDecs.filter(d => ["rock","rock2","driftwood","slate","reef_rock","branch","bonsai","bamboo"].includes(d.drawType));
  const allHardscape = [...hideDecs, ...rockDecs];

  fishArr.forEach(f => {
    const fd = f.data;
    if (f.hiding) return; // skip hidden fish

    // --- FISH ↔ PLANT interactions ---
    for (let pi = 0; pi < plantDecs.length; pi++) {
      const p = plantDecs[pi];
      const dx = f.x - p.px;
      const dy = f.y - (p.py || (tankHeight - subH));
      const dist = Math.sqrt(dx * dx + dy * dy);
      const nearRange = f.pixelSize * 3 + (p.scale || 1) * 15;

      if (dist < nearRange) {
        // Shrimp graze on plants
        if (fd.bodyShape === "shrimp" && !fd.behavior?.includes("filter") && Math.random() < 0.3) {
          f.vx += (p.px - f.x) * 0.005; // drift toward plant
          f.idleTimer = Math.max(f.idleTimer || 0, 30 + Math.random() * 50); // pause to graze
        }
        // Snails munch on plants slowly
        else if (fd.bodyShape === "snail" && Math.random() < 0.2) {
          f.vx += (p.px - f.x) * 0.002;
          f.idleTimer = Math.max(f.idleTimer || 0, 80 + Math.random() * 120);
        }
        // Small fish hide among dense plants
        else if (fd.size === "tiny" && fd.peaceful && Math.random() < 0.1) {
          f.vx *= 0.7; // slow down in plant cover
          f.vy *= 0.7;
        }
        // Otocinclus graze on plant leaves
        else if (fd.id === "otocinclus" && Math.random() < 0.25) {
          f.vx += (p.px - f.x) * 0.008;
          f.idleTimer = Math.max(f.idleTimer || 0, 50 + Math.random() * 100);
        }
        break; // one plant interaction per tick
      }
    }

    // --- FISH ↔ HARDSCAPE/HIDE interactions ---
    for (let hi = 0; hi < allHardscape.length; hi++) {
      const h = allHardscape[hi];
      const dx = f.x - h.px;
      const dy = f.y - (h.py || (tankHeight - subH));
      const dist = Math.sqrt(dx * dx + dy * dy);
      const nearRange = f.pixelSize * 2.5 + (h.scale || 1) * 20;

      if (dist < nearRange) {
        // Plecos suction onto hardscape
        if ((fd.id === "pleco" || fd.id === "siamese_ae") && Math.random() < 0.3) {
          f.vx += (h.px - f.x) * 0.006;
          f.idleTimer = Math.max(f.idleTimer || 0, 200 + Math.random() * 400);
        }
        // Corydoras forage around rocks/wood
        else if ((fd.id === "corydoras" || fd.id === "kuhli") && Math.random() < 0.2) {
          const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.5;
          f.vx = Math.cos(angle) * f.baseSpeed * 0.6;
          f.vy = Math.sin(angle) * f.baseSpeed * 0.3;
        }
        // Lobsters claim territory near caves
        else if (fd.bodyShape === "lobster" && HIDE_TYPES.includes(h.drawType) && Math.random() < 0.2) {
          f.vx += (h.px - f.x) * 0.004;
          if (Math.abs(f.x - h.px) < 10) {
            f.hiding = true;
            f.hideTimer = 60 + Math.random() * 150;
          }
        }
        // Puffers inspect decorations (curious)
        else if (fd.bodyShape === "puffer" && Math.random() < 0.15) {
          f.vx += (h.px - f.x) * 0.006;
          f.vy += ((h.py || tankHeight - subH) - f.y) * 0.003;
          f.idleTimer = Math.max(f.idleTimer || 0, 20 + Math.random() * 40);
        }
        // Shy fish shelter near hides
        else if (fd.id === "ram" || fd.id === "apisto" || fd.id === "kribensis") {
          if (HIDE_TYPES.includes(h.drawType) && Math.random() < 0.1) {
            f.vx += (h.px - f.x) * 0.003;
          }
        }
        break; // one hardscape interaction per tick
      }
    }

    // --- FISH ↔ FISH interactions (predator avoidance, chasing, etc.) ---
    for (let j = 0; j < fishArr.length; j++) {
      const other = fishArr[j];
      if (other === f || other.hiding) continue;
      const od = other.data;

      const dx = f.x - other.x;
      const dy = f.y - other.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const interactRange = f.pixelSize + other.pixelSize + 15;

      if (dist > interactRange) continue;
      if (dist < 1) continue; // avoid division by zero
      const nx = dx / dist;
      const ny = dy / dist;

      // Tiny fish flee from predators/aggressive fish
      if (fd.size === "tiny" && fd.peaceful && !od.peaceful && od.size !== "tiny") {
        if (Math.random() < 0.15) {
          f.vx += nx * 0.05;
          f.vy += ny * 0.03;
          f.dartTimer = Math.max(f.dartTimer || 0, 8);
        }
        continue;
      }

      // Betta flares at colorful fish / gouramis nearby
      if (fd.id === "betta" && (od.finStyle === "fantail" || od.group === "Gouramis & Bettas")) {
        if (Math.random() < 0.1) {
          f.flareTimer = Math.max(f.flareTimer || 0, 30 + Math.random() * 40);
          f.vx += (other.x - f.x) * 0.002; // approach to display
        }
        continue;
      }

      // Angelfish chase tiny fish occasionally
      if (fd.id === "angelfish" && od.size === "tiny" && Math.random() < 0.05) {
        f.vx += (other.x - f.x) * 0.004;
        f.vy += (other.y - f.y) * 0.002;
        f.dartTimer = Math.max(f.dartTimer || 0, 6);
        continue;
      }

      // Oscar menaces smaller fish
      if (fd.id === "oscar" && (od.size === "tiny" || od.size === "small") && Math.random() < 0.08) {
        f.vx += (other.x - f.x) * 0.005;
        f.vy += (other.y - f.y) * 0.003;
        // Target flees
        other.vx += nx * 0.06;
        other.vy += ny * 0.03;
        other.dartTimer = Math.max(other.dartTimer || 0, 10);
        continue;
      }

      // Shrimp scatter from nearby fish
      if (fd.bodyShape === "shrimp" && od.bodyShape !== "shrimp" && od.bodyShape !== "snail" && od.size !== "tiny") {
        if (Math.random() < 0.08) {
          f.vx += nx * 0.04;
          f.dartTimer = Math.max(f.dartTimer || 0, 5);
        }
        continue;
      }

      // Corydoras group together when resting
      if ((fd.id === "corydoras" || fd.id === "kuhli") && od.id === fd.id) {
        if (f.idleTimer > 0 && other.idleTimer > 0 && Math.random() < 0.2) {
          // Pull toward resting buddy
          f.vx += (other.x - f.x) * 0.002;
        }
        continue;
      }

      // Damselfish chase peaceful reef fish
      if (fd.id === "damsel" && od.peaceful && od.water === "salt" && Math.random() < 0.06) {
        f.vx += (other.x - f.x) * 0.004;
        other.vx += nx * 0.04;
        other.vy += ny * 0.02;
        continue;
      }

      // Puffer investigates everything
      if (fd.bodyShape === "puffer" && Math.random() < 0.04) {
        f.vx += (other.x - f.x) * 0.003;
        f.vy += (other.y - f.y) * 0.002;
        f.idleTimer = Math.max(f.idleTimer || 0, 15);
        continue;
      }

      // ---- SOCIAL AWARENESS — curiosity, yielding, following ----

      // CURIOSITY: fish briefly investigate new/different species nearby
      // (only peaceful fish do this — aggressive ones chase instead)
      if (fd.peaceful && od.id !== fd.id && !od.peaceful !== true
          && dist < interactRange * 1.2 && Math.random() < 0.03) {
        // Slow approach + brief stare
        f.vx += (other.x - f.x) * 0.001;
        f.vy += (other.y - f.y) * 0.0005;
        if (Math.random() < 0.2) {
          f.idleTimer = Math.max(f.idleTimer || 0, 10 + Math.random() * 20);
        }
        continue;
      }

      // YIELDING: smaller fish give way to larger fish swimming toward them
      // (natural hierarchy — small fish don't wait for collision to move)
      const mySize = fd.size === "tiny" ? 1 : fd.size === "small" ? 2 : fd.size === "medium" ? 3 : 4;
      const otherSize = od.size === "tiny" ? 1 : od.size === "small" ? 2 : od.size === "medium" ? 3 : 4;
      if (mySize < otherSize && dist < interactRange * 1.5) {
        // Check if the bigger fish is swimming toward us
        const approachDot = -nx * other.vx + -ny * other.vy;
        if (approachDot > 0.01 && Math.random() < 0.12) {
          // Yield — drift aside perpendicular to their path
          const perpX = -ny;
          const perpY = nx;
          const side = (f.x * perpY - f.y * perpX > 0) ? 1 : -1;
          f.vx += perpX * side * 0.02;
          f.vy += perpY * side * 0.01;
          continue;
        }
      }

      // FOLLOWING: similar-sized peaceful fish sometimes swim together briefly
      // (not schooling — just casual companionship for different species)
      if (fd.peaceful && od.peaceful && fd.id !== od.id
          && mySize === otherSize && dist < interactRange * 2
          && Math.random() < 0.01) {
        // Gently match heading of the other fish
        f.vx += (other.vx - f.vx) * 0.05;
        f.vy += (other.vy - f.vy) * 0.03;
        continue;
      }

      // General collision avoidance — all fish avoid overlapping
      if (dist < f.pixelSize + other.pixelSize) {
        f.vx += nx * 0.03;
        f.vy += ny * 0.015;
      }

      break; // max one fish interaction per tick per fish
    }
  });
}
