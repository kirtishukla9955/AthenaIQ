import * as THREE from "three";
import { useMemo, useState, useRef } from "react";
import { createPortal, useFrame } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";

import { AzurePointsMaterial } from "./shaders/azurePointMaterial";
import { SimulationMaterial } from "./shaders/simulationMaterial";

export function AzureParticles({
  speed,
  aperture,
  focus,
  size = 512,
  noiseScale = 1.0,
  noiseIntensity = 0.5,
  timeScale = 0.5,
  pointSize = 2.0,
  opacity = 1.0,
  planeScale = 1.0,
  ...props
}: {
  speed: number;
  aperture: number;
  focus: number;
  size: number;
  noiseScale?: number;
  noiseIntensity?: number;
  timeScale?: number;
  pointSize?: number;
  opacity?: number;
  planeScale?: number;
}) {
  const revealStartTime = useRef<number | null>(null);
  const [isRevealing, setIsRevealing] = useState(true);
  const revealDuration = 3.5;

  const simulationMaterial = useMemo(() => {
    return new SimulationMaterial(planeScale);
  }, [planeScale]);

  const target = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
  });

  const azurePointsMaterial = useMemo(() => {
    const m = new AzurePointsMaterial();
    m.uniforms.positions.value = target.texture;
    m.uniforms.initialPositions.value = simulationMaterial.uniforms.positions.value;
    return m;
  }, [simulationMaterial, target.texture]);

  const [scene] = useState(() => new THREE.Scene());
  const [camera] = useState(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1)
  );
  const [positions] = useState(
    () =>
      new Float32Array([
        -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
      ])
  );
  const [uvs] = useState(
    () => new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0])
  );

  const particles = useMemo(() => {
    const length = size * size;
    const particles = new Float32Array(length * 3);
    for (let i = 0; i < length; i++) {
      const i3 = i * 3;
      particles[i3 + 0] = (i % size) / size;
      particles[i3 + 1] = i / size / size;
    }
    return particles;
  }, [size]);

  useFrame((state, delta) => {
    if (!azurePointsMaterial || !simulationMaterial) return;

    state.gl.setRenderTarget(target);
    state.gl.clear();
    // @ts-expect-error -- scene type mismatch is expected
    state.gl.render(scene, camera);
    state.gl.setRenderTarget(null);

    const currentTime = state.clock.elapsedTime;

    if (revealStartTime.current === null) {
      revealStartTime.current = currentTime;
    }

    const revealElapsed = currentTime - revealStartTime.current;
    const revealProgress = Math.min(revealElapsed / revealDuration, 1.0);
    const easedProgress = 1 - Math.pow(1 - revealProgress, 3);
    const revealFactor = easedProgress * 4.0;

    if (revealProgress >= 1.0 && isRevealing) {
      setIsRevealing(false);
    }

    azurePointsMaterial.uniforms.uTime.value = currentTime;
    azurePointsMaterial.uniforms.uFocus.value = focus;
    azurePointsMaterial.uniforms.uBlur.value = aperture;

    simulationMaterial.uniforms.uTime.value = currentTime;
    simulationMaterial.uniforms.uNoiseScale.value = noiseScale;
    simulationMaterial.uniforms.uNoiseIntensity.value = noiseIntensity;
    simulationMaterial.uniforms.uTimeScale.value = timeScale * speed;

    azurePointsMaterial.uniforms.uPointSize.value = pointSize;
    azurePointsMaterial.uniforms.uOpacity.value = opacity;
    azurePointsMaterial.uniforms.uRevealFactor.value = revealFactor;
    azurePointsMaterial.uniforms.uRevealProgress.value = easedProgress;
  });

  return (
    <>
      {createPortal(
        // @ts-expect-error -- mesh material type mismatch is expected
        <mesh material={simulationMaterial}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[positions, 3]}
            />
            <bufferAttribute attach="attributes-uv" args={[uvs, 2]} />
          </bufferGeometry>
        </mesh>,
        // @ts-expect-error -- scene type mismatch is expected
        scene
      )}
      {/* @ts-expect-error -- points material type mismatch is expected */}
      <points material={azurePointsMaterial} {...props}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles, 3]} />
        </bufferGeometry>
      </points>
    </>
  );
}
