import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.browser, // Retaining the existing browser globals
        process: true,      // Allow process global
        __dirname: true,    // Allow __dirname global
        __filename: true,   // Allow __filename global
      },
    },
  },
  pluginJs.configs.recommended,
];
