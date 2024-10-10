import globals from "globals";
import pluginJs from "@eslint/js";
import jestPlugin from "eslint-plugin-jest";
import tsEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser"; // TypeScript parser

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: globals.browser, // Use browser globals if needed
      parser: tsParser, // Use TypeScript parser for .ts files
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs", // CommonJS for JS files
    },
  },
  {
    // Specific config for Jest test files (including __tests__ folder)
    files: ["**/__tests__/**/*.js", "**/*.test.js", "**/*.spec.js"],
    plugins: { jest: jestPlugin },
    languageOptions: {
      globals: { ...globals.jest },
    },
    rules: {
      // Customize Jest-related rules here, if needed
    },
  },
  pluginJs.configs.recommended, // ESLint's recommended config (flat config version)
  {
    files: ["**/*.ts"], // TypeScript-specific configuration
    languageOptions: {
      parser: tsParser, // Use TypeScript parser
    },
    plugins: { "@typescript-eslint": tsEslint }, // Add TypeScript plugin
    rules: {
      // Add TypeScript-specific rules here
      ...tsEslint.configs["recommended"].rules, // Use the recommended rules from TypeScript ESLint
    },
  },
  {
    ignores: ["node_modules/", "dist/"], // Ignore paths
  },
];
