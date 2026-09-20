import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * Облако светящихся «зёрен» — абстрактная агро-визуализация.
 * Два instancedMesh (золотые + редкие зелёные), каждый со своим emissive-
 * материалом, чтобы под Bloom они по-настоящему светились цветом. Каждое
 * зерно парит и вращается по своей фазе, всё облако наклоняется за курсором.
 */
function makeSeeds(count) {
  const arr = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const radius = 2.1 + Math.pow(t, 0.7) * 3.5;
    const inclination = Math.acos(1 - 2 * t);
    const azimuth = golden * i;
    arr.push({
      base: new THREE.Vector3(
        radius * Math.sin(inclination) * Math.cos(azimuth),
        radius * Math.cos(inclination) * 0.72,
        radius * Math.sin(inclination) * Math.sin(azimuth)
      ),
      phase: Math.random() * Math.PI * 2,
      speed: 0.35 + Math.random() * 0.5,
      floatAmp: 0.12 + Math.random() * 0.3,
      scale: 0.5 + Math.random() * 0.9,
      spin: new THREE.Vector3(Math.random(), Math.random(), Math.random()),
      green: Math.random() < 0.16,
    });
  }
  return arr;
}

function useInstanced(seeds) {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const update = (time) => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      dummy.position.copy(s.base);
      dummy.position.y += Math.sin(time * s.speed + s.phase) * s.floatAmp;
      dummy.position.x += Math.cos(time * s.speed * 0.6 + s.phase) * s.floatAmp * 0.5;
      dummy.rotation.set(
        s.spin.x * time * 0.25 + s.phase,
        s.spin.y * time * 0.3,
        s.spin.z * time * 0.2
      );
      dummy.scale.setScalar(s.scale * (1 + Math.sin(time * s.speed + s.phase) * 0.06));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };
  return { ref, update };
}

function GrainCloud() {
  const groupRef = useRef();
  const seeds = useMemo(() => makeSeeds(240), []);
  const gold = useMemo(() => seeds.filter((s) => !s.green), [seeds]);
  const green = useMemo(() => seeds.filter((s) => s.green), [seeds]);
  const goldMesh = useInstanced(gold);
  const greenMesh = useInstanced(green);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    goldMesh.update(time);
    greenMesh.update(time);
    const g = groupRef.current;
    if (g) {
      const ty = state.pointer.x * 0.4;
      const tx = -state.pointer.y * 0.28;
      g.rotation.y += (ty - g.rotation.y) * 0.03 + 0.0016;
      g.rotation.x += (tx - g.rotation.x) * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={goldMesh.ref} args={[undefined, undefined, gold.length]}>
        <capsuleGeometry args={[0.13, 0.34, 6, 12]} />
        <meshStandardMaterial
          color="#5a4310"
          emissive="#f0c05a"
          emissiveIntensity={1.4}
          roughness={0.4}
          metalness={0.1}
          toneMapped={false}
        />
      </instancedMesh>
      <instancedMesh ref={greenMesh.ref} args={[undefined, undefined, green.length]}>
        <capsuleGeometry args={[0.13, 0.34, 6, 12]} />
        <meshStandardMaterial
          color="#0d3a26"
          emissive="#3ddd97"
          emissiveIntensity={1.3}
          roughness={0.4}
          metalness={0.1}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 0, 11], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#050506"]} />
      <fog attach="fog" args={["#050506", 9, 21]} />
      <ambientLight intensity={0.25} />
      <pointLight position={[6, 6, 8]} intensity={80} color="#ffd98a" />
      <pointLight position={[-8, -4, 4]} intensity={45} color="#38d69a" />
      <GrainCloud />
      <EffectComposer>
        <Bloom
          intensity={0.85}
          luminanceThreshold={0.12}
          luminanceSmoothing={0.5}
          mipmapBlur
          radius={0.72}
        />
      </EffectComposer>
    </Canvas>
  );
}
