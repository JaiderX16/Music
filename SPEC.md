# SPEC — Music (reproductor) en React + Memoria Spot UI + @memoria-labs/liquid-glass

Eres el ejecutor. Convierte el reproductor HTML de `REFERENCIA-Reproductor.html.txt` (mismo comportamiento) a React + TypeScript
en este proyecto, con el estilo Memoria Spot UI y los componentes de cristal líquido de `@memoria-labs/liquid-glass`.
El proyecto YA está creado y con dependencias instaladas. NO instales ni quites dependencias, NO toques `package.json`,
`index.html`, `vite.config.ts`, `tsconfig.json`, `src/main.tsx`, `src/index.css` ni `src/hooks/useTheme.ts`.
NO uses Font Awesome ni el CDN de Tailwind: iconos con `lucide-react`, estilos con Tailwind v4 (ya configurado) y las
clases de Memoria que ya están en `src/index.css` (`glass`, `glass-strong`, `dock`, `pill-btn`, `pill`, `panel`,
`panel-inner`, `panel-chip`, `dock-divider`). Todos los textos en español.

## Archivos a crear

```
src/types.ts                    // type Track = { id: string; title: string; artist: string; album: string; src: string }
src/hooks/useAudioPlayer.ts     // toda la lógica de audio (ver abajo)
src/components/Sidebar.tsx
src/components/TrackList.tsx
src/components/MiniPlayer.tsx
src/components/FullPlayer.tsx
src/components/GlassPlayButton.tsx
src/components/Slider.tsx
src/App.tsx                     // reemplaza el actual (que solo devuelve null)
```

## 1. `useAudioPlayer` (src/hooks/useAudioPlayer.ts)

Un único `HTMLAudioElement` creado con `useRef(new Audio())` (o en un efecto). Estado React:
`tracks: Track[]`, `currentIndex: number`, `isPlaying`, `isShuffle`, `repeatMode: 0 | 1 | 2` (0 sin repetir, 1 todas, 2 una),
`volume` (0–1), `muted`, `currentTime`, `duration`.

Acciones (todas con `useCallback`):
- `addFiles(files: File[])`: filtra `f.type.includes('audio') || f.name.endsWith('.mp3')`; por archivo crea
  `URL.createObjectURL(file)`; título = nombre sin extensión; si contiene `" - "` → `artista - título`; si no, artista
  `"Artista desconocido"`; álbum `"Álbum local"`; id con `crypto.randomUUID()`. Si la lista estaba vacía, carga la primera
  pista sin reproducir.
- `playTrack(index)`, `togglePlay()`, `next()` (aleatorio si `isShuffle`), `prev()`, `seek(percent 0–100)`, `setVolume(v)`,
  `toggleMute()`, `toggleShuffle()`, `cycleRepeat()`, `removeTrack(index)` (revoca su object URL con `URL.revokeObjectURL`,
  ajusta `currentIndex`; si la lista queda vacía, pausa y limpia `src`).
- Eventos del audio (`timeupdate`, `loadedmetadata`, `ended`, `play`, `pause`) en un `useEffect` con su limpieza
  (`removeEventListener`). En `ended`: si `repeatMode === 2` vuelve a 0 y reproduce; si no, `next()`
  (si `repeatMode === 0` y era la última pista, detén en vez de volver al principio).
- Al desmontar: pausa y revoca TODOS los object URLs.
- `audio.play()` devuelve una promesa: captura el error (`.catch(() => {})`) para no romper si el navegador lo bloquea.
- Exporta también `formatTime(seconds)` → `m:ss` (devuelve `0:00` si no es un número finito).

## 2. Layout (App.tsx) — HUD flotante de Memoria

- Raíz: `<div className="relative min-h-screen bg-(--ui-field) text-neutral-900 dark:text-white">`.
- Tema: `const { theme, toggleTheme } = useTheme()` de `./hooks/useTheme`.
- Cristal: `const pageRef = useRef<HTMLDivElement>(null)` sobre el contenido principal (`<main ref={pageRef}>`), y
  `const { domCanvas } = useLiquidGlassCapture(pageRef, { deps: [theme, tracks.length, filter, query], background: '--ui-field' })`
  importado de `@memoria-labs/liquid-glass`.
