import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { ResultItem } from '../../../type';

export const dynamic = 'force-dynamic';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

interface RequestBody {
  password?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;

    // パスワード未設定時のバイパス防止および厳密な照合
    if (!ADMIN_PASSWORD || !body.password || body.password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'アクセスが拒否されました。パスワードが不整合です。' },
        { status: 403 }
      );
    }

    // 投票データの取得 (※DB側のテーブル名が 'vote' の場合は修正してください)
    const { data: votesData, error: votesError } = await supabase
      .from('vote')
      .select('id_num');

    if (votesError) {
      return NextResponse.json({ error: `【DBエラー】${votesError.message}` }, { status: 500 });
    }

    // 候補者プロフィールの取得
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name');

    if (profilesError) {
      return NextResponse.json({ error: `【DBエラー】${profilesError.message}` }, { status: 500 });
    }

    // 集計処理
    const counts: Record<number, number> = {};
    votesData?.forEach((vote: { id_num: number }) => {
      counts[vote.id_num] = (counts[vote.id_num] || 0) + 1;
    });

    const summary: ResultItem[] =
      profiles?.map((profile) => ({
        id: profile.id,
        name: profile.name,
        votes: counts[profile.id] || 0,
      })) || [];

    return NextResponse.json({
      success: true,
      summary,
      totalVotes: votesData?.length || 0,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}