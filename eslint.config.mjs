import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      // Reglas con soporte de AUTO-FIX (Estas sí cambiarán solas al usar --fix)
      "prefer-const": "error", // Cambia 'let' por 'const' automáticamente si la variable no muta
      "no-extra-semi": "error", // Elimina puntos y comas repetidos de más
      "arrow-body-style": ["error", "as-needed"], // Simplifica las funciones flecha si es posible

      // Reglas informativas (No se auto-arreglan, debes resolverlas tú)
      "@typescript-eslint/no-unused-vars": "warn", // Te avisa si importaste algo en tus pruebas que no estás usando
      "@typescript-eslint/no-explicit-any": "warn", // Te avisa si estás usando tipos 'any' sueltos
    },
  },
);
