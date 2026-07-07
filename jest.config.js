const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/tests/unit/**/*.{test,spec}.{ts,tsx}"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/e2e_tests/"],
  coverageDirectory: "<rootDir>/coverage/unit",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/{api,lib,hooks,constants,config,store,types,components/ui}/**/*.{ts,tsx}",
    "src/{middleware,urlRedirect}.ts",
    "src/app/api/**/{route,utils,type,config,provider,stream-transform,model-provider}.ts",
    "src/app/{auth.md,llms.txt,llms-full.txt,mcp}/route.ts",
    "src/app/well-known/**/route.ts",
    "src/app/{error,global-error,not-found}.tsx",
    "src/app/{billing,team-invite,settings/team,user}/**/*.{ts,tsx}",
    "src/app/{gpus-console/instances,gpus-console/serverless,gpus-console/image,gpus-console/storage}/**/*.{ts,tsx}",
    "src/app/{models-console/llm-playground,models-console/multimodal-playground,models-console/llm-dedicated-endpoints}/**/*.{ts,tsx}",
    "src/app/sandbox-console/**/*.{ts,tsx}",
    "src/app/{referral,affiliate,affiliate-new}/**/*.{ts,tsx}",
    "src/app/components/{Permission,TeamAccount,TeamMemberSelector,header,Nav,loginModal,campaigns,consent,analytics}/**/*.{ts,tsx}",
    "src/components/ai-elements/**/*.{ts,tsx}",
    "src/i18n/**/*.{ts,tsx}",
    "src/lib/consent/**/*.{ts,tsx}",
    "!src/i18n/generated/**",
    "!src/**/*.d.ts",
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
