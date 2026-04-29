'use client';

import { publishPost, schedulePost } from './publishService';
import { loadQueuedPostJobs, updateQueuedPostJob, type QueuedPostJob } from './postQueueService';

const MAX_UPLOAD_ATTEMPTS = 3;

export interface UploadWorkerReport {
  processed: number;
  posted: number;
  failed: number;
  errors: Array<{ jobId: string; error: string }>;
}

async function processJob(job: QueuedPostJob): Promise<{ ok: boolean; error?: string }> {
  try {
    if (job.scheduledAt) {
      const scheduled = await schedulePost({
        text: job.text,
        platforms: job.platforms,
        scheduledDate: job.scheduledAt,
        mediaUrl: job.mediaUrl,
      });
      if (!scheduled.success) {
        return { ok: false, error: scheduled.error || 'Scheduling failed' };
      }
      return { ok: true };
    }

    const posted = await publishPost({
      text: job.text,
      platforms: job.platforms,
      mediaUrl: job.mediaUrl,
    });

    if (!posted.success) {
      return { ok: false, error: JSON.stringify(posted.errors || { general: 'Publish failed' }) };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown upload worker error' };
  }
}

export async function runUploadWorker(limit = 5): Promise<UploadWorkerReport> {
  const queue = await loadQueuedPostJobs();
  const pending = queue
    .filter(
      (job) =>
        job.status === 'queued' ||
        (job.status === 'failed' && job.attempts < MAX_UPLOAD_ATTEMPTS)
    )
    .slice(0, limit);

  const report: UploadWorkerReport = {
    processed: 0,
    posted: 0,
    failed: 0,
    errors: [],
  };

  for (const job of pending) {
    report.processed++;
    await updateQueuedPostJob(job.id, { status: 'processing' });

    const result = await processJob(job);
    if (result.ok) {
      report.posted++;
      await updateQueuedPostJob(job.id, { status: 'posted', lastError: undefined });
      continue;
    }

    report.failed++;
    report.errors.push({ jobId: job.id, error: result.error || 'Unknown error' });
    await updateQueuedPostJob(job.id, {
      status: 'failed',
      attempts: job.attempts + 1,
      lastError: result.error,
    });
  }

  return report;
}
