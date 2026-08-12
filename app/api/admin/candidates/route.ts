import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(req: NextRequest) {
  try {
    const { password, name, schoolYear, img } = await req.json();

    // 認証チェック
    if (!ADMIN_PASSWORD || !password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: '認証エラー' }, { status: 403 });
    }

    // 入力値チェック
    if (!name || !name.trim()) {
      return NextResponse.json({ error: '名前を入力してください。' }, { status: 400 });
    }

    // DB に挿入
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          name: name.trim(),
          school_year: schoolYear?.trim() || '',
          img: img?.trim() || '',
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: `【DBエラー】${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, candidate: data[0] }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}