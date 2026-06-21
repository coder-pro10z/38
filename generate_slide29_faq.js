// generate_slide29_faq.js
// Run: node generate_slide29_faq.js
// Appends Slide 29 (Interview FAQ Master Reference) to infra_azure.json

const fs = require('fs');
const path = require('path');

const azureJsonPath = path.join(__dirname, 'infra_azure.json');
let slides = JSON.parse(fs.readFileSync(azureJsonPath, 'utf8'));

// Ensure we only keep first 28 slides before appending
if (slides.length >= 29) {
  console.log('Trimming to 28 slides before re-appending slide 29...');
  slides = slides.slice(0, 28);
}

// Build the FAQ interactive HTML as a plain string
var faqHtml = [
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>FAQ Master Reference</title><style>',
  '*{box-sizing:border-box;margin:0;padding:0}',
  'html,body{height:100%;overflow:hidden;font-family:Segoe UI,sans-serif;background:#0f172a;color:#e2e8f0}',
  '.faq-wrap{height:100vh;display:flex;flex-direction:column;overflow:hidden}',
  '.faq-header{background:linear-gradient(135deg,#1e3a5f,#0f3460);padding:10px 14px;border-bottom:1px solid #1e4a8a;flex-shrink:0}',
  '.faq-header h2{margin:0;font-size:14px;color:#60a5fa;font-weight:700}',
  '.faq-stats{display:flex;gap:8px;margin-top:5px;flex-wrap:wrap}',
  '.faq-stat{background:rgba(255,255,255,.07);border:1px solid #1e4a8a;border-radius:20px;padding:2px 8px;font-size:10px;color:#94a3b8}',
  '.faq-stat span{color:#60a5fa;font-weight:700}',
  '.domain-tabs{display:flex;gap:4px;padding:6px 12px;overflow-x:auto;flex-shrink:0;background:#0d1b2e;border-bottom:1px solid #1a2f4f;scrollbar-width:none}',
  '.domain-tabs::-webkit-scrollbar{display:none}',
  '.tab-btn{white-space:nowrap;background:rgba(255,255,255,.05);border:1px solid #1e4a8a;border-radius:16px;padding:3px 10px;font-size:10px;color:#94a3b8;cursor:pointer;transition:all .2s;flex-shrink:0}',
  '.tab-btn:hover,.tab-btn.active{background:#0078d4;border-color:#0078d4;color:#fff;font-weight:600}',
  '.search-bar{padding:6px 12px;background:#0d1b2e;border-bottom:1px solid #1a2f4f;flex-shrink:0}',
  '.search-bar input{width:100%;background:#1e3a5f;border:1px solid #1e4a8a;border-radius:20px;padding:5px 12px;color:#e2e8f0;font-size:12px;outline:none}',
  '.search-bar input::placeholder{color:#4a6a8a}',
  '.search-bar input:focus{border-color:#0078d4}',
  '.faq-list{flex:1;overflow-y:auto;padding:6px 12px;display:flex;flex-direction:column;gap:5px}',
  '.faq-list::-webkit-scrollbar{width:3px}',
  '.faq-list::-webkit-scrollbar-thumb{background:#1e4a8a;border-radius:2px}',
  '.domain-group{margin-bottom:4px}',
  '.domain-label{font-size:10px;font-weight:700;color:#60a5fa;text-transform:uppercase;letter-spacing:1px;padding:3px 0 3px 4px;border-left:2px solid #0078d4;margin-bottom:3px}',
  '.faq-item{background:#16213e;border:1px solid #1e3a5f;border-radius:7px;overflow:hidden;transition:border-color .2s}',
  '.faq-item:hover{border-color:#0078d4}',
  '.faq-q{display:flex;align-items:center;gap:7px;padding:7px 9px;cursor:pointer;user-select:none}',
  '.priority-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}',
  '.p-high{background:#ef4444}.p-med{background:#f59e0b}.p-low{background:#22c55e}',
  '.q-text{flex:1;font-size:11px;color:#cbd5e1;line-height:1.4;font-weight:500}',
  '.faq-item.open .q-text{color:#60a5fa}',
  '.slide-badge{background:#0f3460;border:1px solid #0078d4;border-radius:10px;padding:2px 7px;font-size:9px;color:#60a5fa;cursor:pointer;flex-shrink:0;transition:all .2s;white-space:nowrap}',
  '.slide-badge:hover{background:#0078d4;color:#fff}',
  '.chevron{color:#4a6a8a;font-size:10px;transition:transform .2s;flex-shrink:0}',
  '.faq-item.open .chevron{transform:rotate(180deg)}',
  '.faq-a{display:none;padding:0 9px 8px 22px;font-size:11px;color:#94a3b8;line-height:1.6;border-top:1px solid #1e3a5f}',
  '.faq-item.open .faq-a{display:block}',
  '.no-results{text-align:center;padding:30px;color:#4a6a8a;font-size:12px}',
  '.footer-hint{padding:4px 12px;text-align:center;font-size:9px;color:#2d4a6a;flex-shrink:0;border-top:1px solid #1a2f4f}',
  '</style></head><body>',
  '<div class="faq-wrap">',
  '  <div class="faq-header">',
  '    <h2>&#x1F4CB; Interview FAQ Master Reference &mdash; 101 Questions</h2>',
  '    <div class="faq-stats">',
  '      <div class="faq-stat"><span id="visCount">101</span> questions</div>',
  '      <div class="faq-stat"><span>12</span> domains</div>',
  '      <div class="faq-stat"><span>28</span> ref slides</div>',
  '      <div class="faq-stat"><span>100%</span> covered</div>',
  '    </div>',
  '  </div>',
  '  <div class="domain-tabs" id="domainTabs"></div>',
  '  <div class="search-bar"><input id="searchInput" placeholder="Search questions, keywords, answers..." oninput="filterFAQs()"></div>',
  '  <div class="faq-list" id="faqList"></div>',
  '  <div class="footer-hint">&#x1F4A1; Click question to expand answer &bull; Tap slide badge to navigate</div>',
  '</div>'
].join('\n');

