import json
from scanner import get_or_build_reference

print("=" * 60)
print("TEST 1: Code WITH Provided Structure (JSDoc Annotations)")
print("=" * 60)

code_with_structure = {
    "src/calc.js": """
    /**
     * @param {number} a
     * @param {number} b
     * @returns {number}
     */
    function add(a, b) {
        return a + b;
    }
    module.exports = { add };
    """,
    "package.json": '{"name": "demo-app", "dependencies": {"lodash": "^4.17.21"}}',
}

result_1 = get_or_build_reference(code_with_structure)
print(f"Mode: {result_1['resolution_mode']}")
print(f"Detected Configs: {list(result_1['reference_data']['config_files'].keys())}")
print(
    f"Found Inline Contracts: {list(result_1['reference_data']['inline_contracts'].keys())}"
)

print("\n" + "=" * 60)
print("TEST 2: Raw Legacy Code WITHOUT Structure (Fallback Scanner)")
print("=" * 60)

raw_legacy_webpage = {
    "index.html": '<button id="submit-btn" onclick="handleClick()">Click</button><div id="output"></div>',
    "script.js": """
    function handleClick() {
        var el = document.getElementById("output");
        el.innerText = "Processing...";
    }
    function fetchData(url) {
        return fetch(url).then(res => res.json());
    }
    """,
}

result_2 = get_or_build_reference(raw_legacy_webpage)
print(f"Mode: {result_2['resolution_mode']}")
print(f"Project Tree: {result_2['project_tree']}")
print(
    f"Extracted DOM IDs: {result_2['reference_data']['dom_binding_contract']['html_ids']}"
)
print(
    f"Extracted Functions: {[f['name'] for f in result_2['reference_data']['symbol_reference_map']['script.js']['functions']]}"
)
