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

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum 100MB allowed.' },
        { status: 400 }
      );
    }

    // Override folder ID for gallery vs news
    const parentFolderIdOverride = mediaType === 'news'
      ? '9d0082a7e2dc4620a9af0986eacbea56'
      : 'fdf9fa883af549218a9397534714ad66';
    // Upload main image and thumbnail into the specified folder
    const imageResult = await wixMediaService.uploadImage(file, title, mediaType, parentFolderIdOverride);

    // Return as MediaItem
    const mediaItem = {
      src: imageResult.src,
      title: imageResult.title,
      alt: imageResult.alt,
      type: 'image'
    };
    return NextResponse.json({ success: true, data: mediaItem });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
