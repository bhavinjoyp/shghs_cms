import { NextRequest, NextResponse } from 'next/server';
import { wixMediaService } from '@/lib/wix-media';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string || 'untitled';
    const mediaType = formData.get('mediaType') as 'gallery' | 'news' || 'gallery';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB for thumbnails)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum 5MB allowed for thumbnails.' },
        { status: 400 }
      );
    }

    const result = await wixMediaService.uploadThumbnail(file, title, mediaType);

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        url: result.url,
        filename: result.filename,
        path: result.path,
        thumbnail: wixMediaService.getThumbnailUrl(result.url, 300, 300),
      }
    });

  } catch (error) {
    console.error('Thumbnail upload error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
