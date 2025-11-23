import { NextRequest, NextResponse } from 'next/server';
import { StoryModel } from '@/lib/models/story';

// GET connected stories
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const depth = parseInt(searchParams.get('depth') || '1', 10);

    const graphData = await StoryModel.getConnectedNodes(params.id, depth);
    return NextResponse.json({ success: true, data: graphData });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
