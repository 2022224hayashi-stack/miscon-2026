import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 環境変数がない場合のフォールバックを設定して string 型を確定させる
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, name, school_year, img')
      .order('id', { ascending: true });

    if (error) {
      console.error('[API LOG] Supabase Error:', error);
      return NextResponse.json({ error: `【DBエラー】${error.message}` }, { status: 500 });
    }

    return NextResponse.json(profiles, { status: 200 });
  } catch (err: unknown) {
    console.error('[API LOG] Unexpected Error:', err);
    // err が Error オブジェクトかどうかを安全に判定
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `【サーバーエラー】${errorMessage}` }, { status: 500 });
  }
}