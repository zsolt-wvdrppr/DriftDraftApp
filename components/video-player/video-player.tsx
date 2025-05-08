import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import styles from './video-player.module.css';

// Dynamically import ReactPlayer with explicit SSR false setting
const ReactPlayer = dynamic(() => import('react-player/lazy'), { 
  ssr: false,
  loading: () => <div style={{ 
    backgroundColor: 'transparent', 
    width: '100%', 
    height: '100%', 
    position: 'absolute'
  }} />
});

type VideoPlayerProps = {
  url: string;
  title?: string;
  thumbnail?: string;
  showDefaultSkeleton?: boolean;
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
  backgroundColor?: string;
  playbackRate?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: () => void;
  onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
};

const OptimizedVideoPlayer = ({
  url,
  title,
  thumbnail,
  showDefaultSkeleton = true,
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
  backgroundColor = 'transparent',
  playbackRate = 1,
  onPlay,
  onPause,
  onEnded,
  onError,
  onProgress,
}: VideoPlayerProps) => {
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  const [shouldRender, setShouldRender] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Set up Intersection Observer for lazy loading - with more efficient approach
  useEffect(() => {
    if (!lazyLoad || !isClient || !containerRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Wait a moment before actually rendering the player
          setTimeout(() => {
            setShouldRender(true);
          }, 100);
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

  // Calculate aspect ratio padding without complex logic
  const getPaddingTop = () => {
    if (height !== 'auto') return undefined;
    
    const ratioMap: Record<string, string> = {
      '16:9': '56.25%',
      '4:3': '75%',
      '1:1': '100%',
      '1400:1080': '77.14%',
      '1584:1080': '68.18%'
    };
    
    return ratioMap[aspectRatio] || '56.25%';
  };

  // Handler for when the video is ready
  const handleReady = () => {
    setIsVideoLoaded(true);
  };

  // Early return during SSR or if no URL is provided
  if (!isClient || !url) return null;

  return (
    <div 
      ref={containerRef}
      className={`${styles.videoPlayerContainer} ${className}`}
      style={{ backgroundColor }}
    >
      {title && <h3 className="video-title">{title}</h3>}
      
      <div 
        className={styles.videoWrapper}
        style={{ 
          position: 'relative', 
          paddingTop: getPaddingTop(),
          overflow: 'hidden',
          backgroundColor
        }}
      >
        {/* Thumbnail or Skeleton Loader */}
        {(!isVisible || !shouldRender || !isVideoLoaded) && (
          <>
            {thumbnail ? (
              <div 
                className="video-thumbnail" 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${thumbnail})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  zIndex: 1
                }}
              >
                <div className={styles.playButton}></div>
              </div>
            ) : (
              showDefaultSkeleton && (
                <div className={styles.skeleton}>
                  <div className={styles.playButton}></div>
                </div>
              )
            )}
          </>
        )}
        
        {/* Video Player */}
        {isVisible && shouldRender && (
          <ReactPlayer
            url={url}
            className={styles.reactPlayer}
            width="100%"
            height="100%"
            playing={playing}
            loop={loop}
            muted={muted}
            controls={controls}
            playbackRate={playbackRate}
            pip={pip}
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload',
                  disablePictureInPicture: !pip,
                  preload: 'auto'
                },
                forceVideo: true
              }
            }}
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor,
              opacity: isVideoLoaded ? 1 : 0, // Hide until loaded
              transition: 'opacity 0.3s ease'
            }}
            onReady={handleReady}
            onPlay={onPlay}
            onPause={onPause}
            onEnded={onEnded}
            onError={onError}
            onProgress={onProgress}
            progressInterval={1000} // Reduce progress updates for better performance
          />
        )}
      </div>
    </div>
  );
};

export default OptimizedVideoPlayer;