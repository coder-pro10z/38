const fs = require('fs');
const path = require('path');

const locusPath  = path.join(__dirname, 'infinite_locus.json');
const mergedPath = path.join(__dirname, 'merged.json');

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 3 UPGRADES — 12 Questions
// Clusters: Observability (Q0234-Q0235) + Networking (Q0236) +
//           Incident Triage (Q0237-Q0239) + Cloud Architecture (Q0249-Q0254)
// NOTE: Q0253 and Q0254 switch schema from 'architecture' to 'tradeoff'
// ─────────────────────────────────────────────────────────────────────────────
const upgrades = {

  // ─── Q0234 ── CloudWatch ──────────────────────────────────────────────────
  'Q0234': {
    title: 'AWS CloudWatch — Metrics, Logs, Alarms & Dashboards for Observability',
    prompt: 'What is AWS CloudWatch and how do you use it for production observability?',
    type: 'Observability / AWS',
    difficulty: 'Medium',
    chips: ['CloudWatch', 'Metrics', 'Log Groups', 'Alarms', 'Dashboards', 'AWS'],
    definition: 'AWS CloudWatch is a managed observability service that collects and stores metrics, logs, and events from AWS resources and custom applications — providing dashboards, alarms, and automated actions for production monitoring.',
    why_it_matters: 'Without centralised metrics and log aggregation, production incidents are investigated by SSH-ing into individual servers — an approach that does not scale and loses forensic data when instances terminate.',
    real_world_scenario: 'During a traffic spike on an EC2-hosted service, a CloudWatch alarm triggered on CPU utilisation exceeding 80% — automatically notifying the on-call engineer via SNS and triggering an Auto Scaling scale-out action before any user-visible degradation occurred.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Metrics: CloudWatch collects built-in metrics automatically from AWS services (EC2 CPU, RDS connections, ALB request count, Lambda duration). Custom application metrics are published using the PutMetricData API or CloudWatch Agent.',
        '2. Log Groups & Log Streams: Application and system logs are shipped to CloudWatch Logs using the CloudWatch Agent or from Lambda functions natively. Each application component gets its own Log Group; each instance or function invocation creates a Log Stream.',
        '3. Metric Filters: Define pattern-based filters on log streams to extract numeric metrics from log text — e.g. count occurrences of "ERROR" per minute and publish it as a custom metric for alarming.',
        '4. Alarms: Create threshold-based alarms on any metric. When a metric breaches the threshold for a sustained period, the alarm transitions to ALARM state and triggers an SNS notification, Auto Scaling policy, or Systems Manager automation.',
        '5. Dashboards: Build real-time operational dashboards combining metrics from multiple services — EC2 CPU, RDS latency, ALB 5xx rate — into a single operational view for the on-call engineer.'
      ],
      diagram: 'AWS Resources + Apps ──> CloudWatch Metrics & Logs ──> Metric Filters ──> Alarms (SNS / Auto Scaling) + Dashboards (Ops View)'
    },
    interview_answer: {
      response: [
        'AWS CloudWatch is the native AWS observability service covering three pillars: metrics, logs, and alarms. Built-in metrics for EC2, RDS, Lambda, and ALB are collected automatically without any agent — things like CPU utilisation, network I/O, and request latency. For custom application metrics I publish using the PutMetricData API or by installing the CloudWatch Agent on EC2 instances to collect memory and disk metrics, which are not captured by default.',
        'For logging, I ship application logs to CloudWatch Log Groups using the CloudWatch Agent or the native AWS SDK logger. I define metric filters on Log Groups to extract key signals from log text — for example, counting ERROR-level log events per minute and turning that into a custom metric I can alarm on.',
        'Alarms are where CloudWatch drives automated action. I set threshold alarms on critical metrics — EC2 CPU above 80% for 5 minutes, RDS connection count above 90% of max_connections, ALB 5xx rate above 1%. When an alarm fires it notifies the on-call engineer via SNS and can automatically trigger an Auto Scaling scale-out event. I build dashboards that combine these metrics into a single operational view so the on-call engineer sees the full picture in one place rather than clicking through separate AWS console pages.'
      ],
      why: 'Naming the missing default metrics (memory, disk) that require the CloudWatch Agent, and explaining metric filters for log-derived metrics, proves you have actually configured production CloudWatch — not just read the overview page.'
    },
    interview_kill_shot: 'CloudWatch closes the AWS observability loop — metrics for what is happening, logs for why it is happening, and alarms to ensure someone is paged before users notice.'
  },

  // ─── Q0235 ── ELK Stack ───────────────────────────────────────────────────
  'Q0235': {
    title: 'ELK Stack — Elasticsearch, Logstash & Kibana for Centralised Log Analytics',
    prompt: 'What is the ELK stack and how does each component contribute to centralised logging?',
    type: 'Observability / Logging',
    difficulty: 'Medium',
    chips: ['Elasticsearch', 'Logstash', 'Kibana', 'Beats', 'Log Aggregation', 'ELK'],
    definition: 'The ELK Stack is a log analytics platform combining Elasticsearch (distributed search and storage), Logstash (log parsing and transformation pipeline), and Kibana (visualisation and querying UI) — together providing centralised log collection, storage, and analysis at scale.',
    why_it_matters: 'Without centralised log aggregation, diagnosing a production issue across 20 microservice pods means SSH-ing into each one individually — losing context, missing correlations, and slowing MTTR significantly.',
    real_world_scenario: 'During a payment service outage, the ELK stack allowed the team to correlate pod-level application error logs with Nginx access logs and Kubernetes events in a single Kibana query — identifying a downstream API timeout within 4 minutes instead of digging through individual pod logs.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Beats (Log Shippers): Lightweight agents installed on nodes or as sidecar containers — Filebeat tails log files and ships them to Logstash or directly to Elasticsearch. Metricbeat ships system metrics.',
        '2. Logstash (Parsing & Enrichment Pipeline): Receives raw log events, applies grok patterns to parse unstructured log text into structured JSON fields, enriches with metadata (host, environment, service), filters out noise, and outputs to Elasticsearch.',
        '3. Elasticsearch (Storage & Search): Stores structured log documents in time-series indices (e.g. logs-2025.07.12). Provides full-text search and aggregation APIs. Shards data across nodes for horizontal scalability.',
        '4. Kibana (Visualisation & Query UI): Connects to Elasticsearch and provides Discover (raw log search with KQL queries), Visualise (charts, heatmaps), and Dashboards (combined operational views). Enables real-time log streaming during incidents.',
        '5. Index Lifecycle Management (ILM): Automates moving indices from hot (recent, fast SSD) to warm (older, slower) to cold (archive, object storage) tiers — controlling storage cost as log volume grows.'
      ],
      diagram: 'App Pods ──[Filebeat]──> Logstash (parse/enrich/filter) ──> Elasticsearch (index/store) ──> Kibana (search/visualise/alert)'
    },
    interview_answer: {
      response: [
        'The ELK stack has four components in practice. Beats — specifically Filebeat — are lightweight agents that run as sidecar containers or DaemonSet pods and tail log files from application containers, shipping them to Logstash. Logstash is the parsing and enrichment pipeline: it receives raw log text, applies grok patterns to parse unstructured lines into structured JSON, enriches each event with metadata like the environment name, service name, and Kubernetes node, then forwards the structured documents to Elasticsearch.',
        'Elasticsearch is the distributed search and storage engine. It indexes log documents into time-series indices — one per day per service in our setup — and provides full-text search and aggregation APIs. Because it shards data across nodes, it scales horizontally as log volume grows. Kibana sits on top as the operational UI — I use the Discover tab with KQL queries to search logs during incidents and build dashboards showing error rates, latency distributions, and pod restart counts.',
        'One operational concern I manage is index lifecycle management. Without ILM, old Elasticsearch indices fill disk space indefinitely. I configure ILM policies to automatically roll hot indices to warm storage after 7 days and delete them after 30 days, which keeps storage costs predictable without any manual cleanup.'
      ],
      why: 'Describing the Beats → Logstash → Elasticsearch → Kibana data flow with specific operational details like grok patterns, ILM policies, and KQL queries proves hands-on ELK stack operation — not just knowing the acronym.'
    },
    interview_kill_shot: 'ELK turns raw application logs from dozens of pods into a searchable, correlated, structured dataset — reducing incident investigation from hours of SSH sessions to minutes of Kibana queries.'
  },

  // ─── Q0236 ── Public IP vs Private IP ────────────────────────────────────
  'Q0236': {
    title: 'Public IP vs Private IP — Routing, NAT & Azure Network Architecture',
    prompt: 'What is the difference between a public IP and a private IP, and how do you apply this in Azure networking?',
    type: 'Networking / Azure',
    difficulty: 'Easy',
    chips: ['Public IP', 'Private IP', 'NAT', 'VNet', 'Azure Networking', 'RFC 1918'],
    definition: 'A public IP address is globally routable on the internet and assigned by an ISP or cloud provider. A private IP address belongs to RFC 1918 reserved ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x) and is only routable within a private network — requiring NAT or a load balancer to communicate with the internet.',
    why_it_matters: 'Exposing resources with public IPs when private IPs are sufficient increases the attack surface unnecessarily. Enterprise security policy typically mandates that databases, internal APIs, and management interfaces never have public IPs.',
    real_world_scenario: 'At Coforge, AKS nodes and Azure SQL servers have only private IPs inside the VNet. The Application Gateway has a public IP for internet-facing traffic. Internal service-to-service communication never leaves the VNet.',
    schema: 'tradeoff',
    tradeoff_matrix: {
      dimensions: [
        'Routable From',
        'Address Range',
        'Assignment Source',
        'Direct Internet Access',
        'Use in Azure Architecture',
        'Security Exposure'
      ],
      options: [
        {
          name: 'Public IP',
          values: [
            'Globally routable — accessible from anywhere on the internet',
            'Any range not in RFC 1918 — assigned by ISP or Azure from Microsoft\'s pool',
            'Allocated by Azure (Basic or Standard SKU) and attached to a NIC, Load Balancer, Application Gateway, or NAT Gateway',
            'Yes — direct inbound and outbound internet connectivity',
            'Application Gateway / Load Balancer internet-facing frontend; NAT Gateway for outbound; Bastion jump host',
            'High — exposed to internet scanners, DDoS, brute force attempts; requires NSG and WAF'
          ]
        },
        {
          name: 'Private IP',
          values: [
            'Only routable within the Azure VNet, peered VNets, or on-premises via VPN/ExpressRoute',
            'RFC 1918 reserved ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16',
            'Automatically assigned from the VNet subnet address space by Azure DHCP; can be reserved as static',
            'No — requires NAT Gateway or Load Balancer with public frontend to initiate/receive internet traffic',
            'AKS nodes, Azure SQL, Storage private endpoints, App Service VNet integration, internal load balancers',
            'Low — only reachable within the private network boundary; not exposed to internet scanning'
          ]
        }
      ]
    },
    interview_answer: {
      response: [
        'A public IP address is globally routable on the internet — any machine on the internet can attempt to reach it directly. In Azure, public IPs are Standard or Basic SKU resources attached to Application Gateways, Load Balancers, NAT Gateways, or directly to VM NICs. A private IP belongs to RFC 1918 reserved address ranges — 10.x.x.x, 172.16-31.x.x, or 192.168.x.x — and is only routable within the Azure VNet or peered networks. It cannot be reached from the internet without going through a NAT or load balancer.',
        'In our Azure architecture at Coforge we apply a clear principle: only the outermost layer has a public IP. Our Application Gateway has a Standard public IP for internet-facing HTTPS traffic. Behind it, everything runs on private IPs — AKS nodes, Azure SQL servers, storage accounts accessed via private endpoints, and internal microservice load balancers. This means even if an attacker bypasses the Application Gateway WAF, they reach a private IP space with no direct route back to the internet.',
        'For outbound internet access from private IP resources — like a VM needing to pull container images — I attach an Azure NAT Gateway to the subnet. The NAT Gateway has a public IP but private IP resources initiate all connections; no inbound connections can be established from the internet back through NAT.'
      ],
      why: 'Describing the layered architecture — public IP only on the gateway, NAT Gateway for outbound, private IPs for all internal resources — shows you have designed a real enterprise network rather than just knowing the IP range definitions.'
    },
    interview_kill_shot: 'In enterprise Azure architecture, only the outermost gateway carries a public IP — databases, AKS nodes, and internal APIs operate exclusively on private IPs with no direct internet exposure.'
  },

  // ─── Q0237 ── Production deployment failed ────────────────────────────────
  'Q0237': {
    title: 'Production Deployment Failure — Triage, Rollback & RCA Playbook',
    prompt: 'A production deployment just failed and the service is degraded. Walk me through exactly what you do.',
    type: 'Incident Response',
    difficulty: 'Hard',
    chips: ['Incident Response', 'Helm Rollback', 'kubectl rollout undo', 'RCA', 'MTTR'],
    definition: 'A production deployment failure response is a structured sequence of actions: immediate service restoration via rollback, stakeholder communication, systematic root cause analysis, and pipeline-level prevention — executed in that priority order.',
    why_it_matters: 'Engineers who jump to root cause analysis before restoring service extend the customer-facing outage. The correct sequence is always: restore first, investigate second.',
    real_world_scenario: 'A Helm upgrade to AKS production caused all pods to enter CrashLoopBackOff due to an incompatible environment variable format change. Service was restored in under 5 minutes via helm rollback before the RCA even began.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Detect & Declare (0-2 min): Azure Monitor alert fires. Confirm the outage is real — check Grafana error rate dashboard, pod status with kubectl get pods -n production. Notify the team and stakeholders immediately: "Production incident declared, investigating."',
        '2. Immediate Rollback (2-6 min): Do not investigate first — restore service first. For Helm deployments: helm rollback <release-name> <previous-revision> -n production. For kubectl: kubectl rollout undo deployment/<name> -n production. Verify pod restarts and health probes recover.',
        '3. Confirm Restoration (6-8 min): Run kubectl get pods -n production and watch pod status return to Running. Check Grafana — error rate should drop and request rate should recover. Send stakeholder update: "Service restored. Investigating root cause."',
        '4. Root Cause Analysis (8-30 min): Compare the failed release to the previous release using helm diff or git diff. Check kubectl describe pod and kubectl logs for the failing containers. Review pipeline logs for any warning signs. Identify the specific change that caused the failure.',
        '5. Fix Forward & Prevention (30+ min): Implement the fix, test in Staging with the exact same conditions, raise a PR. Add a pipeline validation step that would have caught this failure — integration test, config schema validation, or smoke test gate before Production promotion.'
      ],
      diagram: 'Alert Fires ──> Confirm Outage ──> Notify Stakeholders ──> helm rollback / kubectl rollout undo ──> Confirm Recovery ──> RCA ──> Fix + Pipeline Gate Added'
    },
    interview_answer: {
      response: [
        'The moment a production deployment failure is detected — either by an Azure Monitor alert or directly in Grafana — my first action is not to investigate the cause. It is to restore service. Speed of recovery matters more than understanding why it happened in the first minute. I run kubectl get pods -n production to confirm pods are failing, then immediately execute helm rollback to the previous stable Helm revision. For a non-Helm deployment, kubectl rollout undo deployment works the same way. While the rollback runs I send an immediate stakeholder notification: "Production incident active, rollback in progress."',
        'Once I confirm the rollback succeeded — pods are Running, Grafana shows the error rate dropping, response time recovering — I send a second update: "Service restored. Root cause investigation underway." Only at this point do I start the RCA. I compare the failed Helm release to the previous one using helm diff, pull kubectl describe pod and kubectl logs from the failed pods, and cross-reference with the pipeline run logs. In most cases the culprit is identifiable within 10 minutes: a misconfigured environment variable, a missing secret, a breaking schema migration, or an incompatible container image tag.',
        'The final step is the most important for the long term — I identify what pipeline validation step would have caught this before it reached Production. Then I add it: a config schema validation check, a Staging smoke test that must pass before the Production gate opens, or a pre-deploy secret existence check. Every incident is an opportunity to make the pipeline smarter.'
      ],
      why: 'Leading with "restore first, investigate second" — and then walking through a specific rollback command, stakeholder communication, RCA approach, and pipeline prevention step — demonstrates production-mature incident response rather than a panic-and-investigate approach.'
    },
    interview_kill_shot: 'In a production incident, roll back first to restore service within minutes, then investigate — MTTR is measured by customer impact, not by how quickly you found the root cause.'
  },

  // ─── Q0238 ── High CPU usage on a VM ─────────────────────────────────────
  'Q0238': {
    title: 'Diagnosing High CPU Usage on a Linux VM — Systematic Investigation',
    prompt: 'How would you investigate and resolve high CPU usage on a Linux virtual machine?',
    type: 'Linux / Troubleshooting',
    difficulty: 'Medium',
    chips: ['top', 'pidstat', 'perf', 'CPU Throttling', 'USE Method', 'Linux'],
    definition: 'Diagnosing high CPU on a Linux VM involves identifying which process is consuming CPU, understanding whether it is user-space or kernel-space time, distinguishing genuine load from I/O wait, and tracing to the specific code path or query responsible.',
    why_it_matters: 'High CPU without investigation leads to reactive scaling — adding more VMs to hide a problem rather than fixing it. A stuck query, a zombie process, or a runaway container can be fixed in minutes once identified.',
    real_world_scenario: 'A production AKS node\'s CPU hit 95%. top revealed a Prometheus scraping job with a regex metric filter bug was consuming 4 cores doing exponential regex backtracking — restarting the pod and removing the malformed regex label filter resolved it immediately.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Confirm & Quantify: Run top or htop to see overall CPU percentage. Check if load average (1m/5m/15m) is trending up or stable. Note whether %us (user) or %sy (system/kernel) CPU dominates — high %sy often indicates kernel or I/O driver issues.',
        '2. Identify the Culprit Process: In top, press P to sort by CPU. Note the PID and process name of the top consumer. Cross-reference with ps aux --sort=-%cpu for a one-shot view.',
        '3. Per-Thread Analysis: Run pidstat -u -p <PID> 2 to see CPU usage per thread if the process is multi-threaded. For Java processes, use jstack <PID> to map hot threads to stack traces.',
        '4. Check for I/O Wait (%wa): High %wa in top means CPUs are idle waiting for disk or network I/O — the solution is storage optimisation, not adding CPU. Confirm with iostat -x 2.',
        '5. Kubernetes-Specific — CPU Throttling: If the VM is a Kubernetes node, run kubectl top pod -n <namespace>. If a pod is throttled (hitting CPU limits), increase resource limits or optimise the container. Check /sys/fs/cgroup/cpu/cpu.stat for throttled_time.'
      ],
      diagram: 'top / htop (identify %CPU) ──> ps aux --sort=-%cpu (PID) ──> pidstat -p PID (threads) ──> iostat (rule out I/O wait) ──> kubectl top pod (K8s throttle check)'
    },
    interview_answer: {
      response: [
        'I follow the USE method — Utilisation, Saturation, Errors — for CPU investigation. I start with top or htop to get the overall picture. I check the load average trend: if the 1-minute average is much higher than the 15-minute average, the spike is recent and likely caused by a specific event. I look at whether the CPU time is in %us (user-space — application code) or %sy (kernel/system — often indicates driver issues, syscall storms, or context switching overhead).',
        'To identify the culprit, I sort top by CPU with the P key and note the highest-consuming process and its PID. For multi-threaded processes like Java applications, I use pidstat -p <PID> to break down CPU by thread, then jstack <PID> to map the hot thread IDs to actual stack traces — this directly shows which function or database query is burning CPU.',
        'One thing I always check is whether high CPU is actually I/O wait misread as CPU load. High %wa in top means CPUs are stalled waiting for disk — adding CPU will not help. I use iostat -x to check disk I/O saturation. On Kubernetes nodes specifically, I also check pod CPU throttling with kubectl top pod and look at cgroup throttle stats — a container hitting its CPU limit gets throttled and appears as high node CPU even though the application could simply be given a higher limit.'
      ],
      why: 'Naming the USE method, distinguishing %us from %sy from %wa, and adding the Kubernetes-specific CPU throttling check shows systematic methodology beyond just running top and restarting the process.'
    },
    interview_kill_shot: 'High CPU investigation starts with top to identify the process, pidstat to find the thread, and iostat to rule out I/O wait masquerading as CPU pressure before any remediation.'
  },

  // ─── Q0239 ── Database connection issue after deployment ──────────────────
  'Q0239': {
    title: 'Database Connection Failures After Deployment — Systematic Diagnosis',
    prompt: 'After a deployment, your application cannot connect to the database. How do you diagnose and resolve this?',
    type: 'Troubleshooting / Incident Response',
    difficulty: 'Hard',
    chips: ['Connection Pool', 'DNS Resolution', 'Secret Rotation', 'PostgreSQL', 'kubectl', 'Networking'],
    definition: 'Post-deployment database connection failures typically stem from one of four root causes: incorrect or rotated credentials, changed connection string or hostname, network policy or firewall rule changes, or connection pool exhaustion from the new deployment\'s increased replica count.',
    why_it_matters: 'Blindly restarting pods or rolling back a deployment without diagnosing the root cause will not resolve a credential rotation or network policy issue — and may mask the real problem.',
    real_world_scenario: 'A zero-downtime deployment scaled pods from 3 to 12 replicas for a high-traffic event. Each pod opened 10 database connections — 120 total connections against a PostgreSQL max_connections of 100 — causing all new pods to fail with "FATAL: sorry, too many clients already".',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Check Application Logs First: Run kubectl logs <pod> -n production --previous for the crashing container. The exact error message is the fastest diagnostic: "connection refused" (network/firewall), "authentication failed" (wrong credentials), "too many clients" (pool exhaustion), "could not resolve host" (DNS issue).',
        '2. Test Connectivity From Pod: Run kubectl exec -it <pod> -n production -- bash. Inside, attempt: nc -zv <db-host> <port> (network reachability), then psql -h <host> -U <user> -d <db> (credential validity).',
        '3. Verify Credentials & Secrets: Compare the mounted secret values with what the database expects. kubectl get secret <db-secret> -o jsonpath=\'{.data.password}\' | base64 -d. If secret was recently rotated, update it and restart the pods.',
        '4. Check DNS Resolution: If the connection string uses a hostname, verify DNS resolves correctly from inside the pod: nslookup <db-hostname>. If using an Azure Private DNS zone, confirm the VNet link is active.',
        '5. Connection Pool Exhaustion: Run SHOW max_connections on PostgreSQL or check Azure SQL connection limits. Calculate: (new replica count) x (pool-size per pod). If exceeding the limit, reduce max pool size in application config, add a PgBouncer connection pooler, or scale the database tier.'
      ],
      diagram: 'Pod Logs (error type) ──> kubectl exec (nc test) ──> Secret Validation ──> DNS Resolution Check ──> Connection Pool Math ──> Fix & Redeploy'
    },
    interview_answer: {
      response: [
        'The first thing I do is read the exact error message from the failing pod logs — kubectl logs --previous for the terminated container. The error message tells me which category of problem I am dealing with. "Connection refused" is a network or firewall issue. "Authentication failed" or "password authentication failed for user" is a credentials problem — likely a secret that was rotated or not updated. "Too many clients already" is connection pool exhaustion. "Could not resolve host" is a DNS issue. Each category has a completely different resolution path.',
        'For credential issues, I verify the Kubernetes secret values match the database: kubectl get secret with -o jsonpath to decode the base64 password and compare it against what the database expects. If the secret was recently rotated as part of the deployment, updating the Kubernetes secret and triggering a rolling restart usually resolves it immediately.',
        'Connection pool exhaustion is a subtle one that often hits after scaling up. If the deployment increased from 3 to 12 replicas and each pod opens a pool of 10 connections, we are now at 120 connections against a PostgreSQL that has max_connections set to 100. The fix is either reducing the pool size per pod in the application config, deploying a PgBouncer connection pooler in front of PostgreSQL, or increasing the database instance size. I always calculate replica_count times pool_size_per_pod before a scale-up deployment.'
      ],
      why: 'Mapping each specific error message to a distinct diagnostic path — rather than giving generic "check logs and network" advice — demonstrates real database troubleshooting experience that only comes from having actually resolved these failures in production.'
    },
    interview_kill_shot: 'Read the exact database error message first — "connection refused", "auth failed", "too many clients", and "host unresolved" each point to a completely different fix that generic restart-and-pray cannot solve.'
  },

  // ─── Q0249 ── SDLC ────────────────────────────────────────────────────────
  'Q0249': {
    title: 'Software Development Lifecycle (SDLC) — Phases, Models & DevOps Integration',
    prompt: 'What is the Software Development Lifecycle and how does it relate to DevOps?',
    type: 'Process / Methodology',
    difficulty: 'Easy',
    chips: ['SDLC', 'Agile', 'DevOps', 'Requirements', 'CI/CD', 'Planning'],
    definition: 'The Software Development Lifecycle (SDLC) is the structured process for planning, designing, building, testing, deploying, and maintaining software — DevOps practices automate and accelerate the delivery and operations phases of this lifecycle.',
    why_it_matters: 'Understanding the SDLC gives context for where DevOps tooling fits — CI/CD pipelines accelerate the Build and Deploy phases, automated testing compresses the Test phase, and monitoring closes the feedback loop back to Planning.',
    real_world_scenario: 'At Coforge, each sprint covers a compressed SDLC cycle: requirements refined in sprint planning, code written and reviewed in the sprint, CI validates each commit, CD deploys to Staging, QA tests in Staging, and production deployment happens at the end of the sprint.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Planning & Requirements: Business and engineering align on what to build — user stories, acceptance criteria, sprint goals. Tools: Jira, Azure Boards, Confluence.',
        '2. Design: Architecture decisions, API contracts, database schema design, security review. Output: design documents, ADRs (Architecture Decision Records).',
        '3. Implementation (Build): Developers write code on feature branches, raise pull requests, pass code review and automated CI checks before merging to main.',
        '4. Testing: Automated unit, integration, and end-to-end tests run in CI. QA performs exploratory testing in a Staging environment provisioned by Terraform and deployed by CD pipeline.',
        '5. Deployment & Operations: CD pipeline promotes the validated build to production. Monitoring, alerting, and on-call rotation cover the operations phase. Production feedback (incidents, metrics, user reports) feeds back into Planning for the next sprint.'
      ],
      diagram: 'Planning ──> Design ──> Build (CI) ──> Test (Staging) ──> Deploy (CD) ──> Monitor & Operate ──[feedback]──> Planning (next sprint)'
    },
    interview_answer: {
      response: [
        'The SDLC is the end-to-end process of delivering software — from understanding what to build through to operating it in production and learning from how it performs. The classic phases are Planning, Design, Implementation, Testing, Deployment, and Maintenance — though in Agile teams these phases happen in compressed, iterative sprint cycles rather than sequentially.',
        'DevOps sits at the intersection of the Implementation, Testing, and Deployment phases. CI pipelines automate the validation of every code change — running tests, static analysis, and security scans automatically. CD pipelines automate the promotion of validated builds into environments, eliminating manual deployment steps. Monitoring and alerting close the SDLC feedback loop — production metrics and incident patterns feed directly back into the planning of the next sprint.',
        'In practice at Coforge, each two-week sprint runs a full compressed SDLC: requirements are refined in planning, code is reviewed and merged through PRs, the CI pipeline validates every commit, the CD pipeline deploys to a Staging environment where QA validates acceptance criteria, and production deployment happens at sprint end after approval. The operations team monitors production and any issues raised become tickets for the next sprint\'s planning session.'
      ],
      why: 'Mapping CI to the Build phase, CD to the Deployment phase, and monitoring to the feedback loop back to Planning shows you understand SDLC as a complete cycle — not just a linear waterfall diagram.'
    },
    interview_kill_shot: 'DevOps does not replace the SDLC — it automates its most repetitive phases: CI compresses Build and Test, CD automates Deployment, and monitoring closes the feedback loop back to Planning.'
  },

  // ─── Q0250 ── Agile ───────────────────────────────────────────────────────
  'Q0250': {
    title: 'Agile Methodology — Iterative Delivery, Core Values & DevOps Alignment',
    prompt: 'What is Agile and how does it apply to a DevOps engineering team?',
    type: 'Process / Methodology',
    difficulty: 'Easy',
    chips: ['Agile', 'Iterative Delivery', 'Scrum', 'Kanban', 'Sprint', 'User Stories'],
    definition: 'Agile is an iterative software delivery methodology that prioritises working software over comprehensive documentation, customer collaboration over contract negotiation, and responding to change over following a fixed plan — delivered through short, time-boxed cycles called sprints or iterations.',
    why_it_matters: 'Agile enables teams to deliver value incrementally and adjust priorities based on feedback — avoiding the waterfall trap of building a product for months only to discover it does not meet user needs.',
    real_world_scenario: 'At Coforge, infrastructure changes are delivered in two-week Agile sprints. New pipeline stages, AKS cluster upgrades, and Terraform module refactors are broken into user stories, estimated in sprint planning, and delivered iteratively — rather than in a single high-risk quarterly big-bang release.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Agile Values (Manifesto): Individuals and interactions over processes and tools. Working software over comprehensive documentation. Customer collaboration over contract negotiation. Responding to change over following a plan.',
        '2. Backlog Refinement: Product owner and team break requirements into small, independently deliverable user stories with clear acceptance criteria. Stories are estimated in story points.',
        '3. Sprint Planning: Team selects stories from the backlog into a 2-week sprint. Each story is assigned and broken into technical tasks.',
        '4. Sprint Execution: Daily standups keep the team aligned. Developers code, raise PRs, pass CI checks. DevOps engineers provision environments, maintain pipelines, and unblock deployment blockers.',
        '5. Sprint Review & Retrospective: Team demos completed stories to stakeholders. Retrospective identifies process improvements. Feedback is captured as new backlog items for the next sprint.'
      ],
      diagram: 'Backlog ──> Sprint Planning ──> Sprint (2 weeks: dev + CI + review) ──> Sprint Review (demo) ──> Retrospective ──> Refined Backlog ──> Next Sprint'
    },
    interview_answer: {
      response: [
        'Agile is an iterative delivery approach built around the four values in the Agile Manifesto: prioritising working software over documentation, customer collaboration over contracts, responding to change over following a rigid plan, and individuals and interactions over processes and tools. In practice it means breaking work into short delivery cycles — typically two-week sprints — where a working, tested increment is produced at the end of each cycle.',
        'For a DevOps team, Agile means infrastructure work is managed the same way as application development: broken into user stories with acceptance criteria, sized, prioritised in a backlog, and delivered sprint by sprint. A Terraform module refactor, a new CI pipeline stage, or an AKS node pool upgrade is not a quarter-long project — it is a sprint story with a definition of done.',
        'The DevOps contribution to Agile is enabling the rapid, reliable delivery that Agile promises. Without CI/CD pipelines, Agile sprint demos become manual deployment marathons. Without automated testing, every sprint risks regressions. DevOps tooling is what makes the Agile promise of "working software every two weeks" operationally viable at enterprise scale.'
      ],
      why: 'Connecting Agile values to concrete DevOps infrastructure work items — and explaining how CI/CD pipelines enable Agile velocity — shows you understand the methodology as a practitioner, not just as a process framework.'
    },
    interview_kill_shot: 'Agile without DevOps is just faster planning — it is CI/CD pipelines, automated testing, and infrastructure-as-code that make the promise of working software every sprint operationally real.'
  },

  // ─── Q0251 ── Scrum ───────────────────────────────────────────────────────
  'Q0251': {
    title: 'Scrum Framework — Roles, Ceremonies & Artefacts in Engineering Teams',
    prompt: 'What is Scrum and what are the key roles, ceremonies, and artefacts?',
    type: 'Process / Methodology',
    difficulty: 'Easy',
    chips: ['Scrum', 'Sprint', 'Scrum Master', 'Product Owner', 'Backlog', 'Velocity'],
    definition: 'Scrum is an Agile framework that organises work into fixed-length sprints (1-4 weeks) with defined roles (Product Owner, Scrum Master, Development Team), standardised ceremonies (planning, standup, review, retrospective), and three core artefacts (Product Backlog, Sprint Backlog, Increment).',
    why_it_matters: 'Scrum provides the structure that makes Agile iterative delivery consistent and measurable — without defined roles and ceremonies, teams lose accountability, sprint scope creeps, and the feedback loop to stakeholders breaks down.',
    real_world_scenario: 'At Coforge, DevOps sprint planning every two weeks aligns pipeline and infrastructure work with the application team\'s sprint goals — preventing the situation where developers finish code but cannot deploy because the pipeline or environment is not ready.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. Roles: Product Owner — owns and prioritises the Product Backlog, represents business value. Scrum Master — facilitates ceremonies, removes impediments, protects team focus. Development Team — cross-functional engineers who deliver the sprint increment.',
        '2. Sprint Planning Ceremony: Team and Product Owner select user stories from the backlog into the Sprint Backlog. Stories are broken into technical tasks and assigned. Sprint Goal is defined.',
        '3. Daily Standup (15 min): Three questions — what did I complete yesterday? What will I do today? Any blockers? Keeps the team aligned and impediments visible without long status meetings.',
        '4. Sprint Review: Team demos the completed sprint increment to stakeholders. Acceptance criteria are verified. Incomplete stories return to the backlog with notes.',
        '5. Retrospective: What went well? What could be improved? What specific action will we take next sprint? Produces one or two concrete process improvements — not just a complaints session.'
      ],
      diagram: 'Product Backlog ──> Sprint Planning ──> Sprint (1-2 weeks) [Daily Standup] ──> Sprint Review (demo) ──> Retrospective ──> Updated Backlog'
    },
    interview_answer: {
      response: [
        'Scrum is the most widely used Agile framework. It has three roles: the Product Owner prioritises the Product Backlog — the ordered list of everything the team might build — and ensures the team works on the highest-value items each sprint. The Scrum Master facilitates the ceremonies, removes blockers, and protects the team from scope creep and outside interruptions. The Development Team — which in a DevOps context includes both application engineers and infrastructure engineers — does the actual delivery work.',
        'The four ceremonies are Sprint Planning, where we select and commit to a Sprint Backlog from the Product Backlog. Daily Standup, where we synchronise in 15 minutes on progress and blockers — not a status report to management but a team coordination checkpoint. Sprint Review, where we demo the completed increment to stakeholders and verify acceptance criteria. And the Retrospective, where we identify one or two specific process improvements for the next sprint.',
        'In our DevOps context at Coforge, the most critical ceremony is Sprint Planning. We align infrastructure and pipeline work with the application team\'s sprint goals at the start of each sprint — so we never have a situation where developers finish a feature but the deployment pipeline or Kubernetes namespace for the new service is not ready.'
      ],
      why: 'Explaining how Scrum ceremonies apply specifically to a DevOps team context — especially aligning sprint planning with application teams — shows you practice Scrum as an engineer, not just know its textbook definition.'
    },
    interview_kill_shot: 'Scrum\'s value for DevOps teams is in Sprint Planning alignment — ensuring pipeline and environment readiness is built into the same sprint as the feature work, not treated as an afterthought.'
  },

  // ─── Q0252 ── CI/CD ───────────────────────────────────────────────────────
  'Q0252': {
    title: 'CI/CD Pipeline Architecture — End-to-End Automated Delivery in Azure DevOps',
    prompt: 'Describe your CI/CD pipeline architecture. What stages does it have and what does each stage do?',
    type: 'CI/CD / Azure DevOps',
    difficulty: 'Medium',
    chips: ['CI/CD', 'Azure DevOps', 'Pipeline Stages', 'Helm', 'AKS', 'Quality Gates'],
    definition: 'A CI/CD pipeline is an automated multi-stage delivery system that takes every code commit through build, validate, package, and deploy stages — with quality gates at each stage preventing broken or insecure code from progressing to production.',
    why_it_matters: 'Without a structured multi-stage pipeline, teams rely on manual deployments and informal testing — creating inconsistent releases, configuration drift, and high deployment risk.',
    real_world_scenario: 'At Coforge, the Azure DevOps pipeline has 5 stages: CI (build + test + scan), Dev deploy, Staging deploy + smoke test, Production approval gate, and Production deploy with rollback monitoring — every stage is automated except the Production approval.',
    schema: 'architecture',
    architecture_flow: {
      steps: [
        '1. CI Stage — Build & Validate: Triggered on every PR commit. Compiles the application, runs unit tests with coverage gate (>80%), executes SonarQube static analysis, runs Trivy container image vulnerability scan. Failure blocks the PR from merging.',
        '2. Build & Publish Artefact: On merge to main, Docker image is built, tagged with Git commit SHA, and pushed to Azure Container Registry. The image tag is stored as a pipeline variable for downstream stages.',
        '3. Deploy to Dev: Helm upgrade deploys the new image to the Dev Kubernetes namespace automatically. Readiness probe confirms deployment success within 120 seconds.',
        '4. Deploy to Staging + Smoke Tests: Helm upgrade to Staging namespace. Automated smoke test suite runs API health checks, critical user journey tests. Stage only proceeds if all smoke tests pass.',
        '5. Production Gate + Deploy: Manual approval required — on-call engineer or release manager reviews and approves via Azure DevOps. After approval, Helm upgrade rolls out to Production with a canary or rolling strategy. Azure Monitor and Grafana are watched for 10 minutes post-deploy for any error rate increase.'
      ],
      diagram: 'PR Commit ──> CI (build/test/scan) ──> ACR Image Push ──> Dev Deploy ──> Staging Deploy + Smoke Tests ──> Approval Gate ──> Production Deploy ──> Post-Deploy Monitoring'
    },
    interview_answer: {
      response: [
        'Our Azure DevOps pipeline at Coforge has five distinct stages. The CI stage triggers on every pull request commit — it builds the application, runs unit tests with an 80% coverage gate, executes SonarQube static analysis, and runs a Trivy vulnerability scan on the container image. All four must pass before the PR can be merged to main.',
        'After a merge to main, the pipeline builds the final Docker image, tags it with the Git commit SHA for full traceability, and pushes it to Azure Container Registry. The image tag is then threaded through all downstream deployment stages so we always know exactly which commit is running in each environment.',
        'The deployment stages progress from Dev — fully automated, deploys immediately — to Staging, where an automated smoke test suite runs API health checks and critical user journeys after the Helm upgrade. The Production stage requires a manual approval from the on-call engineer or release manager. Once approved, Helm upgrades Production with a rolling deployment strategy. I watch Azure Monitor and Grafana for 10 minutes post-deploy for any error rate spike — if anything degrades I execute helm rollback immediately.'
      ],
      why: 'Walking through all five stages with specific tool names (SonarQube, Trivy, ACR, Helm), quality gate thresholds (80% coverage), and the post-deploy monitoring window demonstrates a real production CI/CD pipeline — not a generic "build and deploy" description.'
    },
    interview_kill_shot: 'A mature CI/CD pipeline is not just automation — it is a series of quality gates that progressively build confidence in a release from a developer commit all the way to a monitored production rollout.'
  },

  // ─── Q0253 ── Virtual Machine vs Container ── schema: tradeoff ────────────
  'Q0253': {
    title: 'Virtual Machine vs Container — Architecture, Isolation & Use Case Comparison',
    prompt: 'What is the difference between a Virtual Machine and a Container, and when would you use each?',
    type: 'Cloud / Infrastructure',
    difficulty: 'Easy',
    chips: ['Virtual Machine', 'Container', 'Hypervisor', 'Docker', 'Isolation', 'Density'],
    definition: 'A Virtual Machine runs a complete OS on top of a hypervisor (hardware virtualisation), providing strong kernel-level isolation. A container shares the host kernel using Linux namespaces and cgroups, providing process-level isolation with minimal overhead.',
    why_it_matters: 'Choosing VMs when containers would suffice wastes compute resources and slows deployment — choosing containers when strong kernel isolation is required creates security vulnerabilities.',
    real_world_scenario: 'At Coforge, microservices run as containers in AKS (high density, fast startup), while Windows-based legacy applications and CI/CD self-hosted agents run as VMs (full OS needed, specific kernel requirements).',
    schema: 'tradeoff',
    tradeoff_matrix: {
      dimensions: [
        'OS / Kernel',
        'Isolation Level',
        'Startup Time',
        'Resource Density',
        'Image Size',
        'Best Use Case'
      ],
      options: [
        {
          name: 'Virtual Machine',
          values: [
            'Full Guest OS (kernel + OS libraries) runs on top of a hypervisor (Hyper-V, VMware, KVM)',
            'Hardware-level isolation — separate kernel per VM; a kernel exploit in one VM cannot escape to the host or another VM',
            'Slow — 30 seconds to several minutes to boot a full OS and services',
            'Low density — a 4-core 16GB VM runs maybe 2-5 co-located services sharing the OS',
            'Large — OS disk image is typically 10-60GB for the OS alone',
            'Legacy applications requiring full OS; Windows workloads; high-security multi-tenant workloads; CI/CD self-hosted agents'
          ]
        },
        {
          name: 'Container',
          values: [
            'Shares the host OS kernel using Linux namespaces (pid, net, mnt, uts) and cgroups for resource limits — no guest OS',
            'Process-level isolation — containers share the kernel; a kernel vulnerability can potentially be exploited across containers',
            'Fast — sub-second to a few seconds to start a container from a cached image',
            'High density — 4-core 16GB node can run 20-50 microservice containers concurrently',
            'Small — application container images are typically 50MB-500MB with minimal layers',
            'Microservices, stateless APIs, batch jobs, CI/CD build runners, cloud-native applications on Kubernetes'
          ]
        }
      ]
    },
    interview_answer: {
      response: [
        'A Virtual Machine runs a complete guest operating system on top of a hypervisor — Hyper-V, VMware, or KVM. Each VM gets its own kernel, its own OS libraries, and its own full OS process tree. The isolation is hardware-level — even if an attacker compromises the kernel inside one VM, they cannot escape to the host or another VM. The tradeoff is cost: VMs are heavyweight, taking 30 seconds or more to boot, and running only a handful of services per VM.',
        'A container shares the host OS kernel. It uses Linux namespaces to isolate process trees, network interfaces, and filesystem mounts, and cgroups to enforce CPU and memory limits. Because there is no guest OS, containers start in under a second from a cached image and you can run 20-50 containers on a single node that would host maybe 3-5 VMs. The tradeoff is isolation — all containers share the host kernel, so a kernel vulnerability is potentially exploitable across all containers on the node.',
        'In practice I use both. At Coforge, all our microservices run as containers in AKS — fast deployment, high density, and perfect for stateless cloud-native workloads. Self-hosted Azure DevOps agents run as VMs because they need full OS access, custom toolchain installation, and sometimes Windows-specific tooling that cannot run in a Linux container.'
      ],
      why: 'Explaining the specific Linux kernel primitives (namespaces and cgroups) that enable containers — rather than just saying "containers are lightweight" — and providing a real mixed-use case shows genuine infrastructure architecture knowledge.'
    },
    interview_kill_shot: 'VMs give you full kernel isolation via hypervisor hardware virtualisation; containers give you process isolation via kernel namespaces — the right choice depends on your isolation requirements and density needs.'
  },

  // ─── Q0254 ── PaaS vs IaaS vs SaaS ── schema: tradeoff ──────────────────
  'Q0254': {
    title: 'Cloud Service Models — IaaS vs PaaS vs SaaS & Shared Responsibility',
    prompt: 'What is the difference between IaaS, PaaS, and SaaS? How does the shared responsibility model change across them?',
    type: 'Cloud Architecture',
    difficulty: 'Easy',
    chips: ['IaaS', 'PaaS', 'SaaS', 'Shared Responsibility', 'Azure', 'Cloud Models'],
    definition: 'IaaS (Infrastructure as a Service) provides raw compute, storage, and networking. PaaS (Platform as a Service) adds a managed runtime and middleware layer above IaaS. SaaS (Software as a Service) delivers a fully managed application — the cloud provider manages everything except user configuration and data.',
    why_it_matters: 'Choosing IaaS when PaaS would suffice creates unnecessary operational overhead — you own patching, scaling, and availability. Choosing PaaS or SaaS when you need custom OS-level control leaves you without the access you need.',
    real_world_scenario: 'At Coforge, we use all three: AKS nodes (IaaS VMs managed by us for OS patching), Azure App Service (PaaS — Microsoft manages the runtime), and GitHub or Jira (SaaS — vendor manages everything).',
    schema: 'tradeoff',
    tradeoff_matrix: {
      dimensions: [
        'What You Manage',
        'What Microsoft / Vendor Manages',
        'Flexibility & Control',
        'Operational Overhead',
        'Azure Examples',
        'Best For'
      ],
      options: [
        {
          name: 'IaaS — Infrastructure as a Service',
          values: [
            'OS patching, middleware, runtime, application code, data, scaling policies',
            'Physical hardware, data centre, network fabric, hypervisor',
            'Maximum — full OS access, custom kernel modules, any software stack',
            'High — you are responsible for OS security patches, runtime upgrades, and HA configuration',
            'Azure VMs, Azure Disk Storage, Azure VNet, AKS (node OS management)',
            'Custom OS configurations, legacy applications, full control over runtime environment'
          ]
        },
        {
          name: 'PaaS — Platform as a Service',
          values: [
            'Application code, data, configuration, scaling triggers (optional)',
            'OS patching, runtime upgrades, middleware, infrastructure availability, auto-scaling framework',
            'Medium — application-level control; no OS access',
            'Medium — deploy code and config; runtime and OS handled by cloud provider',
            'Azure App Service, Azure Functions, Azure SQL Database, Azure Kubernetes Service (control plane), Azure Cache for Redis',
            'Web apps and APIs where you do not need OS access; serverless functions; managed databases'
          ]
        },
        {
          name: 'SaaS — Software as a Service',
          values: [
            'User configuration, user data, access control (who can use the application)',
            'Everything: application code, runtime, OS, infrastructure, availability, updates',
            'Minimal — only configure within the application\'s provided settings',
            'Minimal — consume the service; no infrastructure or application management',
            'Microsoft 365, GitHub, Jira, Salesforce, Azure DevOps (as a service)',
            'Productivity tools, collaboration platforms, standardised business applications — no custom development needed'
          ]
        }
      ]
    },
    interview_answer: {
      response: [
        'The three cloud service models represent how the management responsibility is split between you and the cloud provider. IaaS — Infrastructure as a Service — gives you raw virtual machines, storage, and networking. You manage everything from the OS upward: installing runtimes, patching the kernel, configuring middleware, and setting up high availability. Azure VMs and raw AKS nodes are IaaS. You get maximum control but maximum operational responsibility.',
        'PaaS — Platform as a Service — removes the OS and runtime management from your plate. Microsoft manages the underlying OS patching, runtime upgrades, and infrastructure availability. You deploy your application code and configure the platform. Azure App Service, Azure Functions, and Azure SQL Database are PaaS. You trade OS-level control for significantly reduced operational overhead — you never patch a runtime or manage a server.',
        'SaaS — Software as a Service — is a fully managed application where you only configure settings and manage your own data. Microsoft 365, GitHub, Jira, and Azure DevOps itself are SaaS. The vendor handles all code, infrastructure, and availability. The shared responsibility model progressively shifts more to the vendor as you move from IaaS to PaaS to SaaS — the question to ask is: how much control do you actually need, versus how much operational overhead you are willing to carry?'
      ],
      why: 'Using the shared responsibility framing — "control vs operational overhead" — and grounding each model in specific Azure service examples from real experience shows you apply these concepts in actual architecture decisions, not just recite definitions.'
    },
    interview_kill_shot: 'IaaS gives you maximum control at maximum operational cost; PaaS removes OS management so you focus on code; SaaS removes everything so you only configure — choose based on how much control you actually need.'
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
console.log(`\n✅ Phase 3 complete — patched ${patchedCount} questions in infinite_locus.json`);
console.log('   Patched IDs:', patchedIds.join(', '));

// ─────────────────────────────────────────────────────────────────────────────
// FINAL VERIFICATION — Zero template answers across ALL 48 questions
// ─────────────────────────────────────────────────────────────────────────────
const allBroken = locus.filter(q =>
  q.interview_answer &&
  q.interview_answer.response &&
  (
    q.interview_answer.response[0].includes('When addressing') ||
    (q.interview_kill_shot && q.interview_kill_shot.includes('is mastered through codified'))
  )
);

if (allBroken.length === 0) {
  console.log('\n🎉 FINAL VERIFICATION PASS — 0 template answers remain across all 48 JD Prep questions!');
} else {
  console.error('\n❌ FINAL VERIFICATION FAIL — still broken:');
  allBroken.forEach(q => console.error('  ', q.id, q.title));
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// FINAL SYNC to merged.json
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
console.log(`\n✅ merged.json final sync — updated ${syncedCount} records. Total: ${updatedMerged.length} questions`);

// ─────────────────────────────────────────────────────────────────────────────
// FINAL merged.json template check
// ─────────────────────────────────────────────────────────────────────────────
const mergedBroken = updatedMerged.filter(q =>
  q.interview_answer &&
  q.interview_answer.response &&
  q.interview_answer.response[0] &&
  q.interview_answer.response[0].includes('When addressing')
);

if (mergedBroken.length === 0) {
  console.log('✅ merged.json template check PASS — 0 template answers in 254 questions\n');
} else {
  console.warn('⚠️  merged.json still has template answers in:', mergedBroken.map(q => q.id).join(', '));
}
