# Active Task Mirror (`docs/todo.md`)

- **Status**: [ACTIVE] - Hotfix Task 253: Fix isLanguageSpoken TypeError in index.tsx & playback-preferences.ts
- **Active Task**: Hotfix Task 253: Resolve `TypeError: langCode.trim is not a function` at `isLanguageSpoken`
- **Active Subtask**: Subtask 253.1: Fix argument order in `src/routes/index.tsx` line 3258, make `isLanguageSpoken` in `src/lib/playback-preferences.ts` robust and resilient against inverted parameter ordering, sync version 2.0.47 across all 5 files, and author automated verification test.
- **Target Files**: `src/lib/playback-preferences.ts`, `src/routes/index.tsx`, `package.json`, `android-shell/app/build.gradle.kts`, `src/config/appConfig.ts`, `src/utils/apkUpdater.ts`, `src/utils/appSettings.ts`, `scripts/verify-is-language-spoken-hotfix.ts`
- **Validation**: Dedicated test, `compile_applet`, `lint_applet`
