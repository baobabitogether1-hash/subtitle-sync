import React, { useState } from "react";
import { Sparkles, SlidersHorizontal, Waves, CheckCircle2, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_VERSION, APP_COMMIT_ID } from "@/config/appConfig";

export type InterfacePath = "beginner" | "expert" | "future";

export interface InterfacePathChooserProps {
  onSelectPath: (path: InterfacePath, remember: boolean) => void;
  currentPath?: InterfacePath | "chooser";
  className?: string;
}

export const InterfacePathChooser: React.FC<InterfacePathChooserProps> = ({
  onSelectPath,
  currentPath = "chooser",
  className = "",
}) => {
  const [rememberChoice, setRememberChoice] = useState<boolean>(true);
  const [hoveredPath, setHoveredPath] = useState<InterfacePath | null>(null);

  const paths: Array<{
    id: InterfacePath;
    title: string;
    badge: string;
    badgeColor: string;
    icon: React.ReactNode;
    subtitle: string;
    description: string;
    highlights: string[];
    buttonText: string;
    buttonClass: string;
    accentClass: string;
    borderClass: string;
  }> = [
    {
      id: "beginner",
      title: "Beginner Experience",
      badge: "Guided & Friendly",
      badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
      icon: <Sparkles className="w-5 h-5 text-emerald-500" />,
      subtitle: "Simple, step-by-step setup for casual language learners",
      description:
        "Isolates the core video player into a clean, 2-tab flow with automated caption discovery and clear language selection. Zero cognitive fatigue.",
      highlights: [
        "Streamlined Video & General Preferences tabs",
        "Automatic default subtitle detection",
        "Clean side-by-side subtitle cards",
      ],
      buttonText: "Enter Beginner Mode",
      buttonClass: "bg-emerald-600 hover:bg-emerald-500 text-white",
      accentClass: "hover:border-emerald-500/40 focus-within:border-emerald-500",
      borderClass: "border-emerald-500/20",
    },
    {
      id: "future",
      title: "Future Experience",
      badge: "Zen Stage (docs/future.md)",
      badgeColor: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20",
      icon: <Waves className="w-5 h-5 text-cyan-500" />,
      subtitle: "Next-gen immersion without hard-to-govern controls",
      description:
        "Expresses the winning parts of all architectures: fluid continuous video playback, non-blocking audio ducking, and clean dual karaoke subtitles with zero friction.",
      highlights: [
        "Distraction-free theater canvas",
        "Non-blocking audio-ducked narration preview",
        "Zero clunky knobs or timing complexity",
      ],
      buttonText: "Explore Future Experience",
      buttonClass: "bg-cyan-600 hover:bg-cyan-500 text-white",
      accentClass: "hover:border-cyan-500/40 focus-within:border-cyan-500 ring-1 ring-cyan-500/20",
      borderClass: "border-cyan-500/30",
    },
    {
      id: "expert",
      title: "Advanced Studio",
      badge: "Full Power & Diagnostics",
      badgeColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
      icon: <SlidersHorizontal className="w-5 h-5 text-indigo-500" />,
      subtitle: "Comprehensive workspace for deep customization and control",
      description:
        "Full suite of fine-tuned controls: real-time timedtext network inspector, timing synchronization lab, on-demand AI translation, and raw cue parsing.",
      highlights: [
        "Network requests & status action log inspector",
        "Full accordion configuration panels",
        "Sub-segment audio pacing & fallback controls",
      ],
      buttonText: "Launch Advanced Studio",
      buttonClass: "bg-indigo-600 hover:bg-indigo-500 text-white",
      accentClass: "hover:border-indigo-500/40 focus-within:border-indigo-500",
      borderClass: "border-indigo-500/20",
    },
  ];

  return (
    <div
      className={`min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto ${className}`}
      data-testid="interface-path-chooser-container"
    >
      {/* Header Section */}
      <div className="text-center space-y-3 mb-6 sm:mb-8 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-medium text-foreground">
          <span>Parallel Subtitles Studio</span>
          <span className="text-muted-foreground">•</span>
          <span className="font-mono text-[11px] text-muted-foreground">v{APP_VERSION}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Choose Your Interface Experience
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          The core subtitle synchronization engine is fully implemented. Select the interface mode
          tailored to your learning style or workflow. You can change your path at any time.
        </p>
      </div>

      {/* 3-Column Path Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {paths.map((p) => {
          const isSelected = currentPath === p.id;
          return (
            <div
              key={p.id}
              onMouseEnter={() => setHoveredPath(p.id)}
              onMouseLeave={() => setHoveredPath(null)}
              data-testid={`path-card-${p.id}`}
              className={`flex flex-col justify-between rounded-xl border bg-card p-5 sm:p-6 transition-all duration-200 shadow-sm hover:shadow-md ${
                p.borderClass
              } ${p.accentClass} ${isSelected ? "ring-2 ring-primary bg-primary/5" : ""}`}
            >
              <div className="space-y-4">
                {/* Card Header & Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="p-2 rounded-lg bg-muted/60">{p.icon}</div>
                  <span
                    className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${p.badgeColor}`}
                  >
                    {p.badge}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-foreground">{p.title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.subtitle}</p>
                </div>

                <p className="text-xs text-foreground/80 leading-relaxed border-t border-border/50 pt-3">
                  {p.description}
                </p>

                {/* Highlights List */}
                <ul className="space-y-2 pt-1 text-xs">
                  {p.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-tight text-foreground/90">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-4 border-t border-border/40">
                <Button
                  type="button"
                  onClick={() => onSelectPath(p.id, rememberChoice)}
                  data-testid={`btn-select-path-${p.id}`}
                  className={`w-full font-medium text-xs h-9 gap-1.5 cursor-pointer shadow-sm ${p.buttonClass}`}
                >
                  <span>{p.buttonText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Controls & User Preference */}
      <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberChoice}
            onChange={(e) => setRememberChoice(e.target.checked)}
            data-testid="remember-path-choice-checkbox"
            className="rounded border-input text-primary focus:ring-primary h-4 w-4"
          />
          <span className="text-foreground/90">
            Remember my choice on this device (you can switch back anytime from the top bar)
          </span>
        </label>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="font-mono text-muted-foreground">Commit #{APP_COMMIT_ID}</span>
          <span>•</span>
          <a
            href="https://github.com/mostuf2556/subtitle-sync"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
