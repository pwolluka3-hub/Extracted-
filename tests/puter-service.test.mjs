import test from 'node:test';
import assert from 'node:assert/strict';
import { isSensitiveKvKey } from '../lib/services/puterService.ts';

test('isSensitiveKvKey treats provider api keys as sensitive', () => {
  assert.equal(isSensitiveKvKey('groq_key'), true);
  assert.equal(isSensitiveKvKey('elevenlabs_key'), true);
  assert.equal(isSensitiveKvKey('openrouter_key'), true);
});

test('isSensitiveKvKey treats token-like keys as sensitive', () => {
  assert.equal(isSensitiveKvKey('access_token'), true);
  assert.equal(isSensitiveKvKey('refresh-token'), true);
  assert.equal(isSensitiveKvKey('secret_value'), true);
});

test('isSensitiveKvKey leaves normal preference keys non-sensitive', () => {
  assert.equal(isSensitiveKvKey('ai_model'), false);
  assert.equal(isSensitiveKvKey('image_provider'), false);
  assert.equal(isSensitiveKvKey('nexus_theme'), false);
});
