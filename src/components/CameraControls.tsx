import React from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
// import "./styles.css";
import THREE, { PerspectiveCamera } from "three";
import { button, useControls } from "leva";

const CameraControls = () => {
  const { camera, gl } = useThree();
  const cameraConfig = useControls("Camera", {
    positionX: { value: 0, min: -10, max: 10, step: 0.1 },
    positionY: { value: 1.4, min: -5, max: 5, step: 0.1 },
    positionZ: { value: -2.1, min: -5, max: 5, step: 0.1 },
    targetX: { value: 0, min: -5, max: 5, step: 0.1 },
    targetY: { value: 1.3, min: 0, max: 3, step: 0.1 },
    targetZ: { value: 0, min: -5, max: 5, step: 0.1 },
    fov: { value: 75, min: 10, max: 120, step: 1 },
    near: { value: 0.1, min: 0.1, max: 10, step: 0.1 },
    far: { value: 1000, min: 100, max: 2000, step: 10 },
    resetCamera: button(() => {
      camera.position.set(0, 1.3, 0.6);
      rotateOnAxis(new THREE.Vector3(0, 1, 0), 90);
      camera.lookAt(0, 1.3, 0);
      gl.domElement.dispatchEvent(new Event("resize"));
    }),
  });

  const perspectiveCamera = camera as PerspectiveCamera;
  perspectiveCamera.fov = cameraConfig.fov;
  perspectiveCamera.near = cameraConfig.near;
  perspectiveCamera.far = cameraConfig.far;
  perspectiveCamera.updateProjectionMatrix();
  perspectiveCamera.position.set(
    cameraConfig.positionX,
    cameraConfig.positionY,
    cameraConfig.positionZ
  );
  gl.domElement.dispatchEvent(new Event("resize")); // Ensure canvas resizes with camera adjustments

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