- **Todo lo que sea cristal flotante lleva la clase `ignore-capture`** (sidebar, mini reproductor, reproductor completo),
  para no salir en su propia foto.
- Sidebar a la izquierda en escritorio (`md:`); en móvil, el contenido ocupa todo y el sidebar se convierte en una fila
  de pastillas arriba (ver Sidebar).
- `<main ref={pageRef}>` con `md:pl-[352px]` (16 + 320 + 16) y `pb-40` para no quedar tapado por el mini reproductor.
- Arrastrar y soltar archivos de audio sobre la ventana los añade (`dragover` → `preventDefault`, `drop` → `addFiles`).
- `<input type="file" accept="audio/mp3,audio/*" multiple hidden>` único, con `ref`; los botones "+" lo abren con `.click()`.
- Estado de UI en App: `filter: 'playlists' | 'artists' | 'albums' | 'songs'` (por defecto `'songs'`), `query`, `fullOpen`.

## 3. Componentes

Usa estas constantes de texto (claro + oscuro siempre juntos):
```ts
const T1 = 'text-neutral-900 dark:text-white';
const T2 = 'text-neutral-800 dark:text-white/85';
const T3 = 'text-[#46464b] dark:text-white/85';
const INSET = 'bg-black/[0.04] dark:bg-black/[0.20]';
const HAIR = 'border-black/[0.06] dark:border-white/[0.14]';
const RING = 'outline-none focus-visible:ring-2 focus-visible:ring-sky-700 dark:focus-visible:ring-sky-200';
```
Regla de color de Memoria: superficies neutras; el color solo como señal. Sustituye el rojo de Apple así:
pista actual = título en `text-sky-900 dark:text-sky-100` y barras animadas de ecualizador en `bg-sky-700 dark:bg-sky-300`;
shuffle/repeat activos = `aria-pressed` en un `pill-btn` (ya tiene su estilo). Nunca rellenes botones con color.

### Sidebar.tsx (isla de cristal, receta Memoria)
Escritorio: `<aside className="ignore-capture hidden md:flex fixed top-4 left-4 bottom-4 w-[320px] z-20 flex-col gap-2 p-3 rounded-[42px] glass overflow-hidden">`
con comentario `{/* pad 12 + header card r30 = 42 */}`.
- Cabecera (`rounded-[30px] ${INSET} p-2 flex items-center justify-between`, comentario `pad 8 + 44px circle r22 = 30`):
  título `Biblioteca` (`text-sm font-semibold uppercase tracking-wider ${T1}`, con `pl-3`) y a la derecha dos `pill-btn`:
  añadir (`Plus`, `aria-label="Agregar canciones"`) y tema (`Sun` en oscuro / `Moon` en claro).
- Etiqueta de sección `Biblioteca` → usa `Colección` (`text-[10px] font-bold tracking-[0.15em] uppercase ${T3}` con `px-3 mb-3`).
- Filas (Playlists `ListMusic`, Artistas `Mic`, Álbumes `Disc3`, Canciones `Music`), cada una:
  `w-full flex items-center gap-3 p-2 pr-4 rounded-[28px] border text-left transition-colors duration-150 ${RING}`
  + activa: `bg-black/[0.05] dark:bg-black/[0.20] ${HAIR}` / inactiva: `border-transparent hover:bg-black/[0.04] dark:hover:bg-black/[0.14]`,
  `aria-current={active ? 'page' : undefined}`, círculo de icono `w-10 h-10 rounded-full flex items-center justify-center ${INSET}` con icono 16px,
  nombre `text-sm font-medium`, y el número de pistas a la derecha en `font-mono text-[11px] tabular-nums ${T3}`.
Móvil (`md:hidden`): una barra `ignore-capture glass rounded-[22px] p-1.5 flex gap-1 overflow-x-auto` arriba (sticky `top-4`, `mx-4`)
con las 4 secciones como `pill` + `aria-pressed`, y al final `pill-btn`s de añadir y tema.

### TrackList.tsx (dentro de <main>)
- Cabecera: etiqueta `Biblioteca` (estilo etiqueta de sección), título por filtro (`Tus Playlists`, `Artistas en Biblioteca`,
  `Álbumes locales`, `Todas las Canciones`) en `text-4xl md:text-5xl font-semibold tracking-[-0.04em] ${T1}`, y el botón
  primario extendido **Reproducir** (`Play` 16px): `h-12 px-6 flex items-center gap-2 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black/85 dark:hover:bg-white/90 active:scale-[0.98] transition-all duration-150 ${RING}` con etiqueta `text-xs font-semibold uppercase tracking-wider`.
- Detrás de la cabecera, una imagen decorativa a lo ancho para que el cristal tenga algo que refractar:
  `https://images.unsplash.com/photo-1706101299176-292d8c5e470e?w=1600&q=80&auto=format&fit=crop` con `crossOrigin="anonymous"`,
  `rounded-[28px] h-56 md:h-72 w-full object-cover border ${HAIR}` y encima un velo `bg-gradient-to-t from-(--ui-field) to-transparent`.
- Buscador (pozo Memoria): `h-12 w-full rounded-full pl-12 pr-5 text-[15px] ${INSET} border border-black/[0.10] dark:border-white/[0.18] ${T1} placeholder:text-[#46464b] dark:placeholder:text-white/70 ${RING}`,
  icono `Search` 16px a la izquierda, placeholder `Buscar en la biblioteca…`. Filtra por título, artista o álbum.
- Filas de pista (`space-y-1`), cada una botón/fila clicable que llama a `playTrack(index original)`:
  `group flex items-center justify-between gap-3 p-2 pr-3 rounded-[28px] border transition-colors duration-150 cursor-pointer`
  (actual: `bg-black/[0.05] dark:bg-black/[0.20] ${HAIR}`; resto: `border-transparent hover:bg-black/[0.04] dark:hover:bg-black/[0.14]`).
  Izquierda: círculo 40px `${INSET}` con `Music` 14px, o el ecualizador (3 barras `w-1 rounded-full animate-bounce` de alturas
  `h-4`, `h-2.5`, `h-3.5`) si es la actual y suena. Texto: título `text-sm font-medium truncate` (actual con el color de señal),
  debajo `artista — álbum` en `text-xs truncate ${T3}`. Derecha: botón borrar `pill-btn pill-btn--danger` con `Trash2` 14px,
  `opacity-0 group-hover:opacity-100 focus-visible:opacity-100`, `aria-label="Quitar canción"`, con `stopPropagation`.
- Estado vacío (sin pistas o sin resultados): panel `glass panel max-w-md mx-auto text-center` con círculo 56px `${INSET}` e icono
  `Music`, título `No hay música en tu biblioteca` (`text-sm font-semibold ${T1}`), texto `Agrega archivos MP3 con el botón + o arrástralos aquí.`
  (`text-xs ${T3}`) y botón secundario extendido `Seleccionar archivos MP3`:
  `mt-4 w-full h-12 rounded-full ${INSET} border ${HAIR} ${T3} hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-black/[0.14] text-xs font-semibold uppercase tracking-wider ${RING}`.

### Slider.tsx
`<input type="range">` estilizado Memoria: props `value`, `max`, `step`, `onChange(n)`, `aria-label`, `className`.
Pista `h-1.5 rounded-full`, relleno `bg-neutral-900 dark:bg-white` (pinta el progreso con un `background: linear-gradient(...)`
calculado por porcentaje usando `currentColor`), thumb 20px blanco con borde `black/10` y sombra (usa clases arbitrarias de Tailwind
`[&::-webkit-slider-thumb]:...` y `[&::-moz-range-thumb]:...`), `appearance-none cursor-pointer`, y focus ring.

### GlassPlayButton.tsx — botón de reproducir de CRISTAL LÍQUIDO
Props: `size: number` (px), `isPlaying`, `onClick`, `domCanvas`, `pageRef`, `isDark`.
```tsx
import { TouchableGlassContainer, LiquidGlassButton } from '@memoria-labs/liquid-glass';
<button type="button" onClick={onClick} aria-label={isPlaying ? 'Pausar' : 'Reproducir'} className={`rounded-full ${RING}`} style={{ width: size, height: size }}>
  <TouchableGlassContainer className="w-full h-full rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
    {({ isPressed }) => (
      <>
        <div className={`absolute inset-0 transition-opacity duration-500 ${domCanvas ? 'opacity-100' : 'opacity-0'}`}>
          <LiquidGlassButton domCanvas={domCanvas} pageRef={pageRef} shape="circle" isPressed={isPressed} />
        </div>
        <div className={`absolute inset-0 flex items-center justify-center rounded-full border pointer-events-none ${isDark ? 'border-white/20 text-white' : 'border-black/20 text-neutral-900'}`}>
          {isPlaying ? <Pause /> : <Play />}   // tamaño de icono = size * 0.36, Play con un pequeño margen izquierdo
        </div>
      </>
    )}
  </TouchableGlassContainer>
</button>
```

