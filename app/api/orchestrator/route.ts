import { NextResponse } from 'next/server';
import { orchestrate } from '@/lib/services/orchestrationEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userRequest, options } = body;

    if (!userRequest) {
      return NextResponse.json({ error: 'userRequest is required' }, { status: 400 });
    }

    const result = await orchestrate(userRequest, options || { requestType: 'content' });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Orchestration Error' }, { status: 500 });
  }
}
