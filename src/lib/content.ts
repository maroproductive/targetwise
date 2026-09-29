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

  // One-time Arabic copy cleanup. Only replace exact legacy strings so any
  // custom text edited in admin remains untouched.
  const arabicCopy = await d.collection("collections").findOne({ key: "arabic-copy" });
  if (!arabicCopy || (arabicCopy.version ?? 0) < 1) {
    const serviceFixes = [
      ["content-creation", "حوّل رسالتك لمحتوى بيهم جمهورك.", "حوّل رسالتك لمحتوى بيهمّ جمهورك."],
      ["branding-design", "هويات بصرية وتصميم غرافيك ومواد للحملات لتعطي مشروعك حضور واضح ومتناسق.", "هويات بصرية، وتصميم غرافيك، ومواد للحملات بتعطي مشروعك حضور واضح ومتناسق."],
      ["social-management", "ابنِ حضور إله هدف واضح.", "ابنِ حضور واضح وإله هدف."],
      ["websites", "اعطِ مشروعك مساحة أفضل للنمو.", "أعطِ مشروعك مساحة أفضل للنمو."],
    ] as const;
    for (const [id, oldText, newText] of serviceFixes) {
      await d.collection("services").updateOne(
        { id, "description.ar": oldText },
        { $set: { "description.ar": newText } },
      );
    }

    const packageFixes = [
      ["foundation", "details.ar", "استراتيجية التسويق والمحتوى\nإدارة السوشال ميديا\nصناعة المحتوى\nالتصميم الغرافيكي\nReels عند الحاجة\nمحتوى AI Premium عند الحاجة\nContent Calendar\nتقرير شهري", "استراتيجية التسويق والمحتوى\nإدارة السوشال ميديا\nصناعة المحتوى\nالتصميم الغرافيكي\nريلز عند الحاجة\nمحتوى احترافي بالذكاء الاصطناعي عند الحاجة\nروزنامة محتوى\nتقرير شهري"],
      ["growth", "description.ar", "حوّل الانتباه إلى Leads. للمشاريع اللي عندها أساس قوي وصارت جاهزة تنمو بشكل فعلي.", "حوّل الانتباه إلى عملاء محتملين. للمشاريع اللي عندها أساس قوي وصارت جاهزة تنمو بشكل فعلي."],
      ["growth", "details.ar", "حملات Meta Ads\nLead Generation\nRetargeting\nCreative Testing\nAudience Testing\nتحسين الحملات\nFunnels\nLanding Pages\nمتابعة الأداء", "حملات Meta Ads\nتوليد العملاء المحتملين\nإعادة الاستهداف\nاختبار المحتوى الإعلاني\nاختبار الجمهور\nتحسين الحملات\nمسارات التحويل\nصفحات الهبوط\nمتابعة الأداء"],
      ["scale", "description.ar", "فريق التسويق تبعك بدون ما تبنيه داخلياً. للمشاريع اللي بحاجة لشريك نمو متكامل.", "فريق التسويق تبعك، من دون ما تضطر تبنيه داخل الشركة. للمشاريع اللي بحاجة لشريك نمو متكامل."],
      ["scale", "details.ar", "استراتيجية تسويق كاملة\nإنتاج المحتوى\nإدارة السوشال ميديا\nعدة حملات إعلانية\nLead Generation\nRetargeting\nFunnels\nWebsites\nBranding\nAI Production\nAnalytics\nGrowth Planning", "استراتيجية تسويق كاملة\nإنتاج المحتوى\nإدارة السوشال ميديا\nعدة حملات إعلانية\nتوليد العملاء المحتملين\nإعادة الاستهداف\nمسارات التحويل\nالمواقع الإلكترونية\nالهوية والعلامة التجارية\nإنتاج بالذكاء الاصطناعي\nتحليل الأداء\nالتخطيط للنمو"],
    ] as const;
    for (const [id, field, oldText, newText] of packageFixes) {
      await d.collection("packages").updateOne(
        { id, [field]: oldText },
        { $set: { [field]: newText } },
      );
    }

    await d.collection("collections").updateOne(
      { key: "arabic-copy" },
      { $set: { key: "arabic-copy", version: 1 } },
      { upsert: true },
    );
  }
  for (const kind of kinds) {
    let marker = await d.collection("collections").findOne({ key: kind });

    // One-time migration for the new Foundation / Growth / Scale model.
    // Existing TargetWise databases may already have an empty packages marker,
    // so seed the default plans once and record the migration version.
    if (kind === "packages" && (!marker || (marker.version ?? 0) < 2)) {
      await initialize("packages");
      marker = await d.collection("collections").findOne({ key: kind });
    }

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
  if (kind === "services" || kind === "packages") {
    for (const item of kind === "services" ? defaults.services : defaults.packages)
      await d
        .collection(kind)
        .updateOne({ id: item.id }, { $setOnInsert: item }, { upsert: true });
  }
  await d
    .collection("collections")
    .updateOne(
      { key: kind },
      { $set: { key: kind, ...(kind === "packages" ? { version: 2 } : {}) } },
      { upsert: true },
    );
}
