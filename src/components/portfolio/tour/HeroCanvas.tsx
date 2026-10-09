import { Component, Suspense, useCallback, useEffect, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Vector3, type Group, type Mesh, type MeshBasicMaterial, type Object3D } from "three";
import { GlbHero } from "./GlbHero";
import { PlaceholderHero } from "./PlaceholderHero";
import { hero } from "./hero-store";

// The cable: a solid ink core with a faint, wider edge so it reads as a taut string. Black on the light
// theme; on the dark theme the site's light ink, since black would vanish into the background. Widths in px.
const CABLE_INK = { light: "#111111", dark: "#EDEDED" };
const CABLE_LAYERS = [
  { width: 5, opacity: 0.14 },
  { width: 2, opacity: 1 },
];
// How far he turns toward where he's heading (radians from facing the viewer).
const TURN = 1.05;

/**
 * Full-screen, transparent canvas over the page. An orthographic camera at zoom 1 makes one world unit one
 * CSS pixel, centred on the viewport, so screen px convert with x - w/2 and h/2 - y.
 */
export function HeroCanvas({ glb, onReady }: { glb: boolean; onReady: () => void }) {
  return (
    <Canvas
      orthographic
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 1000], zoom: 1, near: 1, far: 4000 }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <ambientLight intensity={1.3} />
      <directionalLight position={[300, 500, 800]} intensity={1.8} />
      <Rig glb={glb} onReady={onReady} />
    </Canvas>
  );
}

function Rig({ glb, onReady }: { glb: boolean; onReady: () => void }) {
  const root = useRef<Group>(null);
  const turn = useRef<Group>(null);
  const wrist = useRef<Object3D | null>(null);
  const cable = useRef<Group>(null);
  const hand = useRef(new Vector3());

  // Recolour the cable when the theme changes.
  useEffect(() => {
    const paint = () => {
      const ink = document.documentElement.classList.contains("dark")
        ? CABLE_INK.dark
        : CABLE_INK.light;
      cable.current?.children.forEach((layer) =>
        ((layer as Mesh).material as MeshBasicMaterial).color.set(ink),
      );
    };
    paint();
    const observer = new MutationObserver(paint);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const onWrist = useCallback((o: Object3D) => {
    wrist.current = o;
  }, []);

  useFrame((state, dt) => {
    const { width, height } = state.size;
    const g = root.current;
    if (!g) return;
    g.position.set(hero.x - width / 2, height / 2 - hero.y, 0);
    g.scale.setScalar(hero.height);
    // Ease the turn toward where he faces.
    const target = hero.facing * TURN;
    if (turn.current) {
      turn.current.rotation.y += (target - turn.current.rotation.y) * Math.min(1, dt * 9);
    }

    // The cable: each layer is a unit square stretched and turned to run from his wrist to the anchor.
    const c = cable.current;
    if (!c) return;
    const { on, ax, ay, grow } = hero.cable;
    if (!on || !wrist.current) {
      c.visible = false;
      return;
    }
    g.updateMatrixWorld(true);
    wrist.current.getWorldPosition(hand.current);
    const ex = hand.current.x + (ax - width / 2 - hand.current.x) * grow;
    const ey = hand.current.y + (height / 2 - ay - hand.current.y) * grow;
    const dx = ex - hand.current.x;
    const dy = ey - hand.current.y;
    c.visible = true;
    c.position.set((hand.current.x + ex) / 2, (hand.current.y + ey) / 2, 5);
    c.rotation.z = Math.atan2(dy, dx);
    c.children.forEach((layer, i) => {
      (layer as Mesh).scale.set(Math.max(Math.hypot(dx, dy), 0.001), CABLE_LAYERS[i].width, 1);
    });
  });

  return (
    <>
      <group ref={root}>
        <group ref={turn}>
          {glb ? (
            <HeroBoundary fallback={<PlaceholderHero onWrist={onWrist} onReady={onReady} />}>
              <Suspense fallback={null}>
                <GlbHero onWrist={onWrist} onReady={onReady} />
              </Suspense>
            </HeroBoundary>
          ) : (
            <PlaceholderHero onWrist={onWrist} onReady={onReady} />
          )}
        </group>
      </group>
      <group ref={cable} visible={false}>
        {CABLE_LAYERS.map((layer) => (
          <mesh key={layer.width} renderOrder={10}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              color={CABLE_INK.light}
              transparent
              opacity={layer.opacity}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

/** If hero.glb fails to load or parse, the placeholder takes over. */
class HeroBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
