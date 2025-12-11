# FYP System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FYP MANAGEMENT SYSTEM                   │
│                    (Final Year Project Module)                  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
         ┌──────▼──────┐  ┌─────▼─────┐  ┌──────▼──────┐
         │   STUDENT   │  │   STAFF   │  │    ADMIN    │
         │  DASHBOARD  │  │ DASHBOARD │  │  DASHBOARD  │
         └─────────────┘  └───────────┘  └─────────────┘
```

---

## Component Architecture

### 1. Student Dashboard Flow
```
┌─────────────────────────────────────────────────────────────┐
│  /dashboard/student/fyp                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Header: Project Title + Supervisor Info            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌────────────────────┐  ┌────────────────────────────┐   │
│  │   MAIN CONTENT     │  │      SIDEBAR               │   │
│  ├────────────────────┤  ├────────────────────────────┤   │
│  │                    │  │  • Project Overview        │   │
│  │  Submission Form   │  │  • Status & Progress       │   │
│  │  ├─ Type Selector  │  │  • Supervisor Card         │   │
│  │  ├─ Title Input    │  │  • Submission Stats        │   │
│  │  ├─ Description    │  │  • Latest Feedback         │   │
│  │  └─ File Upload    │  │                            │   │
│  │                    │  └────────────────────────────┘   │
│  ├────────────────────┤                                    │
│  │ Submission History │                                    │
│  │  Table with:       │                                    │
│  │  - Document name   │                                    │
│  │  - Type & Date     │                                    │
│  │  - Status badges   │                                    │
│  │  - Actions         │                                    │
│  ├────────────────────┤                                    │
│  │ Comments Section   │                                    │
│  └────────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
```

### 2. Staff Dashboard Flow
```
┌─────────────────────────────────────────────────────────────┐
│  /dashboard/staff/fyp                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Metrics Cards (4 cards)                             │  │
│  │  [Total Assigned] [Pending Reviews] [In Progress]    │  │
│  │  [Completed]                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  All Projects List                                   │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │ [Avatar] Project Title                      │    │  │
│  │  │          Student • Date • Supervisor        │    │  │
│  │  │                            [Status Badge]   │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │  (Clickable - goes to detail page)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  /dashboard/staff/fyp/[id]                                  │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────┐  ┌────────────────────────────┐   │
│  │   MAIN CONTENT     │  │      SIDEBAR               │   │
│  ├────────────────────┤  ├────────────────────────────┤   │
│  │ Project Description│  │  • Student Info Card       │   │
│  ├────────────────────┤  │  • Supervisor Card         │   │
│  │ Submissions List   │  │  • Grade Card              │   │
│  │  [Review Button]   │  │  • Action Buttons          │   │
│  ├────────────────────┤  │    - Update Status         │   │
│  │ Your Feedback      │  │    - Assign Grade          │   │
│  ├────────────────────┤  └────────────────────────────┘   │
│  │ Comments           │                                    │
│  └────────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
```

### 3. Admin Dashboard Flow
```
┌─────────────────────────────────────────────────────────────┐
│  /dashboard/admin/fyp                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  System Metrics (6 cards)                            │  │
│  │  [Total] [Pending] [Unassigned] [In Progress]        │  │
│  │  [Completed] [Pending Submissions]                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Supervisor Workload Distribution                    │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │ [Avatar] Dr. Name                           │    │  │
│  │  │          [Total: X] [Active: Y] [Done: Z]   │    │  │
│  │  │          [Progress Bar ═════════════]       │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ⚠️ Unassigned Projects (if any)                    │  │
│  │  [Avatar] Project • Student • Date  [Assign Button]│ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  All Projects (System-wide)                          │  │
│  │  [Filterable list of all projects]                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Student Submission Flow
```
┌─────────┐    Submit     ┌─────────────┐    Notification    ┌────────────┐
│ Student │──────────────>│ fyp_        │───────────────────>│ Supervisor │
│         │    Document   │ submissions │                    │  (Staff)   │
└─────────┘               └─────────────┘                    └────────────┘
     │                          │                                    │
     │                          │                                    │
     │    View Status          │         Review & Feedback          │
     │<────────────────────────┼────────────────────────────────────┘
     │                          │
     │                          ▼
     │                    ┌─────────────┐
     │                    │   Status:   │
     │                    │   pending   │
     │                    │   approved  │
     │                    │   needs_rev │
     │                    │   rejected  │
     │                    └─────────────┘
     │
     ▼
┌──────────────────┐
│ Submission       │
│ History Display  │
└──────────────────┘
```

### Admin Supervisor Assignment Flow
```
┌───────┐   View Unassigned   ┌────────────────┐
│ Admin │────────────────────>│ Unassigned FYPs│
└───┬───┘                     └────────────────┘
    │                               │
    │  Select Supervisor            │
    │  from List                    │
    ▼                               ▼
┌───────────────┐     Assign    ┌────────────────┐
│  Supervisor   │<──────────────│      FYP       │
│     List      │               │    Project     │
└───────────────┘               └────────────────┘
                                       │
                                       │ Notification
                                       ▼
                              ┌────────────────┐
                              │    Student     │
                              │   Notified     │
                              └────────────────┘
```

