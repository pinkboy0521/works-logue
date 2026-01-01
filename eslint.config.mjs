import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import boundaries from "eslint-plugin-boundaries";
import _import from "eslint-plugin-import";
import react from "eslint-plugin-react";
import unusedImports from "eslint-plugin-unused-imports";

const compat = new FlatCompat({
  baseDirectory: process.cwd(),
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ["**/*.config.*", "dist/**", "public/**", "scripts/**"],
  },

  ...fixupConfigRules(
    compat.extends(
      "plugin:react/recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:import/typescript"
    )
  ),

  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      boundaries: fixupPluginRules(boundaries),
      react: fixupPluginRules(react),
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
      import: fixupPluginRules(_import),
      "unused-imports": unusedImports,
    },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    settings: {
      react: { version: "detect" },
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**" },
        { type: "pages", pattern: "src/pages/**" },
        { type: "widgets", pattern: "src/widgets/**" },
        { type: "features", pattern: "src/features/**" },
        { type: "entities", pattern: "src/entities/**" },
        { type: "shared", pattern: "src/shared/**" },
      ],
      "boundaries/include": ["src/**/*"],
      "boundaries/ignore": ["**/*.test.*", "**/*.spec.*"],
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",

      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      "import/order": [
        "error",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc" },
        },
      ],

      "unused-imports/no-unused-imports": "error",
    },
  },
];