// FAQ data as JS object array (no template literals needed)
var faqData = [
  {d:'Landing Zones',p:'high',q:'What is an Azure Landing Zone and why is it important?',a:'A multi-subscription environment aligned with Microsoft CAF. Provides structured networking, identity, security, and governance foundations to enable enterprises to scale securely.',s:21},
  {d:'Landing Zones',p:'high',q:'How do you design an Azure subscription strategy for Prod and Non-Prod?',a:'Enforce subscription-level segregation. Place Prod workloads in a dedicated Prod subscription and Dev/UAT in Non-Prod under separate Management Groups to isolate costs and enforce distinct security policies.',s:21},
  {d:'Landing Zones',p:'high',q:'Explain Management Groups, Subscriptions, Resource Groups, and Resources hierarchy.',a:'Tenant Root Group -> Management Groups (logical grouping for policies/access) -> Subscriptions (billing and scaling boundary) -> Resource Groups (lifecycle boundary) -> Resources. Inherited permissions flow downwards.',s:19},
  {d:'Landing Zones',p:'high',q:'What is Azure Policy and how is it different from RBAC?',a:'Azure Policy evaluates resource configuration properties to ensure compliance (guardrails). RBAC regulates authorization based on user actions and scopes (gates). Policy = configuration enforcement; RBAC = identity authorization.',s:20},
  {d:'Landing Zones',p:'med',q:'How do you prevent users from creating resources in unauthorized regions?',a:'Assign the built-in Azure Policy Allowed locations definition at the Management Group scope with Deny effect to block deployments elsewhere.',s:20},
  {d:'Landing Zones',p:'med',q:'How would you enforce tagging across subscriptions?',a:'Use Azure Policy. Deploy Require a tag and its value policies to block deployments missing tags, or Inherit a tag from the resource group policy with Modify effect to auto-populate.',s:20},
  {d:'Landing Zones',p:'high',q:'Design an Azure environment for Production, UAT, and Dev.',a:'Establish MG hierarchy with separate branches for Prod and Non-Prod. Deploy distinct subscriptions for Dev, UAT, and Prod. Link spoke VNets back to a central Hub subscription for shared security inspection.',s:21},
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
  {d:'Networking',p:'low',q:'Difference between Global VNet Peering and Regional Peering.',a:'Regional Peering connects VNets in the same region over local switches. Global Peering connects VNets across different regions over the Microsoft backbone. Both use private IPs.',s:21},
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
  {d:'FinOps',p:'med',q:'What are Azure Savings Plans?',a:'Azure Savings Plans for Compute offer savings of up to 65% by committing to an hourly spend (dollar/hr) for 1 or 3 years. Applies automatically to compute services globally.',s:28},
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
  {d:'Expert Design',p:'high',q:'How would you architect a multi-region Azure deployment?',a:'Deploy active-active compute in two Azure regions connected via global VNet peering. Front the architecture with Azure Front Door. Use geo-replicated databases and regional firewalls routed via global configurations.',s:15},

  // ── 🔴 Priority 1 NEW: Core Infrastructure, Identity & Hybrid Connectivity ──
  {d:'Landing Zones',p:'high',q:'How do you design Management Groups and subscriptions for an enterprise Azure environment?',a:'Use CAF hierarchy: Root MG -> Platform MG (Connectivity, Identity, Management subscriptions) and Landing Zones MG (Corp and Online subscriptions). Platform subs host shared services; Landing Zone subs host workloads with inherited guardrails.',s:21},
  {d:'Landing Zones',p:'high',q:'Why is Prod/Non-Prod segregation preferred at the subscription level?',a:'Prevents API limit throttling, separates security boundaries (least privilege), isolates billing/chargebacks, and stops non-prod pipelines from affecting prod capacity. Separate subscriptions also allow distinct NSG and Policy enforcement.',s:21},
  {d:'Secure Access',p:'high',q:'What are the differences between Service Endpoints and Private Endpoints?',a:'Service Endpoints keep the public IP but restrict access to the VNet via Microsoft backbone. Private Endpoints assign a private IP from the VNet directly to the PaaS resource and disable public entry entirely — significantly more secure.',s:24},
  {d:'Secure Access',p:'high',q:'How does Azure Bastion work and why is it preferred over a Jump Box?',a:'Bastion provides secure RDP/SSH over TLS (port 443) directly in-browser without public IPs on VMs. Eliminates OS patching overhead, open management ports (3389/22) on target VMs, and the operational risk of an unmanaged jump box.',s:24},
  {d:'Identity',p:'high',q:'What is the difference between System-Assigned and User-Assigned Managed Identities?',a:'System-Assigned is tied to a single resource lifecycle (deleted with the resource). User-Assigned is a standalone resource that can be shared across multiple scaling resources (e.g., VMSS instances), giving greater flexibility for shared identity.',s:25},
  {d:'Identity',p:'high',q:'How do you enforce a Least Privilege access model for cloud engineers?',a:'Map role scopes from Management Groups down to Resource Groups. Use custom RBAC or granular built-in roles (avoid Owner/Contributor at subscription level). Implement Entra PIM for time-bound JIT admin access with approval gates and audit logs.',s:25},

  // ── 🟡 Priority 2 NEW: Resiliency, DR & Governance ──
  {d:'Compute & Scaling',p:'high',q:'What is the difference between Availability Sets and Availability Zones?',a:'Availability Sets protect against rack/power failures inside a single datacenter (Update Domains + Fault Domains, SLA 99.95%). Availability Zones replicate VMs across physically separate datacenters with independent power, cooling, and network (SLA 99.99%).',s:22},
  {d:'Compute & Scaling',p:'med',q:'How do you manage OS patching and rolling upgrades for VMSS?',a:'Configure Automatic OS Image Upgrades with health probes (Application Health Extension) and rolling upgrade policies to update VMSS instances in sequential batches, minimizing downtime and maintaining availability throughout the upgrade.',s:22},
  {d:'Storage & Access',p:'med',q:'What are the differences between LRS, ZRS, and GRS?',a:'LRS: 3 synchronous copies within a single datacenter (cheapest, no zone/region resilience). ZRS: 3 copies across availability zones (RPO=0, zone-resilient). GRS: async replication to a paired region (RPO less than 15 min, enables disaster recovery failover).',s:23},
  {d:'Security',p:'high',q:'How do you protect Azure Key Vault from accidental or malicious deletion?',a:'Enable Soft Delete (retains deleted vault for 90 days) and Purge Protection (prevents permanent deletion during retention period). Shift from legacy Key Vault Access Policies to Azure RBAC permission model for unified, auditable access control.',s:26},
  {d:'Security',p:'high',q:'How do you enforce compliance — e.g., block database creation with public IPs?',a:'Define an Azure Policy with a custom rule checking publicNetworkAccess or ipConfiguration properties with a Deny effect. Assign the policy at the Management Group scope to cover all child subscriptions automatically.',s:20},

  // ── 🟢 Priority 3 NEW: Operations, Observability & FinOps ──
  {d:'Storage & Access',p:'med',q:'What is the most secure way to grant a developer write access to a Blob?',a:'Avoid Account Keys (full access risk). Assign the Storage Blob Data Contributor Entra ID role scoped to the specific container. For external integrations, generate a short-lived User Delegation SAS token (HTTPS only, minimum permissions).',s:23},
  {d:'Monitoring',p:'high',q:'How do you route logs from Azure resources to an external SIEM (e.g. Splunk)?',a:'Configure Diagnostic Settings on resources (or via Azure Policy at scale for automatic coverage) to stream Activity Logs, Resource Logs, and Metrics to an Azure Event Hub. The external SIEM (Splunk, QRadar) pulls from the Event Hub using its connector.',s:12},
  {d:'Monitoring',p:'med',q:'How do you query VM shutdowns or failed logins using KQL?',a:'VM shutdowns: query AzureActivity table where OperationNameValue == "Microsoft.Compute/virtualMachines/deallocate/action" and ActivityStatusValue == "Success". Failed logins: query SigninLogs where ResultType != "0" to see non-successful authentication attempts.',s:12},
  {d:'FinOps',p:'high',q:'What is the difference between Reserved Instances (RI) and Savings Plans?',a:'Reserved Instances bind to a specific VM SKU and region (up to 72% discount, highest savings for predictable workloads). Savings Plans commit to a dollar-per-hour spend across global compute services (up to 65% discount, higher flexibility across regions and VM types).',s:28},
  {d:'FinOps',p:'med',q:'How do you identify and clean up orphaned cloud resources?',a:'Use Azure Resource Graph to query: unattached Managed Disks (where properties.diskState == Unattached), unassociated Public IPs (where properties.ipConfiguration == null), and idle NSGs or empty Resource Groups. Automate remediation via Runbooks or Logic Apps.',s:28}
];

