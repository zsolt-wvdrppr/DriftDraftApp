import { useState, useEffect, useRef } from 'react';

import styles from './video-player.module.css';

type VideoPlayerProps = {
  url: string;
  title?: string;
  thumbnail?: string;
  captionSrc?: string;
  showDefaultSkeleton?: boolean;
  controls?: boolean;
  playing?: boolean;
  loop?: boolean;
  muted?: boolean;
  width?: string | number;
  height?: string | number;
  aspectRatio?: string;
  lazyLoad?: boolean;
  pauseWhenOutOfView?: boolean;
  className?: string;
  backgroundColor?: string;
  playbackRate?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: () => void;
  onProgress?: (state: { currentTime: number; duration: number }) => void;
};

const VideoPlayer = ({
  url,
  title,
  thumbnail,
  captionSrc,
  showDefaultSkeleton = true,
  controls = false,
  playing = false,
  loop = true,
  muted = true,
  width = '100%',
  height = 'auto',
  aspectRatio = '16:9',
  lazyLoad = true,
  pauseWhenOutOfView = true,
  className = '',
  backgroundColor = 'transparent',
  playbackRate = 1,
  onPlay,
  onPause,
  onEnded,
  onError,
  onProgress,
}: VideoPlayerProps) => {
  // State
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(playing);
  const [wasPlaying, setWasPlaying] = useState(playing);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Set up visibility observer for lazy loading and pause-when-out-of-view
  useEffect(() => {
    if (!isClient || !containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;

        setIsVisible(isIntersecting);

        if (isIntersecting) {
          // Element has entered the viewport
          if (videoRef.current && wasPlaying && pauseWhenOutOfView) {
            // Resume playing if it was playing before going out of view
            videoRef.current.play().catch(() => {
              // Autoplay might be blocked
            });
          }
        } else {
          // Element has left the viewport
          if (videoRef.current && !videoRef.current.paused && pauseWhenOutOfView) {
            setWasPlaying(true); // Remember it was playing
            videoRef.current.pause();
          }
        }
      },
      {
        rootMargin: "200px",
        threshold: 0.01,
      }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [isClient, pauseWhenOutOfView, wasPlaying]);

  // Handle playing prop changes
  useEffect(() => {
    if (!videoRef.current || !isVisible) return;
    
    if (playing && videoRef.current.paused) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    } else if (!playing && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  }, [playing, isVisible]);

  // Handle playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Calculate aspect ratio padding
  const getPaddingTop = () => {
    if (height !== 'auto') return undefined;
    
    const ratioMap: Record<string, string> = {
      '16:9': '56.25%',
      '4:3': '75%',
      '1:1': '100%',
      '400:308': '77.5%',
      '1584:1080': '68.18%'
    };
    
    return ratioMap[aspectRatio] || '56.25%';
  };

  // Handlers
  const handleLoadedData = () => {
    setIsLoaded(true);
    if (playing && isVisible && videoRef.current?.paused) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && onProgress) {
      onProgress({
        currentTime: videoRef.current.currentTime,
        duration: videoRef.current.duration || 0
      });
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setWasPlaying(true);
        onPlay?.();
      }).catch(() => {
        setIsPlaying(false);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setWasPlaying(false);
      onPause?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      togglePlay();
    }
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
        {(!isVisible || !isLoaded) && (
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
                <div 
                  aria-label="Play video" 
                  className={styles.playButton}
                  role="button"
                  tabIndex={0}
                  onClick={togglePlay}
                  onKeyDown={handleKeyDown}
                 />
              </div>
            ) : (
              showDefaultSkeleton && (
                <div className={styles.skeleton}>
                  <div 
                    aria-label="Play video" 
                    className={styles.playButton}
                    role="button"
                    tabIndex={0}
                    onClick={togglePlay}
                    onKeyDown={handleKeyDown}
                   />
                </div>
              )
            )}
          </>
        )}
        
        {/* Video Element */}
        {isVisible && (
          <video
            ref={videoRef}
            playsInline
            autoPlay={playing && isVisible}
            className={styles.videoElement}
            controls={controls}
            loop={loop}
            muted={muted}
            preload="auto"
            src={url}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease',
              backgroundColor,
            }}
            onEnded={onEnded}
            onError={onError}
            onLoadedData={handleLoadedData}
            onPause={() => {
              setIsPlaying(false);
              onPause?.();
            }}
            onPlay={() => {
              setIsPlaying(true);
              setWasPlaying(true);
              onPlay?.();
            }}
            onTimeUpdate={onProgress ? handleTimeUpdate : undefined}
          >
            <track 
              default 
              kind="captions"
              label="English"
              //src={captionSrc || "/captions/empty.vtt"}
              srcLang="en"
            />
          </video>
        )}
        
        {/* Play/Pause Button Overlay */}
        {!controls && isLoaded && isVisible && (
          <div 
            aria-label={isPlaying ? "Pause video" : "Play video"}
            className={styles.videoOverlay}
            role="button"
            tabIndex={0}
            onClick={togglePlay}
            onKeyDown={handleKeyDown}
          >
            {!isPlaying && (
              <div 
                aria-hidden="true"
                className={styles.playButton}
               />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;