import { pino, type Logger } from "pino";

export type { Logger };

export function createLogger(service: string): Logger {
  return pino({
    name: service,
    level: process.env.LOG_LEVEL ?? "info",
  });
}
