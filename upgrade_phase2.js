const fs = require('fs');
const path = require('path');

const locusPath  = path.join(__dirname, 'infinite_locus.json');
const mergedPath = path.join(__dirname, 'merged.json');

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2 UPGRADES — 17 Questions
// Clusters: Terraform (Q0215-Q0220) + Docker (Q0221) +
//           AKS (Q0222-Q0223) + Linux (Q0224) + Git (Q0225-Q0231)
// ─────────────────────────────────────────────────────────────────────────────
const upgrades = {

  // ─── Q0215 ── terraform init ──────────────────────────────────────────────
  'Q0215': {
    title: 'terraform init — Provider Downloads & Backend Initialisation',
    prompt: 'What does terraform init do and why must it be the first command you run?',
    type: 'Terraform',
    difficulty: 'Easy',
    chips: ['terraform init', 'Provider Plugins', 'Backend', 'Remote State', 'Initialisation'],
    definition: 'terraform init initialises a Terraform working directory by downloading required provider plugins, configuring the remote state backend, and installing any declared modules — it must run before any plan or apply.',
    why_it_matters: 'Without init, Terraform has no provider binaries to execute API calls with and no connection to the remote state backend — every subsequent command will fail.',
    real_world_scenario: 'In our Azure DevOps CI pipeline at Coforge, the first step of every Terraform stage is terraform init with the -backend-config flag pointing to our Azure Storage Account for remote state.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Backend Configuration: Reads the backend block in main.tf (e.g. azurerm backend) and establishes a connection to the remote state store — Azure Blob Storage in our case.',
        '2. Provider Plugin Download: Reads the required_providers block and downloads the correct version of each provider binary (e.g. hashicorp/azurerm 3.x) into the .terraform/ directory.',
        '3. Module Initialisation: If the configuration references external modules (registry or Git), downloads and caches them locally under .terraform/modules/.',
        '4. Lock File Validation: Reads or creates .terraform.lock.hcl to ensure provider version consistency across all engineers and pipeline runs.',
        '5. Ready State: After init completes successfully, terraform plan and terraform apply can run against the initialised working directory.'
      ],
      diagram: 'terraform init ──> Backend Connect (Azure Storage) ──> Provider Download (azurerm, azuread) ──> Module Cache ──> Lock File ──> Ready for plan/apply'
    },
    interview_answer: {
      response: [
        'terraform init is always the first command you run in any Terraform project. It does three critical things: it configures the backend — connecting to the remote state store, in our case an Azure Storage Account container — it downloads the required provider plugins declared in the required_providers block, and it installs any external modules the configuration depends on.',
        'On a fresh CI agent or after a clone, none of the provider binaries exist in the .terraform/ directory. Without running init first, terraform plan will immediately fail because Terraform has no Azure provider binary to call Azure APIs with and no connection to read or lock the remote state.',
        'In our Azure DevOps pipelines at Coforge, we run terraform init with -reconfigure and -backend-config parameters that inject the Storage Account credentials from pipeline variables — keeping backend credentials out of the Terraform source files entirely.'
      ],
      why: 'Explaining all three init responsibilities — backend, providers, and modules — rather than just saying "it initialises the project" shows genuine Terraform operational experience.'
    },
    interview_kill_shot: 'terraform init is the bootstrap command that connects Terraform to its state backend and downloads the provider binaries — nothing else can run without it.'
  },

  // ─── Q0216 ── Terraform State Locking ────────────────────────────────────
  'Q0216': {
    title: 'Terraform State Locking — Preventing Concurrent Plan/Apply Corruption',
    prompt: 'What is Terraform state locking and why is it critical in a team environment?',
    type: 'Terraform',
    difficulty: 'Medium',
    chips: ['State Locking', 'Azure Blob Lease', 'DynamoDB', 'Concurrency', 'Remote State'],
    definition: 'Terraform state locking is a mechanism that prevents two concurrent terraform plan or apply operations from simultaneously modifying the state file — which would result in corrupted infrastructure state and non-deterministic deployments.',
    why_it_matters: 'In a team environment with multiple engineers or parallel CI pipelines, two simultaneous applies to the same state file would overwrite each other\'s changes, leaving infrastructure in an unknown state.',
    real_world_scenario: 'At Coforge, two parallel Azure DevOps pipeline runs triggered by simultaneous pull request merges would both attempt to apply Terraform changes. Without state locking on the Azure Blob Storage backend, they would corrupt each other\'s state.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Lock Acquisition: When terraform plan or apply starts, Terraform attempts to acquire an exclusive lock on the state file. For the azurerm backend this is an Azure Blob Storage lease; for AWS S3 backends it is a DynamoDB conditional write.',
        '2. Lock Held — Others Wait or Fail: While the lock is held, any other terraform plan or apply command on the same state will either wait (if configured) or immediately fail with a "state is locked" error showing the lock owner and timestamp.',
        '3. Operation Executes Safely: With the lock held, the plan or apply reads and writes state knowing no other process can concurrently modify it — guaranteeing consistency.',
        '4. Lock Released: After the plan or apply completes (success or failure), Terraform automatically releases the lock so the next operation can proceed.',
        '5. Force-Unlock (Emergency Only): If a pipeline crashes mid-apply and leaves a stale lock, terraform force-unlock <lock-id> can manually clear it — only use this when certain no apply is actively running.'
      ],
      diagram: 'terraform apply ──> Acquire Blob Lease (Lock) ──> Read State ──> Apply Changes ──> Write New State ──> Release Lease (Unlock)'
    },
    interview_answer: {
      response: [
        'Terraform state locking prevents two concurrent operations — for example two parallel CI pipeline runs — from simultaneously reading and writing the same state file. Without it, if two applies run at the same time, the second apply would overwrite the first\'s state changes, leaving your infrastructure tracking file in a corrupted, unpredictable state.',
        'The locking mechanism depends on the backend. For the azurerm backend pointing to Azure Blob Storage, Terraform uses Azure Blob Storage leases — a native Azure mechanism that grants exclusive temporary ownership of a blob. When my pipeline runs terraform apply, it acquires a lease on the state blob. Any other apply attempting to start against the same state gets a "state is locked" error and cannot proceed until the lease is released.',
        'For AWS backends, locking is done via a DynamoDB table with a conditional write. In both cases, if a pipeline crashes mid-apply and leaves a stale lock, I can use terraform force-unlock with the lock ID shown in the error message — but I always verify no live apply is running before doing so.'
      ],
      why: 'Naming the Azure Blob Storage lease mechanism specifically — not just saying "it uses a lock" — proves you have actually configured and debugged the azurerm backend in production.'
    },
    interview_kill_shot: 'State locking uses Azure Blob Storage leases to ensure only one terraform apply can modify infrastructure state at a time — preventing concurrent corruption in CI pipelines.'
  },

  // ─── Q0217 ── Terraform Outputs ──────────────────────────────────────────
  'Q0217': {
    title: 'Terraform Outputs — Exposing Values Between Modules and Pipelines',
    prompt: 'What are Terraform outputs and how do you use them in practice?',
    type: 'Terraform',
    difficulty: 'Easy',
    chips: ['Terraform Outputs', 'Module Composition', 'Remote State', 'terraform output', 'CI/CD'],
    definition: 'Terraform output blocks expose specific values from a module or root configuration — such as resource IDs, IP addresses, or connection strings — making them available to other modules, pipelines, or operators after an apply.',
    why_it_matters: 'Without outputs, resource attributes computed by Terraform (like a dynamically assigned Load Balancer IP or ACR login server URL) are invisible to downstream pipelines and dependent modules — breaking infrastructure composition.',
    real_world_scenario: 'At Coforge, our networking Terraform module outputs the AKS subnet ID and the Application Gateway public IP. The application module reads these via terraform_remote_state to configure AKS CNI networking and DNS records.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Define Output Block: Declare an output in outputs.tf with a value expression referencing a resource attribute — e.g. output "acr_login_server" { value = azurerm_container_registry.main.login_server }.',
        '2. Apply Prints Outputs: After terraform apply completes, all non-sensitive outputs are printed to console. Sensitive outputs (marked sensitive = true) are hidden but stored in state.',
        '3. Query via CLI: Run terraform output acr_login_server to retrieve a specific value. Use -json flag to get machine-readable output for scripting.',
        '4. Cross-Module Reference: A child module exposes outputs; the parent root module reads them via module.networking.subnet_id — enabling composable, loosely coupled module design.',
        '5. Remote State Reference: A separate Terraform root can read another root\'s outputs using the terraform_remote_state data source pointing to the upstream state file in Azure Blob Storage.'
      ],
      diagram: 'Resource Attribute ──> output block (outputs.tf) ──> terraform apply ──> State + CLI (terraform output -json) ──> Pipeline Variable or Remote State Reference'
    },
    interview_answer: {
      response: [
        'Terraform outputs expose values from a module or root configuration — things like resource IDs, IP addresses, connection strings, or URLs — making them available after an apply. I define them in an outputs.tf file using an output block. For example, after creating an Azure Container Registry I expose its login server URL as an output so CI pipelines can reference it without hardcoding.',
        'In practice I use outputs in two main ways. First, within module composition: a networking module outputs the AKS subnet ID, and the application module reads it via module.networking.subnet_id — this keeps modules loosely coupled without either module needing to know about the other\'s internal resources. Second, across separate Terraform roots using the terraform_remote_state data source, which reads another root\'s state file and accesses its outputs.',
        'In our CI/CD pipelines at Coforge, after a Terraform apply stage I use terraform output -json and parse the result with jq to inject dynamic values — like a newly created load balancer IP or a storage account connection string — as pipeline variables for the next deployment stage.'
      ],
      why: 'Describing both module composition (module.x.output_name) and cross-root remote state references demonstrates a mature multi-layered Terraform architecture — not just basic output printing.'
    },
    interview_kill_shot: 'Terraform outputs are the contract between modules and pipelines — they expose dynamically computed resource attributes so nothing downstream needs to be hardcoded.'
  },

  // ─── Q0218 ── Terraform Workspaces ───────────────────────────────────────
  'Q0218': {
    title: 'Terraform Workspaces — Isolated State per Environment in One Codebase',
    prompt: 'What are Terraform workspaces and when would you use them?',
    type: 'Terraform',
    difficulty: 'Medium',
    chips: ['Terraform Workspaces', 'State Isolation', 'Environment Management', 'terraform workspace', 'Multi-Env'],
    definition: 'Terraform workspaces allow a single Terraform configuration to maintain completely separate state files per environment (e.g. dev, staging, production) within the same backend — without duplicating Terraform code.',
    why_it_matters: 'Without workspaces, teams create separate directories per environment which leads to code duplication and configuration drift. Workspaces let one codebase drive multiple isolated environment deployments.',
    real_world_scenario: 'At Coforge we use Terraform workspaces to deploy the same AKS and networking Terraform configuration to Dev, Staging, and Production — each workspace maintains completely separate state so a production apply never touches dev infrastructure.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Create Workspace: Run terraform workspace new dev to create a new isolated state namespace. Terraform creates a separate state file path in the backend (e.g. env:/dev/terraform.tfstate in Azure Blob Storage).',
        '2. Select Workspace: Run terraform workspace select staging to switch context. All subsequent plan and apply commands read and write only the staging state.',
        '3. Reference Workspace in Config: Use terraform.workspace variable in resource names or var lookups — e.g. name = "${var.prefix}-${terraform.workspace}-aks" to automatically differentiate per-env resource names.',
        '4. Separate State Files: Each workspace\'s state is completely isolated. A terraform destroy in the dev workspace only destroys dev resources — staging and production are unaffected.',
        '5. List Workspaces: Run terraform workspace list to see all workspaces and identify the currently selected one (marked with *).'
      ],
      diagram: 'terraform workspace new dev ──> Separate State (env:/dev/terraform.tfstate) ──> terraform workspace select prod ──> Separate State (env:/prod/terraform.tfstate)'
    },
    interview_answer: {
      response: [
        'Terraform workspaces allow a single Terraform codebase to manage completely separate infrastructure environments — each with its own isolated state file. Instead of duplicating your Terraform code into separate dev, staging, and production directories, you keep one configuration and use workspaces to separate the state.',
        'The key commands are terraform workspace new to create a workspace and terraform workspace select to switch between them. Once I select the production workspace, every plan and apply reads and writes only the production state file stored at a separate path in Azure Blob Storage — so a destroy in dev never touches production.',
        'In the Terraform configuration itself, I reference terraform.workspace to differentiate resource names per environment — for example naming the AKS cluster resource-group-${terraform.workspace}-aks. This automatically makes dev, staging, and production deploy resources with distinct names in Azure, preventing any naming collisions. I combine this with a variable map that selects different VM sizes and node counts per workspace to right-size each environment.'
      ],
      why: 'Mentioning the terraform.workspace variable in resource naming and combining it with per-environment variable maps shows you use workspaces as a genuine multi-environment strategy — not just as a conceptual feature.'
    },
    interview_kill_shot: 'Terraform workspaces isolate state per environment within one codebase — one plan/apply command governs Dev, Staging, or Production depending on the active workspace.'
  },

  // ─── Q0219 ── Terraform depends_on ───────────────────────────────────────
  'Q0219': {
    title: 'Terraform depends_on — Explicit Resource Dependency Declaration',
    prompt: 'What is depends_on in Terraform and when do you need to use it explicitly?',
    type: 'Terraform',
    difficulty: 'Medium',
    chips: ['depends_on', 'Resource Dependencies', 'Terraform Graph', 'Implicit vs Explicit', 'Dependency Management'],
    definition: 'depends_on is a Terraform meta-argument that declares an explicit dependency between resources when Terraform cannot infer it automatically from attribute references — ensuring the dependent resource is only created after the dependency is fully provisioned.',
    why_it_matters: 'Without explicit depends_on, Terraform may attempt to create a resource before its dependency is ready, causing intermittent race condition failures that are extremely difficult to debug.',
    real_world_scenario: 'An Azure role assignment must wait for both the managed identity and the target resource group to be fully provisioned before it can be created — Terraform cannot infer this from attribute references alone, requiring explicit depends_on.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Implicit Dependencies (Preferred): When Resource B references an attribute of Resource A (e.g. resource_group_name = azurerm_resource_group.main.name), Terraform automatically infers B depends on A and provisions A first.',
        '2. When depends_on Is Needed: If Resource B depends on Resource A but does not reference any of its attributes — for example a role assignment that depends on a policy being applied — Terraform cannot infer the dependency and may provision them in parallel.',
        '3. Adding depends_on: In Resource B\'s block, add depends_on = [azurerm_resource_group.main, azurerm_role_definition.custom] to force sequential provisioning.',
        '4. Module-Level depends_on: When a module as a whole must wait for another module to complete, use depends_on at the module block level — not inside individual resources within it.',
        '5. Use Sparingly: Overusing depends_on serialises what could be parallel operations, significantly slowing apply time. Only add it when implicit inference is genuinely insufficient.'
      ],
      diagram: 'Resource A ──[implicit ref]──> Terraform infers dependency ──> Resource A created first. No ref? ──> depends_on = [Resource A] ──> Explicit ordering enforced.'
    },
    interview_answer: {
      response: [
        'Terraform automatically infers dependencies between resources when one resource references an attribute of another — for example if my AKS cluster references azurerm_resource_group.main.name, Terraform knows to create the resource group first. This implicit dependency handling covers most use cases.',
        'However, depends_on is needed when a resource depends on another but does not reference any of its specific attributes. The classic example is an Azure role assignment: the assignment needs both the managed identity and the target resource to exist, but if neither attribute is directly referenced in the assignment block, Terraform might attempt to create the role assignment before the dependencies are ready — causing a 404 error that appears intermittently.',
        'I use depends_on as a last resort because it serialises what Terraform could otherwise run in parallel, making applies slower. When I do use it, I place it at the module block level rather than inside individual resources where possible, to keep the dependency declaration clean and obvious. I always add a comment explaining why the implicit reference was insufficient.'
      ],
      why: 'Explaining implicit vs explicit dependency inference and cautioning against overuse — rather than just saying "it controls order" — proves you understand the Terraform execution graph.'
    },
    interview_kill_shot: 'Use depends_on only when Terraform cannot infer a dependency from attribute references — overusing it serialises the graph and slows apply time unnecessarily.'
  },

  // ─── Q0220 ── Terraform Provisioners ─────────────────────────────────────
  'Q0220': {
    title: 'Terraform Provisioners — Last Resort Configuration & Why to Avoid Them',
    prompt: 'What are Terraform provisioners and why are they considered a last resort?',
    type: 'Terraform',
    difficulty: 'Medium',
    chips: ['Provisioners', 'local-exec', 'remote-exec', 'Cloud-Init', 'Ansible', 'Immutability'],
    definition: 'Terraform provisioners (local-exec, remote-exec, file) execute scripts or commands on a local machine or remote resource after it is created — they are an escape hatch for operations Terraform cannot model as declarative resources.',
    why_it_matters: 'Provisioners break Infrastructure as Code immutability — they introduce non-declarative imperative logic that is invisible in terraform plan output, making infrastructure state unpredictable and difficult to reproduce.',
    real_world_scenario: 'A team used remote-exec provisioners to install agents on VMs after creation. When a pipeline failed mid-provisioner, the VM existed in state as "created" but was missing the agent — causing a mismatch between Terraform state and actual VM configuration that was impossible to reconcile with plan.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. local-exec: Runs a shell command on the machine executing Terraform — e.g. to call an external API, run a script, or trigger an Ansible playbook after a resource is created.',
        '2. remote-exec: SSH or WinRM into a newly created VM and run commands to configure it — e.g. install packages, configure services. Requires SSH access and credentials.',
        '3. file: Copy a local file to a remote resource over SSH — e.g. push a config file to a VM.',
        '4. The Problem: Provisioners run only once at creation time. If they fail partway through, Terraform marks the resource as "tainted" but the partial configuration is invisible in plan. There is no declarative reconciliation.',
        '5. Better Alternatives: Use cloud-init user_data for VM bootstrapping; Ansible playbooks for post-creation configuration; Azure Custom Script Extension for Windows VMs — all of these are idempotent and replayable.'
      ],
      diagram: 'Resource Created ──> local-exec / remote-exec (script runs) ──[fail halfway?]──> State says "created" but VM is misconfigured ──> No way to detect via plan'
    },
    interview_answer: {
      response: [
        'Terraform provides three provisioner types: local-exec runs a command on the local machine running Terraform — useful for calling external APIs or triggering tools like Ansible after resource creation. remote-exec SSHs into a newly created VM and runs commands directly on it. file copies files to a remote resource over SSH.',
        'The reason they are considered a last resort is that provisioners break the declarative model that makes Terraform predictable. If a remote-exec provisioner fails halfway through configuring a VM, Terraform marks the resource as tainted but the state file still shows the VM as created. The failed configuration is completely invisible in a terraform plan — there is no way to detect or reconcile the partial state without manually inspecting the VM.',
        'In practice I replace provisioners with better alternatives. For VM bootstrapping I use cloud-init user_data blocks, which are part of the resource declaration and visible in the plan. For post-creation configuration management I trigger Ansible playbooks from the pipeline as a separate step after Terraform apply completes — keeping IaC and configuration management clearly separated rather than mixing them inside a provisioner.'
      ],
      why: 'Explaining the "invisible in plan" failure mode — not just saying "they are fragile" — demonstrates you understand exactly why provisioners violate the IaC contract.'
    },
    interview_kill_shot: 'Provisioners break Terraform\'s declarative model — a failed remote-exec leaves infrastructure in a state that plan cannot detect or repair. Use cloud-init or Ansible instead.'
  },

  // ─── Q0221 ── Docker Image Layers ────────────────────────────────────────
  'Q0221': {
    title: 'Docker Image Layers — How Layer Caching Works & Build Optimisation',
    prompt: 'What are Docker image layers and how does layer caching affect build performance?',
    type: 'Docker',
    difficulty: 'Medium',
    chips: ['Docker Layers', 'Layer Caching', 'Dockerfile', 'BuildKit', 'Image Optimisation'],
    definition: 'A Docker image is composed of read-only layers where each Dockerfile instruction (FROM, RUN, COPY) creates a new immutable layer stacked on the previous one. Docker reuses cached layers for unchanged instructions — dramatically speeding up incremental builds.',
    why_it_matters: 'Poor Dockerfile instruction ordering causes Docker to invalidate the cache on every build for expensive layers like dependency installation — turning 30-second builds into 4-minute builds on every code change.',
    real_world_scenario: 'A Node.js service Dockerfile that COPYs all source files before running npm install rebuilds the entire dependency layer on every code change. Reordering to COPY package.json first reduces average CI build time from 4 minutes to 25 seconds.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Each Instruction = One Layer: FROM creates the base layer. Every RUN, COPY, and ADD creates an additional immutable read-only layer on top. The final image is the union of all layers.',
        '2. Cache Hit Condition: Docker checks if the instruction AND its context (files copied, command string) are identical to a previous build. If yes, it reuses the cached layer and skips execution.',
        '3. Cache Invalidation Cascade: If a layer\'s cache is invalidated (e.g. a source file changed), ALL subsequent layers must also be rebuilt — even if their instructions have not changed.',
        '4. Optimised Ordering Rule: Place instructions that change rarely (installing OS packages, copying dependency manifests) BEFORE instructions that change frequently (copying application source code). This maximises cache reuse.',
        '5. Multi-Stage Build for Final Size: Use a builder stage to compile/install everything, then copy only the production artefact into a clean minimal base image — eliminating build tools and dev dependencies from the final image.'
      ],
      diagram: 'FROM (base) ──> COPY package.json (cached) ──> RUN npm ci (cached if lock unchanged) ──> COPY . . (rebuilds here on code change) ──> CMD'
    },
    interview_answer: {
      response: [
        'Every instruction in a Dockerfile creates a separate read-only layer stacked on top of the previous one. Docker stores each layer by a content hash — if the instruction and its inputs are identical to a previous build, Docker reuses the cached layer instead of re-executing it. This is why incremental builds are fast when layer ordering is correct.',
        'The critical rule is that cache invalidation cascades downward. If a COPY instruction copies a file that has changed, that layer\'s cache is invalidated — and every instruction after it must also rebuild, even if those instructions have not changed at all. This means instruction order is everything.',
        'In practice I always structure Dockerfiles to copy dependency manifests first — COPY package.json ./ then RUN npm ci — before copying application source code. Since package.json rarely changes between commits, the expensive npm ci layer stays cached for most builds. Only the COPY . . layer and anything after it rebuild. I also use multi-stage builds so build tools and dev dependencies never end up in the final production image, keeping image size minimal.'
      ],
      why: 'Explaining cache invalidation cascade and the specific ordering pattern (manifests before source) proves you have actually optimised Dockerfile builds — not just read documentation.'
    },
    interview_kill_shot: 'Docker layer caching lives and dies by instruction order — put rarely-changing layers first so expensive dependency installs stay cached across every code commit.'
  },

  // ─── Q0222 ── AKS Node Pools ─────────────────────────────────────────────
  'Q0222': {
    title: 'AKS Node Pools — System Pool vs User Pool Architecture',
    prompt: 'What are AKS Node Pools and how do you structure them for production workloads?',
    type: 'Kubernetes / AKS',
    difficulty: 'Medium',
    chips: ['AKS', 'Node Pools', 'System Pool', 'User Pool', 'Taints & Tolerations'],
    definition: 'An AKS Node Pool is a group of virtual machines within an AKS cluster that share the same VM SKU, OS image, scaling configuration, and Kubernetes node labels — enabling workload isolation, cost optimisation, and independent scaling per pool.',
    why_it_matters: 'Running all workloads on a single node pool mixes critical system pods with application workloads — a resource-hungry application pod can starve kube-system components and cause cluster instability.',
    real_world_scenario: 'At Coforge we run a dedicated System Node Pool (Standard_D2s_v3, 3 nodes, fixed) for Kubernetes system components and a User Node Pool (Standard_D4s_v3, autoscale 2-10) for application workloads — isolating system stability from application resource pressure.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. System Node Pool: Every AKS cluster requires at least one system node pool running Linux. Kubernetes system components (CoreDNS, kube-proxy, metrics-server, CNI) run here. Tainted with CriticalAddonsOnly so no application pods schedule on it.',
        '2. User Node Pools: Additional pools for application workloads — separate by VM SKU (compute-optimised for APIs, GPU-enabled for ML), OS (Windows for .NET apps), or environment (spot instances for non-critical batch jobs).',
        '3. Node Labels & Selectors: Label each node pool (e.g. workload=api) and use nodeSelector or nodeAffinity in pod specs to control which pool a workload lands on.',
        '4. Taints & Tolerations: Taint GPU node pools with gpu=true:NoSchedule. Only pods with the matching toleration will schedule there — preventing non-GPU workloads from consuming expensive GPU nodes.',
        '5. Cluster Autoscaler: Configure min/max node counts per user pool. The cluster autoscaler adds nodes when pods are pending due to resource pressure and removes them during low traffic.'
      ],
      diagram: 'AKS Cluster ──> System Node Pool (kube-system pods, CriticalAddonsOnly taint) ──> User Pool A (API workloads, autoscale 2-10) ──> User Pool B (Spot, batch jobs)'
    },
    interview_answer: {
      response: [
        'AKS Node Pools are groups of virtual machines within the cluster that share a VM SKU, OS configuration, and scaling settings. Every AKS cluster requires at least one system node pool — this is where Kubernetes system components like CoreDNS, kube-proxy, and the metrics server run. I taint the system pool with CriticalAddonsOnly so no application pods can schedule there, protecting system stability from application resource pressure.',
        'Beyond the system pool, I create separate user node pools for different workload types. In our Coforge cluster we have a standard API pool using Standard_D4s_v3 VMs with the cluster autoscaler set to scale between 2 and 10 nodes. For batch processing jobs that can tolerate interruptions, we have a second pool using Azure Spot VMs, which reduces compute cost by up to 90% for non-critical workloads.',
        'I control which workloads land on which pool using node labels and Kubernetes taints and tolerations. The spot pool is tainted spot=true:NoSchedule. Only batch job pods with the matching toleration are allowed to schedule there — preventing critical API pods from accidentally landing on interruptible spot nodes.'
      ],
      why: 'Describing the system pool taint, the autoscaler configuration, and spot pool cost isolation shows you design node pools for production reliability and cost efficiency — not just for conceptual separation.'
    },
    interview_kill_shot: 'Always isolate Kubernetes system components in a dedicated tainted system pool — mixing them with application workloads is the most common path to cluster instability.'
  },

  // ─── Q0223 ── VNets in AKS ───────────────────────────────────────────────
  'Q0223': {
    title: 'Azure VNet Integration in AKS — CNI Networking & Private Cluster',
    prompt: 'How does Azure Virtual Network integration work with AKS and why does it matter for production clusters?',
    type: 'Kubernetes / Azure Networking',
    difficulty: 'Medium',
    chips: ['AKS', 'VNet', 'Azure CNI', 'Private Cluster', 'Kubenet', 'Networking'],
    definition: 'AKS VNet integration controls how pod and node IP addresses are allocated from Azure Virtual Network subnets and whether the Kubernetes API server is reachable from a private or public endpoint.',
    why_it_matters: 'Without proper VNet integration, AKS pods cannot directly communicate with Azure PaaS private endpoints, and the Kubernetes API server is exposed on a public IP — violating enterprise security compliance.',
    real_world_scenario: 'At Coforge, our AKS cluster uses Azure CNI with a dedicated /21 subnet, a private API server endpoint, and VNet peering to the hub VNet — so pods can reach Azure SQL private endpoints and the API server is only accessible from within the VNet.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Networking Plugin Choice: Kubenet assigns pod IPs from a separate overlay network (simpler, not routable in VNet). Azure CNI assigns pod IPs directly from the VNet subnet (pods are first-class VNet citizens, routable by NSGs and private endpoints).',
        '2. Subnet Sizing for Azure CNI: Each node consumes IPs for itself and a pre-allocated block for pods (max-pods per node, default 30). A /21 subnet (2,048 IPs) supports ~50 nodes with 30 pods each — always size generously.',
        '3. Private Cluster: Enable private cluster mode so the AKS API server gets only a private endpoint in the VNet — no public IP. Access to kubectl requires being inside the VNet or using a VPN/ExpressRoute.',
        '4. Authorized IP Ranges (Public Alternative): If private cluster is too restrictive for operator access, restrict the public API server to specific CIDR ranges (e.g. office IP, bastion subnet) using authorized IP ranges.',
        '5. Egress Control: Route all node/pod outbound traffic through an Azure Firewall or NAT Gateway to control and log internet egress from the cluster.'
      ],
      diagram: 'AKS Cluster ──[Azure CNI]──> Pods get VNet IPs (10.0.2.x) ──> Private API Server Endpoint (10.0.1.5) ──> Accessible only within VNet / VPN'
    },
    interview_answer: {
      response: [
        'AKS VNet integration comes in two forms. The first is the networking plugin choice: Kubenet assigns pods IP addresses from a private overlay network — the pods are not directly routable within the Azure VNet. Azure CNI, which we use at Coforge, assigns pod IPs directly from the VNet subnet, making pods first-class network citizens that Azure NSGs, private endpoints, and other VNet resources can route to natively.',
        'The second critical aspect is the API server endpoint. In production I always enable private cluster mode so the Kubernetes API server only has a private IP address inside the VNet — there is no public endpoint that internet scanners can probe. Our self-hosted Azure DevOps agent, which runs inside the same VNet, is the only thing that can reach kubectl. This is a hard enterprise security requirement.',
        'Subnet sizing is something teams consistently underestimate with Azure CNI. Each node pre-allocates IP addresses for the maximum pod count — with 30 pods per node and 20 nodes that is already 600 IPs. I always size the AKS subnet at /21 or larger to leave room for scaling and rolling node upgrades, which temporarily double the node count.'
      ],
      why: 'Explaining the Azure CNI pod routability advantage, private cluster API server, and subnet sizing math demonstrates you have designed and operated real AKS production networking — not just read the documentation.'
    },
    interview_kill_shot: 'Azure CNI gives AKS pods native VNet IPs for private endpoint routing; a private cluster API server removes the last public attack surface from the Kubernetes control plane.'
  },

  // ─── Q0224 ── Linux free -h ──────────────────────────────────────────────
  'Q0224': {
    title: 'Interpreting Linux Memory Usage with free -h — Available vs Free RAM',
    prompt: 'How do you check available memory on a Linux server and how do you interpret the output correctly?',
    type: 'Linux',
    difficulty: 'Easy',
    chips: ['free -h', 'RAM', 'buff/cache', 'Available Memory', 'vmstat'],
    definition: 'The free command displays total, used, free, shared, buffer/cache, and available physical memory and swap space. The "available" column is the correct metric for application memory headroom — not the raw "free" column.',
    why_it_matters: 'Misreading the "free" column as available memory causes false alarms — Linux intentionally uses free RAM as disk cache. The "available" column accounts for reclaimable cache and is the true measure of memory the OS can give to a new process.',
    real_world_scenario: 'A Kubernetes node shows only 200MB "free" RAM in free -h, triggering a high memory alert — but "available" shows 6GB because most usage is reclaimable page cache from recently accessed files. The node is healthy.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Run the Command: Execute free -h on the server (-h for human-readable MB/GB output). For real-time refresh every 2 seconds, use free -h -s 2.',
        '2. Read Total and Used: Total is physical RAM installed. Used includes actual application memory plus kernel buffers and disk cache.',
        '3. Ignore "Free" for Headroom: The "free" column shows RAM with zero current use. Linux fills this with page cache — a low "free" number on a healthy, busy server is completely normal.',
        '4. Read "Available" for True Headroom: Available = free RAM + reclaimable buff/cache. This is what the OS can give to a new process without swapping. This is the column to alert on.',
        '5. Check Swap: If swap used is significant and non-zero, the system is under real memory pressure and is actively moving process memory to disk — investigate immediately with top or ps aux --sort=-%mem.'
      ],
      diagram: 'free -h ──> Check "available" column ──> If < 15% total RAM → investigate. Check "Swap used" ──> If non-zero → memory pressure → top / ps to find culprit process'
    },
    interview_answer: {
      response: [
        'To check available RAM on a Linux server I run free -h. The -h flag gives human-readable output in megabytes and gigabytes. For a live view refreshing every two seconds I use free -h -s 2.',
        'The important nuance in reading the output is that the "free" column is not the correct metric for available memory headroom. Linux intentionally uses all unused RAM as disk page cache — so a server with 1GB "free" but 6GB "available" is completely healthy. The "available" column accounts for the reclaimable buff/cache and gives the true picture of how much RAM the OS can provide to a new process without triggering swap.',
        'The metric I watch for alerts is "available" falling below roughly 15% of total RAM. The other metric I check immediately is "Swap used" — if swap is non-zero and increasing, the system is under genuine memory pressure and is moving process memory to disk, which will cause severe latency. In that case I use top or ps aux sorted by memory usage to identify which process is consuming the RAM.'
      ],
      why: 'Explaining why "free" is misleading and why "available" is the correct metric — including the page cache reclaim mechanism — separates engineers who have diagnosed real memory issues from those who have just run the command.'
    },
    interview_kill_shot: 'On Linux, always read the "available" column in free -h — "free" RAM is just unused cache and a low value on a busy server is completely normal.'
  },

  // ─── Q0225 ── Git Merge ───────────────────────────────────────────────────
  'Q0225': {
    title: 'Git Merge — Integrating Branches While Preserving History',
    prompt: 'What is git merge and when should you use it over rebase?',
    type: 'Git',
    difficulty: 'Easy',
    chips: ['Git Merge', 'Merge Commit', 'Fast-Forward', 'Branch History', 'Team Collaboration'],
    definition: 'git merge integrates changes from one branch into another by creating a new merge commit that has two parents — preserving the full, true history of when and from which branch changes were introduced.',
    why_it_matters: 'Merge is the safe default for shared branches because it never rewrites commit history — critical for avoiding force-push conflicts and maintaining an accurate audit trail in production repositories.',
    real_world_scenario: 'At Coforge, all feature branches are merged into main via pull request merge commits — preserving the complete history of which feature was released with which deployment and enabling precise git bisect during incident root cause analysis.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Context: You are on the main branch and want to integrate a completed feature branch (feature/auth-service) into it.',
        '2. Execute Merge: Run git checkout main then git merge feature/auth-service. Git finds the common ancestor commit of both branches.',
        '3. Fast-Forward (clean case): If main has not diverged since the feature branch was created, Git fast-forwards the main pointer to the feature branch tip — no merge commit created, linear history.',
        '4. Merge Commit (diverged case): If main has received other commits since the branch point, Git creates a new merge commit with two parents — recording that both histories were combined at this point.',
        '5. Conflict Resolution: If the same lines were changed in both branches, Git pauses and marks conflicts with <<<< markers. You resolve them manually, then git add and git commit to complete the merge.'
      ],
      diagram: 'feature/auth-service (commits A-B-C) ──> git merge into main ──> Merge Commit M (two parents: main tip + feature tip) ──> Linear history preserved'
    },
    interview_answer: {
      response: [
        'git merge integrates changes from one branch into another. It works by finding the common ancestor of both branches and combining the changes. If the target branch has not moved since the feature branch was created, Git fast-forwards the pointer with no merge commit. If both branches have diverged, Git creates a new merge commit with two parent pointers — recording exactly when and from which branch the integration happened.',
        'The key advantage of merge over rebase is that it never rewrites history. Every commit retains its original SHA and timestamp. In a shared team repository this is critical — if I rebased the main branch after others have already pulled from it, they would face serious conflicts because their local histories no longer match the rewritten remote.',
        'I use merge for integrating feature branches into main and for promoting releases between long-lived branches like main to release. I use it via pull requests at Coforge so the merge goes through code review and CI checks before being recorded in history. The merge commit itself serves as a precise marker of when each feature landed in production.'
      ],
      why: 'Distinguishing fast-forward from a two-parent merge commit, and explaining why rewriting shared branch history is dangerous, shows Git workflow design knowledge beyond just knowing the command.'
    },
    interview_kill_shot: 'Use git merge for integrating into shared branches — it preserves the true history of when changes were introduced without rewriting any existing commits.'
  },

  // ─── Q0226 ── Git Rebase ──────────────────────────────────────────────────
  'Q0226': {
    title: 'Git Rebase — Rewriting Branch History for a Clean Linear Timeline',
    prompt: 'What is git rebase, when should you use it, and what is the golden rule of rebasing?',
    type: 'Git',
    difficulty: 'Medium',
    chips: ['Git Rebase', 'Interactive Rebase', 'Linear History', 'Commit Rewriting', 'Git Log'],
    definition: 'git rebase moves or replays a sequence of commits from one branch onto the tip of another branch — rewriting commit SHAs to create a linear history without merge commits.',
    why_it_matters: 'Rebase produces a cleaner, linear git log that is easier to read and bisect — but rebasing shared or public branches rewrites history that others have already based their work on, causing severe conflicts.',
    real_world_scenario: 'Before raising a pull request at Coforge, developers rebase their feature branch onto the latest main — giving reviewers a clean linear diff without merge noise. Interactive rebase squashes WIP commits into a single meaningful commit before the PR.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Standard Rebase: On your feature branch, run git rebase main. Git finds the common ancestor, temporarily removes your feature commits, fast-forwards to the latest main tip, then replays your commits on top — creating new commit SHAs.',
        '2. Interactive Rebase (git rebase -i): Run git rebase -i HEAD~3 to rewrite the last 3 commits. In the editor, choose: pick (keep), squash (combine with previous), reword (edit message), drop (delete). Produces a polished commit history.',
        '3. The Golden Rule: Never rebase a branch that has been pushed to a shared remote repository and pulled by other engineers. Rebasing rewrites commit SHAs — anyone who has fetched the old SHAs will face a diverged history nightmare.',
        '4. Safe Rebase Scope: Rebase is safe on local feature branches that only you have worked on. Rebase locally before pushing your feature branch for a pull request.',
        '5. After Rebase on Pushed Branch: If you have already pushed and then rebased, you must git push --force-with-lease — never git push --force which would overwrite others\' pushes to the same branch.'
      ],
      diagram: 'feature branch (A-B-C based on old main) ──[git rebase main]──> Replayed (A\'-B\'-C\' on latest main tip) ──> Linear history, no merge commit'
    },
    interview_answer: {
      response: [
        'git rebase takes the commits on your feature branch and replays them on top of the latest tip of another branch — in most cases the main branch. The result is a linear history as if you had started the feature branch from the current main, without any merge commits cluttering the git log.',
        'The most powerful form is interactive rebase: git rebase -i HEAD~N opens an editor where I can squash multiple work-in-progress commits into a single meaningful commit before raising a pull request, reword commit messages, or drop experimental commits that I do not want in the final history.',
        'The golden rule of rebasing is: never rebase a branch that other engineers have already pulled. Rebasing rewrites commit SHAs — when you push the rebased branch, anyone who fetched the original commits now has a diverged history and faces a very messy resolution. I only rebase my own local feature branches before pushing them for the first time, or after coordinating with the team. For anything already on a shared remote, I use merge.'
      ],
      why: 'Naming the golden rule explicitly, explaining why SHA rewriting causes diverged history conflicts for others, and distinguishing safe local rebase from dangerous shared-branch rebase shows genuine Git workflow maturity.'
    },
    interview_kill_shot: 'Use rebase locally to clean up your feature branch history before a pull request — never rebase a branch that other engineers have already fetched.'
  },

  // ─── Q0227 ── Git Cherry-pick ─────────────────────────────────────────────
  'Q0227': {
    title: 'Git Cherry-pick — Applying a Specific Commit to Another Branch',
    prompt: 'What is git cherry-pick and when would you use it in production?',
    type: 'Git',
    difficulty: 'Medium',
    chips: ['Cherry-pick', 'Hotfix', 'Backport', 'Commit SHA', 'Release Branches'],
    definition: 'git cherry-pick applies the changes introduced by a specific commit (identified by its SHA) to the current branch — creating a new commit with the same diff but a different SHA and timestamp.',
    why_it_matters: 'Cherry-pick enables surgical hotfix backporting — applying a critical security fix from main to a release branch without merging all unrelated development work that has landed on main since the release.',
    real_world_scenario: 'A critical authentication bypass fix was committed to main. The Production release branch is 3 sprints behind main. Cherry-picking the single fix commit to the release branch patches production without introducing 60 other unreviewed commits.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Identify the Commit SHA: On the source branch (e.g. main), run git log --oneline to find the SHA of the commit you want to apply — e.g. a3f4d9b.',
        '2. Switch to Target Branch: git checkout release/v2.3 to switch to the branch that needs the fix.',
        '3. Execute Cherry-pick: git cherry-pick a3f4d9b. Git applies the diff of that single commit to the current branch and creates a new commit with a new SHA.',
        '4. Handle Conflicts: If the same lines were modified differently in the target branch, Git pauses with conflict markers. Resolve, git add, then git cherry-pick --continue.',
        '5. Push and Validate: Push the release branch and trigger the CI pipeline to validate the cherry-picked fix does not break the release branch build.'
      ],
      diagram: 'main (commit a3f4d9b: auth fix) ──[git cherry-pick a3f4d9b]──> release/v2.3 (new commit e9b2c1f: same diff, new SHA) ──> CI validates fix'
    },
    interview_answer: {
      response: [
        'git cherry-pick lets you take the changes introduced by a specific commit and apply them to the branch you are currently on. It creates a new commit with the same code diff but a brand new SHA — the two commits are not linked in Git history, only their code changes are the same.',
        'The primary production use case is hotfix backporting. When a critical bug is fixed on the main development branch, I cannot always merge all of main into a production release branch — there may be dozens of unreviewed features that are not ready to ship. Cherry-pick lets me surgically apply only the fix commit to the release branch without pulling in anything else.',
        'The process is: git log --oneline on main to find the commit SHA, git checkout to the release branch, git cherry-pick <SHA>. If there are conflicts — which can happen when the release branch and main have diverged significantly — I resolve them manually, git add the resolved files, and git cherry-pick --continue. I then push and let CI validate the fix before deploying.'
      ],
      why: 'Framing cherry-pick specifically around the hotfix backporting scenario — and explaining why you cannot just merge main — shows you understand real release management challenges.'
    },
    interview_kill_shot: 'git cherry-pick surgically backports a specific commit to another branch — the safest way to ship a critical hotfix to a release branch without merging unrelated development work.'
  },

  // ─── Q0228 ── Git Stash ───────────────────────────────────────────────────
  'Q0228': {
    title: 'Git Stash — Temporarily Shelving Uncommitted Work',
    prompt: 'What is git stash and what is the difference between stash pop and stash apply?',
    type: 'Git',
    difficulty: 'Easy',
    chips: ['Git Stash', 'git stash push', 'git stash pop', 'git stash apply', 'Work In Progress'],
    definition: 'git stash temporarily saves uncommitted working directory changes and staged modifications onto a stash stack — allowing you to switch branches or respond to urgent tasks with a clean working directory, then restore the changes later.',
    why_it_matters: 'Without stash, switching branches mid-task either requires committing unfinished work or losing it. Stash provides a safe temporary shelf without polluting the commit history with incomplete changes.',
    real_world_scenario: 'Halfway through a feature implementation, an urgent production bug report arrives. git stash push saves the in-progress work, a hotfix branch is checked out, the bug is fixed and merged, and then git stash pop restores the feature work instantly.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Stash Current Work: Run git stash push -m "WIP: add OAuth token refresh" to save all modified tracked files and staged changes onto the stash stack with a descriptive message.',
        '2. Add Untracked Files: By default stash ignores untracked new files. Use git stash push -u to include untracked files in the stash.',
        '3. List Stash Stack: Run git stash list to view all stashed entries — stash@{0} is the most recent, stash@{1} the one before, etc.',
        '4. Pop vs Apply: git stash pop restores the most recent stash and REMOVES it from the stash list. git stash apply restores the stash but KEEPS it in the list — useful if you want to apply the same stash to multiple branches.',
        '5. Drop or Clear: git stash drop stash@{0} removes a specific entry. git stash clear wipes the entire stash stack.'
      ],
      diagram: 'Working Dir (WIP changes) ──[git stash push]──> Stash Stack (stash@{0}) ──> Clean Working Dir ──[git stash pop]──> WIP Restored & Stash Entry Removed'
    },
    interview_answer: {
      response: [
        'git stash is a temporary shelf for uncommitted work. When I need to switch context urgently — for example a production incident fires while I am halfway through a feature — I run git stash push with a descriptive message. Git saves all my modified tracked files and staged changes onto a stash stack and leaves me with a clean working directory so I can safely switch branches.',
        'The difference between pop and apply is important. git stash pop restores the most recent stash entry and removes it from the stash list — the stash is consumed. git stash apply restores the stash entry but keeps it in the list, which is useful when I want to apply the same partial changes to multiple branches without losing the stash.',
        'One thing I always do is include the -u flag when the work includes new files I have not yet staged — git stash push -u includes untracked files. Without it, those new files stay in the working directory even after the stash, which can cause confusion when you switch branches.'
      ],
      why: 'Explaining the pop vs apply distinction and the -u flag for untracked files shows practical daily Git proficiency — these are the details that trip up engineers who only know the basic command.'
    },
    interview_kill_shot: 'git stash push shelves uncommitted work cleanly; use pop to restore and discard the stash, or apply to restore while keeping it for reuse on other branches.'
  },

  // ─── Q0229 ── Git Reset ───────────────────────────────────────────────────
  'Q0229': {
    title: 'Git Reset — Moving HEAD and Uncommitting Changes (--soft, --mixed, --hard)',
    prompt: 'What does git reset do and what is the difference between --soft, --mixed, and --hard?',
    type: 'Git',
    difficulty: 'Medium',
    chips: ['Git Reset', '--soft', '--mixed', '--hard', 'HEAD', 'Undo Commits'],
    definition: 'git reset moves the current branch HEAD pointer to a specified commit, with three modes controlling what happens to the staged index and working directory changes of the commits being undone.',
    why_it_matters: 'Using --hard reset on a shared branch destroys committed work permanently and forces history rewrites on all team members. Choosing the wrong mode can result in irreversible data loss.',
    real_world_scenario: 'A developer accidentally committed 5 debug commits with sensitive API keys before pushing. git reset --soft HEAD~5 un-commits all five, keeps all changes staged, and allows a clean single commit without the keys.',
    schema: 'tradeoff',
    tradeoff_matrix: {
      dimensions: [
        'HEAD Pointer Movement',
        'Staged Index (git add)',
        'Working Directory Files',
        'Data Risk',
        'When to Use'
      ],
      options: [
        {
          name: 'git reset --soft HEAD~N',
          values: [
            'Moves HEAD back N commits',
            'All undone changes kept STAGED (ready to re-commit)',
            'Working directory files UNCHANGED',
            'No data loss — all changes preserved and staged',
            'Squash multiple commits into one; undo a commit to rephrase the message'
          ]
        },
        {
          name: 'git reset --mixed HEAD~N (default)',
          values: [
            'Moves HEAD back N commits',
            'All undone changes UNSTAGED (moved back to working directory as modified files)',
            'Working directory files UNCHANGED',
            'No data loss — all changes preserved, just unstaged',
            'Undo commits and re-stage selectively; discard a git add without losing edits'
          ]
        },
        {
          name: 'git reset --hard HEAD~N',
          values: [
            'Moves HEAD back N commits',
            'Staged index CLEARED',
            'Working directory OVERWRITTEN — all changes in those commits are DELETED permanently',
            'HIGH RISK — changes not in remote are permanently lost with no recovery option',
            'Discard completely unwanted commits and all their changes; reset to a known clean state'
          ]
        }
      ]
    },
    interview_answer: {
      response: [
        'git reset moves the branch HEAD pointer back to a specified commit. What happens to the changes of the commits being undone depends on the flag you use, and picking the wrong one can mean permanent data loss.',
        'git reset --soft HEAD~N moves HEAD back N commits but keeps all the undone changes staged in the index — ready to re-commit immediately. This is what I use to squash several commits into one clean commit before raising a pull request. git reset --mixed, which is the default, moves HEAD back and unstages the changes — they land back in the working directory as modified but unsaved files. Safe, but requires you to re-stage what you want to keep. git reset --hard is the dangerous one — it moves HEAD back and permanently deletes all changes from those commits in both the index and the working directory. There is no recovery unless the commits were previously pushed.',
        'The absolute rule I follow is: never run --hard or any form of reset on a branch that has already been pushed to a shared remote. Resetting rewrites history, which forces a git push --force and breaks every other engineer who has fetched the original commits.'
      ],
      why: 'Covering all three modes with their exact effect on the index and working directory — and calling out the irreversibility of --hard on shared branches — demonstrates genuine Git internals understanding.'
    },
    interview_kill_shot: 'Never git reset --hard on a pushed branch — use --soft to squash and rephrase, --mixed to unstage, and --hard only on fully local unpushed work you are certain you want to discard.'
  },

  // ─── Q0230 ── Git Revert ──────────────────────────────────────────────────
  'Q0230': {
    title: 'Git Revert — Safe Undo for Shared Branches Without Rewriting History',
    prompt: 'What is the difference between git revert and git reset, and when should you use revert?',
    type: 'Git',
    difficulty: 'Easy',
    chips: ['Git Revert', 'Safe Undo', 'Shared Branches', 'Commit History', 'Production Rollback'],
    definition: 'git revert creates a new commit that exactly inverses the changes of a specified previous commit — undoing the effect without modifying or deleting any existing commit in the history.',
    why_it_matters: 'On shared or production branches where rewriting history would break other engineers\' local repositories, revert is the only safe way to undo a bad commit without forcing a push.',
    real_world_scenario: 'A misconfigured feature flag commit was merged to main and deployed to production, causing checkout failures. git revert <commit-sha> created an immediate undo commit that was merged and deployed via the normal CI/CD pipeline within minutes.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Identify the Bad Commit: Run git log --oneline to find the SHA of the commit to undo — e.g. b7c3a12 "enable checkout feature flag".',
        '2. Execute Revert: Run git revert b7c3a12. Git creates a NEW commit whose changes are the exact inverse of b7c3a12. The original commit is untouched in history.',
        '3. Commit Message: Git pre-fills the commit message as "Revert: enable checkout feature flag". Edit to add context about why it was reverted.',
        '4. Push Normally: git push — no force push required. The revert commit is a normal new commit and will not conflict with other engineers\' local histories.',
        '5. CI/CD Picks It Up: The normal pipeline triggers on the push, builds, tests, and deploys the revert — giving you a clean, auditable rollback through your existing delivery process.'
      ],
      diagram: 'Bad Commit (b7c3a12) on main ──[git revert b7c3a12]──> New Revert Commit (e9f1d3a) inverses diff ──> git push (no force) ──> CI/CD deploys the rollback'
    },
    interview_answer: {
      response: [
        'git revert creates a new commit that undoes the changes of a previous commit — the original commit stays in the history, untouched. It is the safe way to undo changes on any branch that has already been pushed, because it does not rewrite history and does not require a force push.',
        'git reset, by contrast, moves the HEAD pointer back and effectively removes commits from the branch history. That rewriting makes it unsafe for any branch other engineers have already pulled — they end up with a diverged history. Reserve reset for local branches you have not yet pushed.',
        'In production, revert is how I handle bad releases. If a commit that deployed a broken feature makes it to main, I run git revert with that commit\'s SHA, resolve any conflicts, and push the revert commit normally. It goes through the same CI/CD pipeline and gets deployed just like any other change — giving you a clean, auditable rollback with a clear explanation in the commit message of what was reverted and why.'
      ],
      why: 'Clearly contrasting revert (new inverse commit, no history rewrite, safe for shared branches) with reset (history rewrite, force push required, dangerous for shared branches) is the core of this question.'
    },
    interview_kill_shot: 'git revert is the only safe undo on shared and production branches — it creates an inverse commit without touching history, so no force push and no disruption to your teammates.'
  },

  // ─── Q0231 ── Pull Request Workflow ──────────────────────────────────────
  'Q0231': {
    title: 'Pull Request Workflow — Code Review, Branch Protection & CI Gates',
    prompt: 'Walk me through how a Pull Request works in a professional team Git workflow.',
    type: 'Git / Azure DevOps',
    difficulty: 'Easy',
    chips: ['Pull Request', 'Branch Protection', 'Code Review', 'CI Gates', 'Merge Strategy'],
    definition: 'A Pull Request (PR) is a formal proposal to merge a feature branch into a protected target branch, gated by required code reviews, automated CI pipeline checks, and branch protection rules before the merge is permitted.',
    why_it_matters: 'Without enforced PRs and branch protection, engineers can push directly to main — bypassing code review and CI validation, and shipping untested or insecure changes directly to production.',
    real_world_scenario: 'At Coforge, the main branch is protected. Every change requires a PR with at least two approved reviews, a passing Azure DevOps CI pipeline, and no unresolved review comments before the merge button activates.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Feature Branch: Developer creates a short-lived feature branch from main (e.g. feature/PROJ-123-add-oauth) and commits work there.',
        '2. Push and Open PR: Developer pushes the branch and opens a PR against main with a clear title, linked issue ticket, and description of changes and testing done.',
        '3. Automated CI Pipeline Triggers: The PR triggers the Azure DevOps CI pipeline — build, unit tests, SonarQube, Trivy scan. All gates must pass (green) before the PR can be merged.',
        '4. Code Review: Required reviewers are auto-assigned by branch policy. They review the diff, leave inline comments, request changes, or approve. PR cannot merge without the minimum approval count.',
        '5. Merge with Strategy: Once all checks pass and reviews are approved, the PR is merged. Squash merge is preferred (clean single commit on main) or rebase merge for linear history. The feature branch is auto-deleted post-merge.'
      ],
      diagram: 'feature branch ──[PR opened]──> CI Pipeline (build/test/scan) ──> Reviewer Approvals ──> All Checks Green ──> Squash Merge to main ──> Branch Auto-deleted'
    },
    interview_answer: {
      response: [
        'In our Git workflow at Coforge, the main branch is fully protected — no one can push directly to it. Every change goes through a Pull Request. The developer creates a short-lived feature branch named with the ticket number, makes their commits, pushes it, and opens a PR against main with a description of what changed and how it was tested.',
        'Opening the PR immediately triggers our Azure DevOps CI pipeline. The pipeline runs the build, unit tests, SonarQube static analysis, and a Trivy container image vulnerability scan. All stages must pass before the merge button becomes available — a failing CI run blocks the merge automatically through branch protection rules.',
        'Simultaneously, the PR auto-assigns required reviewers based on the CODEOWNERS file. Reviewers leave inline comments on specific changed lines. The PR author addresses feedback, pushes additional commits, and the pipeline re-runs. Once all CI gates are green and the minimum number of reviewers have approved with no unresolved threads, the PR is merged using a squash strategy — compressing all the feature commits into one clean commit on main — and the feature branch is automatically deleted.'
      ],
      why: 'Describing the CI trigger, CODEOWNERS-based reviewer assignment, and squash merge strategy together shows you have set up and enforced a production-grade PR workflow — not just used the GitHub UI.'
    },
    interview_kill_shot: 'A PR is not just a code review — it is a CI-gated, reviewer-enforced, branch-protected delivery checkpoint that prevents unvalidated code from ever reaching main.'
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// APPLY UPGRADES TO infinite_locus.json
// ─────────────────────────────────────────────────────────────────────────────
const locus = JSON.parse(fs.readFileSync(locusPath, 'utf8'));
let patchedCount = 0;
const patchedIds = [];

