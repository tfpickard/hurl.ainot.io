import { NextRequest, NextResponse } from 'next/server';
import { StoryModel } from '@/lib/models/story';
import { StatisticsModel } from '@/lib/models/statistics';
import { ConfigModel } from '@/lib/models/config';
import { generateImage, generateStoryPrompt, enhancePrompt } from '@/lib/replicate';
import { uploadImageFromUrl, generateCoverImagePath } from '@/lib/blob-storage';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if image generation is enabled
    const enabled = await ConfigModel.get('enable_image_generation');
    if (enabled === 'false') {
      return NextResponse.json(
        { success: false, error: 'Image generation is currently disabled' },
        { status: 503 }
      );
    }

    // Check daily limit
    const dailyLimit = parseInt(await ConfigModel.get('daily_image_limit') || '100', 10);
    const limitReached = await StatisticsModel.isDailyLimitReached(dailyLimit);

    if (limitReached) {
      return NextResponse.json(
        {
          success: false,
          error: `Daily image generation limit of ${dailyLimit} reached. Please try again tomorrow.`,
        },
        { status: 429 }
      );
    }

    // Get the story
    const story = await StoryModel.getNodeById(params.id);
    if (!story) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    // Parse request body for optional custom prompt or style
    const body = await request.json().catch(() => ({}));
    const customPrompt = body.prompt;
    const style = body.style || 'digital art';

    // Generate the image prompt
    let prompt: string;
    if (customPrompt) {
      prompt = enhancePrompt(customPrompt);
    } else {
      prompt = generateStoryPrompt(story.title, story.content, style);
    }

    // Get inference steps and guidance scale from config
    const inferenceSteps = parseInt(
      await ConfigModel.get('sdxl_inference_steps') || '40',
      10
    );
    const guidanceScale = parseFloat(
      await ConfigModel.get('sdxl_guidance_scale') || '7.5'
    );

    // Generate the image with Stable Diffusion
    const result = await generateImage({
      prompt,
      width: 1024,
      height: 1024,
      numInferenceSteps: inferenceSteps,
      guidanceScale,
    });

    // Upload to Vercel Blob
    const blobPath = generateCoverImagePath(params.id);
    const blobResult = await uploadImageFromUrl(result.imageUrl, blobPath);

    // Update the story with the cover image URL
    await StoryModel.updateNode(params.id, {
      coverImageUrl: blobResult.url,
    });

    // Record statistics
    await StatisticsModel.recordImageGeneration(
      params.id,
      prompt,
      result.model,
      result.estimatedCostUsd,
      blobResult.url
    );

    return NextResponse.json({
      success: true,
      data: {
        coverImageUrl: blobResult.url,
        prompt,
        model: result.model,
        costUsd: result.estimatedCostUsd,
        size: blobResult.size,
      },
    });
  } catch (error: any) {
    console.error('Image generation failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if image generation is available
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const story = await StoryModel.getNodeById(params.id);
    if (!story) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    const enabled = await ConfigModel.get('enable_image_generation');
    const dailyLimit = parseInt(await ConfigModel.get('daily_image_limit') || '100', 10);
    const todayStats = await StatisticsModel.getTodayStats();
    const history = await StatisticsModel.getStoryImageHistory(params.id);

    return NextResponse.json({
      success: true,
      data: {
        enabled: enabled !== 'false',
        dailyLimit,
        usedToday: todayStats.imagesGenerated,
        remaining: dailyLimit - todayStats.imagesGenerated,
        history,
        currentCoverImage: story.coverImageUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
