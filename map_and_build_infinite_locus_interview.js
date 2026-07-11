const fs = require('fs');
const path = require('path');

const locusMdPath = path.join(__dirname, 'Infinite_Locus.md');
const mergedPath = path.join(__dirname, 'merged.json');
const outputPath = path.join(__dirname, 'infinite_locus_interview.json');
const mappingOutputPath = path.join(__dirname, 'infinite_locus_interview_mapping.json');

const merged = JSON.parse(fs.readFileSync(mergedPath, 'utf8'));

// Create ID lookup map
const mergedById = new Map();
merged.forEach(q => mergedById.set(q.id, q));

// 28 structured questions from Infinite_Locus.md mapped to rich schema
const structuredQuestions = [
  {
    index: 1,
    section: "Background & Experience",
    prompt: "Could you please share a little background about yourself, when you graduated, your roles and responsibilities, and what your day-to-day tasks look like?",
    id: "Q0207",
    categoryId: "C015",
    title: "Tell me about yourself — Technical Introduction & Day-to-Day Roles",
    type: "HR / Behavioral",
    difficulty: "Easy",
    chips: ["Background", "Day-to-Day", "Coforge", "Infinite Locus", "DevOps"],
    schema: "architecture",
    definition: "Comprehensive walk-through of engineering background, graduation, day-to-day DevOps responsibilities, and infrastructure ownership.",
    why_it_matters: "Provides interviewers with a clear baseline of your engineering depth, daily habits, and operational impact.",
    real_world_scenario: "During the opening of an Infinite Locus / Coforge interview, presenting a cohesive 2-minute overview sets a strong engineering narrative.",
    architecture_flow: {
      steps: [
        "1. Background: Graduate in Computer Science/Engineering with 2+ years dedicated to DevOps and Azure Cloud.",
        "2. Day-to-Day Start: Check monitoring dashboards (Prometheus/Grafana, Azure Monitor) and review overnight alerts/pipeline statuses.",
        "3. Core Responsibilities: Automate Azure infrastructure using Terraform/Bicep, maintain CI/CD pipelines in Azure DevOps, and manage AKS clusters.",
        "4. Collaboration: Participate in daily standups, review PRs, assist developers with build/deployment blockers, and execute sprint automation tasks.",
        "5. Continuous Improvement: Implement security controls (DevSecOps), optimize cloud costs, and update runbook documentation."
      ],
      diagram: "Morning Health Checks ──> CI/CD & AKS Operations ──> IaC (Terraform) Execution ──> Dev Collaboration & Runbooks"
    },
    interview_answer: {
      response: [
        "I am an Azure DevOps Engineer with 2+ years of hands-on experience designing and managing cloud infrastructure and automated pipelines.",
        "My day-to-day routine starts with reviewing monitoring alerts and checking overnight pipeline executions across our development and production environments.",
        "Throughout the day, my primary responsibilities include writing and maintaining Terraform modules for Azure resources, building multi-stage CI/CD pipelines in Azure DevOps, and troubleshooting container workloads on AKS.",
        "I also collaborate closely with application developers to resolve deployment blockers and participate in sprint planning to integrate infrastructure tasks cleanly."
      ],
      why: "Structuring your day-to-day routine proves actual hands-on engineering habit rather than theoretical knowledge."
    },
    interview_kill_shot: "My focus every day is balancing rapid engineering delivery through CI/CD with production reliability and clean Infrastructure as Code."
  },
  {
    index: 2,
    section: "Linux & Troubleshooting",
    prompt: "Are you familiar with Linux systems, and have you managed Linux VMs?",
    id: "Q0209",
    categoryId: "C008",
    title: "Familiarity with Linux Systems & Managing Linux VMs",
    type: "Linux",
    difficulty: "Easy",
    chips: ["Linux", "VMs", "Administration", "Systemd", "SSH"],
    schema: "architecture",
    definition: "Core Linux system administration competencies including VM lifecycle management, SSH key administration, daemon configuration, and system logging.",
    why_it_matters: "Linux is the foundation of containerized applications, Kubernetes nodes, and cloud-native build agents.",
    real_world_scenario: "Managing Linux build agents and production VMs running application services in Azure Virtual Networks.",
    architecture_flow: {
      steps: [
        "1. Provisioning: Deploy RHEL/Ubuntu VMs via Terraform with Cloud-init configuration.",
        "2. Secure Access: Enforce SSH key-based authentication and disable password login via sshd_config.",
        "3. Service Management: Configure background services and daemons using systemctl and journalctl.",
        "4. Storage & Filesystems: Manage LVM, mount data disks via /etc/fstab, and monitor disk inodes."
      ],
      diagram: "Terraform Provisioning ──> Cloud-Init / SSH Hardening ──> Systemd Management ──> Log & Resource Monitoring"
    },
    interview_answer: {
      response: [
        "Yes, Linux administration is a core part of my daily workflow. I extensively manage Ubuntu and RHEL Virtual Machines both as standalone servers and as Kubernetes worker nodes.",
        "My management covers SSH key authentication, systemd service configuration, user/group permissions, kernel tuning, and automated OS provisioning using cloud-init and Ansible."
      ],
      why: "Confirms foundational command-line fluency and Linux OS administration."
    },
    interview_kill_shot: "I treat Linux VMs immutably where possible—using automated provisioning and configuration management rather than manual server tweaking."
  },
  {
    index: 3,
    section: "Linux & Troubleshooting",
    prompt: "If a server is running very slow and latency is too high, what are the troubleshooting steps you would execute to find the reason?",
    id: "Q0210",
    categoryId: "C008",
    title: "Troubleshooting High Latency & Slow Linux Server Performance",
    type: "Linux / Troubleshooting",
    difficulty: "Medium",
    chips: ["Troubleshooting", "top", "iostat", "netstat", "Latency"],
    schema: "architecture",
    definition: "Systematic performance diagnostics methodology covering CPU load, memory swapping, disk I/O bottlenecks, and network latency.",
    why_it_matters: "Rapid triage of slow servers prevents cascading outages in production microservice clusters.",
    real_world_scenario: "An alert fires indicating API response times on a Linux application server have spiked above 2 seconds.",
    architecture_flow: {
      steps: [
        "1. Check System Load & CPU: Run 'uptime' and 'top'/'htop' to check load averages and identify rogue CPU-consuming processes.",
        "2. Check Memory & Swap: Run 'free -h' and 'vmstat 1' to detect memory exhaustion and active swap thrashing.",
        "3. Inspect Disk I/O Bottlenecks: Execute 'iostat -xz 1' or 'iotop' to check %util and wait times on disk storage.",
        "4. Inspect Network Traffic & Sockets: Check 'ss -tuln' / 'netstat' and 'ping' / 'traceroute' / 'tcpdump' for packet drops or saturated connections.",
        "5. Review System Logs: Inspect 'journalctl -xe' and '/var/log/syslog' or '/var/log/messages' for kernel OOM or hardware errors."
      ],
      diagram: "uptime/top (CPU) ──> free/vmstat (Memory/Swap) ──> iostat/iotop (Disk I/O) ──> ss/netstat (Network Sockets)"
    },
    interview_answer: {
      response: [
        "When troubleshooting a slow Linux server, I follow a systematic USE (Utilization, Saturation, Errors) checklist across CPU, Memory, Disk I/O, and Network.",
        "First, I run 'uptime' and 'top' to inspect load averages and see if a specific process is hogging CPU.",
        "Second, I check 'free -h' and 'vmstat' to verify if the server is out of RAM and thrashing swap space.",
        "Third, I check disk I/O using 'iostat -xz 1' because high disk wait (%util near 100%) is one of the most common causes of severe application latency.",
        "Finally, I inspect open sockets and network connections using 'ss -tulnp' and check system logs with 'journalctl -xe' for kernel errors or OOM kills."
      ],
      why: "A disciplined checklist shows you don't guess randomly when production performance degrades."
    },
    interview_kill_shot: "Following the USE methodology—checking CPU, Memory, Disk I/O wait, and Network queues—pinpoints root causes within minutes."
  },
  {
    index: 4,
    section: "Linux & Troubleshooting",
    prompt: "What basic commands do you use to navigate through Linux systems?",
    id: "Q0211",
    categoryId: "C008",
    title: "Essential Linux Navigation & File System Commands",
    type: "Linux",
    difficulty: "Easy",
    chips: ["Navigation", "ls", "cd", "find", "grep"],
    schema: "architecture",
    definition: "Core POSIX shell utilities used to traverse directories, search filesystems, inspect text streams, and check file attributes.",
    why_it_matters: "Fast navigation and file inspection are fundamental skills when debugging servers via SSH terminal.",
    real_world_scenario: "Navigating deep application configuration directories and locating configuration overrides on a Linux server.",
    architecture_flow: {
      steps: [
        "1. Directory Navigation: 'pwd' (print working directory), 'cd' (change directory), 'ls -la' (list all hidden files and permissions).",
        "2. File Searching: 'find /path -name \"*.conf\"' to locate files by name or modification time.",
        "3. Content Searching: 'grep -rn \"error\" /var/log/' to recursively search string patterns inside files.",
        "4. Content Viewing: 'less', 'tail -f', 'head', and 'cat' to inspect files safely."
      ],
      diagram: "pwd / cd / ls -la ──> find (Locate Files) ──> grep -rn (Search Patterns) ──> tail -f / less (Inspect Streams)"
    },
    interview_answer: {
      response: [
        "For basic filesystem navigation, I use 'pwd' to verify working directory, 'cd' to move between paths, and 'ls -lah' to inspect files with permissions and human-readable sizes.",
        "To locate specific files across trees, I use 'find /path -name filename' or 'locate', and to search file contents recursively I use 'grep -rn pattern'.",
        "For viewing logs and large configs safely without loading them into memory, I use 'less' and 'tail -f'."
      ],
      why: "Demonstrates practical command-line dexterity."
    },
    interview_kill_shot: "Mastery of combining find, grep, and less allows rapid exploration of complex Linux filesystems."
  },
  {
    index: 5,
    section: "Linux & Troubleshooting",
    prompt: "How would you find out if a particular port is free on a Linux server?",
    id: "Q0212",
    categoryId: "C008",
    title: "Checking Port Availability & Listening Processes in Linux",
    type: "Linux / Networking",
    difficulty: "Easy",
    chips: ["ss", "netstat", "lsof", "Ports"],
    schema: "architecture",
    definition: "Inspecting Linux network socket tables to determine whether a TCP/UDP port is currently bound by an application daemon.",
    why_it_matters: "Prevents 'Address already in use' startup failures when deploying containers or daemons.",
    real_world_scenario: "An Nginx deployment fails to start because port 80 or 443 is already occupied by another process.",
    architecture_flow: {
      steps: [
        "1. Modern Socket Utility: Execute 'sudo ss -tulnp | grep :<PORT>' (-t TCP, -u UDP, -l listening, -n numeric, -p process).",
        "2. File Descriptor Inspection: Execute 'sudo lsof -i :<PORT>' to see the exact process ID and user holding the socket.",
        "3. Legacy Netstat: Execute 'sudo netstat -tulnp | grep :<PORT>' on older legacy distributions."
      ],
      diagram: "ss -tulnp | grep :8080 ──[If Empty]──> Port is FREE ──[If Match]──> lsof -i :8080 reveals PID"
    },
    interview_answer: {
      response: [
        "To check if a specific port (e.g., port 8080) is free or occupied, I use the modern socket statistics command: 'sudo ss -tulnp | grep :8080'.",
        "If the output is empty, the port is free. If a process is listening, it displays the process name and PID.",
        "Alternatively, I use 'sudo lsof -i :8080' to inspect the exact open file descriptor and process owner."
      ],
      why: "Mentions both modern 'ss' (preferred over deprecated 'netstat') and 'lsof' for process identification."
    },
    interview_kill_shot: "'ss -tulnp' is the modern standard for checking open ports and listening process IDs on Linux."
  },
  {
    index: 6,
    section: "Linux & Troubleshooting",
    prompt: "What command is used to check how much disk space is available?",
    id: "Q0213",
    categoryId: "C008",
    title: "Checking Disk Space Availability & Inodes in Linux",
    type: "Linux",
    difficulty: "Easy",
    chips: ["df -h", "du -sh", "Disk Space", "Inodes"],
    schema: "architecture",
    definition: "Monitoring mounted filesystem usage, available block storage capacity, and directory space consumption.",
    why_it_matters: "Disk exhaustion causes database corruption, failed log writes, and application crashes.",
    real_world_scenario: "A production server stops responding because /var/log filled up 100% of the root filesystem.",
    architecture_flow: {
      steps: [
        "1. Check Filesystem Summary: Run 'df -h' to display mounted filesystems, total size, used capacity, and available blocks.",
        "2. Check Inode Usage: Run 'df -i' to verify available inodes (essential when millions of small files fill inodes before blocks run out).",
        "3. Locate Heavy Directories: Run 'du -sh /var/log/*' to measure which specific subdirectories consume the most disk space."
      ],
      diagram: "df -h (Check Block Usage) ──> df -i (Check Inodes) ──> du -sh * (Pinpoint Heavy Folders)"
    },
    interview_answer: {
      response: [
        "To check available filesystem disk space in human-readable format (GB/MB), I use 'df -h'.",
        "I also always check 'df -i' to verify available inodes, because a server can run out of inodes even when free gigabytes remain if there are millions of tiny files.",
        "When investigating which specific folder is consuming disk space, I use 'du -sh *' or 'ncdu'."
      ],
      why: "Highlighting inode exhaustion ('df -i') distinguishes senior operators from juniors."
    },
    interview_kill_shot: "Always check both disk blocks ('df -h') and inode tables ('df -i') during storage troubleshooting."
  },
  {
    index: 7,
    section: "Linux & Troubleshooting",
    prompt: "What command is used to check available memory (RAM)?",
    id: "Q0214",
    categoryId: "C008",
    title: "Checking Available Memory (RAM & Swap) in Linux",
    type: "Linux",
    difficulty: "Easy",
    chips: ["free -h", "/proc/meminfo", "vmstat", "RAM"],
    schema: "architecture",
    definition: "Inspecting physical RAM allocation, OS page cache, buffer usage, and swap utilization.",
    why_it_matters: "Understanding memory cache vs available RAM prevents misinterpreting Linux memory usage.",
    real_world_scenario: "Verifying whether an application server has enough available memory before launching a new Java/Node process.",
    architecture_flow: {
      steps: [
        "1. Run Standard Check: Execute 'free -h' to view total, used, free, shared, buff/cache, and available RAM.",
        "2. Focus on 'available': Rely on the 'available' column (not just 'free'), as Linux intentionally uses free memory for disk caching.",
        "3. Deep Inspection: Read '/proc/meminfo' or run 'vmstat 1' to observe paging and active swap IO."
      ],
      diagram: "free -h ──> Check 'available' column (Includes reclaimable Page Cache) ──> Check Swap utilization"
    },
    interview_answer: {
      response: [
        "To check available RAM and swap usage, I use the command 'free -h'.",
        "It is important to look at the 'available' column rather than the raw 'free' column, because Linux caches disk files in RAM ('buff/cache') which is immediately reclaimable when applications request memory.",
        "For real-time memory paging metrics, I also inspect '/proc/meminfo' or 'vmstat 1'."
      ],
      why: "Explaining the difference between 'free' and 'available' proves deep understanding of Linux kernel page caching."
    },
    interview_kill_shot: "In Linux, 'available' memory includes reclaimable buffer cache—raw 'free' memory is just unallocated RAM."
  },
  {
    index: 8,
    section: "Linux & Troubleshooting",
    prompt: "Do you know the difference between a process and a thread?",
    id: "Q0215",
    categoryId: "C008",
    title: "Process vs Thread Architecture in Linux",
    type: "Linux / CS Concepts",
    difficulty: "Medium",
    chips: ["Process", "Thread", "PID", "Shared Memory", "Concurrency"],
    schema: "tradeoff",
    definition: "Architectural comparison between independent operating system processes and lightweight concurrent threads executing inside a single address space.",
    why_it_matters: "Crucial for sizing container resource limits and understanding application concurrency models (e.g. Nginx worker processes vs Java thread pools).",
    real_world_scenario: "Debugging high memory consumption in multi-threaded microservices versus multi-process application workers.",
    tradeoff_matrix: {
      dimensions: ["Address Space & Memory", "Isolation & Safety", "Creation Overhead", "Context Switching"],
      options: [
        {
          name: "Process",
          values: [
            "Separate independent virtual address space",
            "High isolation (crash doesn't kill other processes)",
            "Heavyweight (requires OS page table allocation)",
            "Slower context switch (MMU flush required)"
          ]
        },
        {
          name: "Thread",
          values: [
            "Shares parent process memory heap & code segment",
            "Low isolation (segfault in thread can crash process)",
            "Lightweight (shares existing page tables)",
            "Fast context switch (CPU registers & stack switch only)"
          ]
        }
      ]
    },
    interview_answer: {
      response: [
        "A process is an independent execution unit with its own dedicated virtual memory address space, file descriptors, and security context managed by the OS kernel.",
        "A thread is a lightweight execution unit inside a process that shares the parent process's memory heap, open files, and global variables while maintaining its own separate call stack and CPU registers.",
        "Because threads share memory, inter-thread communication is much faster than inter-process communication (IPC), but a fatal error or crash in one thread can crash the entire process."
      ],
      why: "Clearly differentiates memory boundaries and isolation tradeoffs."
    },
    interview_kill_shot: "Processes provide complete memory isolation; threads share memory space for lightweight, fast concurrency."
  },
  {
    index: 9,
    section: "Linux & Troubleshooting",
    prompt: "You mentioned automating routine OS patching. What is patching and how did you achieve it?",
    id: "Q0216",
    categoryId: "C008",
    title: "Automating Routine Linux OS Patching & Vulnerability Management",
    type: "Linux / Automation",
    difficulty: "Medium",
    chips: ["Patching", "Ansible", "Azure Update Manager", "CVE"],
    schema: "architecture",
    definition: "Applying security updates, CVE bugfixes, and kernel patches across a fleet of Linux VMs without causing downtime.",
    why_it_matters: "Unpatched systems are the #1 attack vector for enterprise breaches.",
    real_world_scenario: "Automating zero-downtime monthly security patch rollouts across 50 Ubuntu/RHEL servers in Azure.",
    architecture_flow: {
      steps: [
        "1. Patch Identification: Scan servers for critical security CVEs using Azure Update Manager / Nessus.",
        "2. Non-Prod Verification: Automate patch deployment in Staging first using Ansible playbooks ('apt upgrade -y' / 'dnf update --security').",
        "3. Rolling Maintenance Window: Orchestrate rolling updates across production clusters (drain nodes, apply patch, reboot if kernel updated, uncordon).",
        "4. Compliance Auditing: Generate post-patch compliance reports to verify successful patch status across all VMs."
      ],
      diagram: "CVE Scan ──> Staging Validation ──> Ansible Rolling Patching (Drain -> Patch -> Reboot) ──> Report"
    },
    interview_answer: {
      response: [
        "OS patching is the process of applying security fixes, kernel updates, and package updates to resolve vulnerabilities (CVEs) and bugs.",
        "I automated routine patching across our Azure Linux VMs using a combination of Azure Update Manager and Ansible playbooks.",
        "Our automated playbook runs during scheduled maintenance windows: it drains traffic from the target node, updates security packages via 'apt' or 'dnf', checks if a reboot is required ('/var/run/reboot-required'), safely reboots the VM, and verifies health checks before proceeding to the next node."
      ],
      why: "Demonstrates production-grade rolling update safety rather than just running 'apt update' everywhere at once."
    },
    interview_kill_shot: "Automated rolling patching ensures 100% CVE compliance with zero downtime across production clusters."
  },
  {
    index: 10,
    section: "Networking & DNS",
    prompt: "What is DNS and how does it work under the hood to resolve a domain name to an IP address?",
    id: "Q0217",
    categoryId: "C012",
    title: "How DNS Works Under the Hood — Resolution Lifecycle",
    type: "Networking",
    difficulty: "Medium",
    chips: ["DNS", "Recursive Resolver", "Root Server", "Authoritative", "TTL"],
    schema: "architecture",
    definition: "The hierarchical Domain Name System protocol that translates human-readable hostnames into numerical IP addresses across global distributed nameservers.",
    why_it_matters: "DNS resolution is step zero for any HTTP request; DNS failures cause total service unreachability.",
    real_world_scenario: "Tracing the recursive lookup lifecycle when a user accesses 'portal.coforge.com'.",
    architecture_flow: {
      steps: [
        "1. Browser & OS Cache Check: Client checks local DNS cache and /etc/hosts file.",
        "2. Recursive DNS Resolver: Query goes to ISP / Corporate DNS resolver (e.g. 8.8.8.8). If uncached, resolver initiates lookup.",
        "3. Root Nameserver Query: Resolver queries a Root DNS server (.) which returns the TLD nameserver IP for '.com'.",
        "4. TLD Nameserver Query: Resolver queries the '.com' TLD server which returns the Authoritative Nameserver for 'coforge.com' (e.g. Azure DNS).",
        "5. Authoritative Nameserver Query: Resolver queries the Authoritative server which returns the final A record IP.",
        "6. Caching & Return: Resolver caches record for TTL duration and returns IP to client."
      ],
      diagram: "Client ──> Recursive Resolver ──> Root (.) ──> TLD (.com) ──> Authoritative DNS ──> A Record IP"
    },
    interview_answer: {
      response: [
        "DNS is the phonebook of the internet, resolving domain names into numerical IP addresses.",
        "Under the hood, resolution follows a 4-tier hierarchy: first, the browser checks its local cache. If missing, it queries the configured Recursive DNS Resolver.",
        "The Recursive Resolver queries a Root Nameserver (.), which directs it to the Top-Level Domain (TLD) server (e.g., .com).",
        "The TLD server directs the resolver to the domain's Authoritative Nameserver (like Azure DNS or Route53), which returns the exact A or CNAME record IP address to the client."
      ],
      why: "Step-by-step trace of Root -> TLD -> Authoritative demonstrates clear protocol mastery."
    },
    interview_kill_shot: "DNS resolution follows a hierarchical path: Cache -> Recursive Resolver -> Root Server -> TLD Server -> Authoritative DNS."
  },
  {
    index: 11,
    section: "Networking & DNS",
    prompt: "Where do we map these values, and what are the different types of DNS records (like the difference between A records and CNAME records)?",
    id: "Q0218",
    categoryId: "C012",
    title: "DNS Record Types — A vs CNAME vs ALIAS vs TXT",
    type: "Networking",
    difficulty: "Easy",
    chips: ["A Record", "CNAME", "ALIAS", "TXT", "MX"],
    schema: "tradeoff",
    definition: "DNS zone file record configurations that define hostname mappings, alias forwarding, mail routing, and domain verification.",
    why_it_matters: "Misconfiguring A vs CNAME records at the apex/root domain can break email routing or CDN resolution.",
    real_world_scenario: "Configuring custom domain records in Azure DNS for an Application Gateway and SSL validation.",
    tradeoff_matrix: {
      dimensions: ["Target Value", "Apex / Root Support", "Resolution Hop", "Primary Use Case"],
      options: [
        {
          name: "A Record",
          values: [
            "Maps directly to an IPv4 address (e.g. 203.0.113.10)",
            "Fully supported at apex/root domain (@)",
            "Single direct lookup",
            "Mapping domains/subdomains directly to static load balancer or server IPs"
          ]
        },
        {
          name: "CNAME Record",
          values: [
            "Maps to another domain/hostname (e.g. app.azurefd.net)",
            "Not allowed at apex/root domain (@) per RFC",
            "Requires extra lookup hop to resolve target host",
            "Aliasing subdomains to CDNs, PaaS endpoints, or external hostnames"
          ]
        }
      ]
    },
    interview_answer: {
      response: [
        "DNS mappings are managed inside DNS Hosted Zones on authoritative providers like Azure DNS or Cloudflare.",
        "An 'A record' maps a hostname directly to an IPv4 address (AAAA maps to IPv6). It is required when pointing directly to static IP endpoints.",
        "A 'CNAME record' maps a hostname alias to another canonical hostname (e.g., pointing 'www.example.com' to an Azure Front Door hostname).",
        "A critical rule is that CNAME records cannot be placed at the root/apex domain (@) per DNS RFCs; for apex aliasing we use ALIAS or Azure DNS Alias records."
      ],
      why: "Mentions the RFC restriction against apex CNAME records—a favorite senior networking interview topic."
    },
    interview_kill_shot: "An A record points a hostname directly to an IP; a CNAME points a hostname alias to another domain name."
  },
  {
    index: 12,
    section: "Networking & DNS",
    prompt: "What is the difference between a public and a private IP?",
    id: "Q0219",
    categoryId: "C012",
    title: "Public IP vs Private IP Addressing (RFC 1918)",
    type: "Networking",
    difficulty: "Easy",
    chips: ["Public IP", "Private IP", "RFC 1918", "NAT", "Routing"],
    schema: "tradeoff",
    definition: "Comparison between globally routable internet IP addresses and non-routable internal RFC 1918 private network addresses.",
    why_it_matters: "Separating public ingress from internal private workloads is the core principle of cloud network defense in depth.",
    real_world_scenario: "Assigning private IPs to internal database VMs and restricting public IP assignment strictly to load balancer frontends.",
    tradeoff_matrix: {
      dimensions: ["Internet Routability", "Scope & Uniqueness", "RFC 1918 Ranges", "Security Posture"],
      options: [
        {
          name: "Public IP",
          values: [
            "Globally routable across the public internet",
            "Must be globally unique worldwide (assigned by IANA/RIR)",
            "Not in RFC 1918 ranges",
            "Directly exposed to public scanners and DDoS attacks"
          ]
        },
        {
          name: "Private IP",
          values: [
            "Not routable on the public internet (requires NAT)",
            "Unique only within local VNet/LAN (reusable across isolated networks)",
            "10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16",
            "Inherently isolated and shielded from direct public access"
          ]
        }
      ]
    },
    interview_answer: {
      response: [
        "A Public IP address is globally unique and directly routable across the public internet, used for internet-facing resources like Load Balancers or VPN gateways.",
        "A Private IP address is reserved under RFC 1918 (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) and is only routable within a private network like an Azure Virtual Network.",
        "Private IPs allow secure internal communication between VMs and Kubernetes pods without exposing them to public internet threats."
      ],
      why: "Clearly cites RFC 1918 address ranges."
    },
    interview_kill_shot: "Public IPs are globally routable on the internet; Private IPs are RFC 1918 addresses isolated within internal VNets."
  },
  {
    index: 13,
    section: "Networking & DNS",
    prompt: "What is a VNet?",
    id: "Q0220",
    categoryId: "C012",
    title: "Azure Virtual Network (VNet) Architecture & Isolation",
    type: "Networking / Azure",
    difficulty: "Easy",
    chips: ["VNet", "Subnets", "NSG", "Peering", "Azure"],
    schema: "architecture",
    definition: "An Azure Virtual Network (VNet) is an isolated private network representation in Azure cloud providing segmented CIDR blocks, subnets, routing tables, and network security controls.",
    why_it_matters: "VNets are the fundamental networking boundary for all cloud infrastructure deployments.",
    real_world_scenario: "Architecting a multi-tier VNet in Azure with dedicated subnets for Application Gateways, AKS worker nodes, and Azure SQL endpoints.",
    architecture_flow: {
      steps: [
        "1. VNet CIDR Block: Define overarching private address space (e.g. 10.0.0.0/16).",
        "2. Subnet Segmentation: Partition VNet into public/frontend subnets and private application/backend subnets.",
        "3. Security Rules: Attach Network Security Groups (NSGs) to subnets to enforce firewall access policies.",
        "4. Inter-VNet Connectivity: Connect isolated VNets securely across regions via VNet Peering."
      ],
      diagram: "Azure VNet (10.0.0.0/16) ──> Frontend Subnet (App Gateway) ──> AKS Application Subnet ──> Private Endpoint Subnet"
    },
    interview_answer: {
      response: [
        "An Azure Virtual Network (VNet) is a logically isolated private network in Azure.",
        "It provides a dedicated IP address space where you deploy cloud resources like VMs, AKS clusters, and private databases.",
        "VNets allow you to segment resources into subnets, control traffic using Network Security Groups (NSGs) and User Defined Routes (UDRs), and securely connect to on-premises networks via ExpressRoute or VPN."
      ],
      why: "Summarizes segmentation, NSG controls, and hybrid connectivity."
    },
    interview_kill_shot: "A VNet is a secure, software-defined private cloud network boundary segmented into subnets with strict routing and NSG controls."
  },
  {
    index: 14,
    section: "Networking & DNS",
    prompt: "On a home network with a router and 50 devices (laptops, phones), what kind of IP does the router assign to those devices?",
    id: "Q0221",
    categoryId: "C012",
    title: "Home Router DHCP Address Assignment & Private Subnets",
    type: "Networking",
    difficulty: "Easy",
    chips: ["DHCP", "Private IP", "NAT", "192.168.x.x", "LAN"],
    schema: "architecture",
    definition: "How local network routers utilize Dynamic Host Configuration Protocol (DHCP) to assign RFC 1918 private IP addresses to local client devices.",
    why_it_matters: "Illustrates foundational LAN addressing concepts and why Network Address Translation (NAT) is required to access the internet.",
    real_world_scenario: "Explaining how 50 home devices share a single public ISP IPv4 address.",
    architecture_flow: {
      steps: [
        "1. Device Connection: Laptop/phone connects to Wi-Fi router and sends DHCP Discover broadcast.",
        "2. DHCP Assignment: Router's internal DHCP server leases a Private IP from its RFC 1918 pool (e.g. 192.168.1.10 - 192.168.1.60).",
        "3. Gateway & DNS Provisioning: Router assigns its own private IP (192.168.1.1) as Default Gateway and DNS server.",
        "4. Outbound NAT: When devices browse the web, router translates private IPs to its single Public ISP IP via PAT (Port Address Translation)."
      ],
      diagram: "50 Devices (Private IPs: 192.168.1.x) ──[DHCP]──> Home Router (Gateway 192.168.1.1) ──[NAT/PAT]──> Public ISP IP"
    },
    interview_answer: {
      response: [
        "The home router assigns Private IP addresses (typically from the RFC 1918 range like 192.168.1.2 to 192.168.1.254) using its built-in DHCP server.",
        "All 50 devices communicate locally using these private addresses.",
        "When any device reaches out to the public internet, the router performs Network Address Translation (NAT/PAT) to translate outbound traffic to the router's single public IP address provided by the ISP."
      ],
      why: "Connects DHCP private assignment directly to NAT/PAT outbound internet access."
    },
    interview_kill_shot: "Home routers assign RFC 1918 Private IPs via DHCP and use NAT/PAT to share a single Public IPv4 address."
  },
  {
    index: 15,
    section: "Networking & DNS",
    prompt: "If public IPs are so easy to provide, why do we need to create VNets and allocate private IPs?",
    id: "Q0222",
    categoryId: "C012",
    title: "Why Use Private VNets Instead of Public IPs Everywhere?",
    type: "Networking / Security",
    difficulty: "Medium",
    chips: ["IPv4 Scarcity", "Security", "Isolation", "Zero Trust", "Cost"],
    schema: "tradeoff",
    definition: "Architectural rationale for private virtual networking based on IPv4 address exhaustion, Zero Trust attack surface reduction, and cloud cost efficiency.",
    why_it_matters: "Exposing internal backend services on public IPs violates fundamental cloud security compliance standards.",
    real_world_scenario: "Explaining why internal microservices and databases must communicate over private VNet peering rather than public internet endpoints.",
    tradeoff_matrix: {
      dimensions: ["Attack Surface", "IPv4 Address Exhaustion", "Network Latency & Throughput", "Cloud Billing Costs"],
      options: [
        {
          name: "All Public IPs",
          values: [
            "Massive attack surface (every VM open to global port scanners)",
            "IPv4 space is exhausted worldwide (costly public IP leases)",
            "Traffic may traverse public internet edge hops",
            "High cost (Azure charges per Public IP hour and egress bandwidth)"
          ]
        },
        {
          name: "Private VNet & Private IPs",
          values: [
            "Zero Trust isolation (invisible to public internet scanners)",
            "Unlimited reusable private RFC 1918 address space",
            "High-speed internal cloud backbone routing",
            "Free internal private IP allocation and lower intra-VNet latency"
          ]
        }
      ]
    },
    interview_answer: {
      response: [
        "We use Private VNets and Private IPs for three core reasons: Security, IPv4 Address Scarcity, and Architecture Economics.",
        "First, Security: placing databases and application servers on private IPs completely eliminates direct exposure to public internet port scanners, DDoS attacks, and unauthorized ingress.",
        "Second, IPv4 Exhaustion: public IPv4 addresses are globally finite and expensive, whereas private RFC 1918 address ranges provide millions of reusable IP addresses inside isolated VNets.",
        "Third, Performance & Cost: internal VNet communication stays on Microsoft's high-speed private cloud backbone without public IP hourly fees."
      ],
      why: "Covers security isolation, IPv4 scarcity, and financial cost."
    },
    interview_kill_shot: "Private VNets enforce Zero Trust network isolation and eliminate public attack surfaces while solving IPv4 scarcity."
  },
  {
    index: 16,
    section: "Networking & DNS",
    prompt: "What is CIDR and why is it important?",
    id: "Q0223",
    categoryId: "C012",
    title: "Classless Inter-Domain Routing (CIDR) Notation & Subnetting",
    type: "Networking",
    difficulty: "Medium",
    chips: ["CIDR", "Subnet Mask", "/24", "/16", "IP Math"],
    schema: "architecture",
    definition: "Classless Inter-Domain Routing (CIDR) notation expresses IP ranges using an IP address followed by a slash prefix length indicating the number of network bits.",
    why_it_matters: "Correct CIDR sizing prevents subnet address exhaustion during AKS pod scaling.",
    real_world_scenario: "Sizing an AKS Azure CNI subnet using a /21 CIDR block to support up to 2,048 pod IP allocations.",
    architecture_flow: {
      steps: [
        "1. CIDR Structure: Format is IP / Prefix (e.g. 10.0.0.0/24 where /24 means 24 network bits, 8 host bits).",
        "2. Host Capacity Calculation: Total addresses = 2^(32 - prefix length). For /24: 2^8 = 256 addresses (251 usable in Azure VNets).",
        "3. Subnet Sizing Rule: Smaller prefix (/16) = larger network (65,536 IPs); larger prefix (/28) = smaller network (16 IPs)."
      ],
      diagram: "10.0.0.0/24 ──> 24 Network Bits | 8 Host Bits ──> 2^8 = 256 Total IPs (251 Usable in Azure)"
    },
    interview_answer: {
      response: [
        "CIDR stands for Classless Inter-Domain Routing. It is a standard notation for defining IP address ranges and subnet masks efficiently.",
        "In CIDR notation like '10.0.0.0/24', the prefix '/24' indicates that the first 24 bits define the network address, leaving 8 bits for host addresses (providing 256 total addresses).",
        "CIDR is critical in cloud engineering for properly sizing Virtual Networks and Kubernetes subnets so you don't exhaust IPs when scaling workloads."
      ],
      why: "Mentions host bit calculation (32 - prefix length)."
    },
    interview_kill_shot: "CIDR notation (/24, /16) defines network boundaries and calculates exact host IP capacity for cloud subnets."
  },
  {
    index: 17,
    section: "Networking & DNS",
    prompt: "Do you know what subnet masking or IP masquerading is?",
    id: "Q0224",
    categoryId: "C012",
    title: "Subnet Masking vs IP Masquerading (NAT/SNAT)",
    type: "Networking",
    difficulty: "Medium",
    chips: ["Subnet Mask", "IP Masquerading", "SNAT", "NAT", "iptables"],
    schema: "tradeoff",
    definition: "Differentiating between Subnet Masking (bitwise IP partitioning into network/host IDs) and IP Masquerading (outbound Source Network Address Translation / SNAT).",
    why_it_matters: "Confusing subnet masks with SNAT masquerading is a common networking interview pitfall.",
    real_world_scenario: "Configuring Kubernetes node iptables masquerading so pods on private IPs can reach outbound external APIs.",
    tradeoff_matrix: {
      dimensions: ["Core Function", "OS Layer", "Example Value", "Primary Purpose"],
      options: [
        {
          name: "Subnet Masking",
          values: [
            "Bitwise mask determining if an IP is on the local subnet or remote gateway",
            "Layer 3 IP stack configuration",
            "255.255.255.0 (/24)",
            "Determining local subnet boundaries and routing rules"
          ]
        },
        {
          name: "IP Masquerading (SNAT)",
          values: [
            "Translating private source IP/port to public IP/port when exiting router",
            "Layer 4 NAT / iptables / netfilter table",
            "iptables -t nat -A POSTROUTING -j MASQUERADE",
            "Enabling internal private VMs/pods to browse outbound public internet"
          ]
        }
      ]
    },
    interview_answer: {
      response: [
        "They are two entirely different networking concepts.",
        "Subnet Masking (e.g., 255.255.255.0) is a bitmask used by an OS to determine which portion of an IP address represents the network ID versus the host ID, determining whether traffic stays local or goes to the default gateway.",
        "IP Masquerading is a form of Source Network Address Translation (SNAT) used in Linux iptables/routers where internal private IPs are dynamically rewritten to a shared outgoing public IP address so private devices can access the internet."
      ],
      why: "Crisply distinguishes bitmasking (subnetting) from address translation (SNAT masquerading)."
    },
    interview_kill_shot: "Subnet masking partitions IP addresses into local subnets; IP Masquerading is dynamic SNAT allowing private hosts outbound internet access."
  },
  {
    index: 18,
    section: "Networking & DNS",
    prompt: "What are ports, why do we use them, and what are some popular port numbers?",
    id: "Q0225",
    categoryId: "C012",
    title: "Network Ports, Multiplexing & Standard Port Numbers",
    type: "Networking",
    difficulty: "Easy",
    chips: ["Ports", "TCP/UDP", "80", "443", "22", "53"],
    schema: "architecture",
    definition: "Layer 4 16-bit numerical endpoints (0 to 65,535) used to multiplex network traffic so multiple independent applications can communicate simultaneously over a single IP address.",
    why_it_matters: "Configuring firewall NSG ingress rules requires knowing exact standard service port numbers.",
    real_world_scenario: "Opening NSG ports 80 and 443 for web traffic while locking down port 22 (SSH) strictly to bastion host IPs.",
    architecture_flow: {
      steps: [
        "1. Port 22 (TCP): SSH (Secure Shell) — encrypted server administration.",
        "2. Port 80 (TCP): HTTP — unencrypted web traffic.",
        "3. Port 443 (TCP): HTTPS — TLS/SSL encrypted web traffic.",
        "4. Port 53 (UDP/TCP): DNS — Domain Name System queries.",
        "5. Port 3306 / 5432 (TCP): MySQL / PostgreSQL database ports."
      ],
      diagram: "Single Server IP ──┬── :22 (SSH Daemon)\n                 ├── :443 (HTTPS Nginx)\n                 └── :5432 (PostgreSQL)"
    },
    interview_answer: {
      response: [
        "A network port is a 16-bit logical communication endpoint assigned to an application, allowing a single IP address to host multiple simultaneous services.",
        "Without ports, a server couldn't run a web server and a database on the same IP.",
        "Standard well-known ports include: Port 22 for SSH, Port 80 for HTTP, Port 443 for HTTPS, Port 53 for DNS, and Port 6443 for the Kubernetes API server."
      ],
      why: "Lists well-known ports and explains multiplexing across a single IP."
    },
    interview_kill_shot: "Ports enable Layer 4 transport multiplexing so multiple applications run concurrently on a single IP address."
  },
  {
    index: 19,
    section: "Networking & DNS",
    prompt: "What is the difference between an Application Load Balancer and a Network Load Balancer?",
    id: "Q0226",
    categoryId: "C012",
    title: "Layer 7 Application Load Balancer vs Layer 4 Network Load Balancer",
    type: "Networking / Cloud",
    difficulty: "Medium",
    chips: ["Layer 7", "Layer 4", "ALB", "NLB", "URL Path Routing"],
    schema: "tradeoff",
    definition: "Comparison between Layer 7 HTTP/HTTPS application load balancers and Layer 4 TCP/UDP transport network load balancers.",
    why_it_matters: "Choosing Layer 7 vs Layer 4 determines SSL termination capability, URL path routing, and latency overhead.",
    real_world_scenario: "Using an Azure Application Gateway (L7) for URL path-based routing (/api vs /app) backed by internal AKS services.",
    tradeoff_matrix: {
      dimensions: ["OSI Model Layer", "Routing Intelligence", "Performance & Latency", "SSL / TLS Termination", "Primary Azure Service"],
      options: [
        {
          name: "Layer 7 (ALB / App Gateway)",
          values: [
            "Layer 7 (Application - HTTP/HTTPS/gRPC)",
            "Advanced (URL path routing, HTTP headers, cookies, WAF inspection)",
            "Slightly higher latency (inspects full HTTP payload)",
            "Full SSL termination & re-encryption supported",
            "Azure Application Gateway / AWS ALB"
          ]
        },
        {
          name: "Layer 4 (NLB / Azure LB)",
          values: [
            "Layer 4 (Transport - TCP/UDP packets)",
            "Basic 5-tuple hash (Source/Dest IP and Port)",
            "Ultra-low latency (millions of requests/sec pass-through)",
            "Pass-through (cannot inspect HTTP headers or cookies)",
            "Azure Standard Load Balancer / AWS NLB"
          ]
        }
      ]
    },
    interview_answer: {
      response: [
        "An Application Load Balancer operates at Layer 7 (HTTP/HTTPS) of the OSI model. It inspects incoming application payloads, enabling intelligent features like URL path-based routing, SSL termination, cookie affinity, and Web Application Firewall (WAF) filtering.",
        "A Network Load Balancer operates at Layer 4 (TCP/UDP). It makes routing decisions purely based on IP addresses and ports without inspecting the HTTP payload.",
        "Layer 4 NLBs offer ultra-low latency and extreme throughput, while Layer 7 ALBs provide rich application-level routing and security."
      ],
      why: "Contrasts OSI layers, routing intelligence, and performance tradeoffs."
    },
    interview_kill_shot: "Layer 7 ALBs inspect HTTP payloads for URL path routing and SSL termination; Layer 4 NLBs route raw TCP/UDP packets at ultra-high speed."
  },
  {
    index: 20,
    section: "Networking & DNS",
    prompt: "What is the difference between a forward proxy and a reverse proxy?",
    id: "Q0227",
    categoryId: "C012",
    title: "Forward Proxy vs Reverse Proxy Architecture",
    type: "Networking",
    difficulty: "Medium",
    chips: ["Forward Proxy", "Reverse Proxy", "Nginx", "Bastion", "Ingress"],
    schema: "tradeoff",
    definition: "Architectural distinction between Forward Proxies that act on behalf of internal clients accessing external networks, and Reverse Proxies that act on behalf of internal backend servers serving external requests.",
    why_it_matters: "Reverse proxies (Nginx, Traefik, Application Gateway) form the ingress architecture of all modern web applications.",
    real_world_scenario: "Deploying an Nginx Reverse Proxy inside AKS to terminate TLS and forward requests to internal microservice pods.",
    tradeoff_matrix: {
      dimensions: ["Protected Entity", "Traffic Direction", "Visibility to External Internet", "Primary Use Case"],
      options: [
        {
          name: "Forward Proxy",
          values: [
            "Protects Internal Clients (Users / Laptops)",
            "Client ──> Forward Proxy ──> Public Internet",
            "Destination server sees Proxy IP (Client is hidden)",
            "Corporate web filtering, content caching, IP masking for outgoing users"
          ]
        },
        {
          name: "Reverse Proxy",
          values: [
            "Protects Internal Backend Servers (APIs / Web Servers)",
            "Public Client ──> Reverse Proxy ──> Internal Backend Server",
            "Public client sees Proxy IP (Backend server is hidden)",
            "SSL termination, load balancing, caching, and WAF protection before application servers"
          ]
        }
      ]
    },
    interview_answer: {
      response: [
        "A Forward Proxy sits in front of client devices and acts on their behalf when browsing the public internet, hiding client IPs and enforcing corporate web egress filtering.",
        "A Reverse Proxy sits in front of backend web servers (like an Nginx ingress or Azure App Gateway) and intercepts incoming client requests from the internet.",
        "A simple way to remember it: a Forward Proxy hides the client; a Reverse Proxy hides the server."
      ],
      why: "Includes the clean mnemonic rule ('Forward hides client; Reverse hides server')."
    },
    interview_kill_shot: "A forward proxy protects and hides outgoing client requests; a reverse proxy protects and hides incoming backend application servers."
  },
  {
    index: 21,
    section: "Networking & DNS",
    prompt: "Have you heard about TCP and UDP protocols?",
    id: "Q0228",
    categoryId: "C012",
    title: "TCP vs UDP Transport Layer Protocols (3-Way Handshake)",
    type: "Networking",
    difficulty: "Easy",
    chips: ["TCP", "UDP", "Handshake", "Reliable", "Streaming"],
    schema: "tradeoff",
    definition: "Comparison between Transmission Control Protocol (connection-oriented, reliable ordered delivery) and User Datagram Protocol (connectionless, stateless fast delivery).",
    why_it_matters: "Selecting TCP vs UDP dictates application latency, reliability, and ordering behavior.",
    real_world_scenario: "Using TCP for database and HTTP API connections while using UDP for DNS queries and StatsD/Syslog metric streaming.",
    tradeoff_matrix: {
      dimensions: ["Connection Model", "Reliability & Retransmission", "Ordering & Flow Control", "Header Overhead", "Common Applications"],
      options: [
        {
          name: "TCP (Transmission Control Protocol)",
          values: [
            "Connection-oriented (Requires 3-Way Handshake: SYN -> SYN-ACK -> ACK)",
            "Guaranteed delivery (packets retransmitted if lost)",
            "Ordered delivery guaranteed with flow control",
            "20 bytes header overhead",
            "HTTP/HTTPS (Web), SSH, PostgreSQL, REST APIs"
          ]
        },
        {
          name: "UDP (User Datagram Protocol)",
          values: [
            "Connectionless (Fire-and-forget datagrams)",
            "Best-effort delivery (lost packets are not retransmitted)",
            "No ordering or congestion control",
            "8 bytes lightweight header",
            "DNS lookups, Video streaming, VoIP, Syslog / StatsD metrics"
          ]
        }
      ]
    },
    interview_answer: {
      response: [
        "TCP and UDP are the two primary Layer 4 transport protocols.",
        "TCP is a connection-oriented protocol that establishes a 3-way handshake (SYN, SYN-ACK, ACK) to guarantee ordered, reliable packet delivery with retransmission of lost data—used for HTTP, SSH, and databases.",
        "UDP is a connectionless, lightweight protocol that transmits datagrams immediately without handshakes or retransmission guarantees—used where speed matters more than absolute reliability, such as DNS queries, video streaming, and metrics."
      ],
      why: "Mentions the 3-Way Handshake and specific real-world use cases."
    },
    interview_kill_shot: "TCP guarantees reliable, ordered packet delivery via 3-way handshake; UDP provides lightweight, connectionless real-time transmission."
  },
  {
    index: 22,
    section: "Docker & CI/CD",
    prompt: "What is Docker and what is its architecture?",
    id: "Q0229",
    categoryId: "C005",
    title: "Docker Containerization & Engine Client-Server Architecture",
    type: "Docker",
    difficulty: "Easy",
    chips: ["Docker Engine", "containerd", "Namespaces", "cgroups", "Daemon"],
    schema: "architecture",
    definition: "Container virtualization platform utilizing Linux kernel Namespaces and cgroups to package applications with their dependencies into portable container images.",
    why_it_matters: "Understanding dockerd, containerd, and runc clears up container runtime internals.",
    real_world_scenario: "Explaining how Docker isolates build agent environments without requiring heavy hypervisor VM overhead.",
    architecture_flow: {
      steps: [
        "1. Docker CLI (Client): Accepts commands ('docker run', 'docker build') and communicates via REST API to the Docker Daemon.",
        "2. Docker Daemon (dockerd): Manages images, containers, networks, and storage volumes.",
        "3. containerd & runc: High-level container runtime (containerd) delegates OCI container lifecycle execution to runc using Linux Namespaces and cgroups.",
        "4. Image Registry: Docker Hub or Azure Container Registry (ACR) storing layered OCI image artifacts."
      ],
      diagram: "Docker CLI ──[REST API]──> dockerd ──> containerd / runc (Namespaces + cgroups) ──> OCI Container"
    },
    interview_answer: {
      response: [
        "Docker is an open-source platform that uses OS-level virtualization to package applications and dependencies into portable containers.",
        "Its architecture follows a Client-Server model: the Docker CLI sends REST API commands to the Docker Daemon ('dockerd').",
        "The daemon orchestrates images and volumes, delegating actual container execution to 'containerd' and 'runc', which leverage Linux kernel Namespaces for process isolation and cgroups for resource limits."
      ],
      why: "Mentions Linux kernel primitives (Namespaces & cgroups) and containerd architecture."
    },
    interview_kill_shot: "Docker uses a client-server architecture where dockerd/containerd leverage Linux Namespaces and cgroups for lightweight isolation."
  },
  {
    index: 23,
    section: "Docker & CI/CD",
    prompt: "Can you walk me through the contents of a standard Dockerfile?",
    id: "Q0230",
    categoryId: "C005",
    title: "Anatomy of a Standard Production Dockerfile (Multi-Stage Best Practices)",
    type: "Docker",
    difficulty: "Easy",
    chips: ["Dockerfile", "FROM", "COPY", "RUN", "Multi-Stage"],
    schema: "architecture",
    definition: "Declarative instruction script used by Docker engine to assemble layered read-only container images securely and efficiently.",
    why_it_matters: "Poor Dockerfiles create bloated 1GB+ images with critical CVE vulnerabilities and slow CI/CD builds.",
    real_world_scenario: "Writing a production multi-stage Dockerfile for a Node.js microservice optimized for minimal size and non-root execution.",
    architecture_flow: {
      steps: [
        "1. Base Image: 'FROM node:20-alpine AS builder' (use slim/alpine base image).",
        "2. Workdir & Dependencies: 'WORKDIR /app' -> 'COPY package*.json ./' -> 'RUN npm ci --only=production'.",
        "3. Application Code: 'COPY . .' -> 'RUN npm run build'.",
        "4. Production Stage: 'FROM node:20-alpine AS runner' -> copy compiled artifacts from builder stage.",
        "5. Least Privilege User: 'USER node' (never run containers as root) -> 'EXPOSE 3000' -> 'CMD [\"node\", \"dist/main.js\"]'."
      ],
      diagram: "FROM (Alpine Base) ──> COPY package.json (Cache Layer) ──> RUN npm ci ──> USER node (Non-Root) ──> CMD"
    },
    interview_answer: {
      response: [
        "A production Dockerfile starts with a lightweight base image using 'FROM', such as Alpine or Distroless.",
        "Next, we set the working directory with 'WORKDIR', copy dependency manifests first ('COPY package*.json ./') to leverage layer caching, and execute package installation with 'RUN'.",
        "After copying source code and building, we use Multi-Stage Builds to discard heavy build-time compilers.",
        "Finally, we switch to a non-privileged user ('USER node'), declare listening ports with 'EXPOSE', and define the runtime startup command using 'CMD'."
      ],
      why: "Covers multi-stage optimization, layer caching order, and non-root security."
    },
    interview_kill_shot: "A standard Dockerfile uses multi-stage builds, optimizes layer cache ordering, and executes runtime processes as a non-root user."
  },
  {
    index: 24,
    section: "Docker & CI/CD",
    prompt: "What is the difference between CMD and ENTRYPOINT in a Dockerfile?",
    id: "Q0231",
    categoryId: "C005",
    title: "CMD vs ENTRYPOINT in Dockerfiles — Exec vs Shell Form",
    type: "Docker",
    difficulty: "Medium",
    chips: ["CMD", "ENTRYPOINT", "Dockerfile", "Runtime Arguments"],
    schema: "tradeoff",
    definition: "Comparison between Dockerfile runtime execution instructions: CMD provides default overridable arguments/commands, while ENTRYPOINT defines the immutable executable container binary.",
    why_it_matters: "Confusing CMD and ENTRYPOINT leads to containers that ignore CLI flags or break Kubernetes command overrides.",
    real_world_scenario: "Configuring a CLI utility container where ENTRYPOINT defines the tool binary and CMD supplies default flags.",
    tradeoff_matrix: {
      dimensions: ["Core Function", "Overridability at 'docker run'", "Best Practice Pairing", "Example Usage"],
      options: [
        {
          name: "ENTRYPOINT",
          values: [
            "Defines the fixed executable binary that the container will run",
            "Not overridden by default arguments (requires explicit '--entrypoint' flag)",
            "ENTRYPOINT [\"nginx\", \"-g\", \"daemon off;\"]",
            "Wrappers, strict binaries, or tools where container acts as a dedicated executable"
          ]
        },
        {
          name: "CMD",
          values: [
            "Provides default command or default arguments passed into ENTRYPOINT",
            "Easily overridden by appending any arguments after image name in 'docker run'",
            "CMD [\"--help\"] or CMD [\"npm\", \"start\"]",
            "Providing default runtime flags that users can easily override"
          ]
        }
      ]
    },
    interview_answer: {
      response: [
        "ENTRYPOINT defines the core executable binary that the container must run, and it is not overridden by standard command-line arguments passed to 'docker run'.",
        "CMD provides default execution commands or default arguments to the ENTRYPOINT, and any argument appended to 'docker run' completely replaces the CMD value.",
        "Best practice is to combine them: define the fixed binary in ENTRYPOINT and pass default flags in CMD."
      ],
      why: "Explains how ENTRYPOINT and CMD combine harmoniously."
    },
    interview_kill_shot: "ENTRYPOINT sets the immutable executable binary; CMD supplies default arguments that can be easily overridden at runtime."
  },
  {
    index: 25,
    section: "Docker & CI/CD",
    prompt: "Can you append arguments to an ENTRYPOINT at runtime?",
    id: "Q0232",
    categoryId: "C005",
    title: "Appending Runtime Arguments to ENTRYPOINT & Overriding Executables",
    type: "Docker",
    difficulty: "Medium",
    chips: ["ENTRYPOINT", "docker run", "--entrypoint", "Runtime Flags"],
    schema: "architecture",
    definition: "Passing runtime arguments to a container whose Dockerfile specifies an ENTRYPOINT instruction in exec JSON array format.",
    why_it_matters: "Essential when debugging containers or passing dynamic environment flags into containerized utilities.",
    real_world_scenario: "Running a containerized database backup utility ('docker run backup-tool --db=prod --dry-run') where extra flags append directly to ENTRYPOINT.",
    architecture_flow: {
      steps: [
        "1. Exec Form Requirement: ENTRYPOINT must use JSON Exec array syntax ('ENTRYPOINT [\"ping\"]') rather than Shell form.",
        "2. Appending Arguments: Running 'docker run my-image google.com' appends 'google.com' directly after 'ping'.",
        "3. Overriding Executable: To change the ENTRYPOINT binary entirely, pass '--entrypoint /bin/sh' before the image name."
      ],
      diagram: "ENTRYPOINT [\"ping\"] + docker run my-img google.com ──> Executes: ping google.com"
    },
    interview_answer: {
      response: [
        "Yes! Any arguments passed at the end of 'docker run image_name <args>' are automatically appended as arguments to the ENTRYPOINT (provided ENTRYPOINT is written in JSON exec form like ENTRYPOINT [\"ping\"]).",
        "If you want to override the ENTRYPOINT executable itself (for example, to open a debug bash shell), you must pass the explicit '--entrypoint /bin/sh' flag."
      ],
      why: "Crucially notes the Exec JSON array form requirement."
    },
    interview_kill_shot: "Arguments appended to 'docker run' concatenate to JSON-form ENTRYPOINTs; overriding the binary requires the '--entrypoint' flag."
  },
  {
    index: 26,
    section: "Docker & CI/CD",
    prompt: "How do you deploy your containers?",
    id: "Q0233",
    categoryId: "C002",
    title: "Container Deployment Strategy — ACR to AKS via Helm & GitOps",
    type: "CI/CD / Kubernetes",
    difficulty: "Easy",
    chips: ["AKS", "ACR", "Helm", "Argo CD", "Deployment"],
    schema: "architecture",
    definition: "End-to-end container delivery lifecycle moving built container images from Azure Container Registry (ACR) into Azure Kubernetes Service (AKS) using automated manifests.",
    why_it_matters: "Demonstrates production deployment maturity over running ad-hoc 'docker run' scripts on servers.",
    real_world_scenario: "Automating zero-downtime rolling deployments to production AKS clusters using Helm charts and GitOps.",
    architecture_flow: {
      steps: [
        "1. Image Build & Push: Azure DevOps pipeline builds container image and pushes immutable tag (Git commit SHA) to Azure Container Registry (ACR).",
        "2. Manifest Update: Pipeline updates Helm chart image tag in deployment repository.",
        "3. Automated Rollout: Argo CD (GitOps) or Azure DevOps CD pipeline deploys updated Helm release to AKS.",
        "4. Rolling Update & Probes: Kubernetes performs rolling deployment validated by readiness and liveness probes."
      ],
      diagram: "Build Image (ACR SHA Tag) ──> Update Helm Manifest ──> Argo CD / CD Pipeline ──> AKS Rolling Rollout"
    },
    interview_answer: {
      response: [
        "We deploy our containers into Azure Kubernetes Service (AKS) using automated CI/CD pipelines.",
        "Once a container image is built and tagged with the Git commit SHA, it is pushed to Azure Container Registry (ACR).",
        "Our continuous delivery pipeline uses Helm charts stored in Git to upgrade the Kubernetes deployment, triggering a zero-downtime rolling update verified by automated health probes."
      ],
      why: "Highlights immutable SHA tags, ACR integration, and zero-downtime Kubernetes rollouts."
    },
    interview_kill_shot: "We deploy containers to AKS via automated Helm charts using immutable Git SHA image tags pushed to ACR."
  },
  {
    index: 27,
    section: "Docker & CI/CD",
    prompt: "What are the different stages of your CI/CD pipeline?",
    id: "Q0234",
    categoryId: "C002",
    title: "End-to-End Production CI/CD Pipeline Architecture (Multi-Stage YAML)",
    type: "CI/CD / Azure DevOps",
    difficulty: "Easy",
    chips: ["CI/CD", "Lint", "SonarQube", "Trivy", "Deployment Stages"],
    schema: "timeline",
    definition: "Structured sequential delivery stages executing source linting, unit tests, static code analysis, image scanning, staging rollout, and production deployment.",
    why_it_matters: "A well-governed pipeline catches bugs and security flaws left-of-production.",
    real_world_scenario: "Multi-stage Azure DevOps YAML pipeline governing production releases for Coforge microservices.",
    timeline_flow: {
      phases: [
        {
          title: "Stage 1: Code Quality & Unit Testing (Continuous Integration)",
          details: "Lint source code, run unit tests with code coverage gates, and execute SonarQube static code analysis."
        },
        {
          title: "Stage 2: Container Build & Security Scan",
          details: "Build multi-stage Docker image, execute Trivy container vulnerability scan, and push image to ACR."
        },
        {
          title: "Stage 3: Staging Deployment & Automated QA",
          details: "Deploy Helm chart to Dev/Staging AKS cluster and run automated E2E regression and integration tests."
        },
        {
          title: "Stage 4: Production Approval Gate & Zero-Downtime Rollout",
          details: "Enforce manual approval gate / change request, then perform zero-downtime rolling deployment to Production AKS."
        }
      ]
    },
    interview_answer: {
      response: [
        "Our standard production CI/CD pipeline consists of four distinct stages.",
        "Stage 1 is Continuous Integration: running automated unit tests, code linting, and SonarQube static quality checks upon pull request.",
        "Stage 2 is Containerization & Security: building the Docker image, running a Trivy vulnerability scan against CVEs, and pushing the immutable image to ACR.",
        "Stage 3 is Staging Rollout: deploying to the QA Kubernetes environment and running automated integration smoke tests.",
        "Stage 4 is Production Deployment: requiring a formal approval gate before executing a zero-downtime rolling update on Production AKS."
      ],
      why: "Covers security scanning (Trivy), static analysis (SonarQube), and approval gates."
    },
    interview_kill_shot: "Our CI/CD pipeline enforces automated quality gates, vulnerability image scanning, and approval-gated rolling AKS deployments."
  },
  {
    index: 28,
    section: "Docker & CI/CD",
    prompt: "Have you worked with Kubernetes, and have you written pipelines completely from scratch by hand?",
    id: "Q0235",
    categoryId: "C006",
    title: "Writing Kubernetes Manifests & Azure DevOps Pipelines from Scratch",
    type: "Kubernetes / CI/CD",
    difficulty: "Easy",
    chips: ["Kubernetes", "YAML from Scratch", "AKS", "Azure Pipelines", "Hands-on"],
    schema: "architecture",
    definition: "Demonstrating first-principles engineering competence by authoring Kubernetes YAML manifests (Deployments, Services, Ingress, HPA) and Azure DevOps YAML pipelines without relying on wizards.",
    why_it_matters: "Proves you are a true hands-on engineer rather than someone who only clicks UI buttons.",
    real_world_scenario: "Architecting a multi-stage Azure DevOps YAML pipeline and complete Helm chart manifest structure for a new microservice from scratch.",
    architecture_flow: {
      steps: [
        "1. Pipeline Authoring: Write multi-stage 'azure-pipelines.yml' defining triggers, pool agents, variables, and build/deploy jobs.",
        "2. Kubernetes Manifest Authoring: Write clean declarative YAML for Deployment (replicas, resources, probes), Service (ClusterIP), and Ingress.",
        "3. GitOps Integration: Parameterize manifests into Helm values files for dev/staging/prod environment promotion."
      ],
      diagram: "Author azure-pipelines.yml ──> Write K8s Deployment/Service YAML ──> Parameterize Helm Values ──> Deploy"
    },
    interview_answer: {
      response: [
        "Yes, absolutely. I have built both Azure DevOps YAML pipelines and Kubernetes manifests completely from scratch.",
        "For Kubernetes, I author declarative YAML files defining Deployments with explicit CPU/Memory resource limits, liveness and readiness probes, ClusterIP Services, and Ingress routes.",
        "For pipelines, I write multi-stage YAML files defining stages, jobs, service connection references, and environment protection gates rather than relying on classic UI wizards."
      ],
      why: "Emphasizes declarative YAML mastery and production safeguards like resource limits and health probes."
    },
    interview_kill_shot: "I author complete declarative Azure DevOps pipelines and production Kubernetes manifests from scratch by hand."
  }
];

