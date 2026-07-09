import { supabase } from '../lib/supabase';

export interface AuditLogEntry {
  admin_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
}

export async function logAdminAction(entry: AuditLogEntry) {
  const { error } = await supabase.from('audit_logs').insert({
    admin_id: entry.admin_id ?? null,
    action: entry.action,
    entity_type: entry.entity_type,
    entity_id: entry.entity_id ?? null,
    details: entry.details ?? {},
    ip_address: entry.ip_address ?? null,
  });
  if (error) console.error('Failed to log audit entry:', error);
}

export async function getAuditLogs(limit = 100) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, profiles:admin_id(name)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
