"use client";

import { Effects } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { AzureParticles } from "./azure-particles";
import { VignetteShader } from "./shaders/vignetteShader";

export const AzureGL = () => {
  return (
    <div id="webgl">
      <Canvas
        camera={{
          position: [1.2629783123314589, 2.664606471394044, -1.8178993743288914],
          fov: 50,
          near: 0.01,
          far: 300,
        }}
      >
        <color attach="background" args={["#000"]} />
        <AzureParticles
          speed={0.8}
          aperture={1.79}
          focus={3.8}
          size={512}
          noiseScale={0.6}
          noiseIntensity={0.52}
          timeScale={0.8}
          pointSize={8.0}
          opacity={0.6}
          planeScale={10.0}
        />
        <Effects multisamping={0} disableGamma>
          <shaderPass
            args={[VignetteShader]}
            uniforms-darkness-value={1.5}
            uniforms-offset-value={0.4}
          />
        </Effects>
      </Canvas>
    </div>
  );
};
