import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { Box3, LoopOnce, LoopRepeat, type AnimationAction, type Group, type Object3D } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { hero, type HeroAction } from "./hero-store";

export const HERO_GLB = "/hero.glb";
// Seconds a crossfade between clips takes.
const FADE = 0.3;
// Clips that play once and hold their last frame.
const ONCE: HeroAction[] = ["Jumping"];

/** The clip for an action: an exact name first, then a loose match ("mixamo|Hanging Idle" → HangingIdle). */
function clipFor(actions: Record<string, AnimationAction | null>, action: HeroAction) {
  if (actions[action]) return actions[action];
  const want = action.toLowerCase();
  const name = Object.keys(actions).find((n) =>
    n
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .includes(want),
  );
  return name ? actions[name] : null;
}

/**
 * The real hero: public/hero.glb, scaled to 1 unit tall with its feet at the origin. The cable attaches to
 * its left hand bone (Mixamo's "mixamorig:LeftHand", or any bone named like it).
 */
export function GlbHero({
  onWrist,
  onReady,
}: {
  onWrist: (o: Object3D) => void;
  onReady: () => void;
}) {
  const { scene, animations } = useGLTF(HERO_GLB);
  const model = useMemo(() => clone(scene), [scene]);
  const group = useRef<Group>(null);
  const { actions } = useAnimations(animations, group);
  const playing = useRef<AnimationAction | null>(null);
  const current = useRef<HeroAction | null>(null);

  const fit = useMemo(() => {
    const box = new Box3().setFromObject(model);
    const height = box.max.y - box.min.y || 1;
    return { scale: 1 / height, y: -box.min.y / height };
  }, [model]);

  useEffect(() => {
    let wrist: Object3D | null = null;
    model.traverse((o) => {
      if (!wrist && /left.?hand$/i.test(o.name.replace(/[^a-z]/gi, ""))) wrist = o;
    });
    onWrist(wrist ?? model);
    onReady();
  }, [model, onWrist, onReady]);

  // Crossfade whenever the tour changes the action.
  useFrame(() => {
    if (current.current === hero.action) return;
    current.current = hero.action;
    const next = clipFor(actions, hero.action);
    if (!next || next === playing.current) return;
    next.reset();
    next.setLoop(ONCE.includes(hero.action) ? LoopOnce : LoopRepeat, Infinity);
    next.clampWhenFinished = true;
    next.fadeIn(FADE).play();
    playing.current?.fadeOut(FADE);
    playing.current = next;
  });

  return (
    <group ref={group}>
      <primitive object={model} scale={fit.scale} position={[0, fit.y, 0]} />
    </group>
  );
}
