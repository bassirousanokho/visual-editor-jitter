module.exports = {
    env: {
        es6: true,
        node: true,
        jest: true,
        browser: true, // Add browser environment
    },
    extends: "eslint:recommended",
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    parserOptions: {
        ecmaVersion: 2017,
        sourceType: "module",
    },
    rules: {
        indent: ["error", 4],
        quotes: ["error", "double"],
        "linebreak-style": [ "off", "unix" ],
        "no-console": "warn",
        "no-unused-vars": "warn",
        "@typescript-eslint/no-unused-vars": [
            "error",
            { vars: "all", args: "after-used", ignoreRestSiblings: false },
        ],
        "@typescript-eslint/explicit-function-return-type": "warn",
        "no-empty": "warn"
    },
};