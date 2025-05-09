import { useState, useEffect, useRef } from 'react';

import logger from '@/lib/logger';

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
  const [hasError, setHasError] = useState(false);
  
  // For the UI only - tracks if video is currently playing
  const [isPlaying, setIsPlaying] = useState(playing);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const wasPlayingRef = useRef(playing);

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
          if (wasPlayingRef.current && pauseWhenOutOfView && videoRef.current) {
            // Try to play
            videoRef.current.play().catch(err => logger.error('Failed to play:', err));
          }
        } else {
          // Element has left the viewport
          if (videoRef.current && !videoRef.current.paused && pauseWhenOutOfView) {
            wasPlayingRef.current = true; // Remember it was playing
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
  }, [isClient, pauseWhenOutOfView]);

  // Sync with playing prop
  useEffect(() => {
    if (!videoRef.current || !isLoaded) return;
    
    if (playing && videoRef.current.paused) {
      videoRef.current.play().catch(err => logger.error('Failed to play:', err));
    } else if (!playing && !videoRef.current.paused) {
      videoRef.current.pause();
    }
    
    // Update the state to match
    setIsPlaying(!videoRef.current.paused);
  }, [playing, isLoaded]);

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

  // DIRECT video control function without state changes
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    // Directly control video without intermediate state
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        wasPlayingRef.current = true;
      }).catch(err => {
        logger.error('Failed to play:', err);
        setIsPlaying(false);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
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
              
              // Initial play if needed
              if (playing && videoRef.current?.paused) {
                videoRef.current.play().catch(err => 
                  logger.error('Failed to play on canplay:', err)
                );
              }
              
              // Update UI state based on actual video state
              if (videoRef.current) {
                setIsPlaying(!videoRef.current.paused);
              }
            }}
            onEnded={onEnded}
            onError={(e) => {
              logger.error("Video error:", e);
              setHasError(true);
              onError?.();
            }}
            onPause={() => {
              setIsPlaying(false);
              onPause?.();
            }}
            onPlay={() => {
              setIsPlaying(true);
              wasPlayingRef.current = true;
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
            <source src={url} type={getVideoType()} />
            
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