import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Avatar from "./components/Avatar";
import CameraControls from "./components/CameraControls";
import Platform from "./components/Platform";
import "./styles.css";

const App: React.FC = () => {
  const [vrmPath, setVrmPath] = useState<string>("/vrms/avatar_black.vrm");
  const [triggerRotation, setTriggerRotation] = useState(false);

  const changeOutfit = (newPath: string) => {
    setVrmPath(newPath);
    console.log("changed path", newPath);
    setTriggerRotation(true); // Trigger the rotation
  };

  const handleRotationComplete = () => {
    setTriggerRotation(false); // Reset the trigger after rotation completes
  };

  return (
    <div id="root">
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 1.3, -1.1] }}>
          <ambientLight intensity={0.65} />
          <spotLight position={[0, 2, -1]} intensity={0.4} />
          <Suspense>
            <Platform
              triggerRotation={triggerRotation}
              onRotationComplete={handleRotationComplete}
            />
            <Avatar vrmPath={vrmPath} />
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
  );
};

export default App;
