import { getSession } from '../neo4j';
import { StoryNode, StoryRelationship, GraphData } from '../types';

export class StoryModel {
  /**
   * Create a new story node
   */
  static async createNode(node: Omit<StoryNode, 'id' | 'createdAt' | 'updatedAt'>): Promise<StoryNode> {
    const session = await getSession();
    try {
      const result = await session.run(
        `
        CREATE (s:Story {
          id: randomUUID(),
          title: $title,
          content: $content,
          createdAt: datetime(),
          updatedAt: datetime(),
          metadata: $metadata
        })
        RETURN s
        `,
        {
          title: node.title,
          content: node.content,
          metadata: node.metadata || {},
        }
      );

      const record = result.records[0];
      const storyNode = record.get('s').properties;

      return {
        id: storyNode.id,
        title: storyNode.title,
        content: storyNode.content,
        createdAt: storyNode.createdAt.toString(),
        updatedAt: storyNode.updatedAt.toString(),
        metadata: storyNode.metadata,
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Get a story node by ID
   */
  static async getNodeById(id: string): Promise<StoryNode | null> {
    const session = await getSession();
    try {
      const result = await session.run(
        'MATCH (s:Story {id: $id}) RETURN s',
        { id }
      );

      if (result.records.length === 0) {
        return null;
      }

      const storyNode = result.records[0].get('s').properties;
      return {
        id: storyNode.id,
        title: storyNode.title,
        content: storyNode.content,
        createdAt: storyNode.createdAt.toString(),
        updatedAt: storyNode.updatedAt.toString(),
        metadata: storyNode.metadata,
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Update a story node
   */
  static async updateNode(id: string, updates: Partial<Omit<StoryNode, 'id' | 'createdAt'>>): Promise<StoryNode | null> {
    const session = await getSession();
    try {
      const setClauses = [];
      const params: any = { id };

      if (updates.title !== undefined) {
        setClauses.push('s.title = $title');
        params.title = updates.title;
      }
      if (updates.content !== undefined) {
        setClauses.push('s.content = $content');
        params.content = updates.content;
      }
      if (updates.metadata !== undefined) {
        setClauses.push('s.metadata = $metadata');
        params.metadata = updates.metadata;
      }

      if (setClauses.length === 0) {
        return await this.getNodeById(id);
      }

      setClauses.push('s.updatedAt = datetime()');

      const result = await session.run(
        `
        MATCH (s:Story {id: $id})
        SET ${setClauses.join(', ')}
        RETURN s
        `,
        params
      );

      if (result.records.length === 0) {
        return null;
      }

      const storyNode = result.records[0].get('s').properties;
      return {
        id: storyNode.id,
        title: storyNode.title,
        content: storyNode.content,
        createdAt: storyNode.createdAt.toString(),
        updatedAt: storyNode.updatedAt.toString(),
        metadata: storyNode.metadata,
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Delete a story node and all its relationships
   */
  static async deleteNode(id: string): Promise<boolean> {
    const session = await getSession();
    try {
      const result = await session.run(
        'MATCH (s:Story {id: $id}) DETACH DELETE s RETURN count(s) as deleted',
        { id }
      );

      return result.records[0].get('deleted').toNumber() > 0;
    } finally {
      await session.close();
    }
  }

  /**
   * Create a relationship between two story nodes
   */
  static async createRelationship(relationship: StoryRelationship): Promise<boolean> {
    const session = await getSession();
    try {
      await session.run(
        `
        MATCH (from:Story {id: $fromId})
        MATCH (to:Story {id: $toId})
        CREATE (from)-[r:${relationship.type} {
          label: $label,
          weight: $weight,
          createdAt: datetime()
        }]->(to)
        `,
        {
          fromId: relationship.fromId,
          toId: relationship.toId,
          label: relationship.label || relationship.type,
          weight: relationship.weight,
        }
      );
      return true;
    } finally {
      await session.close();
    }
  }

  /**
   * Get all nodes connected to a specific node
   */
  static async getConnectedNodes(id: string, depth: number = 1): Promise<GraphData> {
    const session = await getSession();
    try {
      const result = await session.run(
        `
        MATCH path = (start:Story {id: $id})-[r*1..${depth}]-(connected:Story)
        RETURN start, connected, relationships(path) as rels
        `,
        { id }
      );

      const nodes = new Map<string, any>();
      const links: any[] = [];

      // Add the starting node
      const startNode = await this.getNodeById(id);
      if (startNode) {
        nodes.set(startNode.id, {
          id: startNode.id,
          label: startNode.title,
          title: startNode.title,
          content: startNode.content,
        });
      }

      for (const record of result.records) {
        const connectedNode = record.get('connected').properties;
        nodes.set(connectedNode.id, {
          id: connectedNode.id,
          label: connectedNode.title,
          title: connectedNode.title,
          content: connectedNode.content,
        });

        const relationships = record.get('rels');
        for (const rel of relationships) {
          links.push({
            source: rel.start.toString(),
            target: rel.end.toString(),
            type: rel.type,
            label: rel.properties.label,
          });
        }
      }

      return {
        nodes: Array.from(nodes.values()),
        links,
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Get all story nodes
   */
  static async getAllNodes(): Promise<StoryNode[]> {
    const session = await getSession();
    try {
      const result = await session.run('MATCH (s:Story) RETURN s ORDER BY s.createdAt DESC');

      return result.records.map(record => {
        const node = record.get('s').properties;
        return {
          id: node.id,
          title: node.title,
          content: node.content,
          createdAt: node.createdAt.toString(),
          updatedAt: node.updatedAt.toString(),
          metadata: node.metadata,
        };
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Get the entire story graph
   */
  static async getFullGraph(): Promise<GraphData> {
    const session = await getSession();
    try {
      const result = await session.run(
        `
        MATCH (s:Story)
        OPTIONAL MATCH (s)-[r]->(t:Story)
        RETURN s, r, t
        `
      );

      const nodes = new Map<string, any>();
      const links: any[] = [];

      for (const record of result.records) {
        const sourceNode = record.get('s').properties;
        nodes.set(sourceNode.id, {
          id: sourceNode.id,
          label: sourceNode.title,
          title: sourceNode.title,
          content: sourceNode.content,
        });

        const relationship = record.get('r');
        const targetNode = record.get('t');

        if (relationship && targetNode) {
          const targetProps = targetNode.properties;
          nodes.set(targetProps.id, {
            id: targetProps.id,
            label: targetProps.title,
            title: targetProps.title,
            content: targetProps.content,
          });

          links.push({
            source: sourceNode.id,
            target: targetProps.id,
            type: relationship.type,
            label: relationship.properties.label,
          });
        }
      }

      return {
        nodes: Array.from(nodes.values()),
        links,
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Find story paths between two nodes
   */
  static async findPaths(fromId: string, toId: string, maxDepth: number = 5): Promise<any[]> {
    const session = await getSession();
    try {
      const result = await session.run(
        `
        MATCH path = shortestPath((from:Story {id: $fromId})-[*..${maxDepth}]-(to:Story {id: $toId}))
        RETURN path
        `,
        { fromId, toId }
      );

      return result.records.map(record => {
        const path = record.get('path');
        return {
          nodes: path.segments.map((seg: any) => seg.start.properties),
          relationships: path.segments.map((seg: any) => ({
            type: seg.relationship.type,
            properties: seg.relationship.properties,
          })),
        };
      });
    } finally {
      await session.close();
    }
  }
}
