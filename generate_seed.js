const fs = require('fs');

const seedData = {
  version: "1.0",
  keywords: [
    // --- LINUX & OS ---
    {
      keyword: "Linux",
      aliases: ["Linux OS", "GNU/Linux"],
      category: "Linux & Operating Systems",
      interviewDomain: "Automation",
      difficulty: "Beginner",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: [],
      definition: {
        shortDefinition: "An open-source, Unix-like operating system kernel that serves as the foundation for modern cloud and container infrastructure.",
        detailedExplanation: "Linux manages system hardware resources and provides interfaces for user space programs. It utilizes a monolithic kernel architecture where device drivers, memory management, and file systems run in a privileged kernel space.",
        whyItExists: "To provide a secure, stable, and highly customizable operating system foundation that is free from licensing overhead and open to community modification.",
        howItWorks: "User programs make system calls (syscalls) to request services from the kernel, which interacts directly with CPU, memory, and devices.",
        realWorldUsage: "The base OS for virtually all Docker containers, Kubernetes nodes, cloud virtual machines, and embedded systems.",
        interviewExpectation: "Explain kernel vs user space, basic syscall concepts, boot sequence, and core utilities.",
        commonMistakes: ["Confusing the Linux kernel with a full distribution (GNU/Linux)", "Running application processes as root inside containers"],
        followUpQuestions: ["Explain the difference between soft and hard links.", "What is the role of the Init process?"]
      }
    },
    {
      keyword: "Process",
      aliases: ["OS Process", "Linux Process"],
      category: "Linux & Operating Systems",
      interviewDomain: "Reliability",
      difficulty: "Intermediate",
      frequency: 8,
      importance: 8,
      seniority: "Senior",
      dependsOn: ["Linux"],
      definition: {
        shortDefinition: "An executing instance of a program with its own isolated address space, file descriptors, and security context.",
        detailedExplanation: "A process is created via the fork() syscall and replaced with new code via exec(). The OS allocates private memory pages and tracks it via a Process Control Block (PCB).",
        whyItExists: "To run applications concurrently while ensuring memory isolation and scheduling boundaries between different programs.",
        howItWorks: "The kernel schedules process threads on CPU cores. When switching processes, a context switch saves and restores registers and CPU cache states.",
        realWorldUsage: "Running application servers (Node, Python, Nginx) as managed processes under systemd or container entrypoints.",
        interviewExpectation: "Explain process memory layout (heap, stack), state transitions (running, runnable, sleeping, zombie), and signaling.",
        commonMistakes: ["Assuming processes share memory by default", "Allowing orphan/zombie processes to accumulate, leaking PID descriptors"],
        followUpQuestions: ["What is a zombie process and how do you clean it up?", "Explain copy-on-write during fork()."]
      }
    },
    {
      keyword: "Thread",
      aliases: ["Execution Thread"],
      category: "Linux & Operating Systems",
      interviewDomain: "Performance",
      difficulty: "Intermediate",
      frequency: 7,
      importance: 8,
      seniority: "Senior",
      dependsOn: ["Process"],
      definition: {
        shortDefinition: "The smallest unit of execution within a process, sharing the parent process's memory space and resources.",
        detailedExplanation: "Threads are created via clone() on Linux. They share the text, data, and heap segments but have their own execution stack, registers, and program counter.",
        whyItExists: "To achieve concurrency within a single application, allowing fast execution and context switching without process memory copying.",
        howItWorks: "Threads execute concurrently on multi-core processors. Because they share memory, developers must use mutexes or locks to prevent race conditions.",
        realWorldUsage: "Handling concurrent HTTP requests inside multithreaded web servers (Apache, Java Spring) or background workers.",
        interviewExpectation: "Explain thread vs process, concurrency bugs (deadlocks, race conditions), and the impact of the Python GIL.",
        commonMistakes: ["Sharing mutable state between threads without synchronization", "Spawning unlimited threads instead of utilizing thread pools"],
        followUpQuestions: ["What is a race condition and how do you prevent it?", "How does the Python GIL affect thread concurrency?"]
      }
    },
    {
      keyword: "Daemon",
      aliases: ["Daemon Process", "Background Service"],
      category: "Linux & Operating Systems",
      interviewDomain: "Automation",
      difficulty: "Intermediate",
      frequency: 7,
      importance: 7,
      seniority: "Senior",
      dependsOn: ["Process"],
      definition: {
        shortDefinition: "A background process that runs continuously to handle service requests, system tasks, or monitor hardware.",
        detailedExplanation: "Daemons detach from control terminals, set the root directory as working directory, clear umask, and run as system services (suffix 'd', e.g., sshd, systemd, dockerd).",
        whyItExists: "To execute long-running services that must exist independently of user sessions.",
        howItWorks: "During initialization, a daemon forks, exits the parent, calls setsid() to create a new session, and redirects standard I/O streams to /dev/null or log files.",
        realWorldUsage: "Running sshd for remote access, crond for schedule management, and kubelet for Kubernetes node coordination.",
        interviewExpectation: "Explain how to initialize a daemon process and manage background services via systemd.",
        commonMistakes: ["Leaving file descriptors open when daemonizing", "Running daemons with higher privileges than required"],
        followUpQuestions: ["What is the purpose of setsid() in daemonization?", "How does systemd manage daemon dependencies?"]
      }
    },
    {
      keyword: "Systemd",
      aliases: ["systemctl", "systemd service"],
      category: "Linux & Operating Systems",
      interviewDomain: "Automation",
      difficulty: "Intermediate",
      frequency: 8,
      importance: 8,
      seniority: "Senior",
      dependsOn: ["Linux"],
      definition: {
        shortDefinition: "The standard system initialization and service manager for modern Linux distributions.",
        detailedExplanation: "Systemd runs as PID 1, replacing SysV init. It manages services, mount points, devices, and sockets using declarative unit files (.service, .target, .socket).",
        whyItExists: "To parallelize system startup, manage daemon dependencies dynamically, track processes using cgroups, and replace legacy init shell scripts.",
        howItWorks: "It reads unit configuration files, tracks process hierarchies via kernel cgroups, spawns processes parallelly, and gathers logs via journald.",
        realWorldUsage: "Configuring application units (gunicorn, nginx) to start automatically on system boot and restart on crashes.",
        interviewExpectation: "Demonstrate writing a custom systemd unit file, understanding unit sections (Unit, Service, Install), and troubleshooting with journalctl.",
        commonMistakes: ["Hardcoding absolute paths in service ExecStart without absolute syntax", "Not setting appropriate Restart policies or user permissions"],
        followUpQuestions: ["What is the difference between a target and a service in systemd?", "How do you inspect a failed service using journalctl?"]
      }
    },
    {
      keyword: "Cron",
      aliases: ["Crontab", "cron job", "crond"],
      category: "Linux & Operating Systems",
      interviewDomain: "Automation",
      difficulty: "Beginner",
      frequency: 8,
      importance: 7,
      seniority: "Senior",
      dependsOn: ["Daemon"],
      definition: {
        shortDefinition: "A time-based job scheduler daemon in Unix-like operating systems.",
        detailedExplanation: "Cron reads schedule tables (crontabs) containing 5-field syntax (minute, hour, day of month, month, day of week) and runs tasks in background shells.",
        whyItExists: "To automate periodic maintenance tasks, backup scripts, system check routines, and log rotations without manual execution.",
        howItWorks: "The crond daemon wakes up every minute, parses /etc/crontab and user crontabs, and executes any matching command schedule lines.",
        realWorldUsage: "Running database backups at 2 AM daily, sending email digests weekly, and rotating application logs.",
        interviewExpectation: "Compose cron syntax, understand environmental restrictions of cron shell environments, and redirect outputs safely.",
        commonMistakes: ["Assuming normal user PATH variables are loaded in cron contexts (always use absolute paths)", "Forgetting to redirect stdout/stderr, resulting in local mail spikes"],
        followUpQuestions: ["How does cron handle jobs that overlap their execution duration?", "Explain the syntax '*/5 * * * *'."]
      }
    },
    {
      keyword: "Signals",
      aliases: ["Linux Signals", "POSIX Signals"],
      category: "Linux & Operating Systems",
      interviewDomain: "Reliability",
      difficulty: "Intermediate",
      frequency: 8,
      importance: 8,
      seniority: "Senior",
      dependsOn: ["Process"],
      definition: {
        shortDefinition: "Asynchronous notifications sent by the OS or processes to indicate system events or control execution.",
        detailedExplanation: "Signals interrupt execution, forcing the target process to execute a signal handler, ignore the signal, or terminate. Key signals are SIGKILL (9) and SIGTERM (15).",
        whyItExists: "To enable basic inter-process communication (IPC) and allow the OS to manage process lifecycles dynamically.",
        howItWorks: "The kernel updates the process's signal pending bitmask. During context switch return, the process processes the signal using registered handlers.",
        realWorldUsage: "Sending SIGTERM to gracefully shut down application servers, and sending SIGKILL to force-terminate unresponsive processes.",
        interviewExpectation: "Explain the difference between SIGTERM and SIGKILL, and how to write signal handlers for graceful shutdown.",
        commonMistakes: ["Ignoring SIGTERM indefinitely, causing orchestration platforms to force-kill processes after timeouts", "Attempting to trap or block SIGKILL (which cannot be caught)"],
        followUpQuestions: ["What is the difference between SIGTERM (15) and SIGKILL (9)?", "What is SIGCHLD and how is it used?"]
      }
    },
    {
      keyword: "File System",
      aliases: ["Linux File System", "ext4", "XFS"],
      category: "Linux & Operating Systems",
      interviewDomain: "Reliability",
      difficulty: "Intermediate",
      frequency: 7,
      importance: 8,
      seniority: "Senior",
      dependsOn: ["Linux"],
      definition: {
        shortDefinition: "The data structure and logical method used to store, organize, and access files on physical disks.",
        detailedExplanation: "Linux treats everything as a file. The filesystem exposes files via index nodes (inodes) containing file metadata, mapping paths via a Virtual File System (VFS).",
        whyItExists: "To abstract raw block storage devices into a hierarchy of directories, files, links, and mount points.",
        howItWorks: "Disks are formatted (ext4, XFS). Directories map filenames to inode numbers. Inodes point to actual data blocks on physical disk cylinders.",
        realWorldUsage: "Mounting persistent network shares to container volumes, analyzing disk space with df/du, and configuring storage classes.",
        interviewExpectation: "Explain inodes, mount points, symbolic/hard links, and how to debug disk capacity issues (e.g. out of inodes).",
        commonMistakes: ["Deleting files that are still held open by running processes, leaving disk space occupied", "Confusing hard links with symlinks"],
        followUpQuestions: ["What happens if a filesystem runs out of inodes but has disk space?", "How does 'lsof | grep deleted' help troubleshoot disk issues?"]
      }
    },
    {
      keyword: "Kernel",
      aliases: ["OS Kernel", "Linux Kernel"],
      category: "Linux & Operating Systems",
      interviewDomain: "Architecture",
      difficulty: "Advanced",
      frequency: 7,
      importance: 8,
      seniority: "Senior",
      dependsOn: ["Linux"],
      definition: {
        shortDefinition: "The central core component of the operating system that has absolute control over everything in the system.",
        detailedExplanation: "The kernel manages hardware interaction, CPU scheduling, virtual memory, filesystems, and process communication, acting as the bridge between software and hardware.",
        whyItExists: "To isolate user software from hardware complexities and ensure security, multiplexing, and resource allocation abstraction.",
        howItWorks: "It runs in supervisor mode (Ring 0), handling interrupts, scheduling tasks via a thread scheduler, and managing memory pages via MMU hardware.",
        realWorldUsage: "Tuning kernel parameters (/proc/sys) for network stack optimizations (sysctl) on Kubernetes nodes.",
        interviewExpectation: "Differentiate between kernel space and user space, monolithic vs microkernel, and explain dynamic kernel modules (DKMS).",
        commonMistakes: ["Modifying kernel parameters blindly in production without testing latency impacts", "Forgetting that container runtimes share the underlying host kernel"],
        followUpQuestions: ["What is a system call and how does it transition from user space to kernel space?", "Explain memory swapping from the kernel perspective."]
      }
    },

    // --- NETWORKING ---
    {
      keyword: "TCP",
      aliases: ["Transmission Control Protocol", "TCP/IP"],
      category: "Networking",
      interviewDomain: "Networking",
      difficulty: "Intermediate",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: [],
      definition: {
        shortDefinition: "A connection-oriented, reliable, and ordered transport layer protocol (L4) in the IP suite.",
        detailedExplanation: "TCP uses a three-way handshake (SYN, SYN-ACK, ACK) to establish connections, ensures reliability via checksums/ACKs, and manages flow control via sliding window mechanisms.",
        whyItExists: "To guarantee that packets arrive at the destination in order, without corruption, and without duplicate copies over unreliable physical links.",
        howItWorks: "It breaks application data into segments, numbers them, tracks delivery state, dynamically adjusts transmission rates via congestion control (TCP Reno/BBR), and terminates connections using a four-way handshake.",
        realWorldUsage: "HTTP/1.x, HTTP/2, SSH, database connections, and API endpoints rely on TCP for data integrity.",
        interviewExpectation: "Explain three-way handshake, congestion control, TIME_WAIT socket states, and packet header structures.",
        commonMistakes: ["Using TCP for real-time video streaming or DNS queries where packet loss latency is unacceptable", "Not tuning socket buffers for high-latency, high-bandwidth networks"],
        followUpQuestions: ["Explain the difference between SYN floods and normal connection handshakes.", "What is the purpose of the TCP TIME_WAIT state?"]
      }
    },
    {
      keyword: "UDP",
      aliases: ["User Datagram Protocol"],
      category: "Networking",
      interviewDomain: "Networking",
      difficulty: "Beginner",
      frequency: 8,
      importance: 8,
      seniority: "Senior",
      dependsOn: [],
      definition: {
        shortDefinition: "A connectionless, lightweight, and unordered transport layer protocol (L4) in the IP suite.",
        detailedExplanation: "UDP sends independent packets (datagrams) without establishing connections, acknowledging receipts, or implementing flow control, minimizing latency overhead.",
        whyItExists: "To prioritize speed, low overhead, and real-time execution over reliability and packet delivery order.",
        howItWorks: "It wraps application payloads in simple headers containing source/destination ports, length, and optional checksums, and pushes them straight to IP.",
        realWorldUsage: "DNS resolution, VoIP, video conferencing, online gaming, and log shipping protocols (Syslog, StatsD).",
        interviewExpectation: "Compare TCP vs UDP, explain UDP header simplicity, and discuss network use cases.",
        commonMistakes: ["Expecting UDP packet order or delivery guarantees in application logic", "Not handling fragmentation when datagrams exceed MTU limits"],
        followUpQuestions: ["Why does DNS use UDP for queries but sometimes TCP for zone transfers?", "What is MTU and how does it relate to UDP fragmentation?"]
      }
    },
    {
      keyword: "DNS",
      aliases: ["Domain Name System", "Nameserver"],
      category: "Networking",
      interviewDomain: "Networking",
      difficulty: "Intermediate",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: ["UDP", "TCP"],
      definition: {
        shortDefinition: "A decentralized hierarchical naming system that translates human-readable domain names into IP addresses.",
        detailedExplanation: "DNS operates globally over port 53 (UDP/TCP). It includes root servers, Top-Level Domain (TLD) servers, authoritative nameservers, and recursive resolvers.",
        whyItExists: "To eliminate the need for humans to memorize numeric IP addresses for web services and enable dynamic routing via name records.",
        howItWorks: "Resolvers query nameservers recursively. Records include A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), TXT (text verification), and SRV (service discovery).",
        realWorldUsage: "CoreDNS in Kubernetes resolving pod and service domain names; Route53 managing cloud traffic routing.",
        interviewExpectation: "Explain record types, recursive vs iterative lookup, TTL values, DNS caching, and troubleshooting tools (dig, nslookup).",
        commonMistakes: ["Setting TTL values too high during IP migrations, causing extended traffic routing delays", "Neglecting search domains and ndots configurations inside containers, slowing DNS resolutions"],
        followUpQuestions: ["Explain how DNS resolution works step-by-step from the browser.", "What is the impact of ndots:5 in a Kubernetes Pod configuration?"]
      }
    },
    {
      keyword: "HTTP",
      aliases: ["Hypertext Transfer Protocol", "HTTP/1.1", "HTTP/2"],
      category: "Networking",
      interviewDomain: "Networking",
      difficulty: "Beginner",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: ["TCP"],
      definition: {
        shortDefinition: "The application layer protocol (L7) that structures communication on the World Wide Web.",
        detailedExplanation: "HTTP follows a client-server request-response paradigm. HTTP/1.1 introduced keep-alive connections; HTTP/2 added binary multiplexing; HTTP/3 migrated to UDP-based QUIC.",
        whyItExists: "To standardize how web browsers, mobile clients, and backend microservices exchange resource data (HTML, JSON, media).",
        howItWorks: "Clients send a request string (method, URI, headers, body). The server responds with status codes (2xx success, 3xx redirect, 4xx client error, 5xx server error) and data.",
        realWorldUsage: "Developing and consuming REST APIs, serving static web pages, and routing reverse proxy traffic.",
        interviewExpectation: "Understand status codes, connection management, request headers (host, user-agent, content-type), and HTTP/2 multiplexing benefits.",
        commonMistakes: ["Using incorrect status codes (e.g. returning 200 OK for an error payload)", "Not setting connection timeouts, leading to thread exhaustion"],
        followUpQuestions: ["What is the difference between HTTP/1.1 and HTTP/2?", "Explain the difference between POST and PUT methods."]
      }
    },
    {
      keyword: "HTTPS",
      aliases: ["HTTP Secure", "HTTP over TLS"],
      category: "Networking",
      interviewDomain: "Security",
      difficulty: "Intermediate",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: ["HTTP", "TLS"],
      definition: {
        shortDefinition: "An encrypted version of HTTP that uses TLS to secure all communications over a network.",
        detailedExplanation: "HTTPS encrypts HTTP request/response traffic using symmetric keys established during a cryptographic handshake, typically over port 443.",
        whyItExists: "To prevent eavesdropping, tampering, and man-in-the-middle attacks on web communication.",
        howItWorks: "The client establishes a TLS session, verifies the server's identity using an X.509 certificate signed by a trusted CA, negotiates cipher suites, and exchanges encrypted HTTP packets.",
        realWorldUsage: "Securing customer-facing web traffic, protecting API integrations, and enforcing TLS requirements inside microservices.",
        interviewExpectation: "Explain the connection process, certificates, CA chains, and how encryption protects data in transit.",
        commonMistakes: ["Enabling TLS termination but forwarding plaintext traffic internally without encrypting sensitive backend routes", "Using expired or self-signed certificates in production without proper CA trust configurations"],
        followUpQuestions: ["How does client browser verify a server TLS certificate?", "What is SNI (Server Name Indication) and why does it matter?"]
      }
    },
    {
      keyword: "TLS",
      aliases: ["Transport Layer Security", "SSL/TLS"],
      category: "Networking",
      interviewDomain: "Security",
      difficulty: "Advanced",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: ["TCP"],
      definition: {
        shortDefinition: "A cryptographic protocol designed to provide secure communications over a computer network.",
        detailedExplanation: "TLS (current standard TLS 1.3) uses asymmetric cryptography for handshakes and key exchange (ECDHE) and symmetric encryption for bulk data transfer (AES-GCM).",
        whyItExists: "To establish secure, private, and authenticated channels over untrusted IP networks.",
        howItWorks: "Client and server negotiate cipher suites, exchange public keys, authenticate using certificates, generate ephemeral symmetric session keys, and switch to encrypted communication.",
        realWorldUsage: "Securing web services, database links (SSL connections), and establishing secure tunnels (VPNs).",
        interviewExpectation: "Explain symmetric vs asymmetric encryption, cipher suites, TLS 1.2 vs 1.3 handshakes, and forward secrecy.",
        commonMistakes: ["Supporting legacy, insecure protocols (TLS 1.0, 1.1) or weak cipher suites in production configurations", "Failing to check for certificate expiration in automated monitoring pipelines"],
        followUpQuestions: ["What is perfect forward secrecy (PFS)?", "How does TLS 1.3 reduce handshake latency compared to TLS 1.2?"]
      }
    },
    {
      keyword: "SSL",
      aliases: ["Secure Sockets Layer"],
      category: "Networking",
      interviewDomain: "Security",
      difficulty: "Beginner",
      frequency: 6,
      importance: 6,
      seniority: "Senior",
      dependsOn: ["TCP"],
      definition: {
        shortDefinition: "The deprecated predecessor to TLS, originally developed by Netscape to secure web traffic.",
        detailedExplanation: "SSL (versions 1.0, 2.0, 3.0) has been fully deprecated due to critical cryptographic vulnerabilities (like POODLE). The term 'SSL' is still commonly used colloquially to refer to TLS.",
        whyItExists: "Historically created to introduce encryption and trust verification to the early web.",
        howItWorks: "Negotiated key exchange to encrypt payload bytes over sockets (historically port 443).",
        realWorldUsage: "No longer used in production; legacy systems must be migrated to modern TLS standards.",
        interviewExpectation: "Acknowledge that SSL is deprecated and explain that TLS is the modern implementation.",
        commonMistakes: ["Allowing SSLv3 fallback in web server configurations, exposing endpoints to protocol downgrade attacks"],
        followUpQuestions: ["Why was SSL 3.0 deprecated?", "What is a protocol downgrade attack?"]
      }
    },
    {
      keyword: "Load Balancer",
      aliases: ["L4 Load Balancer", "L7 Load Balancer", "LB"],
      category: "Networking",
      interviewDomain: "Scalability",
      difficulty: "Intermediate",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: ["TCP", "UDP"],
      definition: {
        shortDefinition: "A device or software system that distributes network or application traffic across a cluster of servers.",
        detailedExplanation: "Load balancers operate either at Layer 4 (transport layer, IP/port routing) or Layer 7 (application layer, content-aware routing). They perform health checks to bypass failed nodes.",
        whyItExists: "To ensure high availability, increase system capacity, prevent individual server saturation, and enable horizontal scaling.",
        howItWorks: "It receives incoming connections on a public/private IP, selects a backend server using algorithms (round-robin, least connections, IP hash), and routes the packet.",
        realWorldUsage: "Deploying AWS ALB or Azure Application Gateway to handle web traffic, or using NGINX for internal load balancing.",
        interviewExpectation: "Differentiate L4 vs L7 load balancing, explain health check mechanics, and discuss session persistence strategies.",
        commonMistakes: ["Misconfiguring health check paths, leading the load balancer to route traffic to failed application instances", "Ignoring backend capacity constraints during high-traffic spikes"],
        followUpQuestions: ["What is the difference between round-robin and least-connections routing?", "How do L7 load balancers handle cookie-based sticky sessions?"]
      }
    },
    {
      keyword: "Reverse Proxy",
      aliases: ["Proxy Server"],
      category: "Networking",
      interviewDomain: "Networking",
      difficulty: "Intermediate",
      frequency: 8,
      importance: 8,
      seniority: "Senior",
      dependsOn: ["TCP"],
      definition: {
        shortDefinition: "A proxy server that sits in front of backend servers and forwards client requests to them.",
        detailedExplanation: "Unlike a forward proxy (which shields clients), a reverse proxy shields backend servers. It handles tasks like SSL termination, compression, caching, and rate limiting.",
        whyItExists: "To centralize security controls, optimize performance via caching/compression, terminate SSL at the edge, and hide backend network topology.",
        howItWorks: "It terminates the client's TCP/TLS connection, analyzes request headers, establishes a new connection to a backend node, receives the response, and forwards it to the client.",
        realWorldUsage: "Configuring Nginx, HAProxy, or Traefik in front of application runtimes like Node.js or Python.",
        interviewExpectation: "Explain proxy vs reverse proxy, SSL termination, and header modification (X-Forwarded-For).",
        commonMistakes: ["Failing to forward client IPs (X-Forwarded-For headers), leaving backend application logs unable to track real source addresses", "Not adjusting backend buffer limits, resulting in gateway timeout errors for large payloads"],
        followUpQuestions: ["What is the purpose of the X-Forwarded-Proto header?", "How does a reverse proxy enable blue-green deployments?"]
      }
    },
    {
      keyword: "NAT",
      aliases: ["Network Address Translation", "NAT Gateway"],
      category: "Networking",
      interviewDomain: "Networking",
      difficulty: "Intermediate",
      frequency: 8,
      importance: 8,
      seniority: "Senior",
      dependsOn: [],
      definition: {
        shortDefinition: "A networking method that remaps one IP address space into another by modifying network address headers in packets.",
        detailedExplanation: "NAT translates private IP addresses (RFC 1918) within a local network to a single public IP address (Source NAT) to access the internet, or forwards public ports to private IPs (DNAT).",
        whyItExists: "To conserve the limited pool of IPv4 addresses and secure internal network systems from direct public internet exposure.",
        howItWorks: "A router/gateway intercepts outgoing packets, replaces private source IPs/ports with its public IP/port, tracks mappings in a translation table, and reverses the process for incoming responses.",
        realWorldUsage: "Setting up a NAT Gateway in AWS/Azure to allow backend database subnets to download system patches without being accessible from the internet.",
        interviewExpectation: "Explain SNAT vs DNAT, Port Address Translation (PAT), and cloud NAT Gateway use cases.",
        commonMistakes: ["Running out of source ports (SNAT port exhaustion) when scale increases without allocating multiple public IPs", "Confusing routing with address translation"],
        followUpQuestions: ["What is SNAT port exhaustion and how do you mitigate it?", "Explain the difference between SNAT and DNAT."]
      }
    },
    {
      keyword: "CIDR",
      aliases: ["Classless Inter-Domain Routing", "IP CIDR block"],
      category: "Networking",
      interviewDomain: "Networking",
      difficulty: "Intermediate",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: [],
      definition: {
        shortDefinition: "An IP address allocation and routing method that replaces the legacy class-based network system.",
        detailedExplanation: "CIDR uses slash notation (e.g., /24) to represent the number of fixed network routing prefix bits in an IP address. For example, 10.0.0.0/24 provides 256 IP addresses.",
        whyItExists: "To allow flexible, granular partition sizing of IP address blocks, slowing IPv4 address pool depletion and optimizing global routing tables.",
        howItWorks: "The slash suffix indicates the subnet mask size (e.g. /16 means 2^16 addresses are reserved for the network, leaving 2^(32-16) addresses for hosts).",
        realWorldUsage: "Defining VPC/VNet sizes (e.g. 10.0.0.0/16) and dividing them into subnets (e.g. 10.0.1.0/24) during cloud platform setups.",
        interviewExpectation: "Calculate IP address availability based on CIDR masks, explain subnetting, and identify overlapping CIDRs.",
        commonMistakes: ["Allocating too small a CIDR block (e.g. /28) for a Kubernetes subnet, leading to IP exhaustion as pods scale", "Deploying overlapping CIDR blocks in networks that must be peered"],
        followUpQuestions: ["How many usable IP addresses are in a /23 CIDR block?", "Why does Kubernetes reserve five IP addresses in a standard subnet?"]
      }
    },

    // --- CLOUD ---
    {
      keyword: "Cloud Computing",
      aliases: ["Public Cloud", "Hybrid Cloud"],
      category: "Cloud Fundamentals",
      interviewDomain: "Architecture",
      difficulty: "Beginner",
      frequency: 8,
      importance: 8,
      seniority: "Senior",
      dependsOn: [],
      definition: {
        shortDefinition: "The on-demand delivery of IT resources (compute, database, storage) over the internet with pay-as-you-go pricing.",
        detailedExplanation: "Cloud computing replaces local hardware ownership with virtualization, managed APIs, and auto-scaling platforms managed by public cloud vendors (AWS, Azure, GCP).",
        whyItExists: "To eliminate capital expenditure (CapEx) of physical datacenters, accelerate development speed, and enable global scaling.",
        howItWorks: "Cloud providers run hypervisor platforms on global server fleets, exposing resources dynamically via APIs and dashboards.",
        realWorldUsage: "Running modern SaaS backends, deploying multi-region architectures, and automating backup infrastructure.",
        interviewExpectation: "Discuss cloud delivery models, shared responsibility models, and cloud financial optimization (FinOps).",
        commonMistakes: ["Treating cloud platforms like a static local datacenter (lift-and-shift) without using elastic scaling capabilities", "Failing to implement proper budget alerts, resulting in cost overruns"],
        followUpQuestions: ["Explain the Shared Responsibility Model in cloud security.", "What is the difference between CapEx and OpEx in cloud finance?"]
      }
    },
    {
      keyword: "IaaS",
      aliases: ["Infrastructure as a Service"],
      category: "Cloud Fundamentals",
      interviewDomain: "Architecture",
      difficulty: "Beginner",
      frequency: 8,
      importance: 8,
      seniority: "Senior",
      dependsOn: ["Cloud Computing"],
      definition: {
        shortDefinition: "A cloud computing model that provides raw compute, network, and storage resources on demand.",
        detailedExplanation: "IaaS gives users control over operating systems, storage, and deployed applications, while the provider manages physical servers, virtualization layers, and networking infrastructure.",
        whyItExists: "To provide maximum infrastructure flexibility and control without the physical overhead of maintaining server hardware.",
        howItWorks: "Virtual machines (e.g. EC2, Azure VMs) are provisioned on hypervisors, and storage volumes are dynamically attached via network storage protocols.",
        realWorldUsage: "Migrating legacy applications, running databases on virtual machines, and managing custom OS configurations.",
        interviewExpectation: "Define IaaS, compare it to PaaS/SaaS, and explain virtual machine management.",
        commonMistakes: ["Using IaaS for standard stateless applications that would be cheaper and easier to run on serverless/PaaS frameworks", "Neglecting OS patching and security configuration responsibilities"],
        followUpQuestions: ["What are the OS patching responsibilities of a customer running IaaS?", "Compare the operational overhead of IaaS vs PaaS."]
      }
    },
    {
      keyword: "PaaS",
      aliases: ["Platform as a Service"],
      category: "Cloud Fundamentals",
      interviewDomain: "Architecture",
      difficulty: "Beginner",
      frequency: 8,
      importance: 8,
      seniority: "Senior",
      dependsOn: ["Cloud Computing"],
      definition: {
        shortDefinition: "A cloud model providing managed runtimes, databases, and tools so developers can deploy code without managing servers.",
        detailedExplanation: "The cloud provider manages the operating system, middleware, database engines, patching, scaling, and hardware layers. The customer only manages application code and data.",
        whyItExists: "To accelerate developer productivity by offloading server configuration, maintenance, and infrastructure scaling to the cloud provider.",
        howItWorks: "Users upload applications as code, container images, or zip files to managed platforms (e.g. AWS Elastic Beanstalk, Azure App Service) which orchestrate scaling.",
        realWorldUsage: "Deploying web applications, hosting APIs, and using managed database clusters (Azure SQL, RDS) to reduce administrative overhead.",
        interviewExpectation: "Define PaaS, discuss trade-offs (vendor lock-in vs operational speed), and explain scaling characteristics.",
        commonMistakes: ["Failing to understand platform execution boundaries, leading to deployment failures", "Not monitoring database connection pool limits in managed services"],
        followUpQuestions: ["What is vendor lock-in and how does it relate to PaaS?", "Explain how autoscaling works on a managed PaaS database platform."]
      }
    },
    {
      keyword: "SaaS",
      aliases: ["Software as a Service"],
      category: "Cloud Fundamentals",
      interviewDomain: "Architecture",
      difficulty: "Beginner",
      frequency: 7,
      importance: 7,
      seniority: "Senior",
      dependsOn: ["Cloud Computing"],
      definition: {
        shortDefinition: "A cloud model providing fully managed software applications accessed over the internet.",
        detailedExplanation: "The customer simply consumes the end-user application via a web browser or API. The provider manages the entire application lifecycle, coding, infrastructure, and security.",
        whyItExists: "To minimize time-to-value for standard software capabilities (email, CRM, document sharing) by removing development and operational complexity.",
        howItWorks: "Applications are hosted centrally, scaled multi-tenantly, and sold through subscription plans.",
        realWorldUsage: "Using Slack, GitHub, Salesforce, or Microsoft 365 for business operations and developer workflows.",
        interviewExpectation: "Define SaaS, compare with IaaS/PaaS, and discuss security considerations for SaaS integrations.",
        commonMistakes: ["Hardcoding static API credentials for SaaS tools inside repository code files", "Failing to check SaaS provider uptime SLAs for critical business dependencies"],
        followUpQuestions: ["How do you secure access to a third-party SaaS tool from a private cloud?", "What is OAuth and how does it secure SaaS integrations?"]
      }
    },

    // --- AZURE ---
    {
      keyword: "Resource Group",
      aliases: ["Azure RG"],
      category: "Azure",
      interviewDomain: "Automation",
      difficulty: "Beginner",
      frequency: 9,
      importance: 8,
      seniority: "Senior",
      dependsOn: ["Cloud Computing"],
      definition: {
        shortDefinition: "A logical container in Azure that groups related resources for lifecycle, metadata, and RBAC management.",
        detailedExplanation: "Every Azure resource must belong to exactly one Resource Group. Deleting the group deletes all contained resources, making it a key lifecycle boundary.",
        whyItExists: "To simplify provisioning, governance, cost tracking, access management, and cleanup of cloud resource boundaries.",
        howItWorks: "It acts as a metadata container. Deployed resources reference the Resource Group ID for policy, resource locks, and access permission validation.",
        realWorldUsage: "Grouping an application's database, web app, and storage into one resource group to manage dev vs prod deployment cleanups.",
        interviewExpectation: "Explain resource group scopes, resource movement limitations, and access control boundaries (RBAC).",
        commonMistakes: ["Mixing development and production workloads inside a single Resource Group", "Confusing Resource Group location with the location of resources inside it"],
        followUpQuestions: ["What happens to resources inside an Azure Resource Group when the group is deleted?", "Can a resource in resource group A communicate with a resource in resource group B?"]
      }
    },
    {
      keyword: "VNet",
      aliases: ["Azure Virtual Network", "Azure VNet"],
      category: "Azure",
      interviewDomain: "Networking",
      difficulty: "Intermediate",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: ["CIDR"],
      definition: {
        shortDefinition: "The fundamental building block for private networks in Microsoft Azure.",
        detailedExplanation: "VNets enable Azure resources (like VMs, AKS clusters) to securely communicate with each other, the internet, and on-premises networks. They support IP subnets, peering, and gateways.",
        whyItExists: "To isolate network resources in Azure, enable secure routing control, and connect cloud resources to local offices.",
        howItWorks: "Administrators define an IP address space (CIDR). VNets are divided into subnets, each mapped to a specific address range. Traffic is routed using System Routes and User Defined Routes.",
        realWorldUsage: "Deploying multi-tier cloud applications with separate subnets for frontends, APIs, and databases, managed via NSGs.",
        interviewExpectation: "Explain VNet Peering, subnets, VPN gateways, ExpressRoute, and Azure DNS zone integration.",
        commonMistakes: ["Allocating overlapping IP address ranges across corporate networks, blocking future network peering", "Ignoring the fact that Azure reserves 5 IP addresses per subnet"],
        followUpQuestions: ["What are the prerequisites for peering two Azure VNets?", "How does Azure route traffic between subnets in the same VNet by default?"]
      }
    },
    {
      keyword: "NSG",
      aliases: ["Network Security Group", "Azure NSG"],
      category: "Azure",
      interviewDomain: "Security",
      difficulty: "Intermediate",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: ["VNet"],
      definition: {
        shortDefinition: "A stateful packet-filtering firewall that controls inbound and outbound network traffic to Azure resources.",
        detailedExplanation: "NSGs contain security rules that allow or deny traffic based on 5-tuple metrics (source/destination IP, port, protocol). They can be associated with subnets or individual virtual network interfaces (NICs).",
        whyItExists: "To implement security controls and enforce network isolation within subnets and virtual machines.",
        howItWorks: "Rules are processed in priority order (lowest number has highest priority). It evaluates traffic statefully, automatically allowing response traffic for approved requests.",
        realWorldUsage: "Creating an NSG rule that only allows inbound HTTP traffic (port 80/443) from an Application Gateway subnet to an App Service subnet.",
        interviewExpectation: "Explain stateful behavior, rule evaluation priorities, default security rules, and troubleshooting blocked traffic.",
        commonMistakes: ["Failing to associate an NSG with a subnet, leaving VMs exposed to default open VNet traffic rules", "Creating duplicate rules with overlapping port/IP ranges, causing security policy drift"],
        followUpQuestions: ["What is the difference between stateful and stateless firewalls?", "How does the default 'DenyAllInbound' rule behave in an NSG?"]
      }
    },
    {
      keyword: "AKS",
      aliases: ["Azure Kubernetes Service"],
      category: "Azure",
      interviewDomain: "Architecture",
      difficulty: "Advanced",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: ["Kubernetes", "VNet"],
      definition: {
        shortDefinition: "A managed Kubernetes container orchestration service in Microsoft Azure.",
        detailedExplanation: "AKS handles control plane operations (API server, etcd) at no cost, while the customer manages and pays for worker nodes (Virtual Machine Scale Sets) and cluster networking.",
        whyItExists: "To simplify deploying, managing, and scaling Kubernetes clusters by offloading control plane maintenance and host OS patching to Microsoft.",
        howItWorks: "It integrates with Azure AD for RBAC, maps services to Azure Load Balancers, attaches Azure Disks/Files as PVs, and configures container networking via kubenet or Azure CNI.",
        realWorldUsage: "Deploying high-density microservices architectures, managing enterprise software updates, and scaling compute nodes dynamically.",
        interviewExpectation: "Explain AKS networking models (kubenet vs Azure CNI), Azure Active Directory integration, node pool scaling, and upgrading.",
        commonMistakes: ["Selecting kubenet for large-scale clusters, leading to IP exhaustion or complex route table maintenance", "Ignoring node resource capacity planning, causing worker node eviction during scaling spikes"],
        followUpQuestions: ["Compare kubenet vs Azure CNI networking in AKS.", "How do you implement pod-level security context restrictions in AKS?"]
      }
    },
    {
      keyword: "Azure Monitor",
      aliases: ["Log Analytics", "Application Insights"],
      category: "Azure",
      interviewDomain: "Observability",
      difficulty: "Intermediate",
      frequency: 8,
      importance: 9,
      seniority: "Senior",
      dependsOn: [],
      definition: {
        shortDefinition: "A comprehensive solution for collecting, analyzing, and acting on telemetry from Azure and on-premises environments.",
        detailedExplanation: "Azure Monitor consolidates platform logs, metrics, activity logs, and application diagnostics into a centralized Log Analytics workspace, supporting Kusto Query Language (KQL) for analytics.",
        whyItExists: "To provide full-stack visibility, alerting, and diagnostics across virtual networks, VMs, AKS clusters, and PaaS databases.",
        howItWorks: "Telemetry agents push metrics and logs to cloud workspaces. Users run KQL queries, construct dashboards, and configure alerts to trigger webhooks or action groups.",
        realWorldUsage: "Querying application access logs in Log Analytics to identify high latency endpoints, and configuring CPU alerts to scale VMs.",
        interviewExpectation: "Explain log analytics workspaces, basic KQL queries, alerting configurations, and Application Insights integration.",
        commonMistakes: ["Failing to configure diagnostic settings on key Azure resources, leaving them unmonitored", "Setting up overly sensitive alerts that trigger alert fatigue"],
        followUpQuestions: ["What is KQL and how do you write a query to find errors in a log table?", "Explain the difference between Azure Monitor metrics and logs."]
      }
    },
    {
      keyword: "Key Vault",
      aliases: ["Azure Key Vault", "AKV"],
      category: "Azure",
      interviewDomain: "Security",
      difficulty: "Intermediate",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: [],
      definition: {
        shortDefinition: "A managed cloud service in Azure used to securely store and access secrets, encryption keys, and TLS certificates.",
        detailedExplanation: "Azure Key Vault encrypts data using Hardware Security Modules (HSMs) and secures access via Azure Active Directory authorization policies or RBAC.",
        whyItExists: "To eliminate secret sprawl and prevent developers from hardcoding passwords, database connection strings, and certificates in application code.",
        howItWorks: "Applications authenticate via Managed Identities, request secret keys from the Key Vault API, and load them into application memory at runtime.",
        realWorldUsage: "Storing production database passwords, TLS certificates for Ingress, and rotation keys, exposing them dynamically via pipelines or app instances.",
        interviewExpectation: "Explain access policies vs Azure RBAC in Key Vault, secret rotation, and application integration using managed identities.",
        commonMistakes: ["Storing plain text API keys inside public git repos instead of reading them from Key Vault", "Failing to enable soft-delete and purge protection on production Key Vaults, risking accidental data loss"],
        followUpQuestions: ["How does an application authenticate to Key Vault without storing credentials?", "What are soft-delete and purge protection in Azure Key Vault?"]
      }
    },
    {
      keyword: "App Service",
      aliases: ["Azure Web App", "App Service Plan"],
      category: "Azure",
      interviewDomain: "Deployment",
      difficulty: "Beginner",
      frequency: 8,
      importance: 8,
      seniority: "Senior",
      dependsOn: ["PaaS"],
      definition: {
        shortDefinition: "An HTTP-based service in Azure for hosting web applications, REST APIs, and mobile backends.",
        detailedExplanation: "It supports Windows and Linux runtimes (.NET, Java, Node.js, Python, PHP, Docker containers) and runs on top of virtual machine compute resources called App Service Plans.",
        whyItExists: "To allow rapid hosting of web applications with automatic scaling, backup, deployment slots, and built-in TLS management.",
        howItWorks: "Azure manages the underlying VMs and web servers. Users push code via Git, zip, or containers, and App Service routes traffic to the running instances.",
        realWorldUsage: "Hosting customer-facing REST APIs and frontend single-page apps, using Deployment Slots for staging and zero-downtime swaps.",
        interviewExpectation: "Explain App Service Plans, scaling, deployment slots, and private network integration (VNet integration).",
        commonMistakes: ["Running high-traffic production workloads on standard or free tiers without scaling redundancy", "Not configuring custom domain bindings or TLS certificates correctly"],
        followUpQuestions: ["What are deployment slots and how do they help achieve zero-downtime releases?", "How do you connect an Azure App Service to a private SQL database in a VNet?"]
      }
    },
    {
      keyword: "Functions",
      aliases: ["Azure Functions", "Serverless Functions"],
      category: "Azure",
      interviewDomain: "Architecture",
      difficulty: "Intermediate",
      frequency: 8,
      importance: 8,
      seniority: "Senior",
      dependsOn: ["Cloud Computing"],
      definition: {
        shortDefinition: "An event-driven serverless compute service in Azure that runs small blocks of code in response to system triggers.",
        detailedExplanation: "Azure Functions allows developer code to run without provisioning or managing VM hosts. It scales compute instances dynamically in response to queue messages, HTTP calls, or file uploads.",
        whyItExists: "To minimize run costs by executing compute only when triggered and scaling down to zero when idle.",
        howItWorks: "Triggers (like Service Bus queue events or timer ticks) activate the function runtime, which provisions ephemeral compute nodes to run the handler function.",
        realWorldUsage: "Processing queue payloads, running scheduled cleaning tasks, handling webhook triggers, and converting uploaded media files.",
        interviewExpectation: "Explain consumption plans vs dedicated plans, event-driven scaling, and trigger/binding configurations.",
        commonMistakes: ["Running long-running tasks (>10 mins) on a Consumption Plan, leading to execution timeouts", "Failing to handle cold starts effectively, causing latency spikes for occasional HTTP functions"],
        followUpQuestions: ["What is a cold start in serverless compute and how do you mitigate it?", "Compare Azure Functions consumption plans vs Premium plans."]
      }
    },

    // --- AWS ---
    {
      keyword: "EC2",
      aliases: ["Elastic Compute Cloud", "AWS Instance"],
      category: "AWS",
      interviewDomain: "Architecture",
      difficulty: "Beginner",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: ["IaaS"],
      definition: {
        shortDefinition: "A web service in AWS that provides secure, resizable compute capacity (virtual machines) in the cloud.",
        detailedExplanation: "EC2 virtual servers (instances) run on physical virtualization platforms (Xen, Nitro hypervisors). Users select CPU, memory, storage, operating systems, and network routing configurations.",
        whyItExists: "To provide flexible cloud server instances without hardware overhead, supporting custom operating systems and direct hypervisor configurations.",
        howItWorks: "Virtual machines are launched from Amazon Machine Images (AMIs) and run inside virtual networks (VPC) with block storage (EBS) attached.",
        realWorldUsage: "Deploying legacy monolithic applications, managing custom database instances, and running self-hosted runner clusters.",
        interviewExpectation: "Explain instance types (compute, memory optimized), EBS storage types, security groups, and key pair authentications.",
        commonMistakes: ["Storing application data on ephemeral instance store volumes, losing data on instance restarts", "Leaving EC2 SSH security group rules open to the public internet"],
        followUpQuestions: ["What is the difference between Instance Store and EBS volumes?", "Explain the boot sequence of an EC2 instance using an AMI."]
      }
    },
    {
      keyword: "ECS",
      aliases: ["Elastic Container Service", "Fargate"],
      category: "AWS",
      interviewDomain: "Architecture",
      difficulty: "Intermediate",
      frequency: 8,
      importance: 8,
      seniority: "Senior",
      dependsOn: ["Docker"],
      definition: {
        shortDefinition: "A highly scalable, fast container management service in AWS that supports Docker containers.",
        detailedExplanation: "ECS provides container orchestration using either EC2 instances as compute hosts or AWS Fargate (serverless container compute). Workloads are defined using Task Definitions.",
        whyItExists: "To run Docker containers at scale on AWS without the complexity of configuring and maintaining full Kubernetes clusters.",
        howItWorks: "The ECS control plane schedules containers (Tasks) across cluster nodes based on Task Definitions, handling integration with CloudWatch and ALBs.",
        realWorldUsage: "Running microservices, running background worker tasks, and migrating web applications to containers using AWS Fargate.",
        interviewExpectation: "Explain ECS task definitions, service configurations, Fargate serverless hosting, and security settings.",
        commonMistakes: ["Defining task resource limits incorrectly, leading to task memory allocation crashes", "Ignoring container security context settings inside task definitions"],
        followUpQuestions: ["What is the difference between EC2 launch type and Fargate launch type in ECS?", "How do you manage secrets inside ECS task definitions?"]
      }
    },
    {
      keyword: "EKS",
      aliases: ["Elastic Kubernetes Service"],
      category: "AWS",
      interviewDomain: "Architecture",
      difficulty: "Advanced",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: ["Kubernetes", "AWS"],
      definition: {
        shortDefinition: "A managed Kubernetes service in AWS that runs control plane components across multiple availability zones.",
        detailedExplanation: "EKS manages the Kubernetes control plane (API server, etcd) automatically, ensuring high availability, while nodes run on EC2 instances or AWS Fargate within client VPC subnets.",
        whyItExists: "To provide a secure, production-grade Kubernetes environment on AWS without the operational overhead of running control plane infrastructure manually.",
        howItWorks: "It integrates with AWS IAM for access control (using aws-auth ConfigMap), configures container networking via the VPC CNI plugin, and connects to AWS Load Balancers.",
        realWorldUsage: "Deploying enterprise microservices, coordinating multi-tenant container platforms, and running cluster auto-scalers.",
        interviewExpectation: "Explain EKS IAM integration (IRSA), VPC CNI network behavior, node group management, and cluster upgrades.",
        commonMistakes: ["Using standard root credentials instead of IAM Roles for Service Accounts (IRSA) for pod permissions", "Running out of IP addresses in worker subnets due to VPC CNI allocating multiple IPs per EC2 interface"],
        followUpQuestions: ["Explain how EKS integrates with AWS IAM using IAM Roles for Service Accounts (IRSA).", "What is the role of the aws-auth ConfigMap in EKS?"]
      }
    },
    {
      keyword: "VPC",
      aliases: ["Virtual Private Cloud", "AWS VPC"],
      category: "AWS",
      interviewDomain: "Networking",
      difficulty: "Intermediate",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: ["CIDR"],
      definition: {
        shortDefinition: "A logically isolated virtual network allocated to an AWS account.",
        detailedExplanation: "VPC allows users to define IP address ranges, subnets, route tables, internet gateways, and security settings for virtual machine and service deployments.",
        whyItExists: "To isolate network resources in AWS, control outbound routing rules, and secure resource communication.",
        howItWorks: "Administrators allocate a CIDR block. VPC is divided into public and private subnets. Route tables direct traffic to Internet Gateways, NAT Gateways, or VPC Endpoints.",
        realWorldUsage: "Building multi-region private network systems, routing backend systems safely through private NAT subnets, and peering networks.",
        interviewExpectation: "Explain public vs private subnets, security groups vs network ACLs, NAT gateways, and VPC endpoints.",
        commonMistakes: ["Failing to configure separate public/private subnets, exposing databases directly to the public web", "Using overlapping subnet CIDRs, blocking future VPN or peering links"],
        followUpQuestions: ["What is the difference between a Security Group and a Network ACL (NACL)?", "Why do private subnet resources require a NAT Gateway to access the internet?"]
      }
    },

    // --- DOCKER ---
    {
      keyword: "Image",
      aliases: ["Docker Image", "Container Image"],
      category: "Docker",
      interviewDomain: "Deployment",
      difficulty: "Beginner",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: [],
      definition: {
        shortDefinition: "An immutable, read-only template containing the application code, libraries, runtime, and configurations needed to run a container.",
        detailedExplanation: "Docker images are constructed as a stack of read-only union file system layers. Each instruction in a Dockerfile creates a new layer.",
        whyItExists: "To establish absolute application immutability and portability, ensuring code runs identically across dev, QA, and production environments.",
        howItWorks: "The container engine downloads the image, overlays a thin read-write layer on top (container layer), and runs the application process.",
        realWorldUsage: "Building image packages via CI pipelines, pushing them to registries (ACR, ECR), and deploying them to Kubernetes.",
        interviewExpectation: "Explain image layers, caching strategies during builds, image size optimization, and registry registries.",
        commonMistakes: ["Including large, unnecessary files (build tools, SDKs) in production images, leading to slow startup", "Rebuilding identical images with different tags for different environments instead of promoting one image"],
        followUpQuestions: ["How does Docker use Union File Systems to construct images?", "Why should you use image hashes (digests) instead of tags like 'latest' in production?"]
      }
    },
    {
      keyword: "Container",
      aliases: ["Docker Container"],
      category: "Docker",
      interviewDomain: "Deployment",
      difficulty: "Beginner",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: ["Image"],
      definition: {
        shortDefinition: "A runnable instance of a container image that runs as an isolated process on a shared host OS kernel.",
        detailedExplanation: "Containers achieve isolation using Linux kernel features: Namespaces (isolate process trees, network, mounts) and Control Groups (cgroups, limit resource usage).",
        whyItExists: "To run applications in isolated runtime environments on a single host machine, avoiding virtual machine compute overhead.",
        howItWorks: "The container engine (containerd, docker) creates namespaces and cgroups, mounts the read-only image layers with a read-write layer, and executes the target process.",
        realWorldUsage: "Running microservices dynamically, testing software locally, and deploying scalable workloads to cluster nodes.",
        interviewExpectation: "Explain container vs VM, namespace categories, cgroups, and container lifecycle events.",
        commonMistakes: ["Running processes inside containers as the root user, creating host escalation vulnerabilities", "Treating containers as stateful VMs and writing persistent data locally without mounts"],
        followUpQuestions: ["Explain how Linux namespaces and cgroups enable container isolation.", "Compare a container's virtualization overhead to that of a hypervisor VM."]
      }
    },
    {
      keyword: "Volume",
      aliases: ["Docker Volume", "Container Mount"],
      category: "Docker",
      interviewDomain: "Architecture",
      difficulty: "Intermediate",
      frequency: 8,
      importance: 8,
      seniority: "Senior",
      dependsOn: ["Container"],
      definition: {
        shortDefinition: "A persistent data storage mechanism decoupled from the lifecycle of individual containers.",
        detailedExplanation: "Volumes map host directory paths directly into container mount points, bypassing the container's copy-on-write filesystem to ensure persistence and disk write performance.",
        whyItExists: "To preserve data generated by database or stateful applications beyond the temporary lifecycle of container instances.",
        howItWorks: "The container engine mounts host storage folders or cloud volumes directly into the container's directory hierarchy during instantiation.",
        realWorldUsage: "Mounting persistent disk volumes to run database containers (Postgres, MongoDB) or sharing files between containers.",
        interviewExpectation: "Explain bind mounts vs volumes, persistent storage mapping, and stateful application lifecycle patterns.",
        commonMistakes: ["Forgetting to mount volumes for stateful applications, losing database records on container restart", "Sharing write-heavy volumes across multiple concurrent containers without locking protocols"],
        followUpQuestions: ["What is the difference between a bind mount and a named volume in Docker?", "How do database write operations perform inside a container filesystem vs a mounted volume?"]
      }
    },
    {
      keyword: "Dockerfile",
      aliases: ["Docker build script"],
      category: "Docker",
      interviewDomain: "Automation",
      difficulty: "Beginner",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: ["Image"],
      definition: {
        shortDefinition: "A text manifest containing instructions used programmatically to build a Docker container image.",
        detailedExplanation: "A Dockerfile contains instructions (FROM, RUN, COPY, EXPOSE, CMD) that run sequentially to construct image layers.",
        whyItExists: "To automate and document the build process of application container images in a reproducible way.",
        howItWorks: "The Docker daemon parses the file, checks local caches for matching layers, executes commands, commits layers, and generates the final image.",
        realWorldUsage: "Writing Dockerfiles to package Node, Python, or Java applications into secure container images during CI runs.",
        interviewExpectation: "Demonstrate Dockerfile writing, layer cache optimization, and container security best practices.",
        commonMistakes: ["Putting commands in the wrong order, breaking layer cache validation on code changes", "Hardcoding production database passwords and secrets inside Dockerfile build instructions"],
        followUpQuestions: ["How does Docker use layer caching to speed up subsequent image builds?", "Explain the difference between COPY and ADD instructions."]
      }
    },
    {
      keyword: "Multi Stage Build",
      aliases: ["Docker Multi-stage"],
      category: "Docker",
      interviewDomain: "Performance",
      difficulty: "Intermediate",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: ["Dockerfile"],
      definition: {
        shortDefinition: "A Dockerfile pattern using multiple FROM instructions to compile applications inside heavy build environments and copy outputs into minimal runtime images.",
        detailedExplanation: "It decouples compilation from runtime. Stage one runs compilation tools (compilers, SDKs, npm), while stage two inherits a clean runtime environment, copying only compiled outputs.",
        whyItExists: "To minimize production image sizes, reduce attack surfaces by removing build tools, and simplify pipeline configurations.",
        howItWorks: "The builder engine processes early stages, throws away intermediate build layers, and keeps only the layers defined in the final stage.",
        realWorldUsage: "Compiling a Go application using a 1GB golang SDK image, and copying the compiled binary into a 5MB alpine runtime image.",
        interviewExpectation: "Explain the architecture of multi-stage builds and write optimized multi-stage Dockerfiles.",
        commonMistakes: ["Leaving package managers and build tools inside final runtime images, increasing security risks", "Not labeling stages, making Dockerfiles hard to read"],
        followUpQuestions: ["How do multi-stage builds help reduce the attack surface of production containers?", "Write a basic multi-stage Dockerfile configuration for a Node.js app."]
      }
    },

    // --- KUBERNETES ---
    {
      keyword: "Pod",
      aliases: ["K8s Pod", "Pod Lifecycle"],
      category: "Kubernetes",
      interviewDomain: "Architecture",
      difficulty: "Intermediate",
      frequency: 10,
      importance: 10,
      seniority: "Senior",
      dependsOn: ["Container"],
      definition: {
        shortDefinition: "The smallest deployable computing unit in Kubernetes that runs one or more containers.",
        detailedExplanation: "Containers inside a Pod share the same network namespace (IP, port space) and storage volumes. They execute on the same node and share lifecycles.",
        whyItExists: "To act as the core deployment unit in Kubernetes, grouping tightly coupled helper processes (sidecars) that must share network and memory namespaces.",
        howItWorks: "The scheduler assigns the Pod to a node. The node's kubelet coordinates with the container runtime (CRI) to launch the containers inside shared namespaces.",
        realWorldUsage: "Running a web application container alongside a sidecar log exporter inside a single Pod.",
        interviewExpectation: "Explain single vs multi-container pods, pod lifecycle states, init containers, sidecars, and sharing namespaces.",
        commonMistakes: ["Running unrelated services in a single Pod instead of deploying them as independent microservice pods", "Deploying standalone Pods directly instead of using controllers, preventing self-healing"],
        followUpQuestions: ["What is an init container and how does it differ from a standard container?", "How do containers in the same Pod communicate with each other?"]
      }
    },
    {
      keyword: "Deployment",
      aliases: ["K8s Deployment", "RollingUpdate"],
      category: "Kubernetes",
      interviewDomain: "Deployment",
      difficulty: "Intermediate",
      frequency: 10,
      importance: 10,
      seniority: "Senior",
      dependsOn: ["ReplicaSet", "Pod"],
      definition: {
        shortDefinition: "A declarative controller that manages stateless Pods and ReplicaSets.",
        detailedExplanation: "Deployments define the desired state for workloads. They manage rollouts, rollbacks, version history, and scaling, automating rolling updates.",
        whyItExists: "To automate stateless application lifecycle management, enabling zero-downtime updates and automated recovery.",
        howItWorks: "The Deployment controller compares actual cluster state to the defined spec. During updates, it creates a new ReplicaSet, scales it up, and scales down the old ReplicaSet.",
        realWorldUsage: "Deploying API microservices with rolling updates (maxSurge, maxUnavailable) and rollback targets.",
        interviewExpectation: "Explain rolling updates, rollout history, rollbacks, update settings (surge/unavailable), and self-healing.",
        commonMistakes: ["Setting maxUnavailable to 100% during updates, causing service downtime", "Managing ReplicaSets manually instead of let the Deployment manage them"],
        followUpQuestions: ["Explain the difference between RollingUpdate and Recreate deployment strategies.", "How do you roll back a failed deployment to a previous revision?"]
      }
    },
    {
      keyword: "ReplicaSet",
      aliases: ["K8s ReplicaSet"],
      category: "Kubernetes",
      interviewDomain: "Reliability",
      difficulty: "Beginner",
      frequency: 8,
      importance: 8,
      seniority: "Senior",
      dependsOn: ["Pod"],
      definition: {
        shortDefinition: "A Kubernetes controller that ensures a specified number of identical Pod replicas are running at all times.",
        detailedExplanation: "ReplicaSets use label selectors to identify Pods and maintain the desired count by creating or deleting Pods dynamically.",
        whyItExists: "To guarantee stateless application availability and scale compute instances horizontally.",
        howItWorks: "The controller runs a reconciliation loop. If the active Pod count is less than specified, it creates Pods; if more, it terminates the excess.",
        realWorldUsage: "Used behind the scenes by Deployments to manage scaling and versioning of stateless applications.",
        interviewExpectation: "Explain the role of ReplicaSets in Kubernetes scaling and how they relate to Deployments.",
        commonMistakes: ["Modifying ReplicaSets directly instead of updating the parent Deployment configuration"],
        followUpQuestions: ["How does a ReplicaSet identify which Pods it is responsible for managing?", "What happens if a Pod managed by a ReplicaSet is manually deleted?"]
      }
    },
    {
      keyword: "StatefulSet",
      aliases: ["K8s StatefulSet"],
      category: "Kubernetes",
      interviewDomain: "Architecture",
      difficulty: "Advanced",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: ["Pod"],
      definition: {
        shortDefinition: "A Kubernetes workload controller used to manage stateful applications.",
        detailedExplanation: "StatefulSets provide guarantees about the ordering and uniqueness of Pods, assigning them persistent, sticky network identities (e.g. database-0) and dedicated persistent storage mapping.",
        whyItExists: "To run stateful, clustered applications (databases, message queues) that require stable network names and persistent disk bindings across restarts.",
        howItWorks: "Pods are created sequentially (0 to N-1). On deletion, they terminate in reverse order. It integrates with Headless Services for DNS routing and VolumeClaimTemplates for unique disk bindings.",
        realWorldUsage: "Deploying database clusters (Elasticsearch, PostgreSQL, Kafka) where each node needs its own identity and disk storage.",
        interviewExpectation: "Explain StatefulSet vs Deployment, headless services, VolumeClaimTemplates, stable network IDs, and scaling constraints.",
        commonMistakes: ["Using standard Deployments for clustered databases, leading to database corruption as nodes share the same disk", "Deleting a StatefulSet expecting associated PVs to be deleted (PVCs are retained for safety)"],
        followUpQuestions: ["Why do StatefulSets require a Headless Service?", "Explain how VolumeClaimTemplates provision storage for individual pods."]
      }
    },
    {
      keyword: "DaemonSet",
      aliases: ["K8s DaemonSet"],
      category: "Kubernetes",
      interviewDomain: "Reliability",
      difficulty: "Intermediate",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: ["Pod"],
      definition: {
        shortDefinition: "A Kubernetes controller that ensures a copy of a Pod runs on all (or selected) nodes in a cluster.",
        detailedExplanation: "DaemonSets automatically schedule Pods to newly added nodes and terminate them when nodes are removed from the cluster.",
        whyItExists: "To run node-level background daemons, monitoring agents, and infrastructure tools across the entire cluster.",
        howItWorks: "The DaemonSet controller watches for nodes. When a new node joins, it creates a Pod and assigns it to that node, bypassing normal scheduler limits if needed.",
        realWorldUsage: "Running log shipping agents (Fluentd/Logstash), node resource monitors (Prometheus Node Exporter), or network proxies (kube-proxy).",
        interviewExpectation: "Explain DaemonSet use cases, node selectors, tolerations, and updates.",
        commonMistakes: ["Using DaemonSets for standard application APIs that should scale based on request traffic (use Deployments instead)", "Not setting proper resource requests, causing system agents to starve host processes"],
        followUpQuestions: ["How do you limit a DaemonSet to run only on specific nodes?", "What happens to DaemonSet Pods when a node is cordoned?"]
      }
    },
    {
      keyword: "Service",
      aliases: ["K8s Service", "ClusterIP", "NodePort"],
      category: "Kubernetes",
      interviewDomain: "Networking",
      difficulty: "Intermediate",
      frequency: 10,
      importance: 10,
      seniority: "Senior",
      dependsOn: ["Pod"],
      definition: {
        shortDefinition: "An abstract way to expose an application running on a set of Pods as a network service.",
        detailedExplanation: "Services provide a stable IP address (ClusterIP) and DNS name. They load balance traffic across Pods matching a label selector. Types include ClusterIP, NodePort, LoadBalancer, and ExternalName.",
        whyItExists: "To solve the problem of dynamic Pod IP changes, giving clients a permanent entry point that automatically routes traffic to healthy pods.",
        howItWorks: "Kube-proxy watches the API server and configures local network rules (iptables or IPVS) on every node to redirect Service IP traffic to target Pod endpoints.",
        realWorldUsage: "Exposing a backend deployment internally via a ClusterIP Service, and exposing a gateway externally via a LoadBalancer Service.",
        interviewExpectation: "Explain Service types, service discovery (CoreDNS), endpoints, kube-proxy modes (iptables vs IPVS), and headless services.",
        commonMistakes: ["Misconfiguring the selector label, leaving the Service with no active endpoints", "Exposing internal databases publicly via NodePort or LoadBalancer services"],
        followUpQuestions: ["Explain how kube-proxy routes traffic to a Service endpoint.", "What is the difference between targetPort, port, and nodePort?"]
      }
    },
    {
      keyword: "Ingress",
      aliases: ["K8s Ingress", "Ingress Controller"],
      category: "Kubernetes",
      interviewDomain: "Networking",
      difficulty: "Intermediate",
      frequency: 10,
      importance: 10,
      seniority: "Senior",
      dependsOn: ["Service"],
      definition: {
        shortDefinition: "An API object that manages external access to services in a cluster, typically HTTP/HTTPS routing.",
        detailedExplanation: "Ingress provides routing rules (hostnames, paths), TLS termination, and SSL offloading. It requires an Ingress Controller (like NGINX or Traefik) to implement the rules.",
        whyItExists: "To act as a single, cost-effective Layer 7 entry point for external traffic, routing requests to multiple services based on URL paths.",
        howItWorks: "The Ingress Controller runs as a reverse proxy, reads Ingress resources, and updates its routing configuration to direct public traffic to backend Service IPs.",
        realWorldUsage: "Routing traffic for `api.company.com/v1` to the API Service, and `company.com` to the frontend Service, while securing traffic with TLS.",
        interviewExpectation: "Explain Ingress vs Service, Ingress Controller architecture, path-based routing, and TLS certificate mapping.",
        commonMistakes: ["Deploying Ingress resources without running an Ingress Controller, leaving rules inactive", "Not managing TLS certificates correctly, leading to browser warnings"],
        followUpQuestions: ["What is the difference between an Ingress resource and an Ingress Controller?", "How do you configure HTTPS redirect on an NGINX Ingress Controller?"]
      }
    },
    {
      keyword: "ConfigMap",
      aliases: ["K8s ConfigMap"],
      category: "Kubernetes",
      interviewDomain: "Deployment",
      difficulty: "Beginner",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: ["Pod"],
      definition: {
        shortDefinition: "A Kubernetes API object used to store non-sensitive configuration data in key-value pairs.",
        detailedExplanation: "ConfigMaps decouple environment-specific configurations from container images. They can be injected as environment variables, command-line arguments, or mounted as files.",
        whyItExists: "To enable the 'Build Once, Run Anywhere' pattern, letting the same container image run in dev, QA, and prod with different settings.",
        howItWorks: "Kubelet reads the ConfigMap when spawning a Pod, injecting values into env variables or creating files in mounted directories.",
        realWorldUsage: "Storing application settings, database URLs, feature flags, and Nginx configurations.",
        interviewExpectation: "Explain configuration injection methods, dynamic updates of mounted files, and ConfigMap limitations.",
        commonMistakes: ["Storing sensitive passwords or API keys in ConfigMaps instead of Secrets", "Expecting environment variables to update automatically when a ConfigMap is modified (Pod must restart)"],
        followUpQuestions: ["How do you dynamically reload configuration files mounted from a ConfigMap?", "What is the size limit of a ConfigMap in Kubernetes?"]
      }
    },
    {
      keyword: "Secret",
      aliases: ["K8s Secret", "Secret rotation"],
      category: "Kubernetes",
      interviewDomain: "Security",
      difficulty: "Intermediate",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: ["Pod"],
      definition: {
        shortDefinition: "A Kubernetes object used to store sensitive data like passwords, tokens, and keys.",
        detailedExplanation: "Secrets are base64-encoded by default. They can be mounted as files or injected as environment variables. They are stored in etcd and can be encrypted at rest.",
        whyItExists: "To isolate sensitive credentials from code and configurations, restricting access via RBAC and protecting data at rest.",
        howItWorks: "Kubelet mounts the secret into a tempfs (in-memory) volume inside the container, preventing the secret from being written to physical disk.",
        realWorldUsage: "Injecting database credentials, API access tokens, and private SSH keys into backend application pods.",
        interviewExpectation: "Explain Secret vs ConfigMap, encoding vs encryption, etcd encryption configuration, and rotation.",
        commonMistakes: ["Treating base64 encoding as security (anyone with read access can decode it)", "Checking base64-encoded secrets into public git repositories"],
        followUpQuestions: ["How do you encrypt Kubernetes Secrets at rest in etcd?", "What is the security risk of injecting Secrets as environment variables?"]
      }
    },
    {
      keyword: "Namespace",
      aliases: ["K8s Namespace"],
      category: "Kubernetes",
      interviewDomain: "Security",
      difficulty: "Beginner",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: ["Kubernetes"],
      definition: {
        shortDefinition: "A logical virtual partition within a single physical Kubernetes cluster.",
        detailedExplanation: "Namespaces provide isolation scopes for names, resources, policies, and authorization (RBAC). They partition resources like Deployments and Services.",
        whyItExists: "To support multi-tenancy, divide cluster resources among multiple teams, and isolate development, staging, and production environments.",
        howItWorks: "The API server filters resources based on the namespace parameter. Cluster-wide resources (like Nodes, PVs, Namespaces) exist outside namespaces.",
        realWorldUsage: "Deploying production APIs in the `prod` namespace, and staging APIs in the `staging` namespace on the same cluster.",
        interviewExpectation: "Explain namespace boundaries, cluster-scoped vs namespaced resources, resource quotas, and network policies.",
        commonMistakes: ["Deploying all applications to the 'default' namespace, creating resource collisions", "Assuming namespaces provide absolute security isolation without network policies"],
        followUpQuestions: ["Which Kubernetes resources are cluster-scoped rather than namespace-scoped?", "How do you enforce resource consumption limits on a namespace?"]
      }
    },

    // --- TERRAFORM ---
    {
      keyword: "State",
      aliases: ["Terraform State", "tfstate", "state file"],
      category: "Infrastructure as Code",
      interviewDomain: "Reliability",
      difficulty: "Intermediate",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: [],
      definition: {
        shortDefinition: "A JSON database used by Terraform to map real-world infrastructure resources to your configuration code.",
        detailedExplanation: "The state file tracks metadata, resource attributes, and dependency mappings. It acts as the single source of truth for planning and modifying infrastructure.",
        whyItExists: "To detect changes (state drift), determine execution order, calculate plan deltas, and improve performance for large deployments.",
        howItWorks: "Terraform queries live cloud APIs, compares the results to the state file, and generates execution plans to reconcile differences.",
        realWorldUsage: "Using `terraform.tfstate` to track resources, and running plans to verify if cloud configurations match code.",
        interviewExpectation: "Explain state file structure, state drift, risk of committing state to version control, and manual state manipulation (import, state rm).",
        commonMistakes: ["Committing state files to git repositories, exposing sensitive passwords and keys in plaintext", "Modifying the state file manually using a text editor, risking file corruption"],
        followUpQuestions: ["What is state drift and how does Terraform detect it?", "Explain the purpose of 'terraform state mv'."]
      }
    },
    {
      keyword: "Backend",
      aliases: ["Terraform Backend", "Remote Backend", "State locking"],
      category: "Infrastructure as Code",
      interviewDomain: "Security",
      difficulty: "Intermediate",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: ["State"],
      definition: {
        shortDefinition: "The configuration that defines where Terraform stores its state file and how it locks state during runs.",
        detailedExplanation: "Backends can be local or remote (e.g. AWS S3, Azure Blob, Terraform Cloud). Remote backends support state encryption and state locking (using DynamoDB or Blob lease) to prevent conflicts.",
        whyItExists: "To support team collaboration, protect sensitive state data, and prevent concurrent execution conflicts.",
        howItWorks: "During operations, Terraform reads and writes state directly to the remote backend. Before applying changes, it acquires a lease/lock, releasing it when done.",
        realWorldUsage: "Configuring Terraform to store state in an Azure Storage container with blob lease locking.",
        interviewExpectation: "Explain remote backends, state locking configuration, state migrations, and backend security.",
        commonMistakes: ["Running Terraform in team environments without state locking, risking state file corruption", "Hardcoding backend credentials in the provider config instead of using IAM/Managed Identities"],
        followUpQuestions: ["How does state locking prevent race conditions in team environments?", "Explain how to migrate state from a local backend to a remote backend."]
      }
    },

    // --- CI/CD ---
    {
      keyword: "Pipeline",
      aliases: ["CI/CD Pipeline", "YAML Pipeline"],
      category: "CI/CD",
      interviewDomain: "Deployment",
      difficulty: "Beginner",
      frequency: 10,
      importance: 9,
      seniority: "Senior",
      dependsOn: [],
      definition: {
        shortDefinition: "An automated workflow sequence that compiles, tests, packages, and deploys applications.",
        detailedExplanation: "Pipelines are defined declaratively (typically in YAML). They consist of Stages (logical groups), Jobs (run on execution agents), and Steps (individual tasks/scripts).",
        whyItExists: "To standardize software delivery, eliminate manual deployment mistakes, enforce testing gates, and accelerate release cycles.",
        howItWorks: "Git commits trigger the pipeline server (e.g., GitHub Actions, Azure DevOps). The server assigns jobs to runner agents, which execute defined steps.",
        realWorldUsage: "Running a pipeline that builds a Docker image on code commits, runs tests, and deploys the image to AKS on approval.",
        interviewExpectation: "Explain stages vs jobs vs steps, environment promotion, integration with testing frameworks, and pipeline trigger options.",
        commonMistakes: ["Creating monolithic pipelines without parallel execution or separate build/deploy stages", "Hardcoding deployment variables inside pipeline code scripts"],
        followUpQuestions: ["What is the difference between a self-hosted runner and a hosted runner?", "How do you configure approval gates between stages in a YAML pipeline?"]
      }
    },

    // --- OBSERVABILITY ---
    {
      keyword: "Prometheus",
      aliases: ["PromQL", "Metric monitoring"],
      category: "Observability",
      interviewDomain: "Observability",
      difficulty: "Intermediate",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: [],
      definition: {
        shortDefinition: "An open-source metrics monitoring and alerting system designed for dynamic cloud environments.",
        detailedExplanation: "Prometheus uses a pull-based model to scrape metrics from endpoints, stores data in a time-series database (TSDB), and supports the PromQL query language.",
        whyItExists: "To provide real-time performance metrics, service discovery, and alerting for cloud-native infrastructure and containerized workloads.",
        howItWorks: "It queries HTTP endpoints (e.g., `/metrics`) exposed by targets, records metric data with timestamps and labels, evaluates alert rules, and pushes alerts to Alertmanager.",
        realWorldUsage: "Monitoring CPU/Memory usage of Kubernetes nodes and pods, and triggering alerts when pod restart counts spike.",
        interviewExpectation: "Explain pull vs push monitoring, PromQL query syntax, metric types (counter, gauge, histogram), and Alertmanager integrations.",
        commonMistakes: ["Treating Prometheus as a log store or transaction database, overloading the TSDB", "Creating high-cardinality metrics by using unique IDs as labels, degrading performance"],
        followUpQuestions: ["What are the four core metric types in Prometheus?", "Why does Prometheus use a pull model, and what are its trade-offs?"]
      }
    },

    // --- SECURITY ---
    {
      keyword: "RBAC",
      aliases: ["Role-Based Access Control", "Azure RBAC", "K8s RBAC"],
      category: "Identity & Access Management",
      interviewDomain: "Security",
      difficulty: "Intermediate",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: [],
      definition: {
        shortDefinition: "An authorization system that manages access permissions to resources based on user roles.",
        detailedExplanation: "RBAC binds roles (collections of permissions) to subjects (users, groups, service accounts) at specific scopes (namespace, subscription, resource group).",
        whyItExists: "To enforce the principle of least privilege, restricting resource access and modifications to authorized identities.",
        howItWorks: "The system intercepts API requests, identifies the caller, checks their active role bindings, and validates if the requested action is permitted.",
        realWorldUsage: "Assigning 'Reader' access to developers in production, and configuring a Kubernetes RoleBinding to let a CI service account deploy to a namespace.",
        interviewExpectation: "Explain Role vs ClusterRole, RoleBinding vs ClusterRoleBinding, and Azure RBAC role assignments.",
        commonMistakes: ["Using administrative wildcard permissions (cluster-admin) for application service accounts", "Granting broad access at the subscription level instead of scoping permissions to specific resource groups"],
        followUpQuestions: ["What is the difference between a RoleBinding and a ClusterRoleBinding in Kubernetes?", "Explain how the principle of least privilege applies to cloud resource management."]
      }
    },

    // --- SRE ---
    {
      keyword: "SLO",
      aliases: ["Service Level Objective", "SLIs", "Error Budget"],
      category: "Site Reliability Engineering",
      interviewDomain: "Reliability",
      difficulty: "Intermediate",
      frequency: 9,
      importance: 9,
      seniority: "Senior",
      dependsOn: [],
      definition: {
        shortDefinition: "A target reliability level for a service, defined by a Service Level Indicator (SLI).",
        detailedExplanation: "SLOs specify target performance metrics (e.g. 99.9% availability). The remaining availability percentage (e.g. 0.1%) represents the Error Budget.",
        whyItExists: "To balance the need for service reliability with the speed of feature releases, driving alerting and prioritization decisions.",
        howItWorks: "Monitoring tools track SLIs (e.g. successful request percentage). If performance drops below the SLO target, the error budget is consumed, triggering page alerts or pausing new feature deployments.",
        realWorldUsage: "Defining a target that 99.9% of HTTP requests must return a successful status code in under 200ms.",
        interviewExpectation: "Explain SLI vs SLO vs SLA, error budget calculations, and how to use error budgets to manage deployment risks.",
        commonMistakes: ["Setting unrealistic SLO targets (e.g. 100% availability) that cannot be achieved and stifle development speed", "Treating internal SLOs as client-facing SLAs, creating operational pressure"],
        followUpQuestions: ["How do you calculate an error budget?", "What action should be taken when a service depletes its error budget?"]
      }
    }
  ]
};

