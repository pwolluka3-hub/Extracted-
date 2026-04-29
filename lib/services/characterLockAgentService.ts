'use client';

export interface CharacterIdentity {
  name: string;
  faceSignature: string;
  clothingSignature: string;
  physicalTraits: string[];
  voiceProfile?: string;
}

function inferName(request: string): string {
  const match = request.match(/\b(?:name|character)\s*(?:is|:)\s*([A-Za-z][A-Za-z0-9 _-]{1,40})/i);
  return match?.[1]?.trim() || 'Main Character';
}

export function createCharacterLock(request: string): CharacterIdentity {
  const lower = request.toLowerCase();
  const traits: string[] = [];
  if (/\bscar\b/.test(lower)) traits.push('visible scar');
  if (/\bhood|cloak|robe\b/.test(lower)) traits.push('signature outerwear');
  if (/\bcurly hair|braid|long hair|short hair\b/.test(lower)) traits.push('distinct hair silhouette');
  if (/\bgreen eyes|blue eyes|brown eyes|dark eyes\b/.test(lower)) traits.push('fixed eye color');

  return {
    name: inferName(request),
    faceSignature: /(?:face|features)\s*(?:is|are|:)\s*([^\n.]{4,80})/i.exec(request)?.[1]?.trim() || 'consistent face geometry and skin texture',
    clothingSignature: /(?:outfit|clothing|wearing)\s*(?:is|:)?\s*([^\n.]{4,90})/i.exec(request)?.[1]?.trim() || 'consistent signature outfit',
    physicalTraits: traits.length > 0 ? traits : ['consistent body proportions', 'recognizable silhouette'],
    voiceProfile: /(?:voice|tone)\s*(?:is|:)\s*([^\n.]{4,80})/i.exec(request)?.[1]?.trim() || 'calm, grounded, human pacing',
  };
}

export function enforceCharacterLock(prompt: string, character: CharacterIdentity): string {
  return `${prompt}

Character Lock (mandatory):
- Name: ${character.name}
- Face signature: ${character.faceSignature}
- Clothing signature: ${character.clothingSignature}
- Physical traits: ${character.physicalTraits.join(', ')}
- Voice profile: ${character.voiceProfile || 'natural human'}
- Keep this identity consistent across all scenes and regenerated outputs.`;
}
