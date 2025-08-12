/* eslint-disable */
module.exports = {
    root: true,
    env: { browser: true, es2022: true, node: true },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: [
            "./tsconfig.json",
            "./packages/*/tsconfig.json"
        ]
    },
    settings: {
        react: { version: "detect" }
    },
    plugins: ["@typescript-eslint", "react", "react-hooks", "unused-imports", "import"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "prettier"
    ],
    rules: {
        "react/react-in-jsx-scope": "off",
        "unused-imports/no-unused-imports": "warn",
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        "import/order": [
            "warn",
            {
                groups: [
                    ["builtin", "external"],
                    ["internal"],
                    ["parent", "sibling", "index"],
                    ["object", "type"]
                ],
                alphabetize: { order: "asc", caseInsensitive: true },
                "newlines-between": "always"
            }
        ]
    },
    ignorePatterns: [
        "**/dist/**",
        "**/build/**",
        "**/*.config.*",
        "**/*.cjs",
        "**/*.mjs",
        "**/*.js",
        "**/*.d.ts",
        "node_modules/**",
        "e2e/**"
    ]
};
