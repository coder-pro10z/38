# 🐞 Bug Backlog & Root Cause Analysis (RCA) Log

This document serves as the canonical engineering backlog and root cause analysis (RCA) registry for bugs, architectural defects, and data quality issues resolved across the **Enterprise Full-Stack & DevOps Study Dashboard** (`index.html`) and its underlying JSON databases (`infinite_locus.json`, `infinite_locus_interview.json`, `merged.json`).

---

## Summary Table of Resolved Bugs

| Bug ID | Component / Area | Title / Issue Description | Severity | Status |
| :--- | :--- | :--- | :---: | :---: |
| **BUG-001** | Frontend UI (`index.html`) | UI Render Freeze when navigating to `tradeoff` or `timeline` schema questions | **High** | ✅ **Resolved** |
| **BUG-002** | Dataset (`infinite_locus.json`) | Boilerplate Template Contamination across 37 JD Prep questions | **High** | ✅ **Resolved** |
| **BUG-003** | Schema Architecture | Incorrect Layout Schema Assignment (`architecture` instead of `tradeoff`) for Q0253 / Q0254 | **Medium** | ✅ **Resolved** |
| **BUG-004** | Dataset & UI Integration | Unmapped & Missing Dataset for `Infinite_Locus.md` (28 Interview Scenarios) | **Medium** | ✅ **Resolved** |
| **BUG-005** | Dataset Metadata | Single-Word / Ambiguous Question Titles (`init`, `locking`, `free`) in Q0215–Q0231 | **Low** | ✅ **Resolved** |

---

## Detailed Root Cause Analysis & Preventive Playbooks

### BUG-001: UI Render Freeze on `tradeoff` and `timeline` Schema Questions

- **Affected Questions**: Slide indices 5 (`Q0211`), 7 (`Q0213`), 23 (`Q0229`), 27 (`Q0233`), 30 (`Q0236`), 47 (`Q0253`), and 48 (`Q0254`) in `infinite_locus.json`.
- **Issue**:
  When a user clicked "Next" or selected any question utilizing the `tradeoff` or `timeline` schema, the slide content on screen did not update — it remained frozen displaying the content of whichever slide was previously active.
- **Why It Happens**:
  The user experiences a silent visual freeze because JavaScript execution halts inside the `renderScenario()` function before `dashboard.innerHTML` can be assigned the new HTML string.
- **Root Cause**:
  In `index.html` (`renderScenario()`), the top-level schema routing condition checked:
  ```javascript
  if (s.schema === 'v3' || s.schema === 'k8s' || s.schema === 'architecture') {
  ```
  Whenever `s.schema === 'tradeoff'` or `s.schema === 'timeline'`, execution bypassed the modern renderer block and fell into fallback legacy render blocks. Those legacy blocks assumed flat properties such as `d.answer` instead of `d.interview_answer.response`. Calling `.map()` on an `undefined` property threw:
  ```text
  Uncaught TypeError: Cannot read properties of undefined (reading 'map')
  ```
  This unhandled exception aborted rendering immediately, leaving existing DOM elements unchanged.
- **How To Fix**:
  1. Updated the top-level schema check in `renderScenario()` to include all modern schemas and check for signature properties:
     ```javascript
     if (s.schema === 'v3' || s.schema === 'k8s' || s.schema === 'architecture' || s.schema === 'tradeoff' || s.schema === 'timeline' || s.interview_answer || s.definition)
     ```
  2. Implemented dedicated UI components inside the modern renderer:
     - **`⚖️ Tradeoff Comparison Matrix`**: Automatically renders a responsive, multi-column HTML table displaying dimensions against each option.
     - **`🕒 Timeline Flow`**: Renders sequential milestones and diagrams.
- **How To Prevent From Happening Again**:
  - **Defensive Array Mapping**: Never call `.map()` directly on unvalidated properties. Always guard with `Array.isArray(d.prop) ? d.prop.map(...) : []`.
  - **Fallback Error Boundary**: Wrap `renderScenario()` in a `try/catch` block that renders a visible error notice card in the UI if an unexpected dataset schema is encountered, rather than silently freezing the view.

---

### BUG-002: Boilerplate Template Contamination Across JD Prep Dataset (`infinite_locus.json`)

- **Affected Questions**: 37 out of 48 questions in `infinite_locus.json` (`Q0208`–`Q0239`, `Q0249`–`Q0254`).
- **Issue**:
  Answers contained repetitive, generic template phrasing such as opening paragraphs beginning with `"When addressing..."` and ending with identical generic kill shots: `"is mastered through codified automation..."`.
- **Why It Happens**:
  During initial dataset bootstrapping, placeholder text was duplicated across dozens of questions with minor keyword swapping. When preparing for real enterprise interviews, these generic answers sounded scripted and lacked technical credibility.
- **Root Cause**:
  No automated content validation or anti-duplication linter was enforced during JSON compilation, allowing placeholder template structures to merge into production databases.
- **How To Fix**:
  1. Designed and executed a 3-phase programmatic upgrade pipeline (`upgrade_phase1.js`, `upgrade_phase2.js`, `upgrade_phase3.js`).
  2. Replaced all 37 boilerplate answers with authentic, 2–3 paragraph spoken engineering answers grounded in real Coforge / AKS / Azure DevOps production workflows.
  3. Synchronized all 48 upgraded records into the canonical master database (`merged.json`).