// Serialize FAQ data to JSON and embed in a script tag
var faqDataJson = JSON.stringify(faqData);

var scriptBlock = [
  '<script>',
  'var FAQ_DATA = ' + faqDataJson + ';',
  'var DOMAINS = ["All"];',
  'FAQ_DATA.forEach(function(f){ if(DOMAINS.indexOf(f.d) < 0) DOMAINS.push(f.d); });',
  'var currentDomain = "All";',
  'var searchTerm = "";',
  'function buildTabs(){',
  '  var tabs = document.getElementById("domainTabs");',
  '  tabs.innerHTML = DOMAINS.map(function(d){',
  '    var cls = d==="All" ? "active" : "";',
  '    var lbl = d==="All" ? "All (" + FAQ_DATA.length + ")" : d;',
  '    return "<button class=\\"tab-btn " + cls + "\\" onclick=\\"selectDomain(\'" + d + "\')\\">" + lbl + "</button>";',
  '  }).join("");',
  '}',
  'function selectDomain(d){',
  '  currentDomain = d;',
  '  document.querySelectorAll(".tab-btn").forEach(function(b, i){ b.classList.toggle("active", DOMAINS[i] === d); });',
  '  renderList();',
  '}',
  'function filterFAQs(){',
  '  searchTerm = document.getElementById("searchInput").value.toLowerCase();',
  '  renderList();',
  '}',
  'function navigateToSlide(n){',
  '  try{ window.parent.currentIndex = n - 1; if(typeof window.parent.renderScenario === "function") window.parent.renderScenario(); }',
  '  catch(e){ window.parent.postMessage({action:"navigate",slide:n}, "*"); }',
  '}',
  'function toggleItem(el){ el.closest(".faq-item").classList.toggle("open"); }',
  'function renderList(){',
  '  var list = document.getElementById("faqList");',
  '  var filtered = FAQ_DATA.filter(function(f){',
  '    var dm = currentDomain === "All" || f.d === currentDomain;',
  '    var sm = !searchTerm || f.q.toLowerCase().indexOf(searchTerm) >= 0 || f.a.toLowerCase().indexOf(searchTerm) >= 0;',
  '    return dm && sm;',
  '  });',
  '  document.getElementById("visCount").textContent = filtered.length;',
  '  if(!filtered.length){ list.innerHTML = "<div class=\\"no-results\\">No questions match your search</div>"; return; }',
  '  var grouped = {};',
  '  filtered.forEach(function(f){ if(!grouped[f.d]) grouped[f.d] = []; grouped[f.d].push(f); });',
  '  var html = "";',
  '  Object.keys(grouped).forEach(function(domain){',
  '    var items = grouped[domain];',
  '    html += "<div class=\\"domain-group\\"><div class=\\"domain-label\\">" + domain + " (" + items.length + ")</div>";',
  '    items.forEach(function(f){',
  '      var dc = f.p === "high" ? "p-high" : f.p === "med" ? "p-med" : "p-low";',
  '      html += "<div class=\\"faq-item\\">" +',
  '        "<div class=\\"faq-q\\" onclick=\\"toggleItem(this)\\">" +',
  '        "<div class=\\"priority-dot " + dc + "\\"></div>" +',
  '        "<div class=\\"q-text\\">" + f.q + "</div>" +',
  '        "<button class=\\"slide-badge\\" onclick=\\"event.stopPropagation();navigateToSlide(" + f.s + ")\\">&#x1F4D8; Slide " + f.s + "</button>" +',
  '        "<div class=\\"chevron\\">&#x25BC;</div>" +',
  '        "</div>" +',
  '        "<div class=\\"faq-a\\">" + f.a + "</div>" +',
  '        "</div>";',
  '    });',
  '    html += "</div>";',
  '  });',
  '  list.innerHTML = html;',
  '}',
  'buildTabs();',
  'renderList();',
  '<\/script></body></html>'
].join('\n');

