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
    .select('*')
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
  };
}

export async function createOrUpdateProfile(data: Omit<Profile, 'id'>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const payload = {
    id: user.id,
    name: data.name,
    username: data.username,
    age: Number(data.age),
    gender: data.gender,
    mobile: data.mobile,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('profiles')
    .upsert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  return { success: true };
}
