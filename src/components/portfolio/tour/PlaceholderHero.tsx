import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshStandardMaterial, type Group, type Object3D } from "three";
import { HERO_ACTIONS, hero, type HeroAction } from "./hero-store";

/**
 * The stand-in hero until public/hero.glb exists: a jointed figure built from capsules, 1 unit tall with
 * its feet at the origin, facing +z. Each of the GLB's animation names is a procedural pose here, and the
 * poses crossfade by weight just like the real model's clips, so the tour behaves the same with either.
 */
type Pose = {
  lSx: number; // shoulders: x swings the arm (0 down, -π/2 forward, -π up), z spreads it outward
  lSz: number;
  lE: number; // elbows (negative bends the forearm forward)
  rSx: number;
  rSz: number;
  rE: number;
  lH: number; // hips (negative swings the leg forward) and knees (positive bends)
  lK: number;
  rH: number;
  rK: number;
  lean: number;
  bob: number;
  sway: number;
};

const ZERO: Pose = {
  lSx: 0,
  lSz: 0,
  lE: 0,
  rSx: 0,
  rSz: 0,
  rE: 0,
  lH: 0,
  lK: 0,
  rH: 0,
  rK: 0,
  lean: 0,
  bob: 0,
  sway: 0,
};
const KEYS = Object.keys(ZERO) as (keyof Pose)[];
// Seconds a crossfade takes.
const FADE = 0.28;

/** The held arm while hanging on the cable, and the legs dangling below. */
const dangle = (t: number) => ({
  lH: 0.08 * Math.sin(1.8 * t),
  lK: 0.12,
  rH: -0.08 * Math.sin(1.8 * t + 0.6),
  rK: 0.18,
});

function pose(action: HeroAction, t: number): Pose {
  const holding = hero.hanging
    ? { lSx: -3.05, lSz: 0.05, lE: -0.05 }
    : { lSx: 0.08, lSz: 0.14, lE: -0.12 };
  const legs = hero.hanging ? dangle(t) : { lH: 0, lK: 0.04, rH: 0, rK: 0.04 };
  switch (action) {
    case "Idle":
      return {
        ...ZERO,
        lSx: 0.06 * Math.sin(1.6 * t),
        lSz: 0.12,
        lE: -0.15,
        rSx: -0.06 * Math.sin(1.6 * t),
        rSz: -0.12,
        rE: -0.15,
        bob: 0.004 * Math.sin(2 * t),
      };
    case "Climbing": {
      const s = Math.sin(7 * t);
      return {
        ...ZERO,
        lSx: -2.7 + 0.45 * s,
        rSx: -2.7 - 0.45 * s,
        lE: -0.5 - 0.3 * s,
        rE: -0.5 + 0.3 * s,
        lSz: 0.22,
        rSz: -0.22,
        lH: -0.5 + 0.5 * s,
        lK: 0.9 - 0.4 * s,
        rH: -0.5 - 0.5 * s,
        rK: 0.9 + 0.4 * s,
        lean: 0.15,
      };
    }
    case "Jumping":
      return {
        ...ZERO,
        lSx: -2.9,
        rSx: -2.9,
        lSz: 0.2,
        rSz: -0.2,
        lE: -0.2,
        rE: -0.2,
        lH: -1.1,
        lK: 1.6,
        rH: -1.0,
        rK: 1.5,
      };
    case "FallingIdle": {
      const f = Math.sin(11 * t);
      return {
        ...ZERO,
        lSx: -2.3 + 0.2 * f,
        rSx: -2.3 - 0.2 * f,
        lSz: 0.7,
        rSz: -0.7,
        lE: -0.3,
        rE: -0.3,
        lH: -0.35 + 0.15 * f,
        lK: 0.5,
        rH: 0.15 - 0.15 * f,
        rK: 0.35,
      };
    }
    case "HangingIdle":
      return {
        ...ZERO,
        lSx: -3.05,
        lSz: 0.05,
        lE: -0.05,
        rSx: -2.75,
        rSz: -0.15,
        rE: -0.3,
        ...dangle(t),
        sway: 0.04 * Math.sin(1.6 * t),
      };
    case "Pointing": {
      // Right arm aimed at the target (aim is its elevation); a slight bob keeps him alive.
      const rSx = Math.min(-0.4, Math.max(-3, -(Math.PI / 2 + hero.aim)));
      return {
        ...ZERO,
        ...holding,
        rSx,
        rSz: -0.05,
        rE: -0.05,
        ...legs,
        bob: 0.003 * Math.sin(2.4 * t),
        sway: hero.hanging ? 0.03 * Math.sin(1.6 * t) : 0,
      };
    }
    case "Waving": {
      const w = Math.sin(9 * t);
      return {
        ...ZERO,
        ...holding,
        rSx: -2.9,
        rSz: -0.35 + 0.35 * w,
        rE: -0.6 - 0.25 * w,
        ...legs,
      };
    }
  }
}

