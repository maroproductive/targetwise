import { randomBytes, scryptSync } from "node:crypto";
import readline from "node:readline";
const input = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
input.question(
  "New admin password (input is visible; use a private terminal): ",
  (password) => {
    if (password.length < 12) {
      console.error("Use at least 12 characters.");
      process.exitCode = 1;
    } else {
      const salt = randomBytes(16).toString("hex");
      console.log(
        "ADMIN_PASSWORD_HASH=" +
          salt +
          ":" +
          scryptSync(password, salt, 64).toString("hex"),
      );
      console.log("SESSION_SECRET=" + randomBytes(32).toString("hex"));
    }
    input.close();
  },
);
