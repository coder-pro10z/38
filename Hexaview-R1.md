
## Background & Project Experience

* Can you brief me about yourself and your background?
* Do you have experience working with AWS?
* Can you walk me through your current project architecture and responsibilities?
* How did you calculate the specific metric of "35% reduction in manual efforts" on your resume?

## Infrastructure as Code (Terraform)

* Are you writing Terraform modules from scratch or using HashiCorp modules?
* What directory structure are you following for your Terraform code?
* Have you ever created custom Terraform modules?
* How are you passing variables into Terraform modules?
* **Scenario:** You need to create the exact same infrastructure across 3 different environments (Dev, Stage, Production) where only values like VPCs and subnets change. How would you manage this creation and workspace?
* How are you managing your Terraform state files?
* What is "Terraform state drift" and why does it happen?

## Operating Systems (Linux)

* How would you rate your proficiency in Linux?
* What is the `top` command used for?
* What is the `grep` command used for?

## Containerization (Docker & Kubernetes)

* Do you have an understanding of Kubernetes, Docker, and containers?
* Have you written a Dockerfile? Can you explain the architecture and required components?
* What is the difference between the `CMD` and `ENTRYPOINT` instructions in a Dockerfile?

## Configuration Management (Ansible) & Scripting

* How would you rate yourself in Python?
* What specific problem is solved by Ansible in your projects?
* What is the difference between Roles and Tasks in Ansible?
* What is an Ansible Playbook?
* What is an Ansible Inventory and how does it relate to the playbook?

## CI/CD (Azure DevOps)

* Which CI/CD tools do you have hands-on experience with?
* Can you provide a step-by-step overview of your standard Azure DevOps CI pipeline?
* How are you securely passing variables and secrets between pipeline stages?
* Which pipeline agents are you using: self-hosted or Microsoft-hosted?
* How many deployment environments do you manage?
* How are you promoting code from pre-production to production using blue-green deployment?

## Monitoring & Logging

* Can you explain your exact responsibilities regarding monitoring and logging using tools like Azure Monitor, Log Analytics, and Grafana?

## Logic Assessment

* Find the next number in the following sequence: **3, 7, 13, 21, ?** *(Answer: 31)*


# Slide 1 – Introduction & Background

## About Me

* DevOps Engineer with experience in Azure DevOps, Terraform, Docker, Kubernetes, Ansible, Linux, and Monitoring.
* Expertise in Infrastructure as Code (IaC), CI/CD automation, cloud deployments, and operational excellence.
* Experience managing multi-environment deployments and release pipelines.

## Current Responsibilities

* CI/CD Pipeline Development
* Infrastructure Automation
* Cloud Resource Provisioning
* Container Platform Management
* Monitoring & Alerting
* Release Management

---

# Slide 2 – Current Project Architecture

## High-Level Architecture

Developer
↓
Azure Repos/Git
↓
Azure DevOps Pipeline
↓
Terraform
↓
Azure Infrastructure
↓
Docker Containers
↓
AKS / App Service
↓
Azure Monitor + Grafana

## Responsibilities

* Build CI/CD pipelines
* Manage Terraform infrastructure
* Container image creation
* AKS deployments
* Monitoring and alerting
* Production support

---

# Slide 3 – Measuring 35% Reduction in Manual Effort

## Before Automation

* Manual deployments
* Manual VM provisioning
* Manual release validation
* Manual configuration updates

Time Required:
~20 Hours/Week

## After Automation

* Automated Terraform provisioning
* Automated CI/CD deployments
* Automated monitoring

Time Required:
~13 Hours/Week

Reduction:

((20 - 13) / 20) × 100

= 35%

Interview Answer:
"The metric was calculated based on actual effort tracking before and after automation initiatives."

---

# Slide 4 – Terraform Fundamentals

## Terraform Modules

Options:

1. HashiCorp Registry Modules
2. Custom Modules

Example:

modules/
├── network
├── aks
├── storage
└── monitoring

## When To Create Custom Modules

* Company standards
* Reusable infrastructure
* Governance requirements

---

# Slide 5 – Terraform Directory Structure

terraform/
├── modules/
│   ├── vnet
│   ├── aks
│   └── storage
│
├── environments/
│   ├── dev
│   ├── stage
│   └── prod
│
├── main.tf
├── variables.tf
├── outputs.tf
└── backend.tf

Benefits:

* Reusability
* Environment isolation
* Maintainability

---

# Slide 6 – Terraform Variables & Multi-Environment Strategy

## Module Variables

module "network" {
source = "../../modules/vnet"

vnet_name = var.vnet_name
subnet_id = var.subnet_id
}

## Environment Specific Files

dev.tfvars
stage.tfvars
prod.tfvars

## Same Infrastructure

Code Reuse = 100%

Only values change.

---

# Slide 7 – Terraform State Management

## Backend

Azure Storage Account

terraform.tfstate

## State Locking

Azure Blob Lease Lock

## Benefits

* Shared state
* Team collaboration
* State protection

---

# Slide 8 – Terraform State Drift

## Definition

Infrastructure differs from Terraform state.

Example:

Terraform:
VM Size = Standard_B2s

Portal:
VM Size = Standard_D4s

Result:

State Drift

## Prevention

* Avoid manual changes
* Terraform plan reviews
* Regular drift detection

---

# Slide 9 – Linux Basics

## Linux Proficiency

Intermediate to Advanced

## Common Commands

### top

Displays:

* CPU Usage
* Memory Usage
* Running Processes

### grep

Searches text patterns.

Example:

grep ERROR application.log

---

# Slide 10 – Docker Fundamentals

## Container Architecture

Application
↓
Docker Image
↓
Container Runtime
↓
Host OS

## Dockerfile Components

* Base Image
* COPY
* RUN
* EXPOSE
* CMD
* ENTRYPOINT

---

# Slide 11 – CMD vs ENTRYPOINT

## CMD

Provides default arguments.

Example:

CMD ["python","app.py"]

Can be overridden.

## ENTRYPOINT

Defines executable.

Example:

ENTRYPOINT ["python","app.py"]

Cannot be easily replaced.

Interview Answer:

"ENTRYPOINT defines the main process while CMD provides default parameters."

---

# Slide 12 – Kubernetes Overview

## Core Components

Pod
↓
Deployment
↓
Service
↓
Ingress

## Responsibilities

* Scaling
* Self-healing
* Load balancing
* Rolling deployments

---

# Slide 13 – Ansible Fundamentals

## Why Ansible?

Problem Solved:

Configuration consistency.

Examples:

* Install packages
* Configure servers
* Patch systems
* Application deployment

## Agentless Architecture

Controller
↓
SSH
↓
Managed Nodes

---

# Slide 14 – Ansible Roles, Tasks & Inventory

## Task

Single Action

Example:

Install nginx

## Role

Collection of:

* Tasks
* Templates
* Variables
* Handlers

## Inventory

Defines managed servers.

Example:

[webservers]
server1
server2

## Playbook

Orchestrates execution.

site.yml

---

# Slide 15 – Azure DevOps CI/CD & Monitoring

## CI Pipeline

Git Commit
↓
Build
↓
Static Analysis
↓
Unit Test
↓
Artifact Creation
↓
Push to ACR

## CD Pipeline

Deploy UAT
↓
QA Approval
↓
Deploy PreProd
↓
Smoke Test
↓
Blue-Green Production Deployment

## Secret Management

* Azure Key Vault
* Variable Groups
* Service Connections

## Agents

* Microsoft Hosted
* Self Hosted

## Monitoring

Tools:

* Azure Monitor
* Log Analytics
* Grafana
* Application Insights

Metrics:

* Availability
* CPU
* Memory
* Error Rate
* Response Time

---

# Bonus Slide – Logic Assessment

Sequence:

3, 7, 13, 21, ?

Differences:

+4
+6
+8
+10

Answer:

31
