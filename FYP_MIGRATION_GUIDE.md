# FYP System Migration Guide

## Prerequisites
- Supabase project running
- Database access
- Admin access to Supabase dashboard

---

## Step-by-Step Migration

### Step 1: Backup Current Database (IMPORTANT!)
```bash
# Export current database
npx supabase db dump -f backup_before_fyp_migration.sql

# Or use Supabase Dashboard
# Projects > Your Project > Database > Backups
```

### Step 2: Review the Migration File
```bash
# View the migration
cat supabase/migrations/20251210100000_create_fyp_submissions_table.sql
```

**What it does:**
- Creates `fyp_submissions` table
- Sets up RLS policies
- Creates indexes for performance
- Adds helper function `get_fyp_submission_stats()`

### Step 3: Apply Migration

#### Option A: Reset Database (Development)
```bash
# This will reset ALL data and apply all migrations
npx supabase db reset

# Confirm when prompted
```

#### Option B: Apply Single Migration (Production)
```bash
# Apply only this migration
npx supabase migration up

# Or specify the file
npx supabase db push
```

### Step 4: Verify Migration Success
```bash
# Check if table exists
npx supabase db exec "SELECT * FROM fyp_submissions LIMIT 1;"

# Check RLS policies
npx supabase db exec "SELECT tablename, policyname FROM pg_policies WHERE tablename = 'fyp_submissions';"
```

### Step 5: Create Storage Bucket (if not exists)

#### Via Supabase Dashboard:
1. Go to Storage
2. Create new bucket: `fyp-documents`
3. Set as **Public** bucket
4. Configure policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'fyp-documents');

-- Allow public reads (optional - for downloads)
CREATE POLICY "Allow public downloads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'fyp-documents');

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'fyp-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### Via CLI:
```bash
npx supabase storage create fyp-documents
```

### Step 6: Install Required NPM Packages
```bash
npm install date-fns sonner
```

**Package purposes:**
- `date-fns`: Date formatting in submission history
- `sonner`: Toast notifications for user feedback

### Step 7: Verify Installation
```bash
# Check package.json
cat package.json | grep -E "date-fns|sonner"
```

---

## Testing the Migration

### 1. Test Database Schema
```sql
-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'fyp_submissions';

-- Expected columns:
-- id (uuid)
-- fyp_id (uuid)
-- submission_type (text)
-- title (text)
-- description (text)
-- file_url (text)
-- file_name (text)
-- file_size (bigint)
-- status (text)
-- supervisor_feedback (text)
-- submitted_at (timestamp with time zone)
-- reviewed_at (timestamp with time zone)
-- created_at (timestamp with time zone)
-- updated_at (timestamp with time zone)
```

### 2. Test RLS Policies
```sql
-- As student (should only see own submissions)
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO '<student_user_id>';
SELECT * FROM fyp_submissions;

-- As staff (should see all submissions)
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO '<staff_user_id>';
SELECT * FROM fyp_submissions;
```

### 3. Test Indexes
```sql
-- Check if indexes were created
SELECT indexname, tablename
FROM pg_indexes
WHERE tablename = 'fyp_submissions';

-- Expected indexes:
-- fyp_submissions_fyp_id_idx
-- fyp_submissions_type_idx
-- fyp_submissions_status_idx
-- fyp_submissions_submitted_at_idx
```

---

## Data Migration (If Upgrading)

### Migrate Old proposal_url and report_url

If you have existing FYPs with `proposal_url` or `report_url`, migrate them to submissions:

```sql
-- Migrate proposals
INSERT INTO fyp_submissions (
  fyp_id,
  submission_type,
  title,
  file_url,
  status,
  submitted_at
)
SELECT
  id as fyp_id,
  'proposal' as submission_type,
  title as title,
  proposal_url as file_url,
  'approved' as status,  -- Assume old proposals were approved
  created_at as submitted_at
FROM final_year_projects
WHERE proposal_url IS NOT NULL;

-- Migrate final reports
INSERT INTO fyp_submissions (
  fyp_id,
  submission_type,
  title,
  file_url,
  status,
  submitted_at
)
SELECT
  id as fyp_id,
  'final_thesis' as submission_type,
  title as title,
  report_url as file_url,
  'approved' as status,
  created_at as submitted_at
FROM final_year_projects
WHERE report_url IS NOT NULL;
```

---

## Rollback Plan

### If Something Goes Wrong

#### Option 1: Restore from Backup
```bash
# Restore the backup you created
psql $DATABASE_URL < backup_before_fyp_migration.sql
```

