import { fetchIncomingRequests, respondFriendRequestAction } from '@/actions/friends';
import { NextResponse } from 'next/server';

export async function GET() {
  const requests = await fetchIncomingRequests();
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const { senderId, status } = await request.json();
  const res = await respondFriendRequestAction(senderId, status);
  return NextResponse.json(res);
}
