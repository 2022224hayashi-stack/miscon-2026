'use client';

import { useState, useEffect } from 'react';

interface ResultItem {
  id: number;
  name: string;
  votes: number;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [summary, setSummary] = useState<ResultItem[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'アクセスが拒否されました。');

      setSummary(data.summary);
      setTotalVotes(data.totalVotes);
      setIsAuthenticated(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center px-5">
        <div className="max-w-sm w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-xl font-black text-black mb-2 text-center">管理者ページへのアクセス</h1>
          <p className="text-xs text-gray-500 mb-6 text-center">パスワードを入力してください</p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワード"
                disabled={loading}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50"
              />
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full text-xs font-bold bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <a href="/" className="text-xs font-bold text-gray-600 hover:text-black">
              ← 投票ページに戻る
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black pb-12">
      <div className="max-w-md mx-auto px-5 pt-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black">投票集計ダッシュボード</h1>
            <p className="text-xs text-gray-500 mt-0.5">管理者専用</p>
          </div>
          <a
            href="/"
            className="text-xs font-bold border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-100"
          >
            サイトに戻る
          </a>
        </div>

        <div className="bg-black text-white p-5 rounded-2xl mb-6 shadow-md">
          <div className="text-xs text-gray-400 font-medium">総投票数</div>
          <div className="text-3xl font-black mt-1">{totalVotes} <span className="text-sm font-normal">票</span></div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-700 tracking-wider">候補者別内訳</h2>
          {summary.map((item, index) => (
            <div key={item.id} className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-gray-400 w-5">#{index + 1}</span>
                <div>
                  <div className="text-xs text-gray-400">ID: {String(item.id).padStart(2, '0')}</div>
                  <div className="text-sm font-bold text-black">{item.name}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-black">{item.votes}</span>
                <span className="text-xs text-gray-500 ml-1">票</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
