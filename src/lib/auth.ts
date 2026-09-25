import "server-only";
import { cookies } from "next/headers";
import {
  randomBytes,
  createHash,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { db } from "./db";
export const cookieName = "tw_session";
export function digest(s: string) {
  return createHash("sha256").update(s).digest("hex");
}
export function verifyPassword(password: string, stored: string) {
  try {
    const [salt, hash] = stored.split(":");
    const expected = Buffer.from(hash, "hex");
    const actual = scryptSync(password, salt, 64);
    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  } catch {
    return false;
  }
}
export async function authenticated() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !process.env.SESSION_SECRET) return false;
  const d = await db();
  return Boolean(
    await d
      .collection("sessions")
      .findOne({
        token: digest(token + process.env.SESSION_SECRET),
        expires: { $gt: new Date() },
      }),
  );
}
export async function createSession() {
  const token = randomBytes(32).toString("hex");
  const d = await db();
  await d
    .collection("sessions")
    .createIndex({ expires: 1 }, { expireAfterSeconds: 0 });
  await d
    .collection("sessions")
    .insertOne({
      token: digest(token + process.env.SESSION_SECRET),
      expires: new Date(Date.now() + 8 * 3600000),
    });
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 8 * 3600,
  });
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  return !!origin && origin === new URL(req.url).origin;
}
