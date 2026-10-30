import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
import { AmbientAudio } from "@/components/site/AmbientAudio";
import { SkipLink } from "@/components/site/SkipLink";
import { personJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { rootMetadata } from "@/lib/seo";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
  axes: ["opsz"],
});

export const metadata: Metadata = rootMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e4e9ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1118" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={bricolage.variable}>
      <body className={bricolage.className}>
        <JsonLd data={[personJsonLd(), websiteJsonLd()]} />
        <SkipLink />
        <AmbientAudio />
        {children}
      </body>
    </html>
  );
}
