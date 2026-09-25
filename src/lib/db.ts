import "server-only";
import { MongoClient } from "mongodb";
const g = globalThis as typeof globalThis & {
  mongoPromise?: Promise<MongoClient>;
};
export async function db() {
  if (!process.env.MONGODB_URI) throw new Error("Database is not configured");
  if (!g.mongoPromise) {
    const c = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 7000,
    });
    g.mongoPromise = c.connect().catch((e) => {
      g.mongoPromise = undefined;
      throw e;
    });
  }
  return (await g.mongoPromise).db(process.env.MONGODB_DB || "targetwise");
}
