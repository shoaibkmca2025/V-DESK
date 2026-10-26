import { describe, expect, it, vi } from 'vitest';
import { createVelocityTracker, project, rubberband } from '@/lib/spring.js';

describe('momentum projection', () => {
  it('projects further the faster the flick', () => {
    expect(project(1000)).toBeGreaterThan(project(200));
  });

  it('keeps the direction of the gesture', () => {
    expect(project(-800)).toBeLessThan(0);
    expect(project(800)).toBeGreaterThan(0);
  });

  it('goes nowhere when the finger was still', () => {
    expect(project(0)).toBe(0);
  });

  it('matches the deceleration curve native scrolling uses', () => {
    // v/1000 * d / (1 - d) with d = 0.998 → 500 px/s carries ~249.5px further on.
    expect(project(500)).toBeCloseTo(249.5, 1);
    // A snappier rate travels a shorter distance for the same flick.
    expect(project(500, 0.99)).toBeLessThan(project(500, 0.998));
  });
});

describe('rubber-banding', () => {
  it('follows less and less the further past the edge', () => {
    const small = rubberband(20, 400);
    const large = rubberband(200, 400);
    expect(small).toBeLessThan(20); // already resisting
    expect(large).toBeLessThan(200);
    expect(large / 200).toBeLessThan(small / 20); // resistance grows with distance
  });

  it('never runs away and handles a zero-size surface', () => {
    expect(rubberband(1000, 400)).toBeLessThan(400);
    expect(rubberband(50, 0)).toBe(0);
  });
});

describe('velocity tracker', () => {
  it('reports pixels per second across the recent samples', () => {
    const tracker = createVelocityTracker();
    tracker.add(0, 0);
    tracker.add(50, 50);
    tracker.add(100, 100); // 100px in 100ms
    expect(tracker.velocity()).toBeCloseTo(1000, 0);
  });

  it('reports nothing from a single sample', () => {
    const tracker = createVelocityTracker();
    tracker.add(10, 0);
    expect(tracker.velocity()).toBe(0);
  });

  it('forgets samples older than its window, so a pause means a slow release', () => {
    const tracker = createVelocityTracker(100);
    tracker.add(0, 0);
    tracker.add(300, 50); // fast early movement
    tracker.add(305, 400); // then the finger rests before lifting
    expect(Math.abs(tracker.velocity())).toBeLessThan(100);
  });

  it('starts clean after a reset', () => {
    const tracker = createVelocityTracker();
    tracker.add(0, 0);
    tracker.add(100, 50);
    tracker.reset();
    expect(tracker.velocity()).toBe(0);
  });
});

describe('spring', () => {
  it('settles at the target and reports rest', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    const { animateSpring } = await import('@/lib/spring.js');
    const values = [];
    await new Promise((resolve) => {
      animateSpring({
        from: 0,
        to: 100,
        response: 0.15,
        onUpdate: (v) => values.push(v),
        onRest: resolve,
      });
    });
    expect(values.length).toBeGreaterThan(2); // it animated rather than jumping
    expect(values.at(-1)).toBe(100);
    vi.unstubAllGlobals();
  });

  it('jumps straight to the target when the visitor asks for reduced motion', async () => {
    vi.resetModules();
    vi.stubGlobal('matchMedia', (query) => ({ matches: query.includes('reduced-motion') }));
    const { animateSpring } = await import('@/lib/spring.js');
    const values = [];
    animateSpring({ from: 0, to: 100, onUpdate: (v) => values.push(v) });
    expect(values).toEqual([100]);
    vi.unstubAllGlobals();
  });
});
