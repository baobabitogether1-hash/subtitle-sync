/**
 * On-Demand Translation Manager
 * Uses Google Translate API to pre-translate upcoming sentences (next X=10 sentences ahead)
 * on demand until authentic subtitles are fetched from YouTube timedtext API.
 */

import { logInfo, logWarn, logForeignTrack } from "./logBuffer";
import { removeSpecialCharacters } from "./captionParser";

export function normalizeLanguage(lang: string): string {
  if (!lang) return "auto";
  const cleaned = lang.trim().toLowerCase();
  if (cleaned.startsWith("zh-cn") || cleaned === "zh_cn" || cleaned === "zh-hans") return "zh-CN";
  if (cleaned.startsWith("zh-tw") || cleaned === "zh_tw" || cleaned === "zh-hant") return "zh-TW";
  if (cleaned === "iw") return "he";
  if (cleaned === "ji") return "yi";
  if (cleaned === "in") return "id";
  return cleaned.split(/[-_]/)[0] || cleaned;
}

export interface TranslateOptions {
  text: string;
  fromLang: string;
  toLang: string;
}

export const translateWithGoogle = async ({
  text,
  fromLang,
  toLang,
}: {
  text: string;
  fromLang: string;
  toLang: string;
}): Promise<string> => {
  // MANDATORY APPLICATION STAGE: Special characters removal MUST happen BEFORE translation stage.
  const cleanText = removeSpecialCharacters(text);
  if (!cleanText || cleanText.trim().length === 0) {
    return "";
  }

  const normalizedFromLang = normalizeLanguage(fromLang);
  const normalizedToLang = normalizeLanguage(toLang);
  const requestUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${normalizedFromLang}&tl=${normalizedToLang}&dt=t&q=${encodeURIComponent(cleanText)}`;

  try {
    const res = await fetch(requestUrl);
    if (res.ok) {
      const data = await res.json();
      let translated = "";
      if (typeof data?.translatedText === "string" && data.translatedText) {
        translated = data.translatedText;
      } else if (Array.isArray(data?.[0])) {
        translated = data[0]
          .map((part: any) => (Array.isArray(part) && typeof part[0] === "string" ? part[0] : ""))
          .join("");
      } else {
        translated = data?.[0]?.[0]?.[0] || "";
      }

      if (translated && translated.trim().length > 0) {
        return translated;
      }
    }
  } catch (_primaryErr) {
    // Attempt fallback mirror endpoint
  }

  // Secondary fallback mirror
  try {
    const fallbackUrl = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${normalizedFromLang}&tl=${normalizedToLang}&q=${encodeURIComponent(cleanText)}`;
    const res = await fetch(fallbackUrl);
    if (res.ok) {
      const data = await res.json();
      if (typeof data === "string" && data.trim()) return data.trim();
      if (Array.isArray(data) && typeof data[0] === "string" && data[0].trim()) return data[0].trim();
      if (Array.isArray(data?.[0]) && typeof data[0][0] === "string" && data[0][0].trim()) return data[0][0].trim();
    }
  } catch (_e) {
    // Ignore fallback failure
  }

  throw new Error(`On-demand translation failed for ${normalizedFromLang} -> ${normalizedToLang}`);
};

/**
 * Cache for translated sentences: key -> translated string
 */
const sentenceCache = new Map<string, string>();

/**
 * Currently in-flight promises to avoid duplicate requests
 */
const inFlightRequests = new Map<string, Promise<string>>();

/**
 * Map of videoId -> language -> { [sentenceIndex]: translatedText }
 */
const videoOnDemandTranslations = new Map<string, Map<string, Map<number, string>>>();

function getCacheKey(fromLang: string, toLang: string, text: string): string {
  return `${normalizeLanguage(fromLang)}->${normalizeLanguage(toLang)}:${text.trim()}`;
}

export function getCachedTranslation(
  fromLang: string,
  toLang: string,
  text: string,
): string | null {
  const key = getCacheKey(fromLang, toLang, text);
  return sentenceCache.get(key) || null;
}

export function setCachedTranslation(
  fromLang: string,
  toLang: string,
  text: string,
  translation: string,
): void {
  const key = getCacheKey(fromLang, toLang, text);
  sentenceCache.set(key, translation);
}

export function getStoredOnDemandTranslation(
  videoId: string,
  toLang: string,
  sentenceIndex: number,
): string | null {
  const langMap = videoOnDemandTranslations.get(videoId);
  if (!langMap) return null;
  const sentenceMap = langMap.get(normalizeLanguage(toLang));
  if (!sentenceMap) return null;
  return sentenceMap.get(sentenceIndex) || null;
}

