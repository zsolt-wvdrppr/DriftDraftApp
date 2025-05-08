import { useState, useEffect, useRef } from 'react';

type BackgroundVideoPlayerProps = {
  url: string;
  fallbackImage?: string;
  captionSrc?: string;  // Added caption source prop
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
  captionSrc,  // Added caption source prop
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
  const [hasError, setHasError] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Handle hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Set up Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazyLoad || !isClient || !containerRef.current) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, we can disconnect
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: lazyLoadMargin,
        threshold: 0,
      }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazyLoad, isClient, lazyLoadMargin]);

  // Handle playback state when "playing" prop changes
  useEffect(() => {
    if (!videoRef.current || !isVisible) return;
    
    if (playing) {
      // Promise is only returned in modern browsers
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Video playback error:", error);
          // Don't set error if it's just a user interaction requirement
          if (error.name !== "NotAllowedError") {
            setHasError(true);
          }
        });
      }
    } else {
      videoRef.current.pause();
    }
  }, [playing, isVisible]);

  // Handle playback rate changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

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
      {/* Fallback image - shows until video is ready or if playback fails */}
      {fallbackImage && (!isVideoReady || hasError) && (
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
      
      {/* Video element */}
      {isVisible && (
        <video
          ref={videoRef}
          autoPlay={playing}
          loop={loop}
          muted={muted}
          playsInline={true} 
          preload="auto"
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
            opacity: isVideoReady ? opacity : 0,
            transition: 'opacity 0.5s ease',
          }}
          onCanPlay={() => {
            setIsVideoReady(true);
            onReady?.();
          }}
          onError={(e) => {
            console.error("Video error:", e);
            setHasError(true);
          }}
        >
          <source src={url} type={url.endsWith('.mp4') ? 'video/mp4' : 
                            url.endsWith('.webm') ? 'video/webm' : 
                            url.endsWith('.ogg') ? 'video/ogg' : 
                            url.endsWith('.mov') ? 'video/quicktime' : 
                            'video/mp4'} />
          {/* Always include caption track for accessibility */}
          <track 
            default 
            kind="captions"
            label="English"
            //src={captionSrc || "/captions/empty.vtt"}
            srcLang="en"
          />
         
        </video>
      )}
    </div>
  );
};

export default BackgroundVideoPlayer;