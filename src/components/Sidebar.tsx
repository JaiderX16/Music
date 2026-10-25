import { Disc3, ListMusic, Mic, Moon, Music, Plus, Sun } from 'lucide-react';
import type { LibraryFilter } from '../types';

const INSET = 'bg-black/[0.04] dark:bg-black/[0.20]';
const HAIR = 'border-black/[0.06] dark:border-white/[0.14]';
const T1 = 'text-neutral-900 dark:text-white';
const T2 = 'text-neutral-800 dark:text-white/85';
const T3 = 'text-[#46464b] dark:text-white/85';
const RING = 'outline-none focus-visible:ring-2 focus-visible:ring-sky-700 dark:focus-visible:ring-sky-200';

export const LIBRARY_FILTERS: { key: LibraryFilter; label: string; icon: typeof Music }[] = [
  { key: 'playlists', label: 'Playlists', icon: ListMusic },
  { key: 'artists', label: 'Artistas', icon: Mic },
  { key: 'albums', label: 'Álbumes', icon: Disc3 },
  { key: 'songs', label: 'Canciones', icon: Music },
];

interface SidebarProps {
  filter: LibraryFilter;
  onFilterChange: (filter: LibraryFilter) => void;
  counts: Record<LibraryFilter, number>;
  onAddRequest: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Sidebar({ filter, onFilterChange, counts, onAddRequest, theme, onToggleTheme }: SidebarProps) {
  const activeFilter = (key: LibraryFilter) => filter === key;

  const sidebarContent = (
    <>
      <div className="rounded-[30px] bg-black/[0.04] dark:bg-black/[0.20] p-2 flex items-center justify-between">
        <h2 className={`text-sm font-semibold uppercase tracking-wider pl-3 ${T1}`}>Biblioteca</h2>
        <div className="flex items-center gap-2 pr-2">
          <button type="button" className="pill-btn" aria-label="Agregar canciones" onClick={onAddRequest}>
            <Plus size={16} />
          </button>
          <button type="button" className="pill-btn" aria-label="Cambiar tema" onClick={onToggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
      <span className={`px-3 mb-3 text-[10px] font-bold tracking-[0.15em] uppercase ${T3}`}>Colección</span>
      <nav className="flex flex-col gap-1">
        {LIBRARY_FILTERS.map(({ key, label, icon: Icon }) => {
          const isActive = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onFilterChange(key)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center gap-3 p-2 pr-4 rounded-[28px] border text-left transition-colors duration-150 ${RING} ${
                isActive
                  ? `bg-black/[0.05] dark:bg-black/[0.20] ${HAIR}`
                  : 'border-transparent hover:bg-black/[0.04] dark:hover:bg-black/[0.14]'
              }`}
            >
              <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${INSET}`}>
                <Icon size={16} />
              </span>
              <span className={`text-sm font-medium ${isActive ? T1 : T2}`}>{label}</span>
              <span className={`ml-auto font-mono text-[11px] tabular-nums ${T3}`}>{counts[key]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      <aside className="ignore-capture hidden md:flex fixed top-4 left-4 bottom-4 w-[320px] z-20 flex-col gap-2 p-3 rounded-[42px] glass overflow-hidden">
        {/* pad 12 + header card r30 = 42 */}
        {sidebarContent}
      </aside>
      <nav className="ignore-capture md:hidden sticky top-4 mx-4 z-20">
        {/* pad 6 + 32px pill r16 = 22: todo a 32px (las acciones como pill de solo icono, no pill-btn de 44) */}
        <div className="glass rounded-[22px] p-1.5 flex items-center gap-1">
          {/* Secciones: se deslizan de lado si no caben, sin empujar las acciones */}
          <div className="flex-1 min-w-0 flex items-center gap-1 overflow-x-auto [scrollbar-width:none]">
            {LIBRARY_FILTERS.map(({ key, label, icon: Icon }) => {
              const isActive = filter === key;
              return (
                <button
                  key={key}
                  type="button"
                  className="pill shrink-0"
                  aria-pressed={isActive}
                  onClick={() => onFilterChange(key)}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
          <div className="w-px h-5 shrink-0 bg-black/[0.08] dark:bg-white/[0.14]" />
          <button type="button" className="pill !w-8 !px-0 shrink-0" aria-label="Agregar canciones" onClick={onAddRequest}>
            <Plus size={14} />
          </button>
          <button type="button" className="pill !w-8 !px-0 shrink-0" aria-label="Cambiar tema" onClick={onToggleTheme}>
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </nav>
    </>
  );
}
