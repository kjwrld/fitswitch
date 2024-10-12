import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Avatar from "./components/Avatar";
import CameraControls from "./components/CameraControls";
import Platform from "./components/Platform";
import PostProcessing from "./components/PostProcessing";
import "./styles.css";
import { Vector3 } from "three";
import { useDrag } from "@use-gesture/react";
import { Leva, useControls } from "leva";

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

interface CanvasSceneProps {
  vrmPath: string;
  triggerAngelRotation: boolean;
  handleAngelRotationComplete: () => void;
  platformCircleRotation: [number, number, number];
  avatarRotation: [number, number, number];
  bind: any;
}

const CanvasScene: React.FC<CanvasSceneProps> = ({
  vrmPath,
  triggerAngelRotation,
  handleAngelRotationComplete,
  platformCircleRotation,
  avatarRotation,
  bind,
}) => {
  return (
    <>
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
    </>
  );
};

const App: React.FC = () => {
  const { normalEdgeStrength, depthEdgeStrength, pixelSize } = useControls({
    normalEdgeStrength: { value: 1, min: 0, max: 2, step: 0.5 },
    depthEdgeStrength: { value: 0.5, min: 0, max: 1, step: 0.1 },
    pixelSize: { value: 8, min: 1, max: 16, step: 1 },
  });

  const baseUrl =
    process.env.NODE_ENV === "production" ? process.env.PUBLIC_URL : "";
  const [vrmPath, setVrmPath] = useState<string>(
    `${baseUrl}/vrms/avatar_black.vrm`
  );
  const [triggerAngelRotation, setTriggerAngelRotation] = useState(false);
  const [avatarRotation, setAvatarRotation] = useState<
    [number, number, number]
  >([0, Math.PI, 0]);
  const [platformCircleRotation, setPlatformCircleRotation] = useState<
    [number, number, number]
  >([0, Math.PI, 0]);
  const [loadingGLTF, setLoadingGLTF] = useState(false);

  const bind = useDrag(
    ({ offset: [x, y] }) => {
      const newRotation = [y * 0.01, x * 0.01, 0] as [number, number, number];
      setPlatformCircleRotation(newRotation);
      setAvatarRotation(newRotation);
    },
    { axis: "x" }
  );

  const changeOutfit = debounce((newPath: string) => {
    if (!loadingGLTF) {
      setLoadingGLTF(true);
      setTriggerAngelRotation(true);
      setVrmPath(`${baseUrl}${newPath}`);
      setLoadingGLTF(false);
    }
  }, 1000);

  const handleAngelRotationComplete = () => {
    setTriggerAngelRotation(false);
  };

  return (
    <>
      <Leva collapsed />
      <div id="root">
        <div {...bind()} className="canvas-container">
          <Canvas camera={{ position: new Vector3(0, 1.5, -2.3) }}>
            <CanvasScene
              vrmPath={vrmPath}
              triggerAngelRotation={triggerAngelRotation}
              handleAngelRotationComplete={handleAngelRotationComplete}
              platformCircleRotation={platformCircleRotation}
              avatarRotation={avatarRotation}
              bind={bind}
            />
            <PostProcessing />
          </Canvas>
        </div>

        <div className="button-container">
          <button
            onClick={() => changeOutfit("/vrms/avatar_black.vrm")}
            disabled={loadingGLTF}
          >
            Black Outfit
          </button>
          <button
            onClick={() => changeOutfit("/vrms/avatar_casual.vrm")}
            disabled={loadingGLTF}
          >
            Casual Outfit
          </button>
          <button
            onClick={() => changeOutfit("/vrms/avatar_formal.vrm")}
            disabled={loadingGLTF}
          >
            Formal Outfit
          </button>
          <button
            onClick={() => changeOutfit("/vrms/avatar_sporty.vrm")}
            disabled={loadingGLTF}
          >
            Sporty Outfit
          </button>
        </div>
      </div>
    </>
  );
};

export default App;
