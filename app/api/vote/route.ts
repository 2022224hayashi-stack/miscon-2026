import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '../../lib/supabase';

export const dynamic = 'force-dynamic';

interface VoteRequestBody {
  candidateId?: number;
}

export async function POST(req: NextRequest) {
  try {
    // ★ 1. ボタンが押された「この瞬間」の DB 設定を取得（キャッシュなし）
    const { data: settingData, error: settingError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'is_voting_open')
      .single();

    if (settingError) {
      return NextResponse.json({ error: 'DB設定の取得に失敗しました。' }, { status: 500 });
    }

    const isVotingOpen = settingData?.value ?? true;

    // もし DB 上で投票が停止されていた場合
    if (!isVotingOpen) {
      return NextResponse.json(
        { 
          error: '現在、投票は受付停止中または終了しています。',
          isVotingOpen: false // フロントエンドでステータス更新に利用
        },
        { status: 400 }
      );
    }

    // ★ 2. Cookie / LocalStorage 重複チェック（念のためサーバー側でも）
    const hasVotedCookie = req.cookies.get('has_voted_2026');
    if (hasVotedCookie) {
      return NextResponse.json(
        { error: 'すでにご投票済みです。投票はお一人様1回までとなります。' },
        { status: 400 }
      );
    }

    const body = (await req.json()) as VoteRequestBody;
    const { candidateId } = body;

    if (typeof candidateId !== 'number' || Number.isNaN(candidateId)) {
      return NextResponse.json({ error: '有効な候補者IDが指定されていません。' }, { status: 400 });
    }

    // ★ 3. 投票を DB に保存
    const { error: insertError } = await supabase
      .from('vote')
      .insert([{ id_num: candidateId }]);

    if (insertError) {
      return NextResponse.json({ error: `【DBエラー】${insertError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `【サーバーエラー】${errorMessage}` }, { status: 500 });
  }
}