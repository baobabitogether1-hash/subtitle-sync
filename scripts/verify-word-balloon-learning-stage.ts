import fs from "fs";
import path from "path";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
}

console.log("🔍 Verifying Word Balloon Learning Stage Implementation (Task 359)...");

const rootDir = process.cwd();

// 1. Verify WordBalloonLearningView component exists and complies with contract
const componentPath = path.join(rootDir, "src/components/WordBalloonLearningView.tsx");
assert(fs.existsSync(componentPath), "WordBalloonLearningView.tsx must exist");
const componentContent = fs.readFileSync(componentPath, "utf-8");

assert(
  componentContent.includes("export const WordBalloonLearningView"),
  "WordBalloonLearningView component must be exported",
);
assert(
  componentContent.includes("data-testid=\"word-balloon-learning-view\""),
  "WordBalloonLearningView must render container with data-testid='word-balloon-learning-view'",
);
assert(
  componentContent.includes("data-testid=\"word-balloons-container\""),
  "WordBalloonLearningView must render word balloons container with data-testid='word-balloons-container'",
);
assert(
  componentContent.includes("balloon-punch-btn"),
  "WordBalloonLearningView must render balloon punch buttons",
);
assert(
  componentContent.includes("balloon-sound-toggle"),
  "WordBalloonLearningView must render sound effects toggle",
);
assert(
  componentContent.includes("balloon-progress-bar"),
  "WordBalloonLearningView must render punch progress bar",
);
assert(
  componentContent.includes("punch-all-balloons-btn"),
  "WordBalloonLearningView must render punch-all-balloons-btn",
);
assert(
  componentContent.includes("reset-balloons-btn"),
  "WordBalloonLearningView must render reset/re-inflate balloons button",
);
assert(
  componentContent.includes("balloon-back-to-video-btn"),
  "WordBalloonLearningView must render back to video player button",
);
console.log("✅ WordBalloonLearningView component contract verified.");

// 2. Verify Storybook story exists
const storyPath = path.join(rootDir, "src/components/WordBalloonLearningView.stories.tsx");
assert(fs.existsSync(storyPath), "WordBalloonLearningView.stories.tsx must exist");
const storyContent = fs.readFileSync(storyPath, "utf-8");
assert(
  storyContent.includes("WordBalloonLearningView"),
  "Storybook story must import WordBalloonLearningView",
);
console.log("✅ WordBalloonLearningView Storybook story verified.");

// 3. Verify Advanced Mode (src/routes/index.tsx) integration
const indexPath = path.join(rootDir, "src/routes/index.tsx");
assert(fs.existsSync(indexPath), "src/routes/index.tsx must exist");
const indexContent = fs.readFileSync(indexPath, "utf-8");

assert(
  indexContent.includes("stage-step-learning"),
  "src/routes/index.tsx must include stage-step-learning button in Stage Stepper",
);
assert(
  indexContent.includes("toggle-word-balloon-learning-view-btn"),
  "src/routes/index.tsx must include toggle-word-balloon-learning-view-btn in video-display-controls",
);
assert(
  indexContent.includes("<WordBalloonLearningView"),
  "src/routes/index.tsx must mount WordBalloonLearningView in the player slot",
);
console.log("✅ Advanced Mode integration verified.");

// 4. Verify Beginner Mode parity
const beginnerTabPath = path.join(rootDir, "src/components/beginner/tabs/BeginnerVideoTab.tsx");
assert(fs.existsSync(beginnerTabPath), "BeginnerVideoTab.tsx must exist");
const beginnerTabContent = fs.readFileSync(beginnerTabPath, "utf-8");
assert(
  beginnerTabContent.includes("toggle-word-balloon-learning-view-btn"),
  "BeginnerVideoTab.tsx must include toggle-word-balloon-learning-view-btn in video-display-controls",
);

const beginnerContainerPath = path.join(rootDir, "src/components/beginner/BeginnerFlowContainer.tsx");
assert(fs.existsSync(beginnerContainerPath), "BeginnerFlowContainer.tsx must exist");
const beginnerContainerContent = fs.readFileSync(beginnerContainerPath, "utf-8");
assert(
  beginnerContainerContent.includes("showWordBalloonLearningView"),
  "BeginnerFlowContainer.tsx must forward showWordBalloonLearningView",
);
console.log("✅ Beginner Mode parity verified.");

console.log("🎉 All Word Balloon Learning Stage checks passed successfully!");
