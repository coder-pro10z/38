# 🎯 Enterprise Full-Stack & DevOps Interview Study Dashboard

> An interactive, single-page study dashboard designed to help you master **47 real-world DevOps & Cloud interview scenarios** — including **26 rapid-fire questions** pulled from actual recent interviews.

---

## 📖 What This Application Does

This is a **client-side web application** that presents DevOps and Cloud Engineering interview preparation material in a structured, card-based dashboard format. It is designed to simulate the types of questions, troubleshooting scenarios, architecture decisions, and rapid-fire rounds encountered in **real enterprise interviews**.

### Key Features

| Feature | Description |
|---|---|
| **📚 Learn Mode** | Browse all 47 scenarios with full details — definitions, architecture flows, RCA breakdowns, and kill-shot answers. |
| **🧪 Practice Mode** | Hide solutions behind a reveal button to simulate being asked the question live. |
| **📝 Review Mode** | Focus only on scenarios you haven't marked as "Done" — tracks your mastery progress. |
| **⚡ Rapid Fire Mode** | Isolates the rapid-fire Q&A accordion for a specific topic — click to reveal kill-shot answers. Perfect for last-minute interview prep. |
| **🗂 Scenario Index** | Slide-up modal showing all scenarios with status indicators (🟢 Done / 🟠 Review / 🟡 Revisit). |
| **🎨 Confidence Rating** | Mark each scenario as Done, Review, or Revisit to track your study progress. |
| **⌨️ Keyboard Navigation** | Use `←` and `→` arrow keys to quickly flip through scenarios. |

---

## 🏗 Application Architecture

```
38/
├── index.html                                # Main dashboard (HTML + CSS + JS, single file)
├── devops_interview_study_dashboard_38.html   # Identical copy of index.html
├── scenarios.json                            # All 47 scenario data objects (loaded via fetch)
├── 9Slides.json                              # Source file for the 9 newest "v3" slides
└── README.md                                 # This file
```

### Tech Stack

- **Pure HTML/CSS/JS** — No frameworks, no build tools, no dependencies
- **External JSON** — Scenarios are loaded from `scenarios.json` via `fetch()`
- **Responsive** — Mobile-first design with breakpoints at 400px, 600px, and 1024px
- **Dark Theme** — Enterprise-grade dark UI with Inter + JetBrains Mono typography

### How to Run

```bash
# Navigate to this directory
cd 38/

# Start a local server (required for fetch to load scenarios.json)
python3 -m http.server 8000

# Open in your browser
open http://localhost:8000
```

> ⚠️ **Note:** Opening `index.html` directly via `file://` will fail due to CORS restrictions on `fetch()`. You must use a local HTTP server.

---

## 📊 Content Coverage Overview

The dashboard covers **47 scenarios** across **3 schema generations**, organized into the following domains:

### Scenario Breakdown by Type

| Category | Count | Schema | Topics |
|---|---|---|---|
| **Troubleshooting** | 12 | v1, v3 | AKS, Terraform, App Service, Docker, Jenkins, GitHub Actions, Azure SQL, Production Debugging |
| **Incident Response** | 4 | v1 | Deployment outages, production incidents, monitoring alerts, Terraform destruction recovery |
| **Architecture & Decision** | 4 | v1, v2 | Cost optimization, release rollback strategies, RBAC access control, system design |
| **Platform Deep Dives** | 20 | v2 | Azure PaaS, AKS, Terraform, Jenkins, GitHub Actions, Docker, Monitoring, Security, DR, FinOps |
| **Interview Playbook (Recent)** | 9 | v3 | VNet/Peering, Routing/Endpoints, HA/Traffic, IaC Modules, Ansible, Environments, Containers, CI/CD, Observability |

### Difficulty Distribution

| Difficulty | Count |
|---|---|
| 🟢 Intermediate | 19 |
| 🔴 Advanced | 28 |

---

## 🗂 Full Scenario Index

### 🔵 Section 1 — Real-World Troubleshooting & Incidents (Scenarios 1–18)