export function PlaceholderHero({
  onWrist,
  onReady,
}: {
  onWrist: (o: Object3D) => void;
  onReady: () => void;
}) {
  const hips = useRef<Group>(null);
  const spine = useRef<Group>(null);
  const lSh = useRef<Group>(null);
  const lEl = useRef<Group>(null);
  const rSh = useRef<Group>(null);
  const rEl = useRef<Group>(null);
  const lHip = useRef<Group>(null);
  const lKn = useRef<Group>(null);
  const rHip = useRef<Group>(null);
  const rKn = useRef<Group>(null);
  const hand = useRef<Object3D>(null);
  const weights = useRef<Record<HeroAction, number>>(
    Object.fromEntries(HERO_ACTIONS.map((a) => [a, a === "Idle" ? 1 : 0])) as Record<
      HeroAction,
      number
    >,
  );

  // Ink to match the site: near-black, or near-white in dark mode.
  const material = useMemo(() => new MeshStandardMaterial({ roughness: 0.5, metalness: 0.05 }), []);
  useEffect(() => {
    const paint = () =>
      material.color.set(
        document.documentElement.classList.contains("dark") ? "#EDEDED" : "#1E1E1E",
      );
    paint();
    const observer = new MutationObserver(paint);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      observer.disconnect();
      material.dispose();
    };
  }, [material]);

  useEffect(() => {
    if (hand.current) onWrist(hand.current);
    onReady();
  }, [onWrist, onReady]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const w = weights.current;
    const k = Math.min(1, dt / FADE);
    let total = 0;
    for (const a of HERO_ACTIONS) {
      w[a] += ((a === hero.action ? 1 : 0) - w[a]) * k;
      total += w[a];
    }
    const p = { ...ZERO };
    for (const a of HERO_ACTIONS) {
      if (w[a] < 0.001) continue;
      const q = pose(a, t);
      for (const key of KEYS) p[key] += (q[key] * w[a]) / total;
    }
    if (!hips.current) return;
    hips.current.position.y = 0.5 + p.bob;
    hips.current.rotation.z = p.sway;
    spine.current!.rotation.x = p.lean;
    lSh.current!.rotation.set(p.lSx, 0, p.lSz);
    lEl.current!.rotation.x = p.lE;
    rSh.current!.rotation.set(p.rSx, 0, p.rSz);
    rEl.current!.rotation.x = p.rE;
    lHip.current!.rotation.x = p.lH;
    lKn.current!.rotation.x = p.lK;
    rHip.current!.rotation.x = p.rH;
    rKn.current!.rotation.x = p.rK;
  });

  const limb = (length: number, radius: number) => (
    <mesh position={[0, -length / 2, 0]} material={material}>
      <capsuleGeometry args={[radius, length - radius * 2, 4, 10]} />
    </mesh>
  );

  return (
    <group ref={hips} position={[0, 0.5, 0]}>
      <group ref={spine}>
        <mesh position={[0, 0.16, 0]} material={material}>
          <capsuleGeometry args={[0.034, 0.26, 4, 10]} />
        </mesh>
        <mesh position={[0, 0.425, 0]} material={material}>
          <sphereGeometry args={[0.085, 24, 16]} />
        </mesh>
        <group ref={lSh} position={[0.085, 0.3, 0]}>
          {limb(0.16, 0.022)}
          <group ref={lEl} position={[0, -0.16, 0]}>
            {limb(0.15, 0.02)}
            <object3D ref={hand} position={[0, -0.16, 0]} />
          </group>
        </group>
        <group ref={rSh} position={[-0.085, 0.3, 0]}>
          {limb(0.16, 0.022)}
          <group ref={rEl} position={[0, -0.16, 0]}>
            {limb(0.15, 0.02)}
          </group>
        </group>
      </group>
      <group ref={lHip} position={[0.05, 0, 0]}>
        {limb(0.25, 0.027)}
        <group ref={lKn} position={[0, -0.25, 0]}>
          {limb(0.25, 0.025)}
        </group>
      </group>
      <group ref={rHip} position={[-0.05, 0, 0]}>
        {limb(0.25, 0.027)}
        <group ref={rKn} position={[0, -0.25, 0]}>
          {limb(0.25, 0.025)}
        </group>
      </group>
    </group>
  );
}
