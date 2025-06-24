import { WixMediaResponse, WixFolder, WixFile, ImportFileRequest, BulkImportResponse } from '@/types';
import { uploadFileToSupabase } from './supabase';
import supabase from './supabase';

const WIX_API_KEY = process.env.WIX_API_KEY!;
const WIX_SITE_ID = process.env.WIX_SITE_ID!;
const WIX_ACCOUNT_ID = process.env.WIX_ACCOUNT_ID!;

export class WixMediaService {
  private baseUrl = 'https://www.wixapis.com/site-media/v1';
  private headers = {
    'Authorization': `Bearer ${WIX_API_KEY}`,
    'wix-account-id': WIX_ACCOUNT_ID,
    'wix-site-id': WIX_SITE_ID,
    'Content-Type': 'application/json',
  };

  /**
   * Generate folder path based on type/year/month/title structure
   * @param title - The title to use for the folder
   * @param mediaType - The type of media (gallery or news)
   * @returns Folder path in format: /gallery|news/YYYY/MM/sanitized-title
   */
  private generateFolderPath(title: string, mediaType: 'gallery' | 'news'): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // For news, skip slug, use only date path
    if (mediaType === 'news') {
      return `/${mediaType}/${year}/${month}`;
    }
    // Sanitize title for gallery folder slug
    const sanitizedTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
    
