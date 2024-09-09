import React, { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRM, VRMLoaderPlugin, VRMHumanBoneName } from "@pixiv/three-vrm";
import gsap from "gsap";
import { Object3D, AnimationMixer } from "three";
import { useControls } from "leva";
import { loadMixamoAnimation } from "./loadMixamoAnimation";
import "./Avatar.css";

interface AvatarProps {
  vrmPath: string;
  avatarRotation: [number, number, number];
}

const Avatar: React.FC<AvatarProps> = ({ vrmPath, avatarRotation }) => {
  const { ...controls } = useControls("Avatar", {
    Head: { value: 0, min: -0.4, max: 0.4 },
    leftArm: { value: 0, min: -0.4, max: 0.4 },
    rightArm: { value: 0, min: -0.4, max: 0.4 },
    Neutral: { value: 0, min: 0, max: 1 },
    Angry: { value: 0, min: 0, max: 1 },
    Relaxed: { value: 0, min: 0, max: 1 },
    Happy: { value: 0, min: 0, max: 1 },
    Sad: { value: 0, min: 0, max: 1 },
    Surprised: { value: 0, min: 0, max: 1 },
    Extra: { value: 0, min: 0, max: 1 },
    positionX: { value: 0.0, min: -5, max: 5, step: 0.1 },
    positionY: { value: 0.5, min: -5, max: 5, step: 0.1 },
    positionZ: { value: -0.4, min: -5, max: 5, step: 0.1 },
  });
  const { scene } = useThree();
  const [gltf, setGltf] = useState<GLTF>();
  const [progress, setProgress] = useState<number>(0);
  const [avatar, setAvatar] = useState<VRM | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [bonesStore, setBones] = useState<{ [part: string]: Object3D }>({});
  const mixerRef = useRef<AnimationMixer | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => {
      return new VRMLoaderPlugin(parser);
    });

    loader.load(
      vrmPath,
      (gltf) => {
        setGltf(gltf);
        const vrm: VRM = gltf.userData.vrm;
        // Hide the avatar initially
        vrm.scene.visible = false;

        if (avatar) {
          scene.remove(avatar.scene);
        }
        setAvatar(vrm);
        scene.add(vrm.scene);

        // Disable frustum culling
        vrm.scene.traverse((obj) => {
          obj.frustumCulled = false;
        });

        // Load and apply the Mixamo animation
        if (mixerRef.current) mixerRef.current.stopAllAction();
        mixerRef.current = new AnimationMixer(vrm.scene);

        loadMixamoAnimation("./animations/Catwalk_Idle_01.fbx", vrm).then(
          (clip: THREE.AnimationClip) => {
            mixerRef.current?.clipAction(clip).play();
            vrm.scene.visible = true;
            setIsVisible(true);
          }
        );

        vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Hips).rotation.y =
          Math.PI;
        const expressionNames = vrm.expressionManager.expressions.map(
          (expression) => expression.expressionName
        );

        const bones = {
          head: vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Head),
          neck: vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Neck),
          hips: vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Hips),
          spine: vrm.humanoid.getRawBoneNode(VRMHumanBoneName.Spine),
          upperChest: vrm.humanoid.getRawBoneNode(VRMHumanBoneName.UpperChest),
          leftArm: vrm.humanoid.getNormalizedBoneNode(
            VRMHumanBoneName.LeftUpperArm
          ),
          rightArm: vrm.humanoid.getNormalizedBoneNode(
            VRMHumanBoneName.RightUpperArm
          ),
        };
        setBones(bones);
      },

      (xhr) => {
        setProgress((xhr.loaded / xhr.total) * 100);
      },
      (error) => {
        console.log("An error happened");
        console.log(error);
      }
    );

    return () => {
      if (avatar) {
        scene.remove(avatar.scene);
      }
    };
  }, [vrmPath, scene]);

  useEffect(() => {
    if (avatar) {
      gsap.to(avatar.scene.rotation, {
        x: avatarRotation[0],
        y: avatarRotation[1],
        duration: 0.5,
        ease: "power1.out",
      });
    }
  }, [avatarRotation]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    if (mixerRef.current) mixerRef.current.update(delta);

    if (avatar && isVisible) {
      {
        avatar.scene.position.x = controls.positionX;
        avatar.scene.position.y = controls.positionY;
        avatar.scene.position.z = controls.positionZ;
        avatar.scene.rotation.x = avatarRotation[0];
        avatar.scene.rotation.y = avatarRotation[1];
      }
      avatar.update(delta);
      const blinkDelay = 10;
      const blinkFrequency = 3;
      if (Math.round(t * blinkFrequency) % blinkDelay === 0) {
        avatar.expressionManager.setValue(
          "blink",
          1 - Math.abs(Math.sin(t * blinkFrequency * Math.PI))
        );
      }
      avatar.expressionManager.setValue("neutral", controls.Neutral);
      avatar.expressionManager.setValue("angry", controls.Angry);
      avatar.expressionManager.setValue("relaxed", controls.Relaxed);
      avatar.expressionManager.setValue("happy", controls.Happy);
      avatar.expressionManager.setValue("sad", controls.Sad);
      avatar.expressionManager.setValue("Surprised", controls.Surprised);
      avatar.expressionManager.setValue("Extra", controls.Extra);
    }
    if (bonesStore.neck) {
      bonesStore.neck.rotation.y =
        (Math.PI / 100) * Math.sin((t / 4) * Math.PI);
    }

    if (bonesStore.upperChest) {
      bonesStore.upperChest.rotation.y =
        (Math.PI / 600) * Math.sin((t / 8) * Math.PI);
      bonesStore.spine.position.y =
        (Math.PI / 400) * Math.sin((t / 2) * Math.PI);
      bonesStore.spine.position.z =
        (Math.PI / 600) * Math.sin((t / 2) * Math.PI);
    }
    if (bonesStore.head) {
      bonesStore.head.rotation.y = controls.Head * Math.PI;
    }

    if (bonesStore.leftArm) {
      bonesStore.leftArm.rotation.z = controls.leftArm * Math.PI;
    }
    if (bonesStore.rightArm) {
      bonesStore.rightArm.rotation.z = controls.rightArm * Math.PI;
    }
  });
  return (
    <>
      {avatar && isVisible ? (
        <>
          <primitive object={avatar.scene} />
        </>
      ) : (
        <Html center style={{ transform: "translate(-30px, -50vh)" }}>
          {/* Move it higher */}
          <div className="loader-container">
            <div className="loader">
              <div className="loading-bar loading-bar1"></div>
              <div className="loading-bar loading-bar2"></div>
              <div className="loading-bar loading-bar3"></div>
            </div>
            <span>{progress.toFixed(0)} % loaded</span>{" "}
            {/* Display progress percentage */}
          </div>
        </Html>
      )}
    </>
  );
};

export default Avatar;
