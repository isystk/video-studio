import React from 'react';
import { Composition } from 'remotion';
import DynamicVideo from './compositions/DynamicVideo';
import type { VideoConfig } from './types/VideoConfig';
import { Infographic } from './compositions/Infographic';
import registry from './registry.json';

const configs = registry as VideoConfig[];

const calculateMetadata = ({ props }: { props: VideoConfig }) => ({
  durationInFrames: Math.round(props.durationSec * props.fps),
  fps: props.fps,
  width: props.width,
  height: props.height,
});

export const Root: React.FC = () => (
  <>
    <Composition id="Infographic" component={Infographic} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{ template: 'hook' as const }} />
    {configs.map(config => (
      <Composition
        key={config.id}
        id={config.id}
        component={DynamicVideo}
        durationInFrames={Math.round(config.durationSec * config.fps)}
        fps={config.fps}
        width={config.width}
        height={config.height}
        defaultProps={config}
        calculateMetadata={calculateMetadata}
      />
    ))}
  </>
);
