import { createClient } from '@supabase/supabase-js';

export interface Plan {
  id: string;
  agent_id: string;
  goal: string;
  description?: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  created_at?: string;
  updated_at?: string;
}

export interface PlanStep {
  id: string;
  plan_id: string;
  step_order: number;
  description: string;
  action_type?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  dependencies?: string[];
  result_summary?: string;
  updated_at?: string;
}

export class planService {
  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  /**
   * Creates a new autonomous plan and its associated steps
   */
  static async createPlan(agentId: string, goal: string, description: string, steps: Omit<PlanStep, 'id' | 'plan_id'>[]) {
    // 1. Create the plan
    const { data: plan, error: planError } = await this.supabase
      .from('autonomous_plans')
      .insert({ agent_id: agentId, goal, description })
      .select()
      .single();

    if (planError) {
      console.error('[planService] Error creating plan:', planError);
      throw planError;
    }

    // 2. Create the steps
    const stepsWithPlanId = steps.map((step, index) => ({
      ...step,
      plan_id: plan.id,
      step_order: index + 1,
    }));

    const { error: stepsError } = await this.supabase
      .from('plan_steps')
      .insert(stepsWithPlanId);

    if (stepsError) {
      console.error('[planService] Error creating steps:', stepsError);
      throw stepsError;
    }

    return { plan, steps: stepsWithPlanId };
  }

  /**
   * Get the active plan for an agent, including its steps
   */
  static async getActivePlan(agentId: string) {
    const { data: plan, error: planError } = await this.supabase
      .from('autonomous_plans')
      .select('*')
      .eq('agent_id', agentId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (planError || !plan) return null;

    const { data: steps, error: stepsError } = await this.supabase
      .from('plan_steps')
      .select('*')
      .eq('plan_id', plan.id)
      .order('step_order', { ascending: true });

    if (stepsError) throw stepsError;

    return { ...plan, steps };
  }

  /**
   * Update the status of a specific step
   */
  static async updateStepStatus(stepId: string, status: PlanStep['status'], result?: string) {
    const { error } = await this.supabase
      .from('plan_steps')
      .update({ 
        status, 
        result_summary: result,
        updated_at: new Date().toISOString() 
      })
      .eq('id', stepId);

    if (error) {
      console.error('[planService] Error updating step status:', error);
      throw error;
    }

    return true;
  }

  /**
   * Find the next pending step for the active plan
   */
  static async getNextStep(agentId: string) {
    const plan = await this.getActivePlan(agentId);
    if (!plan) return null;

    // Find the first pending step whose dependencies are all completed
    const pendingSteps = plan.steps.filter(s => s.status === 'pending' || s.status === 'failed');
    
    for (const step of pendingSteps) {
      const deps = step.dependencies || [];
      const depsCompleted = deps.every(depId => 
        plan.steps.find(s => s.id === depId)?.status === 'completed'
      );
      
      if (depsCompleted) return step;
    }

    return null;
  }

  /**
   * Mark a plan as completed
   */
  static async completePlan(planId: string) {
    const { error } = await this.supabase
      .from('autonomous_plans')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', planId);

    if (error) throw error;
    return true;
  }
}
