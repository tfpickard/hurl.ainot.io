import { getSession } from '../neo4j';

export interface ConfigValue {
  key: string;
  value: string;
  encrypted?: boolean;
  updatedAt: string;
}

export class ConfigModel {
  /**
   * Get a configuration value by key
   */
  static async get(key: string): Promise<string | null> {
    const session = await getSession();
    try {
      const result = await session.run(
        'MATCH (c:Config {key: $key}) RETURN c',
        { key }
      );

      if (result.records.length === 0) {
        return null;
      }

      return result.records[0].get('c').properties.value;
    } finally {
      await session.close();
    }
  }

  /**
   * Set a configuration value
   */
  static async set(key: string, value: string, encrypted: boolean = false): Promise<void> {
    const session = await getSession();
    try {
      await session.run(
        `
        MERGE (c:Config {key: $key})
        SET c.value = $value,
            c.encrypted = $encrypted,
            c.updatedAt = datetime()
        `,
        { key, value, encrypted }
      );
    } finally {
      await session.close();
    }
  }

  /**
   * Get all configuration values
   */
  static async getAll(): Promise<ConfigValue[]> {
    const session = await getSession();
    try {
      const result = await session.run('MATCH (c:Config) RETURN c ORDER BY c.key');

      return result.records.map(record => {
        const config = record.get('c').properties;
        return {
          key: config.key,
          value: config.encrypted ? '***ENCRYPTED***' : config.value,
          encrypted: config.encrypted || false,
          updatedAt: config.updatedAt?.toString() || new Date().toISOString(),
        };
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Delete a configuration value
   */
  static async delete(key: string): Promise<boolean> {
    const session = await getSession();
    try {
      const result = await session.run(
        'MATCH (c:Config {key: $key}) DELETE c RETURN count(c) as deleted',
        { key }
      );

      return result.records[0].get('deleted').toNumber() > 0;
    } finally {
      await session.close();
    }
  }

  /**
   * Initialize default configuration values
   */
  static async initializeDefaults(): Promise<void> {
    const defaults = [
      { key: 'daily_image_limit', value: '100', encrypted: false },
      { key: 'enable_image_generation', value: 'true', encrypted: false },
      { key: 'sdxl_inference_steps', value: '40', encrypted: false },
      { key: 'sdxl_guidance_scale', value: '7.5', encrypted: false },
    ];

    for (const config of defaults) {
      // Only set if doesn't exist
      const existing = await this.get(config.key);
      if (existing === null) {
        await this.set(config.key, config.value, config.encrypted);
      }
    }
  }
}
