import { MongoMemoryServer } from "mongodb-memory-server";
import { spawn } from "node:child_process";
import { scryptSync } from "node:crypto";
const mongo = process.env.TEST_PUBLIC_ONLY
  ? null
  : await MongoMemoryServer.create();
const password = "test-only-password-2026";
const salt = "integration-test-salt";
const server = spawn(
  "node",
  ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", "3100"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      MONGODB_URI: mongo?.getUri() || "",
      MONGODB_DB: "targetwise_test",
      ADMIN_EMAIL: "admin@example.test",
      ADMIN_PASSWORD_HASH:
        salt + ":" + scryptSync(password, salt, 64).toString("hex"),
      SESSION_SECRET: "test-only-secret-012345678901234567890123456789",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3100",
    },
  },
);
async function stop() {
  server.kill();
  await mongo?.stop();
  process.exit();
}
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
