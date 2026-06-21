# Interactive Canvas Validation & Triage Tools

This directory contains diagnostic utilities to validate the structural syntax and runtime rendering of the 20 interactive canvases defined in `infra_azure.json`.

## Folder Structure

```
canvas_validation/
├── README.md            # This documentation file
├── check_syntax.js      # Natively compiles scripts & checks HTML/CSS syntax
├── test_harness.html    # Iframe container containing sandboxed iframes of all 20 canvases, checking that they render successfully
└── run_tests.js         # HTTP server that triggers tests in the browser and reports CLI summary

```bash
node canvas_validation/run_tests.js
```

## Running the Syntax Checker

The syntax checker parses the `interactive_html` string of each slide and compiles all `<script>` tags natively using Node's `vm` module. This instantly catches syntax errors like mismatched parentheses, missing braces, or incorrect string endings.

```bash
node canvas_validation/check_syntax.js
```

## Running the Rendering Test Suite

The rendering suite validates that the scripts load correctly without runtime exceptions in the browser. It boots a local HTTP server and opens a dashboard containing sandboxed iframes of all 20 canvases, checking that they render successfully.

```bash
node canvas_validation/run_tests.js
```

1. Run the command above.
2. A browser tab will open automatically.
3. Click **"Run Validation"** in the sidebar.
4. The tool will check all 20 canvases in real-time.
5. Click **"Submit Report"** to post the summary back to the CLI; the Node process will output a success/failure summary and shut down automatically.
