import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '../../lib/supabase';

export const dynamic = 'force-dynamic';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(req: NextRequest) {
  try {
    const { password, isOpen } = await req.json();

    // 認証チェック
    if (!ADMIN_PASSWORD || !password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: '認証エラー' }, { status: 403 });
    }

    // 設定を更新
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'is_voting_open', value: isOpen });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, isOpen });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}