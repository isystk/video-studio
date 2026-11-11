import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";

type Step = { label: string; sub?: string };
type Side = { head: string; body: string };

export type InfographicProps = {
  template: "hook" | "steps" | "compare" | "list" | "summary" | "priceBoard" | "newsCard";
  brand?: string;
  credit?: string;
  updatedAt?: string;
  rows?: { symbol: string; usd: string; jpy?: string; change: number }[];
  news?: string[];
  summary?: string;
  source?: string;
  page?: string;
  title?: string;
  headline?: string;
  steps?: Step[];
  left?: Side;
  right?: Side;
  items?: string[];
  bg?: number;
  bgImage?: string;
};

const rnd = (seed: number) => {
  let x = seed * 9301 + 49297;
  return () => ((x = (x * 9301 + 49297) % 233280) / 233280);
};

// 抽象的な相場チャート風の背景（ローソク足 + 折れ線 + 光）。文字の可読性のため低コントラスト
const Background: React.FC<{ seed: number }> = ({ seed }) => {
  const r = rnd(seed + 3);
  const n = 22;
  let y = 900 + r() * 300;
  const pts: number[] = [];
  for (let i = 0; i < n; i++) {
    y = Math.min(1500, Math.max(500, y + (r() - 0.5) * 220));
    pts.push(y);
  }
  const x = (i: number) => (i / (n - 1)) * 1080;
  const line = pts.map((v, i) => `${i ? "L" : "M"}${x(i)},${v}`).join(" ");
  return (
    <AbsoluteFill>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        <defs>
          <radialGradient id="glow" cx="50%" cy="38%" r="55%">
            <stop offset="0%" stopColor="#2a5aa8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0b1730" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38e0c0" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#38e0c0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#glow)" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line key={i} x1="0" x2="1080" y1={400 + i * 200} y2={400 + i * 200} stroke="#ffffff" strokeOpacity="0.04" />
        ))}
        {pts.map((v, i) => {
          const h = 40 + r() * 120;
          const up = r() > 0.45;
          const c = up ? "#38e0c0" : "#8aa0d0";
          return (
            <g key={i} opacity="0.16">
              <line x1={x(i)} x2={x(i)} y1={v - h} y2={v + h} stroke={c} strokeWidth="3" />
              <rect x={x(i) - 14} y={v - h / 2} width="28" height={h} fill={c} />
            </g>
          );
        })}
        <path d={`${line} L1080,1920 L0,1920 Z`} fill="url(#area)" />
        <path d={line} fill="none" stroke="#38e0c0" strokeOpacity="0.5" strokeWidth="4" />
      </svg>
    </AbsoluteFill>
  );
};

const FONT = '"Noto Sans JP", "Noto Sans CJK JP", sans-serif';
const ACCENT = "#38e0c0";
const GOLD = "#FFD700";

// 字幕(top:38%)と重ならないよう、タイトルは上部・本体は下部(58%〜)に配置する
const Title: React.FC<{ text?: string }> = ({ text }) =>
  text ? (
    <div style={{ position: "absolute", top: 150, left: 70, right: 70, color: ACCENT, fontSize: 56, fontWeight: 700, letterSpacing: 4, textAlign: "center" }}>
      {text}
    </div>
  ) : null;

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", top: 1100, left: 70, right: 70, bottom: 160, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
    {children}
  </div>
);

const AMBER = "#f5a524";
const COIN_COLOR: Record<string, string> = { BTC: "#f7931a", ETH: "#627eea", XRP: "#2f9bd8", SOL: "#9945ff", BNB: "#d9a21b" };

const Brand: React.FC<{ text?: string }> = ({ text }) =>
  text ? (
    <div style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center", fontSize: 40, fontWeight: 800, color: AMBER, letterSpacing: 3 }}>
      {text}
    </div>
  ) : null;

const ChangeBadge: React.FC<{ v: number; size: number }> = ({ v, size }) => (
  <div style={{ background: v < 0 ? "#f25a4a" : "#2fbf71", color: "#fff", fontWeight: 900, fontSize: size, padding: "10px 30px", borderRadius: 50, whiteSpace: "nowrap" }}>
    {v < 0 ? "↓" : "↑"} {v > 0 ? "+" : ""}{v.toFixed(2)}%
  </div>
);

