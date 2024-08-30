import React, { useEffect, useState } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useControls } from "leva";
import { Mesh, MeshStandardMaterial } from "three";

const Platform: React.FC = () => {
  const gltf = useLoader(GLTFLoader, "/platform.gltf");

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
          const nodeName = child.name.trim();

          console.log(`Processing child: ${nodeName}`); // Debugging log
          // Here you can apply different materials based on the name or other properties
          switch (child.name) {
            case "platform_circle":
              // child.material = new MeshStandardMaterial({ color: "gray" });
              break;
            case "platform_bottom":
              break;
            case "Цилиндр027": // heaven
              break;
            case "platform_": // platform
              break;
            case "platform_lights":
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

  return <primitive object={gltf.scene} />;
};

export default Platform;
