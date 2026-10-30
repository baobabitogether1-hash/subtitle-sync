import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

async function verifyInterfacePathChooser() {
  console.log("=========================================================================");
  console.log("🧪 Task 250: Verifying Default Interface Path Chooser Portal Screen");
  console.log("=========================================================================");

  const rootDir = process.cwd();

  // 1. Verify InterfacePathChooser component existence and contents
  console.log("\n[1] Verifying InterfacePathChooser.tsx...");
  const chooserPath = path.resolve(rootDir, "src/components/portal/InterfacePathChooser.tsx");
  assert.ok(fs.existsSync(chooserPath), "InterfacePathChooser.tsx must exist");
  const chooserContent = fs.readFileSync(chooserPath, "utf-8");

  assert.ok(
    chooserContent.includes('data-testid="interface-path-chooser-container"'),
    "Must include interface-path-chooser-container testid",
  );
  assert.ok(
    chooserContent.includes('path-card-') || chooserContent.includes('path-card-${p.id}'),
    "Must include path-card testid",
  );
  assert.ok(
    chooserContent.includes('btn-select-path-') || chooserContent.includes('btn-select-path-${p.id}'),
    "Must include btn-select-path testid",
  );
  assert.ok(
    chooserContent.includes('data-testid="remember-path-choice-checkbox"'),
    "Must include remember-path-choice-checkbox",
  );
  console.log("  ✓ InterfacePathChooser satisfies all required interactive and UI contracts.");

  // 2. Verify FutureExperienceContainer component existence and contents
  console.log("\n[2] Verifying FutureExperienceContainer.tsx...");
  const futurePath = path.resolve(rootDir, "src/components/future/FutureExperienceContainer.tsx");
  assert.ok(fs.existsSync(futurePath), "FutureExperienceContainer.tsx must exist");
  const futureContent = fs.readFileSync(futurePath, "utf-8");

  assert.ok(
    futureContent.includes('data-testid="future-experience-container"'),
    "Must include future-experience-container testid",
  );
  assert.ok(
    futureContent.includes('data-testid="future-switch-path-btn"'),
    "Must include future-switch-path-btn",
  );
  assert.ok(
    futureContent.includes('data-testid="future-player-canvas"'),
    "Must include future-player-canvas",
  );
  console.log("  ✓ FutureExperienceContainer satisfies all required preview contracts.");

  // 3. Verify index.tsx integration and isolated paths
  console.log("\n[3] Verifying src/routes/index.tsx routing and path isolation...");
  const indexPath = path.resolve(rootDir, "src/routes/index.tsx");
  const indexContent = fs.readFileSync(indexPath, "utf-8");

  assert.ok(
    indexContent.includes('data-testid="choose-path-btn"'),
    "index.tsx must render choose-path-btn in the header",
  );
  assert.ok(
    indexContent.includes('data-testid="header-mode-toggle"'),
    "index.tsx must preserve header-mode-toggle for quick mode switching",
  );
  assert.ok(
    indexContent.includes("<InterfacePathChooser"),
    "index.tsx must render InterfacePathChooser when workflowMode is chooser",
  );
  assert.ok(
    indexContent.includes("<BeginnerFlowContainer"),
    "index.tsx must render BeginnerFlowContainer when workflowMode is beginner",
  );
  assert.ok(
    indexContent.includes("<FutureExperienceContainer"),
    "index.tsx must render FutureExperienceContainer when workflowMode is future",
  );
  assert.ok(
    indexContent.includes("}, [videoId, isAndroid, workflowMode, playerContainerNode]);"),
    "Must preserve player lifecycle dependency array exactly",
  );
  console.log("  ✓ index.tsx isolates Beginner, Advanced, and Future paths with top-level Chooser.");

  // 4. Verify docs/files.md registration
  console.log("\n[4] Verifying documentation registration in docs/files.md...");
  const filesDocPath = path.resolve(rootDir, "docs/files.md");
  const filesContent = fs.readFileSync(filesDocPath, "utf-8");
  assert.ok(
    filesContent.includes("InterfacePathChooser.tsx"),
    "docs/files.md must document InterfacePathChooser.tsx",
  );
  assert.ok(
    filesContent.includes("FutureExperienceContainer.tsx"),
    "docs/files.md must document FutureExperienceContainer.tsx",
  );
  console.log("  ✓ Components properly documented in docs/files.md.");

  // 5. Verify App Version 2.0.43 synchronization across all 5 targets
  console.log("\n[5] Verifying Version 2.0.43 synchronization across 5 targets...");
  const pkgJson = JSON.parse(fs.readFileSync(path.resolve(rootDir, "package.json"), "utf8"));
  assert.strictEqual(pkgJson.version, "2.0.43", "package.json version must be 2.0.43");

  const gradleFile = fs.readFileSync(path.resolve(rootDir, "android-shell/app/build.gradle.kts"), "utf8");
  assert.ok(gradleFile.includes("versionCode = 20043"), "build.gradle.kts must contain versionCode = 20043");
  assert.ok(gradleFile.includes('versionName = "2.0.43"'), "build.gradle.kts must contain versionName = \"2.0.43\"");

  const appConfigFile = fs.readFileSync(path.resolve(rootDir, "src/config/appConfig.ts"), "utf8");
  assert.ok(appConfigFile.includes('export const APP_VERSION = "2.0.43";'), "appConfig.ts must export APP_VERSION = '2.0.43'");

  const apkUpdaterFile = fs.readFileSync(path.resolve(rootDir, "src/utils/apkUpdater.ts"), "utf8");
  assert.ok(apkUpdaterFile.includes('export const CURRENT_APK_VERSION = "v2.0.43";'), "apkUpdater.ts must export CURRENT_APK_VERSION = 'v2.0.43'");

  const appSettingsFile = fs.readFileSync(path.resolve(rootDir, "src/utils/appSettings.ts"), "utf8");
  assert.ok(appSettingsFile.includes('version: "2.0.43",'), "appSettings.ts snapshot must have version: '2.0.43'");
  console.log("  ✓ Version 2.0.43 verified in all 5 configuration and build files.");

  console.log("\n=========================================================================");
  console.log("🎉 ALL VERIFICATION CHECKS PASSED: Interface Path Chooser is fully active!");
  console.log("=========================================================================");
}

verifyInterfacePathChooser().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
