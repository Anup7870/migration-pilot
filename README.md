# MigrationPilot 🚀

> Autonomous cross-framework codebase migration prototype powered by **Meta Muse AI** with deterministic compiler verification and self-healing.

**Author:** Anup Kumar (Associate System Engineer at Tata Consultancy Services - TCS)  
**Event:** Meta AI Hackathon

---

## 📋 Table of Contents
1. [What is MigrationPilot?](#-what-is-migrationpilot)
2. [How the Pipeline Works](#-how-the-pipeline-works)
3. [Repository Layout](#-repository-layout)
4. [Step-by-Step Setup Guide](#-step-by-step-setup-guide)
   - [Prerequisites](#prerequisites)
   - [Step 1: Clone the Repository](#step-1-clone-the-repository)
   - [Step 2: Backend Setup & Server Start](#step-2-backend-setup--server-start)
   - [Step 3: Frontend Setup & Dashboard Start](#step-3-frontend-setup--dashboard-start)
   - [Step 4: Optional Standalone CLI Test](#step-4-optional-standalone-cli-test)
5. [API Endpoints](#-api-endpoints)
6. [Tech Stack](#-tech-stack)

---

## 📌 What is MigrationPilot?

Migrating an entire codebase between frameworks or languages manually requires weeks of repetitive developer labor and introduces regression bugs. Standard single-file LLM assistants fail at repository scale: they lack global context, hallucinate types, break relative import trees, and provide no guarantee that the code actually compiles.

**MigrationPilot** converts whole repositories across stacks through a closed-loop pipeline:
- **Whole-Repo AST Ingestion:** Scans global import trees and cross-file dependencies.
- **Batch Translation:** Converts components across frameworks using **Meta Muse AI**.
- **Sandbox Verification:** Executes target compiler checks (`tsc --noEmit`) in an isolated environment.
- **Automated Self-Healing Loop:** Feeds compiler diagnostic logs directly back into the model to patch failing lines until the build exits with zero errors.

*Current Proof of Concept:* Converts legacy React JavaScript (`.jsx`) codebases to strictly typed TypeScript (`.tsx`).

---

## 🔄 How the Pipeline Works

```text
[ Source Repository ]
         │
         ▼
[ 1. scanner.py ] ───────► Extracts AST & Dependency Tree
         │
         ▼
[ 2. mouse_ai.py ] ──────► Meta Muse AI Batch Code Translation
         │
         ▼
[ 3. Sandbox ] ──────────► Executes `tsc --noEmit` Verification
         │
         ├──► [Errors Detected?] ──► [ Self-Healing Feedback Loop ] (Patches code)
         │
         ▼
[ 4. Exit Code = 0 ] ────► Live Monaco Diff Viewer & Download .zip
```

---

## 📂 Repository Layout

```text
Meta-hackathon/
├── migration-pilot/                # React + Vite Frontend
│   ├── src/                        # UI Dashboard, SSE Stream Hook, Diff Viewer
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── migration-pilot-backend/        # FastAPI + Meta Muse AI Backend
│   ├── helper.py                   # AST helper routines & parser utilities
│   ├── main.py                     # FastAPI server & SSE streaming endpoints
│   ├── mouse_ai.py                 # Meta Muse AI client integration
│   ├── run_meta_ai_migration.py    # Standalone CLI migration orchestrator
│   ├── scanner.py                  # Codebase dependency graph scanner
│   ├── test_pipeline.py            # Local pipeline test suite
│   ├── requirements.txt            # Python dependencies
│   └── .env                        # Environment configuration (API keys)
│
├── .gitignore                      # Git ignore file
└── README.md                       # Documentation & run instructions
```

---

## ⚡ Step-by-Step Setup Guide

### Prerequisites
Make sure you have the following installed on your system:
- **Node.js** (v18.0.0 or higher)
- **Python** (v3.10 or higher)
- **Git**

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/migration-pilot.git
cd migration-pilot
```

---

### Step 2: Backend Setup & Server Start

Open your **first terminal window**:

```bash
# 1. Navigate to the backend directory
cd migration-pilot-backend

# 2. Create and activate a Python virtual environment
# Windows:
python -m venv venv
.\venv\Scripts\activate

# Linux / macOS:
python3 -m venv venv
source venv/bin/activate

# 3. Install required Python packages
pip install -r requirements.txt

# 4. Set up environment variables
# Verify that your .env file contains:
# META_MUSE_API_KEY=your_actual_key_here

# 5. Start the backend API server
python main.py
```

> The backend server will run live at: `http://localhost:8000`

---

### Step 3: Frontend Setup & Dashboard Start

Open a **second terminal window**:

```bash
# 1. Navigate to the frontend directory
cd migration-pilot

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

> Open your browser and navigate to: `http://localhost:5173`

---

### Step 4: Optional Standalone CLI Test

To run the migration pipeline directly in your terminal without opening the web dashboard:

```bash
cd migration-pilot-backend
python run_meta_ai_migration.py
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/migrate/stream?repo_url={url}` | Real-time SSE event stream for migration progress and logs |
| `GET` | `/api/download/migrated` | Downloads the generated `migrated_project.zip` archive |
| `GET` | `/api/health` | Health check endpoint for sandbox readiness |

---

## 🛠️ Tech Stack

- **AI Engine:** Meta Muse AI (`mouse_ai.py`)
- **Backend:** FastAPI, Python AST, Subprocess Sandboxing, SSE Streaming
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Monaco Diff Viewer
- **Compiler/Verifier:** TypeScript Compiler (`tsc`), Node.js

---

## 👨‍💻 Author

**Anup Kumar**  
Associate System Engineer at Tata Consultancy Services (TCS)  
Built for the **Meta AI Hackathon**
