import React, { useEffect, useState, useRef } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useControls } from "leva";
import { Mesh, MeshStandardMaterial, Color, PointLight, Group } from "three";
import { Environment, Lightformer } from "@react-three/drei";
import { gsap } from "gsap";

interface PlatformProps {
  triggerAngelRotation: boolean;
  onAngelRotationComplete: () => void;
  platformCircleRotation: [number, number, number];
  bind: any;
}

const Platform: React.FC<PlatformProps> = ({
  triggerAngelRotation,
  onAngelRotationComplete,
  platformCircleRotation,
  bind,
}) => {
  const baseUrl =
    process.env.NODE_ENV === "production" ? process.env.PUBLIC_URL : "";

  const gltf = useLoader(GLTFLoader, `${baseUrl}/platform.gltf`);
  const platformRef = useRef<Mesh | null>(null);
  const platformCircleRef = useRef<Mesh | null>(null);
  const platformLightsRef = useRef<Mesh | null>(null);
  const heavenRef = useRef<Mesh | null>(null);
  const angelsRef = useRef<Mesh | null>(null);

  const { scale, positionX, positionY, positionZ } = useControls("Platform", {
    scale: { value: 0.15, min: 0.1, max: 0.5, step: 0.01 },
    positionX: { value: 0, min: -10, max: 10, step: 0.1 },
    positionY: { value: 0.5, min: -10, max: 10, step: 0.1 },
    positionZ: { value: -0.5, min: -10, max: 10, step: 0.1 },
  });

  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if (child instanceof Mesh) {
          switch (child.name) {
            case "platform_circle":
              platformCircleRef.current = child;
              break;
            case "platform_bottom":
              break;
            case "heaven_light":
              break;
            case "platform_":
              platformRef.current = child;
              break;
            case "platform_lights":
              // material.emissive = emissiveColor;
              // material.emissiveIntensity = 5;
              platformLightsRef.current = child;
              break;
            case "heaven":
              heavenRef.current = child;
              break;
            case "angels":
              angelsRef.current = child;
              break;
            default:
              child.material = new MeshStandardMaterial({ color: "white" });
              break;
          }
        }
      });

      gltf.scene.scale.set(scale, scale, scale);
      gltf.scene.position.set(positionX, positionY, positionZ);
    }
  }, [gltf, scale, positionX, positionY, positionZ]);

  // Angel Rotation on Clothing Selection
  useEffect(() => {
    if (triggerAngelRotation && angelsRef.current) {
      gsap.to(angelsRef.current.rotation, {
        y: angelsRef.current.rotation.y - Math.PI * 2,
        duration: 1.25,
        ease: "power1.inOut",
        onComplete: onAngelRotationComplete,
      });
    }
  }, [triggerAngelRotation, onAngelRotationComplete]);

  // Platform Circle Drag
  useEffect(() => {
    if (platformCircleRef.current) {
      gsap.to(platformCircleRef.current.rotation, {
        x: platformCircleRotation[0],
        y: platformCircleRotation[1],
        duration: 0.5,
        ease: "power2.out",
      });

      gsap.to(platformLightsRef.current.rotation, {
        x: platformCircleRotation[0],
        y: platformCircleRotation[1],
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, [platformCircleRotation]);

  // Rotating heavenly angels
  useFrame(() => {
    if (angelsRef.current) {
      angelsRef.current.rotation.y += 0.01;
    }
  });

  return (
    <>
      return (
      <>
        {/* Environment to handle reflections */}
        <Environment
          resolution={256}
          preset="studio"
          environmentIntensity={0.02}
        >
          <Lightformer
            intensity={2}
            rotation={[(3 * Math.PI) / 4, 0, 0]}
            position={[0, 2, 10]}
            scale={[10, 1, 1]}
          />
        </Environment>

        {/* <Lightformer
          intensity={2}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 10, 10]}
          scale={[10, 1, 1]}
        /> */}

        <hemisphereLight intensity={0.5} />
        <mesh ref={platformCircleRef} {...bind()}>
          <primitive object={gltf.scene} />
        </mesh>
      </>
      );
    </>
  );
};

export default Platform;
