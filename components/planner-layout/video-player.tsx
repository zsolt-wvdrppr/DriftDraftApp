import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

type VideoPlayerProps = {
  url: string;
  title?: string;
  thumbnail?: string;
  controls?: boolean;
  playing?: boolean;
  loop?: boolean;
  muted?: boolean;
  pip?: boolean;
  width?: string | number;
  height?: string | number;
  aspectRatio?: string; // Added aspect ratio prop
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: () => void;
  onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
};

const VideoPlayer = ({
  url,
  title,
  thumbnail,
  controls = true,
  playing = false,
  loop = false,
  muted = false,
  pip = false,
  width = '100%',
  height = 'auto',
  aspectRatio = '16:9',
  className = '',
  onPlay,
  onPause,
  onEnded,
  onError,
  onProgress,
}: VideoPlayerProps) => {
  const [isClient, setIsClient] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Light placeholder for better performance
  const light = thumbnail || false;

  // Early return during SSR or if no URL is provided
  if (!isClient || !url) return null;

  return (
    <div className={`video-player-container ${className}`}>
      {title && <h3 className="video-title">{title}</h3>}
      
      <div className="video-wrapper" style={{ 
          position: 'relative', 
          // Calculate padding based on aspect ratio or use custom value for your 1400x1080 video
          paddingTop: height === 'auto' ? (aspectRatio === '1400:1080' ? '77.14%' : 
                                           aspectRatio === '4:3' ? '75%' :
                                           '56.25%') : undefined,
          overflow: 'hidden'
        }}>
        <ReactPlayer
          ref={playerRef}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload', // Prevent downloads (where supported)
                disablePictureInPicture: !pip
              }
            }
          }}
          controls={controls}
          height={height === 'auto' && width === '100%' ? '100%' : height}
          light={light}
          loop={loop}
          muted={muted}
          pip={pip}
          playing={playing}
          style={{ 
            position: height === 'auto' && width === '100%' ? 'absolute' : 'relative',
            top: 0,
            left: 0,
            display: 'block', // Prevents inline spacing
            objectFit: 'cover' // Ensures video fills container without distortion
          }}
          url={url}
          width={width}
          onEnded={onEnded}
          onError={onError}
          onPause={onPause}
          onPlay={onPlay}
          onProgress={onProgress}
          onReady={() => setPlayerReady(true)}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;