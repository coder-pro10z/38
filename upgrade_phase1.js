const fs = require('fs');
const path = require('path');

const locusMdPath = path.join(__dirname, 'infinite_locus.json');
const mergedPath  = path.join(__dirname, 'merged.json');

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 1 UPGRADES — 8 Questions
// Clusters: Background/Day-to-Day + CI/CD & Azure DevOps
// ─────────────────────────────────────────────────────────────────────────────
const upgrades = {

  // ─── Q0208 ── What are your day-to-day responsibilities? ─────────────────
  'Q0208': {
    title: 'Day-to-Day Responsibilities as an Azure DevOps Engineer',
    prompt: 'What are your day-to-day responsibilities?',
    type: 'HR / Behavioral',
    difficulty: 'Easy',
    chips: ['Azure DevOps', 'AKS', 'Terraform', 'Monitoring', 'Pipelines'],
    definition: 'The routine operational and engineering activities an Azure DevOps Engineer performs daily to maintain CI/CD pipelines, cloud infrastructure, and deployment reliability.',
    why_it_matters: 'Interviewers use this question to verify you have genuine hands-on daily engagement — not just theoretical knowledge of DevOps tools.',
    real_world_scenario: 'At Coforge, a DevOps engineer starts each day verifying overnight pipeline runs and AKS pod health before developers begin sprint work, then spends the day on IaC updates, deployment troubleshooting, and capacity reviews.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Morning Health Check: Review Azure Monitor alerts, Grafana dashboards, and overnight Azure DevOps pipeline summaries to catch failures before developers begin work.',
        '2. Pipeline Maintenance: Investigate broken CI/CD stages — build failures, failed test gates, image scan blocks, or deployment rollbacks. Fix YAML or agent issues.',
        '3. Infrastructure Tasks: Write or peer-review Terraform modules for sprint infrastructure tickets. Run plan in CI, apply in CD after approval.',
        '4. Kubernetes Operations: Check AKS cluster node health, pod restart counts, HPA scaling events, and resource quota utilisation using kubectl and Azure Monitor.',
        '5. Collaboration & Documentation: Attend standup, unblock developers on deployment issues, update runbooks, and hand over active incidents at end of day.'
      ],
      diagram: 'Alerts & Dashboards ──> Pipeline Fixes ──> Terraform IaC Work ──> AKS Health Ops ──> Standup & Runbook Updates'
    },
    interview_answer: {
      response: [
        'My day starts with a morning health check — I review Azure Monitor alerts, scan Grafana dashboards for anomalies, and go through overnight Azure DevOps pipeline run summaries to catch any failures before developers start their work.',
        'Once the environment is confirmed stable, I move into active engineering tasks. On most days this includes maintaining CI/CD pipelines — fixing broken YAML stages, adjusting test quality gates, and resolving Docker build or image push failures. I also work on Terraform modules for new infrastructure changes raised in sprint tickets and review IaC pull requests from the team for correctness and security compliance.',
        'Throughout the day I monitor AKS cluster health, including node resource pressure, unexpected pod restarts, and HPA scaling events. I stay available to unblock developers on deployment and build issues, and I participate in the daily standup. Before finishing I update runbooks with any procedure changes and hand over open incidents to the on-call engineer.'
      ],
      why: 'Opening with a concrete morning health check routine immediately proves operational ownership — not just theoretical knowledge of DevOps tooling.'
    },
    interview_kill_shot: 'Every day I balance three priorities: keeping pipelines green, keeping infrastructure immutable and auditable, and unblocking developers so they can ship without friction.'
  },

  // ─── Q0209 ── What is your role in the deployment process? ───────────────
  'Q0209': {
    title: 'Role in the Deployment Process — CI/CD Pipeline Ownership',
    prompt: 'What is your role in the deployment process?',
    type: 'CI/CD / HR',
    difficulty: 'Easy',
    chips: ['Azure DevOps', 'CI/CD', 'Helm', 'AKS', 'Deployment Ownership'],
    definition: 'The specific engineering responsibilities a DevOps engineer owns across the full software delivery lifecycle — from pipeline design and build artefact management to environment promotion and production rollout.',
    why_it_matters: 'Clearly articulating deployment ownership demonstrates you are a production-aware engineer who understands risk, not just someone who merges YAML files.',
    real_world_scenario: 'At Coforge, the DevOps engineer owns the full Azure DevOps pipeline YAML, the Helm chart values for each environment, and the approval gates that gate Staging-to-Production promotion.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Pipeline Design: Author and maintain multi-stage azure-pipelines.yml — CI stages (build, test, scan) and CD stages (deploy to Dev, Staging, Production).',
        '2. Artefact Management: Tag Docker images with Git commit SHA, push to Azure Container Registry (ACR), and manage image lifecycle policies.',
        '3. Environment Promotion: Update Helm chart values per environment, trigger CD stage to Staging automatically, then gate Production deployment behind change request approval.',
        '4. Zero-Downtime Rollout: Execute Kubernetes rolling update via Helm upgrade, validate readiness and liveness probes before completion.',
        '5. Observability & Rollback: Monitor deployment in Azure Monitor and Grafana. If error rate spikes, trigger helm rollback or kubectl rollout undo immediately.'
      ],
      diagram: 'Pipeline YAML Authoring ──> ACR Image Push ──> Staging Deploy ──> Approval Gate ──> Production Rolling Rollout ──> Monitor & Rollback Ready'
    },
    interview_answer: {
      response: [
        'My role in the deployment process spans the full delivery lifecycle — I design and maintain the Azure DevOps YAML pipelines that govern how every code change moves from a developer commit to production.',
        'On the CI side, I own the build, test, and security scanning stages — the pipeline compiles the application, runs unit tests with coverage gates, performs SonarQube static analysis, and runs a Trivy container image vulnerability scan before pushing an immutable Docker image tagged with the Git commit SHA to Azure Container Registry.',
        'On the CD side, I manage the Helm chart values per environment and control the promotion flow. Staging is deployed automatically on a successful CI run. The Production promotion requires a formal change request approval gate. During rollout I monitor Kubernetes readiness probes and watch Azure Monitor metrics. If anything degrades, I execute helm rollback or kubectl rollout undo immediately to restore the previous stable release.'
      ],
      why: 'Walking through both CI artefact management and CD environment promotion with specific tools proves end-to-end pipeline ownership rather than only owning one half of the process.'
    },
    interview_kill_shot: 'I own the entire deployment pipeline — from YAML authoring and ACR image management to Helm promotion gates and production rollback readiness.'
  },

  // ─── Q0210 ── Describe a challenging production issue you resolved ────────
  'Q0210': {
    title: 'Describing a Challenging Production Issue You Resolved',
    prompt: 'Describe a challenging production issue you resolved. Walk me through what happened and how you fixed it.',
    type: 'Scenario-Based / HR',
    difficulty: 'Medium',
    chips: ['Incident Response', 'RCA', 'kubectl', 'Helm Rollback', 'STAR Method'],
    definition: 'A structured production incident narrative demonstrating your ability to detect, isolate, resolve, and prevent recurrence of a critical system failure under pressure.',
    why_it_matters: 'This question reveals whether you have genuine production ownership experience and disciplined incident response skills — or whether you only work in dev/test environments.',
    real_world_scenario: 'An AKS production deployment caused all pods to enter CrashLoopBackOff due to a missing environment variable that was present in Staging but absent from the Production Key Vault.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Detection (Situation): Azure Monitor alert fired — pod restart count exceeded threshold within 3 minutes of a Helm deployment. Grafana showed a flat API response rate.',
        '2. Isolation (Task): Ran kubectl describe pod and kubectl logs to identify CrashLoopBackOff. Error message pointed to a missing DATABASE_URL environment variable at startup.',
        '3. Immediate Rollback (Action): Executed helm rollback <release> <previous-revision> to restore the last stable version within 4 minutes of detection. Service restored.',
        '4. Root Cause Analysis: Compared Production Key Vault secrets with Staging — DATABASE_URL secret had been added to Staging but not promoted to the Production Key Vault during the sprint.',
        '5. Prevention (Result): Added a pipeline step to validate all required Key Vault secrets exist for the target environment before deployment proceeds. No repeat in subsequent releases.'
      ],
      diagram: 'Alert Fires ──> kubectl logs (CrashLoop) ──> helm rollback ──> Service Restored ──> RCA (Missing KV Secret) ──> Pipeline Secret Validation Gate Added'
    },
    interview_answer: {
      response: [
        'I will use the STAR format. The Situation: we had a Helm-based production deployment on AKS that completed successfully from the pipeline perspective, but within 3 minutes Azure Monitor fired a pod restart alert. Grafana showed the API response rate had completely flatlined.',
        'My Task was to restore service and identify the cause. I ran kubectl describe pod on the failing pods and saw they were in CrashLoopBackOff. Checking kubectl logs showed the application was crashing at startup with a fatal error — it could not read the DATABASE_URL environment variable from the Key Vault-backed secret.',
        'The Action I took was to immediately execute helm rollback to the previous revision. Service was restored within 4 minutes of the alert firing. For the Root Cause Analysis, I compared the Production Azure Key Vault secrets against Staging and found DATABASE_URL had been added to Staging during the sprint but had never been promoted to Production. As a Result, I added a pre-deployment pipeline step that validates all required Key Vault secret names exist in the target environment before any deployment runs — this has caught two similar mismatches since.'
      ],
      why: 'Using the STAR framework makes the answer structured and time-bounded. Quantifying the 4-minute MTTR and describing the systemic prevention step proves production maturity beyond just fixing the immediate issue.'
    },
    interview_kill_shot: 'The most important part of any incident is not the fix — it is the pipeline gate you add afterwards so it can never happen the same way again.'
  },

  // ─── Q0211 ── CI vs CD ────────────────────────────────────────────────────
  'Q0211': {
    title: 'Continuous Integration (CI) vs Continuous Delivery / Deployment (CD)',
    prompt: 'What is the difference between CI and CD?',
    type: 'CI/CD',
    difficulty: 'Easy',
    chips: ['CI', 'CD', 'Azure DevOps', 'Pipeline Stages', 'Artefact Management'],
    definition: 'CI (Continuous Integration) automatically validates every code commit through build and test pipelines to produce a verified artefact. CD (Continuous Delivery/Deployment) automates the release of that artefact into target environments, with or without a human approval gate.',
    why_it_matters: 'Confusing CI with CD leads to under-automating releases or shipping untested code — a critical gap in production-grade DevOps pipeline design.',
    real_world_scenario: 'At Coforge, CI runs on every pull request to validate the Docker build, unit test coverage, and Trivy scan. CD then deploys to Staging automatically but gates the Production promotion behind a change request approval.',
    schema: 'tradeoff',
    tradeoff_matrix: {
      dimensions: [
        'Trigger',
        'Primary Goal',
        'Output / Artefact',
        'Human Gate Required?',
        'Failure Impact Scope'
      ],
      options: [
        {
          name: 'CI — Continuous Integration',
          values: [
            'Every code commit or pull request to the main branch',
            'Validate code quality: build, lint, unit tests, SAST, container scan',
            'Immutable versioned Docker image pushed to ACR with Git commit SHA tag',
            'No — fully automated; PR blocked if any gate fails',
            'Isolated to the contributor — only that PR is blocked, production unaffected'
          ]
        },
        {
          name: 'CD — Continuous Delivery / Deployment',
          values: [
            'Successful CI run completing with all gates passed',
            'Safely promote the validated artefact into Dev → Staging → Production',
            'Running workload in target environment (AKS rolling deployment, App Service slot swap)',
            'Continuous Delivery: Yes — manual approval gate before Production. Continuous Deployment: No — fully automated end-to-end',
            'Environment-wide — a bad release affects all users on that environment'
          ]
        }
      ]
    },
    interview_answer: {
      response: [
        'CI — Continuous Integration — is the automated practice of building, linting, testing, and scanning every code commit as soon as it is pushed. The goal of CI is to catch defects at the pull request stage before they ever reach the main branch. The output of a successful CI run is an immutable artefact — in our case a Docker image tagged with the Git commit SHA and pushed to Azure Container Registry.',
        'CD — Continuous Delivery or Continuous Deployment — takes that validated artefact and automates its promotion through environments. Continuous Delivery requires a manual human approval before reaching Production. Continuous Deployment removes that gate entirely and deploys to Production automatically on every successful CI run.',
        'In our Azure DevOps pipelines at Coforge, CI runs on every pull request and must pass all gates before merging is permitted. CD then automatically deploys to Staging and runs smoke tests. The Production stage requires a formal change request ticket approval — keeping human oversight over production releases while still automating everything upstream.'
      ],
      why: 'Distinguishing Continuous Delivery from Continuous Deployment, and naming the ACR SHA-tagging artefact strategy, demonstrates genuine pipeline design experience beyond using the buzzwords interchangeably.'
    },
    interview_kill_shot: 'CI produces a verified artefact on every commit; CD safely promotes that artefact through environments — they are two complementary but distinct stages of a mature delivery pipeline.'
  },

  // ─── Q0212 ── Variable Groups & Secret Management ──────────────────────
  'Q0212': {
    title: 'Azure DevOps Library — Variable Groups & Secret Management',
    prompt: 'How do you manage secrets and configuration variables in Azure DevOps pipelines?',
    type: 'Azure DevOps / Security',
    difficulty: 'Medium',
    chips: ['Variable Groups', 'Key Vault', 'Azure DevOps Library', 'Secrets', 'Pipeline Security'],
    definition: 'Azure DevOps Variable Groups are named collections of pipeline variables — optionally linked to Azure Key Vault — that centralise secret and configuration management across multiple pipelines and environments.',
    why_it_matters: 'Hardcoding secrets in pipeline YAML files is a critical security vulnerability. Variable Groups linked to Key Vault provide zero-trust secret management with full audit trails and automatic rotation support.',
    real_world_scenario: 'At Coforge, all database connection strings, ACR credentials, and API keys are stored in Azure Key Vault and surfaced to Azure DevOps pipelines through linked Variable Groups — keeping secrets out of all YAML files and Git repositories entirely.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Create Key Vault Secrets: Store sensitive values (connection strings, API keys, ACR passwords) as secrets in Azure Key Vault with appropriate RBAC access policies.',
        '2. Create Variable Group: In Azure DevOps Library, create a Variable Group and toggle "Link secrets from an Azure Key Vault as variables". Select the Key Vault and map the required secret names.',
        '3. Reference in Pipeline YAML: Add the Variable Group to the pipeline using "group: my-variable-group" under variables. Secrets are injected as masked environment variables at runtime.',
        '4. Scope per Environment: Create separate Variable Groups for Dev, Staging, and Production environments and reference the correct group per stage using stage-level variable declarations.',
        '5. Non-Secret Config: Store non-sensitive config (feature flags, timeout values, region names) directly in the Variable Group without Key Vault backing — edit centrally without modifying any YAML.'
      ],
      diagram: 'Azure Key Vault (Secrets) ──> Variable Group (Linked) ──> Pipeline YAML (group: reference) ──> Runtime Env Variables (Masked)'
    },
    interview_answer: {
      response: [
        'Secret management in Azure DevOps pipelines is handled through the Library feature — specifically Variable Groups. I never hardcode secrets in YAML files or store them in the Git repository. Instead, all sensitive values like database connection strings, API keys, and ACR service principal credentials are stored in Azure Key Vault.',
        'I create a Variable Group in the Azure DevOps Library and link it to the Key Vault. Once linked, I select which Key Vault secrets the group should expose. In the pipeline YAML I reference the group with a simple "group: my-variable-group" declaration under the variables block. At runtime Azure DevOps fetches the secret values from Key Vault and injects them as masked environment variables — they are never visible in logs.',
        'I maintain separate Variable Groups for each environment — Dev, Staging, and Production — each linked to the corresponding Key Vault. Non-sensitive configuration like feature flags or timeout values I store directly in the Variable Group without Key Vault backing, which allows centralised config management without touching any YAML file.'
      ],
      why: 'Explaining Key Vault linking, the "group:" YAML reference, masked variables, and per-environment scoping proves you have implemented this properly — not just read about it.'
    },
    interview_kill_shot: 'Azure Key Vault-linked Variable Groups ensure zero secrets in Git — every pipeline gets credentials injected as masked runtime variables from a centralised, auditable vault.'
  },

  // ─── Q0213 ── Self-hosted Agent vs Microsoft-hosted Agent ────────────────
  'Q0213': {
    title: 'Self-Hosted Agent vs Microsoft-Hosted Agent in Azure DevOps',
    prompt: 'What is the difference between a self-hosted agent and a Microsoft-hosted agent in Azure DevOps? When would you use each?',
    type: 'Azure DevOps',
    difficulty: 'Medium',
    chips: ['Self-Hosted Agent', 'Microsoft-Hosted Agent', 'Azure DevOps', 'Build Agents', 'VNet Access'],
    definition: 'Azure DevOps pipeline agents are the compute resources that execute pipeline jobs. Microsoft-hosted agents are managed cloud VMs provisioned per job by Microsoft. Self-hosted agents are VMs or containers that you provision, maintain, and register in your own infrastructure.',
    why_it_matters: 'Choosing the wrong agent type causes either security gaps (Microsoft-hosted agents cannot reach private VNet resources) or unnecessary operational overhead (self-hosted agents require patching and scaling).',
    real_world_scenario: 'At Coforge, Microsoft-hosted agents run public-facing build and test jobs while self-hosted agents — deployed inside the Azure VNet — are required for deployments that access the private AKS API server and the internal ACR endpoint.',
    schema: 'tradeoff',
    tradeoff_matrix: {
      dimensions: [
        'Provisioning & Maintenance',
        'Private Network / VNet Access',
        'Custom Toolchain Support',
        'Cost Model',
        'Scalability'
      ],
      options: [
        {
          name: 'Microsoft-Hosted Agent',
          values: [
            'Fully managed by Microsoft — no provisioning, patching, or scaling required',
            'Cannot access resources inside a private Azure VNet or private endpoints',
            'Pre-installed with common tools (Docker, kubectl, Terraform, Node, Java) — limited customisation',
            'Included in Azure DevOps plan minutes; charged per parallel job above free tier',
            'Scales automatically; Microsoft provisions a fresh VM per job run'
          ]
        },
        {
          name: 'Self-Hosted Agent',
          values: [
            'You provision, patch, update, and scale the VMs or containers yourself',
            'Full access to private VNet resources: private AKS API, internal ACR, Azure SQL private endpoints',
            'Install any tool, SDK version, or internal certificate — complete control over agent environment',
            'You pay for the compute (VM or ACI) running the agent 24/7 regardless of job volume',
            'You manage scaling — typically via VMSS auto-scaling or Kubernetes agent pools'
          ]
        }
      ]
    },
    interview_answer: {
      response: [
        'Microsoft-hosted agents are fully managed by Microsoft — a fresh virtual machine is spun up per pipeline job, pre-loaded with common DevOps tools like Docker, kubectl, Terraform, and the Azure CLI. They require zero maintenance from my side and scale automatically. I use them for all standard CI jobs: building Docker images, running unit tests, and executing static analysis with SonarQube.',
        'Self-hosted agents are VMs or containers that I provision and register with Azure DevOps. The critical advantage is network access — self-hosted agents run inside our Azure VNet, which means they can reach private endpoints that Microsoft-hosted agents cannot: our private AKS API server, an internal Azure Container Registry without public access, and Azure SQL databases on private endpoints.',
        'In our Coforge setup I use Microsoft-hosted agents for the CI stages where we only need internet-accessible resources. For the CD stages — Helm deploy to AKS, Terraform apply to internal infrastructure — I switch to self-hosted agents running as a Kubernetes DaemonSet inside the VNet. This gives us the best of both worlds: zero maintenance for CI and private network access for CD.'
      ],
      why: 'Calling out the private VNet access limitation of Microsoft-hosted agents is the key differentiator that proves you have actually dealt with a real enterprise private network deployment scenario.'
    },
    interview_kill_shot: 'Use Microsoft-hosted agents for internet-accessible CI jobs; use self-hosted agents whenever your pipeline needs access to private VNet resources that have no public endpoint.'
  },

  // ─── Q0214 ── Secure Files & Key Vault Integration ───────────────────────
  'Q0214': {
    title: 'Azure DevOps Library — Secure Files & Key Vault Integration',
    prompt: 'What are Secure Files in Azure DevOps and how do you use them alongside Key Vault integration?',
    type: 'Azure DevOps / Security',
    difficulty: 'Medium',
    chips: ['Secure Files', 'Key Vault', 'Azure DevOps Library', 'Certificates', 'SSL'],
    definition: 'Azure DevOps Secure Files is a Library store for uploading binary secrets — SSL certificates, SSH private keys, mobile signing keystores, and kubeconfig files — that cannot be stored as plain text Key Vault secrets. They are downloaded to the build agent at runtime using a dedicated pipeline task.',
    why_it_matters: 'Binary credentials like SSL certificates and kubeconfig files cannot be stored in Key Vault secrets (which only support string values). Secure Files fills this gap while keeping credentials out of the Git repository entirely.',
    real_world_scenario: 'At Coforge, the AKS kubeconfig used by the CD pipeline to deploy to the private cluster is stored as a Secure File. The pipeline downloads it at runtime using the Download Secure File task and references its path for kubectl and Helm operations.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Upload to Secure Files: In Azure DevOps → Library → Secure Files, upload the binary file (kubeconfig, .p12 certificate, SSH private key). Set pipeline permissions to specify which pipelines can access it.',
        '2. Reference in Pipeline YAML: Use the DownloadSecureFile@1 task with the file name. The task downloads the file to the agent and exposes its full path via the secureFilePath output variable.',
        '3. Use the File Path: Pass the secureFilePath to subsequent tasks — e.g. KUBECONFIG=$(Agent.TempDirectory)/kubeconfig for kubectl commands or --tls-cert for HTTPS configuration.',
        '4. File is Deleted After Job: Azure DevOps automatically deletes the Secure File from the agent workspace after the pipeline job completes — it is never persisted on the agent disk.'
      ],
      diagram: 'Secure Files Store (Encrypted) ──> DownloadSecureFile@1 Task ──> Agent Temp Dir ($(secureFilePath)) ──> kubectl / Helm Task ──> Auto-Delete After Job'
    },
    interview_answer: {
      response: [
        'Secure Files in Azure DevOps are designed specifically for binary credentials that cannot be stored in Key Vault secrets — things like kubeconfig files, SSL certificates in .pfx or .p12 format, SSH private keys, and Android signing keystores. I upload these to the Azure DevOps Library under Secure Files, where they are stored encrypted and access is controlled per pipeline.',
        'To use a Secure File in a pipeline, I add the DownloadSecureFile@1 task and reference the file by name. The task downloads the encrypted file to the agent temporary directory and exposes its full path through the secureFilePath output variable. I then pass that path to the kubectl or Helm commands that need it — for example setting KUBECONFIG to the downloaded path so kubectl authenticates against the private AKS cluster.',
        'The important security property is that the file is automatically deleted from the agent after the pipeline job finishes — it is never persisted on disk between runs. Combined with Key Vault-linked Variable Groups for string secrets, Secure Files covers the full range of credential types we need in production pipelines at Coforge without anything sensitive ever appearing in YAML or Git.'
      ],
      why: 'Explaining the binary vs string limitation that makes Secure Files necessary — rather than just saying "it stores files" — proves you understand when and why to use this feature over Key Vault secrets.'
    },
    interview_kill_shot: 'Secure Files handles binary credentials that Key Vault cannot — they are encrypted at rest, access-controlled per pipeline, and automatically deleted from the agent after each job.'
  },

  // ─── Q0233 ── Declarative vs Scripted Jenkins Pipelines ──────────────────
  'Q0233': {
    title: 'Declarative vs Scripted Jenkins Pipeline Syntax',
    prompt: 'What is the difference between a Declarative and a Scripted Jenkins pipeline?',
    type: 'Jenkins / CI/CD',
    difficulty: 'Medium',
    chips: ['Jenkins', 'Declarative Pipeline', 'Scripted Pipeline', 'Jenkinsfile', 'Groovy'],
    definition: 'Jenkins supports two Jenkinsfile syntaxes: Declarative (structured, opinionated YAML-like DSL with predefined sections) and Scripted (free-form Groovy code with maximum flexibility but no enforced structure).',
    why_it_matters: 'The wrong syntax choice leads to either unmaintainable spaghetti Groovy code (Scripted overuse) or incomplete implementation when Declarative cannot express the required logic.',
    real_world_scenario: 'Migrating a legacy Scripted Jenkins pipeline to Declarative reduced our Jenkinsfile from 400 lines of Groovy to 120 lines of readable YAML-like stages — cutting onboarding time for new engineers from days to hours.',
    schema: 'tradeoff',
    tradeoff_matrix: {
      dimensions: [
        'Syntax Style',
        'Structure Enforcement',
        'Groovy Flexibility',
        'Error Feedback',
        'Readability & Maintenance',
        'Best For'
      ],
      options: [
        {
          name: 'Declarative Pipeline',
          values: [
            'Structured DSL using pipeline { agent; stages; post } blocks — YAML-like and opinionated',
            'Jenkins validates structure at parse time — missing required blocks fail immediately with clear errors',
            'Limited — Groovy is only allowed inside script { } blocks within stages',
            'Lint-time validation catches syntax errors before the pipeline runs',
            'High — standard readable format; any DevOps engineer can understand it without deep Groovy knowledge',
            'Standard CI/CD pipelines where structure, readability, and IDE support matter more than extreme flexibility'
          ]
        },
        {
          name: 'Scripted Pipeline',
          values: [
            'Pure Groovy code using node { } and stage { } — no enforced structure',
            'No structural validation — errors only surface at runtime during execution',
            'Full Groovy programming: loops, conditionals, try/catch, closures — unlimited flexibility',
            'No early validation — syntax errors only appear when the broken line is executed',
            'Low for complex scripts — requires Groovy expertise; hard to read and maintain across teams',
            'Legacy pipelines, highly dynamic job generation, or complex shared library implementations'
          ]
        }
      ]
    },
    interview_answer: {
      response: [
        'Declarative Pipeline uses a structured, opinionated DSL syntax built around predefined blocks — pipeline, agent, stages, steps, and post. Jenkins validates the structure at parse time before the pipeline runs, so syntax errors are caught immediately with clear messages. The trade-off is that complex logic must be wrapped inside script {} blocks within stages, which limits pure Groovy flexibility.',
        'Scripted Pipeline is pure Groovy code using node {} and stage {} constructs. There is no enforced structure and no parse-time validation — it will fail only at the line that has a problem during actual execution. The advantage is unlimited Groovy programming capability: loops, conditionals, closures, and complex dynamic behaviour. The disadvantage is that it requires deep Groovy knowledge to maintain and is much harder for teams to read.',
        'In practice I default to Declarative for all new pipelines because the structure enforcement, IDE support, and readability far outweigh the flexibility limitations in 95% of CI/CD use cases. I only reach for Scripted when I am building a Jenkins Shared Library function that needs advanced Groovy metaprogramming, or when maintaining a legacy pipeline that was already Scripted and the cost of migration outweighs the benefit.'
      ],
      why: 'Explaining parse-time validation vs runtime-only failure, and naming the script{} escape hatch in Declarative, shows you understand the architectural trade-offs — not just which one looks nicer.'
    },
    interview_kill_shot: 'Use Declarative for structured, maintainable CI/CD pipelines; use Scripted only when you need full Groovy flexibility for shared library internals or complex dynamic job generation.'
  }

};

