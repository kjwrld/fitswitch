import * as THREE from "three";
import { useFrame, useThree, extend } from "@react-three/fiber";
import { useRef, useEffect, FC } from "react";
import { EffectComposer } from "three-stdlib";
import RenderPixelatedPass from "./RenderPixelatedPass";
import { UnrealBloomPass } from "three-stdlib";
import { useControls, folder } from "leva";

extend({ EffectComposer, RenderPixelatedPass, UnrealBloomPass });

const PostProcessing: FC = () => {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef<EffectComposer>(null!);

  const {
    bloomStrength,
    bloomRadius,
    bloomThreshold,
    pixelSize,
    normalEdgeStrength,
    depthEdgeStrength,
  } = useControls({
    "Bloom Settings": folder(
      {
        bloomStrength: { value: 0.2, min: 0, max: 5, step: 0.1 },
        bloomRadius: { value: 0.08, min: 0, max: 1, step: 0.01 },
        bloomThreshold: { value: 0.4, min: 0, max: 1, step: 0.01 },
      },
      { collapsed: true }
    ),
    "Pixelation Settings": folder(
      {
        pixelSize: { value: 4, min: 1, max: 20, step: 1 },
        normalEdgeStrength: { value: 2, min: 0, max: 2, step: 0.1 },
        depthEdgeStrength: { value: 1, min: 0, max: 1, step: 0.1 },
      },
      { collapsed: true }
    ),
  });

  useEffect(() => {
    const pixelResolution = new THREE.Vector2(size.width, size.height)
      .divideScalar(pixelSize)
      .floor();

    composer.current = new EffectComposer(gl);

    const pixelPass = new RenderPixelatedPass(pixelResolution, scene, camera);
    const material = pixelPass.fsQuad.material as THREE.ShaderMaterial;

    material.uniforms.normalEdgeStrength.value = normalEdgeStrength;
    material.uniforms.depthEdgeStrength.value = depthEdgeStrength;
    composer.current.addPass(pixelPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      bloomStrength,
      bloomRadius,
      bloomThreshold
    );
    composer.current.addPass(bloomPass);

    return () => composer.current?.dispose();
  }, [
    gl,
    scene,
    camera,
    size,
    bloomStrength,
    bloomRadius,
    bloomThreshold,
    pixelSize,
    normalEdgeStrength,
    depthEdgeStrength,
  ]);

  useFrame(() => composer.current?.render(), 1);

  return null;
};

export default PostProcessing;
