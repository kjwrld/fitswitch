import React, { useEffect, useState, useRef } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useControls } from "leva";
import { Mesh, MeshStandardMaterial, Color, PointLight, Group } from "three";
import { gsap } from "gsap";

interface PlatformProps {
  triggerAngelRotation: boolean;
  onAngelRotationComplete: () => void;
}

const Platform: React.FC<PlatformProps> = ({
  triggerAngelRotation,
  onAngelRotationComplete,
}) => {
  const gltf = useLoader(GLTFLoader, "/platform.gltf");
  const platformRef = useRef<Mesh | null>(null);
  const heavenRef = useRef<Mesh | null>(null);
  const angelsRef = useRef<Mesh | null>(null);
  const lightRef = useRef<PointLight | null>(null);
  // const lightsRef = useRef<PointLight[]>([]);
  const emissiveColor = new Color(0x4f67ff); // Set the color of the light

  const { scale, positionX, positionY, positionZ } = useControls("Platform", {
    scale: { value: 0.15, min: 0.1, max: 0.5, step: 0.01 },
    positionX: { value: 0, min: -10, max: 10, step: 0.1 },
    positionY: { value: 0.5, min: -10, max: 10, step: 0.1 },
    positionZ: { value: -0.5, min: -10, max: 10, step: 0.1 },
  });

  const {
    lightIntensity,
    lightColor,
    lightDistance,
    lightDecay,
    lightPositionX,
    lightPositionY,
    lightPositionZ,
  } = useControls("Platform Light", {
    lightIntensity: { value: 1, min: 0, max: 10, step: 0.1 },
    lightColor: "#4f67ff",
    lightDistance: { value: 100, min: 0, max: 200 },
    lightDecay: { value: 2, min: 1, max: 2 },
    lightPositionX: { value: 0, min: -10, max: 10, step: 0.1 },
    lightPositionY: { value: 5, min: -10, max: 10, step: 0.1 },
    lightPositionZ: { value: 0, min: -10, max: 10, step: 0.1 },
  });

  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if (child instanceof Mesh) {
          // const nodeName = child.name.trim();
          // console.log(`Processing child: ${nodeName}`);
          const material = child.material as MeshStandardMaterial;

          switch (child.name) {
            case "platform_circle":
              break;
            case "platform_bottom":
              material.emissive = emissiveColor;
              material.emissiveIntensity = 5;
              // material.emissiveMap = material.map; // Optional: Use the texture as an emissive map
              const light = new PointLight(emissiveColor, 2, 2);
              lightRef.current = light;
              gltf.scene.add(light);
              light.position.copy(child.position);
              break;
            case "heaven_light":
              material.emissive = emissiveColor;
              material.emissiveIntensity = 5;
              // material.emissiveMap = material.map; // Optional: Use the texture as an emissive map
              // const light = new PointLight(emissiveColor, 2, 2);
              // lightRef.current = light;
              // gltf.scene.add(light);
              // light.position.copy(child.position);
              break;
            case "platform_":
              platformRef.current = child;
              break;
            case "platform_lights":
              material.emissive = emissiveColor;
              material.emissiveIntensity = 5;
              // material.emissiveMap = material.map;
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

  // Angel Rotation on Clothing Selection
  useEffect(() => {
    if (triggerAngelRotation && angelsRef.current) {
      gsap.to(angelsRef.current.rotation, {
        y: angelsRef.current.rotation.y - Math.PI * 2, // 360 degrees
        duration: 1.25,
        ease: "power1.inOut", // Adjust this for easing
        onComplete: onAngelRotationComplete,
      });
    }
  }, [triggerAngelRotation, onAngelRotationComplete]);

  // Rotating heavenly angels
  useFrame(() => {
    if (angelsRef.current) {
      angelsRef.current.rotation.y += 0.01; // Adjust the speed of rotation as needed
    }
  });

  // Light Positioning
  useFrame(() => {
    if (lightRef.current) {
      // Update the light's properties based on the Leva controls
      lightRef.current.intensity = lightIntensity;
      lightRef.current.color.set(lightColor);
      lightRef.current.distance = lightDistance;
      lightRef.current.decay = lightDecay;
      lightRef.current.position.set(
        lightPositionX,
        lightPositionY,
        lightPositionZ
      );
    }
  });

  // Keep all lights' positions updated with their corresponding objects if they move
  // useFrame(() => {
  //   lightsRef.current.forEach((light, index) => {
  //     const objectName = `light_object_${index + 1}`;
  //     const object = gltf.scene.getObjectByName(objectName);
  //     if (object) {
  //       light.position.copy(object.position);
  //     }
  //   });
  // });

  return (
    <>
      <primitive object={gltf.scene} />;
      <pointLight ref={lightRef} />
    </>
  );
};

export default Platform;
