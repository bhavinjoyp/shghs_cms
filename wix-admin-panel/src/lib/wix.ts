import { GalleryItem, NewsItem, WixApiResponse, MediaItem } from '@/types';

const WIX_API_KEY = process.env.WIX_API_KEY!;
const WIX_SITE_ID = process.env.WIX_SITE_ID!;
const WIX_ACCOUNT_ID = process.env.WIX_ACCOUNT_ID!;

export class WixService {
  private baseUrl = 'https://www.wixapis.com/wix-data/v2';
  private headers = {
    'Authorization': WIX_API_KEY,
    'wix-site-id': WIX_SITE_ID,
    'wix-account-id': WIX_ACCOUNT_ID,
    'Content-Type': 'application/json',
  };

  // Gallery methods
  async createGalleryItem(galleryData: Partial<GalleryItem>): Promise<WixApiResponse<GalleryItem>> {
    try {
      const response = await fetch(`${this.baseUrl}/items`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          dataCollectionId: 'Gallery',
          dataItem: {
            data: galleryData
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create gallery item: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      // Map WIX _id to our id field for frontend compatibility
      const mappedData = {
        ...result.dataItem.data,
        id: result.dataItem.data._id
      };
      return { success: true, data: mappedData };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create gallery item'
      };
    }
  }

  async updateGalleryItem(id: string, galleryData: Partial<GalleryItem>): Promise<WixApiResponse<GalleryItem>> {
    try {
      // Remove the id field from galleryData to avoid conflicts with WIX _id
      const { id: _, ...dataToUpdate } = galleryData;
      
      // Build field modifications for the PATCH request
      const fieldModifications = Object.entries(dataToUpdate).map(([key, value]) => ({
        fieldPath: key,
        action: 'SET_FIELD',
        setFieldOptions: { value }
      }));

      const response = await fetch(`${this.baseUrl}/items/${id}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({
          dataCollectionId: 'Gallery',
          patch: {
            dataItemId: id,
            fieldModifications: fieldModifications
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update gallery item: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      // Map WIX _id to our id field for frontend compatibility
      const mappedData = {
        ...result.dataItem.data,
        id: result.dataItem.data._id
      };
      return { success: true, data: mappedData };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update gallery item'
      };
    }
  }

  async getGalleryItems(): Promise<WixApiResponse<GalleryItem[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/items/query`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          dataCollectionId: 'Gallery',
          query: {
            sort: [{ fieldName: '_createdDate', order: 'DESC' }],
            paging: { limit: 1000 } // Fetch up to 1000 items
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch gallery items: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      // Map WIX _id to our id field for frontend compatibility
      const mappedData = result.dataItems.map((item: any) => ({
        ...item.data,
        id: item.data._id
      }));
      return { success: true, data: mappedData };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch gallery items'
      };
    }
  }

  async deleteGalleryItem(id: string): Promise<WixApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/items/${id}?dataCollectionId=Gallery`, {
        method: 'DELETE',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete gallery item: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete gallery item'
      };
    }
  }

  // News methods
  async createNewsItem(newsData: Partial<NewsItem>): Promise<WixApiResponse<NewsItem>> {
    try {
      const response = await fetch(`${this.baseUrl}/items`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          dataCollectionId: 'News',
          dataItem: {
            data: newsData
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create news item: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      // Map WIX _id to our id field for frontend compatibility
      const mappedData = {
        ...result.dataItem.data,
        id: result.dataItem.data._id
      };
      return { success: true, data: mappedData };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create news item'
      };
    }
  }

  async updateNewsItem(id: string, newsData: Partial<NewsItem>): Promise<WixApiResponse<NewsItem>> {
    try {
      // Remove the id field from newsData to avoid conflicts with WIX _id
      const { id: _, ...dataToUpdate } = newsData;
      
      // Build field modifications for the PATCH request
      const fieldModifications = Object.entries(dataToUpdate).map(([key, value]) => ({
        fieldPath: key,
        action: 'SET_FIELD',
        setFieldOptions: { value }
      }));

      const response = await fetch(`${this.baseUrl}/items/${id}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({
          dataCollectionId: 'News',
          patch: {
            dataItemId: id,
            fieldModifications: fieldModifications
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update news item: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      // Map WIX _id to our id field for frontend compatibility
      const mappedData = {
        ...result.dataItem.data,
        id: result.dataItem.data._id
      };
      return { success: true, data: mappedData };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update news item'
      };
    }
  }

  async getNewsItems(): Promise<WixApiResponse<NewsItem[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/items/query`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          dataCollectionId: 'News',
          query: {
            sort: [{ fieldName: '_createdDate', order: 'DESC' }]
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch news items: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      // Map WIX _id to our id field for frontend compatibility
      const mappedData = result.dataItems.map((item: any) => ({
        ...item.data,
        id: item.data._id
      }));
      return { success: true, data: mappedData };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch news items'
      };
    }
  }

  async deleteNewsItem(id: string): Promise<WixApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/items/${id}?dataCollectionId=News`, {
        method: 'DELETE',
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete news item: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete news item'
      };
    }
  }
}

export const wixService = new WixService();
