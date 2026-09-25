"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  LogOut,
  ArrowUpRight,
  Save,
  Pencil,
  X,
} from "lucide-react";
import { blankItem, kinds, Content, Item, Kind, Settings } from "@/lib/schema";
const labels: Record<Kind, string> = {
  services: "Services",
  packages: "Packages",
  work: "Work & results",
  testimonials: "Testimonials",
  metrics: "Key figures",
};
export default function Admin({
  data,
  problem,
}: {
  data?: Content;
  problem?: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Kind | "settings">("services");
  const [item, setItem] = useState<Item | null>(null);
  const [editing, setEditing] = useState(false);
  const [settings, setSettings] = useState<Settings | undefined>(
    data?.settings,
  );
  const [notice, setNotice] = useState(problem || "");
  const [busy, setBusy] = useState(false);
  async function request(url: string, method: string, body?: unknown) {
    setBusy(true);
    setNotice("");
    try {
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Request failed");
      return true;
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Request failed");
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (
      await request("/api/auth", "POST", {
        email: f.get("email"),
        password: f.get("password"),
      })
    )
      router.refresh();
  }
  function change(k: keyof Item, v: unknown) {
    setItem((i) => (i ? { ...i, [k]: v } : null));
  }
  function local(
    k: "title" | "description" | "details",
    lang: "en" | "ar",
    v: string,
  ) {
    setItem((i) => (i ? { ...i, [k]: { ...i[k], [lang]: v } } : null));
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (
      await request(
        "/api/admin/" + tab,
        "PUT",
        tab === "settings" ? settings : item,
      )
    ) {
      setNotice("Saved successfully.");
      setItem(null);
      router.refresh();
    }
  }
  if (!data)
    return (
      <main className="login-shell">
        <a href="/en">
          <img src="/logo.png" width="260" alt="TargetWise" />
        </a>
        <p className="eyebrow">CONTENT STUDIO</p>
        <h1>Welcome back.</h1>
        <p>Sign in to manage your website.</p>
        <form onSubmit={login}>
          <label>
            Email
            <input name="email" type="email" autoComplete="username" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button className="button" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
            <ArrowUpRight size={18} />
          </button>
        </form>
        <p role="status">{notice}</p>
        <a className="text-link" href="/en">
          Back to website
        </a>
      </main>
    );
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a href="/en">
          <img src="/logo.png" alt="TargetWise" width="210" />
        </a>
        <p className="eyebrow">CONTENT STUDIO</p>
        <nav aria-label="Admin navigation">
          {[...kinds, "settings" as const].map((k) => (
            <button
              key={k}
              aria-current={tab === k ? "page" : undefined}
              className={tab === k ? "active" : ""}
              onClick={() => {
                setTab(k);
                setItem(null);
                setNotice("");
              }}
            >
              {k === "settings" ? "Site settings" : labels[k]}
            </button>
          ))}
        </nav>
        <a className="text-link" href="/en" target="_blank">
          View website
          <ArrowUpRight size={16} />
        </a>
        <button
          className="text-link"
          disabled={busy}
          onClick={async () => {
            if (await request("/api/auth", "DELETE")) router.refresh();
          }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </aside>
      <main className="admin-main">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">TARGETWISE / ADMIN</p>
            <h1>{tab === "settings" ? "Site settings" : labels[tab]}</h1>
          </div>
          {tab !== "settings" && !item && (
            <button
              className="button"
              onClick={() => {
                setEditing(false);
                setItem({
                  ...structuredClone(blankItem),
                  id: crypto.randomUUID(),
                  order: data[tab].length,
                });
              }}
            >
              <Plus size={18} />
              Add new
            </button>
          )}
        </div>
        <p className="admin-status" role="status">
          {notice}
        </p>
        {tab === "settings" && settings ? (
          <form className="editor" onSubmit={save}>
            <div className="field-grid">
              <label>
                WhatsApp number (international, digits only)
                <input
                  value={settings.whatsapp}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsapp: e.target.value })
                  }
                  required
                  pattern="[1-9][0-9]{7,14}"
                />
              </label>
              <label>
                Instagram URL (leave empty to hide)
                <input
                  value={settings.instagram}
                  onChange={(e) =>
                    setSettings({ ...settings, instagram: e.target.value })
                  }
                  type="url"
                  placeholder="https://www.instagram.com/youraccount/"
                />
              </label>
            </div>
            {(["heroTitle", "heroDescription", "about"] as const).map((k) => (
              <fieldset key={k}>
                <legend>
                  {
                    {
                      heroTitle: "Homepage headline",
                      heroDescription: "Homepage introduction",
                      about: "About TargetWise",
                    }[k]
                  }
                </legend>
                <div className="field-grid">
                  {(["en", "ar"] as const).map((l) => (
                    <label key={l}>
                      {l === "en" ? "English" : "العربية"}
                      <textarea
                        dir={l === "ar" ? "rtl" : "ltr"}
                        rows={k === "about" ? 6 : 3}
                        required
                        value={settings[k][l]}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            [k]: { ...settings[k], [l]: e.target.value },
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <button className="button" disabled={busy}>
              <Save size={18} />
              {busy ? "Saving…" : "Save settings"}
            </button>
          </form>
        ) : item ? (
          <form className="editor" onSubmit={save}>
            <div className="editor-top">
              <h2>{editing ? "Edit item" : "New item"}</h2>
              <button
                type="button"
                aria-label="Cancel editing"
                className="icon-button"
                onClick={() => setItem(null)}
              >
                <X />
              </button>
            </div>
            <p className="hint">
              Add both languages. Only published items appear on the website.
            </p>
            <label>
              URL identifier (lowercase letters, numbers and hyphens)
              <input
                value={item.id}
                disabled={editing}
                required
                pattern="[a-z0-9-]+"
                onChange={(e) => change("id", e.target.value)}
              />
            </label>
            {(["title", "description", "details"] as const).map((k) => (
              <fieldset key={k}>
                <legend>
                  {k === "title"
                    ? "Title / client name"
                    : k === "description"
                      ? tab === "testimonials"
                        ? "Exact client quote"
                        : "Short description"
                      : "Details / scope / result context"}
                </legend>
                <div className="field-grid">
                  {(["en", "ar"] as const).map((l) => (
                    <label key={l}>
                      {l === "en" ? "English" : "العربية"}
                      {k === "title" ? (
                        <input
                          dir={l === "ar" ? "rtl" : "ltr"}
                          value={item[k][l]}
                          required
                          onChange={(e) => local(k, l, e.target.value)}
                        />
                      ) : (
                        <textarea
                          dir={l === "ar" ? "rtl" : "ltr"}
                          rows={k === "details" ? 5 : 3}
                          value={item[k][l]}
                          onChange={(e) => local(k, l, e.target.value)}
                        />
                      )}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            {(tab === "packages" || tab === "work") && (
              <label>
                Related service
                <select
                  value={item.serviceId}
                  required={tab === "packages"}
                  onChange={(e) => change("serviceId", e.target.value)}
                >
                  <option value="">Select service</option>
                  {data.services.map((s) => (
                    <option value={s.id} key={s.id}>
                      {s.title.en}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {(tab === "packages" || tab === "services") && (
              <div className="field-grid">
                <label>
                  Price (USD)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => change("price", Number(e.target.value))}
                  />
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={item.showPrice}
                    onChange={(e) => change("showPrice", e.target.checked)}
                  />
                  Show price publicly
                </label>
              </div>
            )}
            {tab === "work" && (
              <label>
                Image URL
                <input
                  type="url"
                  placeholder="https://…"
                  value={item.image}
                  onChange={(e) => change("image", e.target.value)}
                />
                <span className="hint">
                  Use a permanent public image URL from your media hosting
                  provider.
                </span>
              </label>
            )}
            {(tab === "work" || tab === "testimonials") && (
              <label>
                Video URL (optional)
                <input
                  type="url"
                  value={item.video}
                  onChange={(e) => change("video", e.target.value)}
                />
              </label>
            )}
            {(tab === "metrics" || tab === "work") && (
              <label>
                {tab === "metrics"
                  ? "Figure (e.g. a verified client count)"
                  : "Result or category label"}
                <input
                  maxLength={80}
                  value={item.value}
                  onChange={(e) => change("value", e.target.value)}
                />
              </label>
            )}
            <div className="field-grid">
              <label>
                Display order
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={item.order}
                  onChange={(e) => change("order", Number(e.target.value))}
                />
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={item.published}
                  onChange={(e) => change("published", e.target.checked)}
                />
                Published
              </label>
            </div>
            {["work", "testimonials", "metrics"].includes(tab) && (
              <p className="hint">
                Publish only verified information and client material you have
                permission to share.
              </p>
            )}
            <button className="button" disabled={busy}>
              <Save size={18} />
              {busy ? "Saving…" : "Save item"}
            </button>
          </form>
        ) : (
          tab !== "settings" && (
            <div className="item-list">
              {data[tab].length === 0 ? (
                <div className="admin-empty">
                  <h2>Ready for your real content.</h2>
                  <p>
                    Add your first {labels[tab].toLowerCase()} item. Nothing
                    fictional has been added.
                  </p>
                </div>
              ) : (
                data[tab].map((i) => (
                  <article key={i.id}>
                    <div>
                      <h3>{i.title.en}</h3>
                      <p dir="rtl">{i.title.ar}</p>
                      <span
                        className={"badge " + (i.published ? "published" : "")}
                      >
                        {i.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="item-actions">
                      <button
                        aria-label={"Edit " + i.title.en}
                        onClick={() => {
                          setEditing(true);
                          setItem(structuredClone(i));
                        }}
                      >
                        <Pencil size={18} />
                        Edit
                      </button>
                      <button
                        disabled={busy}
                        aria-label={"Delete " + i.title.en}
                        onClick={async () => {
                          if (
                            confirm(
                              "Delete “" +
                                i.title.en +
                                "”? This cannot be undone.",
                            )
                          )
                            if (
                              await request("/api/admin/" + tab, "DELETE", {
                                id: i.id,
                              })
                            ) {
                              setNotice("Deleted.");
                              router.refresh();
                            }
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          )
        )}
      </main>
    </div>
  );
}
