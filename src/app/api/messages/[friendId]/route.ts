import { fetchMessages, sendMessageAction } from '@/actions/messages';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ friendId: string }> }
) {
  const { friendId } = await params;
  const messages = await fetchMessages(friendId);
  return NextResponse.json(messages);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ friendId: string }> }
) {
  const { friendId } = await params;
  const body = await request.json();
  const message = await sendMessageAction(friendId, body.text);
  return NextResponse.json(message);
}
