import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1d3b8a",
          color: "white",
          fontSize: 72,
          fontWeight: 800,
          letterSpacing: "-0.06em",
          borderRadius: 36,
        }}
      >
        MM
      </div>
    ),
    { ...size },
  );
}
