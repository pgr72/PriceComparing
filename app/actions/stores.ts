'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createStore(formData: FormData) {
  const supabase = await createClient();

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: 'Only admins can create stores' };
  }

  const storeData = {
    name: formData.get('name') as string,
    location: formData.get('location') as string,
    country_id: formData.get('country_id') as string,
  };

  const { error } = await supabase.from('stores').insert(storeData);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function updateStore(id: string, formData: FormData) {
  const supabase = await createClient();

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: 'Only admins can update stores' };
  }

  const storeData = {
    name: formData.get('name') as string,
    location: formData.get('location') as string,
    country_id: formData.get('country_id') as string,
  };

  const { error } = await supabase
    .from('stores')
    .update(storeData)
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function deleteStore(id: string) {
  const supabase = await createClient();

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: 'Only admins can delete stores' };
  }

  const { error } = await supabase.from('stores').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}
