import React, { useEffect, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OrthographicCamera, PerspectiveCamera } from "three";
import gsap from "gsap";
import { button, useControls } from "leva";

const CameraControls = () => {
  const { camera, gl, invalidate } = useThree();
  const canvasContainer = gl.domElement;
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Reference to the timer
  const isOffScreen = useRef(false); // Tracks if the mouse is offscreen
  const hasTransitionedOffScreen = useRef(false); // Tracks if the camera has already transitioned

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

  const originalPosition = useRef({
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

      const distanceFromCenter = Math.sqrt(mouseX * mouseX + mouseY * mouseY);

      targetPosition.current.x = cameraConfig.positionX + mouseX * 0.5;
      targetPosition.current.y = cameraConfig.positionY + mouseY * -0.25;

      const zOffset = distanceFromCenter * 0.65;
      targetPosition.current.z = cameraConfig.positionZ - zOffset;

      setIsUserInteracting(true); // Mark user as interacting
    };

    const handleResize = () => {
      const { innerWidth, innerHeight } = window;
      if (camera instanceof PerspectiveCamera) {
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
      } else if (camera instanceof OrthographicCamera) {
        const aspect = innerWidth / innerHeight;
        const frustumHeight = 5;
        camera.left = (-frustumHeight * aspect) / 2;
        camera.right = (frustumHeight * aspect) / 2;
        camera.top = frustumHeight / 2;
        camera.bottom = -frustumHeight / 2;
        camera.updateProjectionMatrix();
      }

      gl.setSize(innerWidth, innerHeight);
      invalidate();
    };

    const handleMouseLeave = () => {
      isOffScreen.current = true;
      setIsUserInteracting(false);

      if (hasTransitionedOffScreen.current) return; // Prevent multiple transitions

      // Start a 2-second timer
      timeoutRef.current = setTimeout(() => {
        if (isOffScreen.current) {
          hasTransitionedOffScreen.current = true; // Ensure transition happens only once

          // Smoothly transition the camera back to the original position using gsap
          gsap.to(lerpedPosition.current, {
            x: originalPosition.current.x,
            y: originalPosition.current.y,
            // z: originalPosition.current.z,
            z: -3,
            duration: 1.5, // Adjust duration for smoother ease
            ease: "power3.out",
            onUpdate: () => {
              camera.position.set(
                lerpedPosition.current.x,
                lerpedPosition.current.y,
                lerpedPosition.current.z
              );
              invalidate(); // Re-render the scene
            },
            onComplete: () => {
              // When transition is complete, lock the position at the original place
              lerpedPosition.current.x = originalPosition.current.x;
              lerpedPosition.current.y = originalPosition.current.y;
              lerpedPosition.current.z = originalPosition.current.z;
            },
          });
        }
      }, 2000); // Delay for 2 seconds before starting transition
    };

    const handleMouseEnter = () => {
      isOffScreen.current = false; // Mouse is back on the screen
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); // Cancel the timer if it exists
      }
      hasTransitionedOffScreen.current = false; // Reset transition state if mouse re-enters
      setIsUserInteracting(true);
    };

    canvasContainer.addEventListener("mousemove", handleMouseMove);
    canvasContainer.addEventListener("mouseleave", handleMouseLeave);
    canvasContainer.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("resize", handleResize);

    return () => {
      canvasContainer.removeEventListener("mousemove", handleMouseMove);
      canvasContainer.removeEventListener("mouseleave", handleMouseLeave);
      canvasContainer.removeEventListener("mouseenter", handleMouseEnter);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); // Clean up timer on unmount
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [cameraConfig]);

  useFrame(() => {
    if (!isUserInteracting) return;
    const lerpFactor = 0.07;
    lerpedPosition.current.x +=
      (targetPosition.current.x - lerpedPosition.current.x) * lerpFactor;
    lerpedPosition.current.y +=
      (targetPosition.current.y - lerpedPosition.current.y) * lerpFactor;
    lerpedPosition.current.z +=
      (targetPosition.current.z - lerpedPosition.current.z) * lerpFactor;

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
