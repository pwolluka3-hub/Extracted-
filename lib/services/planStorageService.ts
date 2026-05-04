import { createClient } from '@/lib/supabase/server';

export async function savePlan(plan: any) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('orchestration_plans')
    .upsert({
      id: plan.id,
      user_request: plan.userRequest,
      plan_data: plan,
      status: plan.status,
      final_output: plan.finalOutput,
    });

  if (error) throw error;
}

export async function getPlan(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('orchestration_plans')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}
