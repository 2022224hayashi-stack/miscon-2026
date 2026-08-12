import { createClient } from '@supabase/supabase-js';

// Vercelの環境変数からURLとKeyを取得（ブラウザからは見えない）
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // POST リクエスト以外は拒否
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { candidateId } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: '候補者IDが指定されていません' });
    }

    // Supabase の vort テーブルへデータ挿入
    const { error } = await supabase
      .from('vort')
      .insert([{ id_num: candidateId }]);

    if (error) {
      throw error;
    }

    return res.status(200).json({ success: true, message: '投票が完了しました' });
  } catch (error) {
    console.error('サーバーエラー:', error);
    return res.status(500).json({ error: '投票処理に失敗しました' });
  }
}