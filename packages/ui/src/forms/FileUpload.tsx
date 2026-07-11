"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { Upload, CheckCircle } from "lucide-react";
import { cn } from "../lib/utils";

interface FileUploadProps {
  /** Accepted file types (e.g., ".pdf,.docx") */
  accept?: string;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Callback with selected file */
  onFileSelect?: (file: File) => void;
  /** Current file name (for controlled display) */
  currentFile?: string;
  /** Label text */
  label?: string;
  /** Whether file upload is disabled */
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  accept = ".pdf,.doc,.docx,.tex,.zip",
  maxSize = 50 * 1024 * 1024, // 50MB
  onFileSelect,
  currentFile,
  label = "Upload manuscript",
  disabled = false,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayFile = selectedFile?.name ?? currentFile;

  function handleFile(file: File) {
    setError(null);
    if (maxSize && file.size > maxSize) {
      setError(`File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`);
      return;
    }
    setSelectedFile(file);
    onFileSelect?.(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleClear() {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={disabled ? undefined : handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors duration-150",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-muted/30",
          disabled && "cursor-not-allowed opacity-50",
          displayFile && "border-success/40 bg-success/5",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />

        {displayFile ? (
          <>
            <div className="flex size-10 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{displayFile}</p>
              {selectedFile && (
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(0)} KB
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="rounded-md px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              Remove
            </button>
          </>
        ) : (
          <>
            <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
              <Upload className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Drop your file here or{" "}
                <span className="text-primary">browse</span>
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, DOCX, LaTeX, or ZIP up to{" "}
                {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
