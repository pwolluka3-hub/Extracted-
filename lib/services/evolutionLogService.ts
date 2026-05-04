import { createClient } from '@/lib/supabase/server';

export async function saveEvolutionLog(log: {
  version: string;
  changeType: string;
  description: string;
  diff?: any;
}) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('evolution_logs')
    .insert({
      version: log.version,
      change_type: log.changeType,
      description: log.description,
      diff: log.diff,
    });

  if (error) throw error;
}

export async function getEvolutionHistory() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('evolution_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