| # | Scenario | Type | Difficulty | Key Tags |
|---|---|---|---|---|
| 1 | AKS Deployment Failing After Release | Troubleshooting | Intermediate | AKS, kubectl, ACR, Helm, CI/CD |
| 2 | Terraform Apply Fails in Production | Troubleshooting | Advanced | Terraform, State, CI/CD, IaC |
| 3 | Application Unavailable After Deployment | Incident | Intermediate | Deployment, Traffic, LoadBalancer, Outage |
| 4 | Cloud Bill Increased by 50% | Decision | Advanced | FinOps, Cost, Architecture, Governance |
| 5 | App Service Cannot Access SQL | Troubleshooting | Intermediate | AppService, SQL, Networking, DNS, NSG |
| 6 | AKS Pods Not Scaling | Troubleshooting | Advanced | AKS, HPA, Metrics, Autoscaler |
| 7 | Pipeline Takes 40 Minutes | Architecture | Intermediate | CI/CD, Optimization, DevEx, Builds |
| 8 | Production Outage at 2 AM | Incident | Advanced | Incident, OnCall, RCA, Communication |
| 9 | Deployment Failed During Release Window | Troubleshooting | Advanced | Release Mgmt, Rollback, Ownership, CI/CD |
| 10 | Jenkins Pipeline Suddenly Failing | Troubleshooting | Intermediate | Jenkins, Agent, Plugins, SCM, Workspace |
| 11 | Terraform Destroyed Resources | Incident | Advanced | Terraform, State, Drift, Recovery |
| 12 | Works Locally But Fails In Docker | Troubleshooting | Intermediate | Docker, EnvVars, Ports, Volumes, DNS |
| 13 | Passed QA But Failed Production | Troubleshooting | Advanced | Environment Parity, Secrets, Scale, Networking |
| 14 | Grafana Alert Triggered At Midnight | Incident | Intermediate | Monitoring, Incident Response, Scaling, RCA |
| 15 | GitHub Actions Not Triggering | Troubleshooting | Intermediate | GitHub Actions, Webhooks, Runners, YAML |
| 16 | App Cannot Access Azure SQL (Auth) | Troubleshooting | Intermediate | Azure SQL, Managed Identity, Firewall, Connection String |
| 17 | Release Rollback Strategy | Decision | Advanced | Blue-Green, Canary, Rollback, DB Migrations |
| 18 | Developer Needs Production Access | Decision | Intermediate | RBAC, PIM, Security, Least Privilege |

### 🟣 Section 2 — Platform & Concept Deep Dives (Scenarios 19–38)

| # | Scenario | Type | Difficulty | Key Tags |
|---|---|---|---|---|
| 19 | Azure App Service | Azure PaaS | Intermediate | Azure, App Service, PaaS, Deployment Slots, VNet Integration |
| 20 | Azure Kubernetes Service (AKS) | Containers | Advanced | AKS, Kubernetes, Azure CNI, Node Pools, Ingress |
| 21 | Terraform | Infrastructure as Code | Advanced | Terraform, IaC, State, Modules, Providers |
| 22 | Jenkins | CI/CD | Intermediate | Jenkins, Pipeline, Agent, Controller, CI/CD |
| 23 | GitHub Actions | CI/CD | Intermediate | GitHub Actions, Workflow, Runner, Secrets, OIDC |
| 24 | Docker | Containers | Intermediate | Docker, Containers, Images, Dockerfile, Volumes |
| 25 | Release Management | Deployment | Advanced | Release, Artifact, Versioning, Rollback, Approval |
| 26 | Monitoring | Operations | Intermediate | Monitoring, Metrics, Alerts, Dashboards, SLO |
| 27 | RBAC / IAM | Security | Advanced | RBAC, IAM, Managed Identity, Roles, Least Privilege |
| 28 | Troubleshooting | Operations | Advanced | Troubleshooting, Logs, Tracing, RCA, Networking |
| 29 | Git & Branching Strategy | Source Control | Intermediate | Git, Trunk-Based, Feature Branch, Release Branch, Hotfix |
| 30 | CI/CD Design Patterns | Deployment Strategy | Advanced | Blue-Green, Canary, Rolling, Feature Flags, Progressive Delivery |
| 31 | Kubernetes Deep Dive | Containers | Advanced | Pods, Deployments, Services, Ingress, StatefulSets |
| 32 | Security & DevSecOps | Security | Advanced | SAST, DAST, Dependency Scan, Container Scan, Secrets |
| 33 | Azure Key Vault | Security | Intermediate | Key Vault, Secrets, Keys, Certificates, RBAC |
| 34 | Observability | Operations | Advanced | Metrics, Logs, Traces, OpenTelemetry, Application Insights |
| 35 | Incident Management | Operations | Advanced | Severity, Escalation, War Room, RCA, Postmortem |
| 36 | Disaster Recovery & Backup | Business Continuity | Advanced | RTO, RPO, Failover, Geo-Replication, Backup |
| 37 | Cost Optimization (FinOps) | Cloud Governance | Intermediate | Rightsizing, Reserved Instances, Spot, Autoscaling, Lifecycle |
| 38 | System Design for DevOps Engineers | Architecture | Advanced | Availability, Scalability, Security, Operations, Cost |