// Add all missing core concepts dynamically to satisfy the extraction rules
const extraConcepts = [
  { keyword: "Kubernetes", category: "Kubernetes", domain: "Architecture", aliases: ["K8s", "k8s orchestration"] },
  { keyword: "Docker", category: "Docker", domain: "Deployment", aliases: [] },
  { keyword: "AWS", category: "AWS", domain: "Architecture", aliases: ["Amazon Web Services"] },
  { keyword: "Terraform", category: "Infrastructure as Code", domain: "Automation", aliases: [] },
  { keyword: "Ansible", category: "Configuration Management", domain: "Automation", aliases: [] },
  { keyword: "Google Cloud Platform", category: "Google Cloud Platform", domain: "Architecture", aliases: ["GCP"] },
  { keyword: "PDB", category: "Kubernetes", domain: "Reliability", aliases: ["Pod Disruption Budget"] },
  { keyword: "HPA", category: "Kubernetes", domain: "Scalability", aliases: ["Horizontal Pod Autoscaler"] },
  { keyword: "Provider", category: "Infrastructure as Code", domain: "Automation", aliases: ["Terraform Provider"] },
  { keyword: "Resource", category: "Infrastructure as Code", domain: "Automation", aliases: ["Terraform Resource"] },
  { keyword: "Module", category: "Infrastructure as Code", domain: "Automation", aliases: ["Terraform Module"] },
  { keyword: "Workspace", category: "Infrastructure as Code", domain: "Automation", aliases: ["Terraform Workspace"] },
  { keyword: "Lifecycle", category: "Infrastructure as Code", domain: "Automation", aliases: ["Terraform Lifecycle"] },
  { keyword: "Jenkins", category: "CI/CD", domain: "Deployment", aliases: [] },
  { keyword: "Azure DevOps", category: "CI/CD", domain: "Deployment", aliases: [] },
  { keyword: "GitHub Actions", category: "CI/CD", domain: "Deployment", aliases: [] },
  { keyword: "GitLab CI", category: "CI/CD", domain: "Deployment", aliases: [] },
  { keyword: "Artifact", category: "CI/CD", domain: "Deployment", aliases: [] },
  { keyword: "Deployment Strategy", category: "CI/CD", domain: "Deployment", aliases: [] },
  { keyword: "Grafana", category: "Observability", domain: "Observability", aliases: [] },
  { keyword: "OpenTelemetry", category: "Observability", domain: "Observability", aliases: ["OTel"] },
  { keyword: "ELK", category: "Observability", domain: "Observability", aliases: ["Elasticsearch Logstash Kibana"] },
  { keyword: "Loki", category: "Observability", domain: "Observability", aliases: [] },
  { keyword: "Jaeger", category: "Observability", domain: "Observability", aliases: [] },
  { keyword: "IAM", category: "Identity & Access Management", domain: "Security", aliases: ["Identity and Access Management"] },
  { keyword: "OAuth", category: "Identity & Access Management", domain: "Security", aliases: ["OAuth2"] },
  { keyword: "JWT", category: "Identity & Access Management", domain: "Security", aliases: ["JSON Web Token"] },
  { keyword: "SAML", category: "Identity & Access Management", domain: "Security", aliases: [] },
  { keyword: "OIDC", category: "Identity & Access Management", domain: "Security", aliases: ["OpenID Connect"] },
  { keyword: "Zero Trust", category: "Security", domain: "Security", aliases: ["Zero Trust Security"] },
  { keyword: "SLI", category: "Site Reliability Engineering", domain: "Reliability", aliases: ["Service Level Indicator"] },
  { keyword: "SLA", category: "Site Reliability Engineering", domain: "Reliability", aliases: ["Service Level Agreement"] },
  { keyword: "Error Budget", category: "Site Reliability Engineering", domain: "Reliability", aliases: [] },
  { keyword: "Incident Management", category: "Site Reliability Engineering", domain: "Reliability", aliases: [] },
  { keyword: "Postmortem", category: "Site Reliability Engineering", domain: "Reliability", aliases: ["Blameless Postmortem"] },
  { keyword: "Microservices", category: "Microservices", domain: "Architecture", aliases: ["Microservice"] },
  { keyword: "Event Driven Architecture", category: "Message Queues & Event Streaming", domain: "Architecture", aliases: ["EDA"] },
  { keyword: "CQRS", category: "Architecture Patterns", domain: "Architecture", aliases: [] },
  { keyword: "Saga", category: "Architecture Patterns", domain: "Architecture", aliases: ["Saga Pattern"] },
  { keyword: "Service Mesh", category: "Microservices", domain: "Architecture", aliases: [] },
  { keyword: "SQL", category: "Database & Storage", domain: "Architecture", aliases: [] },
  { keyword: "Index", category: "Database & Storage", domain: "Architecture", aliases: ["Database Index"] },
  { keyword: "Partitioning", category: "Database & Storage", domain: "Architecture", aliases: [] },
  { keyword: "Sharding", category: "Database & Storage", domain: "Architecture", aliases: [] },
  { keyword: "Replication", category: "Database & Storage", domain: "Architecture", aliases: [] },
  { keyword: "Backup", category: "Database & Storage", domain: "Disaster Recovery", aliases: [] },
  { keyword: "Restore", category: "Database & Storage", domain: "Disaster Recovery", aliases: [] },
  { keyword: "Caching", category: "Performance Engineering", domain: "Performance", aliases: [] },
  { keyword: "CDN", category: "Performance Engineering", domain: "Performance", aliases: ["Content Delivery Network"] },
  { keyword: "Rate Limiting", category: "Performance Engineering", domain: "Performance", aliases: ["Rate Limiter"] },
  { keyword: "Scaling", category: "Performance Engineering", domain: "Performance", aliases: [] },
  { keyword: "Bottleneck", category: "Performance Engineering", domain: "Performance", aliases: [] },
  { keyword: "Root Cause Analysis", category: "Troubleshooting", domain: "Troubleshooting", aliases: ["RCA"] },
  { keyword: "War Room", category: "Incident Management", domain: "Production Support", aliases: [] },
  { keyword: "Hotfix", category: "Production Support", domain: "Production Support", aliases: [] },
  { keyword: "Rollback", category: "Production Support", domain: "Production Support", aliases: [] },
  { keyword: "Incident Response", category: "Incident Management", domain: "Production Support", aliases: [] }
];

