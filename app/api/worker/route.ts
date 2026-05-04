import { NextResponse } from 'next/server';
import { runSandboxedCode } from '@/lib/services/sandboxRunner';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, input, timeoutMs } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const result = await runSandboxedCode(code, input, timeoutMs);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Worker Execution Error' }, { status: 500 });
  }
}
