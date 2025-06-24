import { NextRequest, NextResponse } from 'next/server';
import { wixService } from '@/lib/wix';

export async function GET() {
  try {
    const result = await wixService.getNewsItems();
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('News fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const newsData = await request.json();
    
    const result = await wixService.createNewsItem(newsData);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('News creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create news item' },
      { status: 500 }
    );
  }
}
