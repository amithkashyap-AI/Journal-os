import { z } from "zod";
import { baseEnvSchema, loadEnv } from "@rpos/config";
import { findFreePort } from "@rpos/utils";
import { buildApp } from "./app.js";
import { OllamaAiClient } from "./ollama-client.js";

const env = loadEnv(
  baseEnvSchema.extend({
    AI_PORT: z.coerce.number().int().positive().optional(),
    JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
    OLLAMA_BASE_URL: z.string().url().default("http://localhost:11434"),
    OLLAMA_MODEL: z.string().min(1).default("qwen"),
  }),
);

const ai = new OllamaAiClient(env.OLLAMA_BASE_URL, env.OLLAMA_MODEL);

const app = buildApp({
  ai,
  jwtSecret: env.JWT_SECRET,
  logger: true,
});

const port = await findFreePort(env.AI_PORT ?? 4007);
if (env.AI_PORT !== undefined && port !== env.AI_PORT) {
  app.log.warn(`Preferred port ${env.AI_PORT} is in use; bound to free port ${port} instead`);
}

try {
  await app.listen({ port, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

// Best-effort, non-blocking: absorb Ollama's cold-start model-load cost
// (often 60s+) before the first real user request pays for it.
void ai.tightenAbstract("Warming up the local model.").catch((error) => {
  app.log.warn({ err: error }, "AI pre-warm call failed (Ollama may not be running yet)");
});
