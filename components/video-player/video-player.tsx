import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import styles from './video-player.module.css';

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
  backgroundColor?: string;
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
  backgroundColor = 'transparent',
  onPlay,
  onPause,
  onEnded,
  onError,
  onProgress,
}: VideoPlayerProps) => {
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  const [videoLoaded, setVideoLoaded] = useState(false);
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
    
    let paddingValue;
    if (aspectRatio === '1400:1080') paddingValue = '77.14%';
    else if (aspectRatio === '1584:1080') paddingValue = '68.18%'; // Slight adjustment
    else if (aspectRatio === '4:3') paddingValue = '75%';
    else paddingValue = '56.25%'; // Default 16:9
    
    // Set CSS variable for use in the module styles
    if (containerRef.current) {
      containerRef.current.style.setProperty('--aspect-ratio', paddingValue);
    }
    
    return paddingValue;
  };

  // Handler for when the video is actually ready to play
  const handleReady = () => {
    setVideoLoaded(true);
    // Force a small timeout to ensure proper rendering
    setTimeout(() => {
      if (containerRef.current) {
        // Force a repaint by briefly toggling a class
        containerRef.current.classList.add(styles.videoForceRepaint);
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.classList.remove(styles.videoForceRepaint);
          }
        }, 50);
      }
    }, 100);
  };

  // Early return during SSR or if no URL is provided
  if (!isClient || !url) return null;

  return (
    <div 
      ref={containerRef}
      className={`${styles.videoPlayerContainer} ${videoLoaded ? styles.videoLoaded : styles.videoLoading} ${className}`}
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
        {isVisible ? (
          <ReactPlayer
            ref={playerRef}
            className={styles.reactPlayer}
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload',
                  disablePictureInPicture: !pip,
                  style: {
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    backgroundColor
                  }
                },
                forceVideo: true,
                forceAudio: false
              },
              youtube: {
                playerVars: {
                  modestbranding: 1,
                  showinfo: 0,
                  rel: 0,
                  iv_load_policy: 3
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
              width: '100% !important',
              height: '100% !important',
              backgroundColor
            }}
            url={url}
            width={width}
            onEnded={onEnded}
            onError={onError}
            onPause={onPause}
            onPlay={onPlay}
            onProgress={onProgress}
            onReady={handleReady}
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
              backgroundColor: thumbnail ? 'transparent' : backgroundColor,
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