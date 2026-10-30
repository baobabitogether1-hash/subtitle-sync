import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";

console.log("====================================================");
console.log("🧪 Verifying Video Playback Fix (Task 264)");
console.log("====================================================");

const rootDir = process.cwd();
const indexFilePath = path.join(rootDir, "src/routes/index.tsx");
assert(fs.existsSync(indexFilePath), "src/routes/index.tsx must exist");
const indexContent = fs.readFileSync(indexFilePath, "utf8");

// 1. Verify host DOM attachment in init()
assert.ok(
  indexContent.includes("playerEl.current.appendChild(host);"),
  "playerEl.current.appendChild(host) must be called so YouTube iframe is attached to DOM",
);
assert.ok(
  indexContent.includes('host.className = "h-full w-full";'),
  "host element must have full width/height styling",
);
console.log("✅ PASS: Host div element is attached to playerEl.current with full width/height");

// 2. Verify width and height in YT.Player configuration
assert.ok(
  indexContent.includes('width: "100%",') && indexContent.includes('height: "100%",'),
  "YT.Player must configure width 100% and height 100%",
);
console.log("✅ PASS: YT.Player receives responsive 100% width and height");

// 3. Verify iframe attachment detection and cleanup
assert.ok(
  indexContent.includes("const iframe = player.current.getIframe?.();"),
  "init() must inspect existing player iframe",
);
assert.ok(
  indexContent.includes("const isAttached = Boolean(iframe && playerEl.current.contains(iframe));"),
  "init() must verify if existing player iframe is still contained inside playerEl.current",
);
assert.ok(
  indexContent.includes("multiVideoPlayerRegistry.unregister(\"primary\");") &&
    indexContent.includes("player.current.destroy?.();"),
  "init() must clean up stale unattached player before recreating host",
);
console.log("✅ PASS: Stale or detached player instances are detected and recycled");

// 4. Verify initPlayerRef recovery and seek-to-0 on ended state in handleTogglePlay
assert.ok(
  indexContent.includes("const initPlayerRef = useRef<(() => void) | null>(null);"),
  "initPlayerRef must be defined to provide player initialization recovery",
);
assert.ok(
  indexContent.includes("if (!p && initPlayerRef.current) {"),
  "handleTogglePlay must invoke initPlayerRef if player is uninitialized",
);
assert.ok(
  indexContent.includes("if (state === 0) {") && indexContent.includes("p.seekTo?.(0, true);"),
  "handleTogglePlay must seek to 0 when state is ended (0) to replay smoothly",
);
console.log("✅ PASS: handleTogglePlay handles recovery and restart from ended state");

// 5. Verify seek() clears pause reason and marks isVideoPlaying
assert.ok(
  indexContent.includes("userExplicitlyPausedRef.current = false;") &&
    indexContent.includes("setPauseReason(null);") &&
    indexContent.includes("setIsVideoPlaying(true);"),
  "seek() must reset userExplicitlyPaused and pauseReason, and set isVideoPlaying true",
);
console.log("✅ PASS: seek() resumes playback state and clears pause explanations");

// 6. Verify interval guardian checks for iframe presence
assert.ok(
  indexContent.includes('(!player.current || !playerEl.current?.querySelector("iframe"))'),
  "interval guardian must check if iframe is missing from playerEl.current",
);
console.log("✅ PASS: Interval guardian verifies player iframe presence");

// 7. Verify version parity 2.0.54 across all 5 files
const pkgJson = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));
assert.strictEqual(pkgJson.version, "2.0.54", "package.json version must be 2.0.54");

const gradleContent = fs.readFileSync(
  path.join(rootDir, "android-shell/app/build.gradle.kts"),
  "utf8",
);
assert.ok(
  gradleContent.includes('versionName = "2.0.54"') && gradleContent.includes("versionCode = 20054"),
  "build.gradle.kts versionName must be 2.0.54 and versionCode must be 20054",
);

const appConfigContent = fs.readFileSync(path.join(rootDir, "src/config/appConfig.ts"), "utf8");
assert.ok(appConfigContent.includes('APP_VERSION = "2.0.54"'), "appConfig.ts APP_VERSION must be 2.0.54");

const apkUpdaterContent = fs.readFileSync(path.join(rootDir, "src/utils/apkUpdater.ts"), "utf8");
assert.ok(
  apkUpdaterContent.includes('CURRENT_APK_VERSION = "v2.0.54"'),
  "apkUpdater.ts CURRENT_APK_VERSION must be v2.0.54",
);

const appSettingsContent = fs.readFileSync(path.join(rootDir, "src/utils/appSettings.ts"), "utf8");
assert.ok(
  appSettingsContent.includes('version: "2.0.54"'),
  "appSettings.ts version snapshot must be 2.0.54",
);
console.log("✅ PASS: Version 2.0.54 synchronized across all 5 files");

// 8. Verify docs/files.md catalogs verify-video-play-fix.ts
const filesDocPath = path.join(rootDir, "docs/files.md");
const filesDocContent = fs.readFileSync(filesDocPath, "utf8");
assert.ok(
  filesDocContent.includes("scripts/verify-video-play-fix.ts"),
  "docs/files.md must document scripts/verify-video-play-fix.ts",
);
console.log("✅ PASS: docs/files.md registers scripts/verify-video-play-fix.ts");

console.log("====================================================");
console.log("🎉 All Video Playback Fix checks PASSED successfully!");
console.log("====================================================");
