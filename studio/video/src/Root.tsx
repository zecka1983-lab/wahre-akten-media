import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import {EngineStill} from './Engine3D';
import {Engine4Still} from './Engine4';
import {CarEngine} from './CarEngine';
import {Avatar, CoverBallon, FbCover, YtBanner} from './Brand';
import timeline from './timeline.json';

export const Root: React.FC = () => (
  <>
  <Composition id="CarEngine" component={CarEngine} width={1080} height={1920} fps={30} durationInFrames={435} />
  <Composition id="Engine4" component={Engine4Still} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{shot: "outside", angle: 40}} />
  <Composition id="Engine" component={EngineStill} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{shot: "hero", angle: 30}} />
  <Composition id="YtBanner" component={YtBanner} width={2560} height={1440} fps={30} durationInFrames={1} />
  <Composition id="FbCover" component={FbCover} width={1640} height={624} fps={30} durationInFrames={1} />
  <Composition id="Avatar" component={Avatar} width={1080} height={1080} fps={30} durationInFrames={1} />
  <Composition id="CoverBallon" component={CoverBallon} width={1080} height={1920} fps={30} durationInFrames={1} />
  <Composition
    id="Main"
    component={Main}
    width={1080}
    height={1920}
    fps={timeline.fps}
    durationInFrames={Math.ceil((timeline.duration + 0.8) * timeline.fps)}
  />
  </>
);
