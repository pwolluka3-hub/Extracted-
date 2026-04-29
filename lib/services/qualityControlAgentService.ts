'use client';

import { validateContent } from './governorService';

export interface QualityCheckInput {
  text: string;
  platform?: string;
}

export interface QualityCheckResult {
  approved: boolean;
  score: number;
  reasons: string[];
}

const GENERIC_GUARD = /\b(great content|here are some ideas|you can post|consider creating)\b/i;

export async function runQualityControl(input: QualityCheckInput): Promise<QualityCheckResult> {
  const reasons: string[] = [];
  if (GENERIC_GUARD.test(input.text)) {
    reasons.push('Generic phrasing detected');
  }

  const validation = await validateContent(input.text, {
    platform: input.platform,
  });

  reasons.push(...validation.issues.map((issue) => issue.message));

  return {
    approved: validation.governorApproved && reasons.length === 0,
    score: validation.score,
    reasons,
  };
}
