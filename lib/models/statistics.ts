import { getSession } from '../neo4j';

export interface DailyStats {
  date: string;
  imagesGenerated: number;
  storageUsedMb: number;
  costUsd: number;
  apiCalls: number;
}

export interface ImageGenerationRecord {
  id: string;
  storyId: string;
  prompt: string;
  model: string;
  costUsd: number;
  generatedAt: string;
  blobUrl?: string;
}

export class StatisticsModel {
  /**
   * Record an image generation event
   */
  static async recordImageGeneration(
    storyId: string,
    prompt: string,
    model: string,
    costUsd: number,
    blobUrl?: string
  ): Promise<string> {
    const session = await getSession();
    try {
      const result = await session.run(
        `
        MATCH (s:Story {id: $storyId})
        CREATE (img:ImageGeneration {
          id: randomUUID(),
          prompt: $prompt,
          model: $model,
          costUsd: $costUsd,
          blobUrl: $blobUrl,
          generatedAt: datetime()
        })
        CREATE (s)-[:GENERATED_IMAGE]->(img)

        // Update or create daily stats
        WITH img, date(datetime()) as today
        MERGE (stats:DailyStats {date: toString(today)})
        ON CREATE SET
          stats.imagesGenerated = 0,
          stats.storageUsedMb = 0,
          stats.costUsd = 0,
          stats.apiCalls = 0
        SET
          stats.imagesGenerated = stats.imagesGenerated + 1,
          stats.costUsd = stats.costUsd + $costUsd,
          stats.apiCalls = stats.apiCalls + 1,
          stats.updatedAt = datetime()

        CREATE (img)-[:RECORDED_ON]->(stats)

        RETURN img.id as id
        `,
        { storyId, prompt, model, costUsd, blobUrl: blobUrl || null }
      );

      return result.records[0].get('id');
    } finally {
      await session.close();
    }
  }

  /**
   * Update storage used for a specific date
   */
  static async updateStorageUsed(date: string, storageUsedMb: number): Promise<void> {
    const session = await getSession();
    try {
      await session.run(
        `
        MERGE (stats:DailyStats {date: $date})
        SET stats.storageUsedMb = $storageUsedMb,
            stats.updatedAt = datetime()
        `,
        { date, storageUsedMb }
      );
    } finally {
      await session.close();
    }
  }

  /**
   * Get statistics for a specific date
   */
  static async getDailyStats(date: string): Promise<DailyStats | null> {
    const session = await getSession();
    try {
      const result = await session.run(
        'MATCH (stats:DailyStats {date: $date}) RETURN stats',
        { date }
      );

      if (result.records.length === 0) {
        return null;
      }

      const stats = result.records[0].get('stats').properties;
      return {
        date: stats.date,
        imagesGenerated: stats.imagesGenerated || 0,
        storageUsedMb: stats.storageUsedMb || 0,
        costUsd: stats.costUsd || 0,
        apiCalls: stats.apiCalls || 0,
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Get statistics for a date range
   */
  static async getStatsRange(startDate: string, endDate: string): Promise<DailyStats[]> {
    const session = await getSession();
    try {
      const result = await session.run(
        `
        MATCH (stats:DailyStats)
        WHERE stats.date >= $startDate AND stats.date <= $endDate
        RETURN stats
        ORDER BY stats.date DESC
        `,
        { startDate, endDate }
      );

      return result.records.map(record => {
        const stats = record.get('stats').properties;
        return {
          date: stats.date,
          imagesGenerated: stats.imagesGenerated || 0,
          storageUsedMb: stats.storageUsedMb || 0,
          costUsd: stats.costUsd || 0,
          apiCalls: stats.apiCalls || 0,
        };
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Get total statistics (all time)
   */
  static async getTotalStats(): Promise<{
    totalImages: number;
    totalCost: number;
    totalStorage: number;
    totalApiCalls: number;
  }> {
    const session = await getSession();
    try {
      const result = await session.run(
        `
        MATCH (stats:DailyStats)
        RETURN
          sum(stats.imagesGenerated) as totalImages,
          sum(stats.costUsd) as totalCost,
          sum(stats.storageUsedMb) as totalStorage,
          sum(stats.apiCalls) as totalApiCalls
        `
      );

      if (result.records.length === 0) {
        return { totalImages: 0, totalCost: 0, totalStorage: 0, totalApiCalls: 0 };
      }

      const record = result.records[0];
      return {
        totalImages: record.get('totalImages')?.toNumber() || 0,
        totalCost: record.get('totalCost') || 0,
        totalStorage: record.get('totalStorage') || 0,
        totalApiCalls: record.get('totalApiCalls')?.toNumber() || 0,
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Get all image generation records for a story
   */
  static async getStoryImageHistory(storyId: string): Promise<ImageGenerationRecord[]> {
    const session = await getSession();
    try {
      const result = await session.run(
        `
        MATCH (s:Story {id: $storyId})-[:GENERATED_IMAGE]->(img:ImageGeneration)
        RETURN img
        ORDER BY img.generatedAt DESC
        `,
        { storyId }
      );

      return result.records.map(record => {
        const img = record.get('img').properties;
        return {
          id: img.id,
          storyId,
          prompt: img.prompt,
          model: img.model,
          costUsd: img.costUsd,
          generatedAt: img.generatedAt.toString(),
          blobUrl: img.blobUrl || undefined,
        };
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Get today's statistics
   */
  static async getTodayStats(): Promise<DailyStats> {
    const today = new Date().toISOString().split('T')[0];
    const stats = await this.getDailyStats(today);

    return stats || {
      date: today,
      imagesGenerated: 0,
      storageUsedMb: 0,
      costUsd: 0,
      apiCalls: 0,
    };
  }

  /**
   * Check if daily limit is reached
   */
  static async isDailyLimitReached(limit: number): Promise<boolean> {
    const todayStats = await this.getTodayStats();
    return todayStats.imagesGenerated >= limit;
  }
}
