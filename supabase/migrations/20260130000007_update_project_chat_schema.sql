-- Add read_by and metadata to project_chat to match fyp_chat capabilities
ALTER TABLE project_chat ADD COLUMN IF NOT EXISTS read_by JSONB DEFAULT '[]'::jsonb;
ALTER TABLE project_chat ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
