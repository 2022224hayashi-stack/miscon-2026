'use client';

import { useState, useEffect } from 'react';

interface ResultItem {
  id: number;
  name: string;
  votes: number;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [summary, setSummary] = useState<ResultItem[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'アクセスが拒否されました。');
        setSummary(data.summary);
        setTotalVotes(data.totalVotes);
        setIsAuthenticated(true);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center">
        <p className="text-xs font-bold text-gray-400">読み込み中...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center px-5">
        <div className="max-w-sm w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-center">
          <h1 className="text-xl font-black text-black mb-2">アクセス権限がありません</h1>
          <p className="text-xs text-gray-500 mb-6">{error || 'このパソコン以外からのアクセスです。'}</p>
          <a href="/" className="text-xs font-bold bg-black text-white px-4 py-2.5 rounded-lg inline-block">
            投票ページに戻る
          </a>
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
            <p className="text-xs text-gray-500 mt-0.5">このパソコンからの専用アクセス</p>
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