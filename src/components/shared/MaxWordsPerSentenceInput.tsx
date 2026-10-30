import React from "react";
import { Minus, Plus, Filter } from "lucide-react";

export interface MaxWordsPerSentenceInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  compact?: boolean;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Shared 'Max Words Per Sentence' input component used across Advanced and Beginner modes.
 * Discards any sentences exceeding this user-defined word count during subtitle parsing.
 */
export const MaxWordsPerSentenceInput: React.FC<MaxWordsPerSentenceInputProps> = ({
  value,
  onChange,
  min = 1,
  max = 100,
  compact = false,
  label = "Max Words Per Sentence",
  disabled = false,
  className = "",
}) => {
  const currentVal = Math.max(min, Math.min(max, typeof value === "number" && !isNaN(value) ? value : min));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (!isNaN(parsed)) {
      onChange(Math.max(min, Math.min(max, parsed)));
    } else if (e.target.value === "") {
      onChange(min);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    onChange(Math.max(min, currentVal - 1));
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    onChange(Math.min(max, currentVal + 1));
  };

  if (compact) {
    return (
      <div
        data-testid="max-words-per-sentence-container"
        className={`inline-flex items-center gap-1.5 ${className}`}
      >
        <label
          htmlFor="max-words-per-sentence-input"
          data-testid="max-words-per-sentence-label"
          className="text-[11px] font-medium text-foreground flex items-center gap-1 cursor-pointer select-none"
          title="Discard any parsed sentences with more than this number of words"
        >
          <Filter className="h-3 w-3 text-primary shrink-0" />
          <span>{label}:</span>
        </label>
        <div className="inline-flex items-center rounded border border-input bg-background/80 shadow-xs">
          <button
            type="button"
            data-testid="max-words-decrement-btn"
            onClick={handleDecrement}
            disabled={disabled || currentVal <= min}
            aria-label="Decrease max words per sentence"
            className="flex h-6 w-5 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="h-2.5 w-2.5" />
          </button>
          <input
            id="max-words-per-sentence-input"
            data-testid="max-words-per-sentence-input"
            type="number"
            min={min}
            max={max}
            value={currentVal}
            onChange={handleInputChange}
            disabled={disabled}
            aria-label={label}
            className="h-6 w-9 border-x border-input bg-transparent text-center font-mono text-[11px] font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            type="button"
            data-testid="max-words-increment-btn"
            onClick={handleIncrement}
            disabled={disabled || currentVal >= max}
            aria-label="Increase max words per sentence"
            className="flex h-6 w-5 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-2.5 w-2.5" />
          </button>
        </div>
        <span className="text-[10px] text-muted-foreground select-none">words</span>
      </div>
    );
  }

  return (
    <div
      data-testid="max-words-per-sentence-container"
      className={`rounded-lg border border-border/70 bg-card/60 p-2.5 transition-all ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor="max-words-per-sentence-input"
          data-testid="max-words-per-sentence-label"
          className="text-xs font-medium text-foreground flex items-center gap-1.5 cursor-pointer select-none"
        >
          <Filter className="h-3.5 w-3.5 text-primary" />
          <span>{label}</span>
        </label>
        <div className="inline-flex items-center rounded-md border border-input bg-background shadow-xs">
          <button
            type="button"
            data-testid="max-words-decrement-btn"
            onClick={handleDecrement}
            disabled={disabled || currentVal <= min}
            aria-label="Decrease max words per sentence"
            className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-l-md"
          >
            <Minus className="h-3 w-3" />
          </button>
          <input
            id="max-words-per-sentence-input"
            data-testid="max-words-per-sentence-input"
            type="number"
            min={min}
            max={max}
            value={currentVal}
            onChange={handleInputChange}
            disabled={disabled}
            aria-label={label}
            className="h-7 w-12 border-x border-input bg-transparent text-center font-mono text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            type="button"
            data-testid="max-words-increment-btn"
            onClick={handleIncrement}
            disabled={disabled || currentVal >= max}
            aria-label="Increase max words per sentence"
            className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-r-md"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground leading-normal">
        Discards any subtitle sentence exceeding <span className="font-semibold text-foreground font-mono">{currentVal}</span> words to keep speech natural and concise.
      </p>
    </div>
  );
};