### 🔥 Section 3 — Recent Interview Playbook with Rapid Fire Q&A (Scenarios 39–47)

These 9 slides were built from **questions asked in actual recent interviews**. Each includes a dedicated **Rapid Fire Q&A** section with kill-shot answers.

| # | Scenario | Category | Difficulty | Key Tags | Rapid Fire Qs |
|---|---|---|---|---|---|
| 39 | Azure Virtual Networks: Core & Peering | Network Architecture | Intermediate | VNet, Subnetting, Peering, Hub-and-Spoke, IPAM | 3 |
| 40 | Routing & Secure Endpoint Solutions | Routing & Endpoints | Advanced | UDR, Private Endpoint, Service Endpoint, NSG, Private Link | 3 |
| 41 | High Availability & Traffic Management | Load Balancing & App Delivery | Advanced | Front Door, Application Gateway, Availability Sets/Zones, Layer 7 | 2 |
| 42 | Enterprise IaC Module Architectures | Terraform | Advanced | Terraform, State Drift, Remote Backend, Wrapper Modules, HCL | 3 |
| 43 | Configuration Management & Orchestration | Ansible | Intermediate | Ansible, Idempotency, Playbooks, Roles, Agentless | 3 |
| 44 | Environment Architecture & Artifact Lifecycle | Environments | Intermediate | Immutability, Artifact Promotion, Variable Groups, DRY, UAT | 3 |
| 45 | Containerization & Microservices Infrastructure | Docker & Containers | Advanced | Docker, Dockerfile, Multi-Stage Build, AKS, Container Apps | 3 |
| 46 | Continuous Delivery Design & Federation | Azure DevOps | Advanced | Azure DevOps, OIDC, YAML Pipelines, Hosted Agents, Workload Identity | 3 |
| 47 | Observability & Live Production Triage | Troubleshooting | Advanced | Linux Diagnostics, KQL, App Insights, RCA, Incident Management | 3 |

---

## 🧠 Concepts Covered

The following enterprise-grade concepts are explored across the 47 scenarios:

### Networking & Security
- CIDR Allocations & Subnetting
- Hub-and-Spoke Topology
- VNet Peering & Link Symmetry
- DNS Record Overrides
- Next-Hop Redirection (UDR)
- Private Link Fabric & Private Endpoints
- Service Endpoints vs Private Endpoints
- NSG Rules & Firewall Configuration
- Subnet Isolation Strategies
- RBAC, IAM & Least Privilege
- Managed Identity & OIDC Federation
- Key Vault Secrets Management
- DevSecOps (SAST, DAST, Container Scan)

### Load Balancing & High Availability
- Layer 7 Request Inspection
- Anycast Global Networks (Azure Front Door)
- Regional Gateway Ingress (Application Gateway)
- Availability Sets vs Availability Zones
- Multi-Facility Failure Safeguards
- Disaster Recovery (RTO/RPO, Geo-Replication)
- Blue-Green, Canary & Rolling Deployments
- Progressive Delivery with Feature Flags

### Infrastructure as Code
- Terraform State Sync & Drift Detection
- Remote Backend Locking
- Wrapper Modules & Encapsulated Blueprints
- Module Partitioning & Strict Input Controls
- ClickOps Mitigation
- Immutable Delivery Manifests

### Configuration Management
- Agentless Automation Architectures (Ansible)
- Idempotent State Definitions
- Dynamic Node Discoveries
- Structured Playbook & Role Frameworks
- SSH Orchestration Patterns
- Configuration Drift Detection

### CI/CD & Delivery
- YAML Pipeline Design (Azure DevOps, GitHub Actions)
- OIDC Token Exchange (Workload Identity Federation)
- Downstream Parameter Injections
- Granular Access Boundary Scoping
- Artifact Promotion & Immutability
- Build Once, Deploy Many
- Code Promotion Workflows
- Compilation Decoupling
- Blast Radius Mitigation (Ring Deployments)

