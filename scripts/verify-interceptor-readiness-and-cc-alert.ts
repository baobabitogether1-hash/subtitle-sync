import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  setupEarlyCaptionInterceptor,
  registerLiveCaptionInterceptor,
  isCaptionInterceptorReady,
} from "../src/lib/native-captions";
import { logBuffer, logInterception } from "../src/utils/logBuffer";

console.log("--- Starting Verification: Task 245 Subtitle Interception Readiness & CC Alert ---");

// Test 1: Verify early caption interception buffer and draining
console.log("Check 1: Verifying early caption buffer and draining...");
// Reset window environment for mock
(global as any).window = {};
setupEarlyCaptionInterceptor();
assert.strictEqual(isCaptionInterceptorReady(), true, "Caption interceptor must be marked ready");

// Simulate early caption arrival before React mounts
const mockPayload = Buffer.from(
  JSON.stringify({
    url: "https://www.youtube.com/api/timedtext?v=test1234567&lang=en&fmt=json3",
    status: 200,
    rawData: JSON.stringify({ events: [{ tStartMs: 0, dDurationMs: 1000, segs: [{ utf8: "Hello world" }] }] }),
  }),
).toString("base64");

(global as any).window.onNativeCaptionsInterceptedBase64(mockPayload);
assert.strictEqual(
  (global as any).window.__earlyInterceptedCaptions.length,
  1,
  "Early caption must be queued in __earlyInterceptedCaptions buffer",
);

// Register live handler: should immediately receive and drain the queued item
let receivedPayload = "";
const unregister = registerLiveCaptionInterceptor((encoded) => {
  receivedPayload = encoded;
});

assert.strictEqual(receivedPayload, mockPayload, "Queued early caption must be delivered to live handler upon registration");
assert.strictEqual((global as any).window.__earlyInterceptedCaptions.length, 0, "Queue must be drained");

unregister();
console.log("✓ Check 1 passed: Early caption buffering and draining operates reliably without loss.");

// Test 2: Verify src/client.tsx initializes setupEarlyCaptionInterceptor
console.log("Check 2: Inspecting src/client.tsx early interceptor registration...");
const clientSrc = fs.readFileSync(path.resolve("src/client.tsx"), "utf8");
assert.ok(
  clientSrc.includes("setupEarlyCaptionInterceptor"),
  "src/client.tsx must call setupEarlyCaptionInterceptor at bootstrap",
);
console.log("✓ Check 2 passed: src/client.tsx pre-registers caption interceptor.");

// Test 3: Inspect android-shell MainActivity.kt fallback early buffering
console.log("Check 3: Inspecting MainActivity.kt dispatchToJavaScript...");
const mainActivitySrc = fs.readFileSync(
  path.resolve("android-shell/app/src/main/java/com/ytviewer/app/MainActivity.kt"),
  "utf8",
);
assert.ok(
  mainActivitySrc.includes("__earlyInterceptedCaptions"),
  "MainActivity.kt must fallback to __earlyInterceptedCaptions if onNativeCaptionsInterceptedBase64 is not yet registered",
);
console.log("✓ Check 3 passed: MainActivity.kt buffers early payloads safely.");

// Test 4: Inspect src/routes/index.tsx for interceptor readiness, cc_load_policy: 1, and CriticalCaptionsAlert
console.log("Check 4: Inspecting src/routes/index.tsx...");
const indexSrc = fs.readFileSync(path.resolve("src/routes/index.tsx"), "utf8");
assert.ok(
  indexSrc.includes("registerLiveCaptionInterceptor"),
  "src/routes/index.tsx must use registerLiveCaptionInterceptor",
);
assert.ok(
  indexSrc.includes("setupEarlyCaptionInterceptor"),
  "src/routes/index.tsx must ensure interceptor is ready before iframe creation",
);
assert.ok(
  indexSrc.includes("cc_load_policy: 1"),
  "src/routes/index.tsx must set cc_load_policy: 1 to prompt YouTube CC",
);
assert.ok(
  indexSrc.includes("CriticalCaptionsAlert"),
  "src/routes/index.tsx must render CriticalCaptionsAlert component",
);
console.log("✓ Check 4 passed: index.tsx enforces interceptor readiness and renders CriticalCaptionsAlert.");

// Test 5: Inspect CriticalCaptionsAlert.tsx implementation
console.log("Check 5: Inspecting CriticalCaptionsAlert.tsx source...");
const alertSrc = fs.readFileSync(path.resolve("src/components/CriticalCaptionsAlert.tsx"), "utf8");
assert.ok(
  alertSrc.includes('data-testid="critical-enable-captions-alert"'),
  "CriticalCaptionsAlert must contain data-testid='critical-enable-captions-alert'",
);
assert.ok(
  alertSrc.includes('data-testid="btn-recheck-captions"'),
  "CriticalCaptionsAlert must contain data-testid='btn-recheck-captions'",
);
assert.ok(
  alertSrc.includes('data-testid="btn-copy-diagnostic-logs"'),
  "CriticalCaptionsAlert must contain data-testid='btn-copy-diagnostic-logs'",
);
console.log("✓ Check 5 passed: CriticalCaptionsAlert satisfies all required UI contracts.");

// Test 6: Verify logInterception records timestamped action
console.log("Check 6: Verifying logInterception...");
logBuffer.clear();
logInterception("Test interception readiness verification", { videoId: "test1234567" });
const entries = logBuffer.getEntries();
assert.strictEqual(entries.length, 1, "logBuffer must have 1 entry");
assert.strictEqual(entries[0].category, "Interception", "Entry category must be 'Interception'");
assert.strictEqual(entries[0].level, "ACTION", "Entry level must be 'ACTION'");
console.log("✓ Check 6 passed: Structured interception logging operates accurately.");

console.log("--- Task 245 Verification Completed Successfully! ---");
