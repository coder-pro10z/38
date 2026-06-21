// generate_infra_azure_json_part3.js
// Run: node generate_infra_azure_json_part3.js
// Output: Appends slides 21-29 to infra_azure.json

const fs = require('fs');
const path = require('path');

// ─── CANVAS HTML HELPERS ────────────────────────────────────────────────────
const darkBase = `body{margin:0;font-family:'Segoe UI',sans-serif;background:#1a1a2e;color:#e2e8f0;padding:16px;box-sizing:border-box}`;
const azureBtn = `button{background:#0078d4;color:#fff;border:none;border-radius:6px;padding:8px 16px;cursor:pointer;font-size:13px;font-weight:600}button:hover{background:#005a9e}`;
const card = `.card{background:#16213e;border:1px solid #0f3460;border-radius:8px;padding:14px;margin-bottom:12px}`;
const label = `label{font-size:12px;color:#94a3b8;display:block;margin-bottom:4px}`;
const input = `input,select{width:100%;padding:7px 10px;background:#0f3460;border:1px solid #1e4a8a;border-radius:5px;color:#e2e8f0;font-size:13px;box-sizing:border-box;margin-bottom:10px}`;
const pre = `.pre{background:#0f3460;border-radius:6px;padding:12px;font-family:monospace;font-size:12px;white-space:pre;overflow-x:auto;color:#7dd3fc}`;

const wrap = (title, body, style = '') =>
  `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title><style>${darkBase}${azureBtn}${card}${label}${input}${pre}h2{margin:0 0 12px;font-size:16px;color:#0078d4}h3{margin:6px 0;font-size:13px;color:#7dd3fc}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ok{color:#34d399}.err{color:#f87171}.warn{color:#fbbf24}${style}</style></head><body><h2>${title}</h2>${body}</body></html>`;

// Read current slides (1-20)
const azureJsonPath = path.join(__dirname, 'infra_azure.json');
let baseSlides = [];
try {
  baseSlides = JSON.parse(fs.readFileSync(azureJsonPath, 'utf8'));
  console.log(`✅ Loaded ${baseSlides.length} base slides from infra_azure.json`);
} catch (e) {
  console.error("❌ Could not read infra_azure.json. Make sure to run generate_infra_azure_json_part2.js first!");
  process.exit(1);
}

// Slice to maximum 20 to ensure we don't accidentally accumulate duplicates on repeated runs
if (baseSlides.length > 20) {
  console.log(`⚠️ Database contains ${baseSlides.length} slides. Resetting to first 20 before appending.`);
  baseSlides = baseSlides.slice(0, 20);
}

// Note: The array below contains slides 21-29 (8 original + 1 new FAQ slide)

