import { z } from 'zod';

// Story node schema with chapters support
export const StoryNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(), // Opening excerpt/description
  coverImageUrl: z.string().url().optional(),
  status: z.enum(['active', 'completed']).default('active'),
  genres: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
  chapterCount: z.number().default(0).optional(),
  recommended: z.boolean().default(false),
});

export type StoryNode = z.infer<typeof StoryNodeSchema>;

// Chapter node schema
export const ChapterSchema = z.object({
  id: z.string(),
  storyId: z.string(),
  order: z.number(),
  title: z.string(),
  content: z.string(),
  createdAt: z.string().datetime(),
});

export type Chapter = z.infer<typeof ChapterSchema>;

// Story relationship schema
export const StoryRelationshipSchema = z.object({
  fromId: z.string(),
  toId: z.string(),
  type: z.enum(['LEADS_TO', 'REFERENCES', 'BRANCHES_FROM', 'MERGES_WITH', 'INSPIRED_BY']),
  label: z.string().optional(),
  weight: z.number().min(0).max(1).default(1),
});

export type StoryRelationship = z.infer<typeof StoryRelationshipSchema>;

// Graph visualization types
export interface GraphNode {
  id: string;
  label: string;
  title: string;
  content: string;
  coverImageUrl?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
