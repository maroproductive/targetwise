import { NextResponse } from "next/server";
import { authenticated, sameOrigin } from "@/lib/auth";
import { db } from "@/lib/db";
import { kinds, itemSchema, settingsSchema, Kind } from "@/lib/schema";
import { initialize } from "@/lib/content";
export const runtime = "nodejs";
async function mutate(
  req: Request,
  ctx: { params: Promise<{ kind: string }> },
  remove = false,
) {
  if (!sameOrigin(req))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    if (!(await authenticated()))
      return NextResponse.json(
        { error: "Please sign in again." },
        { status: 401 },
      );
    const { kind } = await ctx.params;
    if (kind !== "settings" && !kinds.includes(kind as Kind))
      return NextResponse.json(
        { error: "Unknown collection" },
        { status: 404 },
      );
    const raw = await req.text();
    if (raw.length > 100000)
      return NextResponse.json({ error: "Content too large" }, { status: 413 });
    const input = JSON.parse(raw);
    const d = await db();
    if (kind === "settings") {
      if (remove)
        return NextResponse.json(
          { error: "Settings cannot be deleted" },
          { status: 400 },
        );
      const data = settingsSchema.parse(input);
      await d
        .collection("settings")
        .updateOne({ key: "site" }, { $set: { data } }, { upsert: true });
    } else {
      const marker = await d.collection("collections").findOne({ key: kind });
      if (!marker) await initialize(kind);
      if (remove) {
        const id = itemSchema.shape.id.parse(input.id);
        if (
          kind === "services" &&
          (await d.collection("packages").findOne({ serviceId: id }))
        )
          return NextResponse.json(
            { error: "Delete or reassign this service’s packages first." },
            { status: 409 },
          );
        await d.collection(kind).deleteOne({ id });
      } else {
        const data = itemSchema.parse(input);
        if (
          kind === "packages" &&
          !(await d.collection("collections").findOne({ key: "services" }))
        )
          await initialize("services");
        if (!data.title.en.trim() || !data.title.ar.trim())
          return NextResponse.json(
            { error: "Add a title in both languages." },
            { status: 400 },
          );
        if (
          kind === "packages" &&
          (!data.serviceId ||
            !(await d.collection("services").findOne({ id: data.serviceId })))
        )
          return NextResponse.json(
            { error: "Choose an existing service." },
            { status: 400 },
          );
        await d
          .collection(kind)
          .updateOne({ id: data.id }, { $set: data }, { upsert: true });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error && e.name === "ZodError"
            ? "Check the fields and URLs."
            : "Could not save. Check your database connection.",
      },
      { status: 400 },
    );
  }
}
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ kind: string }> },
) {
  return mutate(req, ctx);
}
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ kind: string }> },
) {
  return mutate(req, ctx, true);
}
