import { fetchFriends } from '@/actions/friends';
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await fetchFriends();
  return NextResponse.json(data);
}