// ─────────────────────────────────────────────────────────────────────────────
// APPLY UPGRADES TO infinite_locus.json
// ─────────────────────────────────────────────────────────────────────────────
const locus = JSON.parse(fs.readFileSync(locusMdPath, 'utf8'));

let patchedCount = 0;
const patchedIds = [];

locus.forEach(q => {
  if (upgrades[q.id]) {
    const u = upgrades[q.id];
    // Merge all upgrade fields onto the existing question object
    Object.assign(q, u);
    // Remove stale layout fields that no longer apply
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

fs.writeFileSync(locusMdPath, JSON.stringify(locus, null, 2), 'utf8');
console.log(`\n✅ Phase 1 complete — patched ${patchedCount} questions in infinite_locus.json`);
console.log('   Patched IDs:', patchedIds.join(', '));

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY — Zero template answers remaining for Phase 1 IDs
// ─────────────────────────────────────────────────────────────────────────────
const phase1Ids = Object.keys(upgrades);
const stillBroken = locus.filter(q =>
  phase1Ids.includes(q.id) &&
  q.interview_answer &&
  q.interview_answer.response &&
  q.interview_answer.response[0].includes('When addressing')
);

if (stillBroken.length === 0) {
  console.log('✅ Verification PASS — 0 template answers remain for Phase 1 questions');
} else {
  console.error('❌ Verification FAIL — still broken:', stillBroken.map(q => q.id).join(', '));
  process.exit(1);
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
console.log(`✅ merged.json synced — updated ${syncedCount} records. Total questions: ${updatedMerged.length}`);