locus.forEach(q => {
  if (upgrades[q.id]) {
    const u = upgrades[q.id];
    Object.assign(q, u);
    if (q.schema === 'tradeoff') {
      delete q.architecture_flow;
      delete q.timeline_flow;
    } else if (q.schema === 'architecture') {
      delete q.tradeoff_matrix;
      delete q.timeline_flow;
    }
    patchedCount++;
    patchedIds.push(q.id);
  }
});

fs.writeFileSync(locusPath, JSON.stringify(locus, null, 2), 'utf8');
console.log(`\n✅ Phase 2 complete — patched ${patchedCount} questions in infinite_locus.json`);
console.log('   Patched IDs:', patchedIds.join(', '));

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY — Zero template answers for Phase 2 IDs
// ─────────────────────────────────────────────────────────────────────────────
const phase2Ids = Object.keys(upgrades);
const stillBroken = locus.filter(q =>
  phase2Ids.includes(q.id) &&
  q.interview_answer &&
  q.interview_answer.response &&
  q.interview_answer.response[0].includes('When addressing')
);

if (stillBroken.length === 0) {
  console.log('✅ Verification PASS — 0 template answers remain for Phase 2 questions');
} else {
  console.error('❌ Verification FAIL — still broken:', stillBroken.map(q => q.id).join(', '));
  process.exit(1);
}

// Running total
const allBroken = locus.filter(q =>
  q.interview_answer &&
  q.interview_answer.response &&
  q.interview_answer.response[0].includes('When addressing')
);
console.log(`\n📊 Overall remaining template answers in infinite_locus.json: ${allBroken.length}`);
if (allBroken.length > 0) {
  allBroken.forEach(q => console.log('   ', q.id, q.title));
}

// ─────────────────────────────────────────────────────────────────────────────
// SYNC to merged.json
// ─────────────────────────────────────────────────────────────────────────────
const merged = JSON.parse(fs.readFileSync(mergedPath, 'utf8'));
const locusMap = new Map(locus.map(q => [q.id, q]));

let syncedCount = 0;
const updatedMerged = merged.map(q => {
  if (locusMap.has(q.id)) {
    syncedCount++;
    return locusMap.get(q.id);
  }
  return q;
});

fs.writeFileSync(mergedPath, JSON.stringify(updatedMerged, null, 2), 'utf8');
console.log(`\n✅ merged.json synced — updated ${syncedCount} records. Total: ${updatedMerged.length} questions`);
