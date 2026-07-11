# Phase 1 — Schema Selection & Complete Answer Examples

> **Reference:** [`INTERVIEW_ANSWER_SCHEMA_DOCUMENTATION.md`](file:///C:/Users/Praveen/Desktop/kubernetes/38/INTERVIEW_ANSWER_SCHEMA_DOCUMENTATION.md)
> This document shows **which schema to use for each Phase 1 question** and provides a **complete real JSON example** so every contributor knows exactly what to write.

---

## Schema Decision Table — Phase 1 (8 Questions)

| ID | Title | Schema Chosen | Why |
| :--- | :--- | :---: | :--- |
| Q0208 | What are your day-to-day responsibilities? | `architecture` | Describes a daily workflow with sequential steps (morning checks → pipelines → IaC → standup) |
| Q0209 | What is your role in the deployment process? | `architecture` | Describes a linear deployment pipeline flow (code → build → test → deploy → monitor) |
| Q0210 | Describe a challenging production issue you resolved | `architecture` | Incident triage has a clear step-by-step sequence (detect → isolate → rollback → RCA → fix) |
| Q0211 | CI vs CD | `tradeoff` | Compares two distinct concepts across multiple dimensions — perfect comparison table |
| Q0212 | Variable Groups & Secret Management | `architecture` | Describes a pipeline secret flow (Key Vault → Variable Group → Pipeline → Runtime) |
| Q0213 | Self-hosted vs Microsoft-hosted Agent | `tradeoff` | Directly compares two agent types — best shown as a comparison matrix |
| Q0214 | Secure Files & Key Vault Integration | `architecture` | Describes an integration setup flow (upload → task reference → pipeline injection) |
| Q0233 | Declarative vs Scripted Jenkins Pipelines | `tradeoff` | Directly compares two pipeline syntaxes — best shown as a comparison matrix |

---

## Rule of Thumb: When to Pick Each Schema

```
Is the question asking HOW something works or flows step by step?
  → architecture   (numbered steps + ASCII flow diagram)

Is the question asking the DIFFERENCE between two or more things?
  → tradeoff       (comparison table with dimensions as rows)

Is the question about a multi-stage LIFECYCLE or PROCESS (CI/CD, SDLC, incident phases)?
  → timeline       (vertical milestone nodes)
```

---

## Section 1: `architecture` Schema — How the Data Is Structured

### What the upgrade script provides for each `architecture` question:

```json
{
  "title":              "Full corrected question title",
  "definition":         "1-2 sentence technical definition of the concept.",
  "why_it_matters":     "Why this matters in a production/enterprise DevOps environment.",
  "real_world_scenario":"Concrete scenario at Coforge/AKS level where this directly applies.",
  "chips":              ["Keyword1", "Keyword2", "Keyword3", "Keyword4"],
  "schema":             "architecture",
  "architecture_flow": {
    "steps": [
      "1. Step one: What happens first.",
      "2. Step two: What happens next.",
      "3. Step three: Final outcome or result."
    ],
    "diagram": "Start ──> Step A ──> Step B ──> Step C ──> Result"
  },
  "interview_answer": {
    "response": [
      "Paragraph 1: Opening statement that directly answers the question.",
      "Paragraph 2: Deeper technical elaboration with specific tool names or commands.",
      "Paragraph 3: Real-world impact or how you applied this at Coforge/production."
    ],
    "why": "One sentence explaining why this spoken structure impresses a senior interviewer."
  },
  "interview_kill_shot": "One punchy closing sentence summarising the core takeaway."
}
```

---

## Complete Example 1: `architecture` Schema
### Q0208 — What are your day-to-day responsibilities?

```json
{
  "id": "Q0208",
  "categoryId": "C015",
  "title": "Day-to-Day Responsibilities as an Azure DevOps Engineer",
  "prompt": "What are your day-to-day responsibilities?",
  "type": "HR / Behavioral",
  "difficulty": "Easy",
  "chips": ["Azure DevOps", "AKS", "Terraform", "Monitoring", "Pipelines"],
  "schema": "architecture",
  "definition": "The routine operational and engineering activities an Azure DevOps Engineer performs daily to maintain CI/CD pipelines, cloud infrastructure, and deployment reliability.",
  "why_it_matters": "Interviewers use this question to confirm you have genuine hands-on daily engagement — not just theoretical knowledge of DevOps tools.",
  "real_world_scenario": "At Coforge, a DevOps engineer starts each day verifying overnight pipeline runs and AKS pod health before developers begin their sprint work.",
  "architecture_flow": {
    "steps": [
      "1. Morning Health Check: Review Azure Monitor alerts, Grafana dashboards, and overnight pipeline run summaries for failures or degraded pods.",
      "2. Pipeline Maintenance: Investigate and fix any broken CI/CD stages — build failures, failed test gates, or deployment rollbacks in Azure DevOps.",
      "3. Infrastructure Tasks: Write or update Terraform modules for new infrastructure changes raised in sprint tickets; review PRs for IaC changes.",
      "4. Kubernetes Operations: Check AKS cluster node health, pod restarts, HPA scaling events, and resource quota utilisation.",
      "5. Collaboration & Handover: Participate in standup, unblock developer deployment issues, document runbook changes, and hand over active incidents."
    ],
    "diagram": "Alerts & Dashboard Check ──> Pipeline Fixes ──> Terraform IaC Work ──> AKS Health Ops ──> Standup & Handover"
  },
  "interview_answer": {
    "response": [
      "My day typically starts with a morning health check — I review Azure Monitor alerts, check Grafana dashboards, and scan overnight Azure DevOps pipeline run summaries to catch any failures before developers begin work.",
      "Once I know the environment is stable, I move into active engineering tasks. On most days this means maintaining CI/CD pipelines in Azure DevOps — fixing broken stages, tuning test gates, or updating deployment approvals. I also work on Terraform modules for new infrastructure changes coming from sprint tickets and review IaC pull requests from the team.",
      "Throughout the day I check AKS cluster health — node resource pressure, unexpected pod restarts, and HPA scaling events. I also stay available to unblock developers on deployment or build issues and participate in the daily standup. At the end of the day I update runbooks and hand over any open incidents."
    ],
    "why": "Starting the answer with a concrete 'morning health check' routine immediately proves you have operational ownership — not just theoretical DevOps knowledge."
  },
  "interview_kill_shot": "Every day I balance three priorities: keeping pipelines green, keeping infrastructure immutable, and unblocking developers so they can ship without friction."
}
```

---

## Section 2: `tradeoff` Schema — How the Data Is Structured

### What the upgrade script provides for each `tradeoff` question:

```json
{
  "title":              "Full corrected question title",
  "definition":         "1-2 sentence definition of the concept being compared.",
  "why_it_matters":     "Why choosing correctly between these options matters in production.",
  "real_world_scenario":"Concrete scenario where the wrong choice caused a problem or the right choice saved the day.",
  "chips":              ["Keyword1", "Keyword2", "Keyword3", "Keyword4"],
  "schema":             "tradeoff",
  "tradeoff_matrix": {
    "dimensions": [
      "Dimension 1 (e.g. Trigger)",
      "Dimension 2 (e.g. Purpose)",
      "Dimension 3 (e.g. Artefact Produced)",
      "Dimension 4 (e.g. Failure Mode)"
    ],
    "options": [
      {
        "name": "Option A Name",
        "values": [
          "Value for Dimension 1",
          "Value for Dimension 2",
          "Value for Dimension 3",
          "Value for Dimension 4"
        ]
      },
      {
        "name": "Option B Name",
        "values": [
          "Value for Dimension 1",
          "Value for Dimension 2",
          "Value for Dimension 3",
          "Value for Dimension 4"
        ]
      }
    ]
  },
  "interview_answer": {
    "response": [
      "Paragraph 1: Define Option A clearly with real examples.",
      "Paragraph 2: Define Option B clearly with real examples.",
      "Paragraph 3: Explain when and why you pick one over the other in real projects."
    ],
    "why": "One sentence on why this comparison structure impresses the interviewer."
  },
  "interview_kill_shot": "One punchy closing sentence summarising the key distinction."
}
```

---

## Complete Example 2: `tradeoff` Schema
### Q0211 — CI vs CD

```json
{
  "id": "Q0211",
  "categoryId": "C002",
  "title": "Continuous Integration (CI) vs Continuous Delivery / Deployment (CD)",
  "prompt": "What is the difference between CI and CD?",
  "type": "CI/CD",
  "difficulty": "Easy",
  "chips": ["CI", "CD", "Azure DevOps", "Pipeline Stages", "Automation"],
  "schema": "tradeoff",
  "definition": "CI (Continuous Integration) is the practice of automatically validating every code commit through build and test pipelines. CD (Continuous Delivery/Deployment) extends CI by automating the release of validated artefacts into target environments.",
  "why_it_matters": "Confusing CI with CD leads to under-automating releases or shipping untested code — a critical gap in production-grade DevOps pipelines.",
  "real_world_scenario": "At Coforge, CI runs on every pull request to validate Docker build and unit test coverage, while CD gates the Staging to Production promotion behind a manual approval and change request ticket.",
  "tradeoff_matrix": {
    "dimensions": [
      "Trigger",
      "Primary Goal",
      "Output / Artefact",
      "Human Approval Required?",
      "Failure Mode Impact"
    ],
    "options": [
      {
        "name": "CI (Continuous Integration)",
        "values": [
          "Every code commit / pull request to the main branch",
          "Validate code quality — build, lint, unit test, static analysis",
          "Immutable versioned container image pushed to ACR / artifact registry",
          "No — fully automated, developer self-service",
          "PR is blocked / developer gets notified immediately — isolated to one developer"
        ]
      },
      {
        "name": "CD (Continuous Delivery / Deployment)",
        "values": [
          "Successful CI completion (and optional approval gate)",
          "Deploy the validated artefact safely into Staging or Production",
          "Running workload in target environment (AKS Deployment, App Service release)",
          "Continuous Delivery: Yes (manual gate before Production). Continuous Deployment: No (fully automated end-to-end)",
          "Wrong environment gets broken release — affects all users on that environment"
        ]
      }
    ]
  },
  "interview_answer": {
    "response": [
      "CI — Continuous Integration — is the practice of automatically building, linting, and testing every code commit as soon as it is pushed. The goal of CI is to catch bugs and integration issues before they merge into the main branch. The output of a successful CI run is an immutable, versioned artefact — for us that is a Docker image pushed to Azure Container Registry with a Git commit SHA tag.",
      "CD — Continuous Delivery or Continuous Deployment — picks up where CI leaves off. It takes that validated artefact and automates the deployment into target environments. Continuous Delivery adds a manual approval gate before Production, while Continuous Deployment goes all the way to Production automatically with zero human intervention.",
      "In our Azure DevOps pipelines at Coforge, CI runs on every pull request and must pass before merging. CD then deploys to Staging automatically, but the Production promotion requires a formal change request approval — this keeps human oversight over production while still automating everything else."
    ],
    "why": "Clearly separating CI artefact production from CD environment promotion, and distinguishing Continuous Delivery from Continuous Deployment, demonstrates genuine pipeline design experience beyond just using the buzzwords."
  },
  "interview_kill_shot": "CI proves code is safe to ship by producing a validated artefact; CD proves it is shipped safely by deploying that artefact into gated environments."
}
```

---

## Key Rules for Phase 1 Answer Writing

| Rule | Requirement |
| :--- | :--- |
| **No generic openers** | Never start with `"When addressing..."` or `"My approach focuses on enterprise reliability..."` |
| **Name real tools** | Always name specific tools: `kubectl`, `terraform apply`, `Azure DevOps YAML`, `Grafana`, `Log Analytics`, `Helm`, `ACR` |
| **Coforge context** | At least one `response` paragraph should reference a real scenario from a Coforge/AKS/Azure DevOps context |
| **Kill shot rule** | The `interview_kill_shot` must be a crisp standalone sentence a candidate could say confidently at the end — not a summary of what was just said |
| **Tradeoff dimensions** | `tradeoff_matrix.dimensions` must be genuinely different evaluation axes — not synonyms or repetitions |
| **Steps are numbered** | Every `architecture_flow.steps` entry starts with `"1. "`, `"2. "`, etc. |
| **Diagram is one line** | `architecture_flow.diagram` is a single ASCII line showing the flow — not a multi-line block |
