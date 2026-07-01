import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) return;
  envVars[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
});

const supabaseUrl = envVars['VITE_SUPABASE_URL'] || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars['VITE_SUPABASE_ANON_KEY'] || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('Increasing all menu item prices by ₹10...');
  const { data: items, error: fetchError } = await supabase
    .from('menu_items')
    .select('id, price');
  if (fetchError) { console.error('Fetch error:', fetchError); process.exit(1); }
  if (!items?.length) { console.log('No menu items found.'); return; }

  for (const item of items) {
    const { error } = await supabase
      .from('menu_items')
      .update({ price: item.price + 10, updated_at: new Date().toISOString() })
      .eq('id', item.id);
    if (error) {
      console.error('Failed to update ' + item.id + ': ' + error.message);
    } else {
      console.log('  Updated ' + item.id + ': ₹' + item.price + ' -> ₹' + (item.price + 10));
    }
  }
  console.log('Done.');
}

main();
