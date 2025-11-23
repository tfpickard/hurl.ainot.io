import { NextRequest, NextResponse } from 'next/server';
import { StoryModel } from '@/lib/models/story';
import { StoryRelationshipSchema } from '@/lib/types';

// POST create a new relationship between stories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = StoryRelationshipSchema.parse(body);

    await StoryModel.createRelationship(validatedData);
    return NextResponse.json({
      success: true,
      data: { created: true }
    }, { status: 201 });
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
