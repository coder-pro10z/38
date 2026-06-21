// generate_infra_azure_json_part2.js
// Run: node generate_infra_azure_json_part2.js
// Output: infra_azure.json (20 slides)

const fs = require('fs');
const path = require('path');

// Read part 1 slides
const part1Path = path.join(__dirname, 'infra_azure_part1.json');
let slides1to10 = [];
try {
  slides1to10 = JSON.parse(fs.readFileSync(part1Path, 'utf8'));
  console.log(`✅ Loaded ${slides1to10.length} slides from infra_azure_part1.json`);
} catch (e) {
  console.error("❌ Could not read infra_azure_part1.json. Make sure you run generate_infra_azure_json.js first!");
  process.exit(1);
}

// ─── CANVAS HTML HELPERS ────────────────────────────────────────────────────

const darkBase = `body{margin:0;font-family:'Segoe UI',sans-serif;background:#1a1a2e;color:#e2e8f0;padding:16px;box-sizing:border-box}`;
const azureBtn = `button{background:#0078d4;color:#fff;border:none;border-radius:6px;padding:8px 16px;cursor:pointer;font-size:13px;font-weight:600}button:hover{background:#005a9e}`;
const card = `.card{background:#16213e;border:1px solid #0f3460;border-radius:8px;padding:14px;margin-bottom:12px}`;
const label = `label{font-size:12px;color:#94a3b8;display:block;margin-bottom:4px}`;
const input = `input,select{width:100%;padding:7px 10px;background:#0f3460;border:1px solid #1e4a8a;border-radius:5px;color:#e2e8f0;font-size:13px;box-sizing:border-box;margin-bottom:10px}`;
const pre = `.pre{background:#0f3460;border-radius:6px;padding:12px;font-family:monospace;font-size:12px;white-space:pre;overflow-x:auto;color:#7dd3fc}`;

const wrap = (title, body, style = '') =>
  `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title><style>${darkBase}${azureBtn}${card}${label}${input}${pre}h2{margin:0 0 12px;font-size:16px;color:#0078d4}h3{margin:6px 0;font-size:13px;color:#7dd3fc}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ok{color:#34d399}.err{color:#f87171}.warn{color:#fbbf24}${style}</style></head><body><h2>${title}</h2>${body}</body></html>`;

// ─── SLIDE DEFINITIONS (11-20) ───────────────────────────────────────────────

