import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OrthographicCamera, PerspectiveCamera } from "three";
import { button, useControls } from "leva";

const CameraControls = () => {
  const { camera, gl } = useThree();
  const cameraConfig = useControls("Camera", {
    positionX: { value: 0, min: -10, max: 10, step: 0.1 },
    positionY: { value: 1.4, min: -5, max: 5, step: 0.1 },
    positionZ: { value: -2.0, min: -5, max: 5, step: 0.1 },
    targetX: { value: 0, min: -5, max: 5, step: 0.1 },
    targetY: { value: 1.3, min: 0, max: 3, step: 0.1 },
    targetZ: { value: 0, min: -5, max: 5, step: 0.1 },
    near: { value: 0.1, min: 0.1, max: 10, step: 0.1 },
    far: { value: 1000, min: 100, max: 2000, step: 10 },
    resetCamera: button(() => {
      camera.position.set(0, 1.5, -2.3);
      camera.rotation.y = -Math.PI;
      gl.domElement.dispatchEvent(new Event("resize"));
    }),
  });

  const perspectiveCamera = camera as OrthographicCamera;
  perspectiveCamera.near = cameraConfig.near;
  perspectiveCamera.far = cameraConfig.far;
  perspectiveCamera.updateProjectionMatrix();

  const targetPosition = useRef({
    x: cameraConfig.positionX,
    y: cameraConfig.positionY,
    z: cameraConfig.positionZ,
  });

  const lerpedPosition = useRef({
    x: cameraConfig.positionX,
    y: cameraConfig.positionY,
    z: cameraConfig.positionZ,
  });

  // Camera Offset
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const mouseX = (event.clientX / innerWidth) * 2 - 1;
      const mouseY = -(event.clientY / innerHeight) * 2 + 1;

      // Calculate distance from center (0, 0)
      const distanceFromCenter = Math.sqrt(mouseX * mouseX + mouseY * mouseY);

      // Set the target position based on mouse movement
      targetPosition.current.x = cameraConfig.positionX + mouseX * 0.5; // Adjust sensitivity
      targetPosition.current.y = cameraConfig.positionY + mouseY * -0.25; // Adjust sensitivity

      // Adjust Z based on distance from center, farther from center = greater Z value
      const zOffset = distanceFromCenter * 0.65;
      targetPosition.current.z = cameraConfig.positionZ - zOffset;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [cameraConfig]);

  useFrame(() => {
    lerpedPosition.current.x +=
      (targetPosition.current.x - lerpedPosition.current.x) * 0.1;
    lerpedPosition.current.y +=
      (targetPosition.current.y - lerpedPosition.current.y) * 0.1;
    lerpedPosition.current.z +=
      (targetPosition.current.z - lerpedPosition.current.z) * 0.1;

    perspectiveCamera.position.set(
      lerpedPosition.current.x,
      lerpedPosition.current.y,
      lerpedPosition.current.z
    );
    perspectiveCamera.lookAt(
      cameraConfig.targetX,
      cameraConfig.targetY,
      cameraConfig.targetZ
    );
  });

  return (
    <OrbitControls
      target={[
        cameraConfig.targetX,
        cameraConfig.targetY,
        cameraConfig.targetZ,
      ]}
    />
  );
};

export default CameraControls;
