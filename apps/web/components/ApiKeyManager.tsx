"use client";

import { useState, useTransition } from "react";
import { Copy, Eye, EyeOff, KeyRound, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  createApiKey,
  deleteApiKey,
  regenerateApiKey,
  setApiKeyEnabled,
} from "../lib/api-key-actions";
import type { ApiKeyDto } from "../lib/catalog";

function maskKey(key: string): string {
  if (key.length <= 20) return key;
  return `${key.slice(0, 13)}${"•".repeat(24)}${key.slice(-4)}`;
}

function formatDate(value: string | null): string {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}

export function ApiKeyManager({
  publisherId,
  publisherName,
  initialApiKey,
}: {
  publisherId: string;
  publisherName: string;
  initialApiKey: ApiKeyDto | null;
}) {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handle(action: () => Promise<{ apiKey: ApiKeyDto } | { error: string } | undefined>) {
    setError(undefined);
    startTransition(async () => {
      const result = await action();
      if (result && "error" in result) {
        setError(result.error);
      } else if (result && "apiKey" in result) {
        setApiKey(result.apiKey);
        setRevealed(true);
      } else {
        setApiKey(null);
      }
    });
  }

  async function copyKey() {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3 rounded-lg border border-border/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <KeyRound className="size-4 shrink-0 text-muted-foreground" />
          <p className="truncate text-sm font-medium">{publisherName}</p>
        </div>
        {apiKey && (
          <Badge variant={apiKey.enabled ? "default" : "outline"} className="shrink-0">
            {apiKey.enabled ? "Enabled" : "Disabled"}
          </Badge>
        )}
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      {!apiKey ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            No API key yet — generate one to allow programmatic access to this organization's
            journals.
          </p>
          <Button
            size="sm"
            disabled={pending}
            onClick={() => handle(() => createApiKey(publisherId))}
            className="shrink-0"
          >
            Generate
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="flex-1 truncate rounded-md bg-secondary/50 px-3 py-2 font-mono text-xs">
              {revealed ? apiKey.key : maskKey(apiKey.key)}
            </code>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRevealed((v) => !v)}
                title={revealed ? "Hide" : "Reveal"}
              >
                {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={copyKey}>
                <Copy className="size-3.5" /> {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Created {formatDate(apiKey.createdAt)} · Last used {formatDate(apiKey.lastUsedAt)}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pending}
              onClick={() => handle(() => setApiKeyEnabled(publisherId, !apiKey.enabled))}
            >
              {apiKey.enabled ? "Disable" : "Enable"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => {
                if (window.confirm("Regenerate this key? The current key will stop working immediately.")) {
                  handle(() => regenerateApiKey(publisherId));
                }
              }}
            >
              <RefreshCw className="size-3.5" /> Regenerate
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              className="text-destructive hover:bg-destructive/10 border-destructive/30"
              onClick={() => {
                if (window.confirm("Delete this API key? This can't be undone.")) {
                  handle(() => deleteApiKey(publisherId));
                }
              }}
            >
              <Trash2 className="size-3.5" /> Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
