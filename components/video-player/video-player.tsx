import { useState, useEffect, useRef } from "react";

import logger from "@/lib/logger";

import styles from "./video-player.module.css";

type VideoPlayerProps = {
  url: string;
  title?: string;
  thumbnail?: string;
  captionSrc?: string;
  showDefaultSkeleton?: boolean;
  controls?: boolean;
  autoplay?: boolean; // New explicit autoplay prop
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
  autoplay = true, // Default to false for better UX
  playing = false,
  loop = true,
  muted = true,
  width = "100%",
  height = "auto",
  aspectRatio = "16:9",
  lazyLoad = true,
  pauseWhenOutOfView = true,
  className = "",
  backgroundColor = "transparent",
  playbackRate = 1,
  onPlay,
  onPause,
  onEnded,
  onError,
  onProgress,
}: VideoPlayerProps) => {
  // Basic state
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Video playback state
  const [videoState, setVideoState] = useState({
    isPaused: !autoplay && !playing,
    isPlaying: autoplay || playing,
  });

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const playAttemptedRef = useRef(false);
  const preventToggleRef = useRef(false); // Prevent duplicate toggling

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Set up visibility observer for lazy loading and pause-when-out-of-view
  useEffect(() => {
    if (!isClient || !containerRef.current) return;

    const handleVisibilityChange = (isIntersecting: boolean) => {
      setIsVisible(isIntersecting);

      if (!videoRef.current) return;

      if (isIntersecting) {
        // Element has entered the viewport
        if (
          (autoplay || playing || videoState.isPlaying) &&
          pauseWhenOutOfView
        ) {
          playVideo();
        }
      } else {
        // Element has left the viewport
        if (pauseWhenOutOfView && !videoRef.current.paused) {
          videoRef.current.pause();
          setVideoState({
            isPaused: true,
            isPlaying: false,
          });
        }
      }
    };

    observerRef.current = new IntersectionObserver(
      ([entry]) => handleVisibilityChange(entry.isIntersecting),
      {
        rootMargin: "200px",
        threshold: 0.01,
      }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [isClient, pauseWhenOutOfView, autoplay, playing, videoState.isPlaying]);

  // Safe play function that handles browser restrictions
  const playVideo = () => {
    if (!videoRef.current || !isLoaded || !isVisible) return;

    // Prevent rapid toggle attempts
    if (preventToggleRef.current) return;
    preventToggleRef.current = true;

    // For iOS/Safari compatibility, always ensure muted for autoplay
    if (autoplay) {
      videoRef.current.muted = true;
    }

    // Update internal state immediately to prevent UI flashing
    setVideoState({
      isPaused: false,
      isPlaying: true,
    });

    const playPromise = videoRef.current.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Promise resolved - video is now playing
          playAttemptedRef.current = true;
          // Reset toggle prevention after a short delay
          setTimeout(() => {
            preventToggleRef.current = false;
          }, 300);
        })
        .catch((err) => {
          logger.error("Failed to play:", err);
          // Revert state if play failed
          setVideoState({
            isPaused: true,
            isPlaying: false,
          });

          // If this is the first attempt with sound, retry muted (for better browser compatibility)
          if (!videoRef.current!.muted && !playAttemptedRef.current) {
            videoRef.current!.muted = true;
            // Allow immediate retry for muted attempt
            preventToggleRef.current = false;
            playVideo(); // Retry muted
          } else {
            // Reset toggle prevention
            setTimeout(() => {
              preventToggleRef.current = false;
            }, 300);
          }
        });
    } else {
      // If no promise (older browsers), reset toggle prevention
      setTimeout(() => {
        preventToggleRef.current = false;
      }, 300);
    }
  };

  // Pause video safely
  const pauseVideo = () => {
    if (!videoRef.current) return;

    // Prevent rapid toggle attempts
    if (preventToggleRef.current) return;
    preventToggleRef.current = true;

    // Update internal state immediately to prevent UI flashing
    setVideoState({
      isPaused: true,
      isPlaying: false,
    });

    videoRef.current.pause();

    // Reset toggle prevention after a short delay
    setTimeout(() => {
      preventToggleRef.current = false;
    }, 300);
  };

  // Toggle play/pause (for user interactions)
  const togglePlay = (e?: React.MouseEvent) => {
    // Stop event propagation to prevent double triggers
    if (e) {
      e.stopPropagation();
    }

    if (!videoRef.current) return;

    // Don't allow rapid toggles
    if (preventToggleRef.current) return;

    if (videoRef.current.paused) {
      playVideo();
    } else {
      pauseVideo();
    }
  };

  // Sync with playing prop changes
  useEffect(() => {
    if (!isLoaded || !isVisible) return;

    if (playing && videoRef.current?.paused) {
      playVideo();
    } else if (playing === false && !videoRef.current?.paused) {
      // Only pause if explicitly set to false
      pauseVideo();
    }
  }, [playing, isLoaded, isVisible]);

  // Handle autoplay once video is loaded and visible
  useEffect(() => {
    if (isLoaded && isVisible && autoplay && !playAttemptedRef.current) {
      playVideo();
    }
  }, [isLoaded, isVisible, autoplay]);

  // Handle playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Calculate aspect ratio padding
  const getPaddingTop = () => {
    if (height !== "auto") return undefined;

    const ratioMap: Record<string, string> = {
      "16:9": "56.25%",
      "4:3": "75%",
      "1:1": "100%",
      "400:308": "77.5%",
      "1584:1080": "68.18%",
    };

    return ratioMap[aspectRatio] || "56.25%";
  };

  // Determine video type
  const getVideoType = () => {
    if (url.endsWith(".mp4")) return "video/mp4";
    if (url.endsWith(".webm")) return "video/webm";
    if (url.endsWith(".ogg")) return "video/ogg";
    if (url.endsWith(".mov")) return "video/quicktime";

    return "video/mp4"; // Default
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
          position: "relative",
          paddingTop: getPaddingTop(),
          overflow: "hidden",
          backgroundColor,
        }}
      >
        {/* Thumbnail or Skeleton Loader */}
        {(!isVisible || !isLoaded || hasError) && (
          <>
            {thumbnail ?
              <div
                className="video-thumbnail"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundImage: `url(${thumbnail})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  zIndex: 1,
                }}
              >
                <button
                  aria-label="Play video"
                  className={styles.playButton}
                  tabIndex={0}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay(e);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      togglePlay();
                    }
                  }}
                />
              </div>
            : showDefaultSkeleton && (
                <div className={styles.skeleton}>
                  <button
                    aria-label="Play video"
                    className={styles.playButton}
                    tabIndex={0}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay(e);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        togglePlay();
                      }
                    }}
                  />
                </div>
              )
            }
          </>
        )}

        {/* Video Element */}
        {isVisible && (
          <video
            ref={videoRef}
            autoPlay={autoplay}
            className={styles.videoElement}
            controls={controls}
            loop={loop}
            muted={muted || autoplay} // Always mute when autoplay is true
            // For iOS Safari compatibility
            playsInline={true}
            preload="auto"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: isLoaded ? 1 : 0,
              transition: "opacity 0.3s ease",
              backgroundColor,
            }}
            onCanPlay={() => {
              setIsLoaded(true);

              // Start playback if autoplay or playing is true
              if ((autoplay || playing) && !playAttemptedRef.current) {
                playVideo();
              }
            }}
            onEnded={() => {
              setVideoState({
                isPaused: true,
                isPlaying: false,
              });
              onEnded?.();
            }}
            onError={(e) => {
              logger.error("Video error:", e);
              setHasError(true);
              onError?.();
            }}
            onPause={() => {
              setVideoState({
                isPaused: true,
                isPlaying: false,
              });
              onPause?.();
            }}
            onPlay={() => {
              setVideoState({
                isPaused: false,
                isPlaying: true,
              });
              playAttemptedRef.current = true;
              onPlay?.();
            }}
            onTimeUpdate={() => {
              if (videoRef.current && onProgress) {
                onProgress({
                  currentTime: videoRef.current.currentTime,
                  duration: videoRef.current.duration || 0,
                });
              }
            }}
          >
            <source src={url} type={getVideoType()} />
            {/* Always include a track element for accessibility */}
            <track
              default
              kind="captions"
              label="English"
              //src={captionSrc || ""}
              srcLang="en"
            />
            Your browser does not support the video tag.
          </video>
        )}

        {/* Custom button overlay for play/pause control with proper accessibility */}
        {!controls && isLoaded && isVisible && !hasError && (
          <button
            aria-label={videoState.isPaused ? "Play video" : "Pause video"}
            className={styles.videoOverlay}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              zIndex: 2,
              background: "transparent",
              border: "none",
              padding: 0,
            }}
            tabIndex={0}
            type="button"
            onClick={togglePlay}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                togglePlay();
              }
            }}
          >
            {videoState.isPaused && (
              <span
                aria-hidden="true"
                className={styles.playButton}
                style={{
                  pointerEvents: "none", // Prevent event bubbling issues
                }}
              />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
