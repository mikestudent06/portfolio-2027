import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/site/PageShell";
import {
  copy,
  experiences,
  person,
  skills,
  temoignage,
} from "@/lib/content";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
  title: "À propos",
  description: `${person.nomComplet}, ${person.jobTitle} à ${person.location}. Parcours, méthode et stack : Next.js, React Native, Node.js, TypeScript.`,
  path: "/a-propos",
});

export default function AboutPage() {
  return (
    <PageShell current="/a-propos">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "À propos", path: "/a-propos" },
        ])}
      />
      <p className="chapter">À propos</p>
      <h1>{copy.aproposTitre}</h1>
      <div className="prose">
        {copy.aproposLong.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <blockquote>
          <p>« {copy.mission} »</p>
        </blockquote>
      </div>

      <section aria-labelledby="skills-title" className="skill-groups">
        <h2 id="skills-title">Compétences</h2>
        {Object.entries(skills).map(([group, items]) => (
          <div key={group}>
            <h3>
              {group === "frontend"
                ? "Frontend"
                : group === "mobile"
                  ? "Mobile"
                  : group === "backend"
                    ? "Backend & données"
                    : "Outils"}
            </h3>
            <ul className="skills">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section aria-labelledby="exp-title">
        <h2 id="exp-title">Parcours</h2>
        <div className="timeline">
          {experiences.map((item) => (
            <article key={`${item.titre}-${item.periode}`}>
              <p className="meta">{item.periode}</p>
              <h3>{item.titre}</h3>
              <p>{item.lieu}</p>
              <p>{item.description}</p>
              <ul className="skills">
                {item.stack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="prose" aria-labelledby="quote-title">
        <h2 id="quote-title">Témoignage</h2>
        <blockquote>
          <p>« {temoignage.citation} »</p>
        </blockquote>
        <p>
          {temoignage.auteur}, {temoignage.role}
        </p>
      </section>

      <div className="actions">
        <Link className="btn" href="/projets">
          Voir les projets
        </Link>
        <Link className="btn ghost" href="/contact">
          Me contacter
        </Link>
      </div>
    </PageShell>
  );
}
