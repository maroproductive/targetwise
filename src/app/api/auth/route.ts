import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  sameOrigin,
  verifyPassword,
  createSession,
  cookieName,
  digest,
} from "@/lib/auth";
export const runtime = "nodejs";
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  if (
    !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_PASSWORD_HASH ||
    !process.env.SESSION_SECRET ||
    process.env.SESSION_SECRET.length < 32
  )
    return NextResponse.json(
      { error: "Administrator credentials are not configured. See README." },
      { status: 503 },
    );
  try {
    const body = await req.text();
    if (body.length > 2000)
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    const { email, password } = JSON.parse(body);
    if (typeof email !== "string" || typeof password !== "string")
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 },
      );
    const d = await db();
    const window = Math.floor(Date.now() / 900000);
    const key = "admin:" + window;
    await d.collection("loginLimits").createIndex({ key: 1 }, { unique: true });
    await d
      .collection("loginLimits")
      .createIndex({ expires: 1 }, { expireAfterSeconds: 0 });
    const limit = await d
      .collection("loginLimits")
      .findOneAndUpdate(
        { key },
        {
          $inc: { count: 1 },
          $set: { expires: new Date(Date.now() + 1800000) },
        },
        { upsert: true, returnDocument: "after" },
      );
    if ((limit?.count || 0) > 20)
      return NextResponse.json(
        { error: "Too many attempts. Try again in 15 minutes." },
        { status: 429 },
      );
    const valid = verifyPassword(password, process.env.ADMIN_PASSWORD_HASH);
    if (email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase() || !valid)
      return NextResponse.json(
        { error: "Email or password is incorrect." },
        { status: 401 },
      );
    await createSession();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Sign-in unavailable. Check database configuration." },
      { status: 503 },
    );
  }
}
export async function DELETE(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const c = await cookies();
  const token = c.get(cookieName)?.value;
  try {
    if (token)
      await (
        await db()
      )
        .collection("sessions")
        .deleteOne({ token: digest(token + process.env.SESSION_SECRET) });
  } catch {
    return NextResponse.json(
      { error: "Could not end session. Try again." },
      { status: 503 },
    );
  }
  c.delete(cookieName);
  return NextResponse.json({ ok: true });
}
