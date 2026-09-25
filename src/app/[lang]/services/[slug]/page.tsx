import { notFound } from "next/navigation";
import { content } from "@/lib/content";
import Site from "@/components/Site";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const d = await content();
  const s = d.services.find((x) => x.id === slug);
  return { title: s?.title[lang === "ar" ? "ar" : "en"] || "Service" };
}
export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (lang !== "en" && lang !== "ar") notFound();
  const d = await content();
  if (!d.services.some((s) => s.id === slug)) notFound();
  return <Site lang={lang} data={d} serviceId={slug} />;
}
