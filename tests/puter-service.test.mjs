import test from 'node:test';
import assert from 'node:assert/strict';
import { canMirrorKvToLocalStorage, isSensitiveKvKey } from '../lib/services/puterService.ts';

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

test('canMirrorKvToLocalStorage allows known-safe preference keys', () => {
  assert.equal(canMirrorKvToLocalStorage('ai_model'), true);
  assert.equal(canMirrorKvToLocalStorage('image_provider'), true);
  assert.equal(canMirrorKvToLocalStorage('provider_status_openrouter'), true);
});

test('canMirrorKvToLocalStorage blocks secrets and private identity fields', () => {
  assert.equal(canMirrorKvToLocalStorage('groq_key'), false);
  assert.equal(canMirrorKvToLocalStorage('provider_access_token'), false);
  assert.equal(canMirrorKvToLocalStorage('provider_username'), false);
});
