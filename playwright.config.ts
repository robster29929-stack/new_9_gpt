import { defineConfig } from "@playwright/test";
const executable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.BASE_URL || "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    ...(executable
      ? {
          launchOptions: {
            executablePath: executable,
            args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-zygote"],
          },
        }
      : {}),
  },
  ...(process.env.BASE_URL
    ? {}
    : {
        webServer: {
          command: "npm run start -- --hostname 0.0.0.0 --port 4173",
          url: "http://127.0.0.1:4173/login",
          reuseExistingServer: true,
          timeout: 60000,
        },
      }),
  projects: [
    {
      name: "desktop",
      use: { browserName: "chromium", viewport: { width: 1440, height: 1000 } },
    },
    {
      name: "mobile",
      use: { browserName: "chromium", viewport: { width: 390, height: 844 } },
    },
  ],
});
