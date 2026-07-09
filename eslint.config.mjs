import { ignores, nodeConfig, appConfig } from "./config/eslint/base.mjs";

export default [
  ignores,
  ...nodeConfig(["packages/**/*.{ts,tsx}", "services/**/*.{ts,tsx}"]),
  ...appConfig(["apps/**/*.{ts,tsx}"]),
];
