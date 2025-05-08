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
  aspectRatio?: string;
  lazyLoad?: boolean;
  lazyLoadMargin?: string;
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
  lazyLoad = true,
  lazyLoadMargin = '200px',
  className = '',
  onPlay,
  onPause,
  onEnded,
  onError,
  onProgress,
}: VideoPlayerProps) => {
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Set up Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazyLoad || !isClient || !containerRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: lazyLoadMargin,
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [lazyLoad, isClient, lazyLoadMargin]);

  // Calculate aspect ratio padding
  const getPaddingTop = () => {
    if (height !== 'auto') return undefined;
    
    if (aspectRatio === '1400:1080') return '77.14%';
    if (aspectRatio === '4:3') return '75%';

    return '56.25%'; // Default 16:9
  };

  // Early return during SSR or if no URL is provided
  if (!isClient || !url) return null;

  return (
    <div 
      ref={containerRef}
      className={`video-player-container ${className}`}
    >
      {title && <h3 className="video-title">{title}</h3>}
      
      <div 
        className="video-wrapper" 
        style={{ 
          position: 'relative', 
          paddingTop: getPaddingTop(),
          overflow: 'hidden'
        }}
      >
        {isVisible ? (
          <ReactPlayer
            ref={playerRef}
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload',
                  disablePictureInPicture: !pip
                }
              }
            }}
            controls={controls}
            height={height === 'auto' && width === '100%' ? '100%' : height}
            light={thumbnail || false}
            loop={loop}
            muted={muted}
            pip={pip}
            playing={playing}
            style={{ 
              position: height === 'auto' && width === '100%' ? 'absolute' : 'relative',
              top: 0,
              left: 0,
              display: 'block',
              objectFit: 'cover'
            }}
            url={url}
            width={width}
            onEnded={onEnded}
            onError={onError}
            onPause={onPause}
            onPlay={onPlay}
            onProgress={onProgress}
          />
        ) : (
          <div 
            className="video-placeholder" 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#000',
              backgroundImage: thumbnail ? `url(${thumbnail})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;