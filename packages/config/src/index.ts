import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

let envLoaded = false;
function autoLoadEnvFile(): void {
  if (envLoaded) return;
  envLoaded = true;

  if (typeof (process as unknown as { loadEnvFile?: (path?: string) => void }).loadEnvFile !== "function") return;

  let currentDir = process.cwd();
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(currentDir, ".env");
    if (fs.existsSync(candidate)) {
      try {
        (process as unknown as { loadEnvFile: (path?: string) => void }).loadEnvFile(candidate);
        break;
      } catch {
        // Ignore if unreadable
      }
    }
    const parent = path.dirname(currentDir);
    if (parent === currentDir) break;
    currentDir = parent;
  }
}

/**
 * Parse environment variables against a schema, failing fast with a readable
 * error listing every missing/invalid variable.
 */
export function loadEnv<T extends z.ZodTypeAny>(
  schema: T,
  source: NodeJS.ProcessEnv = process.env,
): z.infer<T> {
  autoLoadEnvFile();
  const result = schema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${details}`);
  }
  return result.data;
}
