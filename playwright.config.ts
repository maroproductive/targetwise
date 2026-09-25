import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  workers: 1,
  use: {
    baseURL: "http://localhost:3100",
    headless: true,
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
      args: [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--use-gl=angle",
        "--use-angle=swiftshader",
        "--no-zygote",
      ],
    },
  },
  webServer: {
    command: "node scripts/test-server.mjs",
    url: "http://localhost:3100/en",
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
  reporter: "list",
});
