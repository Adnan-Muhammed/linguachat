'use server';

import { createClient } from '@/lib/supabase/server';
import { Profile } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, username, age, gender, mobile, avatar_url')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    name: profile.name,
    username: profile.username,
    age: Number(profile.age),
    gender: profile.gender,
    mobile: profile.mobile,
    email: user.email,
    avatar_url: profile.avatar_url,
  };
}

export async function createOrUpdateProfile(data: Omit<Profile, 'id'>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  if (!/^\d{10}$/.test(data.mobile)) {
    throw new Error('Mobile number must be exactly 10 digits');
  }

  // Check if profile exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('name, age, gender, avatar_url')
    .eq('id', user.id)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('profiles')
      .update({
        username: data.username,
        mobile: data.mobile,
        avatar_url: existing.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || data.name || '',
        username: data.username,
        age: Number(data.age),
        gender: data.gender,
        mobile: data.mobile,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || data.avatar_url || null,
      });
    if (error) throw new Error(error.message);
  }

  revalidatePath('/');
  return { success: true };
}
