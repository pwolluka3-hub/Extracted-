# n8n Workflow Specifications for NexusAI

This document defines the required n8n workflows to support the Autonomous Content Engine.

## 1. Global Error & Retry Handler
**Trigger**: Error Trigger node.
**Logic**:
- Check the failed node's retry count.
- If `retry_count < 3`, wait 5 minutes $\rightarrow$ trigger the failed node again.
- If `retry_count >= 3`, send a "Failure Alert" to the Next.js `/api/logs` endpoint and notify the user via Slack/Email.

## 2. Video Generation Workflow (`workflow-video-generation`)
**Trigger**: Webhook (POST)
**Inputs**: `script`, `aspect_ratio`, `duration`, `agent_id`.
**Logic**:
1. **Asset Retrieval**: Fetch agent brand identity from Supabase.
2. **Generation**: Call Video API (Runway/Ltx) $\rightarrow$ Poll for completion.
3. **Storage**: Upload resulting .mp4 to Supabase Storage.
4. **Response**: Return `video_url`.

## 3. Caption Generation Workflow (`workflow-caption-generation`)
**Trigger**: Webhook (POST)
**Inputs**: `video_summary`, `platform`, `target_audience`.
**Logic**:
1. **Persona Load**: Get agent's `preferredTone` and `writingStyle` from Supabase.
2. **AI Generation**: Use GPT-4o to create a hook, body, and 5-10 hashtags.
3. **Validation**: Check against `avoidTopics` list.
4. **Response**: Return `caption`.

## 4. Social Posting Workflow (`workflow-social-posting`)
**Trigger**: Webhook (POST)
**Inputs**: `video_url`, `caption`, `platform`.
**Logic**:
1. **Platform Routing**: Switch node based on `platform` (TikTok, IG, YT).
2. **API Upload**: Use respective OAuth2 credentials to upload the video.
3. **Post Execution**: Publish with the generated caption.
4. **Log**: Write the `post_id` and `publish_date` back to the `content_history` table in Supabase.

## 5. Posting Scheduler Workflow (`workflow-post-scheduler`)
**Trigger**: Cron Trigger (Daily/Weekly)
**Logic**:
1. **Queue Check**: Query Supabase for the next scheduled post.
2. **Condition**: If a post is found $\rightarrow$ trigger `workflow-social-posting`.
3. **Cleanup**: Mark the post as `published`.

## 6. Memory Sync Workflow (`workflow-memory-sync`)
**Trigger**: Webhook (POST) on every chat turn.
**Inputs**: `user_message`, `ai_response`, `agent_id`.
**Logic**:
1. **Extraction**: Use AI to extract facts and content ideas.
2. **Vectorization**: Call OpenAI Embeddings $\rightarrow$ Insert into `agent_vector_memory` table.
3. **Relational Update**: Update `agent_memory.json` (or relational table) with new facts.

## 7. Observability & Logging (The "Glass Box")

To provide real-time visibility into the agent's execution, every workflow MUST report its status back to the NexusAI Control Plane.

**Log Endpoint**: `POST /api/agent/logs`
**Authentication**: Header `X-NexusAI-Bridge-Secret` or Body `secret`.

### Log Levels
- `thinking`: AI is processing data or making a decision.
- `acting`: A tool/API is being called.
- `completed`: A step was successfully finished.
- `failed`: An error occurred.
- `waiting`: Waiting for human approval or a rate-limit timer.

### Implementation Pattern for all Workflows:
1. **Start of Workflow**: Call `/api/agent/logs` with status `acting` and message "Starting [Workflow Name]...".
2. **Before a Tool Call**: Call `/api/agent/logs` with status `thinking` and message "Thinking about how to [Action]...".
3. **After Tool Success**: Call `/api/agent/logs` with status `completed` and message "Successfully [Action].".
4. **On Error**: Call `/api/agent/logs` with status `failed` and message "Failed to [Action]: [Error Message]".
