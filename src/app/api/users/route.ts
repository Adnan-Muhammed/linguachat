import { fetchUsersList, sendFriendRequestAction } from '@/actions/friends';
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await fetchUsersList();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const { receiverId } = await request.json();
  const res = await sendFriendRequestAction(receiverId);
  return NextResponse.json(res);
}
