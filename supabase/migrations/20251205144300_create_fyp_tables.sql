-- Create final_year_projects table
CREATE TABLE final_year_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'proposal_submitted' CHECK (status IN ('proposal_submitted', 'proposal_approved', 'in_progress', 'ready_for_review', 'completed', 'rejected')),
  supervisor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  proposal_url TEXT,
  report_url TEXT,
  grade TEXT,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  CONSTRAINT unique_active_fyp_per_student UNIQUE (student_id) -- Enforce one FYP per student
);

-- Enable RLS
ALTER TABLE final_year_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. Students can view their own FYP
CREATE POLICY "Students can view own FYP" ON final_year_projects
  FOR SELECT USING (
    auth.uid() = student_id
  );

-- 2. Students can create a proposal (insert) if they are level 400
CREATE POLICY "Level 400 students can submit FYP proposal" ON final_year_projects
  FOR INSERT WITH CHECK (
    auth.uid() = student_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND academic_level = '400'
    )
  );

-- 3. Students can update their own FYP (e.g. upload report) if not completed
CREATE POLICY "Students can update own FYP" ON final_year_projects
  FOR UPDATE USING (
    auth.uid() = student_id AND status NOT IN ('completed', 'rejected')
  );

-- 4. Staff and Admins can view all FYPs
CREATE POLICY "Staff and Admins can view all FYPs" ON final_year_projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

-- 5. Staff (Supervisors) and Admins can update FYPs (grading, approval)
CREATE POLICY "Staff and Admins can update FYPs" ON final_year_projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

-- Create indexes
CREATE INDEX fyp_student_id_idx ON final_year_projects(student_id);
CREATE INDEX fyp_supervisor_id_idx ON final_year_projects(supervisor_id);
CREATE INDEX fyp_status_idx ON final_year_projects(status);

-- Trigger for updated_at
CREATE TRIGGER update_fyp_updated_at
  BEFORE UPDATE ON final_year_projects
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create fyp_comments table for communication between student and supervisor
CREATE TABLE fyp_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fyp_id UUID REFERENCES final_year_projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS for comments
ALTER TABLE fyp_comments ENABLE ROW LEVEL SECURITY;

-- Comments Policies
CREATE POLICY "View comments for own FYP or if staff" ON fyp_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM final_year_projects
      WHERE id = fyp_comments.fyp_id AND student_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Create comments for own FYP or if staff" ON fyp_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM final_year_projects
      WHERE id = fyp_comments.fyp_id AND student_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

CREATE INDEX fyp_comments_fyp_id_idx ON fyp_comments(fyp_id);
