import type { Metadata } from "next";
import { person, seo as seoCopy } from "@/lib/content";
import { SITE_URL, absoluteUrl } from "@/lib/site";

export function pageMetadata({
  title,
  description,
  path,
  ogTitle,
}: {
  title: string;
  description: string;
  path: string;
  ogTitle?: string;
}): Metadata {
  const url = absoluteUrl(path);
  const resolvedTitle = ogTitle ?? title;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: resolvedTitle,
      description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
    },
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: seoCopy.titleDefault,
    template: seoCopy.titleTemplate,
  },
  description: seoCopy.description,
  keywords: [...seoCopy.keywords],
  applicationName: person.nomComplet,
  authors: [{ name: person.nomComplet, url: SITE_URL }],
  creator: person.nomComplet,
  publisher: person.nomComplet,
  category: "technology",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: { "fr-CG": SITE_URL, "fr-FR": SITE_URL },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["fr_CG"],
    url: SITE_URL,
    siteName: person.nomComplet,
    title: seoCopy.titleDefault,
    description: seoCopy.description,
  },
  twitter: {
    card: "summary_large_image",
    title: seoCopy.titleDefault,
    description: seoCopy.description,
    creator: "@MouhaniMic44729",
  },
  appleWebApp: {
    capable: true,
    title: "Michel Mouhani",
    statusBarStyle: "default",
  },
  other: {
    "geo.region": "CG-8",
    "geo.placename": "Pointe-Noire",
    "geo.position": "-4.7779;11.8635",
    ICBM: "-4.7779, 11.8635",
  },
};
