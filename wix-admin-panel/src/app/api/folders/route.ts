import { NextRequest, NextResponse } from 'next/server';
import { wixMediaService } from '@/lib/wix-media';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    // If all=true, return all folders recursively from root
    if (url.searchParams.get('all') === 'true') {
      const allFolders = await wixMediaService.listAllFolders();
      return NextResponse.json({ success: true, data: allFolders });
    }
    // Otherwise, list direct child folders of specified parent or root
    const parentFolderId = url.searchParams.get('parentFolderId') || 'media-root';
    const folders = await wixMediaService.listFolders(parentFolderId);
    return NextResponse.json({ success: true, data: folders });
  } catch (error) {
    console.error('List folders error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to list folders' },
      { status: 500 }
    );
  }
}
