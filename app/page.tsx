'use client';

import { useState, useEffect } from 'react';

interface Candidate {
  id: number;
  name: string;
  school_year?: string;
  img?: string;
}

export default function VotePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
        (e.ctrlKey && e.key === 'U') ||
        (e.metaKey && e.altKey && ['I', 'J', 'C'].includes(e.key))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    fetch('/api/candidates')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'データ取得失敗');
        return data as Candidate[];
      })
      .then((data) => {
        setCandidates(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        setLoading(false);
      });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isAlreadyVoted = () => {
    const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith('has_voted_2026='));
    const hasLocalStorage = localStorage.getItem('has_voted_2026') === 'true';
    return hasCookie || hasLocalStorage;
  };

  const handleVote = async () => {
    if (!selected) return;

    if (isAlreadyVoted()) {
      alert('すでにご投票済みです。投票はお一人様1回までとなります。');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: selected.id }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || '投票処理に失敗しました。');

      document.cookie = "has_voted_2026=true; max-age=31536000; path=/; SameSite=Lax";
      localStorage.setItem('has_voted_2026', 'true');

      const formattedId = String(selected.id).padStart(2, '0');
      alert(`【${formattedId} ${selected.name}】様への投票が完了しました！\nご参加ありがとうございました。`);
      window.location.reload();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fcfcfc] text-[#111] antialiased min-h-screen pb-36 select-none">
      <div className="max-w-md mx-auto px-5 pt-6 pb-8">
        <header className="flex justify-between items-center mb-6">
          <div className="text-[11px] font-bold tracking-widest text-black">JŌHOKU FESTIVAL 85th</div>
          <button aria-label="Menu" className="p-1 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 7h16M4 12h16M4 17h16"/>
            </svg>
          </button>
        </header>

        <div className="mb-6">
          <h1 className="text-[38px] font-black leading-[1.05] tracking-tight text-black">
            MISS JŌHOKU<br />2026
          </h1>
          <div className="w-7 h-[2px] bg-black my-4"></div>
          <p className="text-[13px] font-bold text-black tracking-tight">あなたが応援したい人を１名選んでください</p>
          <p className="text-[11px] text-gray-500 mt-0.5">※投票はお一人様1回までです</p>
        </div>

        {loading && (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mb-2"></div>
            <p className="text-xs font-bold text-gray-400">候補者データを読み込み中...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-xs text-red-500 py-10 px-4 bg-red-50 rounded-lg border border-red-200">
            <p className="font-bold text-sm mb-1">データの読み込みに失敗しました</p>
            <p className="font-mono text-[11px] bg-white p-2 rounded border border-red-100 my-2 text-left break-all text-red-700">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && candidates.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-10">候補者が登録されていません。</p>
        )}

        {!loading && !error && candidates.length > 0 && (
          <div className="grid grid-cols-2 gap-3.5 mt-4">
            {candidates.map((c) => {
              const isSelected = selected?.id === c.id;
              const formattedId = String(c.id).padStart(2, '0');

              return (
                <div
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-150 ${
                    isSelected ? 'border-black bg-white shadow-lg' : 'border-transparent bg-[#f4f4f4]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[0px] border-r-[44px] border-b-[44px] border-l-[0px] border-t-transparent border-r-black border-b-transparent border-l-transparent z-10">
                      <span className="absolute -top-0.5 right-[-41px] text-white text-[12px] font-bold">✓</span>
                    </div>
                  )}

                  <div className="w-full h-44 bg-[#e5e5e5] relative flex items-end justify-center overflow-hidden">
                    {c.img ? (
                      <img src={c.img} alt={c.name} className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-24 h-28 bg-[#ccc] rounded-t-full relative flex justify-center">
                        <div className="w-14 h-14 bg-[#ccc] rounded-full -top-9 absolute"></div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-white flex justify-between items-center border-t border-gray-100">
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className="text-xl font-black text-black leading-none">{formattedId}</span>
                      <span className="text-[12px] font-bold text-black truncate">{c.name}</span>
                    </div>
                    <div className="text-[10px] text-gray-600 font-bold flex items-center gap-1 shrink-0 ml-1">
                      <span
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${
                          isSelected ? 'bg-black text-white font-bold' : 'border border-gray-400 bg-transparent text-transparent'
                        }`}
                      >
                        {isSelected ? '✓' : ''}
                      </span>
                      <span>{isSelected ? '選択中' : '選択する'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-black text-white px-5 pt-4 pb-5 shadow-2xl z-50">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-end border-b border-gray-800 pb-3">
            <div className="pr-2">
              <div className="text-[10px] text-gray-400 tracking-wider font-medium">現在の選択中</div>
              {selected ? (
                <div className="text-lg font-bold mt-0.5 tracking-tight flex items-center gap-2">
                  <span className="text-2xl font-black">{String(selected.id).padStart(2, '0')}</span>
                  <span className="text-sm font-bold truncate max-w-[120px]">{selected.name}</span>
                </div>
              ) : null}
            </div>

            <button
              disabled={!selected || submitting}
              onClick={handleVote}
              className="bg-white text-black px-6 py-3 rounded-md text-sm font-bold flex items-center gap-3 transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 shrink-0"
            >
              {submitting ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                  <span>送信中...</span>
                </>
              ) : (
                <>
                  <span>投票する</span>
                  <svg className="w-4 h-4 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
                </>
              )}
            </button>
          </div>

          <p className="text-[10px] text-gray-400 text-center mt-2 tracking-tight">
            投票内容の確認画面は、投票するボタンを押した後に表示されます。
          </p>
        </div>
      </div>
    </div>
  );
}