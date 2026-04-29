'use client';

import { loadQueuedPostJobs, updateQueuedPostJob } from './postQueueService';
import { runUploadWorker, type UploadWorkerReport } from './uploadWorkerService';

const MAX_ATTEMPTS = 3;

export interface MonitorRetryReport {
  queued: number;
  requeued: number;
  dropped: number;
  worker: UploadWorkerReport;
}

export async function runMonitorAndRetry(limit = 5): Promise<MonitorRetryReport> {
  const queue = await loadQueuedPostJobs();
  const failed = queue.filter((job) => job.status === 'failed');
  let requeued = 0;
  let dropped = 0;

  for (const job of failed) {
    if (job.attempts >= MAX_ATTEMPTS) {
      dropped++;
      continue;
    }
    requeued++;
    await updateQueuedPostJob(job.id, { status: 'queued' });
  }

  const worker = await runUploadWorker(limit);
  const refreshed = await loadQueuedPostJobs();

  return {
    queued: refreshed.filter((job) => job.status === 'queued').length,
    requeued,
    dropped,
    worker,
  };
}
