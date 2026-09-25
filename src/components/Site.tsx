"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  Plus,
  Globe,
  Target,
  PenTool,
  Video,
  Layers,
  Monitor,
  CalendarDays,
} from "lucide-react";
import type { Content, Item } from "@/lib/schema";
const icons = [Target, PenTool, Video, Layers, CalendarDays, Monitor];
export default function Site({
  lang,
  data,
  serviceId,
}: {
  lang: "en" | "ar";
  data: Content;
  serviceId?: string;
}) {
  const ar = lang === "ar";
  const t = (en: string, arabic: string) => (ar ? arabic : en);
  const [menu, setMenu] = useState(false);
  const [interest, setInterest] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const [ready, setReady] = useState(false);
  const [wa, setWa] = useState("");
  const service = data.services.find((s) => s.id === serviceId);
  const packages = service
    ? data.packages.filter((p) => p.serviceId === service.id)
    : data.packages;
  const works = service
    ? data.work.filter((w) => w.serviceId === service.id)
    : data.work;
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = ar ? "rtl" : "ltr";
    if ("serviceWorker" in navigator)
      navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, [lang, ar]);
  function enquire(name = "") {
    setInterest(name);
    setReady(false);
    dialog.current?.showModal();
  }
  function prepare(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const msg =
      t(
        "Hello TargetWise, I’d like to discuss my business.",
        "مرحباً TargetWise، حابب ناقش مشروعي معكن.",
      ) +
      "\n" +
      t("Interested in: ", "مهتم بـ: ") +
      (interest || t("Marketing consultation", "استشارة تسويقية")) +
      "\n" +
      t("Business: ", "المشروع: ") +
      f.get("business") +
      "\n" +
      t("Goal: ", "الهدف: ") +
      f.get("goal") +
      "\n" +
      t("Budget: ", "الميزانية: ") +
      f.get("budget");
    setWa(
      "https://wa.me/" +
        data.settings.whatsapp +
        "?text=" +
        encodeURIComponent(msg),
    );
    setReady(true);
  }
  const CTA = ({ name = "", label }: { name?: string; label?: string }) => (
    <button className="button" onClick={() => enquire(name)}>
      {label || t("Let’s talk about your business", "خلّينا نحكي عن مشروعك")}
      <ArrowUpRight size={19} />
    </button>
  );
  const packageCard = (p: Item) => (
    <article className="package" key={p.id}>
      <p className="eyebrow">
        {data.services.find((s) => s.id === p.serviceId)?.title[lang]}
      </p>
      <h3>{p.title[lang]}</h3>
      <p>{p.description[lang]}</p>
      {p.showPrice && (
        <div className="price">
          <b>${p.price.toLocaleString("en-US")}</b>
          <span>USD</span>
        </div>
      )}
      <div className="detail-text">{p.details[lang]}</div>
      <CTA
        name={p.title[lang]}
        label={t("Discuss this package", "ناقش هالباقة")}
      />
    </article>
  );
  return (
    <div className="site" lang={lang} dir={ar ? "rtl" : "ltr"}>
      <a className="skip" href="#main">
        {t("Skip to content", "انتقل للمحتوى")}
      </a>
      <header className="header">
        <Link
          href={"/" + lang}
          className="logo-link"
          aria-label="TargetWise home"
        >
          <img src="/logo.png" width="240" height="44" alt="TargetWise" />
        </Link>
        <nav
          aria-label={t("Main navigation", "التنقل الرئيسي")}
          className={menu ? "nav open" : "nav"}
        >
          {[
            ["services", "Services", "الخدمات"],
            ["work", "Work", "الأعمال"],
            ["packages", "Packages", "الباقات"],
            ["about", "About", "عنّا"],
          ].map(([id, en, a]) => (
            <a
              key={id}
              href={"/" + lang + "#" + id}
              onClick={() => setMenu(false)}
            >
              {t(en, a)}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <Link
            className="language"
            href={
              "/" +
              (ar ? "en" : "ar") +
              (serviceId ? "/services/" + serviceId : "")
            }
            aria-label={t("Switch to Arabic", "Switch to English")}
          >
            <Globe size={16} />
            {ar ? "EN" : "عربي"}
          </Link>

          <button
            className="menu"
            aria-label={t("Toggle menu", "فتح القائمة")}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="main">
        {service ? (
          <section className="service-hero wrap">
            <Link className="back" href={"/" + lang + "#services"}>
              ← {t("All services", "كل الخدمات")}
            </Link>
            <p className="eyebrow">TargetWise / {t("Services", "الخدمات")}</p>
            <h1>{service.title[lang]}</h1>
            <p className="intro">{service.description[lang]}</p>
            {service.showPrice && (
              <div className="price">
                <b>${service.price.toLocaleString("en-US")}</b>
                <span>USD</span>
              </div>
            )}
            <CTA name={service.title[lang]} />
            <div className="service-details">
              <span className="eyebrow">{t("The approach", "طريقتنا")}</span>
              <p>{service.details[lang]}</p>
            </div>
          </section>
        ) : (
          <>
            <section className="hero wrap reference-hero">
              <div className="hero-top">
                <p className="eyebrow">{t("STRATEGY. CREATIVE. DIGITAL.", "استراتيجية. إبداع. رقمي.")}</p>
                <span className="world">{t("From Lebanon. For the world.", "من لبنان، لكل العالم.")}<Globe size={16}/></span>
              </div>
              <div className="hero-statement">
                <h1>{data.settings.heroTitle[lang]}</h1>
                <p className="intro">{data.settings.heroDescription[lang]}</p>
              </div>
              <div className="mobile-hero-art" aria-hidden="true" />
              <aside className="hero-note">
                <span className="eyebrow">{t("BUILT AROUND YOU", "مبني على احتياجاتك")}</span>
                <p>{t("Your audience. Your ambition. A clear plan to connect them.", "جمهورك وطموحك، وخطة واضحة لتوصّل بيناتن.")}</p>

              </aside>
              <div className="hero-service-tiles">
                <a className="hero-tile tile-accent" href="#about"><Target size={22}/><span>{t("MARKETING", "تسويق")}<br/>{t("WITH DIRECTION.", "باتجاه واضح.")}</span><ArrowUpRight size={20}/></a>
                <a className="hero-tile tile-light" href="#services"><span className="eyebrow">{t("THE WHOLE PICTURE", "الصورة كاملة")}</span><p>{t("From the first idea to your next customer.", "من أول فكرة للعميل الجاي.")}</p><span className="tile-link">{t("Explore services", "اكتشف الخدمات")}<ArrowUpRight size={20}/></span></a>
              </div>
              <div className="hero-agency"><span>{t("digital", "وكالة")}</span><span>{t("agency", "رقمية")}</span><CTA label={t("Start a conversation", "بلّش بمحادثة")}/></div>
              <p className="hero-art-caption">{t("Concept artwork — figures shown are illustrative.", "تصميم توضيحي — الأرقام الظاهرة للتوضيح فقط.")}</p>
            </section>
            <section id="services" className="services-section">
              <div className="wrap">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">
                      01 — {t("OUR EXPERTISE", "خبراتنا")}
                    </p>
                    <h2>
                      {t("One direction.", "اتجاه واحد.")}
                      <br />
                      <em>
                        {t(
                          "Every service you need.",
                          "كل الخدمات اللي بتحتاجها.",
                        )}
                      </em>
                    </h2>
                  </div>
                  <p>
                    {t(
                      "From the first idea to the next customer. Choose the support your business needs, with a team that sees the whole picture.",
                      "من أول فكرة للعميل الجاي. اختار الدعم اللي مشروعك بحاجة إله، مع فريق بيشوف الصورة كاملة.",
                    )}
                  </p>
                </div>
                <div className="services-grid">
                  {data.services.map((s, i) => {
                    const Icon = icons[i % icons.length];
                    return (
                      <Link
                        className="service-card"
                        href={"/" + lang + "/services/" + s.id}
                        key={s.id}
                      >
                        <div className="service-top">
                          <Icon size={25} strokeWidth={1.4} />
                          <span>{String(i + 1).padStart(2, "0")}</span>
                        </div>
                        <h3>{s.title[lang]}</h3>
                        <p>{s.description[lang]}</p>
                        <div className="card-action">
                          {t("Explore service", "اكتشف الخدمة")}
                          <ArrowUpRight size={21} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        )}
        <section id="work" className="wrap section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                02 — {t("WORK & RESULTS", "أعمال ونتائج")}
              </p>
              <h2>
                {t("See the thinking.", "شوف الفكرة.")}
                <br />
                <em>{t("Then the work.", "وبعدها التنفيذ.")}</em>
              </h2>
            </div>
            <p>
              {t(
                "A closer look at the ideas, execution and outcomes behind our work.",
                "نظرة أقرب للأفكار والتنفيذ والنتائج ورا شغلنا.",
              )}
            </p>
          </div>
          {works.length ? (
            <div className="work-grid">
              {works.map((w) => (
                <article className="work-card" key={w.id}>
                  {w.image && (
                    <img src={w.image} alt={w.title[lang]} loading="lazy" />
                  )}
                  <p className="eyebrow">{w.value}</p>
                  <h3>{w.title[lang]}</h3>
                  <p>{w.description[lang]}</p>
                  <details>
                    <summary>
                      {t("View project details", "تفاصيل المشروع")}
                      <Plus size={16} />
                    </summary>
                    <p className="detail-text">{w.details[lang]}</p>
                    {w.video && (
                      <a
                        className="text-link"
                        href={w.video}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("Watch video", "شاهد الفيديو")}
                        <ArrowUpRight size={16} />
                      </a>
                    )}
                  </details>
                </article>
              ))}
            </div>
          ) : (
            <div className="work-empty">
              <span className="eyebrow">
                {t("LET’S MAKE IT RELEVANT", "خلّينا نركّز على مشروعك")}
              </span>
              <h3>
                {t("Your business has its own story.", "كل مشروع إله قصته.")}
              </h3>
              <p>
                {t(
                  "Tell us what you’re working on. Ask us for examples relevant to your goals.",
                  "خبرنا عن مشروعك واطلب تشوف أمثلة بتناسب أهدافك.",
                )}
              </p>
              <CTA
                label={t("Ask about our work", "اسأل عن أعمالنا")}
                name={t("Relevant work examples", "أمثلة عن أعمالكن")}
              />
            </div>
          )}
          {data.metrics.length > 0 && (
            <div className="metrics">
              {data.metrics.map((m) => (
                <div key={m.id}>
                  <strong>{m.value}</strong>
                  <p>{m.title[lang]}</p>
                  <small>{m.description[lang]}</small>
                </div>
              ))}
            </div>
          )}
          {data.testimonials.length > 0 && (
            <div className="testimonials">
              {data.testimonials.map((q) => (
                <figure key={q.id}>
                  <blockquote>“{q.description[lang]}”</blockquote>
                  <figcaption>{q.title[lang]}</figcaption>
                  {q.video && (
                    <a href={q.video} target="_blank" rel="noopener noreferrer">
                      {t("Watch testimonial", "شاهد الشهادة")}
                    </a>
                  )}
                </figure>
              ))}
            </div>
          )}
        </section>
        <section id="packages" className="packages-section">
          <div className="wrap">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  03 — {t("WORK WITH US", "اشتغل معنا")}
                </p>
                <h2>
                  {t("The right support.", "الدعم المناسب.")}
                  <br />
                  <em>{t("For your next step.", "لخطوتك الجاية.")}</em>
                </h2>
              </div>
              <p>
                {t(
                  "Clear scope. A shared goal. Let’s find the service that fits where your business is going.",
                  "نطاق شغل واضح وهدف مشترك. خلّينا نحدّد الخدمة المناسبة لوجهة مشروعك.",
                )}
              </p>
            </div>
            {packages.length ? (
              <div className="packages-grid">{packages.map(packageCard)}</div>
            ) : (
              <div className="package-invite">
                <p>
                  {t(
                    "Tell us your goals. We’ll discuss the scope and pricing with you.",
                    "خبرنا عن أهدافك، ومنناقش معك تفاصيل الشغل والسعر.",
                  )}
                </p>
                <CTA name={service?.title[lang]} />
              </div>
            )}
          </div>
        </section>
        {!service && (
          <section id="about" className="wrap section about">
            <div>
              <p className="eyebrow">
                04 — {t("THE TARGETWISE WAY", "طريقة TargetWise")}
              </p>
              <h2>
                {t("Better marketing", "تسويق أفضل")}
                <br />
                <em>{t("starts with understanding.", "بيبلّش بالفهم.")}</em>
              </h2>
              <p className="about-copy">{data.settings.about[lang]}</p>
            </div>
            <div className="process">
              {[
                [
                  t("Understand your business", "منفهم مشروعك"),
                  t(
                    "Your audience, your offer, your goals.",
                    "جمهورك، عرضك وأهدافك.",
                  ),
                ],
                [
                  t("Build the right approach", "منبني الخطة المناسبة"),
                  t(
                    "A clear plan across strategy, creative and digital.",
                    "خطة واضحة بتجمع الاستراتيجية والإبداع والتقنية.",
                  ),
                ],
                [
                  t("Create, launch & refine", "مننفّذ، منطلق ومنحسّن"),
                  t(
                    "Put the plan to work and learn from the response.",
                    "منحوّل الخطة لتنفيذ ومنتعلّم من النتائج.",
                  ),
                ],
              ].map(([a, b], i) => (
                <div key={a}>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{a}</h3>
                    <p>{b}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        <section className="contact">
          <div className="wrap">
            <p className="eyebrow">{t("YOUR NEXT CHAPTER", "خطوتك الجاية")}</p>
            <h2>
              {t("Let’s get your business", "خلّينا نوصّل مشروعك")}
              <br />
              <em>{t("closer to the right people.", "للناس المناسبين.")}</em>
            </h2>
            <CTA />
          </div>
        </section>
      </main>
      <footer className="wrap footer">
        <Link href={"/" + lang}>
          <img src="/logo.png" alt="TargetWise" width="200" height="36" />
        </Link>
        <p>© {new Date().getFullYear()} TargetWise</p>
        <div>
          {data.settings.instagram && (
            <a
              href={data.settings.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram <ArrowUpRight size={14} />
            </a>
          )}
          <a
            href={"https://wa.me/" + data.settings.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp <ArrowUpRight size={14} />
          </a>
        </div>
      </footer>
      <button
        className="floating-wa"
        aria-label={t(
          "Discuss your project on WhatsApp",
          "ناقش مشروعك عبر واتساب",
        )}
        type="button"
        title={t("Chat with us on WhatsApp", "تواصل معنا عبر واتساب")}
        onClick={() => enquire(service?.title[lang])}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M20.52 3.48A11.89 11.89 0 0 0 12.04 0C5.46 0 .1 5.35.1 11.94c0 2.1.55 4.16 1.6 5.98L0 24l6.26-1.64a11.94 11.94 0 0 0 5.78 1.47h.01C18.63 23.83 24 18.48 24 11.9a11.85 11.85 0 0 0-3.48-8.42ZM12.05 21.8a9.89 9.89 0 0 1-5.04-1.38l-.36-.21-3.72.97.99-3.63-.24-.37a9.88 9.88 0 0 1-1.52-5.24c0-5.47 4.45-9.92 9.9-9.92a9.84 9.84 0 0 1 7.02 2.91 9.84 9.84 0 0 1 2.9 7.02c0 5.47-4.45 9.92-9.93 9.92Zm5.44-7.43c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.8-1.49-1.78-1.66-2.08-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
        </svg>
      </button>
      <dialog
        ref={dialog}
        className="enquiry"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close();
        }}
      >
        <button
          className="close"
          onClick={() => dialog.current?.close()}
          aria-label={t("Close", "إغلاق")}
        >
          <X />
        </button>
        <p className="eyebrow">
          {t("LET’S START WITH YOU", "خلّينا نبلّش فيك")}
        </p>
        <h2>{t("Tell us a little.", "خبرنا شوي.")}</h2>
        <p>
          {interest ||
            t(
              "Your next step starts with a conversation.",
              "خطوتك الجاية بتبلّش بمحادثة.",
            )}
        </p>
        {ready ? (
          <div className="ready">
            <p>
              {t(
                "Your message is ready. Open WhatsApp, review it and press Send.",
                "رسالتك جاهزة. افتح واتساب، راجعها واضغط إرسال.",
              )}
            </p>
            <a
              className="button"
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("Continue to WhatsApp", "كمّل على واتساب")}
              <ArrowUpRight size={18} />
            </a>
            <button className="text-link" onClick={() => setReady(false)}>
              {t("Edit answers", "عدّل الإجابات")}
            </button>
          </div>
        ) : (
          <form onSubmit={prepare}>
            <label>
              {t("Your business / industry", "مشروعك / مجالك")}
              <input
                name="business"
                required
                maxLength={200}
                placeholder={t(
                  "e.g. An online clothing store",
                  "مثلاً متجر ملابس أونلاين",
                )}
              />
            </label>
            <label>
              {t("What would you like to achieve?", "شو حابب تحقّق؟")}
              <textarea name="goal" required maxLength={1000} rows={3} />
            </label>
            <label>
              {t("Your budget in USD", "ميزانيتك بالدولار")}
              <select name="budget" defaultValue="" required>
                <option value="" disabled>
                  {t("Choose a range", "اختار الميزانية")}
                </option>
                {["Under $600", "$600–$1,500", "$1,500–$3,000", "$3,000+"].map(
                  (v) => (
                    <option key={v}>{v}</option>
                  ),
                )}
                <option>{t("I’d like guidance", "بدي مساعدة بالتحديد")}</option>
              </select>
            </label>
            <button className="button" type="submit">
              {t("Prepare my message", "جهّز رسالتي")}
              <ArrowRight size={18} />
            </button>
            <small>
              {t(
                "Nothing is sent until you press Send in WhatsApp.",
                "ما بينبعت شي قبل ما تضغط إرسال بواتساب.",
              )}
            </small>
          </form>
        )}
      </dialog>
    </div>
  );
}
