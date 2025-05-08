import { useState, useEffect, useRef } from 'react';

import styles from './video-player.module.css';
import logger from '@/lib/logger';

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
  const [isIOS, setIsIOS] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Handle user interaction - separate function for accessibility
  const handleUserInteraction = () => {
    setUserInteracted(true);
    if (isIOS && videoRef.current?.paused && playing) {
      playVideoOnIOS();
    }
  };

  // iOS-specific play function
  const playVideoOnIOS = () => {
    if (!videoRef.current) return;
    
    // Set required iOS attributes
    videoRef.current.playsInline = true;
    
    // Always try to play muted first on iOS (most reliable)
    const originalMuted = videoRef.current.muted;
    videoRef.current.muted = true;
    
    const playPromise = videoRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // If we succeeded with muted playback and originally wanted unmuted,
          // try to unmute after a short delay (this often works on iOS)
          if (!originalMuted) {
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.muted = originalMuted;
              }
            }, 500);
          }
          
          setIsPlaying(true);
          setWasPlaying(true);
          onPlay?.();
        })
        .catch((error) => {
          logger.error("iOS video playback failed:", error);
          setIsPlaying(false);
        });
    }
  };

  // Cross-platform play function
  const playVideo = () => {
    if (!videoRef.current) return;
    
    // Use iOS-specific function if on iOS
    if (isIOS) {
      playVideoOnIOS();
      return;
    }
    
    // Standard playback for other platforms
    const playPromise = videoRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setWasPlaying(true);
          onPlay?.();
        })
        .catch((error) => {
          logger.error("Playback failed:", error);
          setIsPlaying(false);
        });
    }
  };

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
    
    // More robust iOS detection
    const isIOSDevice = typeof navigator !== 'undefined' && 
      (/iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    
    setIsIOS(isIOSDevice);
    
    // Add a document-level touch/click listener for iOS
    if (isIOSDevice) {
      const handleDocumentInteraction = () => {
        setUserInteracted(true);
      };
      
      document.addEventListener('touchstart', handleDocumentInteraction, { once: true });
      document.addEventListener('click', handleDocumentInteraction, { once: true });
      
      return () => {
        document.removeEventListener('touchstart', handleDocumentInteraction);
        document.removeEventListener('click', handleDocumentInteraction);
      };
    }
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
            playVideo();
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
  }, [isClient, pauseWhenOutOfView, wasPlaying, isIOS]);

  // Handle playing prop changes
  useEffect(() => {
    if (!videoRef.current || !isVisible) return;
    
    if (playing && videoRef.current.paused) {
      // For iOS, ensure user has interacted first
      if (isIOS && !userInteracted) {
        logger.debug("Waiting for user interaction on iOS before playing");
        return;
      }
      
      playVideo();
    } else if (!playing && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  }, [playing, isVisible, isIOS, userInteracted]);

  // Handle playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Handle user interaction (important for iOS)
  useEffect(() => {
    if (isIOS && userInteracted && videoRef.current && playing && isVisible) {
      playVideoOnIOS();
    }
  }, [isIOS, userInteracted, playing, isVisible]);

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
    
    // For iOS, need user interaction before playing
    if (playing && isVisible && videoRef.current?.paused) {
      if (!isIOS || userInteracted) {
        playVideo();
      }
    }
  };

  const handleCanPlay = () => {
    if (playing && isVisible && videoRef.current?.paused) {
      if (!isIOS || userInteracted) {
        playVideo();
      }
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
    
    setUserInteracted(true);
    
    if (videoRef.current.paused) {
      playVideo();
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
        {(!isVisible || !isLoaded || (isIOS && !userInteracted && !isPlaying)) && (
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
                  type="button"
                  aria-label="Play video" 
                  className={styles.playButton}
                  onClick={handleUserInteraction}
                />
              </div>
            ) : (
              showDefaultSkeleton && (
                <div className={styles.skeleton}>
                  <button
                    type="button"
                    aria-label="Play video" 
                    className={styles.playButton}
                    onClick={handleUserInteraction}
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
            autoPlay={false}
            className={styles.videoElement}
            controls={controls}
            loop={loop}
            muted={muted}
            playsInline={true}
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
            onCanPlay={handleCanPlay}
            onEnded={onEnded}
            onError={(e) => {
              logger.error("Video error:", e);
              onError?.();
            }}
            onLoadedData={handleLoadedData}
            onLoadedMetadata={() => {
              // For iOS, we need user interaction
              if (isIOS && playing && isVisible && userInteracted) {
                playVideoOnIOS();
              }
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
            onTimeUpdate={onProgress ? handleTimeUpdate : undefined}
          >
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
        {!controls && isLoaded && isVisible && (
          <button 
            type="button"
            aria-label={isPlaying ? "Pause video" : "Play video"}
            className={styles.videoOverlay}
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