### Containers & Orchestration
- Multi-Stage Docker Builds
- Distroless Runtime Images
- Layer Cache Optimizations
- Pod Lifecycle Debugging (CrashLoopBackOff)
- AKS vs Azure Container Apps
- HPA Auto-Scaling & Metrics Server
- Kubernetes Services, Ingress & StatefulSets

### Observability & Incident Response
- Resource Usage Identification (`top`, `ps`)
- Pattern Filtering Methods (`grep`, `journalctl`)
- KQL Query Diagnostics (Log Analytics)
- Application Insights Instrumentation
- OpenTelemetry Traces & Metrics
- Post-Deployment Incident Triaging
- OOM Isolation & Memory Debugging
- System Outage Remediation
- RCA (Root Cause Analysis) & 5 Whys Framework
- War Room & Escalation Procedures

### Cloud Governance & FinOps
- Cost Optimization & Rightsizing
- Reserved Instances & Spot VMs
- Autoscaling Lifecycle Policies
- Environment Parity Enforcement

---

## 🏷 Keywords Index

A quick-reference index of all keywords tracked by the dashboard's Quick Recall system:

| Domain | Keywords |
|---|---|
| **Networking** | Backbone Routing, Overlapping IPs, IPAM Strategy, Private IP Mapping, Firewall Bypass Protection, Subnet Isolation |
| **Load Balancing** | Regional Gateway Ingress, Physical Rack Isolation, Global Edge Optimization |
| **IaC** | ClickOps Mitigation, Centralized Backend Locking, Immutable Delivery Manifests |
| **Config Management** | SSH Orchestration, Configuration Drifts, Structured Playbook Frameworks |
| **Environments** | Code Promotion Workflows, Compilation Decoupling, Blast Radius Mitigation |
| **Containers** | Distroless Configurations, Runtime Property Overrides, Pod Lifecycle Debugging |
| **CI/CD** | Federated Cloud Identities, Zero Secret Configurations, As-Code Pipeline Blueprints |
| **Observability** | OOM Isolation, KQL Query Diagnostics, Post-Deployment Incident Triaging |

---

## 🔧 Key CLI Commands Covered

```bash
# Azure Networking
az network vnet list
az network vnet peering show
az network nic show-effective-route-table
dig backend.database.windows.net

# Azure Load Balancing
az network application-gateway show
az network front-door show

# Terraform
terraform import
terraform plan -out=tfplan

# Ansible
ansible-playbook -i static_hosts site.yml
ansible-vault decrypt secrets.yml

# Azure DevOps
az pipelines variable-group list
echo "##vso[task.setvariable variable=x;isOutput=true]val"
az account show

# Docker & Kubernetes
docker build --target builder -t app:test .
kubectl describe pod app-pod

# Linux Diagnostics
journalctl -u api-service.service --since "1 hour ago"
ps aux | grep node
top -b -n 1 | head -n 20
grep -i -C 5 "Exception" /var/log/apps/api-service.log | tail -n 50
```

---

## ⚡ Rapid Fire Questions (26 Total)

These are questions **actually asked in recent interviews**, with memorizable "kill shot" answers:

| Topic | Sample Question |
|---|---|
| **VNet Peering** | "Can we peer two VNets that have the same address space range?" |
| **Routing** | "Can you differentiate between a service endpoint and a private endpoint?" |
| **HA** | "What is the difference between Front Door and Application Gateway?" |
| **Terraform** | "Can you explain what 'Terraform state drift' is?" |
| **Ansible** | "What is the difference between Roles and Tasks in Ansible?" |
| **Environments** | "How are you promoting code from pre-prod to prod?" |
| **Docker** | "What is the difference between CMD and ENTRYPOINT?" |
| **CI/CD** | "How are you passing variables between CI/CD stages?" |
| **Observability** | "What is the `top` command used for?" |

---

## 📱 UI Modes Reference

| Mode | Shortcut | Behavior |
|---|---|---|
| **Learn** | Default | Shows all content for each scenario |
| **Practice** | Click "Practice" | Hides solution behind a "Reveal" button |
| **Review** | Click "Review" | Filters to only non-mastered scenarios, shows progress bar |
| **Rapid Fire** | Click "Rapid Fire" | Shows only the Q&A accordion for the current topic |

---

## 📄 License

This project is for personal interview preparation use.