- **How To Prevent From Happening Again**:
  - **Programmatic Zero-Template Assertion**: Embedded automated verification scripts in the build pipeline that fail if any response contains forbidden boilerplate signatures (`"When addressing..."`).
  - **Contributor Checklist Policy**: Added **Zero-Template Authenticity** explicitly to Section 8 of [`INTERVIEW_ANSWER_SCHEMA_DOCUMENTATION.md`](INTERVIEW_ANSWER_SCHEMA_DOCUMENTATION.md).

---

### BUG-003: Incorrect Layout Schema Assignments for Comparison Questions (`Q0253` & `Q0254`)

- **Affected Questions**: `Q0253` (*Virtual Machine vs Container*) and `Q0254` (*Cloud Service Models — IaaS vs PaaS vs SaaS*).
- **Issue**:
  Multi-option comparison questions were assigned `schema: "architecture"` with vertical execution steps, forcing side-by-side comparison points into linear numbered steps.
- **Why It Happens**:
  Candidates reading `Q0253` or `Q0254` had to scroll through vertical bullet points rather than scanning a structured comparison table across attributes like *Isolation Level*, *Startup Time*, or *Shared Responsibility*.
- **Root Cause**:
  Defaulting all new non-timeline questions to `schema: "architecture"` without evaluating whether the prompt requires an architecture execution flow versus a decision comparison matrix.
- **How To Fix**:
  1. Updated `Q0253` and `Q0254` to `schema: "tradeoff"`.
  2. Replaced linear `architecture_flow` structures with structured `tradeoff_matrix` objects specifying clear evaluation dimensions (`dimensions` array) and structured options (`options` array).
- **How To Prevent From Happening Again**:
  - **Prompt Intent Rule**: Documented in [`PHASE1_SCHEMA_EXAMPLES.md`](PHASE1_SCHEMA_EXAMPLES.md) that any question prompt containing comparison keywords (`"vs"`, `"difference between"`, `"compare"`, `"when to use X or Y"`) MUST use `schema: "tradeoff"`.

---

### BUG-004: Missing / Unlinked Dataset for Infinite Locus Interview Round (`Infinite_Locus.md`)

- **Affected Questions**: All 28 interview scenarios in `Infinite_Locus.md`.
- **Issue**:
  The 28 interview Q&As detailed in `Infinite_Locus.md` were isolated in markdown text and could not be loaded or studied interactively inside `index.html`.
- **Why It Happens**:
  Users preparing specifically for the 28-question Infinite Locus interview round had no UI dropdown selection for this dataset.
- **Root Cause**:
  Lack of an automated parsing and mapping compiler to transform `Infinite_Locus.md` into the UI-compliant JSON schema and reconcile questions against existing `merged.json` IDs.
- **How To Fix**:
  1. Created `map_and_build_infinite_locus_interview.js` to parse `Infinite_Locus.md` and generate `infinite_locus_interview_mapping.json`.
  2. Built `infinite_locus_interview.json` (28 rich scenarios strictly adhering to the UI schema).
  3. Merged the dataset into `merged.json` and added `Infinite Locus Interview (28 Q&A)` directly to the **Interviews Dropdown** in `index.html`.
- **How To Prevent From Happening Again**:
  - Established a standard onboarding workflow: every new interview markdown dossier must run through a dedicated builder script before UI registration.

---

### BUG-005: Single-Word / Ambiguous Question Titles (`Q0215`–`Q0231`)

- **Affected Questions**: Questions `Q0215` (`init`), `Q0216` (`locking`), `Q0224` (`free`), and others in `infinite_locus.json`.
- **Issue**:
  Questions appeared in the index modal and search bar with single-word titles like `"init"`, `"locking"`, or `"free"`.
- **Why It Happens**:
  Users browsing the index list could not determine whether `"init"` referred to Terraform, systemd, or Git initialization without opening the slide.
- **Root Cause**:
  Raw sub-command keywords were used directly as `title` values during data generation.
- **How To Fix**:
  Expanded single-word titles across `infinite_locus.json` and `merged.json` to complete, descriptive technical titles:
  - `"init"` → `"terraform init — Provider Downloads & Backend Initialisation"`
  - `"locking"` → `"Terraform State Locking — Preventing Concurrent Plan/Apply Corruption"`
  - `"free"` → `"Interpreting Linux Memory Usage with free -h — Available vs Free RAM"`
- **How To Prevent From Happening Again**:
  - **Title Length Linter**: Enforce a rule requiring all scenario titles to be self-documenting (>15 characters) and contain explicit technology context.

---

## Verification Audit Checklist for Future Releases

Whenever modifying `index.html` or any dataset (`*.json`), run the following verification steps:

```bash
# 1. Verify no template boilerplate exists across infinite_locus.json
node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync('infinite_locus.json')); const bad=d.filter(q=>q.interview_answer?.response?.[0]?.includes('When addressing')); if(bad.length) { console.error('FAIL:', bad.length); process.exit(1); } else console.log('PASS');"

# 2. Verify all questions in merged.json have valid IDs and schemas
node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync('merged.json')); console.log('Total merged questions:', d.length);"
```