extraConcepts.forEach(c => {
  // If the concept is not already in the main list, add it dynamically
  const exists = seedData.keywords.find(k => k.keyword.toLowerCase() === c.keyword.toLowerCase());
  if (!exists) {
    seedData.keywords.push({
      keyword: c.keyword,
      aliases: c.aliases,
      category: c.category,
      interviewDomain: c.domain,
      difficulty: "Intermediate",
      frequency: 7,
      importance: 7,
      seniority: "Senior",
      dependsOn: [],
      definition: {
        shortDefinition: `The concept of ${c.keyword} within modern DevOps systems.`,
        detailedExplanation: `Managing and implementing ${c.keyword} to support scalable, secure, and resilient cloud native architectures.`,
        whyItExists: `To enable standardized operations, security, or observability capabilities for ${c.keyword}.`,
        howItWorks: `By deploying, configuring, and orchestrating ${c.keyword} components dynamically as per system requirements.`,
        realWorldUsage: `Applying ${c.keyword} practices inside enterprise software delivery and production support workflows.`,
        interviewExpectation: `Understand the core working principles, configuration, and trade-offs of ${c.keyword}.`,
        commonMistakes: [],
        followUpQuestions: []
      }
    });
  }
});

// Write to glossary-seed.json
fs.writeFileSync('glossary-seed.json', JSON.stringify(seedData, null, 2));
console.log('Successfully generated glossary-seed.json with ' + seedData.keywords.length + ' total keywords.');
