export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  src: string;
};

export type LibraryFilter = 'playlists' | 'artists' | 'albums' | 'songs';
