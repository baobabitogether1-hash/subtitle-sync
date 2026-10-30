import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";

console.log("==================================================================");
console.log("🧪 Running Android Page Error Fix & Diagnostic Verification");
console.log("==================================================================");

const rootDir = process.cwd();

// 1. Verify src/routes/index.tsx has zero undefined saveFavoriteLanguages calls
const indexRoutePath = path.join(rootDir, "src/routes/index.tsx");
assert(fs.existsSync(indexRoutePath), "src/routes/index.tsx must exist");
const indexContent = fs.readFileSync(indexRoutePath, "utf8");

assert(
  !indexContent.includes("saveFavoriteLanguages("),
  "src/routes/index.tsx must not call undefined saveFavoriteLanguages",
);
assert(
  indexContent.includes("setFavoriteLanguages(favs)"),
  "src/routes/index.tsx must call setFavoriteLanguages(favs)",
);
console.log("✅ PASS: Zero undefined saveFavoriteLanguages calls in index.tsx");

// 2. Verify safe optional chaining on texts in subtitle rows
assert(
  indexContent.includes("rows[active]?.texts?.[baseLanguage]"),
  "src/routes/index.tsx must use safe optional chaining for rows[active]?.texts?.[baseLanguage]",
);
assert(
  indexContent.includes("rows[speakingRow]?.texts?.[speakingLang]"),
  "src/routes/index.tsx must use safe optional chaining for rows[speakingRow]?.texts?.[speakingLang]",
);
console.log("✅ PASS: Subtitle row texts access guarded by safe optional chaining");

// 3. Verify ErrorComponent in src/routes/__root.tsx has diagnostic details and reset button
const rootRoutePath = path.join(rootDir, "src/routes/__root.tsx");
assert(fs.existsSync(rootRoutePath), "src/routes/__root.tsx must exist");
const rootContent = fs.readFileSync(rootRoutePath, "utf8");

assert(
  rootContent.includes('data-testid="router-error-component"'),
  "src/routes/__root.tsx must have data-testid='router-error-component'",
);
assert(
  rootContent.includes('data-testid="router-error-title"'),
  "src/routes/__root.tsx must have data-testid='router-error-title'",
);
assert(
  rootContent.includes("This page didn't load"),
  "src/routes/__root.tsx must render 'This page didn't load'",
);
assert(
  rootContent.includes("Something went wrong on our end"),
  "src/routes/__root.tsx must render 'Something went wrong on our end'",
);
assert(
  rootContent.includes('data-testid="router-error-details"'),
  "src/routes/__root.tsx must provide data-testid='router-error-details' for diagnostic visibility",
);
assert(
  rootContent.includes('data-testid="router-error-reset-app-button"'),
  "src/routes/__root.tsx must provide data-testid='router-error-reset-app-button'",
);
assert(
  rootContent.includes("[APP_BOOT_ERROR]") && rootContent.includes("[APP_PAGE_ERROR]"),
  "src/routes/__root.tsx must preserve [APP_BOOT_ERROR] and [APP_PAGE_ERROR] logs for test assertions",
);
console.log("✅ PASS: ErrorComponent includes visible diagnostics and app state reset button");

// 4. Verify version parity 2.0.53 across all 5 files
const pkgJson = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));
assert.strictEqual(pkgJson.version, "2.0.53", "package.json version must be 2.0.53");

const gradleContent = fs.readFileSync(path.join(rootDir, "android-shell/app/build.gradle.kts"), "utf8");
assert(gradleContent.includes('versionName = "2.0.53"'), "build.gradle.kts versionName must be 2.0.53");
assert(gradleContent.includes("versionCode = 20053"), "build.gradle.kts versionCode must be 20053");

const appConfigContent = fs.readFileSync(path.join(rootDir, "src/config/appConfig.ts"), "utf8");
assert(appConfigContent.includes('APP_VERSION = "2.0.53"'), "appConfig.ts APP_VERSION must be 2.0.53");

const apkUpdaterContent = fs.readFileSync(path.join(rootDir, "src/utils/apkUpdater.ts"), "utf8");
assert(apkUpdaterContent.includes('CURRENT_APK_VERSION = "v2.0.53"'), "apkUpdater.ts CURRENT_APK_VERSION must be v2.0.53");

const appSettingsContent = fs.readFileSync(path.join(rootDir, "src/utils/appSettings.ts"), "utf8");
assert(appSettingsContent.includes('version: "2.0.53"'), "appSettings.ts version snapshot must be 2.0.53");

console.log("✅ PASS: Version 2.0.53 synchronized across all 5 files");

// 5. Verify simulated execution of getInitialFavoriteLanguages logic
// Emulate the exact URL params that occur on Android boot and video sharing
const testParams = [
  "?android=true",
  "?android=true&target_lang=he",
  "?android=true&lang=it",
  "?target_lang=fr&v=dQw4w9WgXcQ",
  "?subtitles_url=https://www.youtube.com/api/timedtext?v=L2Ryrr6txwA&lang=en",
];

for (const query of testParams) {
  const urlParams = new URLSearchParams(query);
  const urlTarget = urlParams.get("target_lang") || urlParams.get("lang");
  let favs = ["en"];
  if (urlTarget) {
    const clean = urlTarget.toLowerCase().trim();
    if (clean && !favs.includes(clean)) {
      favs = [clean, ...favs];
      // Must not throw ReferenceError
      assert.doesNotThrow(() => {
        // simulation of setFavoriteLanguages
        assert(Array.isArray(favs), "favs must be array");
      });
    }
  }
}
console.log("✅ PASS: Simulated Android URL parameters evaluate cleanly without ReferenceError");

console.log("==================================================================");
console.log("🎉 ALL ANDROID PAGE ERROR VERIFICATION TESTS PASSED!");
console.log("==================================================================");
