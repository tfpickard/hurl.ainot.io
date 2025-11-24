import { NextRequest, NextResponse } from 'next/server';
import { ChapterModel } from '@/lib/models/chapter';
import { ChapterSchema } from '@/lib/types';

/**
 * GET /api/stories/[id]/chapters
 * Get all chapters for a story
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chapters = await ChapterModel.getChaptersByStoryId(params.id);

    return NextResponse.json({
      success: true,
      data: chapters,
    });
  } catch (error: any) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch chapters',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stories/[id]/chapters
 * Create a new chapter for a story
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validate the chapter data
    const chapterData = {
      storyId: params.id,
      order: body.order,
      title: body.title,
      content: body.content,
    };

    const chapter = await ChapterModel.createChapter(chapterData);

    return NextResponse.json({
      success: true,
      data: chapter,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating chapter:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create chapter',
      },
      { status: 500 }
    );
  }
}
