import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export const ignores = {
  ignores: [
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/coverage/**",
    "**/*.config.{js,mjs,cjs,ts}",
    "**/prisma/migrations/**",
    "**/next-env.d.ts",
  ],
};

const sharedRules = {
  // Existing services lean on `catch (e: any)` and similar; flag it without
  // blocking the build until it's worth a dedicated pass.
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/no-unused-vars": [
    "warn",
    { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
  ],
};

/** Node-side packages and services: TS rules, Node globals. */
export function nodeConfig(files) {
  return tseslint.config(
    ...tseslint.configs.recommended.map((config) => ({ ...config, files })),
    {
      files,
      languageOptions: { globals: { ...globals.node } },
      rules: sharedRules,
    },
  );
}

/** Next.js apps: TS rules plus React Hooks, browser + Node globals (SSR). */
export function appConfig(files) {
  return tseslint.config(
    ...tseslint.configs.recommended.map((config) => ({ ...config, files })),
    {
      files,
      languageOptions: { globals: { ...globals.browser, ...globals.node } },
      plugins: { "react-hooks": reactHooks },
      rules: {
        ...reactHooks.configs.recommended.rules,
        ...sharedRules,
        // TanStack Table/Query's returned functions are inherently unstable
        // across renders; that's how the library works, not a bug to fix.
        "react-hooks/incompatible-library": "off",
      },
    },
  );
}
