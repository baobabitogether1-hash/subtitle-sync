import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  countWords,
  isSentenceWithinWordLimit,
  splitCuesIntoSentences,
  simpleAlign,
  DEFAULT_SIMPLE_PARSER_CONFIG,
  type SimpleParserConfig,
} from "../src/utils/newSubtitlesParser";
import type { SubtitleCue } from "../src/types";

console.log("====================================================");
console.log("🧪 Starting Max Words Per Sentence Verification (Task 258)");
console.log("====================================================");

// 1. Test countWords utility
console.log("1. Testing countWords utility...");
assert.strictEqual(countWords(""), 0, "Empty string has 0 words");
assert.strictEqual(countWords("   "), 0, "Whitespace only string has 0 words");
assert.strictEqual(countWords("hello"), 1, "Single word has 1 word");
assert.strictEqual(countWords("hello world"), 2, "Two words have 2 words");
assert.strictEqual(countWords("  This is a   sentence with  spaces.  "), 6, "Calculates correct word count ignoring spaces");
assert.strictEqual(countWords("Word! Another? Yes."), 3, "Words with trailing punctuation counted as 3 words");
assert.equal(isSentenceWithinWordLimit("one two three", 3), true, "Exact-limit sentences remain eligible");
assert.equal(isSentenceWithinWordLimit("one two three four", 3), false, "Over-limit sentences are excluded");
assert.equal(isSentenceWithinWordLimit("one two three four", 0), true, "A zero limit disables TTS word filtering");
console.log("✅ PASS: countWords correctly calculates word counts.");

const routeContent = fs.readFileSync(path.join(process.cwd(), "src/routes/index.tsx"), "utf8");
assert.ok(
  /isSentenceWithinWordLimit\(\s*sourceSentences\[idx\]\s*\|\|\s*""/.test(routeContent),
  "On-demand translations must skip source sentences exceeding the parser word limit",
);
assert.ok(
  routeContent.includes("isSentenceWithinWordLimit(baseText, maxTtsWordsRef.current)"),
  "Playback TTS must skip base sentences exceeding the parser word limit",
);

// 2. Test splitCuesIntoSentences with maxWordsPerSentence filtering
console.log("2. Testing splitCuesIntoSentences sentence discarding based on word limit...");
const sampleCues: SubtitleCue[] = [
  {
    start: 0,
    duration: 3,
    text: "Short sentence one. This is a much longer sentence that definitely contains more than five words.",
  },
  {
    start: 3,
    duration: 3,
    text: "Tiny two. Another very lengthy sentence with excessive word count that exceeds our threshold.",
  },
  {
    start: 6,
    duration: 2,
    text: "Just three words.",
  },
];

// Config with maxWordsPerSentence = 5
const configLimit5: SimpleParserConfig = {
  ...DEFAULT_SIMPLE_PARSER_CONFIG,
  enabled: true,
  maxWordsPerSentence: 5,
};

const sentencesLimit5 = splitCuesIntoSentences(sampleCues, configLimit5);
console.log(`Parsed sentences count with limit 5: ${sentencesLimit5.length}`);

// Sentences with > 5 words must be discarded:
for (const sent of sentencesLimit5) {
  const words = countWords(sent.text);
  assert.ok(
    words <= 5,
    `Sentence '${sent.text}' has ${words} words, which exceeds the max limit of 5!`,
  );
}
assert.ok(sentencesLimit5.length > 0, "Should have kept the short sentences");
assert.ok(
  sentencesLimit5.some((s) => s.text.includes("Short sentence one")),
  "Should preserve 'Short sentence one'",
);
assert.ok(
  sentencesLimit5.some((s) => s.text.includes("Tiny two")),
  "Should preserve 'Tiny two'",
);
assert.ok(
  sentencesLimit5.some((s) => s.text.includes("Just three words")),
  "Should preserve 'Just three words'",
);
// Confirm the long sentences were discarded
assert.ok(
  !sentencesLimit5.some((s) => s.text.includes("definitely contains more than")),
  "Long sentence 1 must be discarded",
);
assert.ok(
  !sentencesLimit5.some((s) => s.text.includes("excessive word count")),
  "Long sentence 2 must be discarded",
);
console.log("✅ PASS: Sentences exceeding maxWordsPerSentence are cleanly discarded.");

// When maxWordsPerSentence is 0 or disabled, no filtering occurs
const configNoLimit: SimpleParserConfig = {
  ...DEFAULT_SIMPLE_PARSER_CONFIG,
  enabled: true,
  maxWordsPerSentence: 0,
};
const sentencesNoLimit = splitCuesIntoSentences(sampleCues, configNoLimit);
assert.ok(
  sentencesNoLimit.length > sentencesLimit5.length,
  "No-limit configuration should preserve all parsed sentences",
);
assert.ok(
  sentencesNoLimit.some((s) => s.text.includes("definitely contains more than")),
  "Long sentences must be retained when maxWordsPerSentence is 0",
);
console.log("✅ PASS: Disabling maxWordsPerSentence (0) preserves all sentences.");

// 3. Test simpleAlign integration
console.log("3. Testing simpleAlign integration with maxWordsPerSentence...");
const tracks = {
  en: {
    events: [
      {
        tStartMs: 0,
        dDurationMs: 3000,
        segs: [{ utf8: "Short sentence one. This is a much longer sentence that definitely contains more than five words." }],
      },
      {
        tStartMs: 3000,
        dDurationMs: 3000,
        segs: [{ utf8: "Tiny two. Another very lengthy sentence with excessive word count that exceeds our threshold." }],
      },
      {
        tStartMs: 6000,
        dDurationMs: 2000,
        segs: [{ utf8: "Just three words." }],
      },
    ],
  },
  es: {
    events: [
      {
        tStartMs: 0,
        dDurationMs: 3000,
        segs: [{ utf8: "Frase corta uno. Esta es una frase mucho más larga con muchas palabras." }],
      },
      {
        tStartMs: 3000,
        dDurationMs: 3000,
        segs: [{ utf8: "Pequeña dos. Otra frase muy larga con exceso de palabras." }],
      },
      {
        tStartMs: 6000,
        dDurationMs: 2000,
        segs: [{ utf8: "Solo tres palabras." }],
      },
    ],
  },
};
const alignedRows = simpleAlign(tracks, "en", configLimit5);
assert.strictEqual(alignedRows.length, sentencesLimit5.length, "Aligned rows match discarded sentence count");
for (const row of alignedRows) {
  assert.ok(countWords(row.texts["en"]) <= 5, "Every base language row respects maxWordsPerSentence");
}
console.log("✅ PASS: simpleAlign respects maxWordsPerSentence filtering.");

// 4. Test shared component & usage in Advanced and Beginner modes
console.log("4. Testing shared MaxWordsPerSentenceInput component integration...");
const sharedComponentPath = path.join(process.cwd(), "src/components/shared/MaxWordsPerSentenceInput.tsx");
assert.ok(fs.existsSync(sharedComponentPath), "Shared component file must exist");
const sharedContent = fs.readFileSync(sharedComponentPath, "utf-8");
assert.ok(sharedContent.includes("export const MaxWordsPerSentenceInput"), "Exports MaxWordsPerSentenceInput");
assert.ok(sharedContent.includes('data-testid="max-words-per-sentence-input"'), "Includes data-testid for input");

// Advanced Mode integration
const advancedBarPath = path.join(process.cwd(), "src/components/NewSubtitlesParserBar.tsx");
assert.ok(fs.existsSync(advancedBarPath), "Advanced mode parser bar must exist");
const advancedContent = fs.readFileSync(advancedBarPath, "utf-8");
assert.ok(advancedContent.includes("MaxWordsPerSentenceInput"), "Advanced mode imports MaxWordsPerSentenceInput");
assert.ok(advancedContent.includes("compact"), "Advanced mode uses compact mode for toolbar");

// Beginner Mode integration
const beginnerTabPath = path.join(process.cwd(), "src/components/beginner/tabs/BeginnerParsingTab.tsx");
assert.ok(fs.existsSync(beginnerTabPath), "Beginner mode parsing tab must exist");
const beginnerContent = fs.readFileSync(beginnerTabPath, "utf-8");
assert.ok(beginnerContent.includes("MaxWordsPerSentenceInput"), "Beginner mode imports MaxWordsPerSentenceInput");
assert.ok(
  beginnerContent.indexOf("Character Removal & Renaming") < beginnerContent.indexOf("Shared Max Words Per Sentence Input") ||
  beginnerContent.indexOf("Special Characters") < beginnerContent.indexOf("MaxWordsPerSentenceInput"),
  "Pipeline parity rule: Chars removal appears BEFORE parser options in Beginner mode",
);
console.log("✅ PASS: Shared component properly integrated into Advanced and Beginner modes with pipeline parity.");

// 5. Test 5-target version synchronization (>= 2.0.49)
console.log("5. Testing version synchronization across all 5 targets...");
const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8"));
const activeVer = pkg.version;
assert.ok(activeVer && typeof activeVer === "string", "package.json version must be valid");

const gradle = fs.readFileSync(path.join(process.cwd(), "android-shell/app/build.gradle.kts"), "utf-8");
assert.ok(gradle.includes(`versionName = "${activeVer}"`), `gradle must have versionName ${activeVer}`);

const appConfig = fs.readFileSync(path.join(process.cwd(), "src/config/appConfig.ts"), "utf-8");
assert.ok(appConfig.includes(`APP_VERSION = "${activeVer}"`), `appConfig.ts must have APP_VERSION ${activeVer}`);

const apkUpdater = fs.readFileSync(path.join(process.cwd(), "src/utils/apkUpdater.ts"), "utf-8");
assert.ok(apkUpdater.includes(`CURRENT_APK_VERSION = "v${activeVer}"`), `apkUpdater.ts must have CURRENT_APK_VERSION v${activeVer}`);

const appSettings = fs.readFileSync(path.join(process.cwd(), "src/utils/appSettings.ts"), "utf-8");
assert.ok(appSettings.includes(`version: "${activeVer}"`), `appSettings.ts must have version ${activeVer}`);
console.log(`✅ PASS: Version ${activeVer} is synchronized across all 5 targets.`);

console.log("====================================================");
console.log("🎉 All Max Words Per Sentence Verifications PASSED!");
console.log("====================================================");
