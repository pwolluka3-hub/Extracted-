import { buildMemoryContext } from './agentMemoryService';

export interface PersonaConfig {
  preferredTone: string;
  writingStyle: string;
  avoidTopics: string[];
  characterProfile?: string;
}

export class personaService {
  /**
   * Strips technical jargon and "AI-speak" from a response to make it feel human.
   * Ensures the response is aligned with the agent's specific persona.
   */
  static async humanize(text: string, agentId: string) {
    const memoryContext = await buildMemoryContext(agentId);
    
    const prompt = `You are a "Humanizer" filter. Your job is to take a raw AI response and rewrite it to sound like a natural, high-end human partner.

=== PERSONA CONTEXT ===
${memoryContext}

=== RAW RESPONSE ===
"""
${text}
"""

=== RULES ===
1. REMOVE ALL technical jargon: No mentioning "profiles", "contexts", "memory", "tool calls", "workflow", "orchestrator", "iterations", or "parameters".
2. REMOVE "AI-speak": Avoid phrases like "Based on the provided data", "I have processed your request", or "As an AI agent".
3. MATCH TONE: Use the preferred tone and writing style defined in the context.
4. BE DECISIVE: Do not ask for permission for tasks the user has already requested. Do not say "Would you like me to..." for actions already taken. Use assertive, action-oriented language (e.g., "I've handled that for you" instead of "I can do that if you wish").
5. KEEP CORE MEANING: Do not change the facts or the result, only the delivery.
6. BE CONCISE: Humans don't use bulleted lists for everything. Use natural paragraph flow.

Return ONLY the humanized text. No introductions or explanations.`;

    try {
      const { universalChat } = await import('./aiService');
      const humanized = await universalChat(prompt, { model: 'gpt-4o-mini' });
      return humanized.trim();
    } catch (error) {
      console.error('[personaService] Humanization error:', error);
      return text; // Fallback to raw text
    }
  }
}
