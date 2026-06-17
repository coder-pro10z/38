const fs = require('fs');
const path = require('path');

const hexaviewData = [
  {
    "title": "CI/CD Pipeline Architecture Overview",
    "type": "Architecture Methodology",
    "difficulty": "Intermediate",
    "chips": ["CI/CD", "Architecture", "DevOps"],
    "schema": "architecture",
    "definition": "Continuous Integration (CI) and Continuous Delivery (CD) automate the software delivery lifecycle from the initial code commit to production deployment.",
    "why_it_matters": "Enables rapid, low-risk, and repeatable releases while providing full traceability and automated quality gates.",
    "real_world_scenario": "A development team wants to move away from manual, error-prone deployments on local servers. They implement an automated pipeline that checks out code, compiles it, runs tests, packages the artifact, and promotes it through UAT and Pre-Prod environments before releasing it to Production.",
    "architecture_flow": {
      "steps": [
        "Developer Commit: Triggers pipeline execution via webhooks",
        "Build Stage: Compiles source code and pulls dependencies",
        "Static Code Analysis: Analyzes code quality and scans for bugs/code smells",
        "Unit Testing: Validates individual functions and tracks code coverage",
        "Artifact Packaging: Creates immutable, versioned packages (e.g. JAR, Docker Image)",
        "Publish Artifact: Publishes artifact to secure registries (ACR, Nexus)",
        "Deploy to Dev/UAT: Automatic deployment and environment verification",
        "QA/Business Validation: Automated integration tests and manual approvals",
        "Deploy to Pre-Prod: Final production-like verification and smoke tests",
        "Deploy to Production: Release using strategies like Blue-Green or Canary",
        "Monitoring & Alerting: Real-time telemetry, response tracking, and SLA verification"
      ],
      "diagram": "Code → Build → Test → Package → Store → Dev/UAT → PreProd → Production → Monitor"
    },
    "interview_answer": {
      "response": [
        "A standard CI/CD architecture is split into CI (checkout, build, code analysis, unit tests, artifact packaging, publishing) and CD (deploying to Dev/UAT, integration testing, manual QA validation, Pre-Prod smoke tests, production release, and alerting).",
        "The primary goal is to ensure that only fully tested and validated code reaches the production environment in a completely automated and repeatable fashion."
      ],
      "why": "It decouples deployments from human errors and enforces automated safety checks at every stage."
    },
    "interview_kill_shot": "Build once, version dynamically, and promote the exact same immutable artifact through all environments."
  },
  {
    "title": "Jenkins vs Azure DevOps",
    "type": "Tooling Comparison",
    "difficulty": "Intermediate",
    "chips": ["Jenkins", "Azure DevOps", "CI/CD", "Orchestration"],
    "schema": "architecture",
    "definition": "Selecting the right orchestrator is critical for pipeline scalability, maintainability, and enterprise governance.",
    "why_it_matters": "Affects team velocity, infrastructure maintenance overhead, integration overhead, and security compliance.",
    "real_world_scenario": "An enterprise migration team reviews their pipeline orchestrator. They compare Jenkins, which is plugin-driven and self-managed, with Azure DevOps, which provides managed, out-of-the-box integrations.",
    "comparisons": [
      {
        "topic_a": "Jenkins",
        "topic_b": "Azure DevOps",
        "summary": "Jenkins relies on external plugins and self-managed servers, providing high customization but high maintenance. Azure DevOps is a managed SaaS that integrates Boards, Repos, Pipelines, and Artifacts out-of-the-box."
      }
    ],
    "trade_offs": [
      {
        "choice": "Jenkins (Self-Managed)",
        "advantages": [
          "Extremely flexible and extensible via thousands of plugins",
          "No SaaS subscription fees, self-hosted on own hardware",
          "Complete control over configuration and security boundaries"
        ],
        "disadvantages": [
          "High operational overhead (server patching, plugin compatibility, backups)",
          "Plugin dependencies can lead to unstable pipeline execution (plugin hell)"
        ]
      },
      {
        "choice": "Azure DevOps (Managed SaaS)",
        "advantages": [
          "Zero maintenance of core server infrastructure",
          "Integrated suite: Repos, Pipelines, Artifacts, Boards, Test Plans",
          "Enterprise compliance, active directory integrations, and security controls built-in"
        ],
        "disadvantages": [
          "Recurring licensing fees per user",
          "Vendor lock-in to Microsoft cloud ecosystem"
        ]
      }
    ],
    "interview_answer": {
      "response": [
        "Jenkins provides ultimate flexibility via plugins but demands significant maintenance overhead.",
        "Azure DevOps offers an integrated, managed SaaS platform that minimizes maintenance and simplifies governance, making it highly suitable for large enterprise teams."
      ],
      "why": "Reducing server maintenance allows DevOps teams to focus on release velocity and system reliability."
    },
    "interview_kill_shot": "Jenkins is for ultimate custom flexibility; Azure DevOps is for zero-maintenance integrated enterprise governance."
  },
  {
    "title": "End-to-End Deployment Pipeline Flow",
    "type": "Architecture Methodology",
    "difficulty": "Intermediate",
    "chips": ["CI/CD", "Deployment", "Best Practice"],
    "schema": "architecture",
    "definition": "Designing a deployment flow from developer commit to monitoring ensures high quality and consistency.",
    "why_it_matters": "Guarantees that the exact binary compiled and tested in CI is what gets deployed to production, preventing configuration drift.",
    "real_world_scenario": "To prevent code drifts and build bugs, a pipeline compiles a package once and promotes the identical image tag through UAT, PreProd, and Production, using environment variables for settings.",
    "architecture_flow": {
      "steps": [
        "Developer commit triggers webhook.",
        "CI runs build, unit tests, and packages versioned artifact.",
        "Artifact published to registry (ACR/Nexus).",
        "Deploy to Dev/UAT environment.",
        "Integration and API tests execute.",
        "QA approvals/manual gate triggered.",
        "Deploy to PreProd environment.",
        "Smoke tests and health checks run.",
        "Production deployment (rolling, canary, or blue-green).",
        "Post-deployment validation and continuous monitoring."
      ],
      "diagram": "Build Once → Store Registry → Deploy Dev/UAT → Manual Gate → Deploy PreProd → Deploy Production → Monitor"
    },
    "interview_answer": {
      "response": [
        "We enforce a 'Build Once, Deploy Many' strategy. We build, analyze, test, and containerize the code in the CI phase, publish the artifact to a registry, and deploy that identical artifact across environments, only changing configs."
      ],
      "why": "Rebuilding artifacts in each environment risks generating different binaries and invalidating previous test results."
    },
    "interview_kill_shot": "Rebuilds are forbidden. Promote the same immutable image to maintain binary integrity."
  },
  {
    "title": "CI Stage 1: Source & Build",
    "type": "CI Stage",
    "difficulty": "Intermediate",
    "chips": ["CI", "Build", "Dotnet", "Maven"],
    "schema": "architecture",
    "definition": "The source and build phase pulls the latest code, restores dependencies, and compiles the application into binaries.",
    "why_it_matters": "Ensures compilation correctness, resolves dependencies securely, and generates release binaries.",
    "real_world_scenario": "A pipeline triggered by a Git push checkouts the source code, downloads dependencies, and compiles a .NET Core solution in Release mode on a Windows agent.",
    "code_examples": [
      {
        "title": "Azure DevOps Build Stage YAML",
        "language": "yaml",
        "snippet": "- stage: Build\n  displayName: Build Application\n  jobs:\n  - job: Build\n    pool:\n      vmImage: 'windows-latest'\n    steps:\n    - checkout: self\n    - task: DotNetCoreCLI@2\n      displayName: Restore Packages\n      inputs:\n        command: restore\n    - task: DotNetCoreCLI@2\n      displayName: Build Solution\n      inputs:\n        command: build\n        arguments: '--configuration Release'"
      }
    ],
    "interview_answer": {
      "response": [
        "The first stage of CI pulls code, restores packages, and compiles the solution. In my pipeline, I use Azure DevOps YAML stages to restore and compile C#/.NET Core applications on managed Windows pools."
      ],
      "why": "Validating compilation on clean runners prevents 'works on my machine' code bugs from entering the repository."
    },
    "interview_kill_shot": "Always compile binaries on a clean, ephemeral runner to guarantee build repeatability."
  },
  {
    "title": "CI Stage 2: Code Quality & Security",
    "type": "CI Stage",
    "difficulty": "Advanced",
    "chips": ["SonarQube", "SAST", "Security", "Static Analysis"],
    "schema": "architecture",
    "definition": "Static code analysis scans code for design smells, bugs, security vulnerabilities, and coverage metrics.",
    "why_it_matters": "Guarantees code maintainability and blocks security vulnerabilities (SAST) from getting packaged.",
    "real_world_scenario": "A pipeline runs a SonarQube analysis stage immediately after compilation to verify that the code passes the quality gate thresholds.",
    "code_examples": [
      {
        "title": "SonarQube Scan YAML Stage",
        "language": "yaml",
        "snippet": "- stage: StaticCodeAnalysis\n  dependsOn: Build\n  jobs:\n  - job: SonarScan\n    steps:\n    - task: SonarQubePrepare@5\n      inputs: # parameters...\n    - task: DotNetCoreCLI@2\n      inputs:\n        command: build\n    - task: SonarQubeAnalyze@5\n    - task: SonarQubePublish@5"
      }
    ],
    "interview_answer": {
      "response": [
        "We scan compiled code using SonarQube for static analysis and security checks (SAST). If the code fails the quality gate (e.g. high code smells or critical vulnerabilities), the pipeline stops immediately."
      ],
      "why": "Catching security risks and code smells early in CI is significantly cheaper than resolving them in production."
    },
    "interview_kill_shot": "If the SonarQube Quality Gate fails, the build breaks. No exceptions."
  },
  {
    "title": "CI Stage 3: Automated Testing",
    "type": "CI Stage",
    "difficulty": "Intermediate",
    "chips": ["Testing", "Unit Test", "Coverage"],
    "schema": "architecture",
    "definition": "Automated unit tests validate specific functions and code logics, ensuring code correctness.",
    "why_it_matters": "Provides confidence that logic changes did not break core functionality and enforces code quality rules.",
    "real_world_scenario": "Unit tests run on every pull request. The pipeline collects code coverage metrics, ensuring it meets the 80% coverage quality gate.",
    "code_examples": [
      {
        "title": "Unit Tests & Code Coverage YAML",
        "language": "yaml",
        "snippet": "- stage: UnitTests\n  dependsOn: StaticCodeAnalysis\n  jobs:\n  - job: UnitTest\n    steps:\n    - task: DotNetCoreCLI@2\n      displayName: Run Unit Tests\n      inputs:\n        command: test\n        arguments: '--collect:\"XPlat Code Coverage\"'"
      }
    ],
    "interview_answer": {
      "response": [
        "We execute unit tests during CI, collecting code coverage (using XPlat XML reports). This occurs after compilation and before docker packaging, providing immediate feedback on pull requests."
      ],
      "why": "Testing before container packaging prevents pushing broken code to container registries."
    },
    "interview_kill_shot": "Unit testing is in-memory and fast. It must complete successfully before any registry push."
  },
  {
    "title": "Artifact Packaging & Immutability",
    "type": "CI Stage",
    "difficulty": "Intermediate",
    "chips": ["Docker", "Packaging", "Immutability"],
    "schema": "architecture",
    "definition": "Packaging bundles applications, runtime dependencies, and config files into versioned containers or zip archives.",
    "why_it_matters": "Creates an immutable binary that behaves identically regardless of the deployment host environment.",
    "real_world_scenario": "The pipeline packages a compiled .NET application into a Docker container image tagged with the Azure DevOps Build ID.",
    "code_examples": [
      {
        "title": "Docker Packaging YAML Stage",
        "language": "yaml",
        "snippet": "- stage: BuildDockerImage\n  dependsOn: SecurityScan\n  jobs:\n  - job: DockerBuild\n    steps:\n    - task: Docker@2\n      displayName: Build Image\n      inputs:\n        command: build\n        Dockerfile: Dockerfile\n        repository: $(imageName)\n        tags: |\n          $(tag)"
      }
    ],
    "interview_answer": {
      "response": [
        "We bundle application binaries into a Docker container image. We assign a unique build tag (e.g. $(Build.BuildId)) to create an immutable artifact ready for ACR."
      ],
      "why": "Containers eliminate runtime differences, preventing environment-specific execution discrepancies."
    },
    "interview_kill_shot": "Docker packaging wraps binaries and runtimes together, ensuring absolute deployment consistency."
  },
  {
    "title": "Artifact Storage & Publishing",
    "type": "CI Stage",
    "difficulty": "Intermediate",
    "chips": ["ACR", "Nexus", "Publish", "Registry"],
    "schema": "architecture",
    "definition": "Build artifacts must be stored in secure, version-controlled registries to facilitate CD deployments and rollbacks.",
    "why_it_matters": "Enforces security policies, retains historical versions for N-2 rollback, and serves as a single source of truth.",
    "real_world_scenario": "A pipeline pushes the newly generated Docker image to Azure Container Registry (ACR), making it available for Kubernetes deployment.",
    "code_examples": [
      {
        "title": "Publish Docker Image YAML Stage",
        "language": "yaml",
        "snippet": "- stage: PublishArtifact\n  dependsOn: BuildDockerImage\n  jobs:\n  - job: Publish\n    steps:\n    - task: Docker@2\n      displayName: Push Image\n      inputs:\n        command: push\n        repository: $(imageName)\n        tags: |\n          $(tag)"
      }
    ],
    "interview_answer": {
      "response": [
        "Once container images are compiled and tested, we publish them to registries like Azure Container Registry (ACR) or Nexus using tagged version numbers for release tracking."
      ],
      "why": "Centralized artifact storage ensures that deployments pull validated, authenticated binary releases."
    },
    "interview_kill_shot": "If the artifact is not stored in a versioned repository, it does not exist for deployment."
  },
  {
    "title": "CD Stage 1: UAT Deployment",
    "type": "CD Stage",
    "difficulty": "Intermediate",
    "chips": ["CD", "UAT", "Deployment", "Env Settings"],
    "schema": "architecture",
    "definition": "The first CD stage deploys the artifact to UAT (User Acceptance Testing) to validate functionalities and integration points.",
    "why_it_matters": "Tests application startup and connectivity with dev/test databases and APIs before customer evaluation.",
    "real_world_scenario": "The CD pipeline pulls the compiled Docker image and deploys it to UAT. Configuration variables (e.g., connection strings) are injected dynamically.",
    "code_examples": [
      {
        "title": "Deploy to Dev & UAT YAML Stages",
        "language": "yaml",
        "snippet": "- stage: DeployDev\n  dependsOn: PublishArtifact\n  jobs:\n  - deployment: DevDeployment\n    environment: Development\n    strategy:\n      runOnce:\n        deploy:\n          steps:\n          - script: echo Deploying image $(tag) to Dev\n\n- stage: DeployUAT\n  dependsOn: DeployDev\n  jobs:\n  - deployment: UATDeployment\n    environment: UAT\n    strategy:\n      runOnce:\n        deploy:\n          steps:\n          - script: echo Deploying image $(tag) to UAT"
      }
    ],
    "interview_answer": {
      "response": [
        "In our CD pipeline, we deploy the versioned artifact to Dev first, then UAT. Configuration variables are kept separate and injected using environment parameters on release."
      ],
      "why": "Testing in UAT ensures integration points and business requirements are validated before staging."
    },
    "interview_kill_shot": "Promote identical Docker tags to UAT, injecting UAT-specific configurations dynamically."
  },
  {
    "title": "QA Validation Process",
    "type": "CD Stage",
    "difficulty": "Intermediate",
    "chips": ["QA", "Testing", "Approvals", "Regression"],
    "schema": "architecture",
    "definition": "The QA validation stage checks deployment correctness using API, regression, and functional testing.",
    "why_it_matters": "Prevents logic flaws and performance drops from reaching production environments.",
    "real_world_scenario": "After UAT deployment, the pipeline runs automated API regression tests. It then pauses at a manual approval gate for QA sign-off.",
    "code_examples": [
      {
        "title": "QA Validation & Approval YAML Stage",
        "language": "yaml",
        "snippet": "- stage: IntegrationTests\n  dependsOn: DeployUAT\n  jobs:\n  - job: Integration\n    steps:\n    - script: echo Running Integration Tests\n\n- stage: QAApproval\n  dependsOn: IntegrationTests\n  jobs:\n  - job: WaitForApproval\n    steps:\n    - task: ManualValidation@0\n      timeoutInMinutes: 1440\n      inputs:\n        instructions: 'QA Team Approval Required'"
      }
    ],
    "interview_answer": {
      "response": [
        "Deployments to UAT trigger automated integration tests. Once automation passes, the pipeline halts at a Manual Validation gate, waiting for QA verification."
      ],
      "why": "Enforces manual audit trails and business review before shipping to staging and production."
    },
    "interview_kill_shot": "Manual validation gates ensure QA sign-off is recorded in the pipeline audit history."
  },
  {
    "title": "CD Stage 2: PreProd Deployment",
    "type": "CD Stage",
    "difficulty": "Advanced",
    "chips": ["CD", "PreProd", "Staging", "Performance"],
    "schema": "architecture",
    "definition": "PreProd (Staging) deployment mirrors the production environment to run final validations (smoke, load, security).",
    "why_it_matters": "Validates application performance at scale and detects environment-specific configuration drifts.",
    "real_world_scenario": "An approved build is deployed to PreProd. The pipeline runs load tests and final smoke checks to verify database migrations and API health.",
    "code_examples": [
      {
        "title": "PreProd Deployment & Smoke Tests YAML",
        "language": "yaml",
        "snippet": "- stage: DeployPreProd\n  dependsOn: QAApproval\n  jobs:\n  - deployment: PreProd\n    environment: PreProd\n    strategy:\n      runOnce:\n        deploy:\n          steps:\n          - script: echo Deploying image $(tag) to PreProd\n\n- stage: SmokeTests\n  dependsOn: DeployPreProd\n  jobs:\n  - job: Smoke\n    steps:\n    - script: echo Running Smoke Tests"
      }
    ],
    "interview_answer": {
      "response": [
        "PreProd deployment replicates production settings. We deploy the same artifact, run load testing and automated smoke tests to ensure high availability and prevent version mismatches."
      ],
      "why": "Testing scale in PreProd minimizes release failure rates on production deployments."
    },
    "interview_kill_shot": "PreProd validation is our final gateway. If load or smoke tests fail, release aborts."
  },
  {
    "title": "CD Stage 3: Production Deployment",
    "type": "CD Stage",
    "difficulty": "Advanced",
    "chips": ["Production", "Deployment", "Canary", "Blue-Green"],
    "schema": "architecture",
    "definition": "Deploying code to the production environment using safe rollout strategies (Canary, Blue-Green) to ensure zero-downtime.",
    "why_it_matters": "Enables zero-downtime releases and allows instant traffic rollback if issues occur.",
    "real_world_scenario": "A deployment to production requires manual CAB sign-off. It then rolls out using a blue-green strategy, directing 100% of user traffic to the active pool.",
    "code_examples": [
      {
        "title": "Production Approval & Deployment YAML",
        "language": "yaml",
        "snippet": "- stage: ProdApproval\n  dependsOn: SmokeTests\n  jobs:\n  - job: Approval\n    steps:\n    - task: ManualValidation@0\n      timeoutInMinutes: 1440\n      inputs:\n        instructions: 'Production Release Approval'\n\n- stage: DeployProduction\n  dependsOn: ProdApproval\n  jobs:\n  - deployment: Production\n    environment: Production\n    strategy:\n      runOnce: # or rolling/canary...\n        deploy:\n          steps:\n          - script: echo Deploying image $(tag) to Production"
      }
    ],
    "interview_answer": {
      "response": [
        "Our production releases require CAB approvals. Once approved, the CD pipeline deploys the versioned image. We prefer Canary or Blue-Green rollouts to prevent downtime."
      ],
      "why": "Zero-downtime deployments ensure customer satisfaction and allow testing live traffic safely."
    },
    "interview_kill_shot": "Production releases require explicit CAB approvals and use blue-green rollouts to avoid downtime."
  },
  {
    "title": "Artifact Promotion Strategy",
    "type": "CD Stage",
    "difficulty": "Advanced",
    "chips": ["Configuration", "Artifact Promotion", "Best Practice"],
    "schema": "architecture",
    "definition": "Promoting the identical container binary across environments ensures software behavior predictability.",
    "why_it_matters": "Prevents binary drifts and environment configuration issues, guaranteeing that tested code is deployed in prod.",
    "real_world_scenario": "A release promotes `myapp:2.5.0-build123` across Dev, UAT, and Prod. Environment variables (connection strings, APIs) are loaded at runtime.",
    "interview_answer": {
      "response": [
        "We promote the identical build artifact through all stages. Rebuilding in UAT or Prod is forbidden, as different compilation outputs could introduce untestable bugs.",
        "We inject environment configs dynamically (such as using Kubernetes configmaps or application variables) at launch time."
      ],
      "why": "Compiling once and deploying many times guarantees binary integrity across deployment hosts."
    },
    "interview_kill_shot": "Never rebuild. An artifact compiled in Dev is the exact binary deployed in Prod."
  },
  {
    "title": "Version Control & Release Tracking",
    "type": "Architecture Methodology",
    "difficulty": "Intermediate",
    "chips": ["Versioning", "Git SHA", "Traceability"],
    "schema": "architecture",
    "definition": "Release tracking links running code to specific developer commits and version tags in Git.",
    "why_it_matters": "Provides absolute audit trails and speed up debugging by mapping runtime errors directly to code modifications.",
    "real_world_scenario": "A production issue is traced back to commit `a1b2c3d` by matching the Docker container tag `myapp:2.5.0-a1b2c3d` in Azure DevOps release history.",
    "interview_answer": {
      "response": [
        "We tag artifacts using semantic versions combined with Git Commit SHAs. This provides end-to-end traceability from developer commit to production logs."
      ],
      "why": "Knowing the exact code version deployed avoids confusion and speeds up remediation during incidents."
    },
    "interview_kill_shot": "Semantic versions combined with Git SHAs ensure that every running container is fully auditable."
  },
  {
    "title": "Notifications & Release Visibility",
    "type": "CD Stage",
    "difficulty": "Intermediate",
    "chips": ["Slack", "Teams", "Notification", "Collaboration"],
    "schema": "architecture",
    "definition": "Pipeline notification systems inform engineering and business teams of release statuses.",
    "why_it_matters": "Ensures visibility of deployment activities, alerts on release failures, and notifies approvers of pending releases.",
    "real_world_scenario": "A production deployment fails, triggering a Microsoft Teams webhook notification and creating a ServiceNow incident ticket.",
    "interview_answer": {
      "response": [
        "Our pipeline integrates webhooks for Microsoft Teams and Slack. Alerts are dispatched for events like deployment starts, manual approvals, successes, or failures."
      ],
      "why": "Immediate notifications improve team collaboration and reduce MTTR (Mean Time to Resolution) when pipelines break."
    },
    "interview_kill_shot": "Automated pipeline webhooks ensure stakeholders are notified of release statuses in real time."
  },
  {
    "title": "Rollback Strategy (N-1 & N-2)",
    "type": "CD Stage",
    "difficulty": "Advanced",
    "chips": ["Rollback", "ACR", "Disaster Recovery"],
    "schema": "architecture",
    "definition": "Rollback strategies quickly revert failed deployments to a previously stable version without rebuilding code.",
    "why_it_matters": "Minimizes downtime during release failures and avoids debugging under pressure.",
    "real_world_scenario": "A bug is found in version 2.5. The N-1 rollback to version 2.0 fails, so the pipeline redeploys the stable N-2 version (1.0) from the ACR.",
    "code_examples": [
      {
        "title": "Rollback Stage in YAML Pipeline",
        "language": "yaml",
        "snippet": "- stage: Monitoring\n  dependsOn: DeployProduction\n  jobs:\n  - job: Monitor\n    steps:\n    - script: echo Monitoring metrics...\n\n- stage: Rollback\n  dependsOn: Monitoring\n  condition: failed()\n  jobs:\n  - deployment: RollbackDeployment\n    environment: Production\n    strategy:\n      runOnce:\n        deploy:\n          steps:\n          - script: |\n              echo Rolling back to previous stable image\n              echo Deploying myapp:1.0"
      }
    ],
    "interview_answer": {
      "response": [
        "For rollbacks, we avoid git reverts which require building. Instead, we run a redeployment pointing to the last stable image tag (e.g. 1.0) stored in ACR."
      ],
      "why": "Redeploying cached stable artifacts is the fastest way to restore services during release incidents."
    },
    "interview_kill_shot": "Rollback is a redeployment of a verified stable image. Never build hotfixes under pressure."
  },
  {
    "title": "Monitoring & 99.9% Uptime SLA",
    "type": "SRE & Monitoring",
    "difficulty": "Advanced",
    "chips": ["App Insights", "Prometheus", "Grafana", "Uptime", "SLA"],
    "schema": "architecture",
    "definition": "Uptime SLAs define allowable monthly downtime. Real-time telemetry tools verify compliance.",
    "why_it_matters": "Measures service reliability and ensures application meets commitments (e.g., 99.9% = <43 mins downtime/month).",
    "real_world_scenario": "SRE teams review Grafana dashboards and Application Insights availability graphs, tracking monthly SLA thresholds.",
    "observability": {
      "logs": ["Query Application Insights for availability test history", "Search failed requests logs for downtime periods"],
      "metrics": ["Uptime calculation: (Total Time - Downtime) / Total Time * 100", "Availability check success rate percentage"],
      "traces": ["Track API dependencies latency trends"],
      "alerts": ["Alert if HTTP availability checks fail from multiple locations", "ServiceNow incident created if SLA drops below 99.9%"]
    },
    "interview_answer": {
      "response": [
        "We measure uptime SLAs using Application Insights availability tests. Uptime percentage is calculated monthly. 99.9% uptime allows a maximum of 43.2 minutes of downtime."
      ],
      "why": "Automated health checks from multiple geo-locations provide an accurate assessment of system uptime."
    },
    "interview_kill_shot": "Calculate uptime using automated geo-distributed health checks, not server ping logs."
  },
  {
    "title": "XML Parsing & Agent OS Mismatch",
    "type": "Troubleshooting",
    "difficulty": "Advanced",
    "chips": ["PowerShell", "XML", "Build Agent", "Bash"],
    "schema": "architecture",
    "definition": "Parsing version manifests dynamically in build stages, and enforcing agent operating systems in pipeline definitions.",
    "why_it_matters": "Enforces correct compilation pools, prevents platform script failures, and automates image tagging.",
    "real_world_scenario": "A pipeline parses version strings from an XML file. To prevent Windows scripts from breaking, validation checks throw errors if run on Linux agents.",
    "code_examples": [
      {
        "title": "PowerShell XML Parse & Tagging",
        "language": "powershell",
        "snippet": "# Read Version from XML\n[xml]$xml = Get-Content pom.xml\n$version = $xml.project.version\nWrite-Host \"Version Found: $version\"\n# Set Azure DevOps variable for Docker tagging\nWrite-Host \"##vso[task.setvariable variable=AppVersion]$version\""
      },
      {
        "title": "Bash xmllint Version Extraction",
        "language": "bash",
        "snippet": "# Extract version using xpath\nxmllint --xpath '//version/text()' manifest.xml"
      },
      {
        "title": "YAML Agent OS Enforcer validation",
        "language": "yaml",
        "snippet": "pool:\n  vmImage: 'windows-latest'\n\nsteps:\n- powershell: |\n    if ($env:AGENT_OS -ne \"Windows_NT\") {\n       throw \"Wrong Agent OS! Expected Windows_NT\"\n    }\n  displayName: 'Enforce Agent OS'"
      }
    ],
    "rca": {
      "problem": "Accidental migration of build pool from Windows to Linux",
      "trigger": "A developer changes vmImage pool to ubuntu-latest in pipeline YAML",
      "root_cause": "Pipeline steps use Windows PowerShell commands, DLL dependencies, and backslash paths which are incompatible with Linux shells",
      "impact": "Job compilation fails, scripts break, and wrong container architectures (linux/amd64) are pushed, resulting in production release failures"
    },
    "resolution_prevention": {
      "immediate_fix": ["Restore the pipeline vmImage pool setting back to 'windows-latest' in the YAML repository."],
      "permanent_fix": ["Add mandatory validation checks asserting $env:AGENT_OS is Windows_NT at execution start."],
      "best_practice": "Use isolated docker multi-stage files to decouple pipeline dependency tools from the build runner host OS.",
      "preventive_control": ["Verify pipeline changes via lint tests before merging branch pull requests."]
    },
    "interview_answer": {
      "response": [
        "In Windows agents, we parse XML manifests using PowerShell xml classes, setting pipeline variables. To avoid script crashes from host VM swaps, we enforce Windows-latest pools and run AGENT_OS checks."
      ],
      "why": "Different operating systems handle file paths, compilers, and scripts differently. Validating host platform environment prevents unexpected runtime errors."
    },
    "interview_kill_shot": "XML parsing is simple in PowerShell, but enforce your pipeline VM pools to avoid cross-platform script breaks."
  }
];

// Write to hexaview_r2.json
const destPath = path.join('c:/Users/Praveen/Desktop/kubernetes/38', 'hexaview_r2.json');
fs.writeFileSync(destPath, JSON.stringify(hexaviewData, null, 2));
console.log(`🎉 Successfully compiled and wrote hexaview_r2.json to ${destPath}`);
console.log(`Total items: ${hexaviewData.length}`);
