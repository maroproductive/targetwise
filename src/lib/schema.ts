import { z } from "zod";
export const localized = z.object({
  en: z.string().max(12000),
  ar: z.string().max(12000),
});
export const kinds = [
  "services",
  "packages",
  "work",
  "testimonials",
  "metrics",
] as const;
export type Kind = (typeof kinds)[number];
const url = z
  .string()
  .max(2000)
  .refine(
    (v) => !v || /^https:\/\//.test(v) || /^\/(?!\/)/.test(v),
    "Use an HTTPS URL or a local /path",
  );
export const itemSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(100),
  title: localized,
  description: localized,
  details: localized,
  serviceId: z.string().max(100),
  price: z.number().min(0).max(10000000),
  showPrice: z.boolean(),
  image: url,
  video: url,
  value: z.string().max(80),
  published: z.boolean(),
  order: z.number().int().min(0).max(10000),
});
export type Item = z.infer<typeof itemSchema>;
export const settingsSchema = z.object({
  whatsapp: z.string().regex(/^[1-9][0-9]{7,14}$/),
  instagram: z
    .string()
    .max(2000)
    .refine(
      (v) => !v || /^https:\/\/(www\.)?instagram\.com\//.test(v),
      "Use an Instagram HTTPS URL",
    ),
  heroTitle: localized,
  heroDescription: localized,
  about: localized,
});
export type Settings = z.infer<typeof settingsSchema>;
export type Content = { settings: Settings } & Record<Kind, Item[]>;
export const blankItem: Item = {
  id: "",
  title: { en: "", ar: "" },
  description: { en: "", ar: "" },
  details: { en: "", ar: "" },
  serviceId: "",
  price: 0,
  showPrice: false,
  image: "",
  video: "",
  value: "",
  published: false,
  order: 0,
};
