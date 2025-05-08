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
  onError?: (e?: Event) => void;
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
  const [hasError, setHasError] = useState(false);
  
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
          if (wasPlaying && pauseWhenOutOfView) {
            setIsPlaying(true);
          }
        } else {
          // Element has left the viewport
          if (isPlaying && pauseWhenOutOfView) {
            setWasPlaying(true); // Remember it was playing
            setIsPlaying(false);
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
  }, [isClient, pauseWhenOutOfView, wasPlaying, isPlaying]);

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

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Determine video type
  const getVideoType = () => {
    if (url.endsWith('.mp4')) return 'video/mp4';
    if (url.endsWith('.webm')) return 'video/webm';
    if (url.endsWith('.ogg')) return 'video/ogg';
    if (url.endsWith('.mov')) return 'video/quicktime';

    return 'video/mp4'; // Default
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
        {(!isVisible || !isLoaded || hasError) && (
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
                <button 
                  aria-label="Play video"
                  className={styles.playButton} 
                  type="button"
                  onClick={togglePlay}
                />
              </div>
            ) : (
              showDefaultSkeleton && (
                <div className={styles.skeleton}>
                  <button
                    aria-label="Play video"
                    className={styles.playButton} 
                    type="button"
                    onClick={togglePlay}
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
            autoPlay={isPlaying}
            className={styles.videoElement}
            controls={controls}
            loop={loop}
            muted={muted}
            playsInline={true}
            preload="auto"
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
            onCanPlay={() => {
              setIsLoaded(true);
              onPlay?.();
            }}
            onEnded={onEnded}
            onError={(e) => {
              console.error("Video error:", e);
              setHasError(true);
              onError?.();
            }}
            onPause={() => {
              setIsPlaying(false);
              onPause?.();
            }}
            onPlay={() => {
              setIsPlaying(true);
              setWasPlaying(true);
              onPlay?.();
            }}
            onTimeUpdate={onProgress ? () => {
              if (videoRef.current && onProgress) {
                onProgress({
                  currentTime: videoRef.current.currentTime,
                  duration: videoRef.current.duration || 0
                });
              }
            } : undefined}
          >
            {/* Use source element instead of src attribute - this is key */}
            <source src={url} type={getVideoType()} />
            
            {/* Track element without src */}
            <track 
              default 
              kind="captions"
              label="English"
              srcLang="en"
            />
            Your browser does not support the video tag.
          </video>
        )}
        
        {/* Play/Pause Button Overlay */}
        {!controls && isLoaded && isVisible && !hasError && (
          <button 
            aria-label={isPlaying ? "Pause video" : "Play video"}
            className={styles.videoOverlay}
            type="button"
            onClick={togglePlay}
          >
            {!isPlaying && (
              <span 
                aria-hidden="true"
                className={styles.playButton}
              />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;