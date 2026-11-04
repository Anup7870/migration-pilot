import os
import re
import json
from pathlib import Path


def build_project_reference(source_files: dict[str, str]) -> dict:
    """
    Fallback Scanner:
    Extracts structure, function signatures, imports/exports,
    and HTML DOM hooks from raw source files.
    """
    file_tree = list(source_files.keys())
    symbol_table = {}
    dom_references = {"html_ids": [], "js_dom_selectors": [], "inline_events": []}
    external_dependencies = {}

    for filepath, content in source_files.items():
        # 1. Parse package.json if present
        if filepath.endswith("package.json"):
            try:
                pkg = json.loads(content)
                external_dependencies = {
                    **pkg.get("dependencies", {}),
                    **pkg.get("devDependencies", {}),
                }
            except Exception:
                pass

        # 2. Extract DOM IDs and inline handlers from HTML
        elif filepath.endswith(".html"):
            ids = re.findall(r'id=["\']([^"\']+)["\']', content)
            inline_events = re.findall(r'on\w+=["\']([^"\']+)["\']', content)
            dom_references["html_ids"].extend(ids)
            dom_references["inline_events"].extend(inline_events)

        # 3. Extract functions, imports, exports, and DOM queries from JS/JSX
        elif filepath.endswith((".js", ".jsx")):
            funcs = re.findall(r"function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)", content)
            arrow_funcs = re.findall(
                r"(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>",
                content,
            )

            imports = re.findall(r'import\s+.*?\s+from\s+["\']([^"\']+)["\']', content)
            requires = re.findall(r'require\(["\']([^"\']+)["\']\)', content)
            exports = re.findall(
                r"export\s+(?:default\s+)?(?:function|const|class|let|var)?\s*([a-zA-Z0-9_]+)",
                content,
            )
            dom_queries = re.findall(
                r'document\.(?:getElementById|querySelector|querySelectorAll)\(["\']([^"\']+)["\']\)',
                content,
            )

            dom_references["js_dom_selectors"].extend(dom_queries)

            symbol_table[filepath] = {
                "functions": [
                    {
                        "name": name,
                        "params": [p.strip() for p in params.split(",") if p.strip()],
                    }
                    for name, params in (funcs + arrow_funcs)
                ],
                "imports": list(set(imports + requires)),
                "exports": list(set(exports)),
            }

    return {
        "project_tree": file_tree,
        "external_dependencies": external_dependencies,
        "symbol_reference_map": symbol_table,
        "dom_binding_contract": {
            "html_ids": list(set(dom_references["html_ids"])),
            "js_dom_selectors": list(set(dom_references["js_dom_selectors"])),
            "inline_events": list(set(dom_references["inline_events"])),
        },
    }


def detect_provided_structure(
    source_files: dict[str, str], provided_reference: dict = None
) -> dict:
    """
    Tier 1: Checks if structure is explicitly defined in configs or inline annotations.
    """
    found_structure = {
        "has_explicit_structure": False,
        "user_provided_schema": provided_reference or {},
        "config_files": {},
        "inline_contracts": {},
    }

    if provided_reference:
        found_structure["has_explicit_structure"] = True

    for filepath, content in source_files.items():
        if filepath.endswith(("package.json", "jsconfig.json", "tsconfig.json")):
            try:
                found_structure["config_files"][filepath] = json.loads(content)
                found_structure["has_explicit_structure"] = True
            except Exception:
                pass
        elif filepath.endswith(".d.ts"):
            found_structure["config_files"][filepath] = content
            found_structure["has_explicit_structure"] = True

        elif filepath.endswith((".js", ".jsx")):
            jsdocs = re.findall(r"/\*\*[\s\S]*?\*/", content)
            proptypes = re.findall(
                r"([a-zA-Z0-9_]+\.propTypes\s*=\s*\{[\s\S]*?\};)", content
            )

            if jsdocs or proptypes:
                found_structure["has_explicit_structure"] = True
                found_structure["inline_contracts"][filepath] = {
                    "jsdoc_annotations": jsdocs,
                    "prop_types": proptypes,
                }

    return found_structure


def get_or_build_reference(
    source_files: dict[str, str], user_reference: dict = None
) -> dict:
    """
    Master Router:
    1. Checks if structure is provided first.
    2. Falls back to build_project_reference if not found.
    """
    tier1_check = detect_provided_structure(source_files, user_reference)

    if tier1_check["has_explicit_structure"]:
        return {
            "resolution_mode": "NATIVE_STRUCTURE_DETECTED",
            "reference_data": tier1_check,
            "project_tree": list(source_files.keys()),
        }

    fallback_data = build_project_reference(source_files)
    return {
        "resolution_mode": "FALLBACK_SCANNER_GENERATED",
        "reference_data": fallback_data,
        "project_tree": fallback_data["project_tree"],
    }
