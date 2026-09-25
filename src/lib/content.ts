import "server-only";
import { db } from "./db";
import { defaults } from "./defaults";
import { Content, kinds, Item, Settings } from "./schema";
export async function content(admin = false): Promise<Content> {
  if (!process.env.MONGODB_URI) {
    if (admin) throw new Error("Configure MongoDB to edit content");
    return defaults;
  }
  const d = await db();
  const result: Content = structuredClone(defaults);
  const settings = await d.collection("settings").findOne({ key: "site" });
  if (settings) result.settings = settings.data as Settings;
  for (const kind of kinds) {
    const marker = await d.collection("collections").findOne({ key: kind });
    if (marker) {
      const docs = await d
        .collection(kind)
        .find(admin ? {} : { published: true })
        .sort({ order: 1 })
        .toArray();
      result[kind] = docs.map(({ _id, ...v }) => v as Item);
    }
  }
  return result;
}
export async function initialize(kind: string) {
  const d = await db();
  await d.collection(kind).createIndex({ id: 1 }, { unique: true });
  if (kind === "services") {
    for (const item of defaults.services)
      await d
        .collection(kind)
        .updateOne({ id: item.id }, { $setOnInsert: item }, { upsert: true });
  }
  await d
    .collection("collections")
    .updateOne({ key: kind }, { $set: { key: kind } }, { upsert: true });
}
