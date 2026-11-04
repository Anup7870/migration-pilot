import os
import json
import re
import shutil
import posixpath
import subprocess
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI
from scanner import get_or_build_reference

load_dotenv()

# Meta Llama via OpenAI-compatible provider (e.g. Groq, Together, or local vLLM/Ollama)
API_KEY = os.getenv("META_API_KEY")
BASE_URL = os.getenv("LLM_BASE_URL")
MODEL_NAME = os.getenv("MODEL_NAME")

if BASE_URL:
    BASE_URL = BASE_URL.rstrip("/")
    if BASE_URL.endswith("/responses"):
        BASE_URL = BASE_URL[: -len("/responses")]

client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

IGNORE_DIRS = {"node_modules", ".git", "__pycache__", "dist", "build"}
VALID_EXTENSIONS = {
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".mjs",
    ".cjs",
    ".json",
    ".css",
    ".scss",
    ".html",
}

BASE_DIR = Path(__file__).resolve().parent
# Define sandbox workspace boundaries
SANDBOX_DIR = BASE_DIR / "sandbox_env"
SOURCE_WORKSPACE = SANDBOX_DIR / "source"
MIGRATED_WORKSPACE = SANDBOX_DIR / "migrated"
PROTECTED_ITEMS = {"node_modules", "package.json", "package-lock.json", "tsconfig.json"}


def clean_sandbox(target_dir: Path, keep_node_modules: bool = True):
    """Purge stale files from a given sandbox directory."""
    if not target_dir.exists():
        target_dir.mkdir(parents=True, exist_ok=True)
        return

    for item in target_dir.iterdir():
        if keep_node_modules and item.name in PROTECTED_ITEMS:
            continue
        try:
            if item.is_file() or item.is_symlink():
                item.unlink()
            elif item.is_dir():
                shutil.rmtree(item)
        except Exception as e:
            print(f"[!] Warning: Could not delete {item.name}: {e}")


def load_file_from_folder(folder_path: str) -> dict[str, str]:
    base_dir = Path(folder_path).resolve()
    loaded_files = {}

    for root, dirs, files in os.walk(base_dir):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for file in files:
            file_path = Path(root) / file
            if file_path.suffix.lower() not in VALID_EXTENSIONS:
                continue
            rel_path = file_path.relative_to(base_dir).as_posix()
            try:
                loaded_files[rel_path] = file_path.read_text(encoding="utf-8")
            except (UnicodeDecodeError, PermissionError):
                continue
    return loaded_files


def copy_project_files(
    source_root: Path, output_root: Path, migrated_files: set[str]
) -> None:
    for root, dirs, files in os.walk(source_root):
        dirs[:] = [directory for directory in dirs if directory not in IGNORE_DIRS]
        source_dir = Path(root)
        relative_dir = source_dir.relative_to(source_root)
        destination_dir = output_root / relative_dir
        destination_dir.mkdir(parents=True, exist_ok=True)

        for filename in files:
            source_file = source_dir / filename
            relative_file = source_file.relative_to(source_root).as_posix()
            if relative_file in migrated_files:
                continue
            shutil.copy2(source_file, destination_dir / filename)


def configure_typescript_project(output_root: Path) -> None:
    package_file = output_root / "package.json"
    if not package_file.exists():
        return

    package = json.loads(package_file.read_text(encoding="utf-8"))
    dev_deps = package.setdefault("devDependencies", {})
    dev_deps["typescript"] = "^5.4.5"
    dev_deps["@types/react"] = "^18.3.0"
    dev_deps["@types/react-dom"] = "^18.3.0"
    dev_deps["@types/node"] = "^20.0.0"

    package.setdefault("scripts", {})["typecheck"] = "tsc --noEmit"
    package_file.write_text(json.dumps(package, indent=2) + "\n", encoding="utf-8")

    tsconfig = {
        "compilerOptions": {
            "target": "ES2020",
            "useDefineForClassFields": True,
            "lib": ["ES2020", "DOM", "DOM.Iterable"],
            "module": "ESNext",
            "skipLibCheck": True,
            "moduleResolution": "Bundler",
            "resolveJsonModule": True,
            "isolatedModules": True,
            "noEmit": True,
            "jsx": "react-jsx",
            "strict": True,
        },
        "include": ["src"],
    }
    (output_root / "tsconfig.json").write_text(
        json.dumps(tsconfig, indent=2) + "\n", encoding="utf-8"
    )

    lock_file = output_root / "package-lock.json"
    if lock_file.exists():
        lock_file.unlink()


