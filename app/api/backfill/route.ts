import { NextResponse } from 'next/server';
import { backfillSEKRates } from '@/lib/norgesbank';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const count = await backfillSEKRates();

  return NextResponse.json({
    success: count > 0,
    ratesStored: count,
  });
}
