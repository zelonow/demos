"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, MeshReflectorMaterial, Sparkles, useTexture, ContactShadows, Float } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Suspense, useEffect } from "react";
import * as THREE from "three";

// The gray background hex to match the generated images
const BG_COLOR = "#333333";

function ResponsiveCamera() {
  const { camera, size } = useThree();
  
  useEffect(() => {
    const isMobile = size.width < 768;
    if (isMobile) {
      camera.position.set(0, 2.5, 14);
    } else {
      camera.position.set(0, 1.5, 8);
    }
  }, [size, camera]);
  
  return null;
}

function VehiclePlate({ src, flip }: { src: string, flip?: boolean }) {
  const texture = useTexture(src);
  
  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <mesh position={[0, 1.5, 0]} scale={flip ? [-1, 1, 1] : [1, 1, 1]}>
        {/* Aspect ratio 1:1 since the generated images are square 1024x1024 */}
        <planeGeometry args={[7, 7]} />
        <meshBasicMaterial 
          map={texture} 
          transparent 
          side={THREE.DoubleSide} 
          toneMapped={false}
        />
      </mesh>
    </Float>
  );
}

export default function Hero3DCanvas({ activeImage, flip }: { activeImage: string, flip?: boolean }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, background: BG_COLOR }}>
      <Canvas camera={{ position: [0, 1.5, 8], fov: 45 }} dpr={[1, 2]}>
        <ResponsiveCamera />
        {/* Match the generated image gray background */}
        <color attach="background" args={[BG_COLOR]} />
        <fog attach="fog" args={[BG_COLOR, 5, 15]} />
        
        <Suspense fallback={null}>
          <VehiclePlate src={activeImage} flip={flip} />
          
          <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={15} blur={2.5} far={4} color="#000000" />

          {/* Reflective floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[50, 50]} />
            <MeshReflectorMaterial
              blur={[300, 100]}
              resolution={1024}
              mixBlur={1}
              mixStrength={80}
              roughness={0.8}
              depthScale={1.2}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color={BG_COLOR}
              metalness={0.5}
              mirror={0.4}
            />
          </mesh>
          
          {/* Floating glowing particles */}
          <Sparkles count={150} scale={12} size={3} speed={0.4} opacity={0.4} color="#ffffff" />
          
        </Suspense>

        {/* Allow user to pan around the "showroom" */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 2 + 0.05}
          minAzimuthAngle={-Math.PI / 6}
          maxAzimuthAngle={Math.PI / 6}
          makeDefault
        />
        
        {/* High-end cinematic post-processing */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.9} height={300} opacity={1.5} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
