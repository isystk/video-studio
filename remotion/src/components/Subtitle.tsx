import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

type SubtitleLine = {
  startFrame: number;
  endFrame: number;
  text: string;
};

type Props = {
  lines: SubtitleLine[];
};

const Subtitle: React.FC<Props> = ({ lines }) => {
  const frame = useCurrentFrame();

  const current = lines.find(
    (line) => frame >= line.startFrame && frame < line.endFrame
  );

  if (!current) return null;

  const opacity = interpolate(
    frame,
    [current.startFrame, current.startFrame + 5, current.endFrame - 5, current.endFrame],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        top: "38%",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        padding: "0 40px",
        opacity,
      }}
    >
      <span
        style={{
          color: "#ffffff",
          fontSize: 80,
          fontFamily: '"Noto Sans CJK JP", sans-serif',
          fontWeight: "bold",
          textAlign: "center",
          textShadow: "0 2px 12px rgba(0,0,0,0.9)",
          lineHeight: 1.4,
          whiteSpace: "pre-wrap",
        }}
      >
        {current.text}
      </span>
    </div>
  );
};

export { Subtitle };
export type { SubtitleLine };
