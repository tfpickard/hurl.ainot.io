import { NextRequest, NextResponse } from 'next/server';
import { StoryModel } from '@/lib/models/story';
import { StoryNodeSchema } from '@/lib/types';

// GET all stories with optional filtering and sorting
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const options: any = {};

    // Status filter
    const status = searchParams.get('status');
    if (status === 'active' || status === 'completed') {
      options.status = status;
    }

    // Recommended filter
    const recommended = searchParams.get('recommended');
    if (recommended === 'true') {
      options.recommended = true;
    }

    // Search
    const search = searchParams.get('search');
    if (search) {
      options.search = search;
    }

    // Sorting
    const sortBy = searchParams.get('sortBy');
    if (sortBy === 'latest' || sortBy === 'oldest' || sortBy === 'chapters') {
      options.sortBy = sortBy;
    }

    // Pagination
    const limit = searchParams.get('limit');
    if (limit) {
      options.limit = parseInt(limit, 10);
    }

    const skip = searchParams.get('skip');
    if (skip) {
      options.skip = parseInt(skip, 10);
    }

    const stories = await StoryModel.getAllNodes(options);
    return NextResponse.json({ success: true, data: stories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create a new story
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = StoryNodeSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).parse(body);

    const newStory = await StoryModel.createNode(validatedData);
    return NextResponse.json({ success: true, data: newStory }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