def rewrite_migrated_imports(
    code: str, original_file: str, migrated_paths: dict[str, str]
) -> str:
    """Normalize relative imports so they resolve seamlessly in TypeScript bundler mode."""
    import_pattern = re.compile(
        r"""(?P<prefix>\b(?:from\s*|import\s*\(\s*|import\s*)["'])(?P<specifier>[^"']+)(?P<suffix>["'])"""
    )
    original_dir = posixpath.dirname(original_file)

    def replace_import(match: re.Match[str]) -> str:
        specifier = match.group("specifier")
        if not specifier.startswith("."):
            return match.group(0)

        extension = posixpath.splitext(specifier)[1].lower()
        if extension in {".js", ".jsx", ".mjs", ".cjs"}:
            specifier = specifier[: -len(extension)]
        return match.group("prefix") + specifier + match.group("suffix")

    return import_pattern.sub(replace_import, code)


def migrate_single_file(
    file_path: str, code_content: str, reference_context: str
) -> dict:
    system_prompt = (
        "You are an expert TypeScript and React migration engine. "
        "Convert the provided JavaScript/React code to modern, strict TypeScript (.ts or .tsx). "
        "You MUST respond ONLY with a valid JSON object matching this schema: "
        '{"migrated_code": "string", "new_extension": ".tsx" | ".ts", "summary": "string"}. '
        "Preserve exact function signatures, exports, and relative import paths."
    )

    user_prompt = (
        f"--- GLOBAL PROJECT REFERENCE ---\n{reference_context}\n\n"
        f"--- TARGET FILE: {file_path} ---\n{code_content}\n\n"
        "Convert this file to strict TypeScript."
    )

    response = client.responses.create(
        model=MODEL_NAME,
        instructions=system_prompt,
        input=user_prompt,
        text={"format": {"type": "json_object"}},
        temperature=0.1,
    )
    if not response.output_text:
        raise ValueError(f"Model returned no text for {file_path}")
    return json.loads(response.output_text)


def verify_migrated_project(output_root: Path) -> dict:
    """Ensures dependencies are present and runs TypeScript compiler check."""
    node_modules_dir = output_root / "node_modules"
    tsc_command = node_modules_dir / ".bin" / ("tsc.cmd" if os.name == "nt" else "tsc")

    if not tsc_command.exists():
        print(
            "[*] Installing TypeScript dependencies in migrated_project (first run)..."
        )
        try:
            install_res = subprocess.run(
                ["npm", "install", "--no-audit", "--no-fund"],
                cwd=str(output_root),
                capture_output=True,
                text=True,
                timeout=300,
                shell=(os.name == "nt"),
            )
        except subprocess.TimeoutExpired as e:
            output = "\n".join(
                part for part in (e.stdout, e.stderr) if isinstance(part, str) and part
            )
            return {
                "passed": False,
                "stage": "install",
                "exit_code": -1,
                "errors": (
                    "npm install timed out after 300 seconds. "
                    "Check your network connection and npm registry access."
                    + (f"\n\nInstall output:\n{output}" if output else "")
                ),
            }
        if install_res.returncode != 0:
            return {
                "passed": False,
                "stage": "install",
                "exit_code": install_res.returncode,
                "errors": f"npm install failed:\n{install_res.stderr or install_res.stdout}",
            }

    print("\n[*] Running project-wide TypeScript type-check...")
    try:
        result = subprocess.run(
            ["npx", "tsc", "--noEmit"],
            cwd=str(output_root),
            capture_output=True,
            text=True,
            timeout=30,
            shell=(os.name == "nt"),
        )
        passed = result.returncode == 0
        return {
            "passed": passed,
            "stage": "typecheck",
            "exit_code": result.returncode,
            "errors": (result.stdout + "\n" + result.stderr).strip(),
        }
    except Exception as e:
        return {
            "passed": False,
            "stage": "typecheck",
            "exit_code": -1,
            "errors": str(e),
        }


def heal_type_errors(output_root: Path, error_logs: str):
    """Sends compilation errors back to the model to patch broken files."""
    print("[!] TypeScript compilation failed. Triggering Self-Healing Loop...")

    prompt = (
        f"--- TYPESCRIPT COMPILATION ERRORS ---\n{error_logs}\n\n"
        "Identify which file failed, fix the type or import error, and return JSON:\n"
        '{"file_path": "src/App.tsx", "healed_code": "full corrected code"}'
    )

    response = client.responses.create(
        model=MODEL_NAME,
        instructions="You fix TypeScript compiler errors in React code.",
        input=prompt,
        text={"format": {"type": "json_object"}},
        temperature=0.1,
    )

    if not response.output_text:
        raise ValueError("Model returned no text while healing TypeScript errors")
    correction = json.loads(response.output_text)
    target_file = output_root / correction["file_path"]
    if target_file.exists():
        target_file.write_text(correction["healed_code"], encoding="utf-8")
        print(f"[+] Successfully healed: {correction['file_path']}")


