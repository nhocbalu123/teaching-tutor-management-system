module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
    transform: {
        "^.+\\.(ts|tsx|js|jsx)$": ["babel-jest", { configFile: "./babel.config.js" }],
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(tsx|ts)?$",
    // Fix: Update roots to point to src/__tests__ instead of __tests__
    roots: ["<rootDir>/src"],
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts", "!**/node_modules/**"],
};
