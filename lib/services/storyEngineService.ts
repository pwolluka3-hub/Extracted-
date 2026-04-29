'use client';

import { universalChat } from './aiService';
import type { BrandProfile } from './nicheAnalyzerService';

export interface StoryEngineResult {
  hook: string;
  script: string;
  episodicArc: string[];
}

export async function buildStoryContent(
  request: string,
  profile: BrandProfile
): Promise<StoryEngineResult> {
  const prompt = `Create a high-retention script for this request.

Request: ${request}
Niche: ${profile.niche}
Tone: ${profile.tone}
Goal: ${profile.goal}
Audience intent: ${profile.audienceIntent}

Rules:
- First line must be a strong hook.
- Keep it concise and cinematic.
- End with an unresolved loop-friendly beat.

Return JSON:
{
  "hook": "string",
  "script": "string",
  "episodicArc": ["beat 1", "beat 2", "beat 3"]
}`;

  try {
    const response = await universalChat(prompt, { model: 'gpt-4o' });
    const match = response.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON');
    const parsed = JSON.parse(match[0]) as Partial<StoryEngineResult>;
    return {
      hook: parsed.hook?.trim() || 'Something shifts in the first second, and nothing feels safe after.',
      script: parsed.script?.trim() || request,
      episodicArc: parsed.episodicArc?.filter(Boolean).slice(0, 6) || ['hook', 'escalation', 'loop'],
    };
  } catch {
    return {
      hook: 'Something shifts in the first second, and nothing feels safe after.',
      script: request,
      episodicArc: ['hook', 'escalation', 'loop'],
    };
  }
}
