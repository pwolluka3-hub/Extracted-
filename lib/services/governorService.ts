import { createClient } from '@/lib/supabase/server';
import { type GovernorConfig, type GovernorState } from '@/lib/core/GovernorSystem';

export async function loadGovernorConfig(): Promise<GovernorConfig> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('system_configs')
    .select('value')
    .eq('key', 'governor_config')
    .single();

  if (!data) {
    const defaultConfig: GovernorConfig = {
      enabled: true,
      strictness: 'medium',
      failSafeThreshold: 10,
      approvedKeywords: [],
      blockedKeywords: [],
    };
    await saveGovernorConfig(defaultConfig);
    return defaultConfig;
  }
  
  return data.value as GovernorConfig;
}

export async function saveGovernorConfig(config: GovernorConfig) {
  const supabase = await createClient();
  
  await supabase
    .from('system_configs')
    .upsert({ key: 'governor_config', value: config });
}

export async function loadGovernorState(): Promise<GovernorState> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('system_configs')
    .select('value')
    .eq('key', 'governor_state')
    .single();

  if (!data) {
    const defaultState: GovernorState = {
      currentMode: 'standard',
      rejectedToday: 0,
      lastFailureAt: new Date().toISOString(),
    };
    await saveGovernorState(defaultState);
    return defaultState;
  }
  
  return data.value as GovernorState;
}

export async function saveGovernorState(state: GovernorState) {
  const supabase = await createClient();
  
  await supabase
    .from('system_configs')
    .upsert({ key: 'governor_state', value: state });
}
