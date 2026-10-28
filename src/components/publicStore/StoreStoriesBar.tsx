import React from 'react';
import { Video as VideoIcon, Image as ImageIcon } from 'lucide-react';
import { StoreStoryItem } from '../../types';

interface StoreStoriesBarProps {
  stories: StoreStoryItem[];
  storeName: string;
  storeLogoUrl?: string;
  brandColor?: string;
  onOpenStory: (index: number) => void;
}

export const StoreStoriesBar: React.FC<StoreStoriesBarProps> = ({
  stories,
  storeName,
  storeLogoUrl,
  brandColor = '#2563eb',
  onOpenStory,
}) => {
  if (!stories || stories.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Estados de la tienda"
      className="w-full py-3 mb-2"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-2.5">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: brandColor }}
          />
          <h3 className="text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300">
            Estados
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            ({stories.length})
          </span>
        </div>

        {/* Horizontal scroll container with snap */}
        <div className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none snap-x touch-pan-x">
          {stories.map((story, index) => {
            const isVideo = story.mediaType === 'video';

            return (
              <button
                key={story.id || index}
                type="button"
                onClick={() => onOpenStory(index)}
                className="group relative flex flex-col items-center gap-1.5 focus:outline-hidden snap-start cursor-pointer transition active:scale-95 shrink-0"
                aria-label={`Ver estado ${index + 1}: ${story.title || (isVideo ? 'Video' : 'Fotografía')}`}
              >
                {/* Gradient ring bubble */}
                <div
                  className="relative p-[2.5px] rounded-full transition-transform duration-200 group-hover:scale-105 shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${brandColor}, #ec4899, #f59e0b)`,
                  }}
                >
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-[2px] bg-white dark:bg-slate-900 overflow-hidden relative">
                    {isVideo ? (
                      <div className="w-full h-full relative bg-neutral-900 rounded-full overflow-hidden flex items-center justify-center">
                        <video
                          src={story.mediaUrl}
                          className="w-full h-full object-cover rounded-full"
                          preload="metadata"
                          muted
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <VideoIcon className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={story.mediaUrl}
                        alt={story.title || `Estado ${index + 1}`}
                        className="w-full h-full object-cover rounded-full group-hover:brightness-95 transition"
                        loading="lazy"
                      />
                    )}
                  </div>

                  {/* Media type small indicator badge */}
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] shadow-sm border border-white dark:border-slate-900"
                    style={{ backgroundColor: brandColor }}
                    title={isVideo ? 'Video' : 'Foto'}
                  >
                    {isVideo ? (
                      <VideoIcon className="w-2.5 h-2.5" />
                    ) : (
                      <ImageIcon className="w-2.5 h-2.5" />
                    )}
                  </div>
                </div>

                {/* Caption / Title label */}
                <span className="w-18 sm:w-20 text-[11px] font-medium text-center text-slate-700 dark:text-slate-300 truncate group-hover:text-slate-950 dark:group-hover:text-white transition">
                  {story.title?.trim() || `Estado #${index + 1}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
