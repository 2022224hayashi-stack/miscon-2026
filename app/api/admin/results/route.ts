import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST() {
  // 開発環境（このパソコン）以外からのアクセスを完全に拒否
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'この機能は開発環境（このパソコン）からのみ利用できます。' }, { status: 403 });
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