#### Option 2: Drop New Table
```sql
-- Remove the new table and keep old system
DROP TABLE IF EXISTS fyp_submissions CASCADE;
```

#### Option 3: Revert Migration
```bash
# Roll back to previous migration
npx supabase migration revert
```

---

## Post-Migration Tasks

### 1. Update User Academic Levels
Ensure Level 400 students have correct academic_level:

```sql
-- Check current values
SELECT id, full_name, academic_level
FROM profiles
WHERE role = 'student';

-- Update if needed
UPDATE profiles
SET academic_level = '400'
WHERE role = 'student' AND academic_level IN ('level_400', '4', 'Level 400');
```

### 2. Assign Test Supervisors
```sql
-- Assign supervisors to existing FYPs without one
UPDATE final_year_projects
SET supervisor_id = (
  SELECT id FROM profiles WHERE role = 'staff' LIMIT 1
)
WHERE supervisor_id IS NULL;
```

### 3. Create Test Data (Optional)
```sql
-- Insert test submission
INSERT INTO fyp_submissions (
  fyp_id,
  submission_type,
  title,
  description,
  status
)
SELECT
  id as fyp_id,
  'progress_report' as submission_type,
  'Test Progress Report' as title,
  'This is a test submission' as description,
  'pending' as status
FROM final_year_projects
LIMIT 1;
```

---

## Verification Checklist

After migration, verify:

- [ ] `fyp_submissions` table exists
- [ ] RLS policies are active
- [ ] Indexes are created
- [ ] Storage bucket `fyp-documents` exists
- [ ] Storage policies are configured
- [ ] NPM packages installed (date-fns, sonner)
- [ ] Student dashboard loads without errors
- [ ] Staff dashboard loads without errors
- [ ] Admin dashboard loads without errors
- [ ] File upload works
- [ ] Submission creation works
- [ ] Review/feedback works
- [ ] Supervisor assignment works

---

## Common Migration Issues

### Issue 1: Migration File Not Found
**Solution:**
```bash
# Ensure file exists
ls -la supabase/migrations/20251210000000_create_fyp_submissions_table.sql

# If missing, recreate from FYP_IMPLEMENTATION_SUMMARY.md
```

### Issue 2: RLS Policy Violations
**Error:** "new row violates row-level security policy"

**Solution:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'fyp_submissions';

-- Verify policies exist
SELECT * FROM pg_policies WHERE tablename = 'fyp_submissions';
```

### Issue 3: Foreign Key Constraint Fails
**Error:** "violates foreign key constraint"

**Solution:**
```sql
-- Ensure referenced FYP exists
SELECT id FROM final_year_projects WHERE id = '<fyp_id>';

-- Check profiles table
SELECT id FROM profiles WHERE id = '<user_id>';
```

### Issue 4: Storage Bucket Not Found
**Error:** "Bucket not found: fyp-documents"

**Solution:**
```bash
# Create bucket via CLI
npx supabase storage create fyp-documents

# Or via dashboard: Storage > New Bucket
```

---

## Performance Optimization

### After Migration:

1. **Analyze Tables**
```sql
ANALYZE fyp_submissions;
ANALYZE final_year_projects;
```

2. **Vacuum Tables**
```sql
VACUUM ANALYZE fyp_submissions;
```

3. **Monitor Query Performance**
```sql
-- Enable query timing
\timing

-- Test common queries
SELECT * FROM fyp_submissions WHERE fyp_id = '<test_id>';
SELECT * FROM fyp_submissions WHERE status = 'pending';
```

---

## Support

### Logs to Check
- Supabase Dashboard > Logs > Postgres Logs
- Supabase Dashboard > Logs > API Logs
- Browser Console (F12)
- Next.js Terminal Output

### Useful Commands
```bash
# Check Supabase status
npx supabase status

# View database URL
npx supabase db show

# Inspect table
npx supabase db exec "SELECT * FROM fyp_submissions LIMIT 5;"
```

---

## Success Criteria

Migration is successful when:
1. ✅ No errors in migration output
2. ✅ Table and indexes created
3. ✅ RLS policies active
4. ✅ Student can submit documents
5. ✅ Staff can review submissions
6. ✅ Admin can assign supervisors
7. ✅ File uploads work
8. ✅ No console errors

---

**Estimated Migration Time:** 5-10 minutes

**Downtime Required:** None (if using Option B)

**Rollback Time:** < 2 minutes
