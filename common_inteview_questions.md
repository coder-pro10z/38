📂 Kubernetes Workloads & Controllers (Deployments, ReplicaSets, Services, Ingress, DaemonSet, Jobs, CronJobs)
ReplicaSet: Difference between Pod and ReplicaSet? | ReplicaSet vs Deployment? | How does self healing work?
Deployments: Deployment vs ReplicaSet? | How rollback works? | Explain rolling update strategy. | How achieve zero downtime?
Services: ClusterIP vs NodePort? | How does Service find Pods? | What is Headless Service? | Explain Service discovery.
Ingress: Ingress vs LoadBalancer? | What is Ingress Controller? | How TLS works?
DaemonSet: Deployment vs DaemonSet? | Use cases of DaemonSet?
Jobs: Job vs Deployment? | Explain parallel Jobs.
CronJobs: Job vs CronJob? | Explain concurrency policy.
📂 Configuration, Storage & Security (ConfigMap, Secrets, Storage, Namespaces, Resource Management, RBAC)
ConfigMap / Secrets: ConfigMap vs Secret? | How to update configuration? | How are Secrets stored? | How to rotate Secrets?
Storage: PV vs PVC? | What happens when Pod restarts? | Explain StorageClass.
Namespaces: Why use namespaces? | Namespace vs cluster? | How enforce limits?
Resource Management: Request vs limit? | What is OOMKilled? | Explain QoS classes.
Health Checks: Difference between probes (Liveness, Readiness, Startup)? | Why use startup probe?
Scheduling: How does scheduler work? | Affinity vs taints? | Why Pod is Pending?
📂 Troubleshooting & Maintenance
Troubleshooting: Pod stuck Pending? | CrashLoopBackOff fix? | ImagePullBackOff?
Upgrades & Maintenance: Difference between cordon and drain? | How upgrade Kubernetes safely?
📂 Linux Operations & Administration (Processes, Firewall, CPU, Memory, Disk, Services)
Boot Process: Explain Linux architecture | Explain Linux boot process | Kernel vs OS difference.
Commands: Difference between grep and find? | How do you search logs? | Difference between grep and awk? | Explain sed usage.
Permissions: Explain 755 permission | chmod vs chown? | Why avoid 777?
Processes: Process vs thread? | How find process? | SIGTERM vs SIGKILL?
Resources: CPU is 100%, what steps? | Load average meaning? | What is OOM killer? | RAM vs swap? | Disk full troubleshooting? | df vs du? | Explain LVM.
Networking: TCP vs UDP? | How find process using port? | curl vs ping? | How check DNS?
Firewall & SSH: iptables vs firewalld? | How SSH works? | SSH troubleshooting steps? | Password vs key authentication?
📂 Python Automation & DevOps (Scope, Functions, Logging, Exception Handling, APIs, SSH, K8s Client)
Basics: Why Python in DevOps? | Python vs Shell scripting? | List vs tuple? | Set vs dictionary? | Explain mutable objects | Why strings immutable?
Functions & Scope: Explain LEGB rule | Local vs global variable? | What is variable shadowing? | Difference between args and kwargs? | When use kwargs? | Explain lambda.
Files & Command Execution: How read file? | Why use with open? | os vs shutil? | os.system vs subprocess?
API & Shell Automation: How execute remote command using Python? | Paramiko usage? | How call REST API? | Explain HTTP methods? | How handle API errors?
Kubernetes Python Client: How automate Kubernetes using Python? | Python client usage?
Testing & Production: pytest vs unittest? | Why testing in DevOps? | Thread vs process? | When use multiprocessing? | Generator vs list? | Why use yield? | What is decorator? | How make Python script production ready? | How handle failures?