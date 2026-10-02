'use server';

import { createClient } from '@/lib/supabase/server';
import { Message } from '@/types';

export async function fetchMessages(friendId: string): Promise<Message[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`
    )
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  return data.map((m) => ({
    id: m.id,
    from: m.sender_id === user.id ? 'me' : m.sender_id,
    text: m.content,
    t: new Date(m.created_at).getTime(),
  }));
}

export async function sendMessageAction(receiverId: string, content: string): Promise<Message | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content,
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message || 'Failed to send message');

  return {
    id: data.id,
    from: 'me',
    text: data.content,
    t: new Date(data.created_at).getTime(),
  };
}
