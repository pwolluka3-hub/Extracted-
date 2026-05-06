-- Migration: 20260507_hitl_rejection_reasons.sql

-- Add rejection_reason to the approval_queue table to capture why a post was rejected.
-- This allows the AI to learn from human feedback.
alter table public.approval_queue 
add column if not exists rejection_reason text;

-- Add a column to social_posts to track if it was based on a refined draft
alter table public.social_posts 
add column if not exists refined_from_rejection boolean default false;
