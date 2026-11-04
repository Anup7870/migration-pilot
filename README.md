# MigrationPilot 🚀

> Autonomous cross-framework codebase migration prototype powered by **Meta Muse AI** with deterministic compiler verification and self-healing.

Built by **Anup Kumar** (Associate System Engineer at TCS) for the **Meta AI Hackathon**.

---

## 📌 Overview

Migrating a codebase between frameworks or languages manually requires significant developer hours and introduces regression bugs. Standard single-file AI prompts often break dependency trees, produce invalid import paths, and offer no guarantee of compiler-level validity.

**MigrationPilot** converts whole repositories across stacks through a closed-loop pipeline:
1. **Repository Ingestion & AST Mapping:** Scans project files, builds import graphs, and identifies component dependencies.
2. **Meta Muse AI Translation:** Batch-translates components across stacks while normalizing relative import paths.
3. **Sandbox Verification:** Executes target compiler checks (`tsc --noEmit`) in an isolated environment.
4. **Self-Healing Loop:** Feeds compiler diagnostic logs back to the model to auto-patch failing lines until the build passes with zero errors.
5. **Interactive Review:** Streams live updates over Server-Sent Events (SSE), provides side-by-side Monaco diffs, and exports a verified `.zip` archive.

*Current Proof of Concept:* Converts legacy React JavaScript (JSX) codebases to strictly typed TypeScript (TSX).

---

## 📂 Project Structure

```text
Meta-hackathon/
├── migration-pilot/                # React + Vite Frontend
│   ├── src/                        # Dashboard UI, SSE hook, Monaco Diff Viewer
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── migration-pilot-backend/        # FastAPI & Meta Muse AI Backend
│   ├── helper.py                   # AST helper utilities & parsing routines
│   ├── main.py                     # FastAPI entry point & SSE stream endpoints
│   ├── mouse_ai.py                 # Meta Muse AI client integration
│   ├── run_meta_ai_migration.py    # Core orchestrator script
│   ├── scanner.py                  # Repository & dependency tree scanner
│   ├── test_pipeline.py            # Local pipeline test suite
│   ├── .env                        # API keys and environment variables
│   └── requirements.txt            # Python dependencies
│
├── .gitignore
└── README.md