import { NextRequest, NextResponse } from 'next/server';
import { StoryModel } from '@/lib/models/story';
import { StoryNodeSchema } from '@/lib/types';

// GET all stories
export async function GET() {
  try {
    const stories = await StoryModel.getAllNodes();
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
