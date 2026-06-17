const fs = require('fs');
const path = require('path');

const noventiqData = [
  {
    "title": "Hub & Spoke Architecture",
    "type": "Azure Networking",
    "difficulty": "Intermediate",
    "chips": ["Networking", "Azure", "Hub-Spoke", "Security"],
    "schema": "architecture",
    "definition": "A network topology in Azure where a central Hub VNet acts as the connectivity and security hub, routing traffic to and from multiple workload Spokes.",
    "why_it_matters": "Centralizes security policy inspection (like Firewall), reduces public exposure points, and prevents configuration overhead across many virtual networks.",
    "real_world_scenario": "An organization needs to host multiple isolated applications in Azure while maintaining central governance, a single ExpressRoute gateway back to on-premise, and unified egress traffic inspection via Azure Firewall.",
    "architecture_flow": {
      "steps": [
        "Internet/On-Premise: Directs incoming traffic to the central Hub VNet.",
        "Hub VNet: Hosts shared network appliances (Azure Firewall, ExpressRoute Gateways, VPNs, Bastion).",
        "Azure Firewall: Performs deep packet inspection and routes traffic.",
        "VNet Peering: Connects Hub VNet directly to Spoke VNets.",
        "Spoke VNets: Host isolated workload components (AKS cluster, App Services, Database layers).",
        "Spoke-to-Spoke Routing: Force-routed back through the central Hub Firewall for cross-workload security inspection."
      ],
      "diagram": "Internet → Hub VNet (Firewall/Gateways) ──[VNet Peering]──> Spoke VNets (AKS/DB/Apps)"
    },
    "interview_answer": {
      "response": [
        "Hub and Spoke is a transit topology where a central Hub VNet hosts shared security and gateway resources (like Azure Firewall, Bastion, and VPN Gateways), while workloads reside in separate Spokes.",
        "Spokes communicate with the Hub (and each other) using VNet Peering, with routing typically configured via User-Defined Routes to force traffic through the Hub's firewall for inspection."
      ],
      "why": "It shows you understand scale, governance, and resource optimization by sharing central gateways rather than duplicating them."
    },
    "interview_kill_shot": "Hub acts as the central security and gateway transit layer; Spokes hold the isolated workloads. Peer them, but force spoke-to-spoke traffic through the Hub firewall."
  },
  {
    "title": "Availability Set vs Availability Zone",
    "type": "Azure High Availability",
    "difficulty": "Intermediate",
    "chips": ["Azure", "Compute", "High Availability", "Resiliency"],
    "schema": "architecture",
    "definition": "Design strategies in Azure to protect virtual machine workloads from local hardware rack failures (Availability Sets) or entire datacenter facility failures (Availability Zones).",
    "why_it_matters": "Guarantees SLA uptime for critical workloads, preventing simultaneous reboots during hardware maintenance or physical power outages.",
    "real_world_scenario": "An architect designs a high-availability backend cluster. They must choose between placement within a single datacenter using Fault/Update Domains or distributing replicas across three distinct geographic datacenter zones.",
    "comparisons": [
      {
        "topic_a": "Availability Set",
        "topic_b": "Availability Zone",
        "summary": "Availability Sets isolate VMs across physical racks (Fault Domains) and power/maintenance units (Update Domains) within a single datacenter. Availability Zones isolate VMs across separate datacenters with redundant power, cooling, and networking within a region."
      }
    ],
    "trade_offs": [
      {
        "choice": "Availability Set (Single Datacenter)",
        "advantages": [
          "Negligible inter-VM latency (sub-millisecond)",
          "Easier configuration without multi-zone storage complexities"
        ],
        "disadvantages": [
          "Vulnerable to catastrophic datacenter-level failures (flooding, power grids)"
        ]
      },
      {
        "choice": "Availability Zone (Multi-Datacenter)",
        "advantages": [
          "Highest resiliency (protects against entire datacenter facilities going down)",
          "Higher VM uptime SLA"
        ],
        "disadvantages": [
          "Slightly higher latency between zones (1-2ms), which can impact highly chatty database synchronization"
        ]
      }
    ],
    "interview_answer": {
      "response": [
        "Availability Sets group VMs within a single datacenter, separating them across Fault Domains (racks) and Update Domains (maintenance blocks) to prevent simultaneous reboots.",
        "Availability Zones isolate VMs across physically distinct datacenters within a region, safeguarding against facility-wide failures like power, cooling, or connectivity outages."
      ],
      "why": "It shows you understand how to design against both minor hardware failures and major regional disasters."
    },
    "interview_kill_shot": "Availability Sets protect against rack/maintenance failures in one datacenter; Availability Zones protect against entire datacenter outages."
  },
  {
    "title": "Front Door vs Application Gateway",
    "type": "Azure Load Balancing",
    "difficulty": "Intermediate",
    "chips": ["Load Balancer", "Azure Front Door", "Application Gateway", "WAF"],
    "schema": "architecture",
    "definition": "Azure Layer 7 load balancing services designed to route and secure HTTP/HTTPS traffic at either a global level (Front Door) or regional level (Application Gateway).",
    "why_it_matters": "Determines how web traffic is routed, optimized (via CDN/Anycast), and inspected (via Web Application Firewall) before reaching backend servers.",
    "real_world_scenario": "A global multi-region web application requires global user routing to the nearest active region, but also requires internal regional path routing and SSL offloading before containers receive traffic.",
    "comparisons": [
      {
        "topic_a": "Azure Front Door",
        "topic_b": "Azure Application Gateway",
        "summary": "Front Door is a global, edge-based Anycast service that routes web traffic across regions and includes WAF and CDN. Application Gateway is a regional, private/public service that provides path-based routing and SSL termination inside a specific VNet."
      }
    ],
    "trade_offs": [
      {
        "choice": "Azure Front Door",
        "advantages": [
          "Global Anycast routing with low latency at edge sites",
          "Built-in global CDN caching and SSL offloading at the edge"
        ],
        "disadvantages": [
          "Does not sit inside a user's private VNet directly (external access only)"
        ]
      },
      {
        "choice": "Azure Application Gateway",
        "advantages": [
          "Deploys directly inside a private subnet",
          "Supports routing to internal private IPs, AKS ingress, and virtual machines within the VNet"
        ],
        "disadvantages": [
          "Limited to a single regional scope out of the box"
        ]
      }
    ],
    "interview_answer": {
      "response": [
        "Azure Front Door is a global Layer 7 load balancer that utilizes Anycast DNS to route users to the closest regional endpoint. It operates at Microsoft's global edge locations.",
        "Application Gateway is a regional Layer 7 load balancer that resides inside a specific virtual network, managing routing, SSL termination, and WAF within that region.",
        "In enterprise designs, we often chain them: Front Door handles global edge protection, routing traffic to a regional Application Gateway, which then secures and routes it to AKS."
      ],
      "why": "Shows you know how to build high-availability architectures across multiple regions."
    },
    "interview_kill_shot": "Front Door is global and operates at the edge; Application Gateway is regional and operates inside a private VNet."
  },
  {
    "title": "VNet Peering & Subnetting",
    "type": "Azure Networking",
    "difficulty": "Intermediate",
    "chips": ["Networking", "Peering", "Subnetting", "CIDR"],
    "schema": "architecture",
    "definition": "Connecting Azure Virtual Networks via Microsoft's private fiber backbone, and calculating IP subnets to optimize address space allocation.",
    "why_it_matters": "Allows secure, high-bandwidth communication between VNets without using internet gateways. Correct subnet planning prevents IP address exhaustion.",
    "real_world_scenario": "A company wants to peer a Dev VNet and an Operations VNet but realizes they must first check address spaces for overlaps. Additionally, they must carve up a /23 network space into four equal subnets.",
    "code_examples": [
      {
        "title": "Subnet Calculation details",
        "language": "text",
        "snippet": "CIDR Block: 10.0.0.0/23 (Total Addresses: 512)\nTo split into /25 subnets (128 addresses each):\n- Subnet 1: 10.0.0.0/25 (10.0.0.0 - 10.0.0.127)\n- Subnet 2: 10.0.0.128/25 (10.0.0.128 - 10.0.0.255)\n- Subnet 3: 10.0.1.0/25 (10.0.1.0 - 10.0.1.127)\n- Subnet 4: 10.0.1.128/25 (10.0.1.128 - 10.0.1.255)\n\nCalculation: 512 / 128 = 4 subnets."
      }
    ],
    "interview_answer": {
      "response": [
        "VNet Peering connects VNets directly over the Microsoft backbone. Regional peering connects VNets in the same region; Global Peering connects different regions.",
        "Overlapping IP spaces CANNOT be peered. If VNet A and VNet B both use 10.0.0.0/16, peering fails immediately due to routing ambiguity.",
        "For a /23 space (512 hosts), dividing it into /25 subnets (128 hosts each) yields exactly 4 subnets."
      ],
      "why": "Demonstrates core subnetting math and standard cloud routing restrictions."
    },
    "interview_kill_shot": "Peering cannot connect overlapping IP spaces. A /23 subnet split into /25 spaces yields exactly 4 subnets."
  },
  {
    "title": "User Defined Routes (UDR)",
    "type": "Azure Networking",
    "difficulty": "Intermediate",
    "chips": ["Networking", "UDR", "Routing", "Firewall"],
    "schema": "architecture",
    "definition": "Creating custom routing tables in Azure to override default system routes, forcing traffic through specific network virtual appliances.",
    "why_it_matters": "Essential for forcing all egress internet traffic to pass through a centralized security firewall rather than routing directly to the public internet.",
    "real_world_scenario": "In a Hub-and-Spoke model, we associate a route table with all Spoke subnets, mapping 0.0.0.0/0 to the private IP of the central Hub Azure Firewall.",
    "code_examples": [
      {
        "title": "Route Table UDR Config Example",
        "language": "json",
        "snippet": "{\n  \"properties\": {\n    \"addressPrefix\": \"0.0.0.0/0\",\n    \"nextHopType\": \"VirtualAppliance\",\n    \"nextHopIpAddress\": \"10.0.1.4\" // Private IP of Azure Firewall\n  }\n}"
      }
    ],
    "interview_answer": {
      "response": [
        "User Defined Routes (UDR) are custom routes applied via Route Tables to subnets. They override Azure's default system routing.",
        "We use them to force all outbound traffic (0.0.0.0/0) to hop to a virtual appliance, typically our central Azure Firewall, for packet filtering and audit logging."
      ],
      "why": "Confirms understanding of network security boundary controls."
    },
    "interview_kill_shot": "We associate a custom route table with subnets and map 0.0.0.0/0 to a Next Hop of VirtualAppliance, pointing to our Firewall."
  },
  {
    "title": "Service Endpoint vs Private Endpoint",
    "type": "Azure Networking",
    "difficulty": "Advanced",
    "chips": ["Security", "Service Endpoint", "Private Endpoint", "DNS"],
    "schema": "architecture",
    "definition": "Securing access to Azure PaaS services (like storage, SQL) by routing traffic over the backbone network or giving the service a private IP inside the VNet.",
    "why_it_matters": "Private Endpoints completely remove public endpoints from DNS resolution, minimizing public attack vectors to absolute zero.",
    "real_world_scenario": "An enterprise requires all connections to Azure SQL databases to traverse private VNet lines and block any public network resolutions. They configure a Private Endpoint and link it to a Private DNS Zone.",
    "comparisons": [
      {
        "topic_a": "Service Endpoint",
        "topic_b": "Private Endpoint",
        "summary": "Service Endpoints extend VNet identity to public PaaS services (keeping the public IP but locking access). Private Endpoints assign a private IP from the VNet to the service, eliminating public DNS resolution."
      }
    ],
    "interview_answer": {
      "response": [
        "Service Endpoints secure access to public PaaS endpoints, ensuring traffic stays on the Microsoft backbone but the service retains its public IP.",
        "Private Endpoints assign a private IP from your VNet directly to the service using a Virtual NIC, completely disabling public internet exposure.",
        "To prevent name resolution failure, Private Endpoints require linking to a Private DNS Zone (e.g. privatelink.blob.core.windows.net) to map the public DNS name to the internal IP."
      ],
      "why": "Shows mastery of cloud-native endpoint security and DNS resolution."
    },
    "interview_kill_shot": "Service Endpoints secure the public endpoint; Private Endpoints replace the public endpoint with a private VNet IP and require Private DNS setup."
  },
  {
    "title": "AKS vs Azure Container Apps",
    "type": "Container Orchestration",
    "difficulty": "Intermediate",
    "chips": ["Kubernetes", "AKS", "Container Apps", "Serverless"],
    "schema": "architecture",
    "definition": "Selecting the appropriate platform to deploy and scale containerized workloads based on operational control vs. management overhead.",
    "why_it_matters": "Affects developer productivity, operational complexity, scaling costs, and resource control policies.",
    "real_world_scenario": "A small startup wants to launch containerized microservices without hiring a dedicated Kubernetes administrator. They choose Azure Container Apps over AKS.",
    "trade_offs": [
      {
        "choice": "Azure Kubernetes Service (AKS)",
        "advantages": [
          "Full access to the Kubernetes API, CRDs, custom service meshes",
          "Granular control over network plugins (Calico, Azure CNI), node pools, and pod settings"
        ],
        "disadvantages": [
          "High operational complexity (node upgrades, control plane config, monitoring cluster components)"
        ]
      },
      {
        "choice": "Azure Container Apps (ACA)",
        "advantages": [
          "Fully managed serverless platform based on KEDA and Dapr",
          "Zero cluster infrastructure maintenance",
          "Scale-to-zero capability out-of-the-box"
        ],
        "disadvantages": [
          "Vendor lock-in, limited access to underlying Kubernetes APIs and third-party tools"
        ]
      }
    ],
    "interview_answer": {
      "response": [
        "AKS provides full Kubernetes control plane access, making it ideal for complex, multi-tenant microservices requiring custom networking and meshes.",
        "Azure Container Apps offers a serverless container environment with zero cluster infrastructure overhead. Choose AKS for custom Kubernetes control; choose ACA for fast, serverless app delivery."
      ],
      "why": "It shows you balance developer velocity against custom control requirements."
    },
    "interview_kill_shot": "Choose AKS for full Kubernetes API control; choose ACA for zero-maintenance serverless container execution."
  },
  {
    "title": "Production Incident Troubleshooting",
    "type": "Troubleshooting & Incident Response",
    "difficulty": "Advanced",
    "chips": ["Troubleshooting", "Incident", "Azure SQL", "Key Vault"],
    "schema": "architecture",
    "definition": "Systematic troubleshooting of connectivity failures between application VMs and PaaS resources, diagnosing issues across network and application layers.",
    "why_it_matters": "Minimizes MTTR (Mean Time to Resolution) during critical database outages.",
    "real_world_scenario": "An application starts timing out while trying to connect to an Azure SQL Database. The network is verified as healthy using Network Watcher, but connections still fail. The root cause is identified as an expired credential secret in Key Vault.",
    "architecture_flow": {
      "steps": [
        "VM Health Audit: Assert CPU, memory, and disk space are normal.",
        "NSG / Firewall Audit: Verify port 1433 outbound/inbound is open.",
        "Network Watcher Check: Confirm route path connectivity to Azure SQL.",
        "Application Log Audit: Scan exceptions for authentication or timeout details.",
        "Identified Error: Discover SQL connection authentication failures.",
        "Key Vault Audit: Check expiration on connection string database secrets.",
        "Resolution: Update Key Vault secret, rotate credential, and reboot target application pods."
      ],
      "diagram": "App VM ──(Port 1433 OK)──> Azure SQL (Auth Fails) ──> Check Key Vault ──> Expired Secret!"
    },
    "interview_answer": {
      "response": [
        "When an application VM times out connecting to Azure SQL, I first isolate the layers. I check VM health and use Network Watcher to verify if port 1433 is reachable.",
        "If the port is reachable but the app still fails, I look at the logs. In a recent incident, the network path was clear, but logs showed authentication failures due to an expired SQL connection secret in Key Vault.",
        "Updating the secret in Key Vault and restarting the application resolved the incident."
      ],
      "why": "Shows structured diagnostic methodology (Layer 4 network checks first, then Layer 7 app and auth checks)."
    },
    "interview_kill_shot": "If the network port is reachable but the application still fails, immediately check Layer 7 application logs, authentication credentials, and Key Vault secrets."
  }
];

// Write to noventiq_r1.json
const destPath = path.join('c:/Users/Praveen/Desktop/kubernetes/38', 'noventiq_r1.json');
fs.writeFileSync(destPath, JSON.stringify(noventiqData, null, 2));
console.log(`🎉 Successfully compiled and wrote noventiq_r1.json to ${destPath}`);
console.log(`Total items: ${noventiqData.length}`);
