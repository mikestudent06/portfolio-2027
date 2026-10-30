import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

export function PageShell({
  current,
  children,
}: {
  current?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header current={current} />
      <main id="contenu" className="page">
        {children}
      </main>
      <Footer />
    </>
  );
}