def run_migration_pipeline(
    source_root: Path = SOURCE_WORKSPACE,
    output_root: Path = MIGRATED_WORKSPACE,
) -> dict:
    """Orchestrates the 5-stage migration with dynamic paths.

    Works for both local testing and API/clone invocations.
    """
    clean_sandbox(output_root, keep_node_modules=True)

    print(f"[*] Loading workspace: {source_root}")
    file_map = load_file_from_folder(str(source_root))

    if not file_map:
        raise ValueError(f"No valid source files found in {source_root}")

    print("[*] Generating whole-project reference map...")
    resolution = get_or_build_reference(file_map)
    reference_context = json.dumps(resolution["reference_data"], indent=2)

    files_to_migrate = [
        f
        for f in file_map.keys()
        if (f.endswith(".js") or f.endswith(".jsx"))
        and not f.endswith((".config.js", ".eslintrc.js"))
    ]

    print(f"[*] Found {len(files_to_migrate)} files to migrate: {files_to_migrate}")
    print(f"[*] Migrated output will be written to: {output_root}")
    print("=" * 60)

    output_root.mkdir(parents=True, exist_ok=True)
    migrated_source_files = set(files_to_migrate)

    for rel_path in migrated_source_files:
        stale_source_file = output_root / rel_path
        if stale_source_file.exists():
            stale_source_file.unlink()

    copy_project_files(source_root, output_root, migrated_source_files)
    configure_typescript_project(output_root)

    migration_report = []
    migrated_results = {}
    migrated_paths = {}

    for idx, rel_path in enumerate(files_to_migrate, start=1):
        print(f"\n[{idx}/{len(files_to_migrate)}] Migrating: {rel_path}...")
        raw_code = file_map[rel_path]
        result = migrate_single_file(rel_path, raw_code, reference_context)

        original_path = output_root / rel_path
        target_ext = result.get("new_extension", ".tsx")
        new_path = original_path.with_suffix(target_ext)
        migrated_paths[rel_path] = new_path.relative_to(output_root).as_posix()
        migrated_results[rel_path] = result["migrated_code"]

        migration_report.append(
            {
                "original_file": rel_path,
                "migrated_file": new_path.relative_to(output_root).as_posix(),
                "summary": result.get("summary", "Converted to TypeScript"),
            }
        )

    for rel_path, migrated_code in migrated_results.items():
        new_path = output_root / migrated_paths[rel_path]
        new_path.parent.mkdir(parents=True, exist_ok=True)
        new_path.write_text(
            rewrite_migrated_imports(migrated_code, rel_path, migrated_paths),
            encoding="utf-8",
        )
        print(f" -> Successfully saved: {new_path}")

    # Fix root index.html entry script tags
    index_file = output_root / "index.html"
    if index_file.exists():
        html = index_file.read_text(encoding="utf-8")

        def rewrite_entry(match: re.Match[str]) -> str:
            source_entry = match.group("entry").lstrip("/")
            migrated_entry = migrated_paths.get(source_entry)
            if migrated_entry is None:
                return match.group(0)
            prefix = "/" if match.group("entry").startswith("/") else ""
            return (
                match.group("prefix") + prefix + migrated_entry + match.group("suffix")
            )

        html = re.sub(
            r"""(?P<prefix>\bsrc\s*=\s*["'])(?P<entry>[^"']+)(?P<suffix>["'])""",
            rewrite_entry,
            html,
        )
        index_file.write_text(html, encoding="utf-8")

    print("\n" + "=" * 60)
    print("ALL FILES MIGRATED TO DISK")
    print("=" * 60)
    for item in migration_report:
        print(f" * {item['original_file']} -> {item['migrated_file']}")

    # Verification and healing
    check_result = verify_migrated_project(output_root)

    if check_result["passed"]:
        print("\n[SUCCESS] Project passed type-check with 0 errors!")
    else:
        print("\n[FAILED] Compiler errors detected:")
        print(check_result["errors"])
        if check_result.get("stage") == "typecheck":
            heal_type_errors(output_root, check_result["errors"])
            final_check = verify_migrated_project(output_root)
            if final_check["passed"]:
                print("\n[SUCCESS] Self-healed successfully! 0 errors remaining.")
            else:
                print("\n[WARNING] Still has type errors after 1 healing attempt.")
        else:
            print("[!] Skipping self-healing because dependency installation failed.")

    return {
        "status": ("success" if check_result["passed"] else "completed_with_warnings"),
        "report": migration_report,
        "verification": check_result,
    }


def main():
    test_project_dir = BASE_DIR / "test_project"
    source = test_project_dir if test_project_dir.exists() else SOURCE_WORKSPACE
    output = BASE_DIR / "migrated_project"

    run_migration_pipeline(source_root=source, output_root=output)


if __name__ == "__main__":
    main()
