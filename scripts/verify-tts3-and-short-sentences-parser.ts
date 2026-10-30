import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { LOVABLE_TTS_BASE_URL, LOVABLE_TTS_ENDPOINT } from "../src/lib/alternative-tts.js";
import { splitCuesIntoSentences, DEFAULT_SIMPLE_PARSER_CONFIG } from "../src/utils/newSubtitlesParser.js";
import { translateSentencesAhead } from "../src/utils/onDemandTranslationManager.js";
import type { SubtitleCue } from "../src/lib/subtitles.js";

async function main() {
  console.log("--> Starting validation of TTS3 endpoint, short complete sentence parsing, on-demand translation guard, and version sync...");

  // 1. Verify remote TTS endpoint
  console.log("Checking LOVABLE_TTS_BASE_URL...");
  assert.equal(LOVABLE_TTS_BASE_URL, "https://tts3.lovable.app", "LOVABLE_TTS_BASE_URL must be https://tts3.lovable.app");
  assert.equal(LOVABLE_TTS_ENDPOINT, "https://tts3.lovable.app/api/public/tts", "LOVABLE_TTS_ENDPOINT must be https://tts3.lovable.app/api/public/tts");
  console.log("✓ Remote TTS service points to https://tts3.lovable.app");

  // 2. Verify short complete sentence parser (XXX ,YYY? ZZ)
  console.log("Testing splitCuesIntoSentences with XXX ,YYY? ZZ...");
  const sampleCues: SubtitleCue[] = [
    { text: "XXX ,YYY? ZZ", start: 0, duration: 3000 }
  ];

  const config = {
    ...DEFAULT_SIMPLE_PARSER_CONFIG,
    shortCompleteSentences: true,
    splitOnComma: true,
    splitOnColonSemicolon: true,
  };

  const parsed = splitCuesIntoSentences(sampleCues, config);
  const parsedTexts = parsed.map(c => c.text.trim());
  console.log("Parsed clauses:", parsedTexts);

  // Must produce XXX, YYY?, ZZ without slicing mid-phrase or mid-word
  assert.ok(parsedTexts.length === 3, `Expected 3 clauses, got ${parsedTexts.length}: ${JSON.stringify(parsedTexts)}`);
  assert.equal(parsedTexts[0], "XXX", `First clause should be 'XXX', got '${parsedTexts[0]}'`);
  assert.equal(parsedTexts[1], "YYY?", `Second clause should be 'YYY?', got '${parsedTexts[1]}'`);
  assert.equal(parsedTexts[2], "ZZ", `Third clause should be 'ZZ', got '${parsedTexts[2]}'`);

  // Verify anti-patterns are rejected
  for (const text of parsedTexts) {
    assert.ok(!text.includes("XXX, Y"), "Anti-pattern 'XXX, Y' must not occur");
    assert.ok(!text.includes("Y? ZZ"), "Anti-pattern 'Y? ZZ' must not occur");
  }
  console.log("✓ Short complete sentences parsed cleanly without anti-patterns");

  // 3. Verify onDemandTranslationManager skips non-TTS-eligible sentences
  console.log("Testing translateSentencesAhead with isSentenceEligibleForTts filter...");
  const translatedIndices: number[] = [];
  const fakeSentences = ["Sentence 0", "Sentence 1", "Sentence 2", "Sentence 3"];

  // Seed cache so offline tests do not rely on live Google Translate network endpoints
  const { setCachedTranslation } = await import("../src/utils/onDemandTranslationManager.js");
  for (let i = 0; i < fakeSentences.length; i++) {
    setCachedTranslation("en", "es", fakeSentences[i], `[es] ${fakeSentences[i]}`);
  }

  await translateSentencesAhead({
    videoId: "test_verification_video",
    fromLang: "en",
    toLang: "es",
    sentences: fakeSentences,
    startIndex: 0,
    sentencesAhead: 4,
    onSentenceTranslated: (index, _translated) => {
      translatedIndices.push(index);
    },
    isSentenceEligibleForTts: (index) => {
      // Only even indices are eligible for TTS
      return index % 2 === 0;
    },
  });

  console.log("Translated indices:", translatedIndices);
  assert.ok(translatedIndices.includes(0), "Index 0 should be translated");
  assert.ok(!translatedIndices.includes(1), "Index 1 should be skipped because isSentenceEligibleForTts is false");
  assert.ok(translatedIndices.includes(2), "Index 2 should be translated");
  assert.ok(!translatedIndices.includes(3), "Index 3 should be skipped because isSentenceEligibleForTts is false");
  console.log("✓ On-demand translation strictly skips sentences not eligible for TTS");

  // 4. Verify version 2.0.46 across all 5 files
  console.log("Verifying version synchronization across all 5 files...");
  const root = path.resolve(".");

  const pkgJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.equal(pkgJson.version, "2.0.46", "package.json version must be 2.0.46");

  const buildGradle = fs.readFileSync(path.join(root, "android-shell/app/build.gradle.kts"), "utf8");
  assert.ok(buildGradle.includes('versionName = "2.0.46"'), "build.gradle.kts must contain versionName = \"2.0.46\"");
  assert.ok(buildGradle.includes('versionCode = 20046'), "build.gradle.kts must contain versionCode = 20046");

  const appConfig = fs.readFileSync(path.join(root, "src/config/appConfig.ts"), "utf8");
  assert.ok(appConfig.includes('APP_VERSION = "2.0.46"'), "src/config/appConfig.ts must contain APP_VERSION = \"2.0.46\"");

  const apkUpdater = fs.readFileSync(path.join(root, "src/utils/apkUpdater.ts"), "utf8");
  assert.ok(apkUpdater.includes('CURRENT_APK_VERSION = "v2.0.46"'), "src/utils/apkUpdater.ts must contain CURRENT_APK_VERSION = \"v2.0.46\"");

  const appSettings = fs.readFileSync(path.join(root, "src/utils/appSettings.ts"), "utf8");
  assert.ok(appSettings.includes('version: "2.0.46"'), "src/utils/appSettings.ts must contain version: \"2.0.46\"");

  console.log("✓ All 5 files properly synchronized to version 2.0.46");
  console.log("All verifications passed successfully!");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
