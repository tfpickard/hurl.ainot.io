import { NextRequest, NextResponse } from 'next/server';
import { StoryModel } from '@/lib/models/story';

/**
 * GET /api/stats
 * Get aggregate statistics about stories and chapters
 */
export async function GET(request: NextRequest) {
  try {
    const stats = await StoryModel.getStatistics();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch statistics',
      },
      { status: 500 }
    );
  }
}
