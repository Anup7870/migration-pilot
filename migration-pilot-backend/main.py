import subprocess
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from helper import (
    MIGRATED_DIR,
    migration_event_generator,
)
import helper
import shutil
from pathlib import Path
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="MigrationPilot Execution Engine")

# Enable CORS so your React frontend can talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SANDBOX_DIR = Path(__file__).resolve().parent / "sandbox_env"


class SandboxPayload(BaseModel):
    legacy_code: str
    migrated_code: str
    test_code: str


def run_vitest_in_sandbox(migrated_code: str, test_code: str) -> dict:
    """Writes code and tests to the sandbox directory and executes Vitest."""
    if not SANDBOX_DIR.exists():
        raise RuntimeError("sandbox_env directory is missing. Did you initialize it?")

    code_file = SANDBOX_DIR / "component.ts"
    test_file = SANDBOX_DIR / "component.test.ts"

    # 1. Write the migrated TypeScript code and its test file
    code_file.write_text(migrated_code, encoding="utf-8")
    test_file.write_text(test_code, encoding="utf-8")

    # 2. Execute Vitest in single-run mode (no watch)
    try:
        # On Windows, npx requires shell=True or npx.cmd
        cmd = ["npx", "vitest", "run", "component.test.ts", "--reporter=verbose"]
        result = subprocess.run(
            cmd,
            cwd=str(SANDBOX_DIR),
            capture_output=True,
            text=True,
            timeout=15,
            shell=(os.name == "nt"),
        )

        passed = result.returncode == 0
        logs = result.stdout + "\n" + result.stderr

        return {"passed": passed, "exit_code": result.returncode, "logs": logs.strip()}
    except subprocess.TimeoutExpired:
        return {
            "passed": False,
            "exit_code": -1,
            "logs": "Execution timed out after 15 seconds (possible infinite loop).",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/verify-migration")
async def verify_migration(payload: SandboxPayload):
    execution_result = run_vitest_in_sandbox(
        migrated_code=payload.migrated_code, test_code=payload.test_code
    )
    return {
        "status": "success" if execution_result["passed"] else "failed",
        "sandbox_results": execution_result,
    }


# forst get the github repo url and then clone it to the sandbox directory, then run the migration logic on it


@app.get("/api/migrate/stream")
async def stream_migration(
    repo_url: str = Query(..., description="GitHub repository HTTPS URL"),
):
    """
    Streams migration execution events in real time to update the UI stepper.
    Example: GET /api/migrate/stream?repo_url=https://github.com/owner/repo
    """
    print("Streaming migration events for repo:", repo_url)
    if not repo_url.startswith("http"):
        raise HTTPException(
            status_code=400, detail="A valid HTTP/HTTPS GitHub URL is required."
        )

    return StreamingResponse(
        migration_event_generator(repo_url), media_type="text/event-stream"
    )


@app.get("/api/download/migrated")
async def download_migrated_project():
    """Archives and serves the migrated TypeScript project as a zip file."""
    if not MIGRATED_DIR.exists():
        raise HTTPException(status_code=404, detail="No migrated project exists yet.")

    zip_base = MIGRATED_DIR.parent / helper.MIGRATED_REPO_NAME
    archive_path = shutil.make_archive(str(zip_base), "zip", str(MIGRATED_DIR))
    print(f"Archived migrated project to: {archive_path}")
    return FileResponse(
        archive_path,
        media_type="application/zip",
        filename=f"{helper.MIGRATED_REPO_NAME}.zip",
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
