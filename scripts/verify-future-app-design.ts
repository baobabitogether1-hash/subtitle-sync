import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

async function verifyFutureAppDesign() {
  console.log("=========================================================================");
  console.log("🧪 Task 249: Verifying Winning App Design Blueprint on docs/future.md");
  console.log("=========================================================================");

  const rootDir = process.cwd();
  const futureDocPath = path.resolve(rootDir, "docs/future.md");

  // 1. Check existence and location
  console.log("\n[1] Verifying docs/future.md existence and location...");
  assert.ok(fs.existsSync(futureDocPath), "docs/future.md must exist under docs/");
  const content = fs.readFileSync(futureDocPath, "utf-8");
  assert.ok(
    content.length > 1500,
    "docs/future.md must be a comprehensive architectural blueprint",
  );
  console.log(`  ✓ docs/future.md exists (${content.length} characters)`);

  // 2. Verify Zero Duplicates rule
  console.log("\n[2] Verifying zero duplicate markdown files...");
  const rootFutureMd = path.resolve(rootDir, "future.md");
  assert.ok(!fs.existsSync(rootFutureMd), "future.md must NEVER exist in the root directory");
  console.log("  ✓ No root duplicate of future.md found.");

  // 3. Verify Required Architectural Pillars
  console.log("\n[3] Verifying core architectural pillars in docs/future.md...");
  const requiredKeywords = [
    "Resilient Ingestion Mesh",
    "Semantic Alignment Matrix",
    "Intelligent WebAudio Ducking",
    "Zen Stage",
    "3-Second Rule",
    "Anki",
    "90-Day Implementation Roadmap",
  ];

  for (const keyword of requiredKeywords) {
    assert.ok(content.includes(keyword), `docs/future.md must detail "${keyword}"`);
    console.log(`  ✓ Found pillar concept: "${keyword}"`);
  }

  // 4. Verify docs/files.md inventory registration
  console.log("\n[4] Verifying documentation inventory registration in docs/files.md...");
  const filesDocPath = path.resolve(rootDir, "docs/files.md");
  const filesDocContent = fs.readFileSync(filesDocPath, "utf-8");
  assert.ok(
    filesDocContent.includes("docs/future.md"),
    "docs/files.md must register docs/future.md in the catalog",
  );
  console.log("  ✓ docs/future.md registered in docs/files.md inventory.");

  // 5. Verify App Version synchronization across all 5 targets
  const pkgJson = JSON.parse(fs.readFileSync(path.resolve(rootDir, "package.json"), "utf8"));
  const expectedVer = pkgJson.version as string;
  const [major, minor, patch] = expectedVer.split(".").map(Number);
  const expectedCode = major * 10000 + minor * 100 + patch;
  console.log(`\n[5] Verifying Version ${expectedVer} synchronization across 5 targets...`);

  const gradleFile = fs.readFileSync(
    path.resolve(rootDir, "android-shell/app/build.gradle.kts"),
    "utf8",
  );
  assert.ok(
    gradleFile.includes(`versionCode = ${expectedCode}`),
    `build.gradle.kts must contain versionCode = ${expectedCode}`,
  );
  assert.ok(
    gradleFile.includes(`versionName = "${expectedVer}"`),
    `build.gradle.kts must contain versionName = "${expectedVer}"`,
  );

  const appConfigFile = fs.readFileSync(path.resolve(rootDir, "src/config/appConfig.ts"), "utf8");
  assert.ok(
    appConfigFile.includes(`export const APP_VERSION = "${expectedVer}";`),
    `appConfig.ts must export APP_VERSION = '${expectedVer}'`,
  );

  const apkUpdaterFile = fs.readFileSync(path.resolve(rootDir, "src/utils/apkUpdater.ts"), "utf8");
  assert.ok(
    apkUpdaterFile.includes(`export const CURRENT_APK_VERSION = "v${expectedVer}";`),
    `apkUpdater.ts must export CURRENT_APK_VERSION = 'v${expectedVer}'`,
  );

  const appSettingsFile = fs.readFileSync(
    path.resolve(rootDir, "src/utils/appSettings.ts"),
    "utf8",
  );
  assert.ok(
    appSettingsFile.includes(`version: "${expectedVer}",`),
    `appSettings.ts snapshot must have version: '${expectedVer}'`,
  );
  console.log(`  ✓ Version ${expectedVer} verified in all 5 configuration and build files.`);

  console.log("\n=========================================================================");
  console.log("🎉 ALL VERIFICATION CHECKS PASSED: docs/future.md is fully compliant!");
  console.log("=========================================================================");
}

verifyFutureAppDesign().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
