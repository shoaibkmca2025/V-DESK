/**
 * Springs and momentum projection — the motion model behind gesture-driven UI.
 *
 * A spring is used instead of a fixed-duration transition because it animates from wherever the
 * value is right now and carries the velocity the finger had, so a moving element can be grabbed
 * and redirected at any moment without a jump. Parameters follow Apple's two designer-facing
 * controls rather than mass/stiffness/damping:
 *
 *   damping  1.0 settles with no overshoot (the default for UI), ~0.8 adds a little bounce and is
 *            only appropriate after a gesture that carried momentum.
 *   response seconds to reach the target — snappier as it gets smaller. Not a duration: a spring
 *            has no fixed end, the settle time falls out of the parameters.
 */

const REST_DISTANCE = 0.1;
const REST_VELOCITY = 0.1;

export function prefersReducedMotion() {
  return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * Where a flick would come to rest, using the same exponential decay as native scrolling, so a
 * small movement can produce a large, predictable result.
 */
export function project(velocity, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/**
 * Animates `from` → `to` and calls `onUpdate(value)` each frame.
 * Returns a handle: `stop()` leaves the value where it is and reports the live velocity, which is
 * what an interrupting gesture needs to continue smoothly.
 */
export function animateSpring({ from, to, velocity = 0, damping = 1, response = 0.4, onUpdate, onRest }) {
  const stiffness = (2 * Math.PI / response) ** 2;
  const dampingCoefficient = (4 * Math.PI * damping) / response;

  let value = from;
  let currentVelocity = velocity;
  let frame = null;
  let last = null;
  let stopped = false;

  if (prefersReducedMotion()) {
    onUpdate?.(to);
    onRest?.();
    return { stop: () => ({ value: to, velocity: 0 }), get velocity() { return 0; } };
  }

  const step = (now) => {
    if (stopped) return;
    const dt = Math.min((now - (last ?? now)) / 1000, 1 / 30); // clamp so a dropped frame can't explode the spring
    last = now;

    // Sub-steps keep the integration stable when a frame runs long.
    const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      const force = -stiffness * (value - to) - dampingCoefficient * currentVelocity;
      currentVelocity += force * h;
      value += currentVelocity * h;
    }

    if (Math.abs(value - to) < REST_DISTANCE && Math.abs(currentVelocity) < REST_VELOCITY) {
      value = to;
      currentVelocity = 0;
      onUpdate?.(value);
      onRest?.();
      return;
    }
    onUpdate?.(value);
    frame = requestAnimationFrame(step);
  };

  frame = requestAnimationFrame(step);

  return {
    get velocity() {
      return currentVelocity;
    },
    stop() {
      stopped = true;
      if (frame) cancelAnimationFrame(frame);
      return { value, velocity: currentVelocity };
    },
  };
}

/**
 * Progressive resistance past an edge: the further the drag goes beyond the boundary, the less the
 * element follows, so a limit reads as "there is nothing more here" rather than a frozen interface.
 */
export function rubberband(overshoot, dimension, constant = 0.55) {
  if (dimension <= 0) return 0;
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

/** Keeps the last few pointer samples so the release velocity reflects the actual flick. */
export function createVelocityTracker(sampleWindowMs = 100) {
  const samples = [];
  return {
    add(position, time = performance.now()) {
      samples.push({ position, time });
      while (samples.length > 2 && time - samples[0].time > sampleWindowMs) samples.shift();
    },
    /** Pixels per second over the recent window. */
    velocity() {
      if (samples.length < 2) return 0;
      const first = samples[0];
      const last = samples[samples.length - 1];
      const elapsed = last.time - first.time;
      if (elapsed <= 0) return 0;
      return ((last.position - first.position) / elapsed) * 1000;
    },
    reset() {
      samples.length = 0;
    },
  };
}