    return `/${mediaType}/${year}/${month}/${sanitizedTitle}`;
  }

  /**
   * Create folder in WIX Media Manager using hierarchical structure
   * @param folderPath - The folder path to create (e.g., "/gallery/2025/06/summer-photos")
   * @returns Folder ID or null if creation failed
   */
  private async ensureFolderExists(folderPath: string): Promise<string | null> {
    try {
      const pathParts = folderPath.split('/').filter(part => part.length > 0);
      let currentParentId = 'MEDIA_ROOT'; // Default root folder ID
      
      // Create each folder in the hierarchy
      for (const folderName of pathParts) {
        // First, check if folder already exists
        const listResponse = await fetch(`${this.baseUrl}/folders?parentFolderId=${currentParentId}`, {
          method: 'GET',
          headers: this.headers,
        });

        let folderId = null;
        if (listResponse.ok) {
          const foldersData = await listResponse.json();
          const existingFolder = foldersData.folders?.find((f: any) => f.displayName === folderName);
          if (existingFolder) {
            folderId = existingFolder.id;
          }
        }

        // Create folder if it doesn't exist
        if (!folderId) {
          const createResponse = await fetch(`${this.baseUrl}/folders`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
              displayName: folderName,
              parentFolderId: currentParentId,
            }),
          });

          if (createResponse.ok) {
            const folderData = await createResponse.json();
            folderId = folderData.folder.id;
          } else {
            console.error('Failed to create folder:', folderName);
            return null;
          }
        }

        currentParentId = folderId;
      }
      
      return currentParentId;
    } catch (error) {
      console.error('Error ensuring folder exists:', error);
      return null;
    }
  }

  /**
   * Convert file to blob URL for uploading
   * @param file - The file to convert
   * @returns Promise resolving to blob URL string
   */
  private async fileToBlobUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Create a temporary blob URL for the file
        const blobUrl = URL.createObjectURL(file);
        resolve(blobUrl);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Upload image to WIX Media Manager using import API
   * @param file - The file to upload
   * @param title - Title for organizing the file
   * @param mediaType - Type of media (gallery or news)
   * @param parentFolderIdOverride - Optional explicit folder ID to use instead of creating a new path
   * @returns Upload response with WIX media URL
   */
  async uploadImage(
    file: File,
    title: string,
    mediaType: 'gallery' | 'news' = 'gallery',
    parentFolderIdOverride?: string
  ): Promise<{ src: string; title: string; alt: string; type: string }> {
    try {
      const folderPath = this.generateFolderPath(title, mediaType);
      // Use override if provided, otherwise ensure folder exists
      const folderId = parentFolderIdOverride ?? (await this.ensureFolderExists(folderPath));

      // Upload to Supabase to get a public URL
      console.log(`Uploading file to Supabase: ${file.name}`);
      const bucket = mediaType;
      // Generate unique filename based on current timestamp
      const ext = file.name.split('.').pop() || '';
      const uniqueFilename = `${Date.now() * 1000}.${ext}`;
      const supabaseFilePath = `${folderPath}/${uniqueFilename}`.replace(/^\//, '');
      const publicUrl = await uploadFileToSupabase(file, bucket, supabaseFilePath);
      
      // Import file using the single import API with the public URL
      const importPayload: ImportFileRequest = {
        url: publicUrl,
        displayName: title,
        parentFolderId: folderId || 'media-root',
        mimeType: file.type,
        mediaType: 'IMAGE',
        private: false,
      };
      console.log('Wix import headers:', this.headers);
      console.log('Wix import payload:', importPayload);

      const importResponse = await fetch(`${this.baseUrl}/files/import`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(importPayload),
      });

      if (!importResponse.ok) {
        const errorText = await importResponse.text();
        throw new Error(`Failed to import file: ${importResponse.status} ${importResponse.statusText} - ${errorText}`);
      }

      let importResult: any;
      try {
        importResult = await importResponse.json();
      } catch (parseError) {
        const text = await importResponse.text();
        throw new Error(`Import failed with non-JSON response: ${text}`);
      }

      if (!importResult.file) {
        throw new Error('Import response missing file data');
      }

      const uploadedFile = importResult.file;

      // Return in the expected format
      return {
        src: uploadedFile.url,
        title: uniqueFilename,
        alt: uniqueFilename,
        type: 'image',
      };
    } catch (error) {
      console.error('WIX Media upload error:', error);
      throw error;
    }
  }

  /**
   * Convert file to data URL
   * @param file - The file to convert
   * @returns Promise resolving to data URL string
   */
  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload thumbnail image to WIX Media Manager
   * @param file - The thumbnail file to upload
   * @param title - Title for organizing the file
   * @param mediaType - Type of media (gallery or news)
   * @returns Upload response with WIX media URL
   */
  async uploadThumbnail(
    file: File,
    title: string,
    mediaType: 'gallery' | 'news' = 'gallery',
    parentFolderIdOverride?: string
  ): Promise<WixMediaResponse> {
    try {
      const folderPath = this.generateFolderPath(title, mediaType);
      // Generate unique timestamp-based filename for thumbnail
      const extThumb = file.name.split('.').pop() || '';
      const uniqueThumbName = `${Date.now() * 1000}.${extThumb}`;
      
      const bucket = mediaType;
      const supabaseFilePath = `${folderPath}/${uniqueThumbName}`.replace(/^[\\/]/, '');
      const publicUrl = await uploadFileToSupabase(file, bucket, supabaseFilePath);
      
      const importPayload: ImportFileRequest = {
        url: publicUrl,
        displayName: `${title}-thumbnail`,
        parentFolderId: (parentFolderIdOverride ?? (await this.ensureFolderExists(folderPath))) || 'media-root',
        mimeType: file.type,
        mediaType: 'IMAGE',
        private: false,
      };

      const importResponse = await fetch(`${this.baseUrl}/files/import`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(importPayload),
      });

      if (!importResponse.ok) {
        const errorText = await importResponse.text();
        throw new Error(`Failed to import thumbnail: ${importResponse.status} ${importResponse.statusText} - ${errorText}`);
      }

      const importResult = await importResponse.json();
      if (!importResult.file) {
        throw new Error('Import response missing file data');
      }

      // Cleanup deferred: keep thumbnail temp file in Supabase until gallery/news is saved

      return {
        id: importResult.file.id,
        url: importResult.file.url,
        filename: uniqueThumbName,
        path: folderPath,
        mediaType: importResult.file.mediaType.toLowerCase(),
        uploaded: importResult.file.createdDate,
      };
    } catch (error) {
      console.error('WIX Media thumbnail upload error:', error);
      throw error;
    }
  }

  /**
   * Bulk import files to WIX Media Manager
   * @param files - Array of files to upload
   * @param title - Title for organizing the files
   * @param mediaType - Type of media (gallery or news)
   * @returns Array of upload responses
   */
  async bulkUploadImages(files: File[], title: string, mediaType: 'gallery' | 'news' = 'gallery'): Promise<WixMediaResponse[]> {
    try {
      if (files.length === 0) {
        return [];
      }

      if (files.length > 100) {
        throw new Error('Cannot upload more than 100 files at once (WIX API limit)');
      }

      const folderPath = this.generateFolderPath(title, mediaType);
      
      // Ensure folder exists
      const folderId = await this.ensureFolderExists(folderPath);
      
      // Prepare import requests by uploading each file to temporary hosting
      console.log(`Preparing to upload ${files.length} files...`);
      const importFileRequests: ImportFileRequest[] = await Promise.all(
        files.map(async (file, index) => {
          console.log(`Uploading file ${index + 1}/${files.length}: ${file.name}`);
          const bucket = mediaType;
          // Generate unique filename based on current timestamp
          const ext = file.name.split('.').pop() || '';
          const uniqueFilename = `${Date.now() * 1000}.${ext}`;
          const supabaseFilePath = `${folderPath}/${uniqueFilename}`.replace(/^\//, '');
          const publicUrl = await uploadFileToSupabase(file, bucket, supabaseFilePath);
          return {
            url: publicUrl,
            displayName: file.name,
            parentFolderId: folderId || 'MEDIA_ROOT',
            mimeType: file.type,
            mediaType: 'IMAGE' as const,
            private: false,
          };
        })
      );

      console.log('Starting bulk import to WIX Media Manager...');
      // Bulk import using the bulk import API
      const bulkImportResponse = await fetch(`${this.baseUrl}/bulk/files/import-v2`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          importFileRequests,
          returnEntity: true,
        }),
      });
      // Parse and handle bulk import response
      if (!bulkImportResponse.ok) {
        const errText = await bulkImportResponse.text();
        throw new Error(`Failed to bulk import files: ${bulkImportResponse.status} ${bulkImportResponse.statusText} - ${errText}`);
      }
      const bulkImportResult: BulkImportResponse = await bulkImportResponse.json();
      const uploadResponses: WixMediaResponse[] = [];
      const errors: string[] = [];
      bulkImportResult.results.forEach((result, index) => {
        if (result.success && result.success.file) {
          const fileData = result.success.file;
          uploadResponses.push({
            id: fileData.id,
            url: fileData.url,
            filename: files[index].name,
            path: folderPath,
            mediaType: fileData.mediaType.toLowerCase(),
            uploaded: fileData.createdDate,
          });
        } else if (result.failure) {
          const msg = `Failed to upload ${files[index].name}: ${result.failure.message}`;
          console.error(msg, result.failure);
          errors.push(msg);
        }
      });
      if (errors.length > 0 && uploadResponses.length === 0) {
        throw new Error(`All file uploads failed:\n${errors.join('\n')}`);
      }
      if (errors.length > 0) console.warn(`Some files failed to upload:\n${errors.join('\n')}`);
      return uploadResponses;
    } catch (error) {
      console.error('WIX Media bulk upload error:', error);
      throw error;
    }
  }

  /**
   * Delete media from WIX Media Manager
   * @param mediaId - The WIX media ID to delete
   * @returns Success boolean
   */
  async deleteMedia(mediaId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/files/${mediaId}`, {
        method: 'DELETE',
        headers: this.headers,
      });

      return response.ok;
    } catch (error) {
      console.error('WIX Media deletion error:', error);
      return false;
    }
  }

  /**
   * Get media item details
   * @param mediaId - The WIX media ID
   * @returns Media item details
   */
  async getMediaDetails(mediaId: string): Promise<WixMediaResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/files/${mediaId}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        id: data.file.id,
        url: data.file.url,
        filename: data.file.displayName,
        path: data.file.parentFolderId || '',
        mediaType: data.file.mediaType,
        uploaded: data.file.createdDate,
      };
    } catch (error) {
      console.error('WIX Media get details error:', error);
      return null;
    }
  }

  /**
   * List media files with optional filtering
   * @param folderId - Optional folder ID to filter by
   * @returns Array of media items
   */
  async listMedia(folderId?: string): Promise<WixMediaResponse[]> {
    try {
      const queryParams = new URLSearchParams();
      if (folderId) {
        queryParams.append('parentFolderId', folderId);
      }

      const response = await fetch(`${this.baseUrl}/files?${queryParams.toString()}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to list media: ${response.statusText}`);
      }

      const data = await response.json();
      return data.files.map((file: any) => ({
        id: file.id,
        url: file.url,
        filename: file.displayName,
        path: file.parentFolderId || '',
        mediaType: file.mediaType,
        uploaded: file.createdDate,
      }));
    } catch (error) {
      console.error('WIX Media list error:', error);
      return [];
    }
  }

  /**
   * List folders in Media Manager
   * @param parentFolderId - Optional parent folder ID
   * @returns Array of folder information
   */
  async listFolders(parentFolderId?: string): Promise<WixFolder[]> {
    try {
      const queryParams = new URLSearchParams();
      if (parentFolderId) {
        queryParams.append('parentFolderId', parentFolderId);
      }

      const response = await fetch(`${this.baseUrl}/folders?${queryParams.toString()}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to list folders: ${response.statusText}`);
      }

      const data = await response.json();
      return data.folders || [];
    } catch (error) {
      console.error('WIX Media list folders error:', error);
      return [];
    }
  }

  /**
   * Recursively list all folders under a given parent
   * @param parentFolderId - starting folder id
   * @returns flat array of all subfolders
   */
  async listAllFolders(parentFolderId: string = 'media-root'): Promise<WixFolder[]> {
    const all: WixFolder[] = [];
    const queue: string[] = [parentFolderId];

    while (queue.length) {
      const current = queue.shift()!;
      const children = await this.listFolders(current);
      for (const child of children) {
        all.push(child);
        queue.push(child.id);
      }
    }

    return all;
  }

  /**
   * Get folder details
   * @param folderId - The folder ID
   * @returns Folder details
   */
  async getFolderDetails(folderId: string): Promise<WixFolder | null> {
    try {
      const response = await fetch(`${this.baseUrl}/folders/${folderId}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.folder;
    } catch (error) {
      console.error('WIX Media get folder details error:', error);
      return null;
    }
  }

  /**
   * Create a folder in WIX Media Manager
   * @param displayName - The folder display name
   * @param parentFolderId - Optional parent folder ID (defaults to media-root)
   * @returns Success boolean
   */
  async createFolder(displayName: string, parentFolderId: string = 'media-root'): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/folders`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          displayName,
          parentFolderId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.folder.id;
      }
      return null;
    } catch (error) {
      console.error('WIX Media create folder error:', error);
      return null;
    }
  }

  /**
   * Generate thumbnail URL for WIX media
   * @param mediaUrl - The original media URL
   * @param width - Thumbnail width
   * @param height - Thumbnail height
   * @returns Thumbnail URL
   */
  getThumbnailUrl(mediaUrl: string, width: number = 300, height: number = 300): string {
    // WIX media URLs can be modified with query parameters for resizing
    const url = new URL(mediaUrl);
    url.searchParams.set('w', width.toString());
    url.searchParams.set('h', height.toString());
    url.searchParams.set('fit', 'crop');
    return url.toString();
  }
}

export const wixMediaService = new WixMediaService();
