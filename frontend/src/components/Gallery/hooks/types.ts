// src/components/MediaGallery/hooks/types.ts
export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'other';
  thumbnail_url?: string;
  is_favorite?: boolean;
  size?: number;
  uploadedAt?: string;
  deletedAt?: string;
  isDeleted?: boolean;
}

export interface MediaResponse {
  files: MediaFile[];
  hasMore: boolean;
  totalCount?: number;
  totalFavorites?: number;
  totalDeleted?: number;
}

export interface FavoriteFilesResponse extends MediaResponse {
  totalFavorites: number;
}

export interface DeletedFilesResponse extends MediaResponse {
  totalDeleted: number; 
}
export interface DeletedFilesResponse {
  files: MediaFile[];
  totalDeleted: number;
  hasMore: boolean;
}

export interface FetchState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

export interface MediaActions {
  onDelete: (fileId: string) => Promise<any> | void;
  onFavorite: (fileId: string) => Promise<any> | void;
  onDownload: (file: MediaFile) => void;
  onRestore: (fileId: string) => Promise<any> | void;
  onPermanentDelete: (fileId: string) => Promise<any> | void;
}