const newSlides = [

// ═══════════════════════════════════════════════════════════════════
// SLIDE 11 — Troubleshoot Hybrid Connectivity & Latency
// ═══════════════════════════════════════════════════════════════════
{
  title: "Troubleshoot Hybrid Connectivity & Latency",
  type: "Networking — Operational Troubleshooting",
  difficulty: "Advanced",
  chips: ["Network Watcher", "Effective Routes", "Connection Monitor", "Latency", "MTU"],
  schema: "architecture",
  definition: "Troubleshooting hybrid connectivity involves identifying and isolating network failures across physical networks, VPN/ExpressRoute gateways, custom routes, and transport configurations.",
  why_it_matters: "A single routing misconfiguration or MTU mismatch can look like a complete circuit outage, causing teams to spend hours diagnosing physical circuits when the root cause is a local software setting.",
  real_world_scenario: "An application team reports that their VM in a spoke VNet cannot connect to an on-premises database over ExpressRoute, showing random connection timeouts and packet drops.",
  content_theory: `Here is a breakdown of how to isolate hybrid connectivity and latency issues.

1. Failure Categories
Physical/Circuit: BGP flapping, provider cross-connect failures, or fiber degradation.
Routing/UDR: Subnet-level overrides preventing traffic from reaching gateways.
DNS Resolution: Hybrid DNS setup returning public IPs instead of private endpoints.
MTU/Fragmentation: TCP packets larger than 1400 bytes getting dropped due to encapsulation overhead.

Best For: Resolving hybrid connection outages and latency regressions systematically.
Requirements: Read-access to Network Watcher, Azure Gateway diagnostics, and on-premises routers.
Core Azure Resources: Network Watcher, Connection Monitor, VPN/ExpressRoute Diagnostics.

2. Diagnostic Hierarchy
First, isolate by Layer 3: check Azure Effective Route tables on the VM's NIC to verify if the next hop is correct.
Second, isolate by DNS: verify if the hostname resolves to the expected IP.
Third, isolate by transport: test TCP port connectivity using tools like tcpping/Test-NetConnection.`,
  content_implementation: `Bypassing diagnostic commands and jumping to vendor escalations is the most common time-waster — always verify effective routing on the NIC before checking physical hardware.

Key Deployment Considerations:

Verify Effective Routes First: Use Azure CLI to check what routing rules the VM NIC actually uses. If the next hop isn't VirtualNetworkGateway or the Firewall IP, the issue is a UDR override.

MTU Size Adjustment: Azure VNets support MTU of 1500, but VPN gateways encapsulate packets, reducing usable payload. Set on-premises firewall/VM MTU to 1400 (or MSS to 1360) to prevent packet drops due to DF (Don't Fragment) flags.

Connection Monitor: Deploy Network Watcher Connection Monitors between Azure spoke subnets and on-premises endpoints. This provides continuous latency metrics and path-hop maps.

Flow Logs Audit: Use NSG Flow Logs to verify if traffic is blocked by a local rule before it ever exits the VNet boundary.`,
  architecture_flow: {
    steps: [
      "Client initiates TCP connection to database",
      "VM OS determines next hop using local route table",
      "Azure Network Virtual Filtering checks subnet UDR table",
      "Next hop directs packet to GatewaySubnet",
      "VPN/ExpressRoute gateway applies encapsulation (IPsec/GRE)",
      "ISP carries packet to on-premises firewall",
      "On-premises firewall decrypts and forwards packet to target database"
    ],
    diagram: "VM NIC -> Subnet UDR evaluation -> GatewaySubnet -> VPN/ER Tunnel -> On-Prem Firewall -> On-Prem DB"
  },
  key_commands: [
    {
      command: `az network nic show-effective-route-table \\
  --resource-group rg-prod-connectivity \\
  --name vm-backend-nic \\
  --output table`,
      description: "Azure CLI: Retrieve active effective routes on a VM NIC to isolate UDR/BGP issues."
    },
    {
      command: `Test-NetConnection -ComputerName 192.168.10.25 -Port 1433
# Or Linux equivalent:
tcpping 192.168.10.25 1433`,
      description: "OS Diagnostic: Test raw TCP port connectivity to isolate network layers from application layers."
    }
  ],
  interview_answer: {
    response: [
      "To troubleshoot a hybrid outage, I start by reviewing the VM's effective route table in Azure to verify that the next hop for the on-premises range points to the VNet Gateway or NVA. This rules out UDR overrides.",
      "If routing is correct, I run a TCP ping to isolate Layer 4. If TCP ping fails but routing is fine, I check the gateway status and BGP peering logs for flaps.",
      "For packet drop or performance degradation issues, I check for MTU mismatches. I set the MTU to 1400 on the VMs or configure MSS clamping on-premises to account for VPN encapsulation headers."
    ],
    why: "Effective route verification and MTU handling are the most direct ways to solve 90% of hybrid network problems."
  },
  interview_kill_shot: "Check effective route tables on the VM NIC first, isolate Layer 4 with TCP ping, verify DNS resolutions, and clamp MTU to 1400 to account for tunnel encapsulation overhead.",
  interactive_html: wrap("Hybrid Connectivity Triage Decision Tree", `
<div class="card">
  <h3>Select Your Network Symptom</h3>
  <select id="symptom" onchange="triage()">
    <option value="none">-- Select Symptom --</option>
    <option value="no_ping">VPN/ER status connected but cannot access on-premises resources</option>
    <option value="high_lat">High latency and random TCP timeouts on larger file transfers</option>
    <option value="dns_fail">Private endpoints resolve to public IPs from on-premises clients</option>
  </select>
</div>
<div id="result" class="card" style="display:none">
  <h3 id="res_title">Diagnostic Plan</h3>
  <div id="steps" style="font-size:12.5px;line-height:1.6"></div>
</div>
<script>
function triage() {
  const sym = document.getElementById('symptom').value;
  const res = document.getElementById('result');
  const title = document.getElementById('res_title');
  const steps = document.getElementById('steps');
  
  if (sym === 'none') { res.style.display = 'none'; return; }
  res.style.display = 'block';
  
  if (sym === 'no_ping') {
    title.textContent = 'Diagnostic Plan: Connected but Unreachable';
    steps.innerHTML = \`
      <div class="warn">Step 1: Check Effective Route Table</div>
      <div class="pre">az network nic show-effective-route-table --name VM_NIC_NAME --resource-group RG_NAME</div>
      <p>Ensure that the route to your on-premises CIDR (e.g. 192.168.0.0/16) has nextHopType = 'VirtualNetworkGateway'.</p>
      
      <div class="warn">Step 2: Check NSGs & Flow Logs</div>
      <p>Verify that your subnet NSG does not block outbound traffic to your on-premises range.</p>
      
      <div class="warn">Step 3: Verify BGP Peering status on Gateway</div>
      <p>Check if BGP learned routes contain the target subnets. If BGP is down, routes won't propagate.</p>
    \`;
  } else if (sym === 'high_lat') {
    title.textContent = 'Diagnostic Plan: Latency and Drop Issues (MTU)';
    steps.innerHTML = \`
      <div class="warn">Step 1: Diagnose Packet Fragmentation</div>
      <div class="pre">ping 192.168.1.10 -f -l 1472</div>
      <p>If ping succeeds with smaller packet sizes but fails with large packets, MTU is the bottleneck.</p>
      
      <div class="warn">Step 2: MSS Clamping Configuration</div>
      <p>Configure on-premises routers to perform MSS clamping to 1360 (MTU 1400) for all IPsec traffic.</p>
    \`;
  } else if (sym === 'dns_fail') {
    title.textContent = 'Diagnostic Plan: Hybrid DNS Resolution Failure';
    steps.innerHTML = \`
      <div class="warn">Step 1: Validate Resolver Address</div>
      <p>Ensure on-premises clients query DNS servers that have a conditional forwarder pointing to the Azure DNS IP (168.63.129.16) via an Azure DNS Private Resolver.</p>
      
      <div class="warn">Step 2: Verify Zone Link</div>
      <p>Verify that the private DNS zone (e.g. privatelink.blob.core.windows.net) is linked to all client virtual networks.</p>
    \`;
  }
}
</script>`)
},

// ═══════════════════════════════════════════════════════════════════
// SLIDE 12 — Azure Monitor + SIEM Log Integration
// ═══════════════════════════════════════════════════════════════════
{
  title: "Azure Monitor & SIEM Integration",
  type: "Observability — Log Collection & Security",
  difficulty: "Intermediate",
  chips: ["Azure Monitor", "Diagnostic Settings", "Event Hub", "Log Analytics", "Sentinel", "KQL"],
  schema: "architecture",
  definition: "Azure Monitor collects telemetry data from platform and resource sources, routing it through Diagnostic Settings to Log Analytics Workspaces or Event Hubs for SIEM ingest.",
  why_it_matters: "Deploying production infrastructure without configuring Diagnostic Settings means critical audit logs and security telemetry are never recorded, leaving security events untraceable.",
  real_world_scenario: "An enterprise needs to stream WAF logs from an Azure Application Gateway and login logs from Entra ID directly to Microsoft Sentinel and an external Splunk deployment.",
  content_theory: `Here is a breakdown of how the Azure Monitor pipeline structures resources and logs.

1. Telemetry Collection Pipeline
Resource Diagnostics: Logs and metrics emitted at the resource level (e.g., App Gateway transaction logs).
Activity Logs: Audit records of subscription-level actions (who created a resource, when, etc.).
Entra ID Logs: User sign-in logs, audit logs, and directory changes.

Best For: Enterprise security compliance and operational audit trails.
Requirements: Log Analytics Workspace or Event Hub configured prior to routing.
Core Azure Resources: Diagnostic Settings, Log Analytics Workspaces, Event Hub Namespaces.

2. Routing Destinations
Log Analytics Workspace: Storage for logs to enable native querying (KQL), dashboarding, and Microsoft Sentinel integration.
Event Hub: Pipeline for streaming logs in real time to third-party SIEM platforms (Splunk, QRadar).
Storage Account: Low-cost destination for long-term cold storage of compliance logs.`,
  content_implementation: `Failing to configure Event Hub stream namespaces correctly causes SIEM connections to drop under log bursts — always use dedicated partitions and auto-inflate options.

Key Deployment Considerations:

Enable Diagnostics in IaC: Diagnostic Settings must be defined for every resource in Terraform. If skipped, resources will run but emit no telemetry.

KQL Query optimization: Store KQL queries in Azure Workbook dashboards. Avoid searching raw logs globally; filter by Category and OperationName first.

Event Hub Scaling: Enable Auto-Inflate on Event Hub Namespaces used for SIEM log streaming. Under heavy security events (e.g., DDOS), log volume increases instantly.

Activity Log Scope: Activity logs are routed via subscription-level diagnostic settings, separate from resource-level settings.`,
  architecture_flow: {
    steps: [
      "Azure resource generates event (e.g., WAF block)",
      "Diagnostic Setting evaluates event categories",
      "Telemetry routed to Event Hub Namespace",
      "Event Hub streams events to third-party SIEM connector",
      "Concurrent telemetry routed to Log Analytics Workspace for local retention",
      "Microsoft Sentinel queries Workspace logs via KQL schedules"
    ],
    diagram: "Resource -> Diagnostic Setting -> Event Hub (Splunk) & Log Analytics (Sentinel)"
  },
  key_commands: [
    {
      command: `resource "azurerm_monitor_diagnostic_setting" "appgw" {
  name                       = "appgw-diagnostics"
  target_resource_id         = azurerm_application_gateway.web.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "ApplicationGatewayAccessLog"
  }
  enabled_log {
    category = "ApplicationGatewayFirewallLog"
  }
  metric {
    category = "AllMetrics"
  }
}`,
      description: "Terraform: Configure Diagnostic Settings to route App Gateway Access and WAF logs to Log Analytics."
    },
    {
      command: `AzureDiagnostics
| where ResourceProvider == "MICROSOFT.NETWORK"
| where Category == "ApplicationGatewayFirewallLog"
| where action_s == "Blocked"
| summarize count() by clientIp_s, details_message_s`,
      description: "KQL Query: Retrieve blocked WAF requests grouped by client IP and triggered rules."
    }
  ],
  interview_answer: {
    response: [
      "To integrate Azure logs with SIEM systems, I use Diagnostic Settings applied to resources and subscription levels. These settings specify log categories and metrics to collect and route.",
      "For third-party SIEMs like Splunk, I route logs to an Event Hub namespace with Auto-Inflate enabled. The SIEM pulls from the Event Hub partition in real time.",
      "For native monitoring, I route logs to a Log Analytics Workspace. This enables security analysis using KQL queries and hooks directly into Microsoft Sentinel for threat detection."
    ],
    why: "Event Hub routing for external SIEMs and Log Analytics routing for native Sentinel are standard cloud governance patterns."
  },
  interview_kill_shot: "Route resource telemetry via Diagnostic Settings. Stream to Log Analytics Workspaces for KQL/Sentinel, or to Event Hub namespaces for Splunk/SIEM platforms. Ensure Event Hubs have Auto-Inflate active.",
  interactive_html: wrap("Log Pipeline Flow Diagram", `
<div class="grid">
  <div>
    <div class="card">
      <h3>Select Resource Source</h3>
      <button onclick="stream('appgw')" style="width:100%;margin-bottom:6px">Application Gateway</button>
      <button onclick="stream('vm')" style="width:100%;margin-bottom:6px">Virtual Machine (NIC)</button>
      <button onclick="stream('entra')" style="width:100%">Entra ID (Active Directory)</button>
    </div>
    <div class="card" id="details" style="min-height:100px;font-size:12px;color:#94a3b8">
      Select a source resource above to trace log routing.
    </div>
  </div>
  <div>
    <div class="card" id="flow" style="display:none">
      <h3>KQL Query Template</h3>
      <div class="pre" id="kql"></div>
    </div>
  </div>
</div>
<script>
function stream(src) {
  const d = document.getElementById('details');
  const f = document.getElementById('flow');
  const k = document.getElementById('kql');
  f.style.display = 'block';
  
  if (src === 'appgw') {
    d.innerHTML = \`
      <div style="color:#7dd3fc;font-weight:700">Source: Application Gateway</div>
      <div><strong>Log Category:</strong> ApplicationGatewayFirewallLog</div>
      <div><strong>Pipeline:</strong> Diagnostic Setting → Event Hub (SIEM) / Log Analytics (Sentinel)</div>
      <p style="margin-top:6px">Used to trace malicious requests and SQL Injection attempts blocked by WAF.</p>
    \`;
    k.textContent = \`AzureDiagnostics
| where Category == "ApplicationGatewayFirewallLog"
| where action_s == "Blocked"
| project TimeGenerated, clientIp_s, requestUri_s, ruleId_s\`;
  } else if (src === 'vm') {
    d.innerHTML = \`
      <div style="color:#34d399;font-weight:700">Source: Virtual Machine (NIC)</div>
      <div><strong>Log Category:</strong> NetworkSecurityGroupFlowEvent</div>
      <div><strong>Pipeline:</strong> NSG Flow Logs → Network Watcher → Storage Account → LAW</div>
      <p style="margin-top:6px">Tracks raw IP connections matching allow/deny security rules.</p>
    \`;
    k.textContent = \`AzureNetworkAnalytics_CL
| where FlowType_s == "MaliciousFlow"
| summarize count() by SrcIP_s, DestIP_s, DestPort_d\`;
  } else if (src === 'entra') {
    d.innerHTML = \`
      <div style="color:#fbbf24;font-weight:700">Source: Entra ID</div>
      <div><strong>Log Category:</strong> SigninLogs, AuditLogs</div>
      <div><strong>Pipeline:</strong> Tenant Diagnostics → Event Hub → SIEM</div>
      <p style="margin-top:6px">Monitors administrative access changes and sign-in anomalies.</p>
    \`;
    k.textContent = \`SigninLogs
| where ResultType != "0"
| summarize count() by UserDisplayName, IPAddress, ResultDescription\`;
  }
}
</script>`)
},

// ═══════════════════════════════════════════════════════════════════
// SLIDE 13 — Azure Backup
// ═══════════════════════════════════════════════════════════════════
{
  title: "Azure Backup — Vault Design & Policies",
  type: "DR — Backup Infrastructure",
  difficulty: "Intermediate",
  chips: ["Azure Backup", "Recovery Services Vault", "Retention Policy", "Soft Delete", "Cross-Region Restore"],
  schema: "architecture",
  definition: "Azure Backup is a fully managed backup service that protects VM instances, SQL databases, files, and containers using Recovery Services Vault structures.",
  why_it_matters: "Failing to enable Cross-Region Restore or disabling Soft Delete leaves backups vulnerable to ransomware attacks or complete primary region outages.",
  real_world_scenario: "An enterprise requires all SQL databases on Azure VMs to have daily backups retained for 30 days, weekly backups for 12 weeks, and monthly backups for 12 months, with copies stored in a secondary paired region.",
  content_theory: `Here is a breakdown of how Azure Backup vault architectures and policies are structured.

1. Vault Structures
Recovery Services Vault: Central repository for backup management. Protects Azure VMs, SQL in VMs, SAP HANA, and Azure Files.
Backup Vault: Used for newer workloads such as Azure Disks, Blobs, and AKS backup instances.

Best For: Long-term archival and application snapshot retention.
Requirements: Vault deployment in same region as the target resources.
Core Azure Resources: Recovery Services Vault, Backup Policy, Protected Items.

2. Storage Redundancy Options
Locally Redundant (LRS): Three copies in a single datacenter. Lowest cost, no protection against facility disaster.
Geo-Redundant (GRS): Replicates backup data to a secondary paired region. Protects against region outages.
Zone-Redundant (ZRS): Copies spread across three zones in the primary region. Protects against zone failures.`,
  content_implementation: `Disabling Soft Delete to save storage costs is an extreme risk — Soft Delete preserves deleted backups for 14 days with zero cost, providing the only protection against compromised administrator credentials.

Key Deployment Considerations:

Soft Delete Protection: Ensure Soft Delete is active on all vaults. If backups are deleted accidentally or maliciously, they can be recovered within 14 days.

Cross-Region Restore (CRR): Enable CRR at the vault creation stage. This allows restoring backup workloads in the secondary paired region at any time, even if the primary region is completely offline.

Backup Policy Schedules: Do not overlap SQL log backup schedules (usually 15-minute intervals) with VM-level nightly snapshots to prevent disk I/O contention.

Azure Policy Enforcement: Assign policy scopes to enforce vault association for all newly deployed VM instances.`,
  trade_offs: [
    {
      choice: "Backup Storage Redundancy: LRS vs ZRS vs GRS",
      advantages: [
        "LRS: Lowest cost, fastest copy operations — ideal for dev/test environments.",
        "ZRS: Protects against zone outages, no latency impact — good for local zone compliance.",
        "GRS: Protects against whole-region disasters, enables Cross-Region Restore (CRR) — baseline for production."
      ],
      disadvantages: [
        "LRS: No protection if the datacenter or region goes down.",
        "ZRS: Slightly higher cost than LRS, does not protect against region failures.",
        "GRS: Highest storage cost (approx 2x LRS), asynchronous replication."
      ]
    }
  ],
  key_commands: [
    {
      command: `resource "azurerm_recovery_services_vault" "vault" {
  name                = "prod-recovery-vault"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "Standard"
  storage_mode_type   = "GeoRedundant"
  cross_region_restore_enabled = true
  soft_delete_enabled          = true
}`,
      description: "Terraform: Recovery Services Vault with Geo-Redundant storage, Cross-Region Restore (CRR) enabled, and Soft Delete protection."
    }
  ],
  interview_answer: {
    response: [
      "I configure a Recovery Services Vault with Geo-Redundant Storage (GRS) and Cross-Region Restore (CRR) enabled for all production workloads. This ensures backups are safe even during region disasters.",
      "Soft Delete is kept active to preserve deleted snapshots for 14 days at no extra cost, which mitigates ransomware attacks that attempt to wipe out backups.",
      "I structure the backup policy using standard grandfather-father-son patterns (Daily/Weekly/Monthly/Yearly retention) and assign compliance policies to guarantee every new VM is auto-registered."
    ],
    why: "Vault redundancy selection and Soft Delete configurations are the core security baselines for cloud backups."
  },
  interview_kill_shot: "Recovery Services Vault configured with GRS storage, Cross-Region Restore enabled for secondary region recovery, and Soft Delete active to prevent malicious backup deletion.",
  interactive_html: wrap("Backup Retention Calculator", `
<div class="grid">
  <div>
    <div class="card">
      <h3>Retention Configurations</h3>
      <label>Daily Backup Retention (Days)</label>
      <input type="number" id="daily" value="30" min="1">
      <label>Weekly Backup Retention (Weeks)</label>
      <input type="number" id="weekly" value="12" min="0">
      <label>Monthly Backup Retention (Months)</label>
      <input type="number" id="monthly" value="12" min="0">
      <label>Storage Redundancy Type</label>
      <select id="storage" onchange="calc()">
        <option value="1">LRS (Locally Redundant)</option>
        <option value="2">GRS (Geo-Redundant - 2x cost)</option>
      </select>
      <button onclick="calc()" style="margin-top:8px">Calculate Storage & Policy</button>
    </div>
  </div>
  <div>
    <div class="card" id="out" style="display:none">
      <h3>Policy Architecture</h3>
      <div id="cost" style="font-size:14px;color:#34d399;font-weight:700"></div>
      <div class="pre" id="tfPolicy" style="margin-top:10px"></div>
    </div>
  </div>
</div>
<script>
function calc() {
  const d = +document.getElementById('daily').value;
  const w = +document.getElementById('weekly').value;
  const m = +document.getElementById('monthly').value;
  const red = +document.getElementById('storage').value;
  
  const out = document.getElementById('out');
  const cost = document.getElementById('cost');
  const tf = document.getElementById('tfPolicy');
  out.style.display = 'block';
  
  const factor = red === 2 ? 'Geo-Redundant (Double Cost)' : 'Locally Redundant';
  cost.textContent = \`Storage Mode: \${factor} | Retention Points: \${d + w + m} Active\`;
  
  tf.textContent = \`resource "azurerm_backup_policy_vm" "policy" {
  name                = "vm-backup-policy"
  resource_group_name = azurerm_resource_group.rg.name
  recovery_vault_name = azurerm_recovery_services_vault.vault.name

  backup {
    frequency = "Daily"
    time      = "23:00"
  }

  retention_daily {
    count = \${d}
  }

  retention_weekly {
    count    = \${w}
    weekdays = ["Sunday"]
  }

  retention_monthly {
    count    = \${m}
    weekdays = ["Sunday"]
    weeks    = ["First"]
  }
}\`;
}
calc();
</script>`)
},

// ═══════════════════════════════════════════════════════════════════
// SLIDE 14 — Azure Site Recovery (ASR)
// ═══════════════════════════════════════════════════════════════════
{
  title: "Azure Site Recovery (ASR) — DR Orchestration",
  type: "DR — Compute Replication",
  difficulty: "Advanced",
  chips: ["ASR", "Replication Policy", "Crash Consistent", "App Consistent", "Test Failover", "Recovery Plan"],
  schema: "architecture",
  definition: "Azure Site Recovery orchestrates and automates replication, failover, and failback of VM instances between Azure regions or from on-premises datacenters to Azure.",
  why_it_matters: "Executing a DR failover test in production without using the 'Test Failover' isolated networking option will duplicate IP addresses, routing traffic to the DR VMs and bringing down production.",
  real_world_scenario: "A core financial transaction VM requires cross-region DR from East US to West US. Compute must replicate continuously with an RPO target of 15 minutes, allowing dry-run tests without production downtime.",
  content_theory: `Here is a breakdown of how Azure Site Recovery replicates compute resources.

1. Replication Models
Continuous Replication: Compute writes to cache storage in the source region, which is asynchronously replicated to target region replica disks. ASR coordinates this flow.
Recovery Point Types:
Crash-Consistent: Captures data on disk during snapshot. Generated every 5 minutes.
App-Consistent: Captures disk data plus memory contents/transactions in progress. Uses VSS (Windows) or pre/post scripts (Linux). Generated based on replication policy schedule (e.g., every 1 hour).

Best For: Active-Passive VM-level disaster recovery with minimal RTO.
Requirements: Cache Storage Account in source region, Recovery Services Vault in target region.
Core Azure Resources: Recovery Services Vault, Replication Policy, Protected VM, Recovery Plan.

2. DR Sandbox Testing
Isolated Networks: Testing a failover creates target VM instances in a dedicated DR testing VNet, isolated from the production network. This verifies boot sequences and application sanity without disrupting active replication.`,
  content_implementation: `Triggering an unplanned failover commits target VMs to production — always use the 'Test Failover' operation for auditing and drills, which provisions instances in sandbox networks and clean up automatically.

Key Deployment Considerations:

Dedicated Cache Storage: ASR requires a standard storage account in the source region to buffer VM writes before replicating them. This cache account should not be shared with other services to avoid throughput limits.

App-Consistent Frequency: Do not set App-Consistent snapshots to run too frequently (e.g., every 15 minutes). Capturing app consistency freezes VM I/O briefly, which degrades database performance. An interval of 1 to 4 hours is standard.

Recovery Plans: Group related VMs (e.g., database, API, frontend) into a single Recovery Plan. This enforces boot dependency order (databases boot first, then web servers) and enables running custom scripts or manual checklists during failover.

Network Mapping: Pre-configure Network Mapping between source subnets and target subnets to ensure target VMs get assigned appropriate IP addresses upon failover.`,
  architecture_flow: {
    steps: [
      "VM writes to virtual disk in East US (Source)",
      "ASR agent copies disk changes to Standard Cache Storage Account",
      "Cache contents replicate asynchronously to target replica disks in West US",
      "ASR maintains log checkpoints (every 5 minutes for crash consistency)",
      "During failover: replica disks attach to target VM instances spun up in West US Vault",
      "Network Mapping assigns pre-allocated IPs to West US VM interfaces"
    ],
    diagram: "Source VM -> Cache Storage -> Target Replica Disks -> Failover VM Spin-up"
  },
  key_commands: [
    {
      command: `# Initiate an ASR test failover using PowerShell
Start-AzRecoveryServicesAsrTestFailoverJob \`
  -ReplicatedItem $vmReplicatedItem \`
  -Direction PrimaryToRecovery \`
  -VMNetworkId $testNetworkId`,
      description: "PowerShell: Trigger a sandbox test failover for a replicated VM to an isolated network."
    },
    {
      command: `# Clean up test failover VM instances
Start-AzRecoveryServicesAsrTestFailoverCleanupJob \`
  -ReplicatedItem $vmReplicatedItem \`
  -Comment "DR Drill successfully validated - cleaning up test resources"`,
      description: "PowerShell: Clean up and remove test failover VMs in target region to save costs."
    }
  ],
  interview_answer: {
    response: [
      "Azure Site Recovery performs asynchronous replication of VM disks. Changes are written to a source cache storage account, then streamed to replica disks in the target region. The source compute is not linked to the target disks until failover is triggered.",
      "I configure Recovery Plans to coordinate multi-VM failovers in groups, ensuring databases start before application servers. I also script custom tasks like updating DNS records within the plan.",
      "For drills, I use 'Test Failover' linked to an isolated VNet. This boots replica VMs without interrupting active replication or causing network collisions with production."
    ],
    why: "ASR recovery plans and isolated network testing are standard compliance requirements for enterprise DR audits."
  },
  interview_kill_shot: "Asynchronous replication via source cache storage to target replica disks. Always use ASR Recovery Plans to enforce VM boot ordering (DB first). Test failover only in isolated VNets to prevent IP routing collisions with production.",
  interactive_html: wrap("ASR Replication Timeline", `
<div class="card">
  <h3>Simulate Replication State</h3>
  <label>Slide to a point in time (Hours ago)</label>
  <input type="range" id="timeSlider" min="0" max="6" value="0" step="0.25" style="width:100%" oninput="updateTime()">
  <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-top:4px">
    <span>Now (0h)</span><span>3 Hours ago</span><span>6 Hours ago</span>
  </div>
</div>
<div class="card">
  <h3>Recovery Point Status</h3>
  <div id="status" style="font-size:13px;line-height:1.6"></div>
  <div id="rpo" style="margin-top:10px;padding:10px;border-radius:6px;font-weight:700"></div>
</div>
<script>
const snapshots = [
  { t: 0, type: 'live', desc: 'Current state in East US' },
  { t: 0.1, type: 'crash', desc: 'Crash-consistent checkpoint (Last write synced)' },
  { t: 0.5, type: 'crash', desc: 'Crash-consistent checkpoint' },
  { t: 1.0, type: 'app', desc: 'App-Consistent snapshot (SQL VSS Freeze)' },
  { t: 2.0, type: 'app', desc: 'App-Consistent snapshot (SQL VSS Freeze)' },
  { t: 3.0, type: 'app', desc: 'App-Consistent snapshot (SQL VSS Freeze)' },
  { t: 4.0, type: 'app', desc: 'App-Consistent snapshot (SQL VSS Freeze)' },
  { t: 5.0, type: 'app', desc: 'App-Consistent snapshot (SQL VSS Freeze)' },
  { t: 6.0, type: 'app', desc: 'App-Consistent snapshot (SQL VSS Freeze)' }
];
function updateTime() {
  const val = +document.getElementById('timeSlider').value;
  const status = document.getElementById('status');
  const rpo = document.getElementById('rpo');
  
  // Find nearest snapshot at or older than 'val'
  const available = snapshots.filter(s => s.t >= val);
  const snap = available[0] || snapshots[snapshots.length - 1];
  
  status.innerHTML = \`
    <div><strong>Target Recovery State:</strong> \${snap.desc}</div>
    <div><strong>Snapshot Age:</strong> \${snap.t} hours ago</div>
    <div><strong>Checkpoint Type:</strong> <span style="color:\${snap.type==='app'?'#34d399':'#fbbf24'}">\${snap.type.toUpperCase()}</span></div>
  \`;
  
  const rpoGap = (val - snap.t) * 60; // in minutes
  if (val === 0) {
    rpo.style.background = '#1e3a8a'; rpo.style.color = '#93c5fd';
    rpo.textContent = 'Active Replication: Target is ready for failover.';
  } else {
    rpo.style.background = '#7c2d12'; rpo.style.color = '#fca5a5';
    rpo.textContent = \`Data Loss (RPO Gap): \${Math.floor(rpoGap)} minutes of latest transaction history.\`;
  }
}
updateTime();
</script>`)
},

// ═══════════════════════════════════════════════════════════════════
// SLIDE 15 — Multi-Region DR Strategy
// ═══════════════════════════════════════════════════════════════════
{
  title: "Multi-Region DR Strategy",
  type: "DR — High Availability",
  difficulty: "Advanced",
  chips: ["Multi-Region", "Active-Active", "Active-Passive", "Paired Regions", "GRS", "Geo-Replication"],
  schema: "architecture",
  definition: "A multi-region DR strategy distributes applications and data stores across separate geographic areas to guarantee availability in the event of a total primary region outage.",
  why_it_matters: "Designing an active-active architecture without implementing synchronous database replication results in write conflicts and split-brain data states during a regional failover.",
  real_world_scenario: "An enterprise is planning the disaster recovery architecture for a customer portal. They must choose between a warm standby pattern (active-passive) and a global distributed pattern (active-active).",
  content_theory: `Here is a breakdown of the two primary multi-region disaster recovery patterns.

1. Active-Passive (Warm Standby)
Primary Region: Handles 100% of production traffic.
Secondary Region: Pre-provisioned compute resources running at lower capacity (e.g. scale-set min count = 1). Databases configured with asynchronous replication (e.g., SQL AlwaysOn Secondary).
Failover: Requires routing change (Front Door/Traffic Manager) and scaling up compute instances in the secondary region.

Best For: Cost-conscious applications that can tolerate a 15–30 minute recovery window.
Requirements: Paired region replication for storage, database secondary replica.
Core Azure Resources: Traffic Manager/Front Door, virtual machine scale sets, SQL databases.

2. Active-Active (Hot Standby)
Both Regions: Running at full scale. Traffic distributed globally based on geographic proximity.
Databases: Requires multi-region write capability (e.g., Cosmos DB multi-region writes) or synchronous replication where applicable.
Failover: Near-zero downtime; if one region goes down, Front Door redirects traffic to the surviving region instantly.`,
  content_implementation: `Choosing an Active-Active model without considering database latency limits is the most common reason projects fail — cross-region DB sync introduces significant write overhead.

Key Deployment Considerations:

Azure Paired Regions: Utilize Azure's paired regions (e.g., East US paired with West US) when configuring DR. Azure guarantees that paired regions are located at least 300 miles apart, updates are applied sequentially to prevent simultaneous outages, and data residency is respected.

Active-Passive Sizing: Size passive resources to run at the minimum possible footprint (e.g. Basic SQL SKU or single-instance VMSS) to minimize cost, but configure automation templates to scale compute scale-sets to production capacity upon failover.

Storage Account Replication: Use Read-Access Geo-Redundant Storage (RA-GRS) to make replicated storage endpoints readable in the secondary region before a failover is officially declared.

DNS TTL setting: Ensure Traffic Manager DNS TTL is set to 30 seconds or less to prevent clients from caching primary region IP addresses during an outage.`,
  comparisons: [
    {
      topic_a: "Active-Passive (Warm)",
      topic_b: "Active-Active (Hot)",
      summary: "Active-Passive routes all traffic to a primary region while running a scaled-down secondary region — lower run cost, but requires a failover event and has a higher RTO. Active-Active runs both regions at 100% capacity with global routing — near-zero RTO, but requires complex database replication (Cosmos DB multi-master/write) and double the baseline resource cost."
    }
  ],
  interview_answer: {
    response: [
      "For disaster recovery, I select paired regions (such as East US and West US) to leverage sequential platform updates and geographic separation.",
      "For Active-Passive architectures, I deploy secondary compute scale-sets at minimum sizing to control cost, but use automation to scale them up during failover. I use asynchronous database replication to keep data updated.",
      "For Active-Active architectures, I use Azure Front Door to distribute traffic based on latency and implement databases that support multi-region replication, like Cosmos DB, to avoid write-latency bottlenecks."
    ],
    why: "Regional pairing strategy and database latency controls are the critical decisions in global high-availability designs."
  },
  interview_kill_shot: "Active-Passive runs secondary region at minimum capacity to save costs — asynchronous data replication. Active-Active runs both regions active — requires multi-write databases (Cosmos DB) and Front Door global routing.",
  interactive_html: wrap("DR Architecture Selector", `
<div class="card">
  <h3>Input DR Requirements</h3>
  <label>Required Recovery Time (RTO)</label>
  <select id="rto">
    <option value="min">Minutes / Near-Zero</option>
    <option value="hour">15 - 60 Minutes</option>
  </select>
  <label>Target Recovery Point (RPO)</label>
  <select id="rpo">
    <option value="zero">Zero data loss (Sync)</option>
    <option value="async">Minutes (Async)</option>
  </select>
  <label>Budget Limit</label>
  <select id="budget">
    <option value="low">Cost-sensitive</option>
    <option value="high">Premium / High availability</option>
  </select>
  <button onclick="recommend()" style="margin-top:8px">Match DR Pattern</button>
</div>
<div id="result" class="card" style="display:none">
  <h3 id="patternTitle">Recommended Pattern</h3>
  <div id="patternDesc" style="font-size:12.5px;line-height:1.6"></div>
</div>
<script>
function recommend() {
  const rto = document.getElementById('rto').value;
  const rpo = document.getElementById('rpo').value;
  const budget = document.getElementById('budget').value;
  
  const result = document.getElementById('result');
  const title = document.getElementById('patternTitle');
  const desc = document.getElementById('patternDesc');
  result.style.display = 'block';
  
  if (rto === 'min' && rpo === 'zero' && budget === 'high') {
    title.textContent = 'Recommended Pattern: Active-Active (Hot Standby)';
    desc.innerHTML = \`
      <div class="ok">✅ Best fit for zero downtime requirements.</div>
      <p><strong>Architecture:</strong> Azure Front Door routes users to both East US and West US. Cosmos DB configured with multi-region write.</p>
      <p><strong>Azure Services:</strong> Azure Front Door, Multi-Region VMSS, Cosmos DB (Multi-Write).</p>
    \`;
  } else if (rto === 'hour' || budget === 'low') {
    title.textContent = 'Recommended Pattern: Active-Passive (Warm Standby)';
    desc.innerHTML = \`
      <div class="ok">✅ Best fit for cost-sensitive compliance.</div>
      <p><strong>Architecture:</strong> All traffic to East US. West US compute is pre-provisioned at minimum footprint. SQL database replicates asynchronously.</p>
      <p><strong>Azure Services:</strong> Traffic Manager, ASR (for VMs), SQL Geo-Replication (Async), Standard GRS Storage.</p>
    \`;
  } else {
    title.textContent = 'Recommended Pattern: Active-Passive (Cold Standby)';
    desc.innerHTML = \`
      <div class="ok">✅ Lowest cost backup strategy.</div>
      <p><strong>Architecture:</strong> Primary region runs. Secondary has zero active compute. VM backups are replicated to GRS storage. Compute is redeployed from code only during failover.</p>
      <p><strong>Azure Services:</strong> Azure Backup (GRS), Terraform IaC repositories, Azure Container Registry.</p>
    \`;
  }
}
</script>`)
},

// ═══════════════════════════════════════════════════════════════════
// SLIDE 16 — Failover — DNS & Traffic Manager
// ═══════════════════════════════════════════════════════════════════
{
  title: "Failover — DNS & Traffic Manager Routing",
  type: "DR — Traffic Redirection",
  difficulty: "Intermediate",
  chips: ["Traffic Manager", "DNS Failover", "Health Probes", "TTL", "ASR Failover", "Priority Routing"],
  schema: "architecture",
  definition: "Failover is the process of redirecting application traffic from an unhealthy primary region to a pre-defined healthy secondary disaster recovery region.",
  why_it_matters: "Setting a high DNS TTL (Time to Live) on your domain name records means clients will cache the failed primary IP address for hours, rendering automated routing failover useless.",
  real_world_scenario: "A primary web server cluster in East US fails due to a datacenter outage. Azure Traffic Manager must detect the failure within 30 seconds and update DNS responses to direct users to West US.",
  content_theory: `Here is a breakdown of how DNS-based failover works.

1. DNS-Level Redirection
Traffic Manager: A DNS-level traffic load balancer. It resolves client queries to the IP address of the primary or secondary region based on endpoint health. Traffic Manager does not see active traffic; it only directs client DNS resolution.

Best For: Hybrid endpoints or non-HTTP protocols requiring regional failover.
Requirements: Publicly reachable IP endpoints for health monitoring.
Core Azure Resources: Traffic Manager Profile, Traffic Manager Endpoints.

2. Routing Methods
Priority (Active-Passive): Traffic goes to endpoint 1 (highest priority). If endpoint 1 fails, traffic shifts to endpoint 2.
Weighted: Traffic split by percentages.
Performance: Traffic routes to the endpoint with the lowest network latency relative to the user's geographic location.`,
  content_implementation: `Forgetting to reduce DNS TTL to a low value (30 seconds) before updates is the most common reason failover drills fail — users continue hitting the cached dead IP.

Key Deployment Considerations:

DNS TTL (Time to Live): Configure Traffic Manager profile DNS TTL to 30 seconds (or less). This instructs client browsers and local DNS resolvers to query Traffic Manager frequently, ensuring rapid failover redirection.

Health Probe Interval: Set the probe interval to 10 seconds (Fast probing) and tolerated failures to 3. This detects an outage within 30 seconds. Standard probing (30-second interval) can take up to 2 minutes to trigger failover.

ASR Planned Failover: For virtual machine state, execute a 'Planned Failover' first. This shuts down the primary VM to sync the final storage writes, ensuring zero data loss before booting the secondary instance.

Public IP Requirement: Traffic Manager requires endpoints to have public IPs. For private VNets, utilize Azure DNS Private Resolver for internal DNS failover.`,
  architecture_flow: {
    steps: [
      "Client browser queries DNS for app.company.com",
      "DNS resolver forwards query to Traffic Manager namespace",
      "Traffic Manager health probe checks primary endpoint status",
      "If primary is healthy: TM returns Primary IP. TTL set to 30s",
      "If primary fails: TM detects outage, resolves query to Secondary IP",
      "Client connects directly to secondary region IP"
    ],
    diagram: "Client DNS -> Traffic Manager resolver -> Healthy Endpoint IP returned -> Direct Connection"
  },
  key_commands: [
    {
      command: `resource "azurerm_traffic_manager_profile" "tm" {
  name                   = "app-global-tm"
  resource_group_name    = azurerm_resource_group.rg.name
  traffic_routing_method = "Priority"

  dns_config {
    relative_name = "app-global"
    ttl           = 30
  }

  monitor_config {
    protocol            = "Https"
    port                = 443
    path                = "/health"
    interval_in_seconds = 10
    timeout_in_seconds  = 5
    tolerated_number_of_failures = 3
  }
}`,
      description: "Terraform: Traffic Manager profile configured with Priority routing, 30s DNS TTL, and Fast Https health probing (10s interval, 3 failures)."
    }
  ],
  interview_answer: {
    response: [
      "I use Azure Traffic Manager with Priority routing to manage failovers for Active-Passive architectures. It directs client DNS queries to the secondary region only when the primary fails.",
      "The critical configuration is setting a low DNS TTL of 30 seconds, combined with fast health probing (10-second intervals), so outages are detected and traffic is redirected within 30 seconds.",
      "For planned DR drills, I perform a graceful planned failover in ASR, which shuts down source VMs to replicate the final delta writes, preventing data loss."
    ],
    why: "TTL values and health probe intervals determine the overall failover execution time and compliance metrics."
  },
  interview_kill_shot: "DNS-level failover via Traffic Manager. Ensure DNS TTL is clamped to 30 seconds and health probes are configured to Fast (10-second intervals) to guarantee rapid traffic redirection.",
  interactive_html: wrap("Traffic Manager Failover Simulator", `
<div style="text-align:center;margin-bottom:12px">
  <button onclick="failPrimary()" id="failBtn">⚡ Fail Primary (East US)</button>
  <button onclick="reset()" style="background:#374151;margin-left:8px">↺ Restore Primary</button>
</div>
<div class="grid">
  <div class="card" style="text-align:center">
    <h3>Routing State</h3>
    <div id="state" style="font-size:24px;font-weight:bold;margin:15px 0">Normal (Primary)</div>
    <div id="ttl" style="font-size:12px;color:#94a3b8">DNS TTL: 30s (Cached)</div>
  </div>
  <div class="card">
    <h3>Endpoint Status</h3>
    <div style="display:flex;justify-content:space-between;padding:4px 0">
      <span>Primary (East US):</span><span id="pState" style="color:#34d399;font-weight:700">ONLINE</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:4px 0">
      <span>Secondary (West US):</span><span style="color:#34d399;font-weight:700">ONLINE</span>
    </div>
  </div>
</div>
<script>
let ttlVal = 30;
let primaryLive = true;
let timer = null;

function runTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    if (ttlVal > 0) {
      ttlVal--;
      document.getElementById('ttl').textContent = 'DNS TTL Cache: ' + ttlVal + 's remaining';
    } else {
      if (!primaryLive) {
        document.getElementById('state').textContent = 'Redirected (Secondary)';
        document.getElementById('state').style.color = '#f87171';
        document.getElementById('ttl').textContent = 'DNS cache updated to West US IP!';
      } else {
        document.getElementById('state').textContent = 'Normal (Primary)';
        document.getElementById('state').style.color = '#34d399';
        document.getElementById('ttl').textContent = 'DNS cache refreshed to East US IP.';
      }
    }
  }, 1000);
}

function failPrimary() {
  primaryLive = false;
  document.getElementById('pState').textContent = 'OFFLINE';
  document.getElementById('pState').style.color = '#f87171';
  ttlVal = 30; // Reset TTL countdown to show caching delay
  runTimer();
}

function reset() {
  primaryLive = true;
  document.getElementById('pState').textContent = 'ONLINE';
  document.getElementById('pState').style.color = '#34d399';
  ttlVal = 0; // Instant update for simulation simplicity
  document.getElementById('state').textContent = 'Normal (Primary)';
  document.getElementById('state').style.color = '#34d399';
  document.getElementById('ttl').textContent = 'DNS cache refreshed.';
  clearInterval(timer);
}
runTimer();
</script>`)
},

// ═══════════════════════════════════════════════════════════════════
// SLIDE 17 — Failback Testing
// ═══════════════════════════════════════════════════════════════════
{
  title: "Failback Testing — Operational Checklists",
  type: "DR — Post-Disaster Recovery",
  difficulty: "Advanced",
  chips: ["Failback", "Re-protect", "Commit Failback", "ASR Failback", "Post-DR Validation"],
  schema: "architecture",
  definition: "Failback testing is the process of returning production workloads from a temporary disaster recovery region back to the restored primary region.",
  why_it_matters: "Attempting to fail back database virtual machines without first initiating disk 'Re-protection' will run the secondary VMs without syncing changes, resulting in loss of all data written since the failover.",
  real_world_scenario: "Following a regional outage, an enterprise has been running in West US for 3 days. They must synchronize 50 GB of new transaction data back to East US and safely fail back without data loss.",
  content_theory: `Here is a breakdown of the ASR failback sequence.

1. The Failback Challenge
Unlike failover (which is an emergency response), failback is a planned maintenance window. Because the secondary DR region has been running and accepting new writes, the primary disks are now stale. Running a naive failback will overwrite secondary changes with stale primary data.

Best For: Restoring primary operations after disaster recovery.
Requirements: Re-protection of disks before execution.
Core Azure Resources: ASR Replication Group, Recovery Services Vault, Recovery Plan.

2. ASR Failback Sequence
Step 1: Re-protect: Reverse the replication direction. Data changes replicate from West US (Secondary) back to East US (Primary).
Step 2: Planned Failover (Failback): Shuts down West US compute, performs final delta write sync to East US, and boots East US compute.
Step 3: Commit: Locks in the failback. Removes temporary DR VM instances in West US.
Step 4: Re-protect: Reverse replication direction again, so East US (Primary) resumes replicating to West US (Secondary).`,
  content_implementation: `Forgetting to 'Commit' the failback leaves replication in a transient state — Azure will not allow you to run future failover tasks until the current failback is officially committed.

Key Deployment Considerations:

Re-Protect is Mandatory: Never bypass re-protection. This step calculates the byte-level diff between the active secondary disk and the stale primary disk, transferring only the delta writes to minimize bandwidth.

Test Failback Sandbox: Perform a Test Failback in an isolated network in the primary region before executing the actual planned failback. This ensures target networks and IP configurations boot successfully.

Application Validation: During the planned failback window, execute database integrity checks and application sanity checks before committing the failback. If issues are found, you can cancel the failback and return to the secondary region.

Scheduled Maintenance Window: Because planned failback requires shutting down the active DR VM to perform the final write sync, allocate a brief offline window for the final cutover.`,
  architecture_flow: {
    steps: [
      "Secondary region VM (West US) accepts writes during disaster",
      "Outage ends: Primary region (East US) resources are restored",
      "Trigger 'Re-protect' to copy West US changes back to East US",
      "Execute 'Planned Failback': West US VM shuts down gracefully",
      "Final delta writes are synchronized to East US disks",
      "East US VM boots up; traffic is redirected back to East US",
      "Trigger 'Commit' to lock in the primary execution state"
    ],
    diagram: "Secondary Running -> Re-protect -> Planned Failover (Shut down Secondary) -> Boot Primary -> Commit"
  },
  key_commands: [
    {
      command: `# Initiate re-protection to sync secondary changes back to primary
Start-AzRecoveryServicesAsrReprotectJob \`
  -ReplicatedItem $vmReplicatedItem \`
  -Direction RecoveryToPrimary`,
      description: "PowerShell: Start the re-protection job to synchronize delta writes back to the primary region."
    },
    {
      command: `# Execute the planned failback cutover
Start-AzRecoveryServicesAsrPlannedFailoverJob \`
  -ReplicatedItem $vmReplicatedItem \`
  -Direction RecoveryToPrimary`,
      description: "PowerShell: Run the planned failback to gracefully shut down the DR VM and boot the primary VM."
    }
  ],
  interview_answer: {
    response: [
      "Failback is a planned maintenance task, not an emergency cutover. The most critical step is running 'Re-protect' first to replicate data changes written in the DR region back to the primary region.",
      "I execute a Planned Failover for the failback. This shuts down the active secondary VMs, synchronizes the final delta writes to prevent data loss, and boots the primary VMs in East US.",
      "Once the application is validated, I call 'Commit' to lock in the state. Finally, I run 'Re-protect' again to resume replicating from the primary region to the secondary region."
    ],
    why: "Understanding the re-protect and commit phases is essential to prevent data loss and locking during recovery tasks."
  },
  interview_kill_shot: "Failback requires: Re-protect (sync secondary writes to primary) → Planned Failover (shut down secondary, boot primary) → Commit (lock in state) → Re-protect (resume primary-to-secondary sync).",
  interactive_html: wrap("Failback Sequence Stepper", `
<div class="card">
  <h3>Failback Step Guide</h3>
  <div id="stepContainer" style="display:flex;flex-direction:column;gap:8px">
    <div class="step-card" id="s1" style="border-left:4px solid #0078d4;padding:6px;background:#0f3460">
      <strong>1. Re-Protect (Recovery to Primary)</strong>
      <p style="margin:2px 0;font-size:11px">Reverse replication so new data streams back to primary region.</p>
      <button onclick="nextStep(2)">Complete Step 1</button>
    </div>
    <div class="step-card" id="s2" style="border-left:4px solid #475569;padding:6px;opacity:0.5">
      <strong>2. Planned Failback Cutover</strong>
      <p style="margin:2px 0;font-size:11px">Gracefully stop secondary VM, run final sync, boot primary.</p>
      <button onclick="nextStep(3)" id="btn2" disabled>Complete Step 2</button>
    </div>
    <div class="step-card" id="s3" style="border-left:4px solid #475569;padding:6px;opacity:0.5">
      <strong>3. Commit Failback</strong>
      <p style="margin:2px 0;font-size:11px">Acknowledge failback is successful and clean up secondary VM footprint.</p>
      <button onclick="nextStep(4)" id="btn3" disabled>Complete Step 3</button>
    </div>
    <div class="step-card" id="s4" style="border-left:4px solid #475569;padding:6px;opacity:0.5">
      <strong>4. Re-Protect (Primary to Recovery)</strong>
      <p style="margin:2px 0;font-size:11px">Resume replication from primary to secondary for future protection.</p>
      <button onclick="reset()" id="btn4" disabled>Reset Sequence</button>
    </div>
  </div>
</div>
<script>
function nextStep(step) {
  if (step === 2) {
    document.getElementById('s1').style.opacity = '0.5';
    document.getElementById('s1').style.borderLeftColor = '#34d399';
    document.getElementById('s2').style.opacity = '1';
    document.getElementById('s2').style.borderLeftColor = '#0078d4';
    document.getElementById('btn2').disabled = false;
  } else if (step === 3) {
    document.getElementById('s2').style.opacity = '0.5';
    document.getElementById('s2').style.borderLeftColor = '#34d399';
    document.getElementById('s3').style.opacity = '1';
    document.getElementById('s3').style.borderLeftColor = '#0078d4';
    document.getElementById('btn3').disabled = false;
  } else if (step === 4) {
    document.getElementById('s3').style.opacity = '0.5';
    document.getElementById('s3').style.borderLeftColor = '#34d399';
    document.getElementById('s4').style.opacity = '1';
    document.getElementById('s4').style.borderLeftColor = '#34d399';
    document.getElementById('btn4').disabled = false;
  }
}
function reset() {
  document.querySelectorAll('.step-card').forEach((el, idx) => {
    el.style.opacity = idx === 0 ? '1' : '0.5';
    el.style.borderLeftColor = idx === 0 ? '#0078d4' : '#475569';
  });
  document.getElementById('btn2').disabled = true;
  document.getElementById('btn3').disabled = true;
  document.getElementById('btn4').disabled = true;
}
</script>`)
},

// ═══════════════════════════════════════════════════════════════════
// SLIDE 18 — RPO & RTO Compliance
// ═══════════════════════════════════════════════════════════════════
{
  title: "RPO & RTO Compliance — Design Trade-offs",
  type: "DR — Compliance & SLAs",
  difficulty: "Advanced",
  chips: ["RPO", "RTO", "SLA", "Synchronous Replication", "Asynchronous Replication", "Cost vs Resilience"],
  schema: "architecture",
  definition: "RPO (Recovery Point Objective) defines maximum tolerable data loss during an outage; RTO (Recovery Time Objective) defines maximum tolerable system recovery duration.",
  why_it_matters: "Sourcing an architecture with a near-zero RPO/RTO target without deploying synchronous replication and hot standby compute results in immediate SLA breaches during a regional outage.",
  real_world_scenario: "A payment gateway requires an RPO of 0 (no data loss) and RTO under 5 minutes. The cloud architecture team must map these targets to specific Azure database and routing designs.",
  content_theory: `Here is a breakdown of how RPO and RTO map to Azure architectures.

1. RPO Tiers
Zero RPO (No Data Loss): Requires synchronous replication. Data must be written to both regions before the transaction is acknowledged. Introduce write latency.
Minutes RPO: Asynchronous replication (e.g., ASR for VMs, Azure SQL Geo-Replication).
Hours RPO: Restore from backup snapshots.

Best For: Designing highly resilient systems that meet regulatory and business SLAs.
Requirements: Matching budget alignment to the SLA requirements.
Core Azure Resources: Azure SQL DB, Cosmos DB, Azure Site Recovery.

2. RTO Tiers
Near-Zero RTO (Minutes): Active-Active multi-region deployment. Front Door handles instant redirect.
Minutes RTO: Active-Passive with warm standby (scaled down compute, pre-mounted disks).
Hours RTO: Cold standby (Compute is redeployed from Terraform/Backup).`,
  content_implementation: `Specifying 'Zero RPO' across all enterprise tiers is a common architecture budget mistake — synchronous replication is highly expensive and limited by physical speed of light latency.

Key Deployment Considerations:

Synchronous Database Replication: For RPO of 0, use Azure SQL DB Auto-Failover Groups in synchronous mode (within regional boundaries) or write to multiple regions using Cosmos DB strong consistency. Note that synchronous replication across regions separated by thousands of miles adds write latency.

Active-Active compute: For RTO < 5 minutes, run Active-Active scale-sets behind Azure Front Door. If a region goes down, Front Door redirects traffic instantly, avoiding compute boot times.

ASR Recovery RTO: ASR VM booting takes 5–15 minutes. Group VMs in Recovery Plans to orchestrate boot sequences and minimize manual intervention, optimizing RTO compliance.

Document actual DR run times: Measure and log actual RTO/RPO metrics during yearly DR drills to prove compliance to compliance auditors.`,
  comparisons: [
    {
      topic_a: "Synchronous Replication",
      topic_b: "Asynchronous Replication",
      summary: "Synchronous replication writes data to primary and secondary locations simultaneously before completing the transaction — guarantees zero data loss (RPO = 0), but limits performance due to write-latency overhead. Asynchronous replication writes to primary first, then replicates changes in the background — has near-zero latency impact, but risks data loss (RPO > 0) if a failure occurs before replication completes."
    }
  ],
  trade_offs: [
    {
      choice: "DR Strategy Cost vs RTO/RPO Metrics",
      advantages: [
        "Cold Standby: Lowest run cost — compute is only deployed when a disaster is declared.",
        "Warm Standby: Balanced cost/RTO — compute runs at minimal size, database is kept active.",
        "Hot Standby (Active-Active): Near-zero RTO, zero data loss possible with sync replication."
      ],
      disadvantages: [
        "Cold Standby: Highest RTO (hours to deploy compute), high RPO risk.",
        "Warm Standby: Lower database write throughput, requires failover orchestration.",
        "Hot Standby (Active-Active): Highest run cost (2x compute cost), complex database write management."
      ]
    }
  ],
  interview_answer: {
    response: [
      "RPO and RTO targets dictate the database replication and compute design. For an RPO of 0, I implement synchronous database replication. For RPO in minutes, asynchronous replication is cost-effective.",
      "For RTO under 5 minutes, I use Active-Active hot standbys behind Azure Front Door to redirect traffic instantly without VM boot delays. For less critical tiers, I use Warm Standby.",
      "I align the DR strategies to budget. I avoid using synchronous replication across long distances due to the speed-of-light write latency penalty."
    ],
    why: "SLA metrics and database write-latency limitations are the most critical decisions in DR design."
  },
  interview_kill_shot: "RPO 0 requires synchronous replication (strong consistency). RTO under 5 minutes requires Active-Active compute behind Azure Front Door. Scale strategies downward based on business SLA criticality.",
  interactive_html: wrap("RPO/RTO Compliance Calculator", `
<div class="card">
  <h3>Select Business SLA Targets</h3>
  <label>Max Data Loss Tolerated (RPO)</label>
  <select id="selRpo" onchange="check()">
    <option value="zero">Zero Data Loss (RPO = 0)</option>
    <option value="min">15 Minutes (ASR/Async)</option>
    <option value="hour">24 Hours (Backups)</option>
  </select>
  <label>Max Downtime Tolerated (RTO)</label>
  <select id="selRto" onchange="check()">
    <option value="zero">Under 5 Minutes (Hot)</option>
    <option value="min">30 Minutes (Warm)</option>
    <option value="hour">4 Hours (Cold)</option>
  </select>
  <button onclick="check()" style="margin-top:8px">Validate Architecture</button>
</div>
<div class="card" id="resCard" style="display:none">
  <h3>Compliance Mapping</h3>
  <div id="cost" style="font-weight:700;font-size:14px;margin-bottom:8px"></div>
  <div id="tech" style="font-size:12px;line-height:1.5"></div>
</div>
<script>
function check() {
  const rpo = document.getElementById('selRpo').value;
  const rto = document.getElementById('selRto').value;
  const res = document.getElementById('resCard');
  const cost = document.getElementById('cost');
  const tech = document.getElementById('tech');
  res.style.display = 'block';
  
  if (rpo === 'zero' && rto === 'zero') {
    cost.textContent = 'Cost Tier: PREMIUM ($$$)';
    cost.style.color = '#f87171';
    tech.innerHTML = \`
      <div class="warn">⚠ Speed of light latency: Requires synchronous replication across paired regions (e.g. SQL AlwaysOn Sync or Cosmos DB Strong).</div>
      <p><strong>Compute:</strong> Active-Active VMSS running in both regions with Front Door global routing.</p>
    \`;
  } else if (rpo === 'min' && rto === 'min') {
    cost.textContent = 'Cost Tier: MODERATE ($$)';
    cost.style.color = '#fbbf24';
    tech.innerHTML = \`
      <div class="ok">✅ Recommended baseline for standard enterprise apps.</div>
      <p><strong>Database:</strong> Asynchronous replication to secondary database instance.</p>
      <p><strong>Compute:</strong> Warm standby scale-sets running at minimal capacity.</p>
    \`;
  } else {
    cost.textContent = 'Cost Tier: LOW ($)';
    cost.style.color = '#34d399';
    tech.innerHTML = \`
      <div class="ok">✅ Safe for non-production / internal dev tools.</div>
      <p><strong>Database:</strong> Geo-redundant backups restored on demand.</p>
      <p><strong>Compute:</strong> Deployed from code during DR declaration.</p>
    \`;
  }
}
</script>`)
},

// ═══════════════════════════════════════════════════════════════════
// SLIDE 19 — Management Groups & Hierarchy
// ═══════════════════════════════════════════════════════════════════
{
  title: "Management Groups & Enterprise Hierarchy",
  type: "Governance — Subscription Architecture",
  difficulty: "Intermediate",
  chips: ["Management Groups", "Enterprise Hierarchy", "RBAC Inheritance", "Landing Zones", "CAF"],
  schema: "architecture",
  definition: "Azure Management Groups provide a governance hierarchy above subscriptions, allowing resource access policies and RBAC roles to be applied at scale and inherited downward.",
  why_it_matters: "Failing to implement a management group hierarchy means RBAC and Azure Policies must be assigned manually per subscription, creating security gaps as new workloads scale.",
  real_world_scenario: "An enterprise is adopting the Cloud Adoption Framework (CAF) and needs to structure their Tenant Root Group to manage identity, connectivity, and landing zones across 50 subscriptions.",
  content_theory: `Here is a breakdown of how Management Groups structure Azure environments.

1. Hierarchy Tiers
Tenant Root Group: The absolute root container. All subscriptions created in the tenant belong here by default.
Platform Group: Contains shared services subscriptions — Identity (domain controllers), Connectivity (hub VNet, ExpressRoute), and Management (log workspaces).
Landing Zones: Contains application-specific subscriptions (Corp for internal private apps, Online for public-facing websites).
Sandbox: Isolated subscriptions for developer experimentation, where strict cost caps and policy bypasses are permitted.

Best For: Scaling security policy enforcement and subscription access control.
Requirements: Maximum 6 levels of depth below the Tenant Root.
Core Azure Resources: Management Groups, Subscriptions, Policy assignments, RBAC role definitions.

2. Access & Policy Inheritance
Role-based Access Control (RBAC) and Azure Policy assignments applied to a Management Group automatically apply to all child groups, subscriptions, and resources. Inheritance cannot be blocked.`,
  content_implementation: `Never assign custom policies directly to individual subscriptions — assign policies at the Landing Zone Management Group level to guarantee all new subscriptions are secured automatically.

Key Deployment Considerations:

Cloud Adoption Framework (CAF) Align: Organize your management groups into Platform and Landing Zone roots. This isolates shared infrastructure (hub networking) from application workloads.

Limit Depth: Keep the hierarchy shallow. Although Azure supports up to 6 levels of depth, 3 or 4 levels are recommended to prevent complex policy debugging.

Inheritance Behavior: Understand that child subscriptions inherit all permissions and policy assignments from their parent groups. Access cannot be restricted at a lower level if it was allowed at a higher level.

New Subscription Placement: Configure your tenant settings to automatically assign new subscriptions to a default non-root management group (e.g. 'Decommissioned' or 'Quarantine') before they are vetted.`,
  architecture_flow: {
    steps: [
      "Administrator creates Management Group structure under Tenant Root",
      "Subscriptions are assigned to target Management Groups (e.g., Connectivity)",
      "Azure Policy initiative is assigned to Landing Zones Management Group",
      "Policy rules are evaluated for all resources in child subscriptions",
      "Developer attempts to deploy resource violating policy (e.g., public IP)",
      "Policy engine evaluates rule, blocks deployment, and logs event"
    ],
    diagram: "Tenant Root -> Landing Zones MG -> Subscription -> Resource Group -> Resource Policy Check"
  },
  key_commands: [
    {
      command: `resource "azurerm_management_group" "platform" {
  display_name               = "Platform-Services"
  name                       = "mg-platform"
  parent_management_group_id = azurerm_management_group.root.id
}

resource "azurerm_management_group" "connectivity" {
  display_name               = "Connectivity"
  name                       = "mg-connectivity"
  parent_management_group_id = azurerm_management_group.platform.id
  subscription_ids = [
    "00000000-0000-0000-0000-000000000000"
  ]
}`,
      description: "Terraform: Create Management Group hierarchy for Platform services and associate a connectivity subscription."
    }
  ],
  interview_answer: {
    response: [
      "I follow the Cloud Adoption Framework (CAF) landing zone architecture, organizing subscriptions into Platform, Landing Zones, and Sandbox Management Groups under the Tenant Root.",
      "Policies and RBAC are assigned at the Management Group level, ensuring that subscriptions and resources inherit these controls automatically as the environment scales.",
      "I keep the hierarchy shallow (3 to 4 levels) to maintain simple policy evaluation and prevent identity access governance loops."
    ],
    why: "Management group hierarchy design is the foundation of enterprise-scale landing zone compliance."
  },
  interview_kill_shot: "Enterprise subscription alignment via Management Groups. Place subscriptions into Platform (shared) and Landing Zone (workload) roots. Enforce RBAC and Azure Policies via inheritance at the MG level.",
  interactive_html: wrap("Management Group Hierarchy Builder", `
<div class="grid">
  <div>
    <div class="card">
      <h3>Add Management Node</h3>
      <label>Node Name</label>
      <input id="nodeName" value="LandingZones">
      <label>Parent Node</label>
      <select id="nodeParent">
        <option value="root">Tenant Root Group</option>
        <option value="platform">Platform (Shared)</option>
      </select>
      <button onclick="addNode()" style="margin-top:8px">Insert Node</button>
    </div>
  </div>
  <div>
    <div class="card">
      <h3>Hierarchy Map</h3>
      <div id="tree" style="font-family:monospace;font-size:12.5px;color:#7dd3fc">
        Tenant Root Group<br>
        ├── Platform (Shared)<br>
        │   └── Connectivity<br>
        └── Sandboxes
      </div>
    </div>
    <div class="card" id="tfCard" style="display:none">
      <h3>Terraform HCL</h3>
      <div class="pre" id="tfCode"></div>
    </div>
  </div>
</div>
<script>
const customNodes = [];
function addNode() {
  const name = document.getElementById('nodeName').value.trim();
  const parent = document.getElementById('nodeParent').value;
  if (!name) return;
  customNodes.push({ name, parent });
  render();
}
function render() {
  const tree = document.getElementById('tree');
  const tfCard = document.getElementById('tfCard');
  const tf = document.getElementById('tfCode');
  
  let mapText = 'Tenant Root Group\\n├── Platform (Shared)\\n│   ├── Connectivity\\n';
  customNodes.filter(n => n.parent === 'platform').forEach(n => {
    mapText += '│   └── ' + n.name + '\\n';
  });
  mapText += '└── Sandboxes\\n';
  customNodes.filter(n => n.parent === 'root').forEach(n => {
    mapText += '└── ' + n.name + '\\n';
  });
  
  tree.textContent = mapText;
  
  tfCard.style.display = 'block';
  tf.textContent = customNodes.map(function(node) {
    return 'resource "azurerm_management_group" "' + node.name.toLowerCase() + '" {\\\\n  display_name = "' + node.name + '"\\\\n  parent_management_group_id = "' + (node.parent === 'root' ? 'tenant-root-id' : 'platform-group-id') + '"\\\\n}';
  }).join('\\\\n\\\\n');
}
</script>`)
},

// ═══════════════════════════════════════════════════════════════════
// SLIDE 20 — Subscription Governance & Azure Policy
// ═══════════════════════════════════════════════════════════════════
{
  title: "Subscription Governance & Azure Policy",
  type: "Governance — Policy & Enforcement",
  difficulty: "Advanced",
  chips: ["Azure Policy", "Governance", "Initiatives", "Remediation", "DeployIfNotExists", "Security Benchmark"],
  schema: "architecture",
  definition: "Azure Policy evaluates resources in Azure by comparing their properties to business rules defined in JSON format, enforcing compliance at scale.",
  why_it_matters: "Deploying governance rules using simple 'Deny' effects without configuring 'DeployIfNotExists' remediation rules leaves existing non-compliant resources exposed, creating configuration drift.",
  real_world_scenario: "An enterprise needs to guarantee that all storage accounts require secure transfer (HTTPS) and that all VNet resources automatically log metrics to a centralized workspace.",
  content_theory: `Here is a breakdown of how Azure Policy enforces governance.

1. Policy Anatomy & Effects
Definition: The JSON file containing the conditional rules (e.g. if field location != East US).
Assignment: Applying the policy definition to a scope (Management Group, Subscription, Resource Group).
Initiatives: A logical group of policy definitions (e.g. ASB - Azure Security Benchmark).

Best For: Continuous compliance auditing and automated infrastructure remediation.
Requirements: Assignment access at the target scope.
Core Azure Resources: Policy Definition, Policy Initiative, Policy Assignment, Remediation Task.

2. Policy Effects
Deny: Blocks the resource creation or update if it violates the policy.
Audit: Allows creation but logs the resource as non-compliant.
DeployIfNotExists: Automatically deploys a dependent resource (e.g. diagnostics) if missing.
Modify: Adds or overrides fields (e.g., tags) during resource deployment.`,
  content_implementation: `Assigning wide-scope 'Deny' effects on tags is the most common cause of CI/CD pipeline breaks — developers will find their deployments blocked if third-party tools fail to supply the expected tags.

Key Deployment Considerations:

DeployIfNotExists (DINE) for Logging: Enforce Diagnostic Settings collection on all resources using a DINE policy. This automatically provisions the log config when a developer creates a storage account or database.

Start with Audit Mode: Always roll out new custom policies in Audit mode. Review compliance logs in the Azure Policy dashboard to confirm that existing resources are identified without disrupting deployments, then switch to Deny mode.

Initiatives over Policies: Assign Initiatives (group of policies) rather than individual policies. This simplifies compliance reporting and minimizes assignment limit overhead.

Remediation Tasks: For existing non-compliant resources, configure a Policy Remediation Task. This applies the DINE or Modify effects retrospectively to bring the environment into compliance.`,
  comparisons: [
    {
      topic_a: "Azure Policy",
      topic_b: "Azure RBAC",
      summary: "Azure Policy enforces resource properties and configuration states (e.g. secure transfer settings, tag existence, disallowed VM sizes) to ensure system state compliance, regardless of who makes the change. Azure RBAC controls identity access and operations (e.g. permission to delete a resource group or read Key Vault secrets) by authorizing specific security principals at explicit scopes."
    }
  ],
  trade_offs: [
    {
      choice: "Policy Effect Selection: Deny vs DeployIfNotExists (DINE)",
      advantages: [
        "Deny: Instant compliance block — guarantees that no invalid resource enters the subscription.",
        "DINE: Automatic self-healing — provisions required sub-resources (like logging) without blocking the developer's deployment."
      ],
      disadvantages: [
        "Deny: Disrupts CI/CD pipelines if tags or configurations are slightly off.",
        "DINE: Requires managed identity permissions to run templates, increasing configuration complexity."
      ]
    }
  ],
  key_commands: [
    {
      command: `resource "azurerm_subscription_policy_assignment" "secure_storage" {
  name                 = "enforce-secure-storage"
  subscription_id      = "/subscriptions/00000000-0000-0000-0000-000000000000"
  policy_definition_id = "/providers/Microsoft.Authorization/policyDefinitions/404c3081-512d-4ab8-bc9e-2ddf5e94b8e4"
  display_name         = "Enforce HTTPS on Storage Accounts"

  parameters = <<PARAMETERS
{
  "effect": {
    "value": "Deny"
  }
}
PARAMETERS
}`,
      description: "Terraform: Assign the built-in policy enforcing secure HTTP transfers on storage accounts at the subscription scope."
    }
  ],
  interview_answer: {
    response: [
      "I use Azure Policy to govern environments at scale. I group policies into Initiatives, such as the Azure Security Benchmark, and assign them at the Management Group level.",
      "For logging and configuration baselines, I use DeployIfNotExists policies. This automatically provisions settings, like diagnostic logging to a Log Analytics Workspace, when developers deploy resources.",
      "I test new policies in Audit mode before switching to Deny. This prevents breaking CI/CD pipelines and allows me to review existing compliance issues first."
    ],
    why: "Policy effects management and rollouts are critical to balance security compliance and developer productivity."
  },
  interview_kill_shot: "Group policies into Initiatives assigned at the Management Group. Use DeployIfNotExists for automated self-healing. Always baseline new policies in Audit mode before moving to Deny.",
  interactive_html: wrap("Policy Effect Simulator", `
<div class="card">
  <h3>Select Policy Configuration</h3>
  <label>Policy Effect</label>
  <select id="pEffect" onchange="runSim()">
    <option value="deny">Deny</option>
    <option value="dine">DeployIfNotExists (DINE)</option>
    <option value="audit">Audit</option>
  </select>
  <label>Resource Deployment Action</label>
  <select id="pAction" onchange="runSim()">
    <option value="bad">Create storage account without HTTPS enabled</option>
    <option value="good">Create storage account with HTTPS enabled</option>
  </select>
  <button onclick="runSim()" style="margin-top:8px">Simulate ARM Request</button>
</div>
<div class="card" id="resCard" style="display:none">
  <h3>ARM Evaluation Trace</h3>
  <div id="status" style="font-weight:700;font-size:15px;margin-bottom:8px"></div>
  <div id="flow" style="font-size:12px;line-height:1.5"></div>
</div>
<script>
function runSim() {
  const eff = document.getElementById('pEffect').value;
  const act = document.getElementById('pAction').value;
  const res = document.getElementById('resCard');
  const status = document.getElementById('status');
  const flow = document.getElementById('flow');
  res.style.display = 'block';
  
  if (act === 'good') {
    status.textContent = 'Deployment Status: ALLOWED (Compliant)';
    status.style.color = '#34d399';
    flow.innerHTML = \`
      <div class="ok">1. Request submitted to ARM API.</div>
      <div class="ok">2. Policy engine evaluates resources → Compliant.</div>
      <div class="ok">3. Resource successfully provisioned in Resource Group.</div>
    \`;
  } else {
    // Bad resource
    if (eff === 'deny') {
      status.textContent = 'Deployment Status: BLOCKED (Policy Deny)';
      status.style.color = '#f87171';
      flow.innerHTML = \`
        <div class="ok">1. Request submitted to ARM API.</div>
        <div class="err">2. Policy engine detects violation of HTTPS rule.</div>
        <div class="err">3. ARM blocks deployment with HTTP 409 Conflict. Deployment fails.</div>
      \`;
    } else if (eff === 'dine') {
      status.textContent = 'Deployment Status: ALLOWED & REMEDIATED';
      status.style.color = '#fbbf24';
      flow.innerHTML = \`
        <div class="ok">1. Request submitted to ARM API.</div>
        <div class="warn">2. Policy engine detects storage account misses secure transfer configuration.</div>
        <div class="ok">3. Storage account is created.</div>
        <div class="warn">4. DINE policy triggers remediation task asynchronously, deploying the fix template.</div>
      \`;
    } else {
      status.textContent = 'Deployment Status: ALLOWED (Non-Compliant Alert)';
      status.style.color = '#7dd3fc';
      flow.innerHTML = \`
        <div class="ok">1. Request submitted to ARM API.</div>
        <div class="warn">2. Policy engine detects violation of HTTPS rule.</div>
        <div class="ok">3. Resource is created successfully.</div>
        <div class="warn">4. Resource is flagged as non-compliant in the Azure Policy dashboard.</div>
      \`;
    }
  }
}
</script>`)
}

]; // END slides 11-20

// Combine slides 1-10 and slides 11-20
const allSlides = [...slides1to10, ...newSlides];

const outPath = path.join(__dirname, 'infra_azure.json');
fs.writeFileSync(outPath, JSON.stringify(allSlides, null, 2), 'utf8');

console.log(`✅ Successfully combined and written ${allSlides.length} slides to infra_azure.json`);
console.log(`   File size: ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB`);
