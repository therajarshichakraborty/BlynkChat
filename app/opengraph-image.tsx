import { ImageResponse } from "next/og";
import { siteName } from "@/lib/site";

export const alt = `${siteName} · Conversations at the speed of thought`;
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
          justifyContent: "center",
          padding: 80,
          background: "radial-gradient(ellipse 70% 80% at 50% 0%, #0f2a6b, #0a0a0b 70%)",
          color: "#f5f5f5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(#4d8bff, #2463eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
            }}
          >
            ⚡
          </div>
          <div style={{ fontSize: 40, fontWeight: 600 }}>{siteName}</div>
        </div>
        <div style={{ marginTop: 48, fontSize: 76, fontWeight: 600, letterSpacing: -2, lineHeight: 1.05 }}>
          Conversations that move at the
        </div>
        <div style={{ fontSize: 76, fontWeight: 600, letterSpacing: -2, color: "#4c8dff" }}>
          speed of thought
        </div>
        <div style={{ marginTop: 32, fontSize: 28, color: "#9e9e9e" }}>
          Real-time chats, groups and communities. End-to-end encrypted.
        </div>
      </div>
    ),
    size,
  );
}
