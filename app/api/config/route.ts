import { NextRequest, NextResponse } from 'next/server';
import { ConfigModel } from '@/lib/models/config';

// GET all configuration values
export async function GET() {
  try {
    const config = await ConfigModel.getAll();
    return NextResponse.json({ success: true, data: config });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST to set a configuration value
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, encrypted = false } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Key and value are required' },
        { status: 400 }
      );
    }

    await ConfigModel.set(key, value, encrypted);
    return NextResponse.json({ success: true, data: { key, value: encrypted ? '***ENCRYPTED***' : value } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Initialize defaults
export async function PUT() {
  try {
    await ConfigModel.initializeDefaults();
    return NextResponse.json({ success: true, data: { initialized: true } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
