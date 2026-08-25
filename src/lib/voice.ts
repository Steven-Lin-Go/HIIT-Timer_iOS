import type { TimerPhase } from '../timer/schedule';

// Only two supported voice languages, per product scope.
export type VoiceLanguage = 'zh-TW' | 'en';

type Cue = TimerPhase | 'complete';

// Spoken announcement for each phase transition, keyed by language. Used by the
// TTS countdown-voice feature. Numbers (3/2/1) are spoken separately.
const PHRASES: Record<VoiceLanguage, Record<Cue, string>> = {
  'zh-TW': {
    prepare: '準備',
    work: '開始',
    rest: '休息',
    cooldown: '緩和',
    complete: '完成',
  },
  en: {
    prepare: 'Get ready',
    work: 'Work',
    rest: 'Rest',
    cooldown: 'Cool down',
    complete: 'Complete',
  },
};

// BCP-47 tag passed to expo-speech.
export const speechLocale: Record<VoiceLanguage, string> = {
  'zh-TW': 'zh-TW',
  en: 'en-US',
};

export const voicePhrase = (cue: Cue, lang: VoiceLanguage): string => PHRASES[lang][cue];
