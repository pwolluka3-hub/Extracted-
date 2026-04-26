export function normalizeIncomingMessage(content, hasFiles) {
  const normalized = (content || '').trim();
  if (normalized) return normalized;
  if (hasFiles) return 'Please analyze the attached files.';
  return '';
}

export function detectExplicitMediaIntent(message) {
  if (!message || typeof message !== 'string') return null;
  
  const lowerMessage = message.toLowerCase();
  const mediaCreationVerbPattern = /\b(create|generate|make|produce|render|design|draw|animate|shoot|film|craft)\b/;
  const directRequestPattern = /\b(i want|i need|give me|show me|please make|can you make|can you create|create for me)\b/;
  const correctionPattern = /\b(fix this|fix thiz|redo|regenerate|try again)\b/;
  const imagePattern = /\b(image|photo|picture|poster|thumbnail|artwork|illustration)\b/;
  const videoPattern = /\b(video|reel|clip|animation|cinematic|short film)\b/;
  const characterPattern = /\b(character|protagonist|hero|main character|major character|avatar|concept art)\b/;
  const characterIntroPattern = /\b(our (major|main)?\s*character is|main character is|major character is|protagonist is)\b/;
  const characterDetailPattern = /\b(wearing|holding|expression|hair|skin|robe|eyes|face|build|outfit|lantern|sword|barefoot|height|young|slim|twisted|frayed|pendant|serious|focused|traditional|torn|worn)\b/g;
  const questionLeadPattern = /^(how|what|why|when|where|which|can|could|should|would|is|are|do|does|did)\b/;
  const discussionPattern = /\b(idea|ideas|tips|how to|explain|difference|compare|improve|quality)\b/;

  const hasImageKeyword = imagePattern.test(lowerMessage);
  const hasVideoKeyword = videoPattern.test(lowerMessage);
  const hasCharacterKeyword = characterPattern.test(lowerMessage);
  const hasCharacterIntro = characterIntroPattern.test(lowerMessage);
  const characterDetails = lowerMessage.match(characterDetailPattern) || [];
  const hasCharacterDetails = characterDetails.length > 0;
  const hasRichCharacterDescription = characterDetails.length >= 4;
  const hasMediaCreationVerb = mediaCreationVerbPattern.test(lowerMessage);
  const hasDirectRequest = directRequestPattern.test(lowerMessage);
  const hasCorrectionRequest = correctionPattern.test(lowerMessage);
  const isQuestionLike = questionLeadPattern.test(lowerMessage);
  const isDiscussion = discussionPattern.test(lowerMessage);
  const isLongDescription = lowerMessage.length > 160;

  if ((hasImageKeyword || hasVideoKeyword) && (isQuestionLike || isDiscussion) && !hasMediaCreationVerb && !hasDirectRequest) {
    return 'answer_question';
  }

  if (hasImageKeyword && (hasMediaCreationVerb || hasDirectRequest)) {
    return 'create_image';
  }

  if (hasVideoKeyword && (hasMediaCreationVerb || hasDirectRequest)) {
    return 'make_video';
  }

  if (
    (hasCharacterIntro || hasCharacterKeyword) &&
    (hasCharacterDetails || hasRichCharacterDescription) &&
    (isLongDescription || hasRichCharacterDescription) &&
    !isQuestionLike
  ) {
    return 'create_image';
  }

  if (
    hasCorrectionRequest &&
    (hasCharacterIntro || hasCharacterKeyword || hasRichCharacterDescription) &&
    !isQuestionLike
  ) {
    return 'create_image';
  }

  return null;
}

export function isExplicitExecutionRequest(message) {
  if (!message || typeof message !== 'string') return false;
  const lowerMessage = message.toLowerCase();
  const executionVerbPattern = /\b(create|generate|make|write|build|draft|produce|turn this into|convert this into)\b/;
  const outputPattern = /\b(post|caption|thread|script|carousel|reel|video|image|prompt|ad copy|email|plan|calendar|content)\b/;
  const strictRequestPattern = /\b(please|i want|i need|do this|give me|start now|go ahead)\b/;

  return (executionVerbPattern.test(lowerMessage) && outputPattern.test(lowerMessage)) || strictRequestPattern.test(lowerMessage) && outputPattern.test(lowerMessage);
}

export function buildFallbackChatMessages(request, errorMessage) {
  if (!request || typeof request !== 'string') {
    return [
      {
        role: 'system',
        content: 'You are Nexus Agent. A tool request failed. Provide a helpful response.',
      },
      {
        role: 'user',
        content: `Tool error: ${String(errorMessage)}. Please help.`,
      },
    ];
  }

  return [
    {
      role: 'system',
      content: 'You are Nexus Agent. A tool request failed, but you must still be useful. Give a concise, direct response that helps the user move forward immediately.',
    },
    {
      role: 'user',
      content: `Request: ${request}\n\nTool error: ${String(errorMessage)}\n\nProvide the best actionable response now.`,
    },
  ];
}
