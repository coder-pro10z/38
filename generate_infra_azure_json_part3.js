// generate_infra_azure_json_part3.js
// Run: node generate_infra_azure_json_part3.js
// Output: Appends slides 21-28 to infra_azure.json

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

const slides21to28 = [
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
Always isolate Production workloads in dedicated subscriptions distinct from Development/UAT. This enforces strict security boundaries, prevents dev testing from consuming production API limits or compute quotas, and simplifies FinOps billing allocations.`,
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

// Combine base slides and new slides
const updatedSlides = [...baseSlides, ...slides21to28];

fs.writeFileSync(azureJsonPath, JSON.stringify(updatedSlides, null, 2), 'utf8');

console.log(`✅ Successfully appended slides 21-28. Total slides: ${updatedSlides.length}`);
console.log(`   Updated file size: ${(fs.statSync(azureJsonPath).size / 1024).toFixed(1)} KB`);
