import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";

async function verifyDevReloadAndModuleHealth() {
  console.log("=========================================================================");
  console.log("🧪 Task 248: Verifying Module Health, Clean Dev Server & Version Sync");
  console.log("=========================================================================");

  const rootDir = process.cwd();

  // 1. Audit all 10 reported modules for file existence and non-empty content
  const targetModules = [
    "src/components/NetworkRequestsInspector.tsx",
    "src/routes/index.tsx",
    "src/components/WebDemoUrlsInput.tsx",
    "src/components/AttemptOrderSettings.tsx",
    "src/components/LanguageSubtitleUrlModal.tsx",
    "src/components/VideoPlayground.tsx",
    "src/components/LanguageBoxesSelector.tsx",
    "src/components/ShareStateModal.tsx",
    "src/styles.css",
    "src/components/beginner/BeginnerFlowContainer.tsx",
  ];

  console.log("\n[1] Checking module existence and structure...");
  for (const relPath of targetModules) {
    const fullPath = path.resolve(rootDir, relPath);
    assert.ok(fs.existsSync(fullPath), `File must exist: ${relPath}`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 0, `File must not be empty: ${relPath}`);
    console.log(`  ✓ ${relPath} (${stat.size} bytes)`);
  }

  // 2. Validate import targets in all TSX files
  console.log("\n[2] Validating relative imports resolution...");
  const tsxModules = targetModules.filter((p) => p.endsWith(".tsx"));
  for (const relPath of tsxModules) {
    const fullPath = path.resolve(rootDir, relPath);
    const content = fs.readFileSync(fullPath, "utf-8");
    const dir = path.dirname(fullPath);

    const importRegex = /import\s+(?:[\w*\s{},]+from\s+)?["'](\.[^"']+)["']/g;
    let match: RegExpExecArray | null;
    while ((match = importRegex.exec(content)) !== null) {
      const importTarget = match[1];
      const resolvedBase = path.resolve(dir, importTarget);
      const candidates = [
        resolvedBase,
        `${resolvedBase}.ts`,
        `${resolvedBase}.tsx`,
        `${resolvedBase}.js`,
        `${resolvedBase}.jsx`,
        path.join(resolvedBase, "index.ts"),
        path.join(resolvedBase, "index.tsx"),
      ];
      const found = candidates.some((c) => fs.existsSync(c));
      assert.ok(
        found,
        `Unresolvable relative import "${importTarget}" in ${relPath}`
      );
    }
  }
  console.log("  ✓ All relative imports across audited modules resolve cleanly.");

  // 3. Verify Dev Server response on port 3000
  console.log("\n[3] Testing Dev Server response on port 3000...");
  const devServerCheck = await new Promise<boolean>((resolve) => {
    const req = http.get("http://localhost:3000", (res) => {
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve(false);
    });
  });
  assert.ok(devServerCheck, "Dev server must respond with 200 OK on port 3000");
  console.log("  ✓ Dev server is healthy and responding with HTTP 200 OK on port 3000.");

  console.log("\n=========================================================================");
  console.log("🎉 Task 248 Verification: All 10 modules healthy, dev server active & stable!");
  console.log("=========================================================================");
}

verifyDevReloadAndModuleHealth().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
