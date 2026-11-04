import json
import os
import stat
import time
import shutil
import subprocess
import re
from urllib.parse import unquote, urlparse
from pathlib import Path

# Import the core engine functions from run_meta_ai_migration
from run_meta_ai_migration import (
    load_file_from_folder,
    copy_project_files,
    configure_typescript_project,
    migrate_single_file,
    rewrite_migrated_imports,
    verify_migrated_project,
    heal_type_errors,
)
from scanner import get_or_build_reference

BASE_DIR = Path(__file__).resolve().parent
SANDBOX_DIR = BASE_DIR / "sandbox_env"
MIGRATED_DIR = BASE_DIR / "migrated_project"
MIGRATED_ARCHIVE = BASE_DIR / "migrated_project_export.zip"
MIGRATED_REPO_NAME = "migrated_project"


def get_repo_name(repo_url: str) -> str:
    """Return a filesystem-safe repository name from its URL."""
    path = unquote(urlparse(repo_url).path).rstrip("/")
    name = path.rsplit("/", 1)[-1]
    if name.lower().endswith(".git"):
        name = name[:-4]
    safe_name = re.sub(r"[^A-Za-z0-9._-]+", "_", name).strip("._-")
    return safe_name or "migrated_project"


def _remove_path(path: Path) -> None:
    if path.is_dir() and not path.is_symlink():
        def remove_readonly(func, target_path, exc_info):
            os.chmod(target_path, stat.S_IWRITE | stat.S_IREAD)
            func(target_path)

        shutil.rmtree(path, onerror=remove_readonly)
    elif path.exists() or path.is_symlink():
        path.unlink()


def reset_migration_workspace() -> None:
    """Remove outputs from previous runs before starting a new migration."""
    for path in (SANDBOX_DIR, MIGRATED_DIR, MIGRATED_ARCHIVE):
        _remove_path(path)


def clone_github_repo(repo_url: str, target_dir: Path = SANDBOX_DIR) -> Path:
    """Clones a GitHub repository safely across Windows and Linux."""
    _remove_path(target_dir)
    target_dir.parent.mkdir(parents=True, exist_ok=True)

    try:
        subprocess.run(
            ["git", "clone", "--depth", "1", repo_url, str(target_dir)],
            check=True,
            capture_output=True,
            text=True,
        )
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.strip() if e.stderr else str(e)
        raise RuntimeError(f"Git clone failed: {error_msg}")

    return target_dir


async def migration_event_generator(repo_url: str):
    """
    Executes the 5-stage migration pipeline and yields Server-Sent Events (SSE)
    formatted specifically for the frontend PipelineStepper component.
    """
    global MIGRATED_REPO_NAME
    MIGRATED_REPO_NAME = get_repo_name(repo_url)

    def emit(
        stage_id: int,
        status: str,
        message: str,
        duration: float = 0.0,
        extra: dict = None,
    ):
        payload = {
            "stage": stage_id,
            "status": status,  # "running" | "passed" | "failed"
            "message": message,
            "duration": f"{duration:.1f}s",
            **(extra or {}),
        }
        return f"data: {json.dumps(payload)}\n\n"

    # =========================================================================
    # STAGE 01: Repository Ingestion
    # =========================================================================
    t0 = time.time()
    yield emit(1, "running", f"Cloning repository: {repo_url}...")
    try:
        reset_migration_workspace()
        clone_github_repo(repo_url, SANDBOX_DIR)
        file_map = load_file_from_folder(str(SANDBOX_DIR))
        t1 = time.time()
        yield emit(
            1,
            "passed",
            f"Cloned successfully. Loaded {len(file_map)} files.",
            duration=t1 - t0,
        )
    except Exception as e:
        yield emit(1, "failed", f"Ingestion error: {str(e)}")
        return

    # =========================================================================
    # STAGE 02: Structural & Dependency Analysis
    # =========================================================================
    t0 = time.time()
    yield emit(
        2,
        "running",
        "Extracting AST symbols, package dependencies, and DOM contracts...",
    )
    try:
        resolution = get_or_build_reference(file_map)
        reference_context = json.dumps(resolution["reference_data"], indent=2)

        files_to_migrate = [
            f
            for f in file_map.keys()
            if (f.endswith(".js") or f.endswith(".jsx"))
            and not f.endswith((".config.js", ".eslintrc.js", "setupTests.js"))
        ]
        t1 = time.time()
        yield emit(
            2,
            "passed",
            f"Mapped structure. Discovered {len(files_to_migrate)} candidate files.",
            duration=t1 - t0,
        )
    except Exception as e:
        yield emit(2, "failed", f"Analysis failed: {str(e)}")
        return

    # =========================================================================
    # STAGE 03: Autonomous Migration
    # =========================================================================
    t0 = time.time()
    yield emit(
        3,
        "running",
        f"Translating {len(files_to_migrate)} files to strict TypeScript via Meta Llama...",
    )

    migrated_files_info = []
    try:
        if MIGRATED_DIR.exists():
            shutil.rmtree(MIGRATED_DIR, ignore_errors=True)
        MIGRATED_DIR.mkdir(parents=True, exist_ok=True)

        migrated_source_files = set(files_to_migrate)
        copy_project_files(SANDBOX_DIR, MIGRATED_DIR, migrated_source_files)
        configure_typescript_project(MIGRATED_DIR)

        migrated_results = {}
        migrated_paths = {}

        for idx, rel_path in enumerate(files_to_migrate, start=1):
            yield emit(
                3,
                "running",
                f"Translating [{idx}/{len(files_to_migrate)}] {rel_path}...",
            )
            raw_code = file_map[rel_path]
            result = migrate_single_file(rel_path, raw_code, reference_context)

            orig_path = MIGRATED_DIR / rel_path
            target_ext = result.get("new_extension", ".tsx")
            new_path = orig_path.with_suffix(target_ext)

            migrated_paths[rel_path] = new_path.relative_to(MIGRATED_DIR).as_posix()
            migrated_results[rel_path] = result["migrated_code"]

            migrated_files_info.append(
                {
                    "original_path": rel_path,
                    "migrated_path": migrated_paths[rel_path],
                    "original_code": raw_code,
                    "migrated_code": result["migrated_code"],
                    "summary": result.get("summary", "Converted to TypeScript"),
                }
            )

        for rel_path, code in migrated_results.items():
            new_path = MIGRATED_DIR / migrated_paths[rel_path]
            new_path.parent.mkdir(parents=True, exist_ok=True)
            new_path.write_text(
                rewrite_migrated_imports(code, rel_path, migrated_paths),
                encoding="utf-8",
            )

        t1 = time.time()
        yield emit(
            3,
            "passed",
            f"Converted {len(files_to_migrate)} files successfully.",
            duration=t1 - t0,
        )
    except Exception as e:
        yield emit(3, "failed", f"Migration translation failed: {str(e)}")
        return

    # =========================================================================
    # STAGE 04: Sandbox Type-Check & Verification
    # =========================================================================
    t0 = time.time()
    yield emit(4, "running", "Installing dependencies and executing tsc --noEmit...")
    check = verify_migrated_project(MIGRATED_DIR)
    t1 = time.time()

    if check["passed"]:
        yield emit(4, "passed", "Type check passed with 0 errors.", duration=t1 - t0)
        yield emit(
            5,
            "passed",
            "Clean build (no healing required).",
            duration=0.1,
            extra={"files": migrated_files_info},
        )
        return

    yield emit(
        4,
        "failed",
        "TypeScript compiler errors found. Initiating healing...",
        duration=t1 - t0,
    )

    # =========================================================================
    # STAGE 05: Self-Healing Loop
    # =========================================================================
    t0 = time.time()
    yield emit(5, "running", "Self-healing compiler issues with Meta Llama...")
    try:
        heal_type_errors(MIGRATED_DIR, check["errors"])
        final_check = verify_migrated_project(MIGRATED_DIR)
        t1 = time.time()

        if final_check["passed"]:
            yield emit(
                5,
                "passed",
                "Self-healing completed: 0 errors remaining.",
                duration=t1 - t0,
                extra={"files": migrated_files_info},
            )
        else:
            yield emit(
                5,
                "failed",
                "Remaining compiler errors need manual intervention.",
                duration=t1 - t0,
                extra={"files": migrated_files_info},
            )
    except Exception as e:
        yield emit(
            5,
            "failed",
            f"Healing agent failed: {str(e)}",
            extra={"files": migrated_files_info},
        )