### MiniPlayer.tsx — barra flotante inferior de cristal líquido
Contenedor: `ignore-capture fixed z-30 bottom-4 left-4 right-4 md:left-[352px] md:right-4 mx-auto max-w-4xl rounded-[28px] overflow-hidden isolate`
con `<LiquidGlassSurface domCanvas={domCanvas} pageRef={pageRef} radius={28} />` como primer hijo (de `@memoria-labs/liquid-glass`),
y el contenido encima con `relative p-3 flex items-center justify-between gap-3`. Comentario: `{/* pad 12 + carátula/botones r16 = 28 */}`.
- Izquierda (clic → abre el reproductor completo): carátula 48px `rounded-[16px] ${INSET} border ${HAIR}` con `Music`, título
  `text-sm font-medium truncate ${T1}` (`Ninguna canción` si no hay) y artista `text-xs truncate ${T3}` (`Selecciona o agrega música`).
- Centro (`hidden sm:flex flex-col items-center gap-1 w-1/3 max-w-xs`): `pill-btn` shuffle (`Shuffle`, `aria-pressed`),
  `pill-btn` anterior (`SkipBack`), **GlassPlayButton size 44**, `pill-btn` siguiente (`SkipForward`), `pill-btn` repetir
  (`Repeat` o `Repeat1` si modo 2, `aria-pressed={repeatMode > 0}`); debajo tiempo actual, `Slider` de progreso y duración en
  `font-mono text-[10px] tabular-nums ${T3}`.
- Derecha: en móvil `GlassPlayButton size 44` + `pill-btn` `ChevronUp` (abre completo); en `md:` volumen (`Volume1`, `Slider` w-24, `Volume2`).

### FullPlayer.tsx — pantalla completa (hoja de cristal)
`ignore-capture fixed inset-0 z-50 flex items-center justify-center p-4` con un scrim `absolute inset-0 bg-black/40 dark:bg-black/60`
(clic cierra) y una hoja `relative w-full max-w-md glass glass-strong rounded-[48px] p-6 flex flex-col gap-6`, animada al abrir/cerrar
con `transition-all duration-300` (`translate-y-8 opacity-0 pointer-events-none` cerrado). `Escape` cierra.
- Cabecera: `pill-btn` `ChevronDown` (cerrar, `aria-label="Cerrar"`), etiqueta `Reproduciendo ahora`
  (`text-[10px] font-bold uppercase tracking-[0.15em] ${T3}`), `pill-btn` `Ellipsis` (sin acción, `aria-label="Más opciones"`).
- Carátula grande `aspect-square w-full rounded-[28px] ${INSET} border ${HAIR} grid place-items-center` con `Music` 64px y un halo
  `absolute -inset-6 rounded-full bg-white/30 dark:bg-white/5 blur-3xl -z-10`.
- Título `text-xl font-semibold truncate ${T1}` y artista `text-base truncate ${T3}` centrados.
- `Slider` de progreso a lo ancho + tiempos (mono, tabular) a los lados.
- Controles: shuffle, anterior (`SkipBack` 24px), **GlassPlayButton size 80**, siguiente, repetir; mismo comportamiento que el mini.
- Pie: `pill-btn` silenciar (`Volume2` / `VolumeX`, `aria-pressed={muted}`).

## 4. Accesibilidad y calidad
- Todo botón de icono con `aria-label`. Toggles con `aria-pressed`.
- Sin `any`. Tipos explícitos en props.
- No dejes `console.log`.
- `prefers-reduced-motion`: el CSS ya lo respeta para pill-btn; en el ecualizador añade `motion-reduce:animate-none`.

## 5. Terminar
Ejecuta `npx tsc --noEmit` y `npm run build` y corrige hasta que ambos pasen sin errores. NO ejecutes `npm run dev`.
No hagas commits ni uses git.
