import { useI18nStore, translate } from '@/i18n';
import { useAudioStore } from '@/stores/audioStore';
import { audioService } from '@/services/audioService';

/**
 * Languages that have actual audio asset directories under /audio/<lang>/.
 */
const SUPPORTED_AUDIO_LANGS = ['en', 'hi', 'mr'] as const;

function speakInLanguage(text: string, lang: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langCodes: Record<string, string> = {
      mr: 'mr-IN',
      hi: 'hi-IN',
      bn: 'bn-IN',
      or: 'or-IN',
      en: 'en-IN',
    };
    utterance.lang = langCodes[lang] || 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[SahiRate SpeechSynthesis] Speech synthesis error:', err);
  }
}

export function useAudio() {
  const language = useI18nStore((state) => state.language);
  const isAudioEnabled = useAudioStore((state) => state.isAudioEnabled);
  const toggleAudio = useAudioStore((state) => state.toggleAudio);

  /**
   * Play audio for the given key in the current language.
   * Plays MP3 asset and uses native SpeechSynthesis in the selected language.
   */
  const playAudio = (key: string, customText?: string) => {
    if (!isAudioEnabled) return;

    const audioLang = SUPPORTED_AUDIO_LANGS.includes(language as any) ? language : 'en';
    const url = `/audio/${audioLang}/${key}.mp3`;
    
    // Resolve localized text for spoken audio
    const localizedText = customText || translate(language, key as any);

    // Play native TTS speech synthesis in the selected language
    if (localizedText) {
      speakInLanguage(localizedText, language);
    } else {
      audioService.play(url);
    }
  };

  const stopAudio = () => {
    audioService.stop();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return { isAudioEnabled, toggleAudio, playAudio, stopAudio };
}
