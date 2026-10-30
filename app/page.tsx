import { Experience } from "@/components/experience/Experience";
import { JsonLd } from "@/components/JsonLd";
import {
  copy,
  featuredProjects,
  person,
} from "@/lib/content";
import {
  featuredItemListJsonLd,
  professionalServiceJsonLd,
} from "@/lib/jsonld";
import { seo } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: seo.titleDefault },
  description: seo.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={[professionalServiceJsonLd(), featuredItemListJsonLd()]} />
      <Experience />
      <noscript>
        <section className="page noscript-fallback" id="contenu">
          <p className="lede">{copy.metier}</p>
          <p>{copy.apropos}</p>
          <ul>
            {featuredProjects.map((project) => (
              <li key={project.slug}>
                <a href={`/projets/${project.slug}`}>{project.titre}</a> — {project.description}
              </li>
            ))}
          </ul>
          <p>
            <a href={`mailto:${person.email}`}>{person.email}</a>
          </p>
        </section>
      </noscript>
    </>
  );
}
