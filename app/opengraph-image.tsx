import { ImageResponse } from "next/og";
import { person } from "@/lib/content";

export const alt = `${person.nomComplet} — ${person.jobTitle} au Congo-Brazzaville`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0d1118",
          color: "#eef2f7",
          padding: "64px 72px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 72,
            height: 72,
            borderRadius: "22px 22px 22px 6px",
            background: "#1d3b8a",
            color: "#fff",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 800,
          }}
        >
          MM
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 86, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.9 }}>
            Michel Mouhani
          </div>
          <div style={{ marginTop: 24, fontSize: 32, color: "#7fd4e0", maxWidth: 860 }}>
            Développeur full-stack & mobile · Pointe-Noire, Congo-Brazzaville
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
