import { NextRequest, NextResponse } from 'next/server';
import { wixService } from '@/lib/wix';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const result = await wixService.getNewsItems();
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
    const item = result.data.find((n: any) => n.id === id);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('News fetch single error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch news item' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const newsData = await request.json();
    const { id } = params;
    const result = await wixService.updateNewsItem(id, newsData);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('News update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update news item' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const result = await wixService.deleteNewsItem(id);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('News deletion error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete news item' }, { status: 500 });
  }
}
