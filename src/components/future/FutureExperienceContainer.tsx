import React, { useState } from "react";
import { Waves, Sparkles, SlidersHorizontal, ArrowLeft, Volume2, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Json3 } from "@/types";

export interface FutureExperienceContainerProps {
  videoId: string;
  url: string;
  onUrlChange: (newUrl: string) => void;
  onSubmitUrl: (url: string) => void;
  rawTracks?: Record<string, Json3>;
  baseLanguage?: string;
  targetLanguages?: string[];
  observedUrl?: string;
  onSwitchPath: () => void;
  className?: string;
}

export const FutureExperienceContainer: React.FC<FutureExperienceContainerProps> = ({
  videoId,
  url,
  onUrlChange,
  onSubmitUrl,
  rawTracks = {},
  baseLanguage = "en",
  targetLanguages = ["he"],
  observedUrl,
  onSwitchPath,
  className = "",
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(0);
  const [audioDuckingActive, setAudioDuckingActive] = useState<boolean>(true);

  // Extract available cues from base track
  const baseTrack = rawTracks[baseLanguage] || Object.values(rawTracks)[0];
  const targetLang = targetLanguages[0] || "he";
  const targetTrack = rawTracks[targetLang];

  const cues = baseTrack?.events || [];
  const activeCue = cues[activeSentenceIndex] || cues[0];
  const activeBaseText =
    activeCue?.segs?.map((s) => s.utf8).join(" ") ||
    "Select or play a video to view synchronized parallel subtitles.";
  const activeTargetText =
    targetTrack?.events?.[activeSentenceIndex]?.segs?.map((s) => s.utf8).join(" ") ||
    (targetTrack ? "Translating in real-time..." : "Captions ready in background");

  return (
    <div
      className={`max-w-5xl mx-auto p-4 sm:p-6 space-y-6 ${className}`}
      data-testid="future-experience-container"
    >
      {/* Top Banner: Zen Immersion Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl p-3 sm:px-4 text-xs">
        <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
          <Waves className="w-4 h-4 text-cyan-500 shrink-0" />
          <span className="font-semibold">Future Immersion Stage (AuralFlow)</span>
          <span className="hidden sm:inline text-muted-foreground">•</span>
          <span className="hidden sm:inline text-muted-foreground">
            Non-blocking audio ducking & clean dual subtitles
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSwitchPath}
            data-testid="future-switch-path-btn"
            className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-cyan-500/10 gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Path</span>
          </Button>
        </div>
      </div>

      {/* URL Input Bar - Minimal and clean */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-2 shadow-xs">
        <input
          type="text"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmitUrl(url);
          }}
          placeholder="Paste YouTube video URL..."
          data-testid="future-video-url-input"
          className="flex-1 bg-transparent px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <Button
          type="button"
          size="sm"
          onClick={() => onSubmitUrl(url)}
          data-testid="future-load-video-btn"
          className="h-8 px-4 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
        >
          Load Video
        </Button>
      </div>

      {/* Main Theater Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Video Screen Area */}
        <div className="lg:col-span-7 space-y-3">
          <div
            id="future-video-player-container"
            data-testid="future-player-canvas"
            className="w-full aspect-video bg-black/90 rounded-xl overflow-hidden border border-border relative flex items-center justify-center shadow-md"
          >
            {videoId ? (
              <iframe
                id="future-youtube-iframe"
                src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&autoplay=0&cc_load_policy=1&rel=0`}
                title="YouTube Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <div className="text-center p-6 text-muted-foreground space-y-2">
                <Waves className="w-8 h-8 text-cyan-500/60 mx-auto animate-pulse" />
                <p className="text-xs">No video loaded. Enter a YouTube URL above.</p>
              </div>
            )}
          </div>

          {/* Minimal Playback Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 bg-card border border-border rounded-lg text-xs">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-7 w-7 p-0 rounded-full"
                data-testid="future-play-pause-btn"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveSentenceIndex(0)}
                className="h-7 w-7 p-0 rounded-full text-muted-foreground hover:text-foreground"
                title="Restart subtitles from beginning"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
              <span className="text-[11px] text-muted-foreground ml-1">
                Sentence {cues.length > 0 ? activeSentenceIndex + 1 : 0} of {cues.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-muted-foreground select-none">
                <Volume2 className="w-3.5 h-3.5 text-cyan-500" />
                <span>Audio Ducking</span>
                <input
                  type="checkbox"
                  checked={audioDuckingActive}
                  onChange={(e) => setAudioDuckingActive(e.target.checked)}
                  className="rounded border-input text-cyan-600 focus:ring-cyan-500 h-3.5 w-3.5 ml-1"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Zen Dual Karaoke Reader */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
              <span className="text-xs font-semibold text-foreground">Dual Subtitles Reader</span>
              <span className="text-[10px] text-muted-foreground">
                Base ({baseLanguage.toUpperCase()}) • Target ({targetLang.toUpperCase()})
              </span>
            </div>

            {/* Active Sentence Highlight Card */}
            <div className="space-y-3 p-3.5 rounded-lg bg-cyan-500/5 border border-cyan-500/15">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-600 dark:text-cyan-400">
                  Original
                </span>
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {activeBaseText}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-cyan-500/10">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Translation
                </span>
                <p className="text-sm text-foreground/80 leading-relaxed font-sans">
                  {activeTargetText}
                </p>
              </div>
            </div>

            {/* Up next queue / list of sentences */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-medium text-muted-foreground">Sentence Sequence</span>
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {cues.slice(0, 15).map((cue, idx) => {
                  const text = cue.segs?.map((s) => s.utf8).join(" ") || "";
                  const isCurrent = idx === activeSentenceIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSentenceIndex(idx)}
                      className={`w-full text-left p-2 rounded-md transition-all text-[11px] ${
                        isCurrent
                          ? "bg-cyan-500/15 text-cyan-900 dark:text-cyan-200 font-semibold border border-cyan-500/30"
                          : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="opacity-60 mr-2 font-mono">{idx + 1}.</span>
                      <span>{text.slice(0, 75)}{text.length > 75 ? "..." : ""}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
