import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

console.log("====================================================");
console.log("🧪 Starting Compact Space-Saving Preview Verification (Task 259)");
console.log("====================================================");

const rootDir = process.cwd();
const panelCompPath = path.resolve(rootDir, "src/components/SpecialCharactersRemovalPanel.tsx");
assert.ok(fs.existsSync(panelCompPath), "SpecialCharactersRemovalPanel.tsx must exist");
const panelContent = fs.readFileSync(panelCompPath, "utf-8");

// 1. Verify space-saving collapse toggle and state
console.log("1. Verifying collapsible preview state and toggle button...");
assert.ok(
  panelContent.includes("showPreview") && panelContent.includes("setShowPreview"),
  "SpecialCharactersRemovalPanel must maintain showPreview state for space efficiency",
);
assert.ok(
  panelContent.includes('data-testid="toggle-chars-preview-btn"'),
  "SpecialCharactersRemovalPanel must render toggle button data-testid='toggle-chars-preview-btn'",
);
assert.ok(
  panelContent.includes("ChevronDown") && panelContent.includes("ChevronUp"),
  "SpecialCharactersRemovalPanel must render chevron indicators for collapsed/expanded states",
);
console.log("✅ PASS: Space-saving collapsible toggle is implemented.");

// 2. Verify compact space-saving styling and max-height containment
console.log("2. Verifying compact layout styling and scrollable constraints...");
assert.ok(
  panelContent.includes("max-h-36") && panelContent.includes("overflow-y-auto"),
  "Preview must constrain vertical height with max-h-36 overflow-y-auto to avoid wasting space",
);
assert.ok(
  panelContent.includes("hidden"),
  "Preview list must support hidden class when collapsed to eliminate wasted space",
);
assert.ok(
  panelContent.includes("px-2.5 py-1.5"),
  "Toggle bar must have compact padding (px-2.5 py-1.5) to keep vertical footprint minimal",
);
console.log("✅ PASS: Compact space-saving styling and constraints are in place.");

// 3. Verify component testid and functional integrity
console.log("3. Verifying all existing testids and required strings are intact...");
assert.ok(
  panelContent.includes('data-testid="special-characters-removal-panel"'),
  "Must preserve 'special-characters-removal-panel' testid",
);
assert.ok(
  panelContent.includes('data-testid="advanced-toggle-strip-brackets"'),
  "Must preserve 'advanced-toggle-strip-brackets' testid",
);
assert.ok(
  panelContent.includes('data-testid="advanced-remove-chars-chips"'),
  "Must preserve 'advanced-remove-chars-chips' testid",
);
assert.ok(
  panelContent.includes('data-testid="advanced-btn-add-char-rule"'),
  "Must preserve 'advanced-btn-add-char-rule' testid",
);
assert.ok(
  panelContent.includes('data-testid="advanced-chars-removal-preview"'),
  "Must preserve 'advanced-chars-removal-preview' testid",
);
assert.ok(
  panelContent.includes("sampleCues.slice(0, 3)") &&
    panelContent.includes("Load subtitles to see the sanitization preview.") &&
    !panelContent.includes("fallbackSamples"),
  "Sanitization previews must use authentic loaded cues without synthetic fallbacks",
);
console.log("✅ PASS: All required testids and functional contracts preserved.");

// 4. Verify 5-target version synchronization (2.0.50)
console.log("4. Verifying version synchronization across all 5 targets (2.0.50)...");
const pkg = JSON.parse(fs.readFileSync(path.resolve(rootDir, "package.json"), "utf-8"));
const activeVer = pkg.version;
assert.ok(activeVer && typeof activeVer === "string", "package.json version must be valid");
assert.strictEqual(activeVer, "2.0.50", "package.json version must be 2.0.50");

const gradle = fs.readFileSync(path.resolve(rootDir, "android-shell/app/build.gradle.kts"), "utf-8");
assert.ok(gradle.includes('versionCode = 20050'), "gradle must have versionCode 20050");
assert.ok(gradle.includes(`versionName = "${activeVer}"`), `gradle must have versionName ${activeVer}`);

const appConfig = fs.readFileSync(path.resolve(rootDir, "src/config/appConfig.ts"), "utf-8");
assert.ok(appConfig.includes(`APP_VERSION = "${activeVer}"`), `appConfig.ts must have APP_VERSION ${activeVer}`);

const apkUpdater = fs.readFileSync(path.resolve(rootDir, "src/utils/apkUpdater.ts"), "utf-8");
assert.ok(apkUpdater.includes(`CURRENT_APK_VERSION = "v${activeVer}"`), `apkUpdater.ts must have CURRENT_APK_VERSION v${activeVer}`);

const appSettings = fs.readFileSync(path.resolve(rootDir, "src/utils/appSettings.ts"), "utf-8");
assert.ok(appSettings.includes(`version: "${activeVer}"`), `appSettings.ts must have version ${activeVer}`);
console.log(`✅ PASS: Version ${activeVer} is synchronized across all 5 targets.`);

console.log("====================================================");
console.log("🎉 All Compact Space-Saving Preview Verifications PASSED!");
console.log("====================================================");
