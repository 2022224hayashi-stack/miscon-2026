import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';
import { Candidate } from '../../type';

export const dynamic = 'force-dynamic';

export async function GET() {
  try{
    const {data: profiles, error: profilesError} = await supabase
      .from('profiles')
      .select('id, name, school_year, img')
      .order('id', { ascending: true });

    if(profilesError) throw profilesError;

    const {data:settingData} = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'is_voting_open')
      .single();

    const isVotingOpen = settingData?.value ?? 'true';
    return NextResponse.json({
      candidates: profiles,
      isVotingOpen,
    });
  }catch(err: unknown){
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `【サーバーエラー】${errorMessage}` }, { status: 500 });
  }
}