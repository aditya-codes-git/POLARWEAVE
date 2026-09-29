# POLARWEAVE

> **"From fragmented evidence to connected polar knowledge."**

[![Smart India Hackathon 2024](https://img.shields.io/badge/SIH26063-MoES%20%2F%20NCPOR-0284C7.svg)](https://ncpor.res.in)
[![Status](https://img.shields.io/badge/Status-Hackathon--Ready-emerald.svg)]()
[![Stack](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20Tailwind-slate.svg)]()
[![AI](https://img.shields.io/badge/Engine-Gemini%20API%20%2B%20Zod%20Schemas-blue.svg)]()

**POLARWEAVE** is a modern, high-precision scientific SaaS knowledge infrastructure built for the **Ministry of Earth Sciences (MoES)** and the **National Centre for Polar and Ocean Research (NCPOR)** for **SIH26063**: *Integrated Polar Science Outreach, Knowledge Repository and Media Dissemination Portal*.

---

## The Core Product Differentiator

Polar research does not arrive as a clean database record. It arrives as PDFs, Word documents, sensor CSV spreadsheets, field photographs, audio recordings, and video tapes.

POLARWEAVE transforms this heterogeneous material into structured, verified, interconnected knowledge while preserving an immutable trace back to the original physical evidence:

```
UNSTRUCTURED SCIENTIFIC MATERIAL
              ↓
    MULTIMODAL INGESTION
(PDF, DOCX, CSV/XLSX, JPG, MP4)
              ↓
    INTELLIGENT STRUCTURING
   (Gemini + Zod Validation)
              ↓
      HUMAN VERIFICATION
   (Researcher 3-Column Review)
              ↓
        EVIDENCE LINKING
(Report p.17 ↔ CSV row 42 ↔ Video 12:43 ↔ EXIF Photo)
              ↓
      CONNECTED KNOWLEDGE
    (React Flow Semantic Graph)
              ↓
AUDIENCE-SPECIFIC DISSEMINATION
(Evidence-Locked Outreach Studio)
```

---

## Hero Feature: Evidence Trace

The single most important differentiator of POLARWEAVE is **Evidence Trace**. When evaluating any extracted scientific fact, the user can click **"Show me why you believe this"**:

```
CLAIM
"Surface ice measurement recorded at 1.8 m along Larsemann fast-ice line"
Extraction Confidence: 94% (HIGH) | Status: VERIFIED

SUPPORTED BY:
├── 1. Report:   report_expedition_45_final.pdf · Page 17 (Exact excerpt match)
├── 2. Dataset:  ice_measurements_larsemann.csv · Row #42 (core_id=IC-45-42, depth=21.0m, thickness=1.80m, temp=-14.8°C)
├── 3. Video:    scientist_interview.mp4 · 12:43–12:58 (Timestamp-synced audio transcript)
└── 4. Image:    IMG_2041.jpg (EXIF GPS -69.4089°S, 76.1872°E at Bharati Station margin)
```

---

## Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Web App** | React 18, Vite, TypeScript, React Router, Tailwind CSS, Lucide React, Framer Motion, TanStack Query, React Hook Form, Zod, `@xyflow/react` (React Flow), Recharts, Leaflet / React Leaflet |
| **Backend API** | Node.js, Express, TypeScript, Zod, Multer memory storage, CORS, `pdf-parse`, `mammoth` (DOCX), `xlsx` (SheetJS) |
| **AI Structuring** | Google Gemini API (`@google/generative-ai`), typed Zod validation schemas (`ScientificStructuringOutputSchema`), cross-modal linking engine |
| **Database & Auth** | Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS), `pgvector` ready |
| **Dual Reliability Engine** | Live Cloud Mode + High-Fidelity Local Demo Mode (`VITE_DEMO_MODE=true` / automatic fallback) |

---

## Monorepo Project Structure

```
POLARWEAVE/
├── apps/
│   ├── web/                     # React + Vite frontend application
│   │   ├── src/
│   │   │   ├── components/      # UI components, AppShell, EvidenceDrawer, CommandPalette
│   │   │   ├── data/            # Local high-fidelity demo dataset
│   │   │   ├── lib/             # API client, Supabase client, utilities
│   │   │   ├── pages/
│   │   │   │   ├── public/      # LandingPage, ExplorePage
│   │   │   │   ├── auth/        # LoginPage, SignupPage
│   │   │   │   └── workspace/   # Dashboard, Ingest, Processing, Review, EvidenceTrace,
│   │   │   │                    # KnowledgeGraph, Expeditions, Datasets, Media, Outreach, Search
│   │   │   └── routes/          # AppRoutes.tsx
│   └── api/                     # Node.js + Express backend service
│       └── src/
│           ├── ai/              # Gemini structured extraction, linking, outreach, search
│           ├── config/          # Zod environment validation
│           ├── controllers/     # Ingest, Knowledge, Evidence, Review, Search, Outreach
│           ├── db/              # Supabase client & in-memory demo repository
│           ├── ingestion/       # Deterministic parsers (PDF, DOCX, CSV/XLSX)
│           └── routes/          # Express route declarations
├── packages/
│   ├── types/                   # Shared TypeScript models, DTOs, and Zod schemas
│   └── config/                  # Shared configurations
├── supabase/
│   └── migrations/              # SQL migrations (Schema, RLS, Indexes, Demo Seeds)
├── .env.example
├── package.json
└── README.md
```

---

## 3-4 Minute SIH Demonstration Script

Follow this script to demonstrate POLARWEAVE to judges:

1. **Step 1: The Problem**
   - Open `http://localhost:5173`.
   - Show the hero tagline: *"From fragmented evidence to connected polar knowledge."*
   - Highlight: *"Polar research does not arrive as a clean database record. It arrives as PDFs, spreadsheets, and video tapes."*
2. **Step 2: Multimodal Ingestion Center**
   - Click **"Open Knowledge Workspace"** and navigate to **/workspace/ingest**.
   - Show the staged research package: `report.pdf`, `observations.csv`, `field_notes.docx`, `IMG_2041.jpg`, and `scientist_interview.mp4`.
3. **Step 3: Intelligence Pipeline**
   - Click **"Process Materials"**.
   - The animated pipeline displays live parsing stages: Files received ➔ Document parsing ➔ Entity detection ➔ Observation structuring ➔ Cross-file linking.
4. **Step 4: Human-in-the-Loop Verification**
   - Click **"Inspect in Review Queue"** (`/workspace/review/obs_ice_thickness`).
   - Show the 3-column verification view:
     - Left: Source excerpt (Report p.17, CSV row 42, Video 12:43).
     - Center: Extracted structured observation (`1.8 m fast-ice thickness`).
     - Right: Researcher sign-off (Approve, Edit, Reject).
   - Click **"Approve & Verify"**.
5. **Step 5: The WOW Feature — Evidence Trace**
   - Open **Evidence Trace** (`/workspace/evidence`).
   - Demonstrate the 4-way cross-modal evidence chain.
   - Show that every scientific claim can answer: *"Show me why you believe this."*
6. **Step 6: Connected Knowledge Graph**
   - Open **Knowledge Graph** (`/workspace/knowledge`).
   - Demonstrate the React Flow semantic network linking Expedition 45 ➔ Bharati Station ➔ Observation ➔ Dataset ➔ Interview.
7. **Step 7: Ask the Evidence (Grounded Q&A)**
   - Click **"Ask the Evidence"** in the topbar or press `⌘K`.
   - Ask: *"What evidence supports the ice observation from Expedition 45?"*
   - Show that the system returns a grounded response with direct source links without hallucination.
8. **Step 8: Outreach Studio (Dissemination)**
   - Open **Outreach Studio** (`/workspace/outreach`).
   - Select format **"Student Explainer"** and click **"Generate Audience Content"**.
   - Show the generated student-friendly article with locked citation markers (`[1]`, `[2]`, `[3]`).
   - Click a citation marker in the source rail to view the exact excerpt and page/row number.

---

## Getting Started Locally

### Prerequisites
- Node.js >= 18.0.0 (Tested on Node.js v25)
- npm >= 9.0.0

### 1. Clone & Install
```bash
git clone https://github.com/aditya-codes-git/POLARWEAVE.git
cd POLARWEAVE
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(POLARWEAVE includes automatic high-fidelity Demo Mode if cloud API keys are left blank!)*

### 3. Build Monorepo
```bash
npm run build
```

### 4. Run Development Servers
```bash
npm run dev
```
- **Web Portal:** `http://localhost:5173`
- **API Server:** `http://localhost:5000`
- **API Health:** `http://localhost:5000/api/health`

### 5. Run Automated Test Suite
```bash
node --import tsx --test apps/api/test/smoke.test.ts
```

---

## Supabase Database Setup & Migrations

If connecting to an active Supabase project:
1. Provide `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`.
2. Apply the SQL migrations located in `supabase/migrations/`:
   - `20260330000001_initial_polarweave_schema.sql` (Creates all tables, enums, RLS policies, and indexes).
   - `20260330000002_seed_demo_records.sql` (Seeds authentic demonstration records tagged with `demo=true`).
3. Create the storage buckets:
   - `research-documents`
   - `datasets`
   - `images`
   - `videos`

---

## License & Attribution

Built for the **Ministry of Earth Sciences (MoES)** and the **National Centre for Polar and Ocean Research (NCPOR)** for Smart India Hackathon (SIH26063).
