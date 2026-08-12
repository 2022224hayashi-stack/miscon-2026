import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

interface RequestBody {
  password?: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as RequestBody;

  // パスワード検証
  if (!body.password || body.password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'パスワードが正しくありません。' }, { status: 403 });
  }

  try {
    const { data, error } = await supabase.from('vort').select('id_num');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: profiles } = await supabase.from('profiles').select('id, name');

    const counts: Record<number, number> = {};
    data.forEach((vote: { id_num: number }) => {
      counts[vote.id_num] = (counts[vote.id_num] || 0) + 1;
    });

    const summary = profiles?.map((profile) => ({
      id: profile.id,
      name: profile.name,
      votes: counts[profile.id] || 0,
    })) || [];

    return NextResponse.json({ success: true, summary, totalVotes: data.length });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}