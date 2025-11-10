-- Seed data for Swebuk database
-- This file will be executed when the database is reset/migrated

-- Create users directly in both auth.users and user_profiles tables
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
OVERRIDING SYSTEM VALUE
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@swebuk.com', crypt('TempPass123!', gen_salt('bf')), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'manager@swebuk.com', crypt('TempPass123!', gen_salt('bf')), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'lecturer@swebuk.com', crypt('TempPass123!', gen_salt('bf')), NOW()),
  ('00000000-0000-0000-0000-000000000004', 'leadstudent@swebuk.com', crypt('TempPass123!', gen_salt('bf')), NOW()),
  ('00000000-0000-0000-0000-000000000005', 'deputylead@swebuk.com', crypt('TempPass123!', gen_salt('bf')), NOW()),
  ('00000000-0000-0000-0000-000000000006', 'student1@swebuk.com', crypt('TempPass123!', gen_salt('bf')), NOW()),
  ('00000000-0000-0000-0000-000000000007', 'student2@swebuk.com', crypt('TempPass123!', gen_salt('bf')), NOW()),
  ('00000000-0000-0000-0000-000000000008', 'student3@swebuk.com', crypt('TempPass123!', gen_salt('bf')), NOW());

-- Insert into user_profiles table
INSERT INTO user_profiles (id, email, role, first_name, surname, department, institution, skills, linkedin_handle, github_handle, academic_level, registration_number, staff_number, staff_type, is_active, is_suspended)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@swebuk.com', 'administrator', 'System', 'Administrator', 'Software Engineering', 'Bayero University Kano', '["System Administration", "Database Management", "Security"]', NULL, NULL, NULL, NULL, 'ADM001', 'administrator', true, false),
  ('00000000-0000-0000-0000-000000000002', 'manager@swebuk.com', 'manager_staff', 'Cluster', 'Manager', 'Software Engineering', 'Bayero University Kano', '["Management", "Leadership", "Project Coordination"]', NULL, NULL, NULL, NULL, 'MNG001', 'manager', true, false),
  ('00000000-0000-0000-0000-000000000003', 'lecturer@swebuk.com', 'staff', 'Dr. Jane', 'Smith', 'Software Engineering', 'Bayero University Kano', '["Software Engineering", "AI", "Mentoring"]', NULL, NULL, NULL, NULL, 'LEC001', 'supervisor', true, false),
  ('00000000-0000-0000-0000-000000000004', 'leadstudent@swebuk.com', 'lead_student', 'John', 'Doe', 'Software Engineering', 'Bayero University Kano', '["React", "Node.js", "Project Management"]', 'johndoe', 'johndoe', 400, 'U20200001', NULL, NULL, true, false),
  ('00000000-0000-0000-0000-000000000005', 'deputylead@swebuk.com', 'deputy_lead', 'Alice', 'Johnson', 'Software Engineering', 'Bayero University Kano', '["Python", "Django", "Team Coordination"]', 'alicejohnson', 'alicejohnson', 300, 'U20210002', NULL, NULL, true, false),
  ('00000000-0000-0000-0000-000000000006', 'student1@swebuk.com', 'student', 'Michael', 'Brown', 'Software Engineering', 'Bayero University Kano', '["JavaScript", "HTML", "CSS"]', 'michaelbrown', 'michaelbrown', 200, 'U20220003', NULL, NULL, true, false),
  ('00000000-0000-0000-0000-000000000007', 'student2@swebuk.com', 'student', 'Sarah', 'Wilson', 'Software Engineering', 'Bayero University Kano', '["Python", "Data Analysis", "SQL"]', 'sarahwilson', 'sarahwilson', 100, 'U20230004', NULL, NULL, true, false),
  ('00000000-0000-0000-0000-000000000008', 'student3@swebuk.com', 'student', 'David', 'Taylor', 'Software Engineering', 'Bayero University Kano', '["Java", "Spring Boot", "Database Design"]', 'davidtaylor', 'davidtaylor', 300, 'U20210005', NULL, NULL, true, false);

-- Create clusters
INSERT INTO clusters (id, name, description, lead_student_id, deputy_lead_id, manager_staff_id, is_active)
OVERRIDING SYSTEM VALUE
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Web Development Cluster', 'Focus on web technologies, frameworks, and modern development practices', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', true),
  ('11111111-1111-1111-1111-111111111112', 'Mobile Development Cluster', 'Exploring mobile development with native and cross-platform technologies', '00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', true),
  ('11111111-1111-1111-1111-111111111113', 'AI & ML Cluster', 'Artificial Intelligence and Machine Learning research and projects', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000002', true);

-- Add cluster members (only regular members, leads/deputies are in cluster table)
INSERT INTO cluster_members (cluster_id, user_id, role, status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000006', 'member', 'approved'),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000008', 'member', 'approved'),
  
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0000-0000-000000000007', 'member', 'approved'),
  
  ('11111111-1111-1111-1111-111111111113', '00000000-0000-0000-0000-000000000004', 'member', 'approved');

-- Create projects
INSERT INTO projects (id, name, description, type, owner_id, cluster_id, is_public, status, github_url, technologies)
OVERRIDING SYSTEM VALUE
VALUES 
  ('22222222-2222-2222-2222-222222222221', 'Swebuk Platform', 'The main platform for Swebuk student community', 'cluster', '00000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', true, 'active', 'https://github.com/swebuk/platform', '["Next.js", "Supabase", "Tailwind CSS", "TypeScript"]'),
  ('22222222-2222-2222-2222-222222222222', 'Campus Navigation App', 'Mobile app to help students navigate the campus', 'cluster', '00000000-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111112', true, 'active', 'https://github.com/swebuk/navigation-app', '["React Native", "Node.js", "MongoDB"]'),
  ('22222222-2222-2222-2222-222222222223', 'Student Performance ML Model', 'Machine learning model to predict student performance', 'cluster', '00000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111113', true, 'active', 'https://github.com/swebuk/ml-model', '["Python", "TensorFlow", "Pandas", "Scikit-learn"]'),
  ('22222222-2222-2222-2222-222222222224', 'Personal Portfolio', 'Student''s personal portfolio website', 'personal', '00000000-0000-0000-0000-000000000007', NULL, true, 'active', NULL, '["React", "Framer Motion", "CSS"]');

-- Create blogs
INSERT INTO blogs (id, title, content, author_id, cluster_id, status, tags, published_at)
OVERRIDING SYSTEM VALUE
VALUES 
  ('33333333-3333-3333-3333-333333333331', 'Getting Started with Next.js', 'A comprehensive guide to building applications with Next.js, covering routing, API routes, and deployment strategies...', '00000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'published', '["Next.js", "React", "Web Development"]', NOW()),
  ('33333333-3333-3333-3333-333333333332', 'Introduction to Mobile Development', 'Exploring the differences between native and cross-platform mobile development, with practical examples...', '00000000-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111112', 'published', '["Mobile", "React Native", "iOS", "Android"]', NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Understanding Machine Learning Fundamentals', 'An overview of machine learning concepts, algorithms, and practical applications in real-world scenarios...', '00000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111113', 'published', '["Machine Learning", "AI", "Data Science"]', NOW()),
  ('33333333-3333-3333-3333-333333333334', 'Building a Personal Portfolio', 'Tips and tricks for creating an effective personal portfolio that showcases your skills and projects...', '00000000-0000-0000-0000-000000000007', NULL, 'published', '["Portfolio", "Web Design", "Career"]', NOW()),
  ('33333333-3333-3333-3333-333333333335', 'Best Practices for Database Design', 'Exploring normalization, indexing, and other best practices for efficient database design...', '00000000-0000-0000-0000-000000000003', NULL, 'published', '["Database", "Design", "SQL"]', NOW());

-- Create events
INSERT INTO events (id, title, description, event_date, location, organizer_id, cluster_id, max_attendees, is_public, event_type, registration_deadline)
OVERRIDING SYSTEM VALUE
VALUES 
  ('44444444-4444-4444-4444-444444444441', 'Weekly Cluster Meeting', 'Weekly meeting for Web Development Cluster members to discuss ongoing projects', NOW() + INTERVAL '7 days', 'CS Lab 1', '00000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 30, true, 'general', NOW() + INTERVAL '6 days'),
  ('44444444-4444-4444-4444-444444444442', 'Mobile App Hackathon', '24-hour hackathon focused on mobile app development', NOW() + INTERVAL '14 days', 'Main Auditorium', '00000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111112', 100, true, 'competition', NOW() + INTERVAL '13 days'),
  ('44444444-4444-4444-4444-444444444443', 'AI Workshop', 'Hands-on workshop on implementing neural networks with TensorFlow', NOW() + INTERVAL '5 days', 'AI Lab', '00000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111113', 40, true, 'workshop', NOW() + INTERVAL '4 days');