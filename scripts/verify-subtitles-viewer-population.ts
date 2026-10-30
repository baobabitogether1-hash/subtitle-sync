import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { simpleAlign, DEFAULT_SIMPLE_PARSER_CONFIG } from "../src/utils/newSubtitlesParser";
import type { Json3 } from "../src/lib/subtitles";

console.log("--- Starting Verification: Task 246 Default Subtitles Population & Viewer Visibility ---");

const mockEnTrack: Json3 = {
  events: [
    {
      tStartMs: 0,
      dDurationMs: 2500,
      segs: [{ utf8: "Welcome to parallel subtitles." }],
    },
    {
      tStartMs: 2500,
      dDurationMs: 3000,
      segs: [{ utf8: "This is sentence number two!" }],
    },
  ],
};

// Test 1: Standard alignment with baseLanguage matching track
console.log("Check 1: Standard alignment with baseLanguage matching track...");
const tracks1 = { en: mockEnTrack };
const rows1 = simpleAlign(tracks1, "en", DEFAULT_SIMPLE_PARSER_CONFIG);
assert.strictEqual(rows1.length, 2, "Expected 2 sentence rows");
assert.strictEqual(rows1[0].texts.en, "Welcome to parallel subtitles.", "Row 0 text must match");
assert.strictEqual(rows1[1].texts.en, "This is sentence number two!", "Row 1 text must match");
console.log("✓ Check 1 passed: Standard alignment successfully populates rows.");

// Test 2: Mismatched baseLanguage (e.g. user selected 'he' but only 'en' track has arrived)
console.log("Check 2: Alignment when baseLanguage is missing from tracks...");
const tracks2 = { en: mockEnTrack };
const rows2 = simpleAlign(tracks2, "he", DEFAULT_SIMPLE_PARSER_CONFIG);
assert.strictEqual(rows2.length, 2, "Must not return empty rows when another valid track exists");
assert.strictEqual(rows2[0].texts.en, "Welcome to parallel subtitles.", "Text must be mapped to effectiveBaseLang 'en'");
assert.strictEqual(rows2[0].texts.he, "Welcome to parallel subtitles.", "Text must also be mapped to requested baseLanguage 'he'");
console.log("✓ Check 2 passed: Mismatched baseLanguage gracefully maps effective base track.");

// Test 3: Raw cues fallback when sentence splitter produces 0 segments
console.log("Check 3: Verifying fallback to raw cues when sentence splitting produces 0 segments...");
const mockUnpunctuatedTrack: Json3 = {
  events: [
    {
      tStartMs: 100,
      dDurationMs: 1500,
      segs: [{ utf8: "Unpunctuated single segment" }],
    },
  ],
};
const tracks3 = { en: mockUnpunctuatedTrack };
const rows3 = simpleAlign(tracks3, "en", {
  ...DEFAULT_SIMPLE_PARSER_CONFIG,
  splitOnDot: true,
  splitIntraCue: false,
});
assert.strictEqual(rows3.length, 1, "Must produce 1 row from raw cue fallback");
assert.strictEqual(rows3[0].texts.en, "Unpunctuated single segment", "Fallback row must preserve text");
console.log("✓ Check 3 passed: Raw cue fallback guarantees non-empty rows for valid subtitle tracks.");

// Test 4: Inspect src/routes/index.tsx baseLanguage & hasLegitimateSubtitles implementations
console.log("Check 4: Inspecting src/routes/index.tsx implementations...");
const indexSrc = fs.readFileSync(path.resolve("src/routes/index.tsx"), "utf8");

assert.ok(
  indexSrc.includes("if (explicitBaseLanguage && tracks?.[explicitBaseLanguage])"),
  "baseLanguage must verify explicitBaseLanguage exists in tracks",
);
assert.ok(
  indexSrc.includes("const hasAnySubtitles = useMemo"),
  "hasAnySubtitles must be defined to check track cues and defaultCaptionsLoaded",
);
assert.ok(
  indexSrc.includes("const hasLegitimateSubtitles = useMemo(() => {"),
  "hasLegitimateSubtitles must be derived from hasAnySubtitles",
);
assert.ok(
  indexSrc.includes("logSubtitlePopulation"),
  "index.tsx must log subtitle population events",
);
console.log("✓ Check 4 passed: index.tsx baseLanguage and hasLegitimateSubtitles logic verified.");

console.log("--- Task 246 Verification Completed Successfully! ---");
