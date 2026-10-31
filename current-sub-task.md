# Current Subtask (`current-sub-task.md`)

- **Status**: [IN PROGRESS]
- **Active Task**: Prompt 3: Configure TTS/video order per language
- **Active Subtask**: Move order configuration into Language Settings and allow each language to speak before or after video playback.
- **Target Files**: To be determined from the shared per-language preference model, language settings UI, and TTS/video scheduling path.
- **Target Files**: `src/lib/playback-preferences.ts`, `src/routes/index.tsx`, `src/components/LanguageTtsOrderSelect.tsx`, `src/components/beginner/PerLanguageTtsPreferences.tsx`, `src/components/beginner/BeginnerPreferencesTab.tsx`, `src/components/beginner/BeginnerFlowContainer.tsx`, `scripts/verify-tts-language-playback-order.ts`, `e2e/web.spec.ts`, `docs/languages-selection-flow.md`, `docs/files.md`.
- **Hypothesis**: The route currently schedules every eligible language using one global `sectionOrder`; a device-persisted language override map can partition each row into before-video and after-video speech while the old global order remains the default for unset languages.
- **Hypothesis**: Playback order is currently global, so mixed language order cannot be configured independently; the scheduler must select each language's position without breaking the existing global default.
- **Focused Check**: Add a dedicated mixed-order scheduling test, then exercise the controls in both Beginner and Advanced mode.
- **Focused Check**: `npm run test:tts-language-playback-order` must prove mixed-order partitioning and fallback behavior; then browser coverage must configure one language each way in Beginner and Advanced.
- **Next**: Trace the current global play-order setting from the Language panel into the TTS scheduler and persisted settings.
- **Next**: Add the typed order preference API and one shared per-language control, then wire both UIs and the playback scheduler.
