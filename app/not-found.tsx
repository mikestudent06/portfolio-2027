import { PageShell } from "@/components/site/PageShell";
import Link from "next/link";

export default function NotFound() {
  return (
    <PageShell>
      <h1>Page introuvable.</h1>
      <p className="lede">
        Cette adresse n’existe pas — ou le projet a bougé. Revenez à l’accueil, ou parcourez les
        réalisations.
      </p>
      <div className="actions">
        <Link className="btn" href="/">
          Accueil
        </Link>
        <Link className="btn ghost" href="/projets">
          Projets
        </Link>
      </div>
    </PageShell>
  );
}