// Map questions against merged.json
const mappingOutput = {
  metadata: {
    sourceFile: "Infinite_Locus.md",
    totalQuestions: structuredQuestions.length,
    generatedAt: new Date().toISOString()
  },
  questions: structuredQuestions.map(q => {
    // Check if ID already exists in merged
    const existing = mergedById.get(q.id);
    return {
      index: q.index,
      section: q.section,
      prompt: q.prompt,
      assignedId: q.id,
      assignedCategoryId: q.categoryId,
      title: q.title,
      status: existing ? "matched_existing_or_updated" : "new_scenario"
    };
  })
};

fs.writeFileSync(mappingOutputPath, JSON.stringify(mappingOutput, null, 2), 'utf8');

// Export standalone dataset
fs.writeFileSync(outputPath, JSON.stringify(structuredQuestions, null, 2), 'utf8');

// Merge into merged.json without duplicating IDs
let updatedCount = 0;
let addedCount = 0;

structuredQuestions.forEach(q => {
  if (mergedById.has(q.id)) {
    // Replace/update existing entry with rich structured version
    const idx = merged.findIndex(item => item.id === q.id);
    if (idx !== -1) {
      merged[idx] = q;
      updatedCount++;
    }
  } else {
    merged.push(q);
    mergedById.set(q.id, q);
    addedCount++;
  }
});

fs.writeFileSync(mergedPath, JSON.stringify(merged, null, 2), 'utf8');

console.log(`Successfully mapped ${structuredQuestions.length} questions.`);
console.log(`Updated ${updatedCount} existing questions and added ${addedCount} new questions to merged.json. Total merged questions: ${merged.length}`);
