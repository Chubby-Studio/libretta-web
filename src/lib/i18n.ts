// The 34 App Store languages of the site. The order is the order of the menu.
// English lives at the root; every other language under /<code>/.

export interface Language {
  code: string;
  hreflang: string;
  name: string;
  direction: "ltr" | "rtl";
}

export const LANGUAGES: Language[] = [
  { code: "en", hreflang: "en", name: "English", direction: "ltr" },
  { code: "es", hreflang: "es", name: "Español", direction: "ltr" },
  { code: "ca", hreflang: "ca", name: "Català", direction: "ltr" },
  { code: "cs", hreflang: "cs", name: "Čeština", direction: "ltr" },
  { code: "da", hreflang: "da", name: "Dansk", direction: "ltr" },
  { code: "de", hreflang: "de", name: "Deutsch", direction: "ltr" },
  { code: "el", hreflang: "el", name: "Ελληνικά", direction: "ltr" },
  { code: "fi", hreflang: "fi", name: "Suomi", direction: "ltr" },
  { code: "fr", hreflang: "fr", name: "Français", direction: "ltr" },
  { code: "hr", hreflang: "hr", name: "Hrvatski", direction: "ltr" },
  { code: "hu", hreflang: "hu", name: "Magyar", direction: "ltr" },
  { code: "id", hreflang: "id", name: "Bahasa Indonesia", direction: "ltr" },
  { code: "it", hreflang: "it", name: "Italiano", direction: "ltr" },
  { code: "ms", hreflang: "ms", name: "Bahasa Melayu", direction: "ltr" },
  { code: "nl", hreflang: "nl", name: "Nederlands", direction: "ltr" },
  { code: "no", hreflang: "nb", name: "Norsk", direction: "ltr" },
  { code: "pl", hreflang: "pl", name: "Polski", direction: "ltr" },
  { code: "pt-br", hreflang: "pt-BR", name: "Português (Brasil)", direction: "ltr" },
  { code: "pt-pt", hreflang: "pt-PT", name: "Português (Portugal)", direction: "ltr" },
  { code: "ro", hreflang: "ro", name: "Română", direction: "ltr" },
  { code: "ru", hreflang: "ru", name: "Русский", direction: "ltr" },
  { code: "sk", hreflang: "sk", name: "Slovenčina", direction: "ltr" },
  { code: "sv", hreflang: "sv", name: "Svenska", direction: "ltr" },
  { code: "tr", hreflang: "tr", name: "Türkçe", direction: "ltr" },
  { code: "uk", hreflang: "uk", name: "Українська", direction: "ltr" },
  { code: "vi", hreflang: "vi", name: "Tiếng Việt", direction: "ltr" },
  { code: "ar", hreflang: "ar", name: "العربية", direction: "rtl" },
  { code: "he", hreflang: "he", name: "עברית", direction: "rtl" },
  { code: "hi", hreflang: "hi", name: "हिन्दी", direction: "ltr" },
  { code: "th", hreflang: "th", name: "ไทย", direction: "ltr" },
  { code: "ja", hreflang: "ja", name: "日本語", direction: "ltr" },
  { code: "ko", hreflang: "ko", name: "한국어", direction: "ltr" },
  { code: "zh-hans", hreflang: "zh-Hans", name: "简体中文", direction: "ltr" },
  { code: "zh-hant", hreflang: "zh-Hant", name: "繁體中文", direction: "ltr" },
];

export const SITE = "https://libretta.app";

export interface Texts {
  language_label: string;
  home_description: string;
  home_lede: string;
  home_soon: string;
  privacy_link: string;
  home_link: string;
  privacy_title: string;
  privacy_description: string;
  updated: string;
  intro: string;
  summary: string[];
  sections: { h: string; html: string }[];
  blog: string;
  blog_description: string;
  blog_all: string;
  notice_link: string;
  notice_close: string;
}

const files = import.meta.glob<Texts>("../i18n/*.json", { eager: true, import: "default" });

export function texts(code: string): Texts {
  const t = files[`../i18n/${code}.json`];
  if (!t) throw new Error(`Missing src/i18n/${code}.json`);
  return t;
}

// Every language must carry every key of English, with as many summary items and sections.
const reference = texts("en");
for (const { code } of LANGUAGES) {
  const t = texts(code);
  const missing = Object.keys(reference).filter((key) => !(key in t));
  if (missing.length || t.sections.length !== reference.sections.length || t.summary.length !== reference.summary.length) {
    throw new Error(`${code}.json does not match en.json (${missing.join(", ") || "section count"})`);
  }
}

export function language(code: string): Language {
  const found = LANGUAGES.find((l) => l.code === code);
  if (!found) throw new Error(`Unknown language ${code}`);
  return found;
}

// The path of a page in a language: "/" + "privacy/" for English, "/es/" + "privacy/" for Spanish.
export function localized(code: string, rest = ""): string {
  return (code === "en" ? "/" : `/${code}/`) + rest;
}

// The `lang` route parameter: undefined for English, which lives at the root.
export function routeParam(code: string): string | undefined {
  return code === "en" ? undefined : code;
}

export function codeFromParam(param: string | undefined): string {
  return param ?? "en";
}
