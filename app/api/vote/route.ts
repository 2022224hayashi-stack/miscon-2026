import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 環境変数がない場合のフォールバックを設定して string 型を確定させる
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const { candidateId } = await req.json();

    if (!candidateId) {
      return NextResponse.json({ error: '候補者IDが指定されていません。' }, { status: 400 });
    }

    // Supabaseへの書き込み処理
    const { error } = await supabase
      .from('vort') // ※テーブル名が 'vote' や 'votes' のタイポでないか確認してください
      .insert([{ id_num: candidateId }]);

    if (error) {
      console.error('[API LOG] Insert Error:', error);
      return NextResponse.json({ error: `【DBエラー】${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    console.error('[API LOG] Unexpected Error:', err);
    // err が Error オブジェクトかどうかを安全に判定
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `【サーバーエラー】${errorMessage}` }, { status: 500 });
  }
}