import { NextResponse } from 'next/server';
import { fetchAndStoreLatestSEKRate } from '@/lib/norgesbank';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await fetchAndStoreLatestSEKRate();

  if (result) {
    return NextResponse.json({
      success: true,
      rate: result.rate,
      date: result.date,
    });
  }

  return NextResponse.json(
    { success: false, error: 'Failed to fetch rate' },
    { status: 500 }
  );
}
