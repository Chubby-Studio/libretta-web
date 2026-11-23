// Structured data (schema.org JSON-LD) shared by the pages.
import { SITE } from "./i18n";

export const organization = {
  "@type": "Organization",
  "@id": `${SITE}/#organization`,
  name: "Chubby Studio",
  url: SITE + "/",
  logo: `${SITE}/assets/icon-512.png`,
  email: "hello@chubby.studio",
};

export const website = (inLanguage: string) => ({
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  name: "Libretta",
  url: SITE + "/",
  inLanguage,
  publisher: { "@id": organization["@id"] },
});

export const app = (description: string, inLanguage: string) => ({
  "@type": "SoftwareApplication",
  "@id": `${SITE}/#app`,
  name: "Libretta",
  description,
  inLanguage,
  applicationCategory: "ProductivityApplication",
  operatingSystem: "iOS, iPadOS, macOS",
  image: `${SITE}/assets/icon-512.png`,
  publisher: { "@id": organization["@id"] },
});

export const breadcrumbs = (items: { name: string; path: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: SITE + item.path,
  })),
});
