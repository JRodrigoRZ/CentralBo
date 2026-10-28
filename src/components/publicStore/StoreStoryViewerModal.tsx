import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Video as VideoIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { StoreStoryItem } from '../../types';

interface StoreStoryViewerModalProps {
  stories: StoreStoryItem[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  storeName: string;
  storeLogoUrl?: string;
  brandColor?: string;
}

const PHOTO_STORY_DURATION_MS = 5000;

export const StoreStoryViewerModal: React.FC<StoreStoryViewerModalProps> = ({
  stories,
  initialIndex = 0,
  isOpen,
  onClose,
  storeName,
  storeLogoUrl,
  brandColor = '#2563eb',
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100 for active story
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Reset current index when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(Math.max(0, initialIndex), Math.max(0, stories.length - 1)));
      setProgress(0);
      setIsPaused(false);
    }
  }, [isOpen, initialIndex, stories.length]);

  const currentStory = stories[currentIndex];

  // Stop video playback and timer on close
  const handleCleanClose = useCallback(() => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      } catch {}
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    onClose();
  }, [onClose]);

  // Navigate to next story or close if last
  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      handleCleanClose();
    }
  }, [currentIndex, stories.length, handleCleanClose]);

  // Navigate to previous story
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    } else {
      setProgress(0);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCleanClose();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleCleanClose, handleNext, handlePrev]);

  // Timer for photo stories & video synchronization
  useEffect(() => {
    if (!isOpen || !currentStory || isPaused) {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      return;
    }

    if (currentStory.mediaType === 'image') {
      const stepIntervalMs = 50;
      const stepIncrement = (stepIntervalMs / PHOTO_STORY_DURATION_MS) * 100;

      progressTimerRef.current = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + stepIncrement;
        });
      }, stepIntervalMs);
    } else if (currentStory.mediaType === 'video') {
      // Handled via video timeupdate / duration
    }

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, [isOpen, currentStory, isPaused, handleNext]);

  // Video timeupdate handler
  const handleVideoTimeUpdate = () => {
    if (!videoRef.current) return;
    const { currentTime, duration } = videoRef.current;
    if (duration > 0) {
      setProgress((currentTime / duration) * 100);
    }
  };

  const handleVideoEnded = () => {
    handleNext();
  };

  // Toggle video play / pause on click
  const togglePlayPause = () => {
    if (currentStory?.mediaType === 'video' && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPaused(false);
      } else {
        videoRef.current.pause();
        setIsPaused(true);
      }
    } else {
      setIsPaused((prev) => !prev);
    }
  };

  // Toggle sound
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted((prev) => !prev);
  };

  // Touch Swipe Handlers for mobile gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Detect horizontal swipe if deltaX is prominent and greater than vertical movement
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    } else if (deltaY > 80) {
      // Swipe down to dismiss
      handleCleanClose();
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  if (!isOpen || !currentStory || stories.length === 0) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Estado de ${storeName}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md select-none transition-opacity duration-200"
    >
      {/* Background click to close */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={handleCleanClose}
        aria-hidden="true"
      />

      {/* Main Story Container */}
      <div
        className="relative z-10 w-full max-w-md h-full md:h-[90vh] md:max-h-[820px] md:rounded-3xl bg-neutral-950 flex flex-col overflow-hidden shadow-2xl border border-neutral-800/80"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* TOP SEGMENTED PROGRESS BARS */}
        <div className="absolute top-0 left-0 right-0 z-30 pt-3 px-3 pb-2 flex gap-1.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {stories.map((story, idx) => {
            let widthPercent = 0;
            if (idx < currentIndex) {
              widthPercent = 100;
            } else if (idx === currentIndex) {
              widthPercent = progress;
            } else {
              widthPercent = 0;
            }

            return (
              <div
                key={story.id || idx}
                className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-[width] duration-75 ease-linear rounded-full"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* TOP HEADER: STORE IDENTITY & ACTIONS */}
        <div className="absolute top-6 left-0 right-0 z-30 px-3.5 flex items-center justify-between text-white drop-shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Merchant Avatar */}
            <div
              className="w-9 h-9 rounded-full p-0.5 overflow-hidden shrink-0 shadow-md bg-neutral-900 border"
              style={{ borderColor: brandColor }}
            >
              {storeLogoUrl ? (
                <img
                  src={storeLogoUrl}
                  alt={storeName}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-xs font-bold text-white uppercase"
                  style={{ backgroundColor: brandColor }}
                >
                  {storeName.slice(0, 2)}
                </div>
              )}
            </div>

            {/* Merchant Name & Story Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs truncate drop-shadow">
                  {storeName}
                </span>
                <span className="text-[10px] text-white/70 font-mono">
                  {currentIndex + 1}/{stories.length}
                </span>
              </div>
              {currentStory.title ? (
                <p className="text-[11px] text-white/90 truncate font-medium">
                  {currentStory.title}
                </p>
              ) : (
                <p className="text-[10px] text-white/60 flex items-center gap-1">
                  {currentStory.mediaType === 'video' ? (
                    <>
                      <VideoIcon className="w-2.5 h-2.5" /> Video
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-2.5 h-2.5" /> Estado
                    </>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Controls: Mute & Close */}
          <div className="flex items-center gap-2 shrink-0">
            {currentStory.mediaType === 'video' && (
              <button
                type="button"
                onClick={toggleMute}
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center transition active:scale-95 cursor-pointer"
                aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}

            <button
              type="button"
              onClick={handleCleanClose}
              title="Cerrar estado"
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center transition active:scale-95 cursor-pointer"
              aria-label="Cerrar visor de estados"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MEDIA DISPLAY AREA */}
        <div
          className="relative w-full h-full flex items-center justify-center bg-black cursor-pointer"
          onClick={togglePlayPause}
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
        >
          {currentStory.mediaType === 'image' ? (
            <img
              src={currentStory.mediaUrl}
              alt={currentStory.title || `Estado ${currentIndex + 1} de ${storeName}`}
              className="w-full h-full object-contain"
              loading="eager"
            />
          ) : (
            <video
              ref={videoRef}
              src={currentStory.mediaUrl}
              autoPlay
              playsInline
              muted={isMuted}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleVideoEnded}
              className="w-full h-full object-contain"
            />
          )}

          {/* Pause overlay icon when held or paused */}
          {isPaused && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white">
                <Pause className="w-7 h-7" />
              </div>
            </div>
          )}

          {/* CLICK TOUCH ZONES: Left for Prev, Right for Next */}
          <div
            className="absolute inset-y-0 left-0 w-1/4 z-20 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Estado anterior"
          />
          <div
            className="absolute inset-y-0 right-0 w-1/4 z-20 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Estado siguiente"
          />
        </div>

        {/* BOTTOM STORY TITLE / CAPTION (IF PROVIDED) */}
        {currentStory.title && (
          <div className="absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white text-center">
            <p className="text-xs font-semibold drop-shadow tracking-wide px-2">
              {currentStory.title}
            </p>
          </div>
        )}

        {/* DESKTOP PREV / NEXT CHEVRONS */}
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="hidden md:flex absolute -left-14 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md items-center justify-center transition cursor-pointer"
            title="Anterior"
            aria-label="Estado anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {currentIndex < stories.length - 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="hidden md:flex absolute -right-14 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md items-center justify-center transition cursor-pointer"
            title="Siguiente"
            aria-label="Estado siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};
