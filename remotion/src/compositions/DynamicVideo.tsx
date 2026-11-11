import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, Video, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Subtitle } from "../components/Subtitle";
import type { VideoConfig, VideoLayer } from "../types/VideoConfig";

const KenBurnsImg: React.FC<{ src: string; durationInFrames: number }> = ({ src, durationInFrames }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.08], { extrapolateRight: "clamp" });
  return (
    <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})` }} />
  );
};

const DynamicVideo: React.FC<VideoConfig> = (config) => {
  const { fps } = useVideoConfig();
  const sec = (s: number) => Math.round(s * fps);

  const renderLayer = (layer: VideoLayer, i: number) => {
    const from = sec(layer.startSec);
    const duration = sec(layer.endSec) - from;

    if (layer.type === "video") {
      return (
        <Sequence key={i} from={from} durationInFrames={duration}>
          <Video
            src={staticFile(layer.path)}
            volume={layer.volume ?? 0}
            loop={layer.loop ?? false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: layer.opacity ?? 1,
            }}
          />
        </Sequence>
      );
    }

    return (
      <Sequence key={i} from={from} durationInFrames={duration}>
        <AbsoluteFill style={{ pointerEvents: "none", opacity: layer.opacity ?? 1 }}>
          <KenBurnsImg src={staticFile(layer.path)} durationInFrames={duration} />
        </AbsoluteFill>
      </Sequence>
    );
  };

  const subtitleLines = config.subtitles.map((s) => ({
    startFrame: sec(s.startSec),
    endFrame: sec(s.endSec),
    text: s.text,
  }));

  const endcardFrom = sec(config.endcard.startSec);
  const endcardDuration = sec(config.durationSec) - endcardFrom;

  const persistentDisclaimerDuration = config.persistentDisclaimer ? endcardFrom : 0;
  const logoMini = config.logoMini;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {config.bgm && <Audio src={staticFile(config.bgm.path)} volume={config.bgm.volume} loop />}

      {config.layers.map(renderLayer)}

      {config.audioTracks.map((track, i) => (
        <Sequence key={i} from={sec(track.startSec)}>
          <Audio src={staticFile(track.path)} volume={track.volume ?? 1} />
        </Sequence>
      ))}

      {logoMini?.ranges.map((range, i) => (
        <Sequence
          key={i}
          from={sec(range.startSec)}
          durationInFrames={sec(range.endSec) - sec(range.startSec)}
        >
          <AbsoluteFill style={{ pointerEvents: "none" }}>
            <Img
              src={staticFile(logoMini.path)}
              style={{ position: "absolute", bottom: 20, right: 20, width: 140 }}
            />
          </AbsoluteFill>
        </Sequence>
      ))}

      <Subtitle lines={subtitleLines} />

      {persistentDisclaimerDuration > 0 && (
        <Sequence from={0} durationInFrames={persistentDisclaimerDuration}>
          <AbsoluteFill
            style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 40 }}
          >
            <span
              style={{
                color: "#ddd",
                fontSize: 26,
                fontFamily: '"Noto Sans CJK JP", sans-serif',
                textAlign: "center",
                textShadow: "0 1px 6px rgba(0,0,0,0.9)",
              }}
            >
              {config.persistentDisclaimer}
            </span>
          </AbsoluteFill>
        </Sequence>
      )}

      <Sequence from={endcardFrom} durationInFrames={endcardDuration}>
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 56,
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: 80,
              fontFamily: '"Noto Sans CJK JP", sans-serif',
              fontWeight: "bold",
              textAlign: "center",
              textShadow: "0 2px 12px rgba(0,0,0,0.9)",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
            }}
          >
            {config.endcard.mainText}
          </span>
          <span
            style={{
              color: "#FFD700",
              fontSize: 44,
              fontFamily: '"Noto Sans CJK JP", sans-serif',
              fontWeight: "bold",
              textAlign: "center",
              textShadow: "0 2px 8px rgba(0,0,0,0.9)",
            }}
          >
            {config.endcard.ctaText}
          </span>
        </AbsoluteFill>
        <AbsoluteFill
          style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 260 }}
        >
          <span
            style={{
              color: "#aaa",
              fontSize: 30,
              fontFamily: '"Noto Sans CJK JP", sans-serif',
              textAlign: "center",
              whiteSpace: "pre-wrap",
              padding: "0 50px",
            }}
          >
            {config.endcard.disclaimerText}
          </span>
        </AbsoluteFill>
        {config.endcard.logoPath && (
          <AbsoluteFill
            style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 80 }}
          >
            <Img src={staticFile(config.endcard.logoPath)} style={{ width: 300 }} />
          </AbsoluteFill>
        )}
      </Sequence>
    </AbsoluteFill>
  );
};

export default DynamicVideo;
