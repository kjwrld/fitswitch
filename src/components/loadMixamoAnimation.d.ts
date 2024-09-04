// loadMixamoAnimation.d.ts

import { VRM } from "@pixiv/three-vrm";
import { AnimationClip } from "three";

export function loadMixamoAnimation(
  url: string,
  vrm: VRM
): Promise<AnimationClip>;
