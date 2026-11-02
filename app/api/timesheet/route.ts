import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { DEFAULT_CONFIG } from '@/types/timesheet';

// GET /api/timesheet?period=2026-09
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || new Date().toISOString().slice(0, 7);

  if (!clientPromise) {
    return NextResponse.json({
      connected: false,
      message: 'MongoDB Atlas URI not configured yet. Using client-side storage mode.',
      config: DEFAULT_CONFIG,
      records: {},
    });
  }

  try {
    const client = await clientPromise;
    const db = client.db('timesheet_db');

    const configDoc = await db.collection('configs').findOne({ _id: 'default' as any });
    const recordsDocs = await db.collection('records').find({
      date: { $regex: `^${period}` }
    }).toArray();

    const recordsMap: Record<string, any> = {};
    recordsDocs.forEach((doc) => {
      recordsMap[doc.date] = doc;
    });

    return NextResponse.json({
      connected: true,
      config: configDoc?.config || DEFAULT_CONFIG,
      records: recordsMap,
    });
  } catch (err: any) {
    console.error('Mongo read error:', err);
    return NextResponse.json(
      { error: err.message, connected: false, config: DEFAULT_CONFIG, records: {} },
      { status: 500 }
    );
  }
}

// POST /api/timesheet (save daily record or config)
export async function POST(request: Request) {
  if (!clientPromise) {
    return NextResponse.json({
      connected: false,
      message: 'MongoDB Atlas URI not configured yet in .env.local. Records will persist locally in browser.',
    });
  }

  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('timesheet_db');

    if (body.type === 'config') {
      await db.collection('configs').updateOne(
        { _id: 'default' as any },
        { $set: { config: body.config, updatedAt: new Date() } },
        { upsert: true }
      );
      return NextResponse.json({ success: true, message: 'Config saved to MongoDB Atlas' });
    }

    if (body.type === 'record') {
      const { _id, ...recordData } = body.record;
      await db.collection('records').updateOne(
        { date: recordData.date },
        { $set: { ...recordData, updatedAt: new Date() } },
        { upsert: true }
      );
      return NextResponse.json({ success: true, message: 'Record saved to MongoDB Atlas' });
    }

    if (body.type === 'batch_records') {
      const records = body.records || [];
      const bulkOps = records
        .filter((r: any) => r && r.date)
        .map((r: any) => {
          const { _id, ...recordData } = r;
          return {
            updateOne: {
              filter: { date: recordData.date },
              update: { $set: { ...recordData, updatedAt: new Date() } },
              upsert: true,
            },
          };
        });
      if (bulkOps.length > 0) {
        await db.collection('records').bulkWrite(bulkOps);
      }
      return NextResponse.json({ success: true, message: 'Batch saved to MongoDB Atlas' });
    }

    return NextResponse.json({ error: 'Unknown payload type' }, { status: 400 });
  } catch (err: any) {
    console.error('Mongo write error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
