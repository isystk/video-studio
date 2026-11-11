type VideoLayer =
  | {
      type: 'video';
      path: string;
      startSec: number;
      endSec: number;
      volume?: number;
      opacity?: number;
      loop?: boolean;
    }
  | {
      type: 'image';
      path: string;
      startSec: number;
      endSec: number;
      opacity?: number;
    };

type AudioTrack = {
  path: string;
  startSec: number;
  volume?: number;
};

type SubtitleEntry = {
  startSec: number;
  endSec: number;
  text: string;
};

type EndcardConfig = {
  startSec: number;
  mainText: string;
  ctaText: string;
  disclaimerText: string;
  logoPath?: string;
};

type LogoMiniConfig = {
  path: string;
  ranges: Array<{ startSec: number; endSec: number }>;
};

type VideoConfig = {
  id: string;
  fps: number;
  width: number;
  height: number;
  durationSec: number;
  bgm?: {
    path: string;
    volume: number;
  };
  layers: VideoLayer[];
  audioTracks: AudioTrack[];
  subtitles: SubtitleEntry[];
  endcard: EndcardConfig;
  logoMini?: LogoMiniConfig;
  persistentDisclaimer?: string;
};

export type {
  VideoConfig,
  VideoLayer,
  AudioTrack,
  SubtitleEntry,
  EndcardConfig,
  LogoMiniConfig,
};
