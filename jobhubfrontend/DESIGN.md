# JobHub - Frontend Architecture & Design

## Overview
JobHub is an intelligent job portal connecting job seekers and employers through advanced recruitment features. It provides AI-based matching, candidate profile parsing, and job ingestion from multiple sources.

## Tech Stack
Based on the `PROJECT PROPOSAL 6th sem new.pdf`:
- **Frontend Framework:** Next.js (React JS) using App Router.
- **Backend:** Spring Boot (Java) - Expected at `http://localhost:8080/api`
- **AI/ML:** Python, PyTorch (likely exposed via internal microservices or the Spring Boot API)
- **Database:** MongoDB, RedisDB, PostgreSQL
- **UI & Styling:** Tailwind CSS, shadcn/ui.
- **State Management:** Zustand (Client state), React Query (Server state / Data fetching).
- **Forms & Validation:** react-hook-form, Zod.

## Project Structure
- `app/(marketing)`: Landing page and public info.
- `app/candidate`: Candidate portal (Dashboard, Profile, Job Matches).
- `app/recruiter`: Recruiter portal (Dashboard, Post Job, Search Candidates).
- `components/ui`: Reusable UI components from shadcn/ui.
- `components/layout`: Shared layouts (Navbars, Sidebars).
- `lib`: Utility functions and `apiClient` setup.
- `types`: Domain models (Job, Candidate, Application, MatchScore).

## Key Features to Implement
1. **Candidate Profiling**:
   - Extract candidates' social and professional information (GitHub, Portfolio).
   - Profile anonymization to prevent bias.
2. **Job Postings (Recruiter)**:
   - Create and manage job advertisements.
3. **AI Matching Dashboard**:
   - For Candidates: View personalized job recommendations based on profiles and social data.
   - For Recruiters: View suitable candidates sorted by matching scores.
4. **Notifications**:
   - System to notify top K matching candidates when a new job is posted.

## Development Workflow
1. Use `pnpm run dev` to start the Next.js frontend on port 3000.
2. The `lib/api.ts` is pre-configured to communicate with the Spring Boot backend on port 8080.
3. Ensure you validate form inputs heavily with Zod to maintain strict data contracts with the Java backend.
