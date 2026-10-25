import { useMemo } from 'react';
import { Music, Play, Plus, Search, Trash2 } from 'lucide-react';
import type { LibraryFilter, Track } from '../types';

const T1 = 'text-neutral-900 dark:text-white';
const T2 = 'text-neutral-800 dark:text-white/85';
const T3 = 'text-[#46464b] dark:text-white/85';
const INSET = 'bg-black/[0.04] dark:bg-black/[0.20]';
const HAIR = 'border-black/[0.06] dark:border-white/[0.14]';
const RING = 'outline-none focus-visible:ring-2 focus-visible:ring-sky-700 dark:focus-visible:ring-sky-200';

const FILTER_TITLES: Record<LibraryFilter, string> = {
  playlists: 'Tus Playlists',
  artists: 'Artistas en Biblioteca',
  albums: 'Álbumes locales',
  songs: 'Todas las Canciones',
};

const ARTIST_IMAGE =
  'https://images.unsplash.com/photo-1706101299176-292d8c5e470e?w=1600&q=80&auto=format&fit=crop';

interface TrackListProps {
  tracks: Track[];
  filter: LibraryFilter;
  query: string;
  currentIndex: number;
  isPlaying: boolean;
  onPlayTrack: (index: number) => void;
  onRemoveTrack: (index: number) => void;
  onAddRequest: () => void;
  onQueryChange: (query: string) => void;
}

export function TrackList({
  tracks,
  filter,
  query,
  currentIndex,
  isPlaying,
  onPlayTrack,
  onRemoveTrack,
  onAddRequest,
  onQueryChange,
}: TrackListProps) {
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result: { track: Track; index: number }[] = [];
    if (!q) {
      tracks.forEach((track, index) => result.push({ track, index }));
      return result;
    }
    tracks.forEach((track, index) => {
      const matches =
        track.title.toLowerCase().includes(q) ||
        track.artist.toLowerCase().includes(q) ||
        track.album.toLowerCase().includes(q);
      if (matches) result.push({ track, index });
    });
    return result;
  }, [tracks, query]);

  const isCurrent = (index: number) => index === currentIndex;

  const renderRow = ({ track, index }: { track: Track; index: number }) => {
    const current = isCurrent(index);
    const showEq = current && isPlaying;
    return (
      <div
        key={track.id}
        role="button"
        tabIndex={0}
        aria-label={`Reproducir ${track.title}`}
        onClick={() => onPlayTrack(index)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onPlayTrack(index);
          }
        }}
        className={`group w-full flex items-center justify-between gap-3 p-2 pr-3 rounded-[28px] border transition-colors duration-150 cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-sky-700 dark:focus-visible:ring-sky-200 ${
          current
            ? `bg-black/[0.05] dark:bg-black/[0.20] ${HAIR}`
            : 'border-transparent hover:bg-black/[0.04] dark:hover:bg-black/[0.14]'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${INSET}`}>
            {showEq ? (
              <span className="flex items-end gap-[3px] h-4">
                <span className="w-1 h-4 rounded-full bg-sky-700 dark:bg-sky-300 animate-bounce" />
                <span
                  className="w-1 h-2.5 rounded-full bg-sky-700 dark:bg-sky-300 animate-bounce"
                  style={{ animationDelay: '75ms' }}
                />
                <span
                  className="w-1 h-3.5 rounded-full bg-sky-700 dark:bg-sky-300 animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
              </span>
            ) : (
              <Music className="w-3.5 h-3.5 text-[#46464b] dark:text-white/85" />
            )}
          </span>
          <span className="min-w-0">
            <span className={`block text-sm font-medium truncate ${current ? 'text-sky-900 dark:text-sky-100' : T1}`}>
              {track.title}
            </span>
            <span className={`block text-xs truncate mt-0.5 ${T3}`}>
              {track.artist} — {track.album}
            </span>
          </span>
        </div>
        <button
          type="button"
          className={`pill-btn pill-btn--danger shrink-0 ${RING} opacity-0 group-hover:opacity-100 focus-visible:opacity-100`}
          aria-label="Quitar canción"
          onClick={(e) => {
            e.stopPropagation();
            onRemoveTrack(index);
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    );
  };

  return (
    <div className="px-4 pt-20 md:px-10 md:pt-10 max-w-6xl w-full mx-auto">
      {/* Cabecera sobre la foto. pad 16 + botón 48px r24 = 40: el botón queda a 16px del borde derecho y del inferior */}
      <div className={`relative rounded-[40px] overflow-hidden border ${HAIR} mb-6`}>
        <img
          src={ARTIST_IMAGE}
          alt=""
          crossOrigin="anonymous"
          width={1600}
          height={900}
          className="block h-56 md:h-72 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-(--ui-field) to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between gap-4">
          <div className="min-w-0 pl-2">
            <span className={`block text-[10px] font-bold tracking-[0.15em] uppercase ${T3} mb-2`}>Biblioteca</span>
            <h2 className={`text-4xl md:text-5xl font-semibold tracking-[-0.04em] ${T1}`}>{FILTER_TITLES[filter]}</h2>
          </div>
          <button
            type="button"
            className={`h-12 px-6 shrink-0 flex items-center gap-2 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black/85 dark:hover:bg-white/90 active:scale-[0.98] transition-all duration-150 ${RING}`}
            onClick={() => onPlayTrack(0)}
          >
            <Play size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Reproducir</span>
          </button>
        </div>
      </div>
      <div className="relative">
        <div>
          <div className="relative mb-6">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#46464b] dark:text-white/70" />
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Buscar en la biblioteca…"
              aria-label="Buscar en la biblioteca"
              className={`h-12 w-full rounded-full pl-12 pr-5 text-[15px] ${INSET} border border-black/[0.10] dark:border-white/[0.18] ${T1} placeholder:text-[#46464b] dark:placeholder:text-white/70 ${RING}`}
            />
          </div>

          {visible.length === 0 ? (
            <div className="glass panel max-w-md mx-auto text-center">
              <div className="w-14 h-14 rounded-full bg-black/[0.04] dark:bg-black/[0.20] flex items-center justify-center mx-auto">
                <Music className="w-7 h-7 text-[#46464b] dark:text-white/85" />
              </div>
              <p className={`text-sm font-semibold mt-4 ${T1}`}>No hay música en tu biblioteca</p>
              <p className={`text-xs mt-2 ${T3}`}>Agrega archivos MP3 con el botón + o arrástralos aquí.</p>
              <button
                type="button"
                className={`mt-4 w-full h-12 rounded-full ${INSET} border ${HAIR} ${T3} hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-black/[0.14] text-xs font-semibold uppercase tracking-wider ${RING}`}
                onClick={onAddRequest}
              >
                Seleccionar archivos MP3
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {visible.map(({ track, index }) => renderRow({ track, index }))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
