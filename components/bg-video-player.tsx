import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

type BackgroundVideoPlayerProps = {
  url: string;
  fallbackImage?: string;
  playing?: boolean;
  loop?: boolean;
  muted?: boolean;
  lazyLoad?: boolean;
  lazyLoadMargin?: string;
  playbackRate?: number;
  className?: string;
  onReady?: () => void;
  zIndex?: number;
  opacity?: number;
};

const BackgroundVideoPlayer = ({
  url,
  fallbackImage,
  playing = true,
  loop = true,
  muted = true,
  lazyLoad = true,
  lazyLoadMargin = '500px',
  playbackRate = 1,
  className = '',
  onReady,
  zIndex = -1,
  opacity = 1,
}: BackgroundVideoPlayerProps) => {
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
        threshold: 0,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [lazyLoad, isClient, lazyLoadMargin]);

  // Early return during SSR or if no URL is provided
  if (!isClient || !url) return null;

  return (
    <div 
      ref={containerRef}
      className={`background-video-container ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex,
        opacity,
      }}
    >
      {/* Fallback image - shows until video is ready */}
      {fallbackImage && !isVideoReady && (
        <div 
          className="fallback-image"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${fallbackImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 1,
          }}
        />
      )}
      
      {/* Video player */}
      {isVisible && (
        <div
          className="background-video-wrapper"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            minWidth: '100%',
            minHeight: '100%',
          }}
        >
          <ReactPlayer
            config={{
              file: {
                attributes: {
                  style: {
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%',
                    minWidth: '100%',
                    minHeight: '100%',
                  },
                },
              },
            }}
            controls={false}
            height="100%"
            loop={loop}
            muted={muted}
            playbackRate={playbackRate}
            playing={playing}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              minWidth: '100%', 
              minHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'cover',
            }}
            url={url}
            width="100%"
            onReady={() => {
              setIsVideoReady(true);
              onReady?.();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BackgroundVideoPlayer;