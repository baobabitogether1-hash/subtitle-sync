import assert from "assert";
import fs from "fs";
import path from "path";
import {
  isLanguageSpoken,
  getLanguageTtsRatio,
  isTtsSpeakableLanguage,
  extractLanguageCodeString,
  extractLanguageCodeList,
} from "../src/lib/playback-preferences";

console.log("====================================================");
console.log("🧪 Starting Hotfix Verification: isLanguageSpoken Robustness");
console.log("====================================================");

// 1. extractLanguageCodeString tests
console.log("Checking extractLanguageCodeString...");
assert.strictEqual(extractLanguageCodeString("  en  "), "en");
assert.strictEqual(extractLanguageCodeString({ code: "  he  " }), "he");
assert.strictEqual(extractLanguageCodeString({ lang: "  es  " }), "es");
assert.strictEqual(extractLanguageCodeString({ value: "  fr  " }), "fr");
assert.strictEqual(extractLanguageCodeString(null), "");
assert.strictEqual(extractLanguageCodeString(undefined), "");
assert.strictEqual(extractLanguageCodeString(123), "");
assert.strictEqual(extractLanguageCodeString({}), "");
console.log("✅ PASS: extractLanguageCodeString is robust against diverse inputs");

// 2. extractLanguageCodeList tests
console.log("Checking extractLanguageCodeList...");
assert.deepStrictEqual(extractLanguageCodeList(["en", "  he  ", null, { code: "es" }]), ["en", "he", "es"]);
assert.deepStrictEqual(extractLanguageCodeList("en"), ["en"]);
assert.deepStrictEqual(extractLanguageCodeList(null), []);
console.log("✅ PASS: extractLanguageCodeList cleans and normalizes lists");

// 3. isLanguageSpoken standard and alias tests
console.log("Checking isLanguageSpoken standard usage...");
assert.strictEqual(isLanguageSpoken("he", ["he", "it"]), true);
assert.strictEqual(isLanguageSpoken("es", ["he", "it"]), false);
assert.strictEqual(isLanguageSpoken("iw", ["he"]), true, "Hebrew alias iw should match he");
assert.strictEqual(isLanguageSpoken("he", ["iw"]), true, "Hebrew alias he should match iw");
assert.strictEqual(isLanguageSpoken("pt-BR", ["pt"]), true, "pt-BR dialect should match base pt");

// 4. Inverted argument order resilience
console.log("Checking inverted parameter order resilience...");
assert.strictEqual(isLanguageSpoken(["he", "it"], "he"), true);
assert.strictEqual(isLanguageSpoken(["he", "it"], "es"), false);
assert.strictEqual(isLanguageSpoken(["iw"], "he"), true);

// 5. Object arguments resilience (prevents langCode.trim crash)
console.log("Checking object / malformed argument tolerance...");
assert.strictEqual(isLanguageSpoken({ code: "he" }, ["he", "it"]), true);
assert.strictEqual(isLanguageSpoken("he", [{ code: "he" }, { code: "it" }]), true);
assert.strictEqual(isLanguageSpoken(null, ["he"]), false);
assert.strictEqual(isLanguageSpoken("he", null), false);
assert.strictEqual(isLanguageSpoken(undefined, undefined), false);
assert.strictEqual(isLanguageSpoken({}, {}), false);
assert.strictEqual(isLanguageSpoken(123 as unknown, ["he"]), false);
console.log("✅ PASS: isLanguageSpoken never throws on objects, nulls, or non-strings");

// 6. getLanguageTtsRatio resilience
console.log("Checking getLanguageTtsRatio robustness...");
const ratios = { he: 2, "pt-BR": 3 };
assert.strictEqual(getLanguageTtsRatio(ratios, "he"), 2);
assert.strictEqual(getLanguageTtsRatio(ratios, "iw"), 2, "Alias iw resolves to he");
assert.strictEqual(getLanguageTtsRatio(ratios, { code: "he" }), 2, "Object { code } resolves");
assert.strictEqual(getLanguageTtsRatio(ratios, null as unknown), 1);
assert.strictEqual(getLanguageTtsRatio(ratios, undefined as unknown), 1);
assert.strictEqual(getLanguageTtsRatio(ratios, {} as unknown), 1);
console.log("✅ PASS: getLanguageTtsRatio safely handles non-string arguments without throwing");

// 7. isTtsSpeakableLanguage resilience
console.log("Checking isTtsSpeakableLanguage robustness...");
assert.strictEqual(isTtsSpeakableLanguage("he", "en"), true);
assert.strictEqual(isTtsSpeakableLanguage("en", "en"), false);
assert.strictEqual(isTtsSpeakableLanguage({ code: "he" }, "en"), true);
assert.strictEqual(isTtsSpeakableLanguage(null, "en"), true);
console.log("✅ PASS: isTtsSpeakableLanguage safely handles objects and non-strings");

// 8. Version synchronization check
console.log("Checking 5-target version synchronization to 2.0.48...");
const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8"));
assert.strictEqual(pkg.version, "2.0.48", "package.json version must be 2.0.48");

const gradle = fs.readFileSync(path.resolve(process.cwd(), "android-shell/app/build.gradle.kts"), "utf8");
assert.ok(gradle.includes('versionName = "2.0.48"'), "gradle must have versionName 2.0.48");
assert.ok(gradle.includes("versionCode = 20048"), "gradle must have versionCode 20048");

const appConfig = fs.readFileSync(path.resolve(process.cwd(), "src/config/appConfig.ts"), "utf8");
assert.ok(appConfig.includes('APP_VERSION = "2.0.48"'), "appConfig.ts must have APP_VERSION 2.0.48");

const apkUpdater = fs.readFileSync(path.resolve(process.cwd(), "src/utils/apkUpdater.ts"), "utf8");
assert.ok(apkUpdater.includes('CURRENT_APK_VERSION = "v2.0.48"'), "apkUpdater.ts must have v2.0.48");

const appSettings = fs.readFileSync(path.resolve(process.cwd(), "src/utils/appSettings.ts"), "utf8");
assert.ok(appSettings.includes('version: "2.0.48"'), "appSettings.ts must have snapshot version 2.0.48");
console.log("✅ PASS: Version 2.0.48 is synchronized across all 5 targets");

console.log("====================================================");
console.log("🎉 All isLanguageSpoken Hotfix checks passed successfully!");
console.log("====================================================");
