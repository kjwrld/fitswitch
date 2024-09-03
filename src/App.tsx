import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Avatar from "./components/Avatar";
import CameraControls from "./components/CameraControls";
import Platform from "./components/Platform";
import "./styles.css";
import { Vector3 } from "three";
import { useDrag } from "@use-gesture/react";
import { Leva } from "leva";

const App: React.FC = () => {
  const [vrmPath, setVrmPath] = useState<string>("/vrms/avatar_black.vrm");
  const [triggerAngelRotation, setTriggerAngelRotation] = useState(false);
  const [avatarRotation, setAvatarRotation] = useState<
    [number, number, number]
  >([0, 0, 0]);
  const [platformCircleRotation, setPlatformCircleRotation] = useState<
    [number, number, number]
  >([0, 0, 0]);

  const bind = useDrag(
    ({ offset: [x, y] }) => {
      const newRotation = [y * 0.005, x * 0.005, 0] as [number, number, number];
      setPlatformCircleRotation(newRotation);
      setAvatarRotation(newRotation);
    },
    { axis: "x" }
  );

  const changeOutfit = (newPath: string) => {
    setTriggerAngelRotation(true);
    setVrmPath(newPath);
  };

  const handleAngelRotationComplete = () => {
    setTriggerAngelRotation(false);
  };

  return (
    <>
      <Leva collapsed />
      <div id="root">
        <div className="canvas-container">
          <Canvas camera={{ position: new Vector3(0, 1.5, -2.3) }}>
            <ambientLight intensity={0.65} />
            <spotLight position={[0, 2, -1]} intensity={0.4} />
            <Suspense>
              <Platform
                triggerAngelRotation={triggerAngelRotation}
                onAngelRotationComplete={handleAngelRotationComplete}
                platformCircleRotation={platformCircleRotation}
                bind={bind}
              />
              <Avatar vrmPath={vrmPath} avatarRotation={avatarRotation} />
              <CameraControls />
            </Suspense>
            <OrbitControls target={[0, 1.3, 0]} />
          </Canvas>
        </div>

        <div className="button-container">
          <button onClick={() => changeOutfit("/vrms/avatar_black.vrm")}>
            Black Outfit
          </button>
          <button onClick={() => changeOutfit("/vrms/avatar_casual.vrm")}>
            Casual Outfit
          </button>
          <button onClick={() => changeOutfit("/vrms/avatar_formal.vrm")}>
            Formal Outfit
          </button>
          <button onClick={() => changeOutfit("/vrms/avatar_sporty.vrm")}>
            Sporty Outfit
          </button>
        </div>
      </div>
    </>
  );
};

export default App;