const slides21to29 = [
  // ═══════════════════════════════════════════════════════════════════
  // SLIDE 21 — Azure Landing Zones & Subscriptions
  // ═══════════════════════════════════════════════════════════════════
  {
    title: "Azure Landing Zones & Subscriptions",
    type: "Architecture — Landing Zones & Governance",
    difficulty: "Advanced",
    chips: ["Landing Zones", "Management Groups", "CAF", "Subscription Segregation"],
    schema: "architecture",
    definition: "Azure Landing Zones provide a structured, multi-subscription environment aligned with Microsoft's Cloud Adoption Framework (CAF) to enable governance, security, and networking controls at scale.",
    why_it_matters: "Without a structured landing zone, resource limits and security boundaries break down as organizations grow, leading to public exposures, overlapping IP addresses, and operational chaos.",
    real_world_scenario: "An enterprise is migrating its digital assets to Azure. They need a hub-and-spoke landing zone architecture that isolates development and production subscriptions while enforcing shared identity and security baselines.",
    content_theory: `Azure landing zone architecture is designed to handle governance and scale through subscription democratization and policy-driven control.

1. Cloud Adoption Framework (CAF) Hierarchy
Tenant Root Group: The top-level container. Holds root administrative roles.
Platform Management Group: Contains platform-wide shared subscriptions:
- Connectivity (Hub VNets, Firewalls, ExpressRoute, VPNs)
- Identity (Domain controllers, Entra Connect, Active Directory)
- Management (Log Analytics workspace, monitoring alerts, automation accounts)
Landing Zones Management Group: Houses application workloads. Segregates internal (Corp) and public-facing (Online) environments.
Sandbox Management Group: Completely isolated subscriptions for testing. No connectivity to corp networks.

2. Subscription Segregation
Always isolate Production workloads in dedicated subscriptions distinct from Development/UAT. This enforces strict security boundaries, prevents dev testing from consuming production API limits or compute quotas, and simplifies FinOps billing allocations.

3. VNet Peering: Regional vs. Global
- Regional Peering: Connects virtual networks within the same Azure region. Traffic stays within the regional physical switches, providing the lowest possible latency and maximum throughput.
- Global Peering: Connects virtual networks across different Azure regions. Traffic traverses the Microsoft global backbone WAN instead of routing via the public internet. Useful for multi-region architectures and global failover topologies.
Both peering types allow VM communication using internal private IPs without gateways, encryption overhead, or public internet transit.`,
    content_implementation: `Placing all resources under a single subscription is a critical anti-pattern — enforce subscription-level isolation early to prevent quota exhaustion and security overlaps.

Key Deployment Considerations:

Establish MG Hierarchy Early: Define root, platform, landing-zones, and sandbox management groups using IaC before deploying subscriptions.

Apply Policy at Management Groups: Assign common compliance standards (e.g. ISO 27001, PCI DSS) at the Landing Zones Management Group level so all child subscriptions automatically inherit the rules.

Shared Services Isolation: Separate networking (Connectivity VNet) and logging (Management LAW) into dedicated subscriptions. Spoke subscriptions peer back to connectivity for gateway transit.`,
    architecture_flow: {
      steps: [
        "Request submitted to provision a new workload subscription",
        "Landing Zone Vending Machine creates subscription via API",
        "Subscription is placed under Landing Zones -> Corp Management Group",
        "Azure Policy engine automatically applies governance blueprints",
        "VNet peering establishes tunnel to Connectivity Hub VNet in hub subscription"
      ],
      diagram: "Tenant Root -> Platform & Landing Zones MGs -> Connectivity/Workload Subs -> Hub/Spoke Peering"
    },
    comparisons: [
      {
        topic_a: "Terraform",
        topic_b: "Bicep / ARM Templates",
        summary: "Terraform is a cloud-agnostic Infrastructure as Code tool that manages state files to track resource configurations, enabling multi-cloud automation. Bicep and ARM templates are Azure-native, declarative tools that do not manage state files (Azure itself holds state), offer zero-day support for new Azure services, and require no configuration for state locking."
      }
    ],
    key_commands: [
      {
        command: `resource "azurerm_management_group" "root" {
  display_name = "Enterprise-Root"
}

resource "azurerm_management_group" "landing_zones" {
  display_name               = "Landing-Zones"
  parent_management_group_id = azurerm_management_group.root.id
}`,
        description: "Terraform: Provision a hierarchical Management Group structure representing a landing zone tree."
      }
    ],
    interview_answer: {
      response: [
        "I implement Enterprise-Scale Landing Zones using Cloud Adoption Framework (CAF) guidelines. I separate platform shared services (connectivity, identity, management) from application landing zones.",
        "I segregate workloads at the subscription level rather than the resource group level to enforce strict security boundaries, isolate costs, and prevent API rate-limiting issues.",
        "I manage governance by applying Azure policies and RBAC roles at the Management Group scope, ensuring all child subscriptions inherit the guardrails automatically."
      ],
      why: "Subscription democratization and Management Group inheritance are the building blocks of governance in Azure."
    },
    interview_kill_shot: "CAF Landing Zones with Management Group hierarchy, subscription segregation for Prod vs. Non-Prod, and platform-shared connectivity, governed via Azure Policy inherited from the MG level.",
    interactive_html: wrap("Landing Zone Topology Designer", `
<div class="grid">
  <div class="card">
    <h3>Configure Topology</h3>
    <label>Select Management Group</label>
    <select id="mgSelect" onchange="updateDesign()">
      <option value="platform">Platform (Connectivity, Identity)</option>
      <option value="landingzones">Landing Zones (Corp, Online)</option>
      <option value="sandbox">Sandbox (Isolated Testing)</option>
    </select>
    
    <label>Deployment Environment</label>
    <select id="envSelect" onchange="updateDesign()">
      <option value="prod">Production</option>
      <option value="nonprod">Non-Production</option>
    </select>
    
    <label>Action</label>
    <button onclick="deploySub()" style="width:100%">Create & Bind Subscription</button>
    <button onclick="clearAll()" style="width:100%;margin-top:6px;background:#c22e2e">Reset Hierarchy</button>
  </div>
  
  <div class="card">
    <h3>Visual Tree Hierarchy</h3>
    <div id="treeArea" style="background:#0f3460;padding:12px;border-radius:6px;min-height:180px;font-family:monospace;font-size:12px;line-height:1.6">
    </div>
  </div>
</div>
<div class="card">
  <h3>Terraform Output</h3>
  <div class="pre" id="tfOutput"># Hierarchy configurations will render here...</div>
</div>
<script>
let items = {
  platform: [],
  landingzones: [],
  sandbox: []
};
function deploySub() {
  const mg = document.getElementById('mgSelect').value;
  const env = document.getElementById('envSelect').value;
  const name = env.toUpperCase() + '-' + mg.substring(0,4).toUpperCase() + '-sub-' + (items[mg].length + 1);
  
  // Validation Check
  if (mg === 'sandbox' && env === 'prod') {
    alert("❌ Security Block: Production subscriptions are not allowed in the Sandbox management group!");
    return;
  }
  
  items[mg].push(name);
  updateDesign();
}
function clearAll() {
  items = { platform: [], landingzones: [], sandbox: [] };
  updateDesign();
}
function updateDesign() {
  const tree = document.getElementById('treeArea');
  const tf = document.getElementById('tfOutput');
  
  let treeHtml = '<div>📁 Tenant Root Group</div>';
  treeHtml += '<div>&nbsp;&nbsp;├── 📁 Platform MG</div>';
  if (items.platform.length === 0) treeHtml += '<div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── <i>(Empty)</i></div>';
  items.platform.forEach(s => {
    treeHtml += '<div class="ok">&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── 📄 ' + s + '</div>';
  });
  
  treeHtml += '<div>&nbsp;&nbsp;├── 📁 Landing Zones MG</div>';
  if (items.landingzones.length === 0) treeHtml += '<div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── <i>(Empty)</i></div>';
  items.landingzones.forEach(s => {
    treeHtml += '<div class="ok">&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── 📄 ' + s + '</div>';
  });
  
  treeHtml += '<div>&nbsp;&nbsp;└── 📁 Sandbox MG</div>';
  if (items.sandbox.length === 0) treeHtml += '<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── <i>(Empty)</i></div>';
  items.sandbox.forEach(s => {
    treeHtml += '<div class="warn">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── 📄 ' + s + '</div>';
  });
  
  tree.innerHTML = treeHtml;
  
  // Generate TF
  let tfCode = '# Terraform generated Management Groups and Subscriptions\\n';
  tfCode += 'resource "azurerm_management_group" "root" {\\n  display_name = "Tenant-Root"\\n}\\n\\n';
  for (const [mg, subs] of Object.entries(items)) {
    if (subs.length > 0) {
      tfCode += 'resource "azurerm_management_group" "' + mg + '" {\\n';
      tfCode += '  display_name               = "' + mg.toUpperCase() + '"\\n';
      tfCode += '  parent_management_group_id = azurerm_management_group.root.id\\n';
      tfCode += '}\\n\\n';
      
      subs.forEach(s => {
        tfCode += 'resource "azurerm_subscription" "' + s.toLowerCase().replace(/-/g, '_') + '" {\\n';
        tfCode += '  subscription_name = "' + s + '"\\n';
        tfCode += '  billing_scope_id  = "/providers/Microsoft.Billing/billingAccounts/default"\\n';
        tfCode += '}\\n\\n';
      });
    }
  }
  tf.textContent = tfCode;
}
updateDesign();
</script>`)
  },

  // ═══════════════════════════════════════════════════════════════════
  // SLIDE 22 — Compute Resiliency & Scaling (VM/VMSS)
  // ═══════════════════════════════════════════════════════════════════
  {
    title: "Compute Resiliency & Scaling (VM/VMSS)",
    type: "Compute — High Availability & Auto-scaling",
    difficulty: "Advanced",
    chips: ["VMSS", "Availability Sets", "Availability Zones", "Autoscaling", "Ephemeral OS"],
    schema: "architecture",
    definition: "Azure compute resiliency ensures workload availability through Availability Sets, Availability Zones, and scale-out automation via Virtual Machine Scale Sets (VMSS).",
    why_it_matters: "Failing to design compute for regional or zone failure results in downtime during Azure platform updates or local facility power cuts, violating corporate SLAs.",
    real_world_scenario: "A highly trafficked e-commerce application experiences wild demand fluctuations. The infrastructure must handle peak hours automatically and survive a zone outage without dropped transactions.",
    content_theory: `Resilient compute architecture rests on platform isolation and horizontal scaling.

1. Resiliency Options
Availability Sets: Isolates VM placement to separate racks within a datacenter. Guarantees protection against localized hardware/power failures. Includes Fault Domains (FD) and Update Domains (UD). SLA: 99.95%.
Availability Zones: Distributes VMs across three physically separate datacenters in a region. Protects against datacenter facility failure (power, cooling, network). SLA: 99.99%.

2. Virtual Machine Scale Sets (VMSS)
VMSS allows you to deploy and manage a group of load-balanced, identical VMs. Scale-out and scale-in rules can add/remove VMs dynamically based on CPU/memory utilization thresholds, minimizing cost during low-use windows.`,
    content_implementation: `Manually resizing single VMs during load spikes is inefficient — always use VMSS with automatic scale profiles and health probes in production.

Key Deployment Considerations:

Automatic OS Upgrades: Enable automatic OS upgrades on VMSS. Azure applies updates in batches (rolling upgrade policy) to keep the app online.

Ephemeral OS Disks: Use Ephemeral OS Disks for stateless workloads (like VMSS scale nodes or AKS agents). They are written directly to local host temp storage, avoiding network latency to storage accounts and reducing costs.

Zone Redundancy: Configure VMSS to distribute instances evenly across 3 Availability Zones. Link it to a Zone-Redundant Load Balancer.`,
    comparisons: [
      {
        topic_a: "Availability Set",
        topic_b: "Availability Zone",
        summary: "Availability Sets protect applications from hardware failures within a single datacenter by distributing VMs across logical Update Domains (UD) and Fault Domains (FD) (SLA: 99.95%). Availability Zones protect applications from entire datacenter failures by distributing VMs across physically separate, independent datacenter facilities within the same region (SLA: 99.99%)."
      }
    ],
    key_commands: [
      {
        command: `resource "azurerm_orchestrated_virtual_machine_scale_set" "web" {
  name                = "web-vmss"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Standard_D2s_v5"
  instances           = 3
  zones               = ["1", "2", "3"]
  
  os_profile {
    linux_configuration {
      admin_username = "azureuser"
      admin_ssh_key {
        username   = "azureuser"
        public_key = file("~/.ssh/id_rsa.pub")
      }
    }
  }
}`,
        description: "Terraform: Deploy a zone-redundant VMSS distributed across 3 Availability Zones in orchestrated mode."
      }
    ],
    interview_answer: {
      response: [
        "I design compute HA using Availability Zones (replicated across datacenters) for a 99.99% SLA, rather than Availability Sets (replicated across racks in a single datacenter) which only offer 99.95%.",
        "For stateless scaling workloads, I deploy VMSS with Ephemeral OS disks. This provides fast boot times, removes storage network dependency, and reduces costs.",
        "I configure automatic OS image upgrades with health probes so the platform rolls out patches incrementally, aborting the rollout if health checks fail."
      ],
      why: "Differentiating between Availability Sets and Zones, and leveraging VMSS automation, defines compute architecture maturity."
    },
    interview_kill_shot: "Availability Zones for physical datacenter separation (99.99% SLA), VMSS auto-scaling for workload fluctuations, and Ephemeral OS disks for stateless instances to eliminate storage costs.",
    interactive_html: wrap("Compute SLA & VMSS Scale Simulator", `
<div class="grid">
  <div class="card">
    <h3>SLA Resiliency Planner</h3>
    <label>Deployment Option</label>
    <select id="slaSelect" onchange="calcSla()">
      <option value="single">Single VM (Standard HDD)</option>
      <option value="single_ssd">Single VM (Premium SSD)</option>
      <option value="avset">Availability Set (Multiple VMs)</option>
      <option value="avzone">Availability Zones (Multi-Zone)</option>
    </select>
    <div id="slaResult" style="margin-top:10px;font-size:13px"></div>
  </div>
  
  <div class="card">
    <h3>VMSS Autoscaling Simulator</h3>
    <label>Simulated CPU Load: <span id="loadVal" style="font-weight:bold;color:#7dd3fc">20%</span></label>
    <input type="range" id="loadSlider" min="10" max="100" value="20" oninput="simScale(this.value)">
    <div id="vmssResult" style="margin-top:10px;font-size:13px"></div>
  </div>
</div>

<div class="card">
  <h3>Active Compute Instances</h3>
  <div id="instanceArea" style="display:flex;gap:10px;flex-wrap:wrap">
  </div>
</div>
<script>
function calcSla() {
  const opt = document.getElementById('slaSelect').value;
  const res = document.getElementById('slaResult');
  let sla = '95.0%';
  let desc = '';
  
  if (opt === 'single') {
    sla = '95.0%';
    desc = 'Allowed Downtime: ~18 days/year. Basic storage has no SLA guarantees.';
  } else if (opt === 'single_ssd') {
    sla = '99.9%';
    desc = 'Allowed Downtime: ~8.7 hours/year. Requires Premium SSD OS disk.';
  } else if (opt === 'avset') {
    sla = '99.95%';
    desc = 'Allowed Downtime: ~4.3 hours/year. Protects against hardware rack failures.';
  } else {
    sla = '99.99%';
    desc = 'Allowed Downtime: ~52 minutes/year. Protects against full datacenter outages.';
  }
  
  res.innerHTML = '<div style="font-size:16px;font-weight:bold" class="warn">SLA: ' + sla + '</div><div>' + desc + '</div>';
}

function simScale(val) {
  document.getElementById('loadVal').textContent = val + '%';
  const area = document.getElementById('instanceArea');
  const vmssRes = document.getElementById('vmssResult');
  
  let count = 2;
  if (val > 80) count = 5;
  else if (val > 50) count = 3;
  
  vmssRes.innerHTML = 'Active Instance Count: <strong>' + count + '</strong>' + 
    (count > 2 ? ' <span class="ok">(Scaled Out due to CPU > 50%)</span>' : ' <span class="warn">(Running at minimum baseline)</span>');
  
  let boxes = '';
  for(let i=1; i<=count; i++) {
    boxes += \`
      <div style="background:#0f3460;border:1px solid #1e4a8a;border-radius:6px;padding:8px 12px;text-align:center;width:80px">
        <div style="font-size:24px">🖥️</div>
        <div style="font-size:10px;color:#94a3b8">vmss-node-\${i}</div>
        <div style="font-size:9px;color:#34d399;font-weight:bold">HEALTHY</div>
      </div>
    \`;
  }
  area.innerHTML = boxes;
}
calcSla();
simScale(20);
</script>`)
  },

  // ═══════════════════════════════════════════════════════════════════
  // SLIDE 23 — Azure Storage Redundancy & Security
  // ═══════════════════════════════════════════════════════════════════
  {
    title: "Azure Storage Redundancy & Security",
    type: "Storage — Replication & Data Governance",
    difficulty: "Intermediate",
    chips: ["Azure Storage", "LRS", "ZRS", "GRS", "SAS", "CMK"],
    schema: "architecture",
    definition: "Azure Storage redundancy protects data from drive, server, facility, or regional failure, while integrated security protocols govern access credentials and encryption keys.",
    why_it_matters: "Misconfiguring storage replication leaves data vulnerable to single-datacenter loss, while exposing static access keys risks complete corporate data exfiltration.",
    real_world_scenario: "An insurance firm stores critical medical records in Azure. The design must ensure data persists during a regional disaster and restrict external application access to short-lived, read-only permissions.",
    content_theory: `Azure storage leverages geographic replication and cryptography to secure unstructured data.

1. Redundancy Levels
LRS (Locally Redundant): Replicates data 3 times inside a single datacenter. Protects against disk/hardware failure.
ZRS (Zone-Redundant): Replicates data across 3 separate zones in a region. Protects against datacenter failure.
GRS (Geo-Redundant): Replicates data asynchronously to a paired secondary region. Protects against regional disaster.
RA-GRS (Read-Access Geo-Redundant): Adds read-only access to the secondary region endpoint.

2. Access Security & SAS Tokens
Never share Storage Account Access Keys. If compromised, they grant full admin access. Instead, use Shared Access Signatures (SAS) representing time-bound, permission-scoped credentials. Generate **User Delegation SAS tokens** using Entra ID credentials for auditability.`,
    content_implementation: `Sharing storage account keys in application configurations is a massive security leak — enforce Entra ID authentication and use SAS tokens.

Key Deployment Considerations:

Disable Shared Key Access: Configure the storage account property \`allow_shared_key_access = false\` to force Entra ID authentication.

Customer-Managed Keys (CMK): Enforce encryption at rest using CMKs hosted in Azure Key Vault rather than Microsoft-Managed Keys (MMK) to control key rotation and access policies.

Private Network Access: Configure Storage Firewall to restrict access to trusted subnets and disable public access. Use Private Endpoints for application access.`,
    key_commands: [
      {
        command: `resource "azurerm_storage_account" "secure_store" {
  name                     = "prodsecuresa1"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "ZRS"
  
  allow_nested_items_to_be_public = false
  shared_access_key_enabled       = false
  public_network_access_enabled   = false
}`,
        description: "Terraform: Secure storage account with ZRS redundancy, disabled public access, and disabled access key authorization."
      }
    ],
    interview_answer: {
      response: [
        "I secure Azure Storage by disabling shared access keys (`shared_access_key_enabled = false`), forcing applications to authenticate via Entra ID using Managed Identities.",
        "For critical workloads, I choose ZRS over LRS because ZRS replicates data across physical zones, ensuring zero data loss and availability if a datacenter fails.",
        "If external clients need access, I generate a User Delegation SAS token with minimal permissions (e.g. read-only), restricted IP ranges, and a short expiration window."
      ],
      why: "Disabling static access keys is the primary control to prevent storage leaks."
    },
    interview_kill_shot: "Disable storage access keys to force Entra ID auth, use ZRS as the baseline for zone redundancy, and restrict access using Private Endpoints and Storage Firewalls.",
    interactive_html: wrap("Storage Redundancy & Lifecycle Mapper", `
<div class="grid">
  <div class="card">
    <h3>Configure Storage & Lifecycle</h3>
    <label>Select Redundancy Option</label>
    <select id="repSelect" onchange="runSim()">
      <option value="lrs">Locally Redundant (LRS)</option>
      <option value="zrs">Zone Redundant (ZRS)</option>
      <option value="grs">Geo-Redundant (GRS)</option>
    </select>
    
    <label>Move Blobs to Cool Tier (Days)</label>
    <input type="number" id="coolDays" value="30" min="1" max="365">
    
    <label>Move Blobs to Archive Tier (Days)</label>
    <input type="number" id="archiveDays" value="90" min="1" max="365">
    
    <button onclick="runSim()">Generate Lifecycle Policy</button>
  </div>
  
  <div class="card">
    <h3>Data Distribution Map</h3>
    <div id="statusText" style="font-weight:bold;margin-bottom:8px"></div>
    <div id="mapArea" style="display:flex;gap:12px;align-items:center;justify-content:center;min-height:120px">
    </div>
  </div>
</div>

<div class="card">
  <h3>Lifecycle JSON Policy</h3>
  <div class="pre" id="policyOutput"># JSON policy will render here...</div>
</div>
<script>
function runSim() {
  const rep = document.getElementById('repSelect').value;
  const cool = document.getElementById('coolDays').value;
  const arc = document.getElementById('archiveDays').value;
  const status = document.getElementById('statusText');
  const map = document.getElementById('mapArea');
  const tf = document.getElementById('policyOutput');
  
  // Update map
  let boxes = '';
  if (rep === 'lrs') {
    status.textContent = 'LRS: Data replicated 3 times inside 1 Datacenter';
    status.className = 'warn';
    boxes = \`
      <div style="background:#0f3460;padding:10px;border-radius:6px;text-align:center">
        <h4>Datacenter A</h4>
        <div style="font-size:18px">💿 💿 💿</div>
        <div style="font-size:10px;color:#34d399">LRS Nodes</div>
      </div>
    \`;
  } else if (rep === 'zrs') {
    status.textContent = 'ZRS: Data replicated across 3 Availability Zones';
    status.className = 'ok';
    boxes = \`
      <div style="background:#0f3460;padding:8px;border-radius:6px;text-align:center;width:60px">
        <h5>Zone 1</h5><div style="font-size:16px">💿</div>
      </div>
      <div style="background:#0f3460;padding:8px;border-radius:6px;text-align:center;width:60px">
        <h5>Zone 2</h5><div style="font-size:16px">💿</div>
      </div>
      <div style="background:#0f3460;padding:8px;border-radius:6px;text-align:center;width:60px">
        <h5>Zone 3</h5><div style="font-size:16px">💿</div>
      </div>
    \`;
  } else {
    status.textContent = 'GRS: Replicated inside Primary (LRS) + Secondary Region (LRS)';
    status.className = 'ok';
    boxes = \`
      <div style="background:#0f3460;padding:8px;border-radius:6px;text-align:center">
        <h5>Primary Region</h5><div style="font-size:14px">💿 💿 💿</div>
      </div>
      <div style="font-size:18px">➡️</div>
      <div style="background:#0f3460;padding:8px;border-radius:6px;text-align:center;opacity:0.8">
        <h5>Secondary Region</h5><div style="font-size:14px">💿 💿 💿</div>
      </div>
    \`;
  }
  map.innerHTML = boxes;
  
  // JSON Policy
  const policy = {
    rules: [
      {
        name: "archive-policy",
        enabled: true,
        type: "Lifecycle",
        filters: { blobTypes: ["blockBlob"] },
        actions: {
          baseBlob: {
            tierToCool: { daysAfterModificationGreaterThan: parseInt(cool, 10) },
            tierToArchive: { daysAfterModificationGreaterThan: parseInt(arc, 10) }
          }
        }
      }
    ]
  };
  tf.textContent = JSON.stringify(policy, null, 2);
}
runSim();
</script>`)
  },

  // ═══════════════════════════════════════════════════════════════════
  // SLIDE 24 — Secure Remote Access & Private Link
  // ═══════════════════════════════════════════════════════════════════
  {
    title: "Secure Remote Access & Private Link",
    type: "Networking — Private Endpoints & Bastion",
    difficulty: "Advanced",
    chips: ["Azure Bastion", "Private Endpoints", "Service Endpoints", "Private DNS Zones"],
    schema: "architecture",
    definition: "Secure remote access isolates administrative routes over Azure Bastion, while Private Link maps PaaS resources to internal VNet IPs, disabling public internet exposure.",
    content_theory: `Secure connectivity combines bastion host gateways with private endpoint routing.

1. Azure Bastion
Azure Bastion is a fully platform-managed PaaS service provisioned inside a VNet. It provides secure RDP/SSH access to VMs directly from the Azure portal or native command line via TLS (port 443).
Sizing: Requires a dedicated subnet named exactly \`AzureBastionSubnet\` (minimum size \`/26\`).

2. Service Endpoints vs. Private Endpoints
Service Endpoints: Route traffic via the Microsoft backbone, but the PaaS resource retains a public IP. Traffic must exit the VNet logically.
Private Endpoints: Injects a Private Network Interface (NIC) with a private IP from your VNet directly into the PaaS resource (e.g. database, Key Vault). All public internet paths are blocked.`,
    content_implementation: `Leaving RDP/SSH ports exposed via public IP NSG rules is a high-risk policy — deploy Azure Bastion and Private Endpoints.

Key Deployment Considerations:

DNS Integration: Private Endpoints require Private DNS Zones (e.g., \`privatelink.database.windows.net\`). Link these zones to all VNets so resources resolve hostnames to their private IP instead of public endpoints.

Subnet Allocation: Subnets containing Private Endpoints must disable network policy enforcement rules (\`private_endpoint_network_policies = "Enabled"\`) to enforce NSG filters.

Bastion Standard SKU: Deploy the Standard SKU to support native CLI tunneling, custom ports, and instance scaling.`,
    comparisons: [
      {
        topic_a: "Private Endpoint",
        topic_b: "Service Endpoint",
        summary: "Private Endpoints secure traffic by injecting a virtual network interface (NIC) with a private IP from the VNet into the PaaS resource, disabling all public endpoint access and routing via DNS. Service Endpoints extend the VNet's identity to the PaaS resource over the Microsoft backbone while keeping the PaaS resource's public IP address active, applying firewall rules at the PaaS resource's firewall to allow only VNet subnet traffic."
      }
    ],
    key_commands: [
      {
        command: `resource "azurerm_private_endpoint" "sql_ep" {
  name                = "sql-private-endpoint"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  subnet_id           = azurerm_subnet.backend.id

  private_service_connection {
    name                           = "sql-privatelink-conn"
    private_connection_resource_id = azurerm_mssql_server.sql.id
    subresource_names              = ["sqlServer"]
    is_manual_connection           = false
  }
}`,
        description: "Terraform: Provision a Private Endpoint mapping an Azure SQL Server instance to a backend VNet subnet."
      }
    ],
    interview_answer: {
      response: [
        "I secure VM management by deploying Azure Bastion inside the `AzureBastionSubnet` (/26 size), which allows engineers to SSH/RDP securely over TLS 443 without assigning public IPs to VMs.",
        "I choose Private Endpoints over Service Endpoints for databases because Private Endpoints allocate a private IP inside my VNet and allow me to completely block public access.",
        "To ensure correct name resolution, I configure Private DNS Zones linked to the VNets so target URLs resolve to the private endpoint IPs instead of routing to public endpoints."
      ],
      why: "Understanding Private DNS zone resolution pathways is critical to prevent split-brain DNS lookup failures."
    },
    interview_kill_shot: "Expose VM access only via Azure Bastion (TLS 443). Map databases and key vaults to Private Endpoints to assign them private IPs and disable public paths.",
    interactive_html: wrap("Private Link DNS Resolver Simulator", `
<div class="grid">
  <div class="card">
    <h3>Configure Resolution</h3>
    <label>Source VNet Context</label>
    <select id="srcVnet" onchange="runSim()">
      <option value="hub">Hub VNet (Private DNS Linked)</option>
      <option value="spoke_linked">Spoke VNet (Private DNS Linked)</option>
      <option value="spoke_unlinked">Spoke VNet (No DNS Link)</option>
    </select>
    
    <label>Query Hostname</label>
    <select id="queryHost" onchange="runSim()">
      <option value="pe">myvault.privatelink.vaultcore.azure.net</option>
      <option value="pub">myvault.vaultcore.azure.net (Public Endpoint)</option>
    </select>
    
    <button onclick="runSim()">Query DNS</button>
  </div>
  
  <div class="card">
    <h3>DNS Resolution Trace</h3>
    <div id="simStatus" style="font-weight:bold;margin-bottom:8px"></div>
    <div id="traceLog" style="font-size:12px;line-height:1.5"></div>
  </div>
</div>
<script>
function runSim() {
  const src = document.getElementById('srcVnet').value;
  const host = document.getElementById('queryHost').value;
  const status = document.getElementById('simStatus');
  const log = document.getElementById('traceLog');
  
  if (src === 'spoke_unlinked') {
    status.textContent = 'Resolution: PUBLIC IP RESOLVED (DNS Link Missing)';
    status.className = 'err';
    log.innerHTML = \`
      <div class="ok">1. VM initiates DNS lookup for host.</div>
      <div class="warn">2. Query hits Azure default DNS (168.63.129.16).</div>
      <div class="err">3. Spoke VNet has no link to 'privatelink.vaultcore.azure.net' zone.</div>
      <div class="warn">4. Fallback to public DNS: resolves to Public IP (20.53.12.84). Connection will fail if public endpoint is disabled!</div>
    \`;
  } else {
    status.textContent = 'Resolution: PRIVATE IP RESOLVED (10.0.4.15)';
    status.className = 'ok';
    log.innerHTML = \`
      <div class="ok">1. VM initiates DNS lookup for host.</div>
      <div class="ok">2. Query hits Azure default DNS (168.63.129.16).</div>
      <div class="ok">3. VNet Link verified. Query routed to Private DNS Zone.</div>
      <div class="ok">4. Resolves successfully to private endpoint IP (10.0.4.15). Traffic remains internal.</div>
    \`;
  }
}
runSim();
</script>`)
  },

  // ═══════════════════════════════════════════════════════════════════
  // SLIDE 25 — Azure Identity & Access Governance
  // ═══════════════════════════════════════════════════════════════════
  {
    title: "Azure Identity & Access Governance",
    type: "Identity — RBAC & Authentication",
    difficulty: "Advanced",
    chips: ["Entra ID", "RBAC", "Managed Identity", "Conditional Access", "PIM"],
    schema: "architecture",
    definition: "Azure Identity and Access Governance coordinates resource security through Role-Based Access Control (RBAC), Managed Identities for credentialless auth, and Microsoft Entra ID compliance policies.",
    why_it_matters: "Over-provisioning administrative roles or hardcoding connection strings in source code allows compromised credentials to expose entire cloud directories.",
    real_world_scenario: "An enterprise security audit flags that applications are authenticating to databases using static passwords saved in config files, and dev teams have admin permissions to production subscriptions.",
    content_theory: `Azure access management leverages centralized authentication and granular privilege scopes.

1. Role-Based Access Control (RBAC)
Scope Hierarchy: Tenant Root → Management Group → Subscription → Resource Group → Resource. Permissions assigned at a high level are inherited down the tree.
Built-in Roles: Owner (full access + RBAC management), Contributor (full access except RBAC), Reader (view access only).

2. Managed Identities
System-Assigned: Created and bound to the lifecycle of a specific Azure resource. Automatically deleted if the resource is destroyed.
User-Assigned: Standalone Azure resource that can be assigned to one or more Azure resources. Ideal for autoscaling pools (VMSS).
Managed Identities eliminate the need to store client secrets in configurations, fetching Entra ID access tokens dynamically at runtime.`,
    content_implementation: `Enforcing subscription-level Contributor roles to all developers is a major security risk — restrict assignments and use PIM.

Key Deployment Considerations:

Managed Identity Auth: Replace connection string usernames/passwords with Managed Identity authentication (e.g. SQL Azure Active Directory Authentication).

Least Privilege: Use custom RBAC role JSON definitions for automated roles, whitelisting only the specific API operations required.

Conditional Access: Build policies requiring MFA and Microsoft Intune device compliance for accessing subscription portals.`,
    key_commands: [
      {
        command: `resource "azurerm_role_definition" "custom_role" {
  name        = "Custom-Network-Operator"
  scope       = data.azurerm_subscription.primary.id
  description = "Allows restart of network interface cards only"

  permissions {
    actions     = ["Microsoft.Network/networkInterfaces/read", "Microsoft.Network/networkInterfaces/write"]
    not_actions = []
  }
}`,
        description: "Terraform: Author a custom RBAC role definition limiting actions to network interface configuration."
      }
    ],
    interview_answer: {
      response: [
        "I eliminate static secrets in application code by configuring System or User-Assigned Managed Identities, allowing resources to authenticate to Azure SQL or Key Vault without passwords.",
        "I assign roles at the Resource Group scope rather than the Subscription scope to minimize blast radius, preferring custom RBAC definitions with explicit Actions over Contributor access.",
        "I enforce Microsoft Entra Privileged Identity Management (PIM) for administrative access, requiring MFA, ticket numbers, and approvals for time-bound role activations."
      ],
      why: "Credentialless authentication and scope-bounding are the pillars of cloud security posture."
    },
    interview_kill_shot: "Managed Identities for credentialless application authentication, scope-bound RBAC at the Resource Group level, and Entra PIM for just-in-time administrative access.",
    interactive_html: wrap("RBAC Scope Visualizer & Role Builder", `
<div class="grid">
  <div class="card">
    <h3>Configure Role Assignment</h3>
    <label>Select Target Scope</label>
    <select id="scopeSelect" onchange="runSim()">
      <option value="sub">Subscription Level</option>
      <option value="rg">Resource Group Level</option>
      <option value="res">Resource Level (VM Only)</option>
    </select>
    
    <label>Select Role</label>
    <select id="roleSelect" onchange="runSim()">
      <option value="owner">Owner (Full + RBAC)</option>
      <option value="contributor">Contributor (Full)</option>
      <option value="reader">Reader (Read Only)</option>
    </select>
    
    <button onclick="runSim()">Apply & Trace Inheritance</button>
  </div>
  
  <div class="card">
    <h3>Scope Inheritance Tree</h3>
    <div id="treeArea" style="font-family:monospace;font-size:12px;line-height:1.6">
    </div>
  </div>
</div>
<script>
function runSim() {
  const scope = document.getElementById('scopeSelect').value;
  const role = document.getElementById('roleSelect').value;
  const tree = document.getElementById('treeArea');
  
  let subRole = 'None';
  let rgRole = 'None';
  let resRole = 'None';
  
  if (scope === 'sub') {
    subRole = role.toUpperCase();
    rgRole = role.toUpperCase() + ' (Inherited)';
    resRole = role.toUpperCase() + ' (Inherited)';
  } else if (scope === 'rg') {
    rgRole = role.toUpperCase();
    resRole = role.toUpperCase() + ' (Inherited)';
  } else {
    resRole = role.toUpperCase();
  }
  
  tree.innerHTML = \`
    <div>📁 Subscription Scope: <span style="font-weight:bold" class="\${subRole==='None'?'':'ok'}">\${subRole}</span></div>
    <div>&nbsp;&nbsp;└── 📁 Resource Group: <span style="font-weight:bold" class="\${rgRole==='None'?'':'ok'}">\${rgRole}</span></div>
    <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── 🖥️ VM Instance: <span style="font-weight:bold" class="\${resRole==='None'?'':'ok'}">\${resRole}</span></div>
  \`;
}
runSim();
</script>`)
  },

  // ═══════════════════════════════════════════════════════════════════
  // SLIDE 26 — Security Posture & Key Vault Governance
  // ═══════════════════════════════════════════════════════════════════
  {
    title: "Security Posture & Key Vault Governance",
    type: "Security — Key Vault & Azure Policy",
    difficulty: "Advanced",
    chips: ["Key Vault", "Azure Policy", "Defender for Cloud", "Soft Delete", "Purge Protection"],
    schema: "architecture",
    definition: "Azure Key Vault provides secure, centralized management of secrets, keys, and certificates, while Azure Policy enforces compliance standards to maintain organizational security posture.",
    why_it_matters: "A single unencrypted secret or a database with a public endpoint can lead to immediate compliance failures or compromise, exposing the organization to audit penalties.",
    real_world_scenario: "An enterprise needs to secure its application secrets. They must ensure that secrets cannot be permanently deleted by a single action and that all subscriptions block creation of public IPs.",
    content_theory: `Azure key governance and policy enforcement maintain resource compliance.

1. Key Vault Protections
Soft Delete: Retains deleted vaults and secrets for a retention window (7 to 90 days). Enabled by default.
Purge Protection: Prevents immediate, permanent deletion of the vault or secrets during the retention period. Once enabled, it cannot be disabled.
RBAC Permission Model: Key Vault RBAC roles (e.g. \`Key Vault Secrets Officer\`) are preferred over legacy Access Policies for granular control and integration with PIM.

2. Azure Policy
Enforces organizational standards. Evaluates resources during creation or update. Key effects include \`Deny\` (blocks non-compliant requests), \`Audit\` (flags violations without blocking), and \`DeployIfNotExists\` (automatically remediates missing configurations).`,
    content_implementation: `Allowing Key Vaults to be created without Purge Protection is a security risk — enforce it via Azure Policy to prevent data loss or compromise.

Key Deployment Considerations:

Enable Purge Protection: Always configure \`purge_protection_enabled = true\` on Key Vaults containing production certificates or keys.

Use Key Vault RBAC: Set \`enable_rbac_authorization = true\` to manage data access using standard Azure RBAC assignments rather than Key Vault access policies.

Isolate Key Vault Networks: Disable public endpoint access and configure Private Endpoints. Use Key Vault Firewall to whitelist only trusted Azure services.`,
    key_commands: [
      {
        command: `resource "azurerm_key_vault" "kv" {
  name                        = "prod-secrets-vault"
  resource_group_name         = azurerm_resource_group.rg.name
  location                    = azurerm_resource_group.rg.location
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  sku_name                    = "standard"
  soft_delete_retention_days  = 90
  purge_protection_enabled    = true
  enable_rbac_authorization   = true
}`,
        description: "Terraform: Key Vault configured with 90-day soft delete, purge protection enabled, and RBAC authorization."
      }
    ],
    interview_answer: {
      response: [
        "I secure Key Vaults by enabling Soft Delete and Purge Protection. This ensures secrets and keys cannot be permanently deleted by an accidental cmd or compromise.",
        "I configure `enable_rbac_authorization = true` on the vault. This allows us to govern data permissions using standard Azure RBAC roles, rather than legacy vault access policies.",
        "I use Azure Policy with a `Deny` effect to block the creation of Key Vaults that do not have firewalls or purge protection configured."
      ],
      why: "Key Vault access policies are difficult to audit; shifting to the RBAC model is the best practice for compliance."
    },
    interview_kill_shot: "Enable Soft Delete and Purge Protection on all Key Vaults, enforce Key Vault RBAC authorization, and isolate the vault behind Private Endpoints.",
    interactive_html: wrap("Key Vault Security Score Auditor", `
<div class="grid">
  <div class="card">
    <h3>Key Vault Config</h3>
    <label><input type="checkbox" id="chkSoft" checked onchange="auditVault()"> Soft Delete Enabled</label>
    <label><input type="checkbox" id="chkPurge" onchange="auditVault()"> Purge Protection Enabled</label>
    <label><input type="checkbox" id="chkRbac" onchange="auditVault()"> RBAC Authorization Model</label>
    <label><input type="checkbox" id="chkFirewall" onchange="auditVault()"> Vault Firewall Enabled</label>
    
    <button onclick="auditVault()" style="width:100%;margin-top:10px">Evaluate Security Score</button>
  </div>
  
  <div class="card">
    <h3>Security Audit Result</h3>
    <div id="scoreLabel" style="font-size:36px;font-weight:bold;text-align:center;color:#f87171">0/100</div>
    <div id="statusLabel" style="text-align:center;font-weight:600;margin-bottom:12px">CRITICAL RISKS DETECTED</div>
    <div id="auditLog" style="font-size:11px;line-height:1.4"></div>
  </div>
</div>
<script>
function auditVault() {
  const soft = document.getElementById('chkSoft').checked;
  const purge = document.getElementById('chkPurge').checked;
  const rbac = document.getElementById('chkRbac').checked;
  const fw = document.getElementById('chkFirewall').checked;
  
  let score = 0;
  let log = '';
  
  if (soft) { score += 20; log += '<div class="ok">✓ Soft Delete enabled (+20)</div>'; }
  else { log += '<div class="err">✗ Soft Delete disabled (0) - accidental deletes are permanent!</div>'; }
  
  if (purge) { score += 30; log += '<div class="ok">✓ Purge Protection enabled (+30)</div>'; }
  else { log += '<div class="err">✗ Purge Protection disabled (0) - keys can be purged immediately!</div>'; }
  
  if (rbac) { score += 25; log += '<div class="ok">✓ RBAC Authorization enabled (+25)</div>'; }
  else { log += '<div class="warn">⚠ Using legacy Access Policies (+10) - auditing is fragmented!</div>'; score += 10; }
  
  if (fw) { score += 25; log += '<div class="ok">✓ Network Firewall enabled (+25)</div>'; }
  else { log += '<div class="err">✗ Vault public endpoint is wide open (0)!</div>'; }
  
  const sl = document.getElementById('scoreLabel');
  const st = document.getElementById('statusLabel');
  sl.textContent = score + '/100';
  
  if (score >= 90) {
    sl.style.color = '#34d399';
    st.textContent = 'SECURE COMPLIANT VAULT';
    st.style.color = '#34d399';
  } else if (score >= 50) {
    sl.style.color = '#fbbf24';
    st.textContent = 'MEDIUM RISK PROFILE';
    st.style.color = '#fbbf24';
  } else {
    sl.style.color = '#f87171';
    st.textContent = 'CRITICAL RISKS DETECTED';
    st.style.color = '#f87171';
  }
  document.getElementById('auditLog').innerHTML = log;
}
auditVault();
</script>`)
  },

  // ═══════════════════════════════════════════════════════════════════
  // SLIDE 27 — Monitoring & SIEM Integration
  // ═══════════════════════════════════════════════════════════════════
  {
    title: "Monitoring & SIEM Integration",
    type: "Operations — Logging & Alerting",
    difficulty: "Intermediate",
    chips: ["Azure Monitor", "Log Analytics", "Diagnostic Settings", "KQL", "Event Hubs"],
    schema: "architecture",
    definition: "Azure Monitor acts as the central telemetry pipeline, aggregating logs and metrics into Log Analytics Workspaces and streaming security logs to SIEM systems.",
    why_it_matters: "A silent outage or security intrusion can go unnoticed for weeks without active alert rules, automated log forwarding, and structured audit logs.",
    real_world_scenario: "The operations team needs to build alerts for critical infrastructure events (like VM shutdowns and database failed logins) and stream all firewall logs to an external Splunk cluster.",
    content_theory: `Azure monitoring relies on diagnostics telemetry and query analysis.

1. Logging Pipeline
Diagnostic Settings: Resource configuration that defines which logs (e.g. Audit, Application) and metrics are collected and where they are sent. Supported destinations include Log Analytics Workspaces (storage + querying), Azure Storage (long-term archive), and Event Hubs (real-time stream).
Log Analytics Workspace: Storage database querying telemetry using Kusto Query Language (KQL).

2. Alerts & Action Groups
Metric Alerts: Near-real-time checks on metrics (like CPU > 85%).
Log Alerts: Run a KQL query on a schedule (e.g., alert if failed sign-in count > 50 in 15 mins).
Action Groups: Group of routing endpoints (email, SMS, ITSM/Jira webhooks) triggered by alerts.`,
    content_implementation: `Relying on manual checking of dashboards during outages is an operational failure — configure automated log alerts and alerts baseline.

Key Deployment Considerations:

Enforce Diagnostic Settings: Use Azure Policy with the \`DeployIfNotExists\` effect to automatically configure diagnostic settings on all newly created resources.

Event Hub Streaming for SIEM: Create a centralized Event Hub in the connectivity subscription. Configure resources to stream logs to this Event Hub namespace for SIEM retrieval.

Action Group Routing: Route alert notifications to team distribution lists or webhook connectors (e.g., OpsGenie, PagerDuty) rather than individual email addresses.`,
    key_commands: [
      {
        command: `AzureActivity
| where TimeGenerated > ago(24h)
| where OperationNameValue == "Microsoft.Compute/virtualMachines/deallocate/action"
| where ActivityStatusValue == "Succeeded"
| project TimeGenerated, Resource, CallerIPAddress, Caller`,
        description: "KQL Query: Query the Azure Activity Log for successful VM shutdowns/deallocations in the last 24 hours."
      }
    ],
    interview_answer: {
      response: [
        "I build centralized monitoring by deploying a Log Analytics Workspace. I assign Azure Policy definitions to automatically configure diagnostic settings on all resources, routing activity and operational logs to the workspace.",
        "I write custom KQL queries to trace anomalies (such as failed login spikes or VM deallocations) and convert those queries into Azure Monitor Log Alerts.",
        "To integrate logs with external SIEMs like Splunk, I route the diagnostic logs to an Azure Event Hub, which acts as the real-time consumption queue for the SIEM collector."
      ],
      why: "KQL proficiency and Event Hub routing are required to manage enterprise logging infrastructure."
    },
    interview_kill_shot: "Centralize logs in Log Analytics, enforce Diagnostic Settings via Azure Policy, write KQL queries for automated Log Alerts, and stream logs to Event Hub for SIEM ingestion.",
    interactive_html: wrap("KQL Query Sandbox & Alert Builder", `
<div class="grid">
  <div class="card">
    <h3>Select KQL Template</h3>
    <select id="kqlTemplate" onchange="loadQuery()">
      <option value="vm_shutdown">VM Shutdown Events</option>
      <option value="failed_logins">Failed Sign-in Spikes</option>
      <option value="high_cpu">CPU Utilization Spikes</option>
    </select>
    
    <label>Query Editor (Read-Only)</label>
    <div class="pre" id="kqlQuery" style="height:80px;white-space:pre-wrap;font-size:11px"></div>
    
    <button onclick="runQuery()">Run KQL Query</button>
  </div>
  
  <div class="card">
    <h3>Mock Query Results</h3>
    <div id="kqlResults" style="font-family:monospace;font-size:11px;max-height:160px;overflow-y:auto">
      <i>Click 'Run KQL Query' to execute...</i>
    </div>
  </div>
</div>
<script>
const queries = {
  vm_shutdown: \`AzureActivity\\\\n| where OperationNameValue == "deallocate"\\\\n| project Time, VM = Resource, User = Caller\`,
  failed_logins: \`SigninLogs\\\\n| where ResultType != 0\\\\n| summarize Count = count() by User, IPAddress\`,
  high_cpu: \`Perf\\\\n| where CounterName == "% Processor Time"\\\\n| summarize AvgCPU = avg(CounterValue) by Computer\`
};
const mockData = {
  vm_shutdown: [
    { Time: '2026-06-21T18:40', VM: 'web-prod-vm1', User: 'admin@corp.com' },
    { Time: '2026-06-21T19:12', VM: 'db-replica-01', User: 'system-agent' }
  ],
  failed_logins: [
    { User: 'developer@corp.com', IPAddress: '203.0.113.88', Count: 14 },
    { User: 'unknown@root.com', IPAddress: '198.51.100.22', Count: 125 }
  ],
  high_cpu: [
    { Computer: 'aks-nodepool-1', AvgCPU: 94.2 },
    { Computer: 'aks-nodepool-2', AvgCPU: 88.7 }
  ]
};
function loadQuery() {
  const q = document.getElementById('kqlTemplate').value;
  document.getElementById('kqlQuery').textContent = queries[q];
}
function runQuery() {
  const q = document.getElementById('kqlTemplate').value;
  const res = document.getElementById('kqlResults');
  const data = mockData[q];
  
  let html = '<table style="width:100%;border-collapse:collapse"><thead><tr style="color:#94a3b8">';
  if (q === 'vm_shutdown') {
    html += '<th>Time</th><th>VM</th><th>User</th></tr></thead><tbody>';
    data.forEach(r => { html += \`<tr><td>\${r.Time}</td><td>\${r.VM}</td><td>\${r.User}</td></tr>\`; });
  } else if (q === 'failed_logins') {
    html += '<th>User</th><th>IPAddress</th><th>Count</th></tr></thead><tbody>';
    data.forEach(r => { html += \`<tr><td>\${r.User}</td><td>\${r.IPAddress}</td><td style="color:#f87171;font-weight:bold">\${r.Count}</td></tr>\`; });
  } else {
    html += '<th>Computer</th><th>AvgCPU</th></tr></thead><tbody>';
    data.forEach(r => { html += \`<tr><td>\${r.Computer}</td><td style="color:#fbbf24">\${r.AvgCPU}%</td></tr>\`; });
  }
  html += '</tbody></table>';
  res.innerHTML = html;
}
loadQuery();
</script>`)
  },

  // ═══════════════════════════════════════════════════════════════════
  // SLIDE 28 — Cost Optimization (FinOps)
  // ═══════════════════════════════════════════════════════════════════
  {
    title: "Cost Optimization (FinOps)",
    type: "FinOps — Cost Control & Resource Efficiency",
    difficulty: "Intermediate",
    chips: ["Cost Management", "Tags", "Budgets", "Reserved Instances", "Savings Plans"],
    schema: "architecture",
    definition: "Azure FinOps combines cost monitoring, budget alarms, policy-driven resource tagging, and commitment plans to align cloud spending with operational value.",
    why_it_matters: "A single orphaned 1TB SSD disk or an unused ExpressRoute circuit left running for months can waste thousands of dollars, inflating the IT budget without reason.",
    real_world_scenario: "The finance team flags a 40% increase in Azure billing over the last quarter. The infrastructure team must audit all subscriptions for orphaned resources and set cost boundaries.",
    content_theory: `Cloud FinOps revolves around cost allocation, waste identification, and rate optimization.

1. Cost Allocation & Tagging
Resources must be tagged with metadata (e.g. \`CostCenter\`, \`Environment\`, \`Owner\`) to track spending. Enforce tagging at scale using Azure Policy.

2. Rate Optimization
Reserved Instances (RI): Commit to a specific VM size/family in a region for 1 or 3 years (up to 72% savings).
Savings Plans: Commit to a consistent hourly spend (e.g. $15/hour) across compute services globally for 1 or 3 years (up to 65% savings). Highly flexible.

3. Waste Reduction
Orphaned Resources: Managed Disks where \`DiskState == "Unattached"\` and Public IPs where \`ipConfiguration == null\` continue to generate bills even though they are not connected to any VM.`,
    content_implementation: `Allowing developers to provision resources without cost governance policies is an anti-pattern — enforce tagging policies and budget shutdowns.

Key Deployment Considerations:

Require Resource Tags: Deploy an Azure Policy with the \`Deny\` or \`Modify\` effect to block creation of resources that miss tags like \`CostCenter\` or \`Environment\`.

Budget Action Groups: Create budgets in Cost Management. Attach them to Action Groups that trigger automation runbooks (e.g. shutting down Dev VMs when budget hits 100%).

Orphaned Resource Auditing: Write Azure Resource Graph queries to scan all subscriptions weekly for unattached disks, idle databases, and unassociated Public IPs.`,
    key_commands: [
      {
        command: `Resources
| where type =~ 'microsoft.compute/disks'
| where properties.diskState =~ 'Unattached'
| project name, resourceGroup, properties.diskSizeGB, tags`,
        description: "Azure Resource Graph: Query all subscriptions for unattached Managed Disks currently incurring charges."
      }
    ],
    interview_answer: {
      response: [
        "I govern cloud costs by enforcing strict tagging policies (e.g. `CostCenter`, `Owner`) via Azure Policy, allowing us to build clear chargeback reports in Cost Management.",
        "I run automated weekly audits using Azure Resource Graph to detect and clean up orphaned assets like unattached disks, idle SQL databases, and unused public IPs.",
        "I analyze workloads to evaluate Reserved Instances for stable compute needs and Azure Savings Plans for dynamic, multi-service compute clusters to maximize discounts."
      ],
      why: "Orphaned resource identification and commitment plan differences are the primary FinOps competencies."
    },
    interview_kill_shot: "Enforce tagging via Azure Policy for cost attribution, automate weekly sweeps for orphaned resources using Resource Graph, and leverage Savings Plans for flexible compute discounts.",
    interactive_html: wrap("FinOps Orphaned Resource Scanner", `
<div class="card">
  <h3>Active Audit Tool</h3>
  <p>Scan subscription to locate orphaned resources and calculate potential monthly savings.</p>
  <button onclick="runScan()" style="width:100%">Run Cost Audit Scan</button>
</div>

<div class="card" id="scanResults" style="display:none">
  <h3>Orphaned Resources Found</h3>
  <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:12px">
    <thead>
      <tr style="color:#94a3b8;border-bottom:1px solid #0f3460">
        <th>Resource Name</th><th>Type</th><th>Reason</th><th>Cost/Month</th><th>Action</th>
      </tr>
    </thead>
    <tbody id="scanTableBody">
    </tbody>
  </table>
  <div class="card ok" style="margin:0;padding:10px;font-size:14px">
    Total Monthly Savings: <strong>$<span id="totalSavings">0</span></strong>
  </div>
</div>
<script>
const orphans = [
  { name: 'disk-temp-prod-01', type: 'Managed Disk', reason: 'Unattached', cost: 120, cli: 'az disk delete -g rg-prod-vm -n disk-temp-prod-01 --yes' },
  { name: 'ip-staging-app-02', type: 'Public IP', reason: 'Unassociated', cost: 4.5, cli: 'az network public-ip delete -g rg-stag -n ip-staging-app-02' },
  { name: 'disk-test-vm-99', type: 'Managed Disk', reason: 'Unattached', cost: 40, cli: 'az disk delete -g rg-test -n disk-test-vm-99 --yes' },
  { name: 'sql-idle-db', type: 'Azure SQL', reason: 'Zero traffic (30 days)', cost: 150, cli: 'az sql db delete -g rg-data -s sql-srv -n sql-idle-db --yes' }
];
let activeOrphans = [...orphans];
function runScan() {
  document.getElementById('scanResults').style.display = 'block';
  renderTable();
}
function remediate(idx) {
  const res = activeOrphans[idx];
  alert("Running Cleanup CLI:\\n" + res.cli);
  activeOrphans.splice(idx, 1);
  renderTable();
}
function renderTable() {
  const tbody = document.getElementById('scanTableBody');
  const savings = document.getElementById('totalSavings');
  
  if (activeOrphans.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:10px">No orphaned resources found! Configuration is 100% compliant.</td></tr>';
    savings.textContent = '0';
    return;
  }
  
  let html = '';
  let total = 0;
  activeOrphans.forEach((o, index) => {
    total += o.cost;
    html += \`
      <tr style="border-bottom:1px solid #0f3460">
        <td>\${o.name}</td>
        <td>\${o.type}</td>
        <td class="warn">\${o.reason}</td>
        <td style="color:#f87171">\$\${o.cost}</td>
        <td><button onclick="remediate(\${index})" style="padding:3px 8px;font-size:10px;background:#c22e2e">Delete</button></td>
      </tr>
    \`;
  });
  tbody.innerHTML = html;
  savings.textContent = total.toFixed(2);
}
</script>`)
  }
];

