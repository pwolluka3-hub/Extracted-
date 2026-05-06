# 🌐 Social Media API Integration Guide

This guide provides the technical requirements for connecting the NexusAI n8n Execution Plane to social media platforms.

## 1. TikTok Integration
**API**: TikTok for Developers $\rightarrow$ Video Kit API
**Requirements**:
- Developer Account at [developers.tiktok.com](https://developers.tiktok.com)
- App approved for `video.upload` and `user.info.basic` scopes.
- **n8n Setup**: Use the "HTTP Request" node with OAuth2 credentials.
- **Key Endpoint**: `POST /video/upload/`

## 2. Instagram Integration
**API**: Meta Graph API $\rightarrow$ Instagram Content Publishing API
**Requirements**:
- Meta for Developers account $\rightarrow$ App with `instagram_content_publish` scope.
- Instagram Business Account linked to a Facebook Page.
- **n8n Setup**: Use the "Instagram" node or "HTTP Request" node.
- **Key Process**: 
  1. `POST /media` (upload video $\rightarrow$ get container ID).
  2. `POST /media_publish` (publish container ID).

## 3. YouTube Shorts Integration
**API**: YouTube Data API v3
**Requirements**:
- Google Cloud Console project $\rightarrow$ Enable YouTube Data API v3.
- OAuth2 credentials with `https://www.googleapis.com/auth/youtube.upload` scope.
- **n8n Setup**: Use the "YouTube" node.
- **Key Endpoint**: `POST /upload` (Set category to 'Shorts' via tags/description).

---

## 🛠️ n8n Publishing Logic Flow

For every platform, the n8n "Social Posting" workflow must follow this sequence:

1. **Initialization**:
   - Mark post status as `uploading` in `public.social_posts`.
   - Log event: `acting` $\rightarrow$ "Uploading to [Platform]...".

2. **Asset Transfer**:
   - Fetch video from Supabase Storage.
   - Stream upload to the Platform API.

3. **Metadata Application**:
   - Apply the AI-generated caption and hashtags.
   - Set visibility to `public`.

4. **Confirmation**:
   - Capture the `external_post_id` and `live_url`.
   - Update `public.social_posts` status to `published`.
   - Log event: `completed` $\rightarrow$ "Post is live! [URL]".

5. **Error Handling**:
   - If upload fails $\rightarrow$ update status to `failed` $\rightarrow$ store `error_message` $\rightarrow$ trigger the Global Retry Handler.
