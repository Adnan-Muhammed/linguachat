'use server';

import { createClient } from '@/lib/supabase/server';
import { Message } from '@/types';

export async function fetchMessages(friendId: string): Promise<{ msgs: Message[], clearedAt?: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { msgs: [] };

  const { data: clearData } = await supabase
    .from('chat_clears')
    .select('cleared_at')
    .eq('user_id', user.id)
    .eq('other_user_id', friendId)
    .maybeSingle();

  const clearedAtStr = clearData?.cleared_at;
  const clearedAtTime = clearedAtStr ? new Date(clearedAtStr).getTime() : undefined;

  let query = supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`
    )
    .order('created_at', { ascending: true });

  if (clearedAtStr) {
    query = query.gt('created_at', clearedAtStr);
  }

  const { data, error } = await query;

  if (error || !data) return { msgs: [] };

  const msgs = data.map((m) => ({
    id: m.id,
    from: m.sender_id === user.id ? 'me' : m.sender_id,
    text: m.content,
    t: new Date(m.created_at).getTime(),
  }));

  return { msgs, clearedAt: clearedAtTime };
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

export async function clearChatAction(friendId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Check if row already exists
  const { data: existing } = await supabase
    .from('chat_clears')
    .select('id')
    .eq('user_id', user.id)
    .eq('other_user_id', friendId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('chat_clears')
      .update({ cleared_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from('chat_clears')
      .insert({
        user_id: user.id,
        other_user_id: friendId,
      });
    if (error) throw new Error(error.message);
  }
}
