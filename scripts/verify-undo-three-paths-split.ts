import fs from "fs";
import path from "path";

console.log("=========================================================================");
console.log("🧪 Task 251: Verifying Reversion of 3-Path Split & Restoration of Clean UI");
console.log("=========================================================================");

const rootDir = process.cwd();
const indexRoutePath = path.join(rootDir, "src/routes/index.tsx");
const indexContent = fs.readFileSync(indexRoutePath, "utf8");

// [1] Verify portal and future files are deleted
console.log("[1] Verifying removal of 3-path portal and preview components...");
const portalPath = path.join(rootDir, "src/components/portal/InterfacePathChooser.tsx");
const futurePath = path.join(rootDir, "src/components/future/FutureExperienceContainer.tsx");
if (fs.existsSync(portalPath)) {
  console.error("FAIL: InterfacePathChooser.tsx still exists!");
  process.exit(1);
}
if (fs.existsSync(futurePath)) {
  console.error("FAIL: FutureExperienceContainer.tsx still exists!");
  process.exit(1);
}
console.log("  ✓ Portal and Future preview components are removed.");

// [2] Verify src/routes/index.tsx workflowMode and branching
console.log("[2] Verifying src/routes/index.tsx workflowMode state & JSX branching...");
if (indexContent.includes('"chooser"') || indexContent.includes("InterfacePathChooser") || indexContent.includes("FutureExperienceContainer")) {
  console.error("FAIL: src/routes/index.tsx still references chooser, InterfacePathChooser, or FutureExperienceContainer!");
  process.exit(1);
}
if (!indexContent.includes('const [workflowMode, setWorkflowMode] = useState<"beginner" | "expert">(')) {
  console.error("FAIL: workflowMode state was not restored to <\"beginner\" | \"expert\">!");
  process.exit(1);
}
if (indexContent.includes('data-testid="choose-path-btn"')) {
  console.error("FAIL: choose-path-btn is still present in header!");
  process.exit(1);
}
if (!indexContent.includes('data-testid="header-mode-toggle"')) {
  console.error("FAIL: header-mode-toggle is missing from header!");
  process.exit(1);
}
console.log("  ✓ src/routes/index.tsx correctly restored to clean 2-mode beginner/expert architecture.");

// [3] Verify ModeSwitcherHeader.tsx typing
console.log("[3] Verifying src/components/ModeSwitcherHeader.tsx...");
const switcherContent = fs.readFileSync(path.join(rootDir, "src/components/ModeSwitcherHeader.tsx"), "utf8");
if (switcherContent.includes('"chooser"') || switcherContent.includes('"future"')) {
  console.error("FAIL: ModeSwitcherHeader.tsx still contains chooser or future types!");
  process.exit(1);
}
if (!switcherContent.includes('currentMode: "beginner" | "expert"')) {
  console.error("FAIL: ModeSwitcherHeader does not have currentMode: \"beginner\" | \"expert\"!");
  process.exit(1);
}
console.log("  ✓ ModeSwitcherHeader.tsx clean 2-mode contract verified.");

// [4] Verify version 2.0.45 synchronization across all 5 targets
console.log("[4] Verifying Version 2.0.45 synchronization across 5 targets...");
const pkgJson = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));
if (pkgJson.version !== "2.0.45") {
  console.error(`FAIL: package.json version is ${pkgJson.version}, expected 2.0.45`);
  process.exit(1);
}

const gradle = fs.readFileSync(path.join(rootDir, "android-shell/app/build.gradle.kts"), "utf8");
if (!gradle.includes('versionName = "2.0.45"') || !gradle.includes("versionCode = 20045")) {
  console.error("FAIL: android-shell/app/build.gradle.kts version was not bumped properly");
  process.exit(1);
}

const appConfig = fs.readFileSync(path.join(rootDir, "src/config/appConfig.ts"), "utf8");
if (!appConfig.includes('APP_VERSION = "2.0.45"')) {
  console.error("FAIL: src/config/appConfig.ts version was not bumped");
  process.exit(1);
}

const apkUpdater = fs.readFileSync(path.join(rootDir, "src/utils/apkUpdater.ts"), "utf8");
if (!apkUpdater.includes('CURRENT_APK_VERSION = "v2.0.45"')) {
  console.error("FAIL: src/utils/apkUpdater.ts version was not bumped");
  process.exit(1);
}

const appSettings = fs.readFileSync(path.join(rootDir, "src/utils/appSettings.ts"), "utf8");
if (!appSettings.includes('version: "2.0.45"')) {
  console.error("FAIL: src/utils/appSettings.ts version was not bumped");
  process.exit(1);
}
console.log("  ✓ Version 2.0.45 verified across all 5 configuration and build files.");

console.log("=========================================================================");
console.log("🎉 ALL VERIFICATION CHECKS PASSED: 3-Path Split successfully undone!");
console.log("=========================================================================");
