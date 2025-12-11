# FYP System - Quick Start Guide

## 🚀 Getting Started

### Step 1: Run Database Migration
```bash
npx supabase db reset
```

### Step 2: Install Dependencies (if needed)
```bash
npm install date-fns sonner
```

### Step 3: Start Development Server
```bash
npm run dev
```

---

## 📍 Dashboard URLs

### Student Dashboard
```
/dashboard/student/fyp
```
- **Access**: Level 400 students only
- **Features**: Submit documents, view submissions, track progress, communicate with supervisor

### Staff Dashboard
```
/dashboard/staff/fyp
/dashboard/staff/fyp/[projectId]
```
- **Access**: Staff role
- **Features**: Review submissions, provide feedback, track assigned projects

### Admin Dashboard
```
/dashboard/admin/fyp
```
- **Access**: Admin role only
- **Features**: Assign supervisors, monitor all projects, view workload distribution

---

## 🎭 User Roles & Capabilities

### Student
- ✅ Submit project proposal
- ✅ Upload progress reports
- ✅ Upload chapter drafts
- ✅ Submit final thesis
- ✅ View supervisor feedback
- ✅ Track submission status
- ❌ Cannot assign supervisors
- ❌ Cannot review other projects

### Staff/Supervisor
- ✅ View assigned projects
- ✅ Review student submissions
- ✅ Approve/reject submissions
- ✅ Provide feedback
- ✅ Track student progress
- ✅ Update project status
- ❌ Cannot assign supervisors (admin only)

### Admin
- ✅ All staff capabilities
- ✅ Assign supervisors to projects
- ✅ View ALL projects system-wide
- ✅ View supervisor workload
- ✅ Manage unassigned projects
- ✅ System-wide oversight

---

## 📝 Submission Types

1. **Project Proposal** - Initial project idea and scope
2. **Progress Report** - Regular updates on project progress
3. **Chapter Draft** - Individual chapters (1-3)
4. **Final Thesis** - Complete final document

---

## 🎨 Status Indicators

### Project Status
- `proposal_submitted` - Initial proposal submitted
- `proposal_approved` - Proposal has been approved
- `in_progress` - Actively working on project
- `ready_for_review` - Ready for final review
- `completed` - Project finished and graded
- `rejected` - Proposal was rejected

### Submission Status
- `pending` - Awaiting supervisor review
- `approved` - Submission accepted
- `needs_revision` - Changes requested
- `rejected` - Submission rejected

---

## 🔧 Quick Testing

### Test as Student
1. Navigate to `/dashboard/student/fyp`
2. Ensure user profile has `academic_level: "400"` or `"level_400"`
3. Submit a proposal
4. Upload documents
5. View submission history

### Test as Staff
1. Navigate to `/dashboard/staff/fyp`
2. View assigned projects
3. Click on a project to manage
4. Review pending submissions
5. Provide feedback

### Test as Admin
1. Navigate to `/dashboard/admin/fyp`
2. View system metrics
3. Assign supervisors to unassigned projects
4. Monitor supervisor workload
5. Access any project

---

## 🐛 Common Issues & Solutions

### Issue: "Access Restricted" for Level 400 students
**Solution**: Check `profiles` table - `academic_level` must be `"400"` or `"level_400"`

### Issue: Can't see FYP menu
**Solution**: Ensure navigation includes FYP link for Level 400 students

### Issue: Submissions not showing
**Solution**: Run migration - table `fyp_submissions` must exist

### Issue: "Unauthorized" when reviewing
**Solution**: Check user role in `profiles` table (must be "staff" or "admin")

### Issue: File upload fails
**Solution**: Verify Supabase storage bucket `fyp-documents` exists and has correct policies

---

## 📦 Database Schema Reference

### Tables
- `final_year_projects` - Main FYP projects
- `fyp_submissions` - Document submissions (NEW)
- `fyp_comments` - Communication between student and supervisor
- `profiles` - User information (includes academic_level)

### Key Relationships
```
profiles (student) → final_year_projects (student_id)
profiles (supervisor) → final_year_projects (supervisor_id)
final_year_projects → fyp_submissions (fyp_id)
final_year_projects → fyp_comments (fyp_id)
```

---

## 🎯 Feature Checklist

### ✅ Implemented
- [x] Database schema with submissions tracking
- [x] Student dashboard with submission form
- [x] Staff dashboard with review interface
- [x] Admin dashboard with supervisor management
- [x] Role-based access control
- [x] File upload functionality
- [x] Status tracking and feedback
- [x] Responsive design (mobile-friendly)
- [x] Dark mode support

### 🔄 Optional Enhancements
- [ ] Email notifications
- [ ] Real-time chat
- [ ] File versioning
- [ ] PDF export
- [ ] Analytics charts
- [ ] Bulk operations

---

## 📞 Support

### File Structure Reference
- **Actions**: `lib/supabase/fyp-*-actions.ts`
- **Components**: `components/fyp/[role]/`
- **Pages**: `app/dashboard/[role]/fyp/`
- **Migration**: `supabase/migrations/20251210100000_create_fyp_submissions_table.sql`

### Key Functions
- **Student**: `getStudentFYPWithSubmissions()`, `submitFYPDocument()`
- **Staff**: `getStaffFYPDetails()`, `reviewFYPSubmission()`
- **Admin**: `assignSupervisorToFYP()`, `getSupervisorWorkload()`

---

## 🎓 Tips

1. **Always check user role** before accessing role-specific pages
2. **Use revalidatePath()** after mutations to refresh data
3. **Handle errors gracefully** with toast notifications
4. **Test with different roles** to ensure proper access control
5. **Keep file sizes reasonable** (Max 25MB recommended)

---

**Ready to use!** Start by running the migration, then test each role's dashboard.

For detailed information, see `FYP_IMPLEMENTATION_SUMMARY.md`
