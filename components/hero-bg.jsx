"use client";
import BackgroundVideoPlayer from "@/components/bg-video-player";
import { Tooltip } from "react-tooltip";

const HeroBackground = () => {
  return (
    <div className="absolute z-0 left-0 top-0 right-0 w-full h-full -mb-1 overflow-hidden md:rounded-xl">
      <BackgroundVideoPlayer
        //aspectRatio="1280:720"
        className="grayscale invert w-full h-full dark:invert-0 overflow-hidden brightness-110"
        playing={true}
        loop={true}
        muted={true}
        opacity={0.4}
        playbackRate={1}
        url="/videos/hero-bg.mp4"
      />

      {/* Beta Chip with react-tooltip */}
      <div className="absolute top-4 right-4 z-50">
        <div 
          data-tooltip-id="beta-tooltip"
          data-tooltip-html={"<strong>This app is currently in beta.</strong><br /> Spotted something odd? Feel free to use the feedback form."}
          className="select-none bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider shadow-lg backdrop-blur-sm border border-white/20 cursor-default"
        >
          Beta
        </div>
        
        <Tooltip
          id="beta-tooltip"
          place="bottom-end"
          style={{
            backgroundColor: '#1f2937',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '14px',
            maxWidth: '250px',
            lineHeight: '1.4'
          }}
        />
      </div>
    </div>
  );
};

export default HeroBackground;