export function getAllStoredOnDemandTranslations(
  videoId: string,
  toLang: string,
): Map<number, string> {
  const langMap = videoOnDemandTranslations.get(videoId);
  if (!langMap) return new Map();
  const sentenceMap = langMap.get(normalizeLanguage(toLang));
  return sentenceMap || new Map();
}

export interface LookaheadTranslationParams {
  videoId: string;
  fromLang: string;
  toLang: string;
  sentences: string[];
  startIndex: number;
  sentencesAhead?: number; // Configured X=10 sentences ahead
  isSentenceEligibleForTts?: (index: number, text: string) => boolean;
  onSentenceTranslated?: (index: number, translatedText: string) => void;
}

/**
 * Translates the next configured X=10 sentences ahead on demand
 * for a target language where YouTube timedtext has not yet been fetched.
 * STRICT POLICY: Only translates sentences that will actually act as TTS input!
 */
export async function translateSentencesAhead({
  videoId,
  fromLang,
  toLang,
  sentences,
  startIndex,
  sentencesAhead = 10,
  isSentenceEligibleForTts,
  onSentenceTranslated,
}: LookaheadTranslationParams): Promise<Map<number, string>> {
  if (!sentences || sentences.length === 0) {
    return new Map();
  }

  const normToLang = normalizeLanguage(toLang);
  const normFromLang = normalizeLanguage(fromLang);

  if (normToLang === normFromLang) {
    return new Map();
  }

  // Ensure storage maps exist
  if (!videoOnDemandTranslations.has(videoId)) {
    videoOnDemandTranslations.set(videoId, new Map());
  }
  const langMap = videoOnDemandTranslations.get(videoId)!;
  if (!langMap.has(normToLang)) {
    langMap.set(normToLang, new Map());
  }
  const sentenceMap = langMap.get(normToLang)!;

  const validStart = Math.max(0, startIndex);
  const endIndex = Math.min(sentences.length - 1, validStart + sentencesAhead);

  const translationPromises: Promise<void>[] = [];

  for (let idx = validStart; idx <= endIndex; idx++) {
    // If a sentence will NOT act as TTS input, do not translate it on demand!
    if (isSentenceEligibleForTts && !isSentenceEligibleForTts(idx, sentences[idx] || "")) {
      continue;
    }

    const rawText = sentences[idx];
    if (!rawText) continue;
    // MANDATORY APPLICATION STAGE: Special characters removal MUST happen BEFORE translation stage.
    const text = removeSpecialCharacters(rawText);
    if (!text || text.trim().length === 0) continue;

    // 1. Check if already translated in memory for this video
    if (sentenceMap.has(idx)) {
      onSentenceTranslated?.(idx, sentenceMap.get(idx)!);
      continue;
    }

    // 2. Check global sentence cache
    const cached = getCachedTranslation(fromLang, toLang, text);
    if (cached) {
      sentenceMap.set(idx, cached);
      onSentenceTranslated?.(idx, cached);
      continue;
    }

    // 3. Check in-flight or trigger Google Translate
    const cacheKey = getCacheKey(fromLang, toLang, text);
    let promise = inFlightRequests.get(cacheKey);

    if (!promise) {
      promise = translateWithGoogle({ text, fromLang, toLang })
        .then((translated) => {
          setCachedTranslation(fromLang, toLang, text, translated);
          sentenceMap.set(idx, translated);
          inFlightRequests.delete(cacheKey);
          logForeignTrack(toLang, "on_demand_translated", { fromLang, index: idx });
          onSentenceTranslated?.(idx, translated);
          return translated;
        })
        .catch((err) => {
          inFlightRequests.delete(cacheKey);
          logForeignTrack(toLang, "on_demand_translation_failed", {
            fromLang,
            index: idx,
            error: err?.message || String(err),
          });
          logWarn(
            "onDemandTranslation",
            `Failed on-demand translate for index ${idx}: ${err?.message || err}`,
          );
          throw err;
        });

      inFlightRequests.set(cacheKey, promise);
    } else {
      promise = promise.then((translated) => {
        sentenceMap.set(idx, translated);
        onSentenceTranslated?.(idx, translated);
        return translated;
      });
    }

    translationPromises.push(promise.then(() => {}).catch(() => {}));
  }

  await Promise.all(translationPromises);
  return sentenceMap;
}

/**
 * Clears on-demand translations (e.g. when full YouTube subtitles arrive)
 */
export function clearOnDemandTranslations(videoId?: string, toLang?: string): void {
  if (videoId && toLang) {
    const langMap = videoOnDemandTranslations.get(videoId);
    if (langMap) {
      langMap.delete(normalizeLanguage(toLang));
    }
  } else if (videoId) {
    videoOnDemandTranslations.delete(videoId);
  } else {
    videoOnDemandTranslations.clear();
  }
}
