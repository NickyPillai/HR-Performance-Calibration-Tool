# Performance Calibration Tool

A lightweight SaaS prototype that gives HR managers and leadership an eagle-eye view of performance ratings across the organisation, helping identify deviations and course-correct before appraisals are finalised.

---

## Problem

Most organisations lack visibility into how performance ratings are distributed across teams and departments. Without a centralised view, it's nearly impossible to spot deviations from the planned appraisal curve until it's too late. This leads to:

- **Rating inflation or deflation** going unnoticed across departments
- **Inconsistent calibration** between managers and teams
- **No early warning system** when actual ratings drift from the planned bell curve
- **Manual, error-prone processes** using spreadsheets that don't scale

## Product Vision

To provide a **simple, accessible space** for HR managers and people in leadership who do not have performance management tools or platforms at their disposal. This tool delivers an eagle-eye view of ratings and helps in course correction for all deviations — without the complexity or cost of enterprise software.

## Solution

A lightweight web application that enables HR teams to:

- **Get an eagle-eye view** of all ratings and deviations from pre-set thresholds via an interactive bell curve
- **Check department-wise deviations** to identify specific areas needing course correction
- **Update ratings inline** and export reports for further action
- **Save and manage multiple datasets** (e.g., "Engineering Q1", "Sales FY25") to track calibration over time

---

## Key Features

| Feature | What it does |
|---------|-------------|
| **Excel/CSV Upload** | Drag-and-drop employee data from existing spreadsheets — no manual entry needed |
| **Bell Curve Visualisation** | Interactive chart comparing actual vs. target rating distribution with deviation highlights |
| **Department & Manager Filters** | Drill down into specific teams to spot localised deviations |
| **Inline Editing** | Update individual ratings directly in the table; freeze rows to lock finalised ratings |
| **Dataset Management** | Save, load, update, and delete named datasets for different review cycles or business units |
| **Deviation Alerts** | Configurable thresholds that flag when any rating bucket drifts too far from target |
| **Dark Mode** | Easy on the eyes for those long calibration sessions |
| **Role-Based Access** | Admin and user roles to control who can manage accounts vs. who can calibrate |

---

## Tech Stack & Architecture

> _A high-level overview — no deep technical knowledge required._

The tool is built as a **modern web application** with two main parts:

```
┌─────────────────────────────────────────────────┐
│                   User's Browser                │
│                                                 │
│   React Frontend (what you see and interact     │
│   with — tables, charts, buttons, forms)        │
└──────────────────┬──────────────────────────────┘
                   │  Talks to each other
                   │  over the internet
┌──────────────────▼──────────────────────────────┐
│               Backend Server                    │
│                                                 │
│   Express API (handles logic — authentication,  │
│   saving data, loading datasets, permissions)   │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│               Database (Supabase)               │
│                                                 │
│   PostgreSQL (stores all employee data,         │
│   user accounts, saved datasets, settings)      │
└─────────────────────────────────────────────────┘
```

| Layer | Technology | Why |
|-------|-----------|-----|
| **User Interface** | React + Tailwind CSS | Fast, responsive UI that works on any device |
| **Charts** | Recharts | Clean, interactive bell curve visualisations |
| **Backend** | Node.js + Express | Lightweight server handling all business logic |
| **Database** | PostgreSQL (Supabase) | Reliable, scalable data storage in the cloud |
| **Authentication** | JWT tokens | Secure login without third-party dependencies |
| **Hosting** | Vercel | One-click deployment with zero server management |

**In plain terms:** The user opens the app in a browser, uploads a spreadsheet, and the system stores the data securely in a cloud database. All the chart calculations, filtering, and deviation detection happen in real time as users interact with the tool.

---

## Impact & Metrics

### Efficiency Gains

| Metric | Before | After |
|--------|--------|-------|
| **Time to identify rating deviations** | Hours of manual spreadsheet analysis | Seconds — visible immediately on upload |
| **Calibration cycle turnaround** | Multiple rounds of emails and spreadsheet exchanges | Single session with real-time editing |
| **Cross-department visibility** | Siloed, manager-level only | Organisation-wide with one-click filters |

### Key Success Metrics

- **Reduction in calibration cycle time** — Target: 60-70% reduction by eliminating manual spreadsheet reviews
- **Deviation detection rate** — 100% of rating buckets exceeding threshold are flagged automatically (vs. often missed manually)
- **User adoption** — Number of datasets saved and calibration sessions completed per review cycle
- **Data accuracy** — Reduction in post-calibration corrections due to earlier visibility into distribution issues

### Qualitative Impact

- **Democratises access** to performance analytics for teams without enterprise HR platforms
- **Reduces bias** by making rating distributions transparent across departments
- **Empowers HR** to have data-backed conversations with managers about rating adjustments
- **Supports compliance** by maintaining auditable snapshots of calibration states across review cycles

---

### Sample Data

Use the **"Download Sample Template"** button in the app to get a pre-formatted Excel file, fill it with your data, and upload.

---

## Deployment

The app is configured for **one-click deployment on Vercel**. Connect your repository, set environment variables, and deploy — no server management required.

---

## Roadmap 

- Goal and Performance cycle setting ability
- Email notifications when deviations exceed thresholds
- Historical trend analysis across multiple review cycles
- Integration with HRIS platforms (BambooHR, Workday, etc.)
- Team-level drill-down with manager self-service views

---

*Built as a lightweight prototype to validate the need for accessible performance calibration tools in organisations of all sizes.*
