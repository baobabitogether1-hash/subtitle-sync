import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

console.log("=========================================================================");
console.log("🧪 Verifying Elevated Frontend Aesthetic Polish & Modern Design (Task 261)");
console.log("=========================================================================");

const rootDir = process.cwd();

// 1. Verify App Version 2.0.52 Synchronization across all 5 files
console.log("\n--> [Step 1] Verifying Version 2.0.52 synchronization across all 5 files...");

const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf-8"));
assert.equal(packageJson.version, "2.0.52", "package.json version must be 2.0.52");

const buildGradle = fs.readFileSync(path.join(rootDir, "android-shell/app/build.gradle.kts"), "utf-8");
assert.ok(buildGradle.includes('versionName = "2.0.52"'), "build.gradle.kts must have versionName = '2.0.52'");
assert.ok(buildGradle.includes("versionCode = 20052"), "build.gradle.kts must have versionCode = 20052");

const appConfig = fs.readFileSync(path.join(rootDir, "src/config/appConfig.ts"), "utf-8");
assert.ok(appConfig.includes('export const APP_VERSION = "2.0.52";'), "appConfig.ts must export APP_VERSION = '2.0.52'");

const apkUpdater = fs.readFileSync(path.join(rootDir, "src/utils/apkUpdater.ts"), "utf-8");
assert.ok(apkUpdater.includes('export const CURRENT_APK_VERSION = "v2.0.52";'), "apkUpdater.ts must have CURRENT_APK_VERSION = 'v2.0.52'");

const appSettings = fs.readFileSync(path.join(rootDir, "src/utils/appSettings.ts"), "utf-8");
assert.ok(appSettings.includes('version: "2.0.52"'), "appSettings.ts must export version = '2.0.52'");
console.log("✅ PASS: App version 2.0.52 synchronized across all 5 files.");

// 2. Verify Sticky Glassmorphism Header in src/routes/index.tsx
console.log("\n--> [Step 2] Verifying Sticky Glassmorphism Header styling in src/routes/index.tsx...");
const indexRoutes = fs.readFileSync(path.join(rootDir, "src/routes/index.tsx"), "utf-8");
assert.ok(
  indexRoutes.includes("sticky top-0 z-40") &&
  indexRoutes.includes("backdrop-blur-md") &&
  indexRoutes.includes("bg-background/85"),
  "Header in src/routes/index.tsx must use sticky top-0 with backdrop-blur-md glassmorphism",
);
assert.ok(
  indexRoutes.includes('data-testid="top-screen-video-title"') &&
  indexRoutes.includes('data-testid="header-app-version-badge"') &&
  indexRoutes.includes('data-testid="header-mode-toggle"'),
  "Header must retain critical test IDs for video title, version badge, and mode toggle",
);
console.log("✅ PASS: Sticky glassmorphism header verified.");

// 3. Verify SubtitleRow Active Highlight and Layout Polish
console.log("\n--> [Step 3] Verifying SubtitleRow styling and active row highlight...");
const subtitleRow = fs.readFileSync(path.join(rootDir, "src/components/SubtitleRow.tsx"), "utf-8");
assert.ok(
  subtitleRow.includes("transition-colors duration-150") &&
  subtitleRow.includes("bg-primary/[0.08]"),
  "SubtitleRow must use smooth transition and refined active row highlight",
);
assert.ok(
  subtitleRow.includes('data-testid="cue-row-timestamp"') &&
  subtitleRow.includes("tabular-nums"),
  "SubtitleRow must format timestamp with tabular-nums",
);
assert.ok(
  subtitleRow.includes("data-tts-pronounced") &&
  subtitleRow.includes("data-tts-pronounced-highlight") &&
  subtitleRow.includes("data-tts-eligible") &&
  subtitleRow.includes("data-tts-role"),
  "SubtitleRow must retain all TTS attributes for playback synchronization",
);
console.log("✅ PASS: SubtitleRow active styling and attribute integrity verified.");

// 4. Verify Beginner Navigation and Controls
console.log("\n--> [Step 4] Verifying Beginner Tab Navigation styling...");
const beginnerNav = fs.readFileSync(path.join(rootDir, "src/components/beginner/BeginnerTabNav.tsx"), "utf-8");
assert.ok(beginnerNav.includes('data-testid="beginner-tab-nav"'), "BeginnerTabNav must retain test ID");
assert.ok(beginnerNav.includes("beginner-tab-${tab.id}"), "Tab button dynamic test id must exist");
console.log("✅ PASS: Beginner navigation verified.");

console.log("\n=========================================================================");
console.log("🎉 ALL ELEVATED FRONTEND DESIGN CHECKS PASSED (100%)!");
console.log("=========================================================================");
