-- Create fyp_submissions table for tracking all document submissions
CREATE TABLE fyp_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fyp_id UUID REFERENCES final_year_projects(id) ON DELETE CASCADE NOT NULL,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('proposal', 'progress_report', 'chapter_draft', 'final_thesis')),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'needs_revision', 'rejected')),
  supervisor_feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE fyp_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fyp_submissions

-- 1. Students can view their own submissions
CREATE POLICY "Students can view own submissions" ON fyp_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM final_year_projects
      WHERE id = fyp_submissions.fyp_id AND student_id = auth.uid()
    )
  );

-- 2. Students can create submissions for their own FYP
CREATE POLICY "Students can create own submissions" ON fyp_submissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM final_year_projects
      WHERE id = fyp_submissions.fyp_id AND student_id = auth.uid()
    )
  );

-- 3. Students can update their own pending submissions
CREATE POLICY "Students can update own pending submissions" ON fyp_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM final_year_projects
      WHERE id = fyp_submissions.fyp_id AND student_id = auth.uid()
    ) AND status = 'pending'
  );

-- 4. Students can delete their own pending submissions
CREATE POLICY "Students can delete own pending submissions" ON fyp_submissions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM final_year_projects
      WHERE id = fyp_submissions.fyp_id AND student_id = auth.uid()
    ) AND status = 'pending'
  );

-- 5. Staff and Admins can view all submissions
CREATE POLICY "Staff and Admins can view all submissions" ON fyp_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

-- 6. Staff and Admins can update submissions (for feedback and status)
CREATE POLICY "Staff and Admins can update submissions" ON fyp_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

-- Create indexes for performance
CREATE INDEX fyp_submissions_fyp_id_idx ON fyp_submissions(fyp_id);
CREATE INDEX fyp_submissions_type_idx ON fyp_submissions(submission_type);
CREATE INDEX fyp_submissions_status_idx ON fyp_submissions(status);
CREATE INDEX fyp_submissions_submitted_at_idx ON fyp_submissions(submitted_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_fyp_submissions_updated_at
  BEFORE UPDATE ON fyp_submissions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Add indexes to final_year_projects for better query performance
CREATE INDEX IF NOT EXISTS fyp_created_at_idx ON final_year_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS fyp_updated_at_idx ON final_year_projects(updated_at DESC);

-- Function to get submission statistics per FYP
CREATE OR REPLACE FUNCTION get_fyp_submission_stats(fyp_uuid UUID)
RETURNS TABLE (
  total_submissions BIGINT,
  pending_submissions BIGINT,
  approved_submissions BIGINT,
  needs_revision_submissions BIGINT,
  rejected_submissions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_submissions,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_submissions,
    COUNT(*) FILTER (WHERE status = 'approved')::BIGINT as approved_submissions,
    COUNT(*) FILTER (WHERE status = 'needs_revision')::BIGINT as needs_revision_submissions,
    COUNT(*) FILTER (WHERE status = 'rejected')::BIGINT as rejected_submissions
  FROM fyp_submissions
  WHERE fyp_id = fyp_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
