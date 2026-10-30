import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

console.log("=========================================================================");
console.log("🧪 Verifying Removal of Redundant Enabled-Languages Status Card (Task 241)");
console.log("=========================================================================");

const rootDir = process.cwd();
const indexRoutePath = path.join(rootDir, "src/routes/index.tsx");
const pkgPath = path.join(rootDir, "package.json");
const gradlePath = path.join(rootDir, "android-shell/app/build.gradle.kts");
const appConfigPath = path.join(rootDir, "src/config/appConfig.ts");
const apkUpdaterPath = path.join(rootDir, "src/utils/apkUpdater.ts");
const appSettingsPath = path.join(rootDir, "src/utils/appSettings.ts");

assert.ok(fs.existsSync(indexRoutePath), "src/routes/index.tsx must exist");
const indexContent = fs.readFileSync(indexRoutePath, "utf-8");
const favoritesPanelPath = path.join(rootDir, "src/components/GlobalFavoriteLanguagesPanel.tsx");
const favoritesPanelContent = fs.readFileSync(favoritesPanelPath, "utf-8");

// Check 1: enabled-languages-status-card is removed from Languages accordion
console.log("--> [Check 1] Verifying enabled-languages-status-card is removed...");
assert.ok(
  !indexContent.includes('data-testid="enabled-languages-status-card"'),
  "src/routes/index.tsx must NOT contain enabled-languages-status-card",
);
assert.ok(
  !indexContent.includes('data-testid="quick-add-favorite-select"'),
  "src/routes/index.tsx must NOT contain quick-add-favorite-select in Languages accordion",
);
assert.ok(
  !indexContent.includes('data-testid="reset-video-to-favorites-btn"'),
  "src/routes/index.tsx must NOT contain duplicate reset-video-to-favorites-btn in Languages accordion",
);
assert.ok(
  !indexContent.includes('data-testid="save-current-as-favorites-btn"'),
  "src/routes/index.tsx must NOT contain duplicate save-current-as-favorites-btn in Languages accordion",
);
console.log("✅ PASS: Redundant card and duplicate buttons successfully removed.");

// Check 2: LanguageBoxesSelector remains to select which languages to enable for current video
console.log("--> [Check 2] Verifying LanguageBoxesSelector remains active in Languages accordion...");
assert.ok(
  indexContent.includes("<LanguageBoxesSelector"),
  "src/routes/index.tsx must render LanguageBoxesSelector in Languages accordion",
);
assert.ok(
  indexContent.includes("selectedLanguages={targetLanguages}"),
  "LanguageBoxesSelector must receive selectedLanguages={targetLanguages}",
);
assert.ok(
  indexContent.includes("onSelectionChange={handleTargetLanguagesChange}"),
  "LanguageBoxesSelector must receive onSelectionChange={handleTargetLanguagesChange}",
);
console.log("✅ PASS: LanguageBoxesSelector is properly present for current-video selection.");

// Check 3: Global favorite management is available in Languages, not Settings
console.log("--> [Check 3] Verifying global favorite management is placed under Languages...");
assert.ok(
  /className="hidden pt-2 border-t border-border\/60 space-y-2\.5"[\s\S]*?data-testid="settings-favorites-languages-card"/.test(indexContent),
  "Legacy favorite manager in Settings must remain hidden from users",
);
assert.ok(
  /panelId === "languages"[\s\S]{0,8000}<GlobalFavoriteLanguagesPanel/.test(indexContent),
  "GlobalFavoriteLanguagesPanel must render inside the Languages accordion",
);
assert.ok(
  favoritesPanelContent.includes('data-testid="global-favorite-languages-panel"') &&
    favoritesPanelContent.includes('data-testid="languages-reset-video-to-favorites-btn"') &&
    favoritesPanelContent.includes('data-testid="languages-save-current-as-favorites-btn"') &&
    favoritesPanelContent.includes('data-testid="language-favorites-add-select"'),
  "Languages favorite manager must preserve add/remove and per-video actions",
);
console.log("✅ PASS: Favorite management is no longer rendered in Settings.");

// Check 4: Version synchronization across all 5 files
console.log("--> [Check 4] Verifying version synchronization across all 5 files...");
const pkgJson = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
const expectedVersion = pkgJson.version as string;
assert.match(expectedVersion, /^\d+\.\d+\.\d+$/, "package.json version must be semantic");
const [major, minor, patch] = expectedVersion.split(".").map(Number);
const expectedVersionCode = major! * 10000 + minor! * 100 + patch!;

const gradleContent = fs.readFileSync(gradlePath, "utf-8");
assert.ok(gradleContent.includes(`versionName = "${expectedVersion}"`), "Gradle versionName must match package.json");
assert.ok(gradleContent.includes(`versionCode = ${expectedVersionCode}`), "Gradle versionCode must match package.json");

const appConfigContent = fs.readFileSync(appConfigPath, "utf-8");
assert.ok(appConfigContent.includes(`APP_VERSION = "${expectedVersion}"`), "appConfig.ts must match package.json");

const apkUpdaterContent = fs.readFileSync(apkUpdaterPath, "utf-8");
assert.ok(apkUpdaterContent.includes(`CURRENT_APK_VERSION = "v${expectedVersion}"`), "apkUpdater.ts must match package.json");

const appSettingsContent = fs.readFileSync(appSettingsPath, "utf-8");
assert.ok(appSettingsContent.includes(`version: "${expectedVersion}"`), "appSettings.ts must match package.json");
console.log(`✅ PASS: All 5 files consistently use ${expectedVersion}.`);

console.log("=========================================================================");
console.log("🎉 ALL REDUNDANT LANGUAGES STATUS CARD REMOVAL CHECKS PASSED (100%)!");
console.log("=========================================================================");