export const Infographic: React.FC<InfographicProps> = (p) => (
  <AbsoluteFill style={{ background: "linear-gradient(160deg,#0b1730 0%,#14284f 55%,#0b1730 100%)", fontFamily: FONT, color: "#fff" }}>
    {p.bgImage ? (
      <AbsoluteFill>
        <Img src={staticFile(p.bgImage)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,12,30,0.35) 0%, rgba(5,12,30,0.15) 40%, rgba(5,12,30,0.55) 100%)" }} />
      </AbsoluteFill>
    ) : (
      <Background seed={p.bg ?? 1} />
    )}
    {p.template !== "priceBoard" && p.template !== "newsCard" && <Title text={p.title} />}

    {p.template === "hook" && (
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 300 }}>
        <div style={{ fontSize: 150, fontWeight: 900, color: GOLD, lineHeight: 1.1, textAlign: "center", textShadow: "0 6px 30px rgba(255,215,0,0.35)", whiteSpace: "pre-wrap" }}>
          {p.headline}
        </div>
      </AbsoluteFill>
    )}

    {p.template === "steps" && (
      <Body>
        {p.steps?.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 36, background: "rgba(255,255,255,0.07)", borderRadius: 28, padding: "26px 36px", borderLeft: `10px solid ${ACCENT}` }}>
            <div style={{ fontSize: 80, fontWeight: 900, color: ACCENT, width: 90 }}>{i + 1}</div>
            <div>
              <div style={{ fontSize: 58, fontWeight: 700 }}>{s.label}</div>
              {s.sub && <div style={{ fontSize: 36, color: "#b8c4de", marginTop: 6 }}>{s.sub}</div>}
            </div>
          </div>
        ))}
      </Body>
    )}

    {p.template === "compare" && (
      <Body>
        <div style={{ display: "flex", gap: 28 }}>
          {[p.left, p.right].map((s, i) => (
            <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: 28, padding: "44px 30px", borderTop: `10px solid ${i === 0 ? "#8aa0d0" : ACCENT}`, textAlign: "center" }}>
              <div style={{ fontSize: 50, fontWeight: 800, color: i === 0 ? "#b8c4de" : ACCENT, whiteSpace: "pre-wrap" }}>{s?.head}</div>
              <div style={{ fontSize: 44, fontWeight: 600, marginTop: 28, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{s?.body}</div>
            </div>
          ))}
        </div>
      </Body>
    )}

    {p.template === "list" && (
      <Body>
        {p.items?.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, background: "rgba(255,255,255,0.07)", borderRadius: 28, padding: "34px 36px" }}>
            <div style={{ fontSize: 64, color: GOLD }}>!</div>
            <div style={{ fontSize: 50, fontWeight: 700, lineHeight: 1.4 }}>{t}</div>
          </div>
        ))}
      </Body>
    )}

    {p.template === "priceBoard" && (
      <AbsoluteFill style={{ padding: "110px 60px 0" }}>
        <Brand text={p.brand} />
        <div style={{ fontSize: 76, fontWeight: 900, textAlign: "center", marginTop: 90 }}>{p.title}</div>
        <div style={{ fontSize: 34, color: "#aab6d3", textAlign: "center", marginTop: 14 }}>{p.updatedAt}</div>
        <div style={{ height: 3, background: AMBER, margin: "26px 0 36px" }} />
        {(p.rows?.length ?? 0) <= 2 ? (
          <>
            {p.rows?.map((r) => (
              <div key={r.symbol} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
                <div>
                  <div style={{ fontSize: 84, fontWeight: 900, color: COIN_COLOR[r.symbol] ?? "#fff" }}>{r.symbol}</div>
                  <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1.1 }}>{r.usd}</div>
                  <div style={{ fontSize: 40, color: "#cfd8ee", marginTop: 6 }}>≈ {r.jpy}</div>
                </div>
                <ChangeBadge v={r.change} size={50} />
              </div>
            ))}
            <div style={{ height: 3, background: AMBER, margin: "0 0 30px" }} />
            <div style={{ fontSize: 46, fontWeight: 800, color: AMBER, textAlign: "center", marginBottom: 22 }}>本日のニュース</div>
            {p.news?.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, fontSize: 42, fontWeight: 600, marginBottom: 20 }}>
                <div style={{ width: 54, height: 54, borderRadius: 27, background: AMBER, color: "#0b1730", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 34 }}>{i + 1}</div>
                <div>{t}</div>
              </div>
            ))}
          </>
        ) : (
          <>
            {p.rows?.map((r) => (
              <div key={r.symbol} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: `3px solid ${COIN_COLOR[r.symbol] ?? "#fff"}`, borderRadius: 22, padding: "26px 34px", marginBottom: 30, background: "rgba(8,16,36,0.6)" }}>
                <div style={{ fontSize: 58, fontWeight: 900, color: COIN_COLOR[r.symbol] ?? "#fff", width: 190 }}>{r.symbol}</div>
                <div style={{ fontSize: 58, fontWeight: 800 }}>{r.usd}</div>
                <ChangeBadge v={r.change} size={40} />
              </div>
            ))}
          </>
        )}
        {p.credit && (
          <div style={{ position: "absolute", bottom: 70, left: 0, right: 0, textAlign: "center", fontSize: 26, color: "#8d9bbd" }}>{p.credit}</div>
        )}
      </AbsoluteFill>
    )}

    {p.template === "newsCard" && (
      <AbsoluteFill>
        <Brand text={p.brand} />
        {p.page && (
          <div style={{ position: "absolute", top: 110, right: 50, background: AMBER, color: "#0b1730", fontWeight: 900, fontSize: 34, padding: "6px 22px", borderRadius: 30 }}>{p.page}</div>
        )}
        <div style={{ position: "absolute", top: 520, left: 50, right: 50, border: `4px solid ${AMBER}`, borderRadius: 28, background: "rgba(8,14,32,0.82)", padding: "46px 44px" }}>
          <div style={{ fontSize: 68, fontWeight: 900, textAlign: "center", lineHeight: 1.3, whiteSpace: "pre-wrap", paddingBottom: 22, borderBottom: "3px solid #fff", marginBottom: 28 }}>{p.headline}</div>
          <div style={{ fontSize: 46, fontWeight: 600, textAlign: "center", lineHeight: 1.55 }}>{p.summary}</div>
          {p.source && <div style={{ fontSize: 28, color: "#9fb0d6", textAlign: "right", marginTop: 26 }}>出典: {p.source}</div>}
        </div>
      </AbsoluteFill>
    )}

    {p.template === "summary" && (
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 320, padding: "0 70px 320px" }}>
        <div style={{ fontSize: 96, fontWeight: 900, textAlign: "center", lineHeight: 1.4, color: ACCENT, whiteSpace: "pre-wrap" }}>{p.headline}</div>
      </AbsoluteFill>
    )}
  </AbsoluteFill>
);
