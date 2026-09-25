import { notFound } from "next/navigation";
import { content } from "@/lib/content";
import Site from "@/components/Site";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    title:
      lang === "ar"
        ? "TargetWise — استراتيجية وإبداع وتجارب رقمية"
        : "TargetWise — Strategy, creative & digital",
    ...(base
      ? {
          alternates: {
            canonical: base + "/" + lang,
            languages: { en: base + "/en", ar: base + "/ar" },
          },
        }
      : {}),
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (lang !== "en" && lang !== "ar") notFound();
  return <Site lang={lang} data={await content()} />;
}
