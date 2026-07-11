# Interview Scenario & Answer Schema Documentation

This document defines the **Canonical Interview Scenario & Answer Schema** used across all datasets (`merged.json`, `infinite_locus_interview.json`, `hexaview_r1.json`, `infra_azure.json`, etc.) and rendered by the interactive dashboard (`index.html`).

---

## Table of Contents
1. [Schema Overview & Core Design Philosophy](#1-schema-overview--core-design-philosophy)
2. [TypeScript / JSON Interface Definition](#2-typescript--json-interface-definition)
3. [Top-Level Field Specification](#3-top-level-field-specification)
4. [Scenario Layout Types (`schema`)](#4-scenario-layout-types-schema)
   - [`architecture` Layout (`architecture_flow`)](#41-architecture-layout)
   - [`tradeoff` Layout (`tradeoff_matrix`)](#42-tradeoff-layout)
   - [`timeline` Layout (`timeline_flow`)](#43-timeline-layout)
5. [Rich Answer Fields Specification](#5-rich-answer-fields-specification)
   - [`interview_answer` Structure](#51-interview_answer-structure)
   - [`interview_kill_shot` Structure](#52-interview_kill_shot-structure)
6. [Complete Production Examples](#6-complete-production-examples)
   - [Example 1: Architecture Schema](#61-example-1-architecture-schema)
   - [Example 2: Tradeoff Schema](#62-example-2-tradeoff-schema)
   - [Example 3: Timeline Schema](#63-example-3-timeline-schema)
7. [UI Rendering & CSS Mapping](#7-ui-rendering--css-mapping)
8. [Contributor Validation Checklist](#8-contributor-validation-checklist)

---

## 1. Schema Overview & Core Design Philosophy

The Interview Answer Schema is designed to train engineers not just on *what* an answer is, but **how to structure an answer in a live senior engineering interview**. 

Every question entry combines three pedagogical layers:
1. **First Principles Foundation (`definition`, `why_it_matters`, `real_world_scenario`)**: Establishes theoretical correctness and real-world production relevance.
2. **Visual & Structural Mental Model (`architecture_flow` / `tradeoff_matrix` / `timeline_flow`)**: Provides a visual ASCII pipeline, comparison matrix, or sequential timeline that candidates can sketch on a whiteboard.
3. **High-Impact Verbal Scripting (`interview_answer`, `interview_kill_shot`)**: Gives a concise, multi-paragraph spoken answer along with actionable rationale (`why`) and a memorable closing summary sentence (`interview_kill_shot`).

---

## 2. TypeScript / JSON Interface Definition

```typescript
export type SchemaLayoutType = 'architecture' | 'tradeoff' | 'timeline';

export interface InterviewScenario {
  /** Sequential numerical display index */
  index: number;

  /** Unique Question ID (e.g. "Q0207", "Q0001") */
  id: string;

  /** Foreign Key matching category_config.json ID (e.g. "C001" to "C017") */
  categoryId: string;

  /** High-level section or category display name */
  section: string;

  /** Primary scenario title or topic heading */
  title: string;

  /** Original interviewer prompt or question formulation */
  prompt: string;

  /** Domain classification (e.g. "Linux", "Networking", "CI/CD", "Kubernetes") */
  type: string;

  /** Subjective difficulty rating ("Easy" | "Medium" | "Hard") */
  difficulty: 'Easy' | 'Medium' | 'Hard';

  /** Array of keyword search chips rendered under the title */
  chips: string[];

  /** Determines which specialized structural widget is rendered */
  schema: SchemaLayoutType;

  /** Clear 1-2 sentence technical definition of the concept */
  definition: string;

  /** Explanation of why this concept is critical in enterprise/production environments */
  why_it_matters: string;

  /** Real-world production outage, design decision, or operational scenario */
  real_world_scenario: string;

  /** Rendered when schema === 'architecture' */
  architecture_flow?: {
    steps: string[];
    diagram: string;
  };

  /** Rendered when schema === 'tradeoff' */
  tradeoff_matrix?: {
    dimensions: string[];
    options: Array<{
      name: string;
      values: string[];
    }>;
  };

  /** Rendered when schema === 'timeline' */
  timeline_flow?: {
    phases: Array<{
      title: string;
      details: string;
    }>;
  };

  /** Structured verbal interview response block */
  interview_answer: {
    /** Array of spoken paragraphs representing the candidate's exact response */
    response: string[];
    /** Pedagogical explanation of why this verbal structure works well */
    why: string;
  };

  /** 1-sentence punchy closing takeaway to impress the interviewer */
  interview_kill_shot: string;
}
```

---

## 3. Top-Level Field Specification

| Field Name | Type | Required | Description | Example Value |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `string` | **Yes** | Primary canonical ID formatted as `QXXXX` (4 digits). | `"Q0212"` |
| `categoryId` | `string` | **Yes** | Foreign key linking to `category_config.json` (`C001` - `C017`). | `"C008"` (Linux) |
| `title` | `string` | **Yes** | Clear, authoritative topic heading shown in cards and dropdowns. | `"Checking Port Availability & Listening Processes in Linux"` |
| `prompt` | `string` | **Yes** | The actual question asked by the interviewer. | `"How would you find out if a particular port is free on a Linux server?"` |
| `schema` | `string` | **Yes** | Layout mode: `"architecture"`, `"tradeoff"`, or `"timeline"`. | `"architecture"` |
| `chips` | `string[]` | **Yes** | Array of 3–6 relevant technology keywords for quick scanning. | `["ss", "netstat", "lsof", "Ports"]` |
| `difficulty` | `string` | **Yes** | Displayed in pill badge: `"Easy"`, `"Medium"`, or `"Hard"`. | `"Easy"` |

---

## 4. Scenario Layout Types (`schema`)

### 4.1 `architecture` Layout
Used when explaining systems, lifecycles, pipelines, or command flow sequences.

```json
"schema": "architecture",
"architecture_flow": {
  "steps": [
    "1. Client & DNS Resolution: Client resolves portal domain via Azure DNS.",
    "2. WAF & Application Gateway: Request inspected at Layer 7.",
    "3. AKS Ingress Controller: Nginx ingress terminates TLS and routes to pod."
  ],
  "diagram": "Client ──> Azure DNS ──> App Gateway (WAF) ──> AKS Ingress ──> Pod"
}
```
* **UI Rendering**: Renders a numbered list of steps inside a dark glass card alongside a mono-spaced ASCII flowchart (`diagram`).

---

### 4.2 `tradeoff` Layout
Used when comparing two or more architectural choices, protocols, or commands (e.g., `TCP vs UDP`, `Process vs Thread`, `A Record vs CNAME`).

```json
"schema": "tradeoff",
"tradeoff_matrix": {
  "dimensions": ["Address Space", "Isolation", "Creation Overhead", "Context Switch"],
  "options": [
    {
      "name": "Process",
      "values": [
        "Separate independent virtual address space",
        "High isolation (crash doesn't kill other processes)",
        "Heavyweight (requires OS page table allocation)",
        "Slower context switch (MMU flush required)"
      ]
    },
    {
      "name": "Thread",
      "values": [
        "Shares parent process memory heap & code segment",
        "Low isolation (segfault in thread can crash process)",
        "Lightweight (shares existing page tables)",
        "Fast context switch (CPU registers & stack switch only)"
      ]
    }
  ]
}
```
* **UI Rendering**: Renders a responsive HTML comparison table where `dimensions` map to rows and `options` map to columns.

---

### 4.3 `timeline` Layout
Used when describing multi-stage lifecycles, incident response phases, or CI/CD pipeline execution stages.

```json
"schema": "timeline",
"timeline_flow": {
  "phases": [
    {
      "title": "Stage 1: Continuous Integration & Linting",
      "details": "Execute unit tests, SonarQube static analysis, and code coverage gates."
    },
    {
      "title": "Stage 2: Containerization & Trivy Scan",
      "details": "Build Docker image and scan for critical CVE vulnerabilities."
    }
  ]
}
```
* **UI Rendering**: Renders vertical timeline nodes with circular step badges.

---

## 5. Rich Answer Fields Specification

### 5.1 `interview_answer` Structure
The `interview_answer` object is the centerpiece of candidate preparation:

```json
"interview_answer": {
  "response": [
    "To check if a specific port (e.g., port 8080) is free or occupied, I use the modern socket statistics command: 'sudo ss -tulnp | grep :8080'.",
    "If the output is empty, the port is free. If a process is listening, it displays the process name and PID.",
    "Alternatively, I use 'sudo lsof -i :8080' to inspect the exact open file descriptor and process owner."
  ],
  "why": "Mentions both modern 'ss' (preferred over deprecated 'netstat') and 'lsof' for process identification."
}
```
* **`response` (`string[]`)**: Array of spoken paragraphs. Dividing into 2–4 paragraphs ensures optimal pacing and scannability.
* **`why` (`string`)**: Explains to the candidate *why* mentioning specific tools or tradeoffs makes a senior impression.

---

### 5.2 `interview_kill_shot` Structure
A single punchy, executive summary sentence intended to be spoken at the end of the answer:

```json
"interview_kill_shot": "'ss -tulnp' is the modern standard for checking open ports and listening process IDs on Linux."
```
* **UI Rendering**: Displayed prominently in a glowing, styled alert block at the bottom of the answer card.

---

## 6. Complete Production Examples

### 6.1 Example 1: Architecture Schema
```json
{
  "index": 5,
  "id": "Q0212",
  "categoryId": "C008",
  "section": "Linux & Troubleshooting",
  "title": "Checking Port Availability & Listening Processes in Linux",
  "prompt": "How would you find out if a particular port is free on a Linux server?",
  "type": "Linux / Networking",
  "difficulty": "Easy",
  "chips": ["ss", "netstat", "lsof", "Ports"],
  "schema": "architecture",
  "definition": "Inspecting Linux network socket tables to determine whether a TCP/UDP port is currently bound by an application daemon.",
  "why_it_matters": "Prevents 'Address already in use' startup failures when deploying containers or daemons.",
  "real_world_scenario": "An Nginx deployment fails to start because port 80 or 443 is already occupied by another process.",
  "architecture_flow": {
    "steps": [
      "1. Modern Socket Utility: Execute 'sudo ss -tulnp | grep :<PORT>' (-t TCP, -u UDP, -l listening, -n numeric, -p process).",
      "2. File Descriptor Inspection: Execute 'sudo lsof -i :<PORT>' to see the exact process ID and user holding the socket.",
      "3. Legacy Netstat: Execute 'sudo netstat -tulnp | grep :<PORT>' on older legacy distributions."
    ],
    "diagram": "ss -tulnp | grep :8080 ──[If Empty]──> Port is FREE ──[If Match]──> lsof -i :8080 reveals PID"
  },
  "interview_answer": {
    "response": [
      "To check if a specific port (e.g., port 8080) is free or occupied, I use the modern socket statistics command: 'sudo ss -tulnp | grep :8080'.",
      "If the output is empty, the port is free. If a process is listening, it displays the process name and PID.",
      "Alternatively, I use 'sudo lsof -i :8080' to inspect the exact open file descriptor and process owner."
    ],
    "why": "Mentions both modern 'ss' (preferred over deprecated 'netstat') and 'lsof' for process identification."
  },
  "interview_kill_shot": "'ss -tulnp' is the modern standard for checking open ports and listening process IDs on Linux."
}
```

---

## 7. UI Rendering & CSS Mapping

When rendered by `index.html`, properties map directly to CSS classes:

| Schema Property | HTML Container | Primary CSS Class |
| :--- | :--- | :--- |
| `title` | `<h2>` | `.scenario-title` |
| `prompt` | `<div>` | `.prompt-box` |
| `chips` | `<span>` array | `.chip` |
| `definition` | `<div>` | `.definition-card` |
| `architecture_flow.diagram` | `<pre>` | `.ascii-diagram` |
| `tradeoff_matrix` | `<table>` | `.comparison-table` |
| `interview_answer.response` | `<p>` array | `.answer-response-p` |
| `interview_kill_shot` | `<div>` | `.kill-shot-box` |

---

## 8. Contributor Validation Checklist

Before merging new questions into any dataset (`merged.json` or standalone JSON files), verify the following:

- [ ] **Unique ID**: Ensure `id` matches `QXXXX` format and does not collide with existing IDs.
- [ ] **Valid Category**: Ensure `categoryId` exists in `category_config.json`.
- [ ] **Schema Match**: If `schema === 'architecture'`, ensure `architecture_flow` is defined. If `tradeoff`, ensure `tradeoff_matrix` is defined. If `timeline`, ensure `timeline_flow` is defined.
- [ ] **Zero-Template Authenticity**: Ensure `interview_answer.response` does NOT contain boilerplate template phrasing (e.g., `"When addressing..."`) and `interview_kill_shot` is a crisp, domain-specific summary sentence.
- [ ] **Spoken Pacing**: Ensure `interview_answer.response` is an array of strings (2–4 paragraphs) rather than one massive unformatted text block.
- [ ] **ASCII Integrity**: Ensure `architecture_flow.diagram` uses standard ASCII/box-drawing arrows (`──>`, `├──`, `└──`) without unescaped JSON characters.
