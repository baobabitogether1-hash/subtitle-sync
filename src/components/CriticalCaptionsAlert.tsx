import React, { useState } from "react";
import { AlertCircle, RefreshCw, Copy, Check, Subtitles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyBugReportToClipboard, logInterception } from "@/utils/logBuffer";

export interface CriticalCaptionsAlertProps {
  videoId: string;
  hasSubtitles: boolean;
  isVideoPlaying?: boolean;
  onRecheck?: () => void;
  onOpenManualUrlModal?: () => void;
}

export function CriticalCaptionsAlert({
  videoId,
  hasSubtitles,
  isVideoPlaying,
  onRecheck,
  onOpenManualUrlModal,
}: CriticalCaptionsAlertProps) {
  const [copied, setCopied] = useState(false);
  const [isRechecking, setIsRechecking] = useState(false);

  if (hasSubtitles || !videoId) {
    return null;
  }

  const handleCopy = async () => {
    const success = await copyBugReportToClipboard(
      `No subtitles captured for video ID ${videoId}. Video playing: ${Boolean(isVideoPlaying)}.`,
    );
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleRecheck = () => {
    setIsRechecking(true);
    logInterception("User triggered manual caption re-check from critical alert", { videoId });
    onRecheck?.();
    setTimeout(() => setIsRechecking(false), 1200);
  };

  return (
    <div
      role="alert"
      data-testid="critical-enable-captions-alert"
      className="rounded-xl border-2 border-amber-500/50 bg-amber-500/10 p-4 text-foreground shadow-sm space-y-3 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-amber-500/20 p-2 text-amber-600 dark:text-amber-400 shrink-0">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <span>Action Required: Turn ON Captions (CC) in Video Player</span>
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:text-amber-300">
                Critical Alert
              </span>
            </h3>
            <span className="text-[11px] font-mono text-muted-foreground">
              Status: {isVideoPlaying ? "Video playing • Waiting for captions" : "Ready • Waiting for CC"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            No subtitles have been captured yet for video{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground font-semibold">
              {videoId}
            </code>
            . To enable synchronization, please click the{" "}
            <strong className="text-foreground">CC (Closed Captions)</strong> button in the YouTube video player to turn captions ON (or toggle CC OFF and then ON again). This directs YouTube to transmit the timedtext stream so our interceptor can capture and formulate the parallel subtitles.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-500/20">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleRecheck}
            disabled={isRechecking}
            data-testid="btn-recheck-captions"
            className="h-8 px-3 text-xs border-amber-500/40 hover:bg-amber-500/15 text-amber-900 dark:text-amber-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRechecking ? "animate-spin" : ""}`} />
            <span>Check Captions Again</span>
          </Button>

          {onOpenManualUrlModal && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onOpenManualUrlModal}
              data-testid="btn-manual-subtitles-url"
              className="h-8 px-3 text-xs border-border hover:bg-muted text-foreground"
            >
              <Subtitles className="h-3.5 w-3.5 mr-1.5 text-primary" />
              <span>Enter Subtitles URL</span>
            </Button>
          )}
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleCopy}
          data-testid="btn-copy-diagnostic-logs"
          className="h-8 px-3 text-xs border-border hover:bg-muted text-foreground"
          title="Copy complete timestamped diagnostics, live state, and network logs to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">Logs Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span>Copy Bug Report &amp; Logs</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