---

## Database Relationships

```
┌─────────────┐
│  profiles   │
│             │
│ id          │───────┐
│ role        │       │
│ academic_lv │       │
└─────────────┘       │
                      │ student_id
                      ▼
              ┌───────────────────┐
              │ final_year_       │
              │ projects          │
              │                   │
              │ id                │──────┐
              │ student_id        │      │
              │ supervisor_id ────┼──┐   │
              │ title             │  │   │ fyp_id
              │ status            │  │   │
              └───────────────────┘  │   │
                      │              │   │
                      │ supervisor_id│   │
                      ▼              │   ▼
              ┌─────────────┐        │ ┌──────────────┐
              │  profiles   │        │ │ fyp_         │
              │  (staff)    │        │ │ submissions  │
              │             │        │ │              │
              │ id          │◄───────┘ │ id           │
              │ role=staff  │          │ fyp_id       │
              └─────────────┘          │ type         │
                                       │ status       │
                                       │ file_url     │
                                       │ feedback     │
                                       └──────────────┘
```

---

## Permission Matrix

| Feature                    | Student | Staff | Admin |
|---------------------------|---------|-------|-------|
| Submit FYP Proposal       | ✅      | ❌    | ❌    |
| Upload Documents          | ✅      | ❌    | ❌    |
| View Own Submissions      | ✅      | ❌    | ❌    |
| Review Submissions        | ❌      | ✅    | ✅    |
| Provide Feedback          | ❌      | ✅    | ✅    |
| View Assigned Projects    | ❌      | ✅    | ✅    |
| View All Projects         | ❌      | ❌    | ✅    |
| Assign Supervisors        | ❌      | ❌    | ✅    |
| View Workload             | ❌      | ❌    | ✅    |
| Manage Unassigned         | ❌      | ❌    | ✅    |
| Update Project Status     | ❌      | ✅    | ✅    |
| Assign Grades             | ❌      | ✅    | ✅    |

---

## Technology Stack

```
┌──────────────────────────────────────┐
│         FRONTEND (Next.js)           │
├──────────────────────────────────────┤
│  • React Components (TSX)            │
│  • Server Components & Client        │
│  • Tailwind CSS + shadcn/ui          │
│  • Form Handling (FormData)          │
│  • Toast Notifications (sonner)      │
│  • Date Formatting (date-fns)        │
└──────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│      SERVER ACTIONS (Next.js)        │
├──────────────────────────────────────┤
│  • fyp-actions.ts (shared)           │
│  • fyp-student-actions.ts            │
│  • fyp-staff-actions.ts              │
│  • fyp-admin-actions.ts              │
└──────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│     SUPABASE (Backend)               │
├──────────────────────────────────────┤
│  • PostgreSQL Database               │
│  • Row Level Security (RLS)          │
│  • Storage (File Uploads)            │
│  • Authentication                    │
│  • Real-time Subscriptions           │
└──────────────────────────────────────┘
```

---

## State Management

### Server State (React Query Pattern)
```
┌─────────────┐     Fetch      ┌──────────────┐
│   Page      │───────────────>│ Server       │
│ Component   │                │ Actions      │
└─────────────┘                └──────────────┘
      │                              │
      │                              │
      │  Display Data                │  Query DB
      │<─────────────────────────────┤
      │                              │
      │  User Action                 │
      │──────────────────────────────>
      │                              │
      │  Refresh (revalidatePath)    │
      │<─────────────────────────────┤
      │                              ▼
      └──────────────────────> [Updated Data]
```

### Client State (useState)
- Modal open/close states
- Form input values
- Selection states
- Loading indicators

---

## File Upload Flow

```
┌─────────┐              ┌──────────────┐
│ Student │   Select     │  File Input  │
│         │─────────────>│  Component   │
└─────────┘              └──────────────┘
                                │
                                │ File Selected
                                ▼
                         ┌──────────────┐
                         │   FormData   │
                         │   Created    │
                         └──────────────┘
                                │
                                │ Submit
                                ▼
                    ┌───────────────────────┐
                    │  submitFYPDocument()  │
                    │  Server Action        │
                    └───────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
    ┌─────────────────────┐       ┌─────────────────────┐
    │ Upload to Storage   │       │ Create DB Record    │
    │ (Supabase Storage)  │       │ (fyp_submissions)   │
    └─────────────────────┘       └─────────────────────┘
                │                               │
                │ Get publicUrl                 │
                └───────────────┬───────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Save file_url   │
                       │ in submissions  │
                       └─────────────────┘
                                │
                                ▼
                         [Success Response]
```

---

## Deployment Checklist

1. ✅ Run database migration
2. ✅ Configure Supabase storage bucket permissions
3. ✅ Verify RLS policies are active
4. ✅ Test file upload limits
5. ✅ Configure environment variables
6. ✅ Test each role's access
7. ✅ Verify email notifications (if enabled)
8. ✅ Check mobile responsiveness
9. ✅ Test dark mode
10. ✅ Performance optimization

---

**System Status**: ✅ PRODUCTION READY

All components are modular, tested, and follow Next.js 14 best practices.
