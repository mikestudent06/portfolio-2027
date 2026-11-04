import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/site/PageShell";
import { copy, cvDownloads, liens, person } from "@/lib/content";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: `Écrire à ${person.nomComplet} (${person.email}, ${person.telephone}) — développeur full-stack et mobile à ${person.location}.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <PageShell current="/contact">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <p className="chapter">{person.availability}</p>
      <h1>{copy.contactTitre}</h1>
      <p className="lede">{copy.contact}</p>
      <ul className="contact-list">
        <li>
          Email · <a href={`mailto:${person.email}`}>{person.email}</a>
        </li>
        <li>
          Téléphone · <a href={person.telephoneHref}>{person.telephone}</a>
        </li>
        <li>Localisation · {person.location}</li>
      </ul>
      <div className="actions">
        <a className="btn" href={`mailto:${person.email}`}>
          Écrire un e-mail
        </a>
        <a className="btn ghost" href={person.telephoneHref}>
          Appeler
        </a>
      </div>
      <div className="links">
        {liens.map((link) => (
          <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">
            {link.label}
          </a>
        ))}
        {cvDownloads.map((cv) => (
          <a
            key={cv.lang}
            className="cv-link"
            href={cv.href}
            download={cv.filename}
            lang={cv.lang}
          >
            {cv.label}
          </a>
        ))}
      </div>
    </PageShell>
  );
}
