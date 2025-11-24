import { getSession } from '../neo4j';
import { Chapter } from '../types';

export class ChapterModel {
  /**
   * Create a new chapter for a story
   */
  static async createChapter(chapter: Omit<Chapter, 'id' | 'createdAt'>): Promise<Chapter> {
    const session = await getSession();
    try {
      const result = await session.run(
        `
        MATCH (s:Story {id: $storyId})
        CREATE (c:Chapter {
          id: randomUUID(),
          storyId: $storyId,
          order: $order,
          title: $title,
          content: $content,
          createdAt: datetime()
        })
        CREATE (s)-[:HAS_CHAPTER]->(c)
        RETURN c
        `,
        {
          storyId: chapter.storyId,
          order: chapter.order,
          title: chapter.title,
          content: chapter.content,
        }
      );

      const chapterNode = result.records[0].get('c').properties;

      return {
        id: chapterNode.id,
        storyId: chapterNode.storyId,
        order: chapterNode.order.toNumber(),
        title: chapterNode.title,
        content: chapterNode.content,
        createdAt: chapterNode.createdAt.toString(),
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Get all chapters for a story
   */
  static async getChaptersByStoryId(storyId: string): Promise<Chapter[]> {
    const session = await getSession();
    try {
      const result = await session.run(
        `
        MATCH (s:Story {id: $storyId})-[:HAS_CHAPTER]->(c:Chapter)
        RETURN c
        ORDER BY c.order ASC
        `,
        { storyId }
      );

      return result.records.map(record => {
        const node = record.get('c').properties;
        return {
          id: node.id,
          storyId: node.storyId,
          order: node.order.toNumber(),
          title: node.title,
          content: node.content,
          createdAt: node.createdAt.toString(),
        };
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Get a specific chapter by ID
   */
  static async getChapterById(id: string): Promise<Chapter | null> {
    const session = await getSession();
    try {
      const result = await session.run(
        'MATCH (c:Chapter {id: $id}) RETURN c',
        { id }
      );

      if (result.records.length === 0) {
        return null;
      }

      const node = result.records[0].get('c').properties;
      return {
        id: node.id,
        storyId: node.storyId,
        order: node.order.toNumber(),
        title: node.title,
        content: node.content,
        createdAt: node.createdAt.toString(),
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Update a chapter
   */
  static async updateChapter(id: string, updates: Partial<Omit<Chapter, 'id' | 'storyId' | 'createdAt'>>): Promise<Chapter | null> {
    const session = await getSession();
    try {
      const setClauses = [];
      const params: any = { id };

      if (updates.order !== undefined) {
        setClauses.push('c.order = $order');
        params.order = updates.order;
      }
      if (updates.title !== undefined) {
        setClauses.push('c.title = $title');
        params.title = updates.title;
      }
      if (updates.content !== undefined) {
        setClauses.push('c.content = $content');
        params.content = updates.content;
      }

      if (setClauses.length === 0) {
        return await this.getChapterById(id);
      }

      const result = await session.run(
        `
        MATCH (c:Chapter {id: $id})
        SET ${setClauses.join(', ')}
        RETURN c
        `,
        params
      );

      if (result.records.length === 0) {
        return null;
      }

      const node = result.records[0].get('c').properties;
      return {
        id: node.id,
        storyId: node.storyId,
        order: node.order.toNumber(),
        title: node.title,
        content: node.content,
        createdAt: node.createdAt.toString(),
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Delete a chapter
   */
  static async deleteChapter(id: string): Promise<boolean> {
    const session = await getSession();
    try {
      const result = await session.run(
        'MATCH (c:Chapter {id: $id}) DELETE c RETURN count(c) as deleted',
        { id }
      );

      return result.records[0].get('deleted').toNumber() > 0;
    } finally {
      await session.close();
    }
  }

  /**
   * Get chapter count for a story
   */
  static async getChapterCount(storyId: string): Promise<number> {
    const session = await getSession();
    try {
      const result = await session.run(
        `
        MATCH (s:Story {id: $storyId})-[:HAS_CHAPTER]->(c:Chapter)
        RETURN count(c) as count
        `,
        { storyId }
      );

      return result.records[0].get('count').toNumber();
    } finally {
      await session.close();
    }
  }
}
