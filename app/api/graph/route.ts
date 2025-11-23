import { NextResponse } from 'next/server';
import { StoryModel } from '@/lib/models/story';

// GET the full story graph
export async function GET() {
  try {
    const graphData = await StoryModel.getFullGraph();
    return NextResponse.json({ success: true, data: graphData });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
