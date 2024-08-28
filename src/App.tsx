import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Avatar from "./components/Avatar"; // Ensure this is the path to your Avatar component
import CameraControls from "./components/CameraControls"; // Ensure this is the path to your CameraControls component
import "./styles.css";

const App = () => {
  const [vrmPath, setVrmPath] = useState<string>("/vrms/avatar_black.vrm"); // Initial VRM path

  const changeOutfit = (newPath: string) => {
    setVrmPath(newPath);
  };

  return (
    <div id="root">
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 1.3, -1.1] }}>
          <ambientLight intensity={0.65} />
          <spotLight position={[0, 2, -1]} intensity={0.4} />
          <Suspense fallback={<div>Loading...</div>}>
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
