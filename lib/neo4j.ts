import neo4j, { Driver, Session } from 'neo4j-driver';

let driver: Driver | null = null;

export function getDriver(): Driver {
  if (!driver) {
    const uri = process.env.NEO4J_URI;
    const username = process.env.NEO4J_USERNAME;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !username || !password) {
      throw new Error('Neo4j credentials not configured. Please set NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD environment variables.');
    }

    driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  }

  return driver;
}

export async function getSession(): Promise<Session> {
  const driver = getDriver();
  return driver.session();
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

// Health check function
export async function testConnection(): Promise<boolean> {
  try {
    const driver = getDriver();
    await driver.verifyConnectivity();
    return true;
  } catch (error) {
    console.error('Neo4j connection failed:', error);
    return false;
  }
}
