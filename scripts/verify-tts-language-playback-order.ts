import assert from "node:assert/strict";
import {
  getTtsLanguageOrdersPreference,
  partitionTtsLanguagesByOrder,
  setTtsLanguageOrderPreference,
} from "../src/lib/playback-preferences";
import fs from "node:fs";

const values = new Map<string, string>([
  ["yt_tts_language_orders_v1", JSON.stringify({ it: "tts-first", fr: "invalid", " ": "video-first" })],
]);
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  },
});

assert.deepEqual(getTtsLanguageOrdersPreference(), { it: "tts-first" });
setTtsLanguageOrderPreference("es", "video-first");
assert.deepEqual(getTtsLanguageOrdersPreference(), { it: "tts-first", es: "video-first" });

const languages = [{ code: "he" }, { code: "it" }, { code: "es" }];
const overrides = getTtsLanguageOrdersPreference();
assert.deepEqual(
  partitionTtsLanguagesByOrder(languages, overrides, "video-first"),
  {
    ttsFirst: [{ code: "it" }],
    videoFirst: [{ code: "he" }, { code: "es" }],
  },
);
assert.deepEqual(
  partitionTtsLanguagesByOrder(languages, {}, "tts-first"),
  { ttsFirst: languages, videoFirst: [] },
);

const route = fs.readFileSync("src/routes/index.tsx", "utf8");
const beginnerPreferences = fs.readFileSync(
  "src/components/beginner/PerLanguageTtsPreferences.tsx",
  "utf8",
);
assert.match(route, /getEligibleLangs\(idx, "tts-first"\)/);
assert.match(route, /getEligibleLangs\(candidateRow, "video-first"\)/);
assert.match(route, /playedTtsLanguageRecords/);
assert.match(route, /<LanguageTtsOrderSelect/);
assert.match(beginnerPreferences, /<LanguageTtsOrderSelect/);
console.log("PASS: Per-language order persistence, validation, overrides, and global fallback.");