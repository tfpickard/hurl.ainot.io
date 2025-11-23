import Replicate from 'replicate';

let replicateClient: Replicate | null = null;

export function getReplicate(): Replicate {
  if (!replicateClient) {
    const apiToken = process.env.REPLICATE_API_TOKEN;

    if (!apiToken) {
      throw new Error('REPLICATE_API_TOKEN environment variable is not set');
    }

    replicateClient = new Replicate({
      auth: apiToken,
    });
  }

  return replicateClient;
}

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numInferenceSteps?: number;
  guidanceScale?: number;
  seed?: number;
}

export interface ImageGenerationResult {
  imageUrl: string;
  prompt: string;
  model: string;
  estimatedCostUsd: number;
}

/**
 * Generate an image using Stable Diffusion XL
 */
export async function generateImage(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  const replicate = getReplicate();

  const {
    prompt,
    negativePrompt = 'blurry, bad quality, distorted, disfigured, low quality, low resolution',
    width = 1024,
    height = 1024,
    numInferenceSteps = 40,
    guidanceScale = 7.5,
    seed,
  } = options;

  try {
    const output = await replicate.run(
      'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          width,
          height,
          num_inference_steps: numInferenceSteps,
          guidance_scale: guidanceScale,
          scheduler: 'K_EULER',
          ...(seed !== undefined && { seed }),
        },
      }
    );

    // SDXL returns an array of URLs
    const imageUrl = Array.isArray(output) ? output[0] : output;

    if (typeof imageUrl !== 'string') {
      throw new Error('Unexpected output format from Replicate');
    }

    // Estimate cost: SDXL is approximately $0.0025 per image
    // This is based on Replicate's pricing as of 2024
    const estimatedCostUsd = 0.0025;

    return {
      imageUrl,
      prompt,
      model: 'stability-ai/sdxl',
      estimatedCostUsd,
    };
  } catch (error: any) {
    console.error('Replicate image generation failed:', error);
    throw new Error(`Failed to generate image: ${error.message}`);
  }
}

/**
 * Generate a story-themed prompt for cover art
 */
export function generateStoryPrompt(
  title: string,
  content: string,
  style: string = 'digital art'
): string {
  // Extract key themes from the story content (first 200 chars)
  const excerpt = content.substring(0, 200);

  // Build an enhanced prompt
  const basePrompt = `Book cover art for "${title}". ${excerpt}. Professional ${style}, highly detailed, vibrant colors, dramatic lighting, trending on artstation`;

  return basePrompt;
}

/**
 * Enhance a user prompt with quality modifiers
 */
export function enhancePrompt(userPrompt: string): string {
  const qualityModifiers = [
    'highly detailed',
    'professional quality',
    'vibrant colors',
    'dramatic lighting',
    '4k',
    'trending on artstation',
  ];

  // Check if prompt already has quality modifiers
  const hasModifiers = qualityModifiers.some(modifier =>
    userPrompt.toLowerCase().includes(modifier.toLowerCase())
  );

  if (hasModifiers) {
    return userPrompt;
  }

  return `${userPrompt}, highly detailed, professional quality, vibrant colors, 4k`;
}
