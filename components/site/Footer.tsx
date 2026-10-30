import { person } from "@/lib/content";

export function Footer() {
  return (
    <footer className="site-footer">
      <p>
        © 2026 {person.nomComplet}. {person.location}.
      </p>
      <p>
        <a href={`mailto:${person.email}`}>{person.email}</a>
      </p>
    </footer>
  );
}
