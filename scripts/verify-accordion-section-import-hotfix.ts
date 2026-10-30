import fs from "fs";
import path from "path";

console.log("=========================================================================");
console.log("🧪 Hotfix: Verifying AccordionSection & Component Imports in index.tsx");
console.log("=========================================================================");

const rootDir = process.cwd();
const indexRoutePath = path.join(rootDir, "src/routes/index.tsx");
const content = fs.readFileSync(indexRoutePath, "utf8");

// [1] Verify AccordionSection import
console.log("[1] Verifying AccordionSection import in src/routes/index.tsx...");
if (!content.includes('import { AccordionSection } from "@/components/AccordionSection";')) {
  console.error("FAIL: AccordionSection is not imported from @/components/AccordionSection");
  process.exit(1);
}
console.log("  ✓ AccordionSection is explicitly imported.");

// [2] Verify StateMachineActionLogsInspector import
console.log("[2] Verifying StateMachineActionLogsInspector import in src/routes/index.tsx...");
if (!content.includes('import { StateMachineActionLogsInspector } from "@/components/StateMachineActionLogsInspector";')) {
  console.error("FAIL: StateMachineActionLogsInspector is not imported from @/components/StateMachineActionLogsInspector");
  process.exit(1);
}
console.log("  ✓ StateMachineActionLogsInspector is explicitly imported.");

// [3] Verify that no JSX component tags are missing imports in index.tsx
console.log("[3] Scanning all JSX component tags in src/routes/index.tsx for definition/imports...");
const header = content.slice(0, content.indexOf("export const Route"));
const body = content.slice(content.indexOf("export const Route"));

const matches = [...body.matchAll(/<([A-Z][a-zA-Z0-9]+)/g)].map((m) => m[1]);
const uniqueTags = [...new Set(matches)];

// Filter out known TypeScript type parameter generics that match <[A-Z]...
const nonComponentTypes = new Set([
  "SpeechSynthesisVoice",
  "Record",
  "Set",
  "Map",
  "HTMLDivElement",
  "YTPlayer",
  "CriteriaId",
  "CriteriaGroupSettings",
  "AlternativeTtsMode",
  "LovableTtsProvider",
  "SimpleParserConfig",
  "SubtitleRequestMode",
  "FetchAttempt",
  "SubtitleFetchStrategyConfig",
  "Theme",
  "SectionOrder",
  "SpeechProgress",
  "Row",
]);

const missingComponents: string[] = [];
for (const tag of uniqueTags) {
  if (nonComponentTypes.has(tag)) continue;
  const inHeader = new RegExp(`\\b${tag}\\b`).test(header);
  const inBodyDecl = new RegExp(`(function|const|class|let|var|type|interface)\\s+${tag}\\b`).test(body);
  if (!inHeader && !inBodyDecl) {
    missingComponents.push(tag);
  }
}

if (missingComponents.length > 0) {
  console.error("FAIL: The following JSX components are used in index.tsx without imports or declarations:", missingComponents);
  process.exit(1);
}
console.log(`  ✓ All ${uniqueTags.length - nonComponentTypes.size} JSX components are defined and imported.`);

// [4] Verify version synchronization across 5 targets
const pkgJson = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));
console.log(`[4] Verifying Version ${pkgJson.version} synchronization across 5 targets...`);
if (!pkgJson.version) {
  console.error("FAIL: package.json version is missing");
  process.exit(1);
}

const gradle = fs.readFileSync(path.join(rootDir, "android-shell/app/build.gradle.kts"), "utf8");
if (!gradle.includes(`versionName = "${pkgJson.version}"`)) {
  console.error("FAIL: android-shell/app/build.gradle.kts version was not bumped properly");
  process.exit(1);
}

const appConfig = fs.readFileSync(path.join(rootDir, "src/config/appConfig.ts"), "utf8");
if (!appConfig.includes(`APP_VERSION = "${pkgJson.version}"`)) {
  console.error("FAIL: src/config/appConfig.ts version was not bumped");
  process.exit(1);
}

const apkUpdater = fs.readFileSync(path.join(rootDir, "src/utils/apkUpdater.ts"), "utf8");
if (!apkUpdater.includes(`CURRENT_APK_VERSION = "v${pkgJson.version}"`)) {
  console.error("FAIL: src/utils/apkUpdater.ts version was not bumped");
  process.exit(1);
}

const appSettings = fs.readFileSync(path.join(rootDir, "src/utils/appSettings.ts"), "utf8");
if (!appSettings.includes(`version: "${pkgJson.version}"`)) {
  console.error("FAIL: src/utils/appSettings.ts version was not bumped");
  process.exit(1);
}
console.log(`  ✓ Version ${pkgJson.version} verified across all 5 configuration and build files.`);

console.log("=========================================================================");
console.log("🎉 ALL HOTFIX VERIFICATION CHECKS PASSED: AccordionSection ReferenceError is fixed!");
console.log("=========================================================================");
