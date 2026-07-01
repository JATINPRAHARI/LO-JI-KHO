import { supabase } from '../lib/supabase';

export async function getAllSettings() {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) throw error;
  const map: Record<string, string> = {};
  (data ?? []).forEach(s => { map[s.key] = s.value; });
  return map;
}

export async function getSetting(key: string) {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error) throw error;
  return data?.value ?? '';
}

export async function updateSetting(key: string, value: string) {
  const { data, error } = await supabase
    .from('settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key)
    .select()
    .single();
  if (error) throw error;
  return data;
}
