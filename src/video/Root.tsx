import { Composition } from "remotion";
import { AtlasMarketsLaunch } from "./AtlasMarketsLaunch";

export const RemotionRoot = () => {
  return (
    <Composition
      id="AtlasMarketsLaunch"
      component={AtlasMarketsLaunch}
      durationInFrames={660}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        appName: "Atlas Invest",
        tagline: "Track every stock. Research every move."
      }}
    />
  );
};
