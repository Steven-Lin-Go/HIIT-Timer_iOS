import assert from 'node:assert/strict';
import { test } from 'node:test';

import { speechLocale, voicePhrase } from '../src/lib/voice.ts';

test('voicePhrase returns Traditional Chinese phrases', () => {
  assert.equal(voicePhrase('work', 'zh-TW'), '開始');
  assert.equal(voicePhrase('rest', 'zh-TW'), '休息');
  assert.equal(voicePhrase('complete', 'zh-TW'), '完成');
});

test('voicePhrase returns English phrases', () => {
  assert.equal(voicePhrase('work', 'en'), 'Work');
  assert.equal(voicePhrase('cooldown', 'en'), 'Cool down');
});

test('every phase has a phrase in both languages', () => {
  const cues = ['prepare', 'work', 'rest', 'cooldown', 'complete'] as const;
  for (const cue of cues) {
    assert.ok(voicePhrase(cue, 'zh-TW').length > 0);
    assert.ok(voicePhrase(cue, 'en').length > 0);
  }
});

test('speechLocale maps to BCP-47 tags', () => {
  assert.equal(speechLocale['zh-TW'], 'zh-TW');
  assert.equal(speechLocale.en, 'en-US');
});
