import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/neo4j';

export async function GET() {
  try {
    const isConnected = await testConnection();

    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
