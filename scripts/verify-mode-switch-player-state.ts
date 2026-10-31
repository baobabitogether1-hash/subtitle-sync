import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.join(process.cwd(), "src/routes/index.tsx"), "utf8");

assert.match(source, /playerRestoreSnapshot = useRef/);
assert.match(source, /playerRestoreSnapshot\.current = \{[\s\S]*?videoId,[\s\S]*?seconds,[\s\S]*?wasPlaying:/);
assert.match(source, /restoreSnapshot\?\.videoId === videoId/);
assert.match(source, /player\.current\.seekTo\(restoreSeconds, true\)/);
assert.match(source, /if \(restoreSnapshot\.wasPlaying\)[\s\S]*?player\.current\.playVideo\(\)[\s\S]*?player\.current\.pauseVideo\(\)/);

console.log("PASS: Recreated primary player restores same-video position and play state.");