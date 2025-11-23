import { NextRequest, NextResponse } from 'next/server';
import { StatisticsModel } from '@/lib/models/statistics';
import { getTotalStorageUsedMb } from '@/lib/blob-storage';

// GET statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'total';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (type === 'today') {
      const todayStats = await StatisticsModel.getTodayStats();

      // Update storage used
      const storageUsedMb = await getTotalStorageUsedMb();
      await StatisticsModel.updateStorageUsed(todayStats.date, storageUsedMb);
      todayStats.storageUsedMb = storageUsedMb;

      return NextResponse.json({ success: true, data: todayStats });
    }

    if (type === 'range' && startDate && endDate) {
      const stats = await StatisticsModel.getStatsRange(startDate, endDate);
      return NextResponse.json({ success: true, data: stats });
    }

    if (type === 'total') {
      const totalStats = await StatisticsModel.getTotalStats();
      const storageUsedMb = await getTotalStorageUsedMb();

      return NextResponse.json({
        success: true,
        data: {
          ...totalStats,
          totalStorage: storageUsedMb,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid statistics type' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
