'use client';

import type { DirectedScene } from './sceneDirectorService';

export interface VisualPromptPackage {
  imagePrompts: string[];
  videoPrompts: string[];
}

export function buildVisualPromptPackage(
  scenes: DirectedScene[],
  styleTags: string[],
  characterLock?: string
): VisualPromptPackage {
  const style = styleTags.length > 0 ? styleTags.join(', ') : 'cinematic realism';
  const lock = characterLock ? ` Character lock: ${characterLock}.` : '';

  const imagePrompts = scenes.map((scene) =>
    `${scene.title}. ${scene.description}. Camera: ${scene.cameraMove}. Style: ${style}. Natural lighting, high realism, no cartoon look.${lock}`
  );

  const videoPrompts = scenes.map((scene) =>
    `${scene.title}. ${scene.description}. Camera movement: ${scene.cameraMove}. Pacing: ${scene.pacingNote}. Cinematic realism, stable motion, loop-friendly ending.${lock}`
  );

  return { imagePrompts, videoPrompts };
}
