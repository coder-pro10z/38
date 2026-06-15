const fs = require('fs');

const qaMapping = {
  "AKS Deployment Failing After Release": [
    { question: "What state do you check first when pods fail to roll out?", kill_shot_answer: "Check if pods are in CrashLoopBackOff, ImagePullBackOff, or Pending via 'kubectl get pods'." },
    { question: "How do you immediately restore service during a failed Helm release?", kill_shot_answer: "Run 'helm rollback' or 'kubectl rollout undo' to revert to the last known working state." },
    { question: "What is the primary cause of ErrImagePull?", kill_shot_answer: "Missing ACR authentication, incorrect image tag, or network misconfiguration." }
  ],
  "Terraform Apply Fails in Production": [
    { question: "What does 'Error acquiring state lock' mean?", kill_shot_answer: "Another Terraform process is currently running or a previous run crashed leaving a stale lock." },
    { question: "How do you handle infrastructure drift in production?", kill_shot_answer: "Identify manual changes using 'terraform plan', then either revert them manually or 'terraform import' them into state." },
    { question: "Why should you never forcefully unlock a Terraform state blindly?", kill_shot_answer: "It can cause state corruption and parallel execution conflicts if another pipeline is actually still running." }
  ],
  "Application Unavailable After Deployment": [
    { question: "What is the first priority during a post-deployment outage?", kill_shot_answer: "Mitigate impact (MTTR) by rolling back or traffic switching, not debugging." },
    { question: "How could a Blue/Green strategy prevent a total outage?", kill_shot_answer: "Traffic is only switched to the 'Green' environment after health checks pass; if it fails, 'Blue' remains active." },
    { question: "What log source is best for diagnosing a 502 Bad Gateway?", kill_shot_answer: "Reverse proxy or Ingress controller logs, followed by application container logs." }
  ],
  "Cloud Bill Increased by 50%": [
    { question: "What are the four primary drivers of sudden cloud cost spikes?", kill_shot_answer: "Compute (orphaned resources), Storage (unattached disks), Logs (retention), and Network (egress)." },
    { question: "How do you identify which team caused the cost increase?", kill_shot_answer: "By enforcing strict resource tagging and analyzing billing by tag groups." },
    { question: "What is the most immediate way to reduce compute costs for non-prod environments?", kill_shot_answer: "Implement auto-shutdown schedules and downsize over-provisioned VMs." }
  ],
  "App Service Cannot Access SQL": [
    { question: "How do you distinguish between a network issue and a DNS issue?", kill_shot_answer: "Use Kudu 'tcpping' to the SQL IP (network) and 'nameresolver' for the hostname (DNS)." },
    { question: "What is the secure way to connect Azure App Service to Azure SQL?", kill_shot_answer: "VNet Integration on the App Service side and a Private Endpoint on the SQL side." },
    { question: "Why might an NSG block traffic to Azure SQL?", kill_shot_answer: "Missing outbound rules on the App Service subnet or missing inbound rules on port 1433." }
  ],
  "AKS Pods Not Scaling": [
    { question: "Why would an HPA show '<unknown>' for metrics?", kill_shot_answer: "Metrics Server is down, or the pods lack explicit CPU/Memory Resource Requests." },
    { question: "What does it mean if pods are stuck in 'Pending' during a scale-up?", kill_shot_answer: "The cluster lacks available compute resources and the Cluster Autoscaler has hit its max node limit." },
    { question: "What is the difference between HPA and Cluster Autoscaler?", kill_shot_answer: "HPA scales the number of pods; Cluster Autoscaler scales the number of underlying worker nodes." }
  ],
  "Pipeline Takes 40 Minutes": [
    { question: "What are the two most effective ways to speed up CI/CD pipelines?", kill_shot_answer: "Parallelizing independent jobs (like tests and linting) and implementing dependency caching." },
    { question: "How does Docker layer caching improve build times?", kill_shot_answer: "It reuses unchanged image layers (like OS and package installs) from previous builds, skipping re-execution." },
    { question: "What is the advantage of incremental builds in a monorepo?", kill_shot_answer: "You only compile and test the specific microservices or packages that changed in the commit." }
  ],
  "Production Outage at 2 AM": [
    { question: "What is the on-call engineer's primary objective?", kill_shot_answer: "Triage the impact and mitigate the outage as fast as possible (e.g., failover or rollback)." },
    { question: "What is a 'Blameless RCA'?", kill_shot_answer: "A post-incident review focused on systemic failures and process improvements, rather than pointing fingers at individuals." },
    { question: "Why are synthetic monitors critical for outage detection?", kill_shot_answer: "They proactively simulate user traffic, catching outages before real users experience and report them." }
  ],
  "Deployment Failed During Release Window": [
    { question: "Why should you never debug code live during a release window?", kill_shot_answer: "It risks leaving the system in an inconsistent state and prolongs downtime; rollback and debug offline." },
    { question: "What is the biggest risk of a failed deployment involving database changes?", kill_shot_answer: "Data corruption or schema locks; migrations must be backwards-compatible to allow safe code rollbacks." },
    { question: "How do you verify the system is stable after an immediate rollback?", kill_shot_answer: "Check application health probes, monitoring dashboards, and error rate metrics." }
  ],
  "Jenkins Pipeline Suddenly Failing": [
    { question: "If a pipeline worked yesterday but fails today, what is the most likely cause?", kill_shot_answer: "A silent environmental change, such as an expired credential, an unpinned dependency update, or agent disk space exhaustion." },
    { question: "Why is it a best practice to wipe the Jenkins workspace before every build?", kill_shot_answer: "It prevents residual files or compiled artifacts from previous builds from corrupting the current run." },
    { question: "What is the risk of auto-updating Jenkins plugins?", kill_shot_answer: "Plugin updates can introduce breaking changes or incompatibilities with existing pipeline scripts." }
  ],
  "Terraform Destroyed Resources": [
    { question: "How can renaming a Terraform module cause a production outage?", kill_shot_answer: "Terraform tracks resources by name; renaming causes Terraform to destroy the old resource and create a new one." },
    { question: "What lifecycle block prevents accidental resource deletion?", kill_shot_answer: "'prevent_destroy = true' should be applied to stateful resources like databases." },
    { question: "How do you safely rename a resource in Terraform without destroying it?", kill_shot_answer: "Use the 'moved' block or 'terraform state mv' to update the state file mapping." }
  ],
  "Works Locally But Fails In Docker": [
    { question: "Why must a Dockerized web app bind to 0.0.0.0 instead of localhost?", kill_shot_answer: "Binding to localhost only listens inside the container's isolated network interface, making it unreachable externally." },
    { question: "How does the 12-Factor App methodology handle configuration differences between environments?", kill_shot_answer: "By injecting environment-specific configuration via Environment Variables (ENVs)." },
    { question: "How do you debug an immediately exiting container?", kill_shot_answer: "Use 'docker logs' to capture the startup crash stack trace or missing dependency error." }
  ],
  "Passed QA But Failed Production": [
    { question: "What are the three primary vectors for environment drift between QA and Prod?", kill_shot_answer: "Configuration differences, Data Volume (scale), and Network security (stricter firewalls)." },
    { question: "Why might a missing database index only cause an outage in Production?", kill_shot_answer: "QA databases are usually small, so full table scans are fast; in Production, full table scans on large tables cause extreme latency." },
    { question: "How do you ensure strict environment parity?", kill_shot_answer: "By provisioning all environments exclusively via Infrastructure as Code (IaC)." }
  ],
  "Grafana Alert Triggered At Midnight": [
    { question: "What is the difference between an Alert and an Incident?", kill_shot_answer: "An alert is a system notification of an anomaly; an incident is an event causing actual degradation of service requiring response." },
    { question: "How does an autoscaling group mitigate sudden traffic spikes?", kill_shot_answer: "It dynamically provisions additional compute nodes based on CPU/Memory thresholds or queue lengths." },
    { question: "Why might an autoscaling event fail to prevent an outage?", kill_shot_answer: "If the bottleneck is a backend database or external API limit, scaling compute instances will only exhaust the database faster." }
  ],
  "GitHub Actions Not Triggering": [
    { question: "What is the most common reason a push event fails to trigger a GitHub Action?", kill_shot_answer: "A syntax error in the YAML workflow file or path/branch filters ignoring the commit." },
    { question: "How do you securely authenticate GitHub Actions to a cloud provider?", kill_shot_answer: "Use OpenID Connect (OIDC) to exchange short-lived tokens instead of storing long-lived static credentials." },
    { question: "What happens if a self-hosted runner goes offline?", kill_shot_answer: "Jobs queued for that runner will hang in a pending state until a runner with matching labels becomes available." }
  ],
  "App Cannot Access Azure SQL (Auth)": [
    { question: "What is the most secure way for an Azure VM to authenticate to Azure SQL?", kill_shot_answer: "Using a System-Assigned Managed Identity, which eliminates the need to manage passwords or connection strings." },
    { question: "If Managed Identity is configured, why might the connection still fail?", kill_shot_answer: "The Managed Identity hasn't been granted a role or added as a user inside the SQL database itself." },
    { question: "How do you verify if the firewall is blocking the connection?", kill_shot_answer: "Check the Azure SQL firewall rules to ensure 'Allow Azure services' is enabled or the specific VNet is whitelisted." }
  ],
  "Release Rollback Strategy": [
    { question: "What is a Canary deployment?", kill_shot_answer: "Releasing the new version to a small subset of users (e.g., 5%) to validate stability before full rollout." },
    { question: "What makes database rollbacks extremely difficult?", kill_shot_answer: "Data written during the new deployment might be lost or corrupted if the schema is reverted; migrations must be backwards compatible." },
    { question: "How does a Blue/Green deployment achieve zero downtime?", kill_shot_answer: "Both environments run simultaneously; traffic is instantly switched at the load balancer level once Green is verified." }
  ],
  "Developer Needs Production Access": [
    { question: "What is the Principle of Least Privilege?", kill_shot_answer: "Granting users only the minimum access permissions necessary to perform their job functions." },
    { question: "How does Privileged Identity Management (PIM) secure production?", kill_shot_answer: "It provides Just-In-Time (JIT), time-bound, and approval-based access to privileged roles." },
    { question: "Why is sharing service accounts an anti-pattern?", kill_shot_answer: "It destroys non-repudiation and auditing, making it impossible to trace which human performed an action." }
  ],
  "Azure App Service": [
    { question: "What is an App Service Deployment Slot?", kill_shot_answer: "A staging environment with its own hostname that allows you to swap apps with production with zero downtime." },
    { question: "How do you securely connect an App Service to a private VNet?", kill_shot_answer: "Use Regional VNet Integration to route outbound traffic from the App Service into the virtual network." },
    { question: "Can Azure App Service scale automatically?", kill_shot_answer: "Yes, you can configure Autoscale rules based on CPU, memory, or custom metrics to add/remove instances." }
  ],
  "Azure Kubernetes Service (AKS)": [
    { question: "What is the difference between Azure CNI and Kubenet?", kill_shot_answer: "Azure CNI assigns VNet IPs directly to pods, while Kubenet uses an overlay network and NATs pod traffic." },
    { question: "Who manages the Control Plane in AKS?", kill_shot_answer: "Microsoft Azure manages the control plane; you only manage and pay for the worker nodes." },
    { question: "How do you expose an HTTP service to the internet in AKS?", kill_shot_answer: "Using an Ingress Controller (like NGINX or App Gateway) coupled with an Ingress resource." }
  ],
  "Terraform": [
    { question: "What is the purpose of the terraform state file?", kill_shot_answer: "It maps real-world cloud resources to your configuration, tracking metadata and dependencies." },
    { question: "Why should you use a remote backend like S3 or Azure Blob?", kill_shot_answer: "To enable team collaboration, ensure state file durability, and provide state locking to prevent concurrent writes." },
    { question: "What does 'terraform plan' do?", kill_shot_answer: "It creates an execution plan, showing exactly what resources will be created, updated, or destroyed without applying them." }
  ],
  "Jenkins": [
    { question: "What is the difference between a Jenkins Controller and an Agent?", kill_shot_answer: "The Controller orchestrates the workflow and serves the UI; Agents actually execute the build jobs." },
    { question: "What is a Declarative Pipeline?", kill_shot_answer: "A structured, syntax-enforced way of writing Jenkinsfiles using blocks like 'pipeline', 'stages', and 'steps'." },
    { question: "Why should Jenkinsfiles be stored in source control?", kill_shot_answer: "To version control the build process, enabling auditability and allowing pipelines to evolve alongside application code." }
  ],
  "GitHub Actions": [
    { question: "What triggers a GitHub Action workflow?", kill_shot_answer: "Events like push, pull_request, schedule, or manual workflow_dispatch defined in the 'on' block." },
    { question: "How do you securely pass passwords into a GitHub Action?", kill_shot_answer: "Store them in GitHub Secrets and reference them in the workflow YAML as \${{ secrets.SECRET_NAME }}." },
    { question: "What is a GitHub Actions Runner?", kill_shot_answer: "The server (hosted by GitHub or self-hosted) that executes the workflow jobs." }
  ],
  "Docker": [
    { question: "What is the difference between an Image and a Container?", kill_shot_answer: "An image is a read-only template containing the application; a container is the runnable instance of an image." },
    { question: "Why use Multi-Stage builds in a Dockerfile?", kill_shot_answer: "To compile code in a heavy build stage, then copy only the compiled binaries into a lightweight runtime image." },
    { question: "What is a Docker Volume used for?", kill_shot_answer: "Persisting data generated by a container so it survives container restarts and deletions." }
  ],
  "Release Management": [
    { question: "What is SemVer (Semantic Versioning)?", kill_shot_answer: "A versioning format (MAJOR.MINOR.PATCH) where Major indicates breaking changes, Minor indicates features, and Patch indicates bug fixes." },
    { question: "Why separate Continuous Integration (CI) from Continuous Deployment (CD)?", kill_shot_answer: "CI focuses on building and testing a generic artifact; CD focuses on taking that artifact and deploying it to specific environments." },
    { question: "What is an approval gate?", kill_shot_answer: "A manual or automated pause in a deployment pipeline requiring sign-off before proceeding to the next environment (like Prod)." }
  ],
  "Monitoring": [
    { question: "What is the difference between Metrics and Logs?", kill_shot_answer: "Metrics are numeric time-series data (CPU %, latency); Logs are discrete, text-based records of events." },
    { question: "What is an SLO (Service Level Objective)?", kill_shot_answer: "A specific target for a metric (e.g., 99.9% uptime or 200ms latency) agreed upon by the engineering team." },
    { question: "Why use a centralized dashboard like Grafana?", kill_shot_answer: "To aggregate metrics from multiple sources into a single pane of glass for rapid incident triage." }
  ],
  "RBAC / IAM": [
    { question: "What are the three components of an Azure RBAC assignment?", kill_shot_answer: "Security Principal (Who), Role Definition (What they can do), and Scope (Where they can do it)." },
    { question: "What is the difference between Authentication and Authorization?", kill_shot_answer: "Authentication proves WHO you are; Authorization determines WHAT you are allowed to do." },
    { question: "Why use Azure Managed Identities over Service Principals?", kill_shot_answer: "Managed Identities automatically rotate their credentials, eliminating the risk of leaked or expired secrets." }
  ],
  "Troubleshooting": [
    { question: "What is the '5 Whys' technique?", kill_shot_answer: "An RCA method where you ask 'Why' iteratively to drill down from the symptom to the root cause." },
    { question: "How do you trace a request across multiple microservices?", kill_shot_answer: "Implement Distributed Tracing (like OpenTelemetry) using a correlation ID passed in HTTP headers." },
    { question: "If a server's CPU is at 100%, what is the first command you run?", kill_shot_answer: "Run 'top' or 'htop' to identify the specific process consuming the CPU." }
  ],
  "Git & Branching Strategy": [
    { question: "What is Trunk-Based Development?", kill_shot_answer: "Developers merge small, frequent updates to the main branch (trunk) rather than maintaining long-lived feature branches." },
    { question: "What is the purpose of a Git rebase?", kill_shot_answer: "To rewrite commit history by moving a branch's base to a new commit, creating a linear project history." },
    { question: "How do you fix a bug in production without breaking current development?", kill_shot_answer: "Create a hotfix branch directly from the production release tag, fix it, and merge it back to both main and prod." }
  ],
  "CI/CD Design Patterns": [
    { question: "What is Progressive Delivery?", kill_shot_answer: "Gradually rolling out new features to users using deployment strategies like Canary or Feature Flags." },
    { question: "How do Feature Flags decouple deployment from release?", kill_shot_answer: "Code can be deployed to production silently, and the feature is later 'released' by toggling the flag on for users." },
    { question: "What is a Rolling Update?", kill_shot_answer: "Incrementally replacing instances of the old version with the new version, ensuring capacity remains stable." }
  ],
  "Kubernetes Deep Dive": [
    { question: "What is an Ingress Controller?", kill_shot_answer: "A specialized load balancer that routes external HTTP/HTTPS traffic to internal Kubernetes Services based on rules." },
    { question: "What does a StatefulSet provide that a Deployment does not?", kill_shot_answer: "Sticky, unique network identifiers and ordered deployment/scaling, critical for databases." },
    { question: "What is the function of kube-proxy?", kill_shot_answer: "It runs on every node and maintains network rules to allow communication to Pods from inside or outside the cluster." }
  ],
  "Security & DevSecOps": [
    { question: "What is SAST vs DAST?", kill_shot_answer: "SAST scans static source code for vulnerabilities; DAST tests the running application for vulnerabilities." },
    { question: "How do you secure container images?", kill_shot_answer: "Use minimal base images (distroless), scan for CVEs during CI, and run containers as non-root." },
    { question: "What is 'Shift Left' security?", kill_shot_answer: "Integrating security checks early in the software development lifecycle (e.g., in the developer's IDE or CI pipeline)." }
  ],
  "Azure Key Vault": [
    { question: "What is Azure Key Vault used for?", kill_shot_answer: "Securely storing and tightly controlling access to tokens, passwords, certificates, and API keys." },
    { question: "How do applications authenticate to Key Vault without a password?", kill_shot_answer: "By using an Azure Managed Identity assigned to the application's compute resource." },
    { question: "What is Key Vault Soft Delete?", kill_shot_answer: "A feature that retains deleted vaults and secrets for a specified period (e.g., 90 days) to prevent accidental data loss." }
  ],
  "Observability": [
    { question: "What are the three pillars of Observability?", kill_shot_answer: "Metrics, Logs, and Traces." },
    { question: "What is OpenTelemetry?", kill_shot_answer: "An open-source standard and framework for generating, collecting, and exporting telemetry data." },
    { question: "Why is high-cardinality data a problem for metrics systems?", kill_shot_answer: "Having too many unique labels (like user IDs) creates massive database explosion, degrading performance and increasing costs." }
  ],
  "Incident Management": [
    { question: "What constitutes a Sev-1 (Severity 1) incident?", type:"rapid-fire", kill_shot_answer: "A critical production outage impacting all users or causing massive financial/data loss, requiring immediate all-hands response." },
    { question: "What is the role of an Incident Commander?", type:"rapid-fire", kill_shot_answer: "To coordinate the response, manage communication, and keep responders focused, without executing technical fixes themselves." },
    { question: "What is the purpose of an Incident Postmortem?", type:"rapid-fire", kill_shot_answer: "To document what happened, why it happened, and establish action items to prevent recurrence, completely blame-free." }
  ],
  "Disaster Recovery & Backup": [
    { question: "What is RTO (Recovery Time Objective)?", kill_shot_answer: "The maximum acceptable amount of time the application can be offline during a disaster." },
    { question: "What is RPO (Recovery Point Objective)?", kill_shot_answer: "The maximum acceptable amount of data loss, measured in time (e.g., last backup was 4 hours ago)." },
    { question: "What is Active-Passive Geo-Replication?", kill_shot_answer: "Running production in one region while replicating data to a standby region that only takes over if the primary fails." }
  ],
  "Cost Optimization (FinOps)": [
    { question: "What is VM Rightsizing?", kill_shot_answer: "Analyzing performance metrics to downgrade an over-provisioned, expensive VM to a smaller, cheaper instance type." },
    { question: "What are Spot Instances?", kill_shot_answer: "Unused cloud capacity sold at a massive discount, but the cloud provider can reclaim them with short notice." },
    { question: "When should you purchase Reserved Instances (RIs)?", kill_shot_answer: "For predictable, baseline production workloads that you know will run 24/7 for 1-3 years." }
  ],
  "System Design for DevOps Engineers": [
    { question: "How do you design a system for high availability?", kill_shot_answer: "Eliminate single points of failure by deploying resources across multiple Availability Zones and using Load Balancers." },
    { question: "What is the CAP Theorem?", kill_shot_answer: "A distributed system can only provide two of three guarantees simultaneously: Consistency, Availability, and Partition tolerance." },
    { question: "How do you handle sudden, massive spikes in read traffic?", kill_shot_answer: "Implement caching layers (like Redis), use Content Delivery Networks (CDNs), and configure horizontal autoscaling." }
  ],
  "StatefulSet": [
    { question: "Why use a StatefulSet instead of a Deployment for a database?", kill_shot_answer: "StatefulSets provide stable, unique network identifiers and ordered, graceful deployment and scaling." },
    { question: "How does a StatefulSet handle storage?", kill_shot_answer: "It uses a VolumeClaimTemplate to create a unique PersistentVolumeClaim for each individual Pod replica." },
    { question: "What happens if a StatefulSet pod dies?", kill_shot_answer: "It is rescheduled with the exact same hostname and reattaches to its exact same Persistent Volume." }
  ],
  "Jobs": [
    { question: "What is the difference between a Job and a Pod?", kill_shot_answer: "A Job ensures a Pod runs to completion and stops successfully, whereas a standard Pod expects a continuous running process." },
    { question: "How do you make a Job run 5 times in parallel?", kill_shot_answer: "Set 'completions: 5' and 'parallelism: 5' in the Job specification." },
    { question: "What happens if a Job's container fails?", kill_shot_answer: "The Job controller will automatically restart the container or create a new Pod until it succeeds or hits the backoff limit." }
  ],
  "CronJobs": [
    { question: "What is a CronJob in Kubernetes?", kill_shot_answer: "A controller that creates Kubernetes Jobs on a repeating schedule using standard Cron syntax." },
    { question: "What does the 'concurrencyPolicy: Forbid' setting do?", kill_shot_answer: "It prevents a new Job from starting if the previous scheduled Job has not finished yet." },
    { question: "How do you retain the logs of completed CronJobs?", kill_shot_answer: "Set 'successfulJobsHistoryLimit' to a number greater than 0 so the completed Pods aren't immediately deleted." }
  ],
  "Resource Management": [
    { question: "What is the difference between Requests and Limits?", kill_shot_answer: "Requests guarantee minimum resources for scheduling; Limits enforce maximum caps to prevent node starvation." },
    { question: "What happens if a Pod exceeds its Memory Limit?", kill_shot_answer: "The container is OOMKilled (Out of Memory Killed) by the Linux kernel." },
    { question: "What happens if a Pod exceeds its CPU Limit?", kill_shot_answer: "It is CPU-throttled, reducing performance, but it is not killed." }
  ],
  "Health Checks (Liveness, Readiness, Startup Probes)": [
    { question: "What does a Readiness Probe do?", kill_shot_answer: "It determines if a Pod is ready to accept traffic; if it fails, the Pod is removed from the Service endpoints." },
    { question: "What does a Liveness Probe do?", kill_shot_answer: "It determines if the application is deadlocked; if it fails, the kubelet restarts the container." },
    { question: "When should you use a Startup Probe?", kill_shot_answer: "For legacy or slow-starting applications to prevent the Liveness probe from prematurely killing the container during boot." }
  ],
  "Scheduling": [
    { question: "What is Node Affinity?", kill_shot_answer: "A set of rules that constrain which nodes a Pod can be scheduled on based on node labels (e.g., require GPU nodes)." },
    { question: "How do Taints and Tolerations work together?", kill_shot_answer: "Taints repel Pods from a node; a Pod must have a matching Toleration to be allowed to schedule on that tainted node." },
    { question: "What is Pod Anti-Affinity?", kill_shot_answer: "A rule telling the scheduler to place Pods on different nodes/AZs to ensure high availability." }
  ],
  "Networking": [
    { question: "What is the difference between ClusterIP and NodePort?", kill_shot_answer: "ClusterIP exposes the service internally; NodePort exposes it externally by opening a static port on every worker node's IP." },
    { question: "What is a Kubernetes Network Policy?", kill_shot_answer: "A firewall rule that controls traffic flow at the IP address or port level between Pods (Micro-segmentation)." },
    { question: "How does CoreDNS function in the cluster?", kill_shot_answer: "It provides service discovery by resolving Service names to ClusterIPs across the cluster." }
  ],
  "RBAC & Security": [
    { question: "What is the difference between a Role and a ClusterRole?", kill_shot_answer: "A Role grants permissions within a specific Namespace; a ClusterRole grants permissions cluster-wide." },
    { question: "What binds a user to a Role?", kill_shot_answer: "A RoleBinding or ClusterRoleBinding." },
    { question: "What is a ServiceAccount?", kill_shot_answer: "An identity used by Pods to authenticate to the Kubernetes API, rather than a human user." }
  ],
  "Security Features": [
    { question: "What is a Pod Security Admission / Standard?", kill_shot_answer: "A built-in controller that enforces security standards (Privileged, Baseline, Restricted) at the namespace level." },
    { question: "Why run containers as readOnlyRootFilesystem?", kill_shot_answer: "It prevents attackers from modifying system files or downloading malware if they compromise the container." },
    { question: "How are Kubernetes Secrets stored by default in etcd?", kill_shot_answer: "They are base64 encoded, but NOT encrypted at rest, unless EncryptionConfiguration is explicitly enabled." }
  ],
  "Autoscaling": [
    { question: "What triggers the Horizontal Pod Autoscaler (HPA)?", kill_shot_answer: "Metric thresholds like CPU utilization, Memory usage, or custom external metrics crossing a defined target." },
    { question: "When does the Cluster Autoscaler (CA) add a new node?", kill_shot_answer: "When it detects Pods stuck in the 'Pending' state due to insufficient cluster capacity." },
    { question: "What is Vertical Pod Autoscaling (VPA)?", kill_shot_answer: "It automatically adjusts the CPU and Memory Requests/Limits of a Pod, requiring a Pod restart to apply." }
  ],
  "Helm": [
    { question: "What is a Helm Chart?", kill_shot_answer: "A packaged collection of templated Kubernetes YAML manifests and default configuration values." },
    { question: "How do you override default values in a Helm chart?", kill_shot_answer: "By passing a custom values.yaml file or using the '--set' flag during helm install/upgrade." },
    { question: "What is 'helm rollback' used for?", kill_shot_answer: "Instantly reverting a deployed release to a previous revision if the current release fails." }
  ],
  "Operators & CRDs": [
    { question: "What is a CRD (Custom Resource Definition)?", kill_shot_answer: "An API extension that allows you to define custom Kubernetes objects like 'Database' or 'Certificate'." },
    { question: "What is a Kubernetes Operator?", kill_shot_answer: "A custom controller that watches CRDs and implements operational knowledge (like backups) to maintain the desired state." },
    { question: "Name a common use case for an Operator.", kill_shot_answer: "Managing complex stateful applications like Prometheus, PostgreSQL, or Elasticsearch." }
  ],
  "Troubleshooting Kubernetes": [
    { question: "What does 'kubectl describe' provide that 'get' doesn't?", kill_shot_answer: "It provides detailed object configuration and the recent Events log related to that resource." },
    { question: "If a Pod is running but unreachable via Service, what do you check?", kill_shot_answer: "Check if the Service's label selector matches the Pod's labels, and if the Pod passes its Readiness probe." },
    { question: "How do you execute a command inside a running container?", kill_shot_answer: "Use 'kubectl exec -it <pod-name> -- /bin/sh'." }
  ],
  "Backup & Disaster Recovery": [
    { question: "What tool is an industry standard for backing up Kubernetes clusters?", kill_shot_answer: "Velero." },
    { question: "What exactly needs to be backed up in a Kubernetes cluster?", kill_shot_answer: "The etcd state (cluster objects) and the underlying Persistent Volumes (stateful data)." },
    { question: "How do you recover a cluster if etcd is corrupted?", kill_shot_answer: "Restore etcd from a previous snapshot using 'etcdctl snapshot restore'." }
  ],
  "Upgrades & Maintenance": [
    { question: "What command prepares a worker node for maintenance?", kill_shot_answer: "kubectl drain <node-name> --ignore-daemonsets." },
    { question: "What does 'cordon' do to a node?", kill_shot_answer: "It marks the node as unschedulable, preventing new Pods from being placed there, but doesn't evict existing Pods." },
    { question: "What is the recommended order for upgrading a cluster?", kill_shot_answer: "Upgrade the Control Plane first, then upgrade the Worker Nodes one by one." }
  ],
  "Common kubectl Commands": [
    { question: "How do you quickly change the image of a running deployment?", kill_shot_answer: "kubectl set image deployment/<name> <container>=<new-image>." },
    { question: "How do you temporarily forward a local port to a cluster Pod?", kill_shot_answer: "kubectl port-forward pod/<name> 8080:80." },
    { question: "How do you view logs for a previous, crashed instance of a pod?", kill_shot_answer: "kubectl logs <pod-name> --previous." }
  ],
  "YAML & Kubernetes Manifests": [
    { question: "What are the four required root fields in a Kubernetes YAML manifest?", kill_shot_answer: "apiVersion, kind, metadata, spec." },
    { question: "What is the purpose of 'kubectl apply' versus 'kubectl create'?", kill_shot_answer: "'apply' is declarative and handles updates/creation; 'create' is imperative and fails if the object already exists." },
    { question: "How do you validate a YAML manifest without deploying it?", kill_shot_answer: "Use the '--dry-run=client' flag." }
  ],
  "CI/CD Integration": [
    { question: "How does GitOps differ from traditional CI/CD pushing?", kill_shot_answer: "GitOps uses a pull-based controller (like ArgoCD) running inside the cluster to sync state from a Git repository." },
    { question: "Why shouldn't you bake secrets directly into your Docker image?", kill_shot_answer: "Anyone who pulls the image can extract the secret; inject them at runtime using Kubernetes Secrets or Vault." },
    { question: "What is the best way to handle distinct environments (dev, prod) in CI/CD?", kill_shot_answer: "Use Kustomize or Helm to overlay environment-specific variables onto a base set of manifests." }
  ],
  "Cloud Kubernetes (EKS/GKE/AKS)": [
    { question: "What is the shared responsibility model in Managed Kubernetes?", kill_shot_answer: "The cloud provider manages the highly-available Control Plane; the customer secures and manages the worker nodes and workloads." },
    { question: "What is AWS IAM Roles for Service Accounts (IRSA) / Azure Workload Identity?", kill_shot_answer: "It allows Kubernetes Pods to securely assume a cloud IAM role using OIDC without storing static credentials." },
    { question: "How do managed clusters typically handle persistent storage?", kill_shot_answer: "By using CSI drivers that dynamically provision native cloud block storage (EBS/Azure Disk) when a PVC is created." }
  ]
};

const raw = fs.readFileSync('scenarios.json','utf8');
let data = JSON.parse(raw);
let updatedCount = 0;

data.forEach(s => {
  if (!s.rapid_fire_qa || s.rapid_fire_qa.length === 0) {
    if (qaMapping[s.title]) {
      s.rapid_fire_qa = qaMapping[s.title];
      updatedCount++;
    }
  }
});

fs.writeFileSync('scenarios.json', JSON.stringify(data, null, 2));
console.log('Successfully injected Rapid Fire questions to ' + updatedCount + ' scenarios.');