// ═══════════════════════════════════════════════════════════════════
// SLIDE 29 — Interview FAQ Master Reference
// ═══════════════════════════════════════════════════════════════════
const slide29 = {
  title: "Interview FAQ Master Reference",
  type: "JD-Aligned — 85 Questions Across All Domains",
  difficulty: "Mixed",
  chips: ["Landing Zones", "Networking", "Security", "Identity", "DR/Backup", "FinOps", "IaC", "Monitoring"],
  schema: "architecture",
  definition: "A consolidated reference of all 85 interview questions mapped across 10 Azure infrastructure domains. Each question links to its primary reference slide and includes an expandable detailed answer for rapid pre-interview review.",
  why_it_matters: "Senior Azure Infrastructure roles demand breadth across networking, security, governance, DR, and cost optimization. This master reference provides a structured, tappable study guide covering every question from the JD analysis.",
  real_world_scenario: "Use this slide as a final review checklist before your interview. Tap any question to navigate to its detailed reference slide, or expand the answer inline for a quick recap.",
  content_theory: `This slide consolidates all 85 prioritized interview questions grouped into 10 domains:

1. Landing Zones & Governance (9 questions)
2. Advanced Networking (18 questions)
3. Compute HA & Scaling (5 questions)
4. Secure Remote Access (3 questions)
5. Identity & Governance (6 questions)
6. Security & Threat Protection (8 questions)
7. Operations & Monitoring (6 questions)
8. Backup & Recovery (7 questions)
9. Cost Optimization / FinOps (6 questions)
10. Automation & IaC (5 questions)
11. Expert Design Questions (5 questions)
12. Governance & Enterprise Scale (4 questions)

Each question is tagged with its primary reference slide number for cross-navigation.`,
  key_takeaways: [
    "85 questions from the JD analysis, all ✅ covered in slides 1–28",
    "Click any 📘 badge to jump to the primary reference slide",
    "Expand ▼ chevron to read the answer inline",
    "Filter by domain using the top tabs",
    "Priority: 🔴 High, 🟡 Medium, 🟢 General"
  ],
  pitfalls: [
    "Don't memorize — understand the why behind each answer",
    "Always relate answers to real-world scenarios from your experience",
    "Link answers across topics (e.g., Policy + RBAC + PIM together = Zero Trust)"
  ],
  interview_questions: [
    { q: "What is an Azure Landing Zone?", a: "A multi-subscription environment aligned with CAF providing networking, identity, security, and governance foundations.", slide: 21 },
    { q: "How do you design an Azure subscription strategy?", a: "Enforce subscription-level segregation. Prod in a 'Prod' subscription under separate Management Groups from Dev/UAT to isolate costs and policies.", slide: 21 },
    { q: "Explain Management Groups, Subscriptions, Resource Groups hierarchy.", a: "Tenant Root → Management Groups → Subscriptions → Resource Groups → Resources. Inherited permissions flow downwards.", slide: 19 },
    { q: "What is Azure Policy vs RBAC?", a: "Azure Policy controls resource configuration compliance. RBAC controls what actions a user can perform. Policy = guardrails, RBAC = gates.", slide: 20 },
    { q: "How do you prevent resources in unauthorized regions?", a: "Assign 'Allowed locations' Azure Policy at Management Group scope with Deny effect.", slide: 20 },
    { q: "How do you enforce tagging across subscriptions?", a: "Deploy 'Require a tag and its value' Policy or 'Inherit tag from resource group' with Modify effect.", slide: 20 },
    { q: "Design an Azure environment for Prod, UAT, and Dev.", a: "Separate Management Group branches for Prod/Non-Prod. Distinct subscriptions per env. Hub subscription for shared security.", slide: 21 },
    { q: "How do you design a secure landing zone for a new enterprise customer?", a: "Follow CAF: Platform MGs (Connectivity, Identity, Management) + Landing Zone MGs + Policy Initiatives + Hub-Spoke + Azure Firewall.", slide: 21 },
    { q: "How do you standardize governance across 100+ subscriptions?", a: "Policy Initiatives at MG level + subscription vending machine IaC templates for default VNets, tags, logging.", slide: 20 }
  ],
  interactive_html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Interview FAQ Master Reference</title><style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;overflow:hidden;font-family:'Segoe UI',sans-serif;background:#0f172a;color:#e2e8f0}
.faq-wrap{height:100vh;display:flex;flex-direction:column;overflow:hidden}
.faq-header{background:linear-gradient(135deg,#1e3a5f 0%,#0f3460 100%);padding:10px 14px;border-bottom:1px solid #1e4a8a;flex-shrink:0}
.faq-header h2{margin:0;font-size:14px;color:#60a5fa;font-weight:700;letter-spacing:.5px}
.faq-stats{display:flex;gap:8px;margin-top:5px;flex-wrap:wrap}
.faq-stat{background:rgba(255,255,255,.07);border:1px solid #1e4a8a;border-radius:20px;padding:2px 8px;font-size:10px;color:#94a3b8}
.faq-stat span{color:#60a5fa;font-weight:700}
.domain-tabs{display:flex;gap:4px;padding:6px 12px;overflow-x:auto;flex-shrink:0;background:#0d1b2e;border-bottom:1px solid #1a2f4f;scrollbar-width:none}
.domain-tabs::-webkit-scrollbar{display:none}
.tab-btn{white-space:nowrap;background:rgba(255,255,255,.05);border:1px solid #1e4a8a;border-radius:16px;padding:3px 10px;font-size:10px;color:#94a3b8;cursor:pointer;transition:all .2s;flex-shrink:0}
.tab-btn:hover,.tab-btn.active{background:#0078d4;border-color:#0078d4;color:#fff;font-weight:600}
.search-bar{padding:6px 12px;background:#0d1b2e;border-bottom:1px solid #1a2f4f;flex-shrink:0}
.search-bar input{width:100%;background:#1e3a5f;border:1px solid #1e4a8a;border-radius:20px;padding:5px 12px;color:#e2e8f0;font-size:12px;outline:none}
.search-bar input::placeholder{color:#4a6a8a}
.search-bar input:focus{border-color:#0078d4}
.faq-list{flex:1;overflow-y:auto;padding:6px 12px;display:flex;flex-direction:column;gap:5px}
.faq-list::-webkit-scrollbar{width:3px}
.faq-list::-webkit-scrollbar-thumb{background:#1e4a8a;border-radius:2px}
.domain-group{margin-bottom:4px}
.domain-label{font-size:10px;font-weight:700;color:#60a5fa;text-transform:uppercase;letter-spacing:1px;padding:3px 0 3px 4px;border-left:2px solid #0078d4;margin-bottom:3px}
.faq-item{background:#16213e;border:1px solid #1e3a5f;border-radius:7px;overflow:hidden;transition:border-color .2s}
.faq-item:hover{border-color:#0078d4}
.faq-q{display:flex;align-items:center;gap:7px;padding:7px 9px;cursor:pointer;user-select:none}
.priority-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.p-high{background:#ef4444}.p-med{background:#f59e0b}.p-low{background:#22c55e}
.q-text{flex:1;font-size:11px;color:#cbd5e1;line-height:1.4;font-weight:500}
.faq-item.open .q-text{color:#60a5fa}
.slide-badge{background:#0f3460;border:1px solid #0078d4;border-radius:10px;padding:2px 7px;font-size:9px;color:#60a5fa;cursor:pointer;flex-shrink:0;transition:all .2s;white-space:nowrap}
.slide-badge:hover{background:#0078d4;color:#fff}
.chevron{color:#4a6a8a;font-size:10px;transition:transform .2s;flex-shrink:0}
.faq-item.open .chevron{transform:rotate(180deg)}
.faq-a{display:none;padding:0 9px 8px 22px;font-size:11px;color:#94a3b8;line-height:1.6;border-top:1px solid #1e3a5f}
.faq-item.open .faq-a{display:block}
.no-results{text-align:center;padding:30px;color:#4a6a8a;font-size:12px}
.footer-hint{padding:4px 12px;text-align:center;font-size:9px;color:#2d4a6a;flex-shrink:0;border-top:1px solid #1a2f4f}
</style></head><body>
<div class="faq-wrap">
  <div class="faq-header">
    <h2>&#x1F4CB; Interview FAQ Master Reference &mdash; 85 Questions</h2>
    <div class="faq-stats">
      <div class="faq-stat"><span id="visCount">85</span> questions</div>
      <div class="faq-stat"><span>10</span> domains</div>
      <div class="faq-stat"><span>28</span> ref slides</div>
      <div class="faq-stat"><span>100%</span> covered</div>
    </div>
  </div>
  <div class="domain-tabs" id="domainTabs"></div>
  <div class="search-bar"><input id="searchInput" placeholder="Search questions, keywords, answers..." oninput="filterFAQs()"></div>
  <div class="faq-list" id="faqList"></div>
  <div class="footer-hint">&#x1F4A1; Click question to expand answer &bull; Tap slide badge to navigate to reference slide</div>
</div>
<script>
var FAQ_DATA = [
  {d:'Landing Zones',p:'high',q:'What is an Azure Landing Zone and why is it important?',a:'A multi-subscription environment aligned with Microsoft CAF. Provides structured networking, identity, security, and governance foundations to enable enterprises to scale securely.',s:21},
  {d:'Landing Zones',p:'high',q:'How do you design an Azure subscription strategy for Prod and Non-Prod?',a:'Enforce subscription-level segregation. Place Prod workloads in a dedicated Prod subscription and Dev/UAT in Non-Prod under separate Management Groups to isolate costs and enforce distinct security policies.',s:21},
  {d:'Landing Zones',p:'high',q:'Explain Management Groups, Subscriptions, Resource Groups, and Resources hierarchy.',a:'Tenant Root Group -> Management Groups (logical grouping for policies/access) -> Subscriptions (billing and scaling boundary) -> Resource Groups (lifecycle boundary) -> Resources. Inherited permissions flow downwards.',s:19},
  {d:'Landing Zones',p:'high',q:'What is Azure Policy and how is it different from RBAC?',a:'Azure Policy evaluates resource configuration properties to ensure compliance (guardrails). RBAC regulates authorization based on user actions and scopes (gates). Policy = configuration enforcement; RBAC = identity authorization.',s:20},
  {d:'Landing Zones',p:'med',q:'How do you prevent users from creating resources in unauthorized regions?',a:'Assign the built-in Azure Policy Allowed locations definition at the Management Group scope with Deny effect to block deployments elsewhere.',s:20},
  {d:'Landing Zones',p:'med',q:'How would you enforce tagging across subscriptions?',a:'Use Azure Policy. Deploy Require a tag and its value policies to block deployments missing tags, or Inherit a tag from the resource group policy with Modify effect to auto-populate.',s:20},
  {d:'Landing Zones',p:'high',q:'Design an Azure environment for Production, UAT, and Dev.',',a:'Establish MG hierarchy with separate branches for Prod and Non-Prod. Deploy distinct subscriptions for Dev, UAT, and Prod. Link spoke VNets back to a central Hub subscription for shared security inspection.',s:21},
  {d:'Landing Zones',p:'high',q:'How would you design a secure landing zone for a new enterprise customer?',a:'Follow CAF. Provision Platform MGs (Connectivity, Identity, Management) and Landing Zone MGs. Apply security benchmarks via Azure Policy Initiatives, deploy Hub-Spoke topology with Azure Firewall.',s:21},
  {d:'Landing Zones',p:'med',q:'How do you standardize governance across multiple subscriptions?',a:'Group individual policies into Initiatives (e.g. ASB). Assign these Initiatives at the Management Group scope so they propagate automatically to all child subscriptions.',s:20},
  {d:'Networking',p:'high',q:'What are the benefits of Hub-and-Spoke architecture?',a:'Centralizes common services (VPN/ExpressRoute gateways, Azure Firewall, Log Analytics) in a Hub VNet while separating workloads into isolated Spoke VNets. Reduces redundant costs, simplifies governance, provides centralized security inspection.',s:7},
  {d:'Networking',p:'high',q:'What components typically reside in the Hub VNet?',a:'The Hub VNet typically hosts: Azure Firewall, Virtual Network Gateways (VPN/ExpressRoute), Azure Bastion, private DNS resolvers, and shared domain controllers (Active Directory).',s:7},
  {d:'Networking',p:'high',q:'How do Spoke VNets communicate securely with each other?',a:'Spoke VNets peer to the Hub VNet, not directly to each other. Inter-spoke traffic is routed through UDRs with next-hop pointing to the centralized Azure Firewall in the Hub VNet.',s:8},
  {d:'Networking',p:'med',q:'What are the advantages and disadvantages of VNet Peering?',a:'Advantages: Low-latency, high-bandwidth over Microsoft backbone, easy config. Disadvantages: No overlapping IP spaces, peering counts against limits, non-transitive by default.',s:21},
  {d:'Networking',p:'high',q:'Explain the difference between NSG, Azure Firewall, and UDR.',a:'NSGs are basic L4 packet filters at subnet/NIC level. Azure Firewall is a centralized stateful L4/L7 firewall-as-a-service with FQDN filtering. UDRs are custom routing tables applied to subnets to override default routing paths.',s:7},
  {d:'Networking',p:'med',q:'How does Azure Firewall process traffic?',a:'Azure Firewall evaluates in order: 1) DNAT rules (highest priority), 2) Network rules (IP/port filtering), 3) Application rules (FQDN/HTTP headers). First match wins.',s:7},
  {d:'Networking',p:'high',q:'What is the difference between Site-to-Site VPN and Point-to-Site VPN?',a:'S2S connects an entire branch/on-premises network to Azure via IPsec/IKE tunnel (requires on-prem VPN device). P2S connects individual remote clients directly to Azure using SSTP/IKEv2/OpenVPN (no on-prem hardware needed).',s:2},
  {d:'Networking',p:'high',q:'When would you choose ExpressRoute instead of VPN?',a:'Choose ExpressRoute for high dedicated bandwidth (up to 100 Gbps), ultra-low predictable latency, higher security compliance (bypasses public internet), and 99.95% SLA guarantees.',s:9},
  {d:'Networking',p:'high',q:'How does Azure Load Balancer work?',a:'Azure Load Balancer operates at Layer 4 (TCP/UDP), distributing inbound traffic based on a 5-tuple hash to backend pool instances verified by health probes.',s:3},
  {d:'Networking',p:'high',q:'Difference between Azure Load Balancer and Application Gateway.',a:'Azure LB is a Layer 4 TCP/UDP load balancer (cannot read HTTP headers). Application Gateway is a Layer 7 HTTP/HTTPS load balancer supporting URL path-based routing, SSL/TLS termination, and WAF integration.',s:4},
  {d:'Networking',p:'med',q:'How do you troubleshoot connectivity between Azure and On-Premises?',a:'Use Network Watcher Connection Monitor. Check VNet Gateway status and active BGP routes. Run effective route table commands. Review NSG Flow Logs and check for overlapping CIDR blocks.',s:11},
  {d:'Networking',p:'med',q:'Explain Azure Route Tables and route precedence.',a:'Azure routes by longest prefix match. Precedence: 1) User Defined Routes (highest), 2) BGP routes from VPN/ExpressRoute gateway, 3) System routes (lowest).',s:8},
  {d:'Networking',p:'med',q:'How does BGP work with ExpressRoute?',a:'BGP dynamically exchanges routing information between on-premises and Azure VNets via eBGP peerings over private or Microsoft VIFs across the ExpressRoute circuit, enabling automatic failover.',s:9},
  {d:'Networking',p:'med',q:'What are forced tunneling and custom routing?',a:'Forced tunneling redirects all internet-bound traffic (0.0.0.0/0) from spoke subnets to a central NVA/Firewall or on-premises gateway using UDRs.',s:8},
  {d:'Networking',p:'med',q:'Explain Azure Firewall Premium features.',a:'Premium features: 1) TLS Inspection (decrypts outbound traffic), 2) IDPS (Intrusion Detection and Prevention signature matching), 3) URL Filtering, 4) Web Categories.',s:7},
  {d:'Networking',p:'low',q:'Difference between Global VNet Peering and Regional Peering.',a:'Regional Peering connects VNets in the same region over local switches with negligible latency. Global Peering connects VNets across different regions over the Microsoft backbone. Both use private IPs.',s:21},
  {d:'Networking',p:'med',q:'Users cannot access an application hosted in Azure. How would you troubleshoot?',a:'Check App Gateway/Load Balancer backend pool health probes. Verify NSGs and Azure Firewall rules. Run Network Watcher IP Flow Verify to trace packet blocks.',s:11},
  {d:'Networking',p:'med',q:'VPN tunnel is up but traffic is not flowing. What checks would you perform?',a:'Check BGP route advertisements on both sides. Verify UDRs on Spoke subnets force routing through the Gateway. Ensure no overlapping subnet IP ranges. Check local network gateway prefixes.',s:11},
  {d:'Networking',p:'med',q:'Two VNets cannot communicate. How would you troubleshoot?',a:'Verify VNet Peering status is Connected. Ensure Allow forwarded traffic and Use remote gateways settings are enabled. Check NSGs allow peer VNet range traffic.',s:11},
  {d:'Compute & Scaling',p:'high',q:'Difference between Availability Set and Availability Zone.',a:'Availability Sets distribute VMs across racks inside a single datacenter (SLA 99.95%). Availability Zones distribute VMs across physically separate datacenters within a region (SLA 99.99%).',s:22},
  {d:'Compute & Scaling',p:'high',q:'What is a VM Scale Set and when should it be used?',a:'VMSS deploys and manages a group of identical, auto-scaling VMs. Use for stateless, highly scalable workloads (web servers, microservices, AKS worker pools) with fluctuating traffic.',s:22},
  {d:'Compute & Scaling',p:'high',q:'How would you migrate 200 on-premises servers to Azure?',a:'Use Azure Migrate. Deploy the collector appliance on-premises to discover workloads, assess VM compatibility and sizing, estimate costs, and execute replication batches into target subscriptions.',s:21},
  {d:'Compute & Scaling',p:'med',q:'A VM CPU usage is consistently above 90%. What actions would you take?',a:'Check VMSS autoscale rules to ensure instances scale out. Optimize application memory leaks, check for run-away processes via SSH/RDP, or vertically scale (upsize) the VM instance type.',s:22},
  {d:'Compute & Scaling',p:'high',q:'Design a highly available web application architecture in Azure.',a:'Fronted by Azure Front Door routing to regional Application Gateways. Compute runs on VMSS across Availability Zones. Storage uses ZRS storage accounts, database uses Azure SQL with Active Geo-Replication.',s:22},
  {d:'Secure Access',p:'high',q:'What is Private Endpoint and how does it differ from Service Endpoint?',a:'Private Endpoint allocates a private IP from your VNet directly to the PaaS resource, routing traffic privately via DNS and disabling public internet access. Service Endpoint keeps the public IP active but extends your VNet identity to the PaaS over the Microsoft backbone.',s:24},
  {d:'Secure Access',p:'high',q:'What is Azure Bastion and what problem does it solve?',a:'Azure Bastion is a managed PaaS providing secure, browser-based RDP/SSH access to VMs over TLS (port 443). Eliminates the need to expose VMs to the internet or manage vulnerable jump boxes.',s:24},
  {d:'Secure Access',p:'med',q:'Explain Azure Private DNS Zones.',a:'Azure Private DNS Zones resolve hostnames within a VNet (or linked VNets) without exposing DNS queries to the public internet. Essential for Private Endpoint name resolution to map public PaaS URLs to private IPs.',s:10},
  {d:'Identity',p:'high',q:'Explain Azure RBAC.',a:'Azure RBAC manages who has access to Azure resources, what they can do, and what scopes they have. Assign a security principal (User, Group, SP, Managed Identity) to a Role Definition at a target Scope.',s:25},
  {d:'Identity',p:'high',q:'Difference between Owner, Contributor, and Reader roles.',a:'Owner: full access including permission delegation. Contributor: full resource management, cannot delegate access. Reader: view only, cannot create/modify/delete.',s:25},
  {d:'Identity',p:'high',q:'What are Managed Identities?',a:'Managed Identities provide an automatically managed identity in Microsoft Entra ID for Azure resources (VMs, App Services) to authenticate to other services (databases, Key Vaults) without storing credentials in code.',s:25},
  {d:'Identity',p:'high',q:'Difference between Managed Identity and Service Principal.',a:'Managed Identities are tied to Azure resource lifecycles with no credential management required. Service Principals are application registrations in Entra ID relying on user-managed client secrets or certificates.',s:25},
  {d:'Identity',p:'high',q:'How do you implement least-privilege access?',a:'Assign roles at the narrowest scope (Resource Group over Subscription). Use custom roles with specific action lists over broad built-in roles. Implement Entra PIM for JIT access.',s:25},
  {d:'Identity',p:'med',q:'Explain Conditional Access Policies and MFA.',a:'Conditional Access is Entra IDs policy engine evaluating signals (user location, device compliance, risk level) to enforce access decisions (Block, Allow, or require MFA).',s:25},
  {d:'Identity',p:'high',q:'Developers require temporary elevated permissions. What is the best approach?',a:'Configure Entra ID PIM (Privileged Identity Management). Assign developers eligible roles requiring MFA, justification, and approval gates to activate JIT access for a fixed duration.',s:25},
  {d:'Security',p:'high',q:'What is Microsoft Defender for Cloud?',a:'Microsoft Defender for Cloud is a unified security management system providing Cloud Security Posture Management (CSPM) to evaluate compliance scores, and Cloud Workload Protection (CWPP) to detect threats across workloads.',s:26},
  {d:'Security',p:'high',q:'How do you secure Azure Key Vault?',a:'1) Enable Soft Delete and Purge Protection, 2) Use Azure RBAC authorization model instead of legacy access policies, 3) Restrict network access via private endpoints/firewalls, 4) Rotate vault keys regularly.',s:26},
  {d:'Security',p:'med',q:'Explain encryption at rest and encryption in transit.',a:'Encryption at rest encrypts stored data via Azure Storage Service Encryption or SQL TDE using Platform-Managed or Customer-Managed Keys. Encryption in transit secures data moving over networks using TLS/SSL.',s:26},
  {d:'Security',p:'high',q:'How would you handle a client security audit?',a:'Generate compliance reports from Defender for Cloud demonstrating alignment with standards (ISO 27001). Provide audit trails from Activity Logs, present Key Vault RBAC configurations, and demonstrate policy compliance statistics.',s:26},
  {d:'Security',p:'high',q:'A storage account is publicly accessible. How would you secure it?',a:'Set Storage Firewall to Enabled from selected networks. Create a Private Endpoint mapping the storage account to a backend subnet, and disable Allow storage account public access globally.',s:23},
  {d:'Security',p:'high',q:'How would you implement Zero Trust in Azure?',a:'Enforce Zero Trust: 1) Verify explicitly (Conditional Access, MFA), 2) Use least privilege (RBAC, PIM), 3) Assume breach (micro-segmentation with NSGs, private links, threat logging).',s:26},
  {d:'Security',p:'med',q:'How would you manage secrets for applications?',a:'Store secrets in Azure Key Vault. Enable Managed Identities on compute resources and grant them permission to retrieve secrets dynamically at runtime without hardcoding keys.',s:26},
  {d:'Security',p:'high',q:'How would you secure an enterprise Azure environment from day one?',a:'Enforce MFA and PIM. Configure MG hierarchies with Azure Policy Initiatives. Deploy Hub-and-Spoke with Azure Firewall. Disable VM public IPs, route administration via Bastion, resolve PaaS via Private Endpoints.',s:26},
  {d:'Monitoring',p:'high',q:'What is Azure Monitor?',a:'Azure Monitor is a comprehensive solution for collecting, analyzing, and acting on telemetry from cloud and on-premises environments. It handles metrics (numeric performance data) and logs (structured resource records).',s:12},
  {d:'Monitoring',p:'high',q:'Difference between Azure Monitor and Log Analytics.',a:'Azure Monitor is the overarching service for monitoring and alerts. Log Analytics is the primary workspace within Azure Monitor used to query, store, and analyze log data using KQL (Kusto Query Language).',s:12},
  {d:'Monitoring',p:'med',q:'How do you create alert rules?',a:'Define the alert condition (metric threshold or log query), set evaluation frequency, and link the alert to an Action Group containing notification receivers or automation runbooks.',s:12},
  {d:'Monitoring',p:'med',q:'How do you investigate performance issues in Azure?',a:'View Azure Monitor metrics (CPU, Memory, Disk, Network). Review Log Analytics workspaces using KQL to identify error events, query database executions, and run Application Insights tracing.',s:11},
  {d:'Monitoring',p:'med',q:'Application logs are missing. How would you troubleshoot?',a:'Check the resources Diagnostic Settings to ensure log sending is enabled and points to the correct Log Analytics Workspace. Verify VM log agents (AMA) are running successfully.',s:12},
  {d:'Monitoring',p:'med',q:'How would you integrate Azure logs with a SIEM?',a:'Configure Diagnostic Settings on resources to export logs to an Azure Event Hub, which is connected to your external SIEM (Splunk, QRadar) to pull and parse logs.',s:12},
  {d:'Monitoring',p:'high',q:'An application is experiencing high latency. How would you investigate?',a:'Run Network Watcher Connection Monitor to measure network latency. Investigate VM CPU/RAM bottlenecks. Query Log Analytics/App Insights to isolate database query bottlenecks or API dependencies.',s:11},
  {d:'DR & Backup',p:'high',q:'What is Azure Backup?',a:'Azure Backup is a fully managed service that protects files, folders, VM system states, and SQL/SAP databases by backing them up to a Recovery Services Vault with customizable retention schedules.',s:13},
  {d:'DR & Backup',p:'high',q:'What is Azure Site Recovery?',a:'Azure Site Recovery (ASR) is a disaster recovery orchestration service providing continuous replication of VMs from source to target regions, supporting automated failover and failback testing.',s:14},
  {d:'DR & Backup',p:'high',q:'Explain RPO and RTO.',a:'Recovery Point Objective (RPO) is the maximum tolerable data loss window (time). Recovery Time Objective (RTO) is the maximum tolerable application downtime window before business impact.',s:18},
  {d:'DR & Backup',p:'high',q:'How would you design a multi-region DR solution?',a:'Architect active-passive or active-active sites in paired regions. Replicate VMs using ASR, enable SQL Geo-Replication/Failover Groups, utilize GRS storage accounts, and route regional traffic via Azure Front Door.',s:15},
  {d:'DR & Backup',p:'high',q:'How do failover and failback work?',a:'Failover routes traffic to a secondary DR site when the primary site experiences an outage. Failback returns production traffic from the secondary site back to the primary site after it is restored.',s:16},
  {d:'DR & Backup',p:'high',q:'A region-wide outage occurs. What steps would you take?',a:'Verify Azure Status health dashboard. Trigger failover via Azure Front Door/Traffic Manager to route traffic to the secondary region. Initiate ASR failover recovery plans to spin up replicas.',s:15},
  {d:'DR & Backup',p:'med',q:'How do you validate DR readiness?',a:'Perform regular Test Failovers in Azure Site Recovery. This provisions VM replicas in an isolated sandbox VNet without interrupting production replication, enabling validation tests.',s:17},
  {d:'DR & Backup',p:'med',q:'How frequently should failover testing be performed?',a:'Perform DR testing at least semi-annually or annually as mandated by enterprise compliance policies, alongside automated dry-run testing validations.',s:17},
  {d:'DR & Backup',p:'high',q:'Design a DR strategy with less than 30-minute RPO.',a:'Configure ASR replicating VMs to a paired region (RPO approx 5 min). Enable Azure SQL Auto-Failover Groups (RPO less than 5 sec) and utilize Geo-Redundant Storage (GRS).',s:18},
  {d:'FinOps',p:'high',q:'How do you identify cost optimization opportunities?',a:'Utilize Azure Advisor recommendations, configure anomaly alerts in Azure Cost Management, and run KQL queries in Azure Resource Graph to scan for orphaned disks, idle resources, and unused public IPs.',s:28},
  {d:'FinOps',p:'high',q:'What are Reserved Instances?',a:'Reserved Instances offer up to 72% cost savings by committing to a 1-year or 3-year term for specific VM SKUs in specific regions. Best for highly predictable, always-on workloads.',s:28},
  {d:'FinOps',p:'med',q:'What are Azure Savings Plans?',a:'Azure Savings Plans for Compute offer savings of up to 65% by committing to an hourly spend ($/hr) for 1 or 3 years. Applies automatically to compute services globally (VMs, Container Instances, App Services).',s:28},
  {d:'FinOps',p:'med',q:'How do you reduce Azure storage costs?',a:'Apply storage lifecycle policies to transition objects to Cool/Archive tiers. Clean up orphaned managed disks. Use ZRS/LRS instead of GRS where appropriate. Optimize VM disk types.',s:23},
  {d:'FinOps',p:'med',q:'What tagging strategy do you recommend?',a:'Implement tags for: Environment (Prod, Dev, UAT), CostCenter, Owner, ProjectName, and Compliance/Data Classification. Enforce tag existence using Azure Policy (Audit first, then Deny or Modify).',s:28},
  {d:'FinOps',p:'low',q:'How would you create a monthly FinOps report?',a:'Configure Azure Cost Management scheduled exports to output usage CSVs to a secure storage account daily. Connect Power BI to parse, structure, and visualize spending patterns, reservations coverage, and tag compliance.',s:28},
  {d:'IaC & Automation',p:'high',q:'How do you automate Azure deployments?',a:'Deploy using declarative Infrastructure as Code (Terraform/Bicep) running inside CI/CD pipelines (GitHub Actions/Azure Pipelines). Pipelines authenticate via OIDC with Azure Service Principals.',s:21},
  {d:'IaC & Automation',p:'high',q:'Difference between ARM Templates, Bicep, and Terraform.',a:'ARM Templates are JSON-based native declarations. Bicep is a cleaner DSL that transpiles to ARM. Terraform is cloud-agnostic declarative tool using HCL, managing state files to track deployed resources.',s:21},
  {d:'IaC & Automation',p:'med',q:'Which IaC tool do you prefer and why?',a:'Terraform: state management, planning stage (terraform plan), modular structures, vast provider ecosystem, and cloud-agnostic applicability enabling multi-cloud automation.',s:21},
  {d:'IaC & Automation',p:'med',q:'Explain CI/CD integration with Azure infrastructure.',a:'Integrates IaC linting, security scans (Checkov/tfsec), planning dry-runs, and execution in GitHub Actions/Azure DevOps. Code merges trigger automated deploys via OIDC using scoped Service Principals.',s:21},
  {d:'IaC & Automation',p:'med',q:'How do you manage IaC in enterprise environments?',a:'Use remote backend state storage (Azure Storage) with lease blob state locking. Maintain modular code structures. Apply branch protections, pull request reviews, and validation gates in CI/CD.',s:21},
  {d:'Governance',p:'med',q:'Explain Azure CAF (Cloud Adoption Framework).',a:'CAF is Microsofts documentation, guidance, and tools blueprint containing strategies, ready-states, and governance guidelines to plan, implement, and manage cloud migrations.',s:21},
  {d:'Governance',p:'high',q:'What is Enterprise Scale Landing Zone Architecture?',a:'A policy-driven landing zone environment aligned with CAF. Uses subscription democratization to divide workloads into Management Groups (Platform: Connectivity, Identity, Management vs. Workloads: Corp, Online) with inherited guardrails.',s:21},
  {d:'Governance',p:'high',q:'How do Management Groups help large enterprises?',a:'Management Groups are logical containers managing policy, compliance, and access controls across multiple subscriptions. Guardrails and RBAC scopes applied at parent MGs inherit down the subscription tree.',s:19},
  {d:'Governance',p:'high',q:'How do you design governance for 100+ subscriptions?',a:'Implement robust Management Group structure. Apply Azure Policy Initiatives (Azure Security Benchmark) at MG level. Automate subscription provisioning using vending machine IaC templates configuring default VNets, tags, and logging.',s:20},
  {d:'Governance',p:'high',q:'Explain Azure Blueprints (legacy) and current alternatives.',a:'Azure Blueprints packaged templates, policies, and role assignments. Modern alternatives use Landing Zone Vending Machine frameworks deploying via Bicep/Terraform integrated with Azure Policy.',s:20},
  {d:'Expert Design',p:'high',q:'Design a secure hybrid-cloud environment.',a:'Connect on-prem via ExpressRoute (with VPN backup). Follow Hub-and-Spoke topology. Hub contains Azure Firewall; Spoke subnets have UDRs forcing 0.0.0.0/0 to the Firewall. PaaS resources expose only Private Endpoints.',s:24},
  {d:'Expert Design',p:'high',q:'How would you architect a multi-region Azure deployment?',a:'Deploy active-active compute in two Azure regions connected via global VNet peering. Front the architecture with Azure Front Door. Use geo-replicated databases and regional firewalls routed via global configurations.',s:15}
];
var DOMAINS = ['All'];
FAQ_DATA.forEach(function(f){ if(DOMAINS.indexOf(f.d) < 0) DOMAINS.push(f.d); });
var currentDomain = 'All';
var searchTerm = '';
function buildTabs(){
  var tabs = document.getElementById('domainTabs');
  tabs.innerHTML = DOMAINS.map(function(d){
    var cls = d==='All'?'active':'';
    var lbl = d==='All'?'All (85)':d;
    return '<button class="tab-btn '+cls+'" onclick="selectDomain(\''+d+'\')">'+lbl+'</button>';
  }).join('');
}
function selectDomain(d){
  currentDomain = d;
  var btns = document.querySelectorAll('.tab-btn');
  for(var i=0;i<btns.length;i++){
    var lbl = DOMAINS[i]==='All'?'All (85)':DOMAINS[i];
    btns[i].classList.toggle('active', btns[i].textContent.trim()===lbl && DOMAINS[i]===d);
  }
  renderList();
}
function filterFAQs(){
  searchTerm = document.getElementById('searchInput').value.toLowerCase();
  renderList();
}
function navigateToSlide(n){
  try{ window.parent.currentIndex=n-1; if(typeof window.parent.renderScenario==='function') window.parent.renderScenario(); }
  catch(e){ window.parent.postMessage({action:'navigate',slide:n},'*'); }
}
function toggleItem(el){
  el.closest('.faq-item').classList.toggle('open');
}
function renderList(){
  var list = document.getElementById('faqList');
  var filtered = FAQ_DATA.filter(function(f){
    var dm = currentDomain==='All'||f.d===currentDomain;
    var sm = !searchTerm||f.q.toLowerCase().indexOf(searchTerm)>=0||f.a.toLowerCase().indexOf(searchTerm)>=0;
    return dm&&sm;
  });
  document.getElementById('visCount').textContent = filtered.length;
  if(!filtered.length){ list.innerHTML="<div class='no-results'>No questions match your search</div>"; return; }
  var grouped={};
  filtered.forEach(function(f){ if(!grouped[f.d]) grouped[f.d]=[]; grouped[f.d].push(f); });
  var html='';
  Object.keys(grouped).forEach(function(domain){
    var items=grouped[domain];
    html+="<div class='domain-group'><div class='domain-label'>"+domain+" ("+items.length+")</div>";
    items.forEach(function(f){
      var dc=f.p==='high'?'p-high':f.p==='med'?'p-med':'p-low';
      html+="<div class='faq-item'><div class='faq-q' onclick='toggleItem(this)'><div class='priority-dot "+dc+"'></div><div class='q-text'>"+f.q+"</div><button class='slide-badge' onclick='event.stopPropagation();navigateToSlide("+f.s+")'>&#x1F4D8; Slide "+f.s+"</button><div class='chevron'>&#x25BC;</div></div><div class='faq-a'>"+f.a+"</div></div>";
    });
    html+="</div>";
  });
  list.innerHTML = html;
}
buildTabs();
renderList();
</script></body></html>`

};\n\n// Combine: slides 21-28 + slide 29\nconst updatedSlides = [...baseSlides, ...slides21to29, slide29];\n\nfs.writeFileSync(azureJsonPath, JSON.stringify(updatedSlides, null, 2), 'utf8');\n\nconsole.log(\`✅ Successfully appended slides 21-29. Total slides: \${updatedSlides.length}\`);\nconsole.log(\`   Slide 29: "Interview FAQ Master Reference" — 85 questions across 10 domains\`);\nconsole.log(\`   Updated file size: \${(fs.statSync(azureJsonPath).size / 1024).toFixed(1)} KB\`);\n
.faq-header h2{margin:0;font-size:15px;color:#60a5fa;font-weight:700;letter-spacing:.5px}
.faq-stats{display:flex;gap:12px;margin-top:6px;flex-wrap:wrap}
.faq-stat{background:rgba(255,255,255,.07);border:1px solid #1e4a8a;border-radius:20px;padding:2px 10px;font-size:10px;color:#94a3b8}
.faq-stat span{color:#60a5fa;font-weight:700}
.domain-tabs{display:flex;gap:4px;padding:8px 12px;overflow-x:auto;flex-shrink:0;background:#0d1b2e;border-bottom:1px solid #1a2f4f;scrollbar-width:none}
.domain-tabs::-webkit-scrollbar{display:none}
.tab-btn{white-space:nowrap;background:rgba(255,255,255,.05);border:1px solid #1e4a8a;border-radius:16px;padding:4px 12px;font-size:10px;color:#94a3b8;cursor:pointer;transition:all .2s;flex-shrink:0}
.tab-btn:hover,.tab-btn.active{background:#0078d4;border-color:#0078d4;color:#fff;font-weight:600}
.search-bar{padding:8px 12px;background:#0d1b2e;border-bottom:1px solid #1a2f4f;flex-shrink:0}
.search-bar input{width:100%;background:#1e3a5f;border:1px solid #1e4a8a;border-radius:20px;padding:6px 14px;color:#e2e8f0;font-size:12px;outline:none;box-sizing:border-box}
.search-bar input::placeholder{color:#4a6a8a}
.search-bar input:focus{border-color:#0078d4;box-shadow:0 0 0 2px rgba(0,120,212,.2)}
.faq-list{flex:1;overflow-y:auto;padding:8px 12px;display:flex;flex-direction:column;gap:6px}
.faq-list::-webkit-scrollbar{width:4px}
.faq-list::-webkit-scrollbar-track{background:#0d1b2e}
.faq-list::-webkit-scrollbar-thumb{background:#1e4a8a;border-radius:2px}
.domain-group{margin-bottom:6px}
.domain-label{font-size:10px;font-weight:700;color:#60a5fa;text-transform:uppercase;letter-spacing:1px;padding:4px 0 4px 4px;border-left:2px solid #0078d4;margin-bottom:4px}
.faq-item{background:#16213e;border:1px solid #1e3a5f;border-radius:8px;overflow:hidden;transition:border-color .2s}
.faq-item:hover{border-color:#0078d4}
.faq-q{display:flex;align-items:center;gap:8px;padding:8px 10px;cursor:pointer;user-select:none}
.faq-q:hover .q-text{color:#60a5fa}
.priority-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.p-high{background:#ef4444}
.p-med{background:#f59e0b}
.p-low{background:#22c55e}
.q-text{flex:1;font-size:12px;color:#cbd5e1;line-height:1.4;font-weight:500}
.slide-badge{background:#0f3460;border:1px solid #0078d4;border-radius:12px;padding:2px 8px;font-size:9px;color:#60a5fa;cursor:pointer;flex-shrink:0;transition:all .2s;white-space:nowrap}
.slide-badge:hover{background:#0078d4;color:#fff}
.chevron{color:#4a6a8a;font-size:11px;transition:transform .25s;flex-shrink:0}
.faq-item.open .chevron{transform:rotate(180deg)}
.faq-item.open .q-text{color:#60a5fa}
.faq-a{display:none;padding:0 10px 10px 25px;font-size:11px;color:#94a3b8;line-height:1.6;border-top:1px solid #1e3a5f}
.faq-item.open .faq-a{display:block}
.no-results{text-align:center;padding:40px;color:#4a6a8a;font-size:12px}
.footer-hint{padding:6px 12px;text-align:center;font-size:9px;color:#2d4a6a;flex-shrink:0;border-top:1px solid #1a2f4f}
</style>
<div class='faq-wrap'>
  <div class='faq-header'>
    <h2>📋 Interview FAQ Master Reference</h2>
    <div class='faq-stats'>
      <div class='faq-stat'><span id='visCount'>85</span> questions</div>
      <div class='faq-stat'><span>12</span> domains</div>
      <div class='faq-stat'><span>28</span> reference slides</div>
      <div class='faq-stat'><span>100%</span> covered</div>
    </div>
  </div>
  <div class='domain-tabs' id='domainTabs'></div>
  <div class='search-bar'><input id='searchInput' placeholder='🔍 Search questions...' oninput='filterFAQs()'></div>
  <div class='faq-list' id='faqList'></div>
  <div class='footer-hint'>💡 Tap slide badge to navigate • Click question to expand answer</div>
</div>
<script>
const FAQ_DATA = [
  // ── Landing Zones & Governance ──
  {d:'Landing Zones & Governance',p:'high',q:'What is an Azure Landing Zone and why is it important?',a:'An Azure Landing Zone is a multi-subscription environment aligned with Microsoft CAF. It provides structured networking, identity, security, and governance foundations to enable enterprises to scale securely and consistently.',s:21},
  {d:'Landing Zones & Governance',p:'high',q:'How do you design an Azure subscription strategy for Prod and Non-Prod environments?',a:'Enforce subscription-level segregation. Place production workloads in a dedicated Prod subscription and testing/development in Non-Prod under separate Management Groups to isolate costs, enforce distinct security policies, and prevent dev testing from hitting API rate limits.',s:21},
  {d:'Landing Zones & Governance',p:'high',q:'Explain Management Groups, Subscriptions, Resource Groups, and Resources hierarchy.',a:'Azure resources are organized hierarchically: Tenant Root Group → Management Groups (logical grouping for policies/access) → Subscriptions (billing and scaling boundary) → Resource Groups (lifecycle boundary) → Resources. Inherited permissions flow downwards.',s:19},
  {d:'Landing Zones & Governance',p:'high',q:'What is Azure Policy and how is it different from RBAC?',a:'Azure Policy evaluates resource configuration properties to ensure compliance (guardrails). RBAC regulates authorization based on user actions and scopes (gates). Policy = configuration enforcement; RBAC = identity authorization.',s:20},
  {d:'Landing Zones & Governance',p:'med',q:'How do you prevent users from creating resources in unauthorized regions?',a:'Assign the built-in Azure Policy Allowed locations definition at the Management Group scope, parameterizing it with allowed regions to block deployments elsewhere via Deny effect.',s:20},
  {d:'Landing Zones & Governance',p:'med',q:'How would you enforce tagging across subscriptions?',a:'Use Azure Policy. Deploy Require a tag and its value policies to block deployments missing tags, or use Inherit a tag from the resource group policy with Modify effect to auto-populate.',s:20},
  {d:'Landing Zones & Governance',p:'high',q:'Design an Azure environment for Production, UAT, and Dev environments.',a:'Establish Management Group hierarchy with separate branches for Prod and Non-Prod. Deploy distinct subscriptions for Dev, UAT, and Prod. Link spoke VNets back to a central Hub subscription for shared security inspection.',s:21},
  {d:'Landing Zones & Governance',p:'high',q:'How would you design a secure landing zone for a new enterprise customer?',a:'Follow CAF landing zone guidelines. Provision Platform MGs (Connectivity, Identity, Management) and Landing Zone MGs. Apply security benchmarks via Azure Policy Initiatives, and deploy Hub-Spoke topology with Azure Firewall.',s:21},
  {d:'Landing Zones & Governance',p:'med',q:'How do you standardize governance across multiple subscriptions?',a:'Group individual policies into Initiatives (e.g. ASB). Assign these Initiatives at the Management Group scope so they propagate automatically to all existing and future child subscriptions.',s:20},
  // ── Advanced Networking ──
  {d:'Advanced Networking',p:'high',q:'What are the benefits of Hub-and-Spoke architecture?',a:'Hub-and-Spoke centralizes common services (VPN/ExpressRoute gateways, Azure Firewall, Log Analytics) in a Hub VNet while separating workloads into isolated Spoke VNets. Reduces redundant costs, simplifies governance, and provides centralized security inspection.',s:7},
  {d:'Advanced Networking',p:'high',q:'What components typically reside in the Hub VNet?',a:'The Hub VNet typically hosts: Azure Firewall, Virtual Network Gateways (VPN/ExpressRoute), Azure Bastion, private DNS resolvers, and shared domain controllers (Active Directory).',s:7},
  {d:'Advanced Networking',p:'high',q:'How do Spoke VNets communicate securely with each other?',a:'Spoke VNets peer to the Hub VNet (not directly to each other). Inter-spoke traffic is routed through UDRs with next-hop pointing to the centralized Azure Firewall in the Hub VNet.',s:8},
  {d:'Advanced Networking',p:'med',q:'What are the advantages and disadvantages of VNet Peering?',a:'Advantages: Low-latency, high-bandwidth over Microsoft backbone, easy config, low transit cost. Disadvantages: No overlapping IP spaces, peering counts against limits, non-transitive by default.',s:21},
  {d:'Advanced Networking',p:'high',q:'Explain the difference between NSG, Azure Firewall, and UDR.',a:'NSGs are basic Layer 4 packet filters at subnet/NIC level. Azure Firewall is a centralized stateful L4/L7 firewall-as-a-service with FQDN filtering. UDRs are custom routing tables applied to subnets to override default routing paths.',s:7},
  {d:'Advanced Networking',p:'med',q:'How does Azure Firewall process traffic?',a:'Azure Firewall evaluates in order: 1) DNAT rules (highest priority), 2) Network rules (IP/port filtering), 3) Application rules (FQDN/HTTP headers). First match wins.',s:7},
  {d:'Advanced Networking',p:'high',q:'What is the difference between Site-to-Site VPN and Point-to-Site VPN?',a:'S2S connects an entire branch/on-premises network to Azure via IPsec/IKE tunnel (requires on-prem VPN device). P2S connects individual remote clients directly to Azure using SSTP/IKEv2/OpenVPN (no on-prem hardware needed).',s:2},
  {d:'Advanced Networking',p:'high',q:'When would you choose ExpressRoute instead of VPN?',a:'Choose ExpressRoute for high dedicated bandwidth (up to 100 Gbps), ultra-low predictable latency, higher security compliance (bypasses public internet), and 99.95% SLA guarantees.',s:9},
  {d:'Advanced Networking',p:'high',q:'How does Azure Load Balancer work?',a:'Azure Load Balancer operates at Layer 4 (TCP/UDP), distributing inbound traffic based on a 5-tuple hash (source IP, source port, dest IP, dest port, protocol) to backend pool instances verified by health probes.',s:3},
  {d:'Advanced Networking',p:'high',q:'Difference between Azure Load Balancer and Application Gateway.',a:'Azure Load Balancer is a Layer 4 TCP/UDP load balancer (cannot read HTTP headers). Application Gateway is a Layer 7 HTTP/HTTPS load balancer supporting URL path-based routing, SSL/TLS termination, and WAF integration.',s:4},
  {d:'Advanced Networking',p:'med',q:'How do you troubleshoot connectivity between Azure and On-Premises?',a:'Use Network Watcher Connection Monitor. Check VNet Gateway status and active BGP routes. Run effective route table commands. Review NSG Flow Logs and check for overlapping CIDR blocks.',s:11},
  {d:'Advanced Networking',p:'med',q:'Explain Azure Route Tables and route precedence.',a:'Azure routes by longest prefix match. Precedence: 1) User Defined Routes (highest), 2) BGP routes (VPN/ExpressRoute gateway), 3) System routes (lowest).',s:8},
  {d:'Advanced Networking',p:'med',q:'How does BGP work with ExpressRoute?',a:'BGP dynamically exchanges routing information between on-premises and Azure VNets via eBGP peerings over private or Microsoft VIFs across the ExpressRoute circuit, enabling automatic failover and path preference tuning.',s:9},
  {d:'Advanced Networking',p:'med',q:'What are forced tunneling and custom routing?',a:'Forced tunneling redirects all internet-bound traffic (0.0.0.0/0) from spoke subnets to a central NVA/Firewall or on-premises gateway using UDRs.',s:8},
  {d:'Advanced Networking',p:'med',q:'Explain Azure Firewall Premium features.',a:'Premium features: 1) TLS Inspection (decrypts outbound traffic), 2) IDPS (Intrusion Detection and Prevention signature matching), 3) URL Filtering, 4) Web Categories.',s:7},
  {d:'Advanced Networking',p:'low',q:'Difference between Global VNet Peering and Regional Peering.',a:'Regional Peering connects VNets in the same region over local switches with negligible latency. Global Peering connects VNets across different regions over the Microsoft backbone. Both use private IPs.',s:21},
  {d:'Advanced Networking',p:'med',q:'Users cannot access an application hosted in Azure. How would you troubleshoot?',a:'Check App Gateway/Load Balancer backend pool health probes. Verify NSGs and Azure Firewall rules. Run Network Watcher IP Flow Verify to trace packet blocks.',s:11},
  {d:'Advanced Networking',p:'med',q:'VPN tunnel is up but traffic is not flowing. What checks would you perform?',a:'Check BGP route advertisements on both sides. Verify UDRs on Spoke subnets force routing through the Gateway. Ensure no overlapping subnet IP ranges. Check local network gateway prefixes.',s:11},
  {d:'Advanced Networking',p:'med',q:'Two VNets cannot communicate. How would you troubleshoot?',a:'Verify VNet Peering status is Connected. Ensure Allow forwarded traffic and Use remote gateways settings are enabled. Check NSGs allow peer VNet range traffic.',s:11},
  // ── Compute HA & Scaling ──
  {d:'Compute HA & Scaling',p:'high',q:'Difference between Availability Set and Availability Zone.',a:'Availability Sets distribute VMs across racks inside a single datacenter (SLA 99.95%). Availability Zones distribute VMs across physically separate datacenters within a region with independent power/cooling/network (SLA 99.99%).',s:22},
  {d:'Compute HA & Scaling',p:'high',q:'What is a VM Scale Set and when should it be used?',a:'VMSS deploys and manages a group of identical, auto-scaling VMs. Use for stateless, highly scalable workloads (web servers, microservices, AKS worker pools) with fluctuating traffic.',s:22},
  {d:'Compute HA & Scaling',p:'high',q:'How would you migrate 200 on-premises servers to Azure?',a:'Use Azure Migrate. Deploy the collector appliance on-premises to discover workloads, assess VM compatibility and sizing, estimate costs, and execute replication batches into target subscriptions/VNets.',s:21},
  {d:'Compute HA & Scaling',p:'med',q:'A VM CPU usage is consistently above 90%. What actions would you take?',a:'Check VMSS autoscale rules to ensure instances scale out. Optimize application memory leaks, check for run-away processes via SSH/RDP, or vertically scale (upsize) the VM instance type.',s:22},
  {d:'Compute HA & Scaling',p:'high',q:'Design a highly available web application architecture in Azure.',a:'Fronted by Azure Front Door routing to regional Application Gateways. Compute runs on VMSS across Availability Zones. Storage uses ZRS storage accounts, and database uses Azure SQL with Active Geo-Replication.',s:22},
  // ── Secure Remote Access ──
  {d:'Secure Remote Access',p:'high',q:'What is Private Endpoint and how does it differ from Service Endpoint?',a:'Private Endpoint allocates a private IP from your VNet directly to the PaaS resource, routing traffic privately via DNS and disabling public internet access. Service Endpoint keeps the public IP active but extends your VNet identity to the PaaS over the Microsoft backbone.',s:24},
  {d:'Secure Remote Access',p:'high',q:'What is Azure Bastion and what problem does it solve?',a:'Azure Bastion is a managed PaaS providing secure, browser-based RDP/SSH access to VMs over TLS (port 443). Eliminates the need to expose VMs to the internet or manage vulnerable jump boxes.',s:24},
  {d:'Secure Remote Access',p:'med',q:'Explain Azure Private DNS Zones.',a:'Azure Private DNS Zones resolve hostnames within a VNet (or linked VNets) without exposing DNS queries to the public internet. Essential for Private Endpoint name resolution to map public PaaS URLs to private IPs.',s:10},
  // ── Identity & Governance ──
  {d:'Identity & Governance',p:'high',q:'Explain Azure RBAC.',a:'Azure RBAC manages who has access to Azure resources, what they can do, and what scopes they have. Assign a security principal (User, Group, SP, Managed Identity) to a Role Definition at a target Scope.',s:25},
  {d:'Identity & Governance',p:'high',q:'Difference between Owner, Contributor, and Reader roles.',a:'Owner: full access including permission delegation. Contributor: full resource management, cannot delegate access. Reader: view only, cannot create/modify/delete.',s:25},
  {d:'Identity & Governance',p:'high',q:'What are Managed Identities?',a:'Managed Identities provide an automatically managed identity in Microsoft Entra ID for Azure resources (VMs, App Services) to authenticate to other services (databases, Key Vaults) without storing credentials in code.',s:25},
  {d:'Identity & Governance',p:'high',q:'Difference between Managed Identity and Service Principal.',a:'Managed Identities are tied to Azure resource lifecycles with no credential management required. Service Principals are application registrations in Entra ID relying on user-managed client secrets or certificates.',s:25},
  {d:'Identity & Governance',p:'high',q:'How do you implement least-privilege access?',a:'Assign roles at the narrowest scope (Resource Group over Subscription). Use custom roles with specific action lists over broad built-in roles. Implement Entra PIM for JIT access.',s:25},
  {d:'Identity & Governance',p:'med',q:'Explain Conditional Access Policies and MFA.',a:'Conditional Access is Entra IDs policy engine evaluating signals (user location, device compliance, risk level) to enforce access decisions (Block, Allow, or require MFA).',s:25},
  {d:'Identity & Governance',p:'high',q:'Developers require temporary elevated permissions. What is the best approach?',a:'Configure Entra ID PIM (Privileged Identity Management). Assign developers eligible roles requiring MFA, justification, and approval gates to activate JIT access for a fixed duration.',s:25},
  // ── Security & Threat Protection ──
  {d:'Security & Threat Protection',p:'high',q:'What is Microsoft Defender for Cloud?',a:'Microsoft Defender for Cloud is a unified security management system providing Cloud Security Posture Management (CSPM) to evaluate compliance scores, and Cloud Workload Protection (CWPP) to detect threats across workloads.',s:26},
  {d:'Security & Threat Protection',p:'high',q:'How do you secure Azure Key Vault?',a:'1) Enable Soft Delete and Purge Protection, 2) Use Azure RBAC authorization model instead of legacy access policies, 3) Restrict network access via private endpoints/firewalls, 4) Rotate vault keys regularly.',s:26},
  {d:'Security & Threat Protection',p:'med',q:'Explain encryption at rest and encryption in transit.',a:'Encryption at rest encrypts stored data on disks/databases via Azure Storage Service Encryption or SQL TDE using Platform-Managed or Customer-Managed Keys. Encryption in transit secures data moving over networks using TLS/SSL.',s:26},
  {d:'Security & Threat Protection',p:'high',q:'How would you handle a client security audit?',a:'Generate compliance reports from Defender for Cloud demonstrating alignment with standards (ISO 27001). Provide audit trails from Activity Logs, present Key Vault RBAC configurations, and demonstrate policy compliance statistics.',s:26},
  {d:'Security & Threat Protection',p:'high',q:'A storage account is publicly accessible. How would you secure it?',a:'Set Storage Firewall to Enabled from selected networks. Create a Private Endpoint mapping the storage account to a backend subnet, and disable Allow storage account public access globally.',s:23},
  {d:'Security & Threat Protection',p:'high',q:'How would you implement Zero Trust in Azure?',a:'Enforce Zero Trust: 1) Verify explicitly (Conditional Access, MFA), 2) Use least privilege (RBAC, PIM), 3) Assume breach (micro-segmentation with NSGs, private links, threat logging).',s:26},
  {d:'Security & Threat Protection',p:'med',q:'How would you manage secrets for applications?',a:'Store secrets in Azure Key Vault. Enable Managed Identities on compute resources and grant them permission to retrieve secrets dynamically at runtime without hardcoding keys.',s:26},
  {d:'Security & Threat Protection',p:'high',q:'How would you secure an enterprise Azure environment from day one?',a:'Enforce MFA and PIM. Configure Management Group hierarchies with Azure Policy Initiatives. Deploy Hub-and-Spoke with Azure Firewall. Disable VM public IPs, route administration via Bastion, resolve PaaS via Private Endpoints.',s:26},
  // ── Operations & Monitoring ──
  {d:'Operations & Monitoring',p:'high',q:'What is Azure Monitor?',a:'Azure Monitor is a comprehensive solution for collecting, analyzing, and acting on telemetry from cloud and on-premises environments. It handles metrics (numeric performance data) and logs (structured resource records).',s:12},
  {d:'Operations & Monitoring',p:'high',q:'Difference between Azure Monitor and Log Analytics.',a:'Azure Monitor is the overarching service for monitoring and alerts. Log Analytics is the primary workspace within Azure Monitor used to query, store, and analyze log data using KQL (Kusto Query Language).',s:12},
  {d:'Operations & Monitoring',p:'med',q:'How do you create alert rules?',a:'Define the alert condition (metric threshold or log query), set evaluation frequency, and link the alert to an Action Group containing notification receivers or automation runbooks.',s:12},
  {d:'Operations & Monitoring',p:'med',q:'How do you investigate performance issues in Azure?',a:'View Azure Monitor metrics (CPU, Memory, Disk, Network). Review Log Analytics workspaces using KQL to identify error events, query database executions, and run Application Insights tracing.',s:11},
  {d:'Operations & Monitoring',p:'med',q:'Application logs are missing. How would you troubleshoot?',a:'Check the resources Diagnostic Settings to ensure log sending is enabled and points to the correct Log Analytics Workspace. Verify VM log agents (AMA) are running successfully.',s:12},
  {d:'Operations & Monitoring',p:'med',q:'How would you integrate Azure logs with a SIEM?',a:'Configure Diagnostic Settings on resources to export logs to an Azure Event Hub, which is connected to your external SIEM (Splunk, QRadar) to pull and parse logs.',s:12},
  {d:'Operations & Monitoring',p:'high',q:'An application is experiencing high latency. How would you investigate?',a:'Run Network Watcher Connection Monitor to measure network latency. Investigate VM CPU/RAM bottlenecks. Query Log Analytics/App Insights to isolate database query bottlenecks or API dependencies.',s:11},
  // ── Backup & Recovery ──
  {d:'Backup & Recovery',p:'high',q:'What is Azure Backup?',a:'Azure Backup is a fully managed service that protects files, folders, VM system states, and SQL/SAP databases by backing them up to a Recovery Services Vault with customizable retention schedules.',s:13},
  {d:'Backup & Recovery',p:'high',q:'What is Azure Site Recovery?',a:'Azure Site Recovery (ASR) is a disaster recovery orchestration service providing continuous replication of VMs from source to target regions, supporting automated failover and failback testing.',s:14},
  {d:'Backup & Recovery',p:'high',q:'Explain RPO and RTO.',a:'Recovery Point Objective (RPO) is the maximum tolerable data loss window (time). Recovery Time Objective (RTO) is the maximum tolerable application downtime window before business impact.',s:18},
  {d:'Backup & Recovery',p:'high',q:'How would you design a multi-region DR solution?',a:'Architect active-passive or active-active sites in paired regions. Replicate VMs using ASR, enable SQL Geo-Replication/Failover Groups, utilize GRS storage accounts, and route regional traffic via Azure Front Door.',s:15},
  {d:'Backup & Recovery',p:'high',q:'How do failover and failback work?',a:'Failover routes traffic to a secondary DR site when the primary site experiences an outage. Failback returns production traffic from the secondary site back to the primary site after it is restored.',s:16},
  {d:'Backup & Recovery',p:'high',q:'A region-wide outage occurs. What steps would you take?',a:'Verify Azure Status health dashboard. Trigger failover via Azure Front Door/Traffic Manager to route traffic to the secondary region. Initiate ASR failover recovery plans to spin up replicas.',s:15},
  {d:'Backup & Recovery',p:'med',q:'How do you validate DR readiness?',a:'Perform regular Test Failovers in Azure Site Recovery. This provisions VM replicas in an isolated sandbox VNet without interrupting production replication, enabling validation tests.',s:17},
  {d:'Backup & Recovery',p:'med',q:'How frequently should failover testing be performed?',a:'Perform DR testing at least semi-annually or annually as mandated by enterprise compliance policies, alongside automated dry-run testing validations.',s:17},
  {d:'Backup & Recovery',p:'high',q:'Design a DR strategy with less than 30-minute RPO.',a:'Configure ASR replicating VMs to a paired region (RPO ~5 min). Enable Azure SQL Auto-Failover Groups (RPO <5 sec) and utilize Geo-Redundant Storage (GRS).',s:18},
  // ── Cost Optimization ──
  {d:'Cost Optimization (FinOps)',p:'high',q:'How do you identify cost optimization opportunities?',a:'Utilize Azure Advisor recommendations, configure anomaly alerts in Azure Cost Management, and run KQL queries in Azure Resource Graph to scan for orphaned disks, idle resources, and unused public IPs.',s:28},
  {d:'Cost Optimization (FinOps)',p:'high',q:'What are Reserved Instances?',a:'Reserved Instances offer up to 72% cost savings by committing to a 1-year or 3-year term for specific VM SKUs in specific regions. Best for highly predictable, always-on workloads.',s:28},
  {d:'Cost Optimization (FinOps)',p:'med',q:'What are Azure Savings Plans?',a:'Azure Savings Plans for Compute offer savings of up to 65% by committing to an hourly spend ($/hr) for 1 or 3 years. Applies automatically to compute services globally (VMs, Container Instances, App Services).',s:28},
  {d:'Cost Optimization (FinOps)',p:'med',q:'How do you reduce Azure storage costs?',a:'Apply storage lifecycle policies to transition objects to Cool/Archive tiers. Clean up orphaned managed disks. Use ZRS/LRS instead of GRS where appropriate. Optimize VM disk types.',s:23},
  {d:'Cost Optimization (FinOps)',p:'med',q:'What tagging strategy do you recommend?',a:'Implement tags for: Environment (Prod, Dev, UAT), CostCenter, Owner, ProjectName, and Compliance/Data Classification. Enforce tag existence using Azure Policy (Audit first, then Deny or Modify).',s:28},
  {d:'Cost Optimization (FinOps)',p:'low',q:'How would you create a monthly FinOps report?',a:'Configure Azure Cost Management scheduled exports to output usage CSVs to a secure storage account daily. Connect Power BI to parse, structure, and visualize spending patterns, reservations coverage, and tag compliance.',s:28},
  // ── Automation & IaC ──
  {d:'Automation & IaC',p:'high',q:'How do you automate Azure deployments?',a:'Deploy using declarative Infrastructure as Code (Terraform/Bicep) running inside CI/CD pipelines (GitHub Actions/Azure Pipelines). Pipelines authenticate via OIDC with Azure Service Principals.',s:21},
  {d:'Automation & IaC',p:'high',q:'Difference between ARM Templates, Bicep, and Terraform.',a:'ARM Templates are JSON-based native declarations. Bicep is a cleaner DSL that transpiles to ARM. Terraform is cloud-agnostic declarative tool using HCL, managing state files to track deployed resources.',s:21},
  {d:'Automation & IaC',p:'med',q:'Which IaC tool do you prefer and why?',a:'Terraform: state management, planning stage (terraform plan), modular structures, vast provider ecosystem, and cloud-agnostic applicability enabling multi-cloud automation.',s:21},
  {d:'Automation & IaC',p:'med',q:'Explain CI/CD integration with Azure infrastructure.',a:'Integrates IaC linting, security scans (Checkov/tfsec), planning dry-runs, and execution in GitHub Actions/Azure DevOps. Code merges trigger automated deploys via OIDC using scoped Service Principals.',s:21},
  {d:'Automation & IaC',p:'med',q:'How do you manage IaC in enterprise environments?',a:'Use remote backend state storage (Azure Storage) with lease blob state locking. Maintain modular code structures. Apply branch protections, pull request reviews, and validation gates in CI/CD.',s:21},
  // ── Governance & Enterprise Scale ──
  {d:'Governance & Enterprise Scale',p:'med',q:'Explain Azure CAF (Cloud Adoption Framework).',a:'CAF is Microsofts documentation, guidance, and tools blueprint containing strategies, ready-states, and governance guidelines to plan, implement, and manage cloud migrations.',s:21},
  {d:'Governance & Enterprise Scale',p:'high',q:'What is Enterprise Scale Landing Zone Architecture?',a:'A policy-driven landing zone environment aligned with CAF. Uses subscription democratization to divide workloads into Management Groups (Platform: Connectivity, Identity, Management vs. Workloads: Corp, Online) with inherited guardrails.',s:21},
  {d:'Governance & Enterprise Scale',p:'high',q:'How do Management Groups help large enterprises?',a:'Management Groups are logical containers managing policy, compliance, and access controls across multiple subscriptions. Guardrails and RBAC scopes applied at parent MGs inherit down the subscription tree.',s:19},
  {d:'Governance & Enterprise Scale',p:'high',q:'How do you design governance for 100+ subscriptions?',a:'Implement robust Management Group structure. Apply Azure Policy Initiatives (Azure Security Benchmark) at MG level. Automate subscription provisioning using vending machine IaC templates configuring default VNets, tags, and logging.',s:20},
  {d:'Governance & Enterprise Scale',p:'high',q:'Explain Azure Blueprints (legacy) and current alternatives.',a:'Azure Blueprints packaged templates, policies, and role assignments. Modern alternatives use Landing Zone Vending Machine frameworks deploying via Bicep/Terraform integrated with Azure Policy.',s:20},
  // ── Expert Design Questions ──
  {d:'Expert Design Questions',p:'high',q:'Design a secure hybrid-cloud environment.',a:'Connect on-prem via ExpressRoute (with VPN backup). Follow Hub-and-Spoke topology. Hub contains Azure Firewall; Spoke subnets have UDRs forcing 0.0.0.0/0 to the Firewall. PaaS resources expose only Private Endpoints.',s:24},
  {d:'Expert Design Questions',p:'high',q:'How would you architect a multi-region Azure deployment?',a:'Deploy active-active compute in two Azure regions connected via global VNet peering. Front the architecture with Azure Front Door. Use geo-replicated databases and regional firewalls routed via global configurations.',s:15}
];

const DOMAINS = ['All', ...new Set(FAQ_DATA.map(f => f.d))];
let currentDomain = 'All';
let searchTerm = '';

function buildTabs() {
  const tabs = document.getElementById('domainTabs');
  tabs.innerHTML = DOMAINS.map(function(d) {
    var cls = d === 'All' ? 'active' : '';
    var label = d === 'All' ? '\uD83C\uDF10 All (85)' : d;
    return '<button class="tab-btn ' + cls + '" onclick="selectDomain(\'' + d + '\')">' + label + '</button>';
  }).join('');
}

function selectDomain(d) {
  currentDomain = d;
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.startsWith(d === 'All' ? '🌐' : d));
  });
  renderList();
}

function filterFAQs() {
  searchTerm = document.getElementById('searchInput').value.toLowerCase();
  renderList();
}

function navigateToSlide(slideNum) {
  if (window.parent && window.parent.currentIndex !== undefined) {
    window.parent.currentIndex = slideNum - 1;
    if (typeof window.parent.renderScenario === 'function') window.parent.renderScenario();
  } else {
    window.parent.postMessage({ action: 'navigate', slide: slideNum }, '*');
  }
}

function toggleItem(el) {
  el.closest('.faq-item').classList.toggle('open');
}

function renderList() {
  var list = document.getElementById('faqList');
  var filtered = FAQ_DATA.filter(function(f) {
    var domainMatch = currentDomain === 'All' || f.d === currentDomain;
    var searchMatch = !searchTerm || f.q.toLowerCase().indexOf(searchTerm) >= 0 || f.a.toLowerCase().indexOf(searchTerm) >= 0;
    return domainMatch && searchMatch;
  });

  document.getElementById('visCount').textContent = filtered.length;

  if (filtered.length === 0) {
    list.innerHTML = "<div class='no-results'>\uD83D\uDD0D No questions match your search</div>";
    return;
  }

  var grouped = {};
  filtered.forEach(function(f) {
    if (!grouped[f.d]) grouped[f.d] = [];
    grouped[f.d].push(f);
  });

  var html = '';
  Object.keys(grouped).forEach(function(domain) {
    var items = grouped[domain];
    html += "<div class='domain-group'><div class='domain-label'>" + domain + " (" + items.length + ")</div>";
    items.forEach(function(f) {
      var dotClass = f.p === 'high' ? 'p-high' : f.p === 'med' ? 'p-med' : 'p-low';
      html += "<div class='faq-item'>" +
        "<div class='faq-q' onclick='toggleItem(this)'>" +
        "<div class='priority-dot " + dotClass + "'></div>" +
        "<div class='q-text'>" + f.q + "</div>" +
        "<button class='slide-badge' onclick='event.stopPropagation();navigateToSlide(" + f.s + ")' title='Go to Slide " + f.s + "'>\uD83D\uDCD8 Slide " + f.s + "</button>" +
        "<div class='chevron'>\u25BC</div>" +
        "</div>" +
        "<div class='faq-a'>" + f.a + "</div>" +
        "</div>";
    });
    html += '</div>';
  });

  list.innerHTML = html;
}

buildTabs();
renderList();
</script>`, `
.faq-wrap{height:calc(100vh - 32px) !important}
`)  // slide29 end
};

// Combine: slides 21-28 + slide 29
const updatedSlides = [...baseSlides, ...slides21to29, slide29];

fs.writeFileSync(azureJsonPath, JSON.stringify(updatedSlides, null, 2), 'utf8');

console.log(`✅ Successfully appended slides 21-29. Total slides: ${updatedSlides.length}`);
console.log(`   Slide 29: "Interview FAQ Master Reference" — 85 questions across 10 domains`);
console.log(`   Updated file size: ${(fs.statSync(azureJsonPath).size / 1024).toFixed(1)} KB`);
