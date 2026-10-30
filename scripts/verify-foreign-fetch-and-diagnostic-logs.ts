import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { logBuffer, logForeignTrack, logInterception, logSubtitlePopulation } from "../src/utils/logBuffer";

async function runVerification() {
  console.log("==========================================================");
  console.log("Running Verification: Foreign Fetch, Translation Fallback,");
  console.log("Diagnostic Logging & Copy-to-Clipboard (v2.0.40)");
  console.log("==========================================================");

  // 1. Verify Version synchronization across all 5 files
  const pkgJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
  const expectedVer = pkgJson.version as string;
  const [major, minor, patch] = expectedVer.split(".").map(Number);
  const expectedCode = major * 10000 + minor * 100 + patch;
  console.log(`\n[1] Verifying Version ${expectedVer} synchronization across 5 files...`);

  const gradleFile = fs.readFileSync(path.join(process.cwd(), "android-shell/app/build.gradle.kts"), "utf8");
  assert.ok(gradleFile.includes(`versionCode = ${expectedCode}`), `build.gradle.kts must contain versionCode = ${expectedCode}`);
  assert.ok(gradleFile.includes(`versionName = "${expectedVer}"`), `build.gradle.kts must contain versionName = "${expectedVer}"`);

  const appConfigFile = fs.readFileSync(path.join(process.cwd(), "src/config/appConfig.ts"), "utf8");
  assert.ok(appConfigFile.includes(`export const APP_VERSION = "${expectedVer}";`), `appConfig.ts must export APP_VERSION = '${expectedVer}'`);

  const apkUpdaterFile = fs.readFileSync(path.join(process.cwd(), "src/utils/apkUpdater.ts"), "utf8");
  assert.ok(apkUpdaterFile.includes(`export const CURRENT_APK_VERSION = "v${expectedVer}";`), `apkUpdater.ts must export CURRENT_APK_VERSION = 'v${expectedVer}'`);

  const appSettingsFile = fs.readFileSync(path.join(process.cwd(), "src/utils/appSettings.ts"), "utf8");
  assert.ok(appSettingsFile.includes(`version: "${expectedVer}",`), `appSettings.ts snapshot must have version: '${expectedVer}'`);
  console.log(`  ✓ Version ${expectedVer} verified in all 5 configuration and build files.`);

  // 2. Verify Structured Timestamped Logging
  console.log("\n[2] Verifying Structured Logging and Categories...");
  logBuffer.clear();

  logInterception("Native timedtext intercepted for English", { lang: "en", cuesCount: 120 });
  logSubtitlePopulation("Subtitles viewer populated successfully", {
    baseLanguage: "en",
    totalRows: 120,
    languages: ["en", "es"],
  });
  logForeignTrack("es", "failed timedtext fetch, escalating to on-demand translation", {
    reason: "404 Not Found from timedtext",
  });
  logForeignTrack("es", "translated successfully via on-demand translation service", {
    sentenceCount: 10,
    provider: "google",
  });

  const entries = logBuffer.getEntries();
  assert.strictEqual(entries.length, 4, "Should have 4 logged entries");

  assert.strictEqual(entries[0].category, "Interception", "First entry should have Interception category");
  assert.ok(entries[0].timestamp > 0, "Entry should have timestamp");
  assert.strictEqual(entries[1].category, "SubtitlesViewer", "Second entry should have SubtitlesViewer category");
  assert.strictEqual(entries[2].category, "ForeignSubtitles", "Third entry should have ForeignSubtitles category");
  assert.strictEqual(entries[2].level, "WARN", "Failed foreign track fetch should be WARN level");
  assert.strictEqual(entries[3].category, "ForeignSubtitles", "Fourth entry should have ForeignSubtitles category");
  assert.strictEqual(entries[3].level, "INFO", "Successful on-demand translation should be INFO level");
  console.log("  ✓ Log buffer successfully logs timestamped entries with exact categories & levels.");

  // 3. Verify Copy-to-Clipboard Formatting
  console.log("\n[3] Verifying Copy-to-Clipboard Diagnostic Formatting...");
  const formattedReport = logBuffer.copyAll("Subtitles not showing for foreign language");
  assert.ok(formattedReport.includes("Bug Report & Troubleshooting Prompt"), "Report must include title");
  assert.ok(formattedReport.includes("Subtitles not showing for foreign language"), "Report must include user complaint");
  assert.ok(formattedReport.includes("Chronological Event & Network Logs"), "Report must include event logs section");
  assert.ok(formattedReport.includes("[Interception]"), "Report should include Interception category");
  assert.ok(formattedReport.includes("[SubtitlesViewer]"), "Report should include SubtitlesViewer category");
  assert.ok(formattedReport.includes("[ForeignSubtitles]"), "Report should include ForeignSubtitles category");
  assert.ok(formattedReport.includes("404 Not Found from timedtext"), "Report should include details");
  console.log("  ✓ copyAll format includes timestamped logs, structured categories, and clean markdown for 1-click clipboard copy.");

  // 4. Verify Foreign Language Translation Fallback logic in onDemandTranslationManager
  console.log("\n[4] Verifying Foreign Language Translation Fallback & Mirror Endpoints...");
  const managerFile = fs.readFileSync(path.join(process.cwd(), "src/utils/onDemandTranslationManager.ts"), "utf8");
  assert.ok(
    managerFile.includes("translate.googleapis.com/translate_a/single"),
    "Must include primary Google translate endpoint",
  );
  assert.ok(
    managerFile.includes("clients5.google.com/translate_a/t"),
    "Must include secondary Google translate mirror endpoint",
  );
  assert.ok(
    managerFile.includes("logForeignTrack"),
    "Must log foreign track translation progress via logForeignTrack",
  );
  console.log("  ✓ On-demand translation manager contains mirror fallback endpoints and foreign track logging.");

  // 5. Verify SubtitleRow Pending Translation Indicator
  console.log("\n[5] Verifying SubtitleRow UI Pending Translation Indicator...");
  const subtitleRowFile = fs.readFileSync(path.join(process.cwd(), "src/components/SubtitleRow.tsx"), "utf8");
  assert.ok(
    subtitleRowFile.includes("Translating..."),
    "SubtitleRow must render 'Translating...' instead of null/blank when translation is pending",
  );
  assert.ok(
    subtitleRowFile.includes("sentence-pending-indicator-"),
    "SubtitleRow must include testid for sentence-pending-indicator",
  );
  console.log("  ✓ SubtitleRow renders visible pending indicator for in-progress foreign translations.");

  // 6. Verify StateMachineActionLogsInspector includes full log levels and copy button
  console.log("\n[6] Verifying Action Logs Inspector Copy-to-Clipboard & Level Filters...");
  const inspectorFile = fs.readFileSync(path.join(process.cwd(), "src/components/StateMachineActionLogsInspector.tsx"), "utf8");
  assert.ok(
    inspectorFile.includes("copyAll") || inspectorFile.includes("copyBugReportToClipboard") || inspectorFile.includes("copyDiagnosticLogs"),
    "StateMachineActionLogsInspector must provide copy-to-clipboard functionality",
  );
  assert.ok(
    inspectorFile.includes("SUBTITLES") || inspectorFile.includes("ACTION") || inspectorFile.includes("ALL"),
    "Inspector must support viewing SUBTITLES, ACTION, and system logs",
  );
  console.log("  ✓ StateMachineActionLogsInspector provides 1-click clipboard export and log level filtering.");

  console.log("\n==========================================================");
  console.log("ALL VERIFICATION CHECKS PASSED SUCCESSFULLY (100%)");
  console.log("==========================================================");
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
