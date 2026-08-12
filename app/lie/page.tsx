'use client';

import { useRouter } from 'next/navigation';

export default function FullscreenBackButton() {
  const router = useRouter();

  return (

    <button
      onClick={() => router.back()}
      className="fixed inset-0 w-full h-full bg-transparent z-50 cursor-pointer border-none"
      aria-label="戻る"
    >
    
  見ようとしないでください
  <br />
  <br/>
  戻る
    </button>
  );
}