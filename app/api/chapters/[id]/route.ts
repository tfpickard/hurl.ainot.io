import { NextRequest, NextResponse } from 'next/server';
import { ChapterModel } from '@/lib/models/chapter';

/**
 * GET /api/chapters/[id]
 * Get a specific chapter
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chapter = await ChapterModel.getChapterById(params.id);

    if (!chapter) {
      return NextResponse.json(
        {
          success: false,
          error: 'Chapter not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: chapter,
    });
  } catch (error: any) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch chapter',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/chapters/[id]
 * Update a chapter
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const updates: any = {};
    if (body.order !== undefined) updates.order = body.order;
    if (body.title !== undefined) updates.title = body.title;
    if (body.content !== undefined) updates.content = body.content;

    const chapter = await ChapterModel.updateChapter(params.id, updates);

    if (!chapter) {
      return NextResponse.json(
        {
          success: false,
          error: 'Chapter not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: chapter,
    });
  } catch (error: any) {
    console.error('Error updating chapter:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update chapter',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chapters/[id]
 * Delete a chapter
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await ChapterModel.deleteChapter(params.id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Chapter not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error: any) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete chapter',
      },
      { status: 500 }
    );
  }
}
