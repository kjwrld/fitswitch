import React, { useEffect, useState, useRef } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useControls } from "leva";
import { Mesh, MeshStandardMaterial } from "three";
import { gsap } from "gsap";

interface PlatformProps {
  triggerRotation: boolean; // New prop to trigger rotation
  onRotationComplete: () => void; // Callback when rotation is complete
}

const Platform: React.FC<PlatformProps> = ({
  triggerRotation,
  onRotationComplete,
}) => {
  const gltf = useLoader(GLTFLoader, "/platform.gltf");
  const platformRef = useRef<Mesh | null>(null);
  const heavenRef = useRef<Mesh | null>(null);
  const angelsRef = useRef<Mesh | null>(null);

  const { scale, positionX, positionY, positionZ } = useControls("Platform", {
    scale: { value: 0.14, min: 0.1, max: 0.5, step: 0.01 },
    positionX: { value: 0, min: -10, max: 10, step: 0.1 },
    positionY: { value: 0.6, min: -10, max: 10, step: 0.1 },
    positionZ: { value: -0.5, min: -10, max: 10, step: 0.1 },
  });

  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if (child instanceof Mesh) {
          // const nodeName = child.name.trim();
          // console.log(`Processing child: ${nodeName}`);

          switch (child.name) {
            case "platform_circle":
              break;
            case "platform_bottom":
              break;
            case "heaven_light":
              break;
            case "platform_":
              platformRef.current = child;
              break;
            case "platform_lights":
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
      // gltf.scene.rotation.set(rotationX, rotationY, rotationZ);
    }
  }, [gltf, scale, positionX, positionY, positionZ]);

  useEffect(() => {
    if (triggerRotation && angelsRef.current) {
      gsap.to(angelsRef.current.rotation, {
        y: angelsRef.current.rotation.y + Math.PI * 2, // 360 degrees
        duration: 2, // Adjust this for speed
        ease: "power2.inOut", // Adjust this for easing
        onComplete: onRotationComplete,
      });
    }
  }, [triggerRotation, onRotationComplete]);

  useFrame(() => {
    if (angelsRef.current) {
      angelsRef.current.rotation.y += 0.01; // Adjust the speed of rotation as needed
    }
  });

  return <primitive object={gltf.scene} />;
};

export default Platform;