var fullHtml = faqHtml + '\n' + scriptBlock;

const slide29 = {
  title: "Interview FAQ Master Reference",
  type: "JD-Aligned — 101 Questions Across All Domains",
  difficulty: "Mixed",
  chips: ["Landing Zones", "Networking", "Security", "Identity", "DR/Backup", "FinOps", "IaC", "Monitoring", "Storage & Access"],
  schema: "architecture",
  definition: "A consolidated reference of 101 interview questions mapped across 12 Azure infrastructure domains. Organized by priority tier (🔴 Critical / 🟡 Important / 🟢 Operational). Each question links to its primary reference slide with an expandable detailed answer.",
  why_it_matters: "Senior Azure Infrastructure roles demand breadth across networking, security, governance, DR, and cost optimization. This master reference provides a structured, tappable study guide covering every question from the JD analysis.",
  real_world_scenario: "Use this slide as a final review checklist before your interview. Tap any question to navigate to its detailed reference slide, or expand the answer inline for a quick recap.",
  content_theory: `This slide consolidates 101 prioritized interview questions across 12 domains, organized by 3 priority tiers:\n\n🔴 Priority 1 — Core Infrastructure, Identity & Hybrid Connectivity (Critical/High Frequency)\n🟡 Priority 2 — Resiliency, Disaster Recovery & Governance (Important/Medium Frequency)\n🟢 Priority 3 — Operations, Observability & FinOps (Recommended/Operational)\n\nDomains covered:\n1. Landing Zones (11 questions)\n2. Networking (18 questions)\n3. Compute & Scaling (7 questions)\n4. Secure Access (5 questions)\n5. Identity (9 questions)\n6. Security (10 questions)\n7. Monitoring (9 questions)\n8. DR & Backup (9 questions)\n9. FinOps (8 questions)\n10. IaC & Automation (5 questions)\n11. Governance (5 questions)\n12. Storage & Access (3 questions)\n13. Expert Design (2 questions)\n\nEach question is tagged with priority color and its primary reference slide number.`,
  key_takeaways: [
    "101 questions from the JD analysis — organized by 🔴🟡🟢 priority tier",
    "Click any slide badge to jump to the primary reference slide",
    "Expand the chevron to read the answer inline",
    "Filter by domain using the top tabs or search by keyword",
    "Priority dots: Red = Critical, Yellow = Important, Green = Operational"
  ],
  pitfalls: [
    "Do not memorize — understand the why behind each answer",
    "Always relate answers to real-world scenarios from your experience",
    "Link answers across topics (e.g., Policy + RBAC + PIM together = Zero Trust)"
  ],
  interview_questions: [
    { q: "What is an Azure Landing Zone?", a: "A multi-subscription environment aligned with CAF providing networking, identity, security, and governance foundations.", slide: 21 },
    { q: "What is Azure Policy vs RBAC?", a: "Azure Policy controls resource configuration compliance. RBAC controls what actions a user can perform. Policy = guardrails, RBAC = gates.", slide: 20 }
  ],
  interactive_html: fullHtml
};

slides.push(slide29);

fs.writeFileSync(azureJsonPath, JSON.stringify(slides, null, 2), 'utf8');
console.log(`✅ Successfully appended Slide 29 "Interview FAQ Master Reference"`);
console.log(`   Total slides: ${slides.length}`);
console.log(`   Slide 29 HTML length: ${fullHtml.length} chars`);
console.log(`   FAQ questions embedded: ${faqData.length}`);
console.log(`   Updated file size: ${(fs.statSync(azureJsonPath).size / 1024).toFixed(1)} KB`);
