-- ==============================================================================
-- Migration: Create user_surveys table
-- Description: Stores user surveys with Row Level Security (RLS) for Supabase
-- Target: Supabase / PostgreSQL
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create user_surveys table
CREATE TABLE IF NOT EXISTS public.user_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT,
    cr_number TEXT,
    survey_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_user_surveys_user_id 
    ON public.user_surveys(user_id);

CREATE INDEX IF NOT EXISTS idx_user_surveys_created_at 
    ON public.user_surveys(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_surveys ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (Users can only manage their own data)

-- SELECT: Users can view only their own surveys
CREATE POLICY "Users can view their own surveys"
    ON public.user_surveys
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- INSERT: Users can insert surveys associated with their authenticated UID
CREATE POLICY "Users can insert their own surveys"
    ON public.user_surveys
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update only their own surveys
CREATE POLICY "Users can update their own surveys"
    ON public.user_surveys
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete only their own surveys
CREATE POLICY "Users can delete their own surveys"
    ON public.user_surveys
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 5. Helpful table and column comments
COMMENT ON TABLE public.user_surveys IS 'Stores user survey responses without affecting existing tables';
COMMENT ON COLUMN public.user_surveys.id IS 'Primary key (UUID)';
COMMENT ON COLUMN public.user_surveys.user_id IS 'References auth.users(id) belonging to the authenticated user';
COMMENT ON COLUMN public.user_surveys.company_name IS 'Company or establishment name';
COMMENT ON COLUMN public.user_surveys.cr_number IS 'Commercial Registration (CR) number';
COMMENT ON COLUMN public.user_surveys.survey_data IS 'Structured survey questions, compliance metrics, and answers in JSONB';
COMMENT ON COLUMN public.user_surveys.created_at IS 'Timestamp of creation in UTC';
