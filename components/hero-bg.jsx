"use client";
import BackgroundVideoPlayer from "@/components/bg-video-player";

const HeroBackground = () => {
  return (
    <div className="absolute z-0 left-0 top-0 right-0 w-full h-full -mb-1 overflow-hidden md:rounded-xl">
      <BackgroundVideoPlayer
        //aspectRatio="1280:720"
        className="grayscale invert opacity-20 w-full h-full dark:invert-0 overflow-hidden"
        playing={true}
        loop={true}
        muted={true}
        opacity={0.2}
        url="/videos/hero-bg.mp4"
      />
    </div>
  );
};

export default HeroBackground;
