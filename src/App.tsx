import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Avatar from "./components/Avatar";
import CameraControls from "./components/CameraControls";
import Platform from "./components/Platform";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import "./styles.css";
import { Vector3 } from "three";
import { useDrag } from "@use-gesture/react";
import { Leva } from "leva";

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

interface SceneProps {
  vrmPath: string;
  triggerAngelRotation: boolean;
  handleAngelRotationComplete: () => void;
  platformCircleRotation: [number, number, number];
  avatarRotation: [number, number, number];
  bind: any;
}

const Scene: React.FC<SceneProps> = ({
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
    }
  }, 500);

  const handleAngelRotationComplete = () => {
    setTriggerAngelRotation(false);
    setLoadingGLTF(false);
  };

  return (
    <>
      <Leva collapsed />
      <div id="root">
        <div {...bind()} className="canvas-container">
          <Canvas camera={{ position: new Vector3(0, 1.5, -2.3) }}>
            <Scene
              vrmPath={vrmPath}
              triggerAngelRotation={triggerAngelRotation}
              handleAngelRotationComplete={handleAngelRotationComplete}
              platformCircleRotation={platformCircleRotation}
              avatarRotation={avatarRotation}
              bind={bind}
            />
            <EffectComposer>
              <Bloom
                mipmapBlur
                luminanceThreshold={1}
                intensity={1.42}
                radius={0.72}
              />
            </EffectComposer>
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
