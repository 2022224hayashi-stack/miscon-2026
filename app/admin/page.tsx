'use client';

import { useState } from 'react';
import { ResultItem } from '../../app/type';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [summary, setSummary] = useState<ResultItem[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVotingOpen, setIsVotingOpen] = useState<boolean>(true);
  const [toggiling, setToggling] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSchoolYear, setNewSchoolYear] = useState('');
  const [newImg, setNewImg] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert('名前を入力してください。');
      return;
    }
    setAdding(true);
    try {
      const res = await fetch('/api/admin/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, name: newName, schoolYear: newSchoolYear, img: newImg }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '候補者の追加に失敗しました。');

      alert(`候補者「${data.candidate.name}」を追加しました。`);
      setNewName('');
      setNewSchoolYear('');
      setNewImg('');

      setSummary((prev) => [
        ...prev,
        { id: data.candidate.id || prev.length + 1, name: data.candidate.name, votes: 0 },
      ]);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setAdding(false);
    }
  };

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

      const resultSummary = data.summary && data.summary.length > 0 ? data.summary : [];
      setSummary(resultSummary);
      setTotalVotes(data.totalVotes ?? resultSummary.reduce((acc: number, cur: ResultItem) => acc + cur.votes, 0));
      setIsVotingOpen(data.isVotingOpen ?? true);
      setIsAuthenticated(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVoting = async () => {
    setToggling(true);
    const nextStage = !isVotingOpen;

    try {
      const res = await fetch('/api/vote-situation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, isOpen: nextStage }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '投票受付状態の更新に失敗しました。');

      setIsVotingOpen(nextStage);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setToggling(false);
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

          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
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

        <div className="bg-white border border-gray-200 p-4 rounded-2xl mb-6 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 font-medium">投票受付状況</div>
            <div className="text-sm font-bold mt-1">{isVotingOpen ? '受付中' : '停止中'}</div>
          </div>
          <button
            onClick={handleToggleVoting}
            disabled={toggiling}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
              isVotingOpen
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            } ${toggiling ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {toggiling ? '処理中...' : isVotingOpen ? '停止する' : '受付する'}
          </button>
        </div>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-black text-white p-5 rounded-2xl mb-6 shadow-md">
          <div className="text-xs text-gray-400 font-medium">総投票数</div>
          <div className="text-3xl font-black mt-1">
            {totalVotes} <span className="text-sm font-normal">票</span>
          </div>
        </div>

        {/* ▼▼ 全候補者一覧・得票数内訳 ▼▼ */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-700 tracking-wider">候補者別内訳</h2>
            <span className="text-xs text-gray-400 font-medium">全 {summary.length} 名</span>
          </div>

          {summary.map((item, index) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-sm hover:border-gray-300 transition-colors"
            >
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
        {/* ▲▲ 全候補者一覧・得票数内訳 ▲▲ */}

      </div>

      <div className="bg-white border-t border-gray-200 p-4 mt-8 text-center text-xs text-gray-500">
        <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
          <span className="w-3 h-3 bg-black rounded-full flex items-center justify-center text-white text-[8px]">＋</span>
          候補者新規登録
        </h2>
        <form onSubmit={handleAddCandidate} className="space-y-3 max-w-sm mx-auto text-left">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">名前</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="候補者の名前"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">学年</label>
            <input
              type="text"
              value={newSchoolYear}
              onChange={(e) => setNewSchoolYear(e.target.value)}
              placeholder="例: 1年, 2年, 3年"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">画像URL</label>
            <input
              type="text"
              value={newImg}
              onChange={(e) => setNewImg(e.target.value)}
              placeholder="候補者の画像URL"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="w-full text-xs font-bold bg-black text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {adding ? '追加中...' : '候補者を追加'}
          </button>
        </form>
      </div>
    </div>
  );
}