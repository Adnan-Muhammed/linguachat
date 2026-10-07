'use server';

import { createClient } from '@/lib/supabase/server';
import { DirectoryUser } from '@/types';

type RequestRow = {
  profiles: {
    id: string;
    name: string;
    username: string;
    age: string | number;
    gender?: string;
    mobile?: string;
    avatar_url?: string;
  };
};

export async function fetchUsersList(): Promise<DirectoryUser[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', user.id);

  if (error || !data) return [];

  return data.map((p) => ({
    id: p.id,
    name: p.name,
    username: p.username,
    age: Number(p.age),
    gender: p.gender,
    mobile: p.mobile,
    avatar_url: p.avatar_url,
    online: true,
  }));
}

export async function sendFriendRequestAction(receiverId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Single upsert — avoids the SELECT + INSERT/UPDATE round-trip
  const { error } = await supabase
    .from('friend_requests')
    .upsert(
      {
        sender_id: user.id,
        receiver_id: receiverId,
        status: 'pending',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'sender_id,receiver_id' }
    );

  if (error) throw new Error(error.message);

  return { success: true };
}

export async function cancelFriendRequestAction(receiverId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('friend_requests')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('sender_id', user.id)
    .eq('receiver_id', receiverId)
    .eq('status', 'pending');

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function fetchSentRequests(): Promise<string[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from('friend_requests')
    .select('receiver_id')
    .eq('sender_id', user.id)
    .eq('status', 'pending');

  return data ? data.map((r) => r.receiver_id) : [];
}

export async function fetchIncomingRequests(): Promise<DirectoryUser[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: requests } = await supabase
    .from('friend_requests')
    .select('id, sender_id, profiles!friend_requests_sender_id_fkey(*)')
    .eq('receiver_id', user.id)
    .eq('status', 'pending');

  if (!requests) return [];

  return (requests as unknown as RequestRow[]).map((r) => ({
    id: r.profiles.id,
    name: r.profiles.name,
    username: r.profiles.username,
    age: Number(r.profiles.age),
    gender: r.profiles.gender,
    mobile: r.profiles.mobile,
    avatar_url: r.profiles.avatar_url,
    online: true,
  }));
}

export async function respondFriendRequestAction(senderId: string, status: 'accepted' | 'rejected') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('friend_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('sender_id', senderId)
    .eq('receiver_id', user.id)
    .eq('status', 'pending');

  if (error) throw new Error(error.message);

  return { success: true };
}

export async function fetchFriends(): Promise<DirectoryUser[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // Get accepted requests where current user is sender or receiver in parallel
  const [
    { data: sentAccepted },
    { data: receivedAccepted }
  ] = await Promise.all([
    supabase
      .from('friend_requests')
      .select('receiver_id, profiles!friend_requests_receiver_id_fkey(*)')
      .eq('sender_id', user.id)
      .eq('status', 'accepted'),
    supabase
      .from('friend_requests')
      .select('sender_id, profiles!friend_requests_sender_id_fkey(*)')
      .eq('receiver_id', user.id)
      .eq('status', 'accepted')
  ]);

  const friends: DirectoryUser[] = [];

  if (sentAccepted) {
    (sentAccepted as unknown as RequestRow[]).forEach((r) => {
      if (r.profiles) {
        friends.push({
          id: r.profiles.id,
          name: r.profiles.name,
          username: r.profiles.username,
          age: Number(r.profiles.age),
          gender: r.profiles.gender,
          mobile: r.profiles.mobile,
          avatar_url: r.profiles.avatar_url,
          online: true,
        });
      }
    });
  }

  if (receivedAccepted) {
    (receivedAccepted as unknown as RequestRow[]).forEach((r) => {
      if (r.profiles) {
        friends.push({
          id: r.profiles.id,
          name: r.profiles.name,
          username: r.profiles.username,
          age: Number(r.profiles.age),
          gender: r.profiles.gender,
          mobile: r.profiles.mobile,
          avatar_url: r.profiles.avatar_url,
          online: true,
        });
      }
    });
  }

  return friends;
}
