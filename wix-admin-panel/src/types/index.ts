// Media item structure for galleries and news
export interface MediaItem {
  description?: string;
  slug?: string;
  alt?: string;
  src: string;
  title: string;
  type: 'image' | 'video';
  settings?: {
    width?: number;
    height?: number;
    focalPoint?: [number, number];
    duration?: number;
    posters?: { url: string }[];
  };
  thumbnail?: string;
}

// Gallery item structure matching WIX CMS
export interface GalleryItem {
  id: string;
  title: string;
  createdDate: string;
  updatedDate: string;
  owner?: string;
  description: string;
  youtube_link?: string;
  media: MediaItem[];
  thumbnail: string;
  publish: boolean;
  nursery?: boolean;
}

// News item structure matching WIX CMS
export interface NewsItem {
  id: string;
  title: string;
  createdDate: string;
  updatedDate: string;
  owner?: string;
  newsIndividual: string; // URL path for individual news page
  description: string;
  youtube_link?: string;
  images_videos: MediaItem[];
  thumbnail: string;
  publish: boolean;
  nursery?: boolean;
}

// User authentication
export interface User {
  username: string;
  password: string;
}

// API Response types
export interface UploadResponse {
  success: boolean;
  message: string;
  data?: GalleryItem | NewsItem | MediaItem;
}

// Form data for creating/editing content
export interface GalleryFormData {
  title: string;
  description: string;
  youtube_link?: string;
  media: File[];
  thumbnail?: File;
  publish: boolean;
  nursery: boolean;
}

export interface NewsFormData {
  title: string;
  description: string;
  youtube_link?: string;
  images_videos: File[];
  thumbnail?: File;
  publish: boolean;
  nursery: boolean;
}

// WIX Media Response
export interface WixMediaResponse {
  id: string;
  url: string;
  filename: string;
  path: string;
  mediaType: string;
  uploaded: string;
}

// WIX Media Manager API Types
export interface WixFolder {
  id: string;
  displayName: string;
  parentFolderId: string;
  createdDate: string;
  updatedDate: string;
  state: string;
}

export interface WixFile {
  id: string;
  url: string;
  mediaType: string;
  createdDate: string;
}

export interface ImportFileRequest {
  url: string;
  displayName: string;
  parentFolderId: string;
  mimeType: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  private: boolean;
}

export interface BulkImportSuccess {
  file: WixFile;
}

export interface BulkImportFailure {
  code: string;
  message: string;
}

export interface BulkImportResult {
  success?: BulkImportSuccess;
  failure?: BulkImportFailure;
}

export interface BulkImportResponse {
  results: BulkImportResult[];
}

// WIX API Response
export interface WixApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}