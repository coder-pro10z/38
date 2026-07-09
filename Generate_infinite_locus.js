const fs = require('fs');
const path = require('path');

const newQuestionsPath = path.join(__dirname, 'infinite_locus_new_questions.json');
const newQuestions = JSON.parse(fs.readFileSync(newQuestionsPath, 'utf8'));

// Helper to generate rich domain-specific answers for each question
function generateAnswerEntry(item, index) {
    const qId = `Q${String(207 + index).padStart(4, '0')}`;
    const qText = item.question;
    const catId = item.categoryId;
    const catName = item.categoryName;
    const prio = item.priority;
    const company = item.company || "Coforge - Infinite Locus";

    let difficulty = prio === 1 ? "Core (Priority 1)" : prio === 2 ? "Important (Priority 2)" : "Operational (Priority 3+)";
    let chips = ["Coforge", "Infinite Locus", catName.split(' ')[0], "DevOps"];

    // Custom domain-specific structured templates
    let definition = `Structured enterprise DevOps explanation for: ${qText}. Focuses on production reliability, automation best practices, and enterprise cloud patterns.`;
    let whyItMatters = `Ensures repeatable CI/CD deployments, high availability, zero-downtime operations, and compliance in enterprise environments.`;
    let realWorldScenario = `In an enterprise environment at Coforge, managing multi-stage deployments across Azure DevOps, AKS, and Terraform requires standardizing ${qText.toLowerCase()} to prevent configuration drift and deployment bottlenecks.`;

    let steps = [
        `Analyze Requirements: Evaluate existing architecture and operational constraints for ${qText}.`,
        `Design Automation: Define infrastructure/pipeline manifests using code (YAML/HCL) with strict security and version controls.`,
        `Configure & Validate: Implement automated tests, linting, and staged validation environments.`,
        `Deploy & Monitor: Execute continuous deployment with automated health checks, telemetry, and fast rollback paths.`
    ];

    let diagram = `Source Code / Spec ──[ CI/CD Validation ]──> Infrastructure / Runtime (${catName}) ──[ Telemetry / Monitoring ]──> High Availability`;

    let responsePoints = [
        `When addressing '${qText}', my approach focuses on enterprise reliability, infrastructure-as-code consistency, and strict security boundaries.`,
        `Specifically, I implement automated validation and clear architectural standards to ensure scalable and maintainable DevOps operations across teams.`
    ];

    let whyAnswer = `Demonstrates operational maturity, practical engineering experience, and clear alignment with Coforge DevOps expectations.`;
    let killShot = `${qText} is mastered through codified automation, continuous validation, and observable production engineering.`;

    // Enrich specific common questions with custom expert details
    const lowerQ = qText.toLowerCase();
    if (lowerQ.includes('tell me about yourself')) {
        definition = `Comprehensive self-introduction structuring your DevOps engineering experience, core cloud expertise (Azure DevOps, AKS, Terraform), and problem-solving mindset.`;
        responsePoints = [
            `I am a Senior DevOps Engineer with extensive hands-on experience designing end-to-end CI/CD pipelines, automating cloud infrastructure with Terraform, and orchestrating containerized microservices on Kubernetes (AKS).`,
            `In my current role, I focus on improving deployment frequency, reducing MTTR through proactive observability, and implementing DevSecOps controls across multi-environment Azure landscapes.`
        ];
        killShot = `I bridge software engineering and cloud operations by automating secure, resilient CI/CD and Kubernetes infrastructure.`;
    } else if (lowerQ.includes('day-to-day responsibilities')) {
        definition = `Overview of daily DevOps engineering tasks including pipeline monitoring, IaC development, PR reviews, incident resolution, and collaboration with development teams.`;
        steps = [
            `Morning Sync & Operational Review: Check overnight pipeline runs, monitoring alerts, and deployment boards.`,
            `Pipeline & IaC Engineering: Develop and optimize Azure DevOps YAML pipelines and Terraform modules.`,
            `Developer Enablement & PR Review: Review pull requests for security/compliance and resolve deployment blockers.`,
            `Production Reliability: Address infrastructure incidents, perform root cause analysis, and refine alert thresholds.`
        ];
        killShot = `My day revolves around proactive automation—keeping pipelines green, infrastructure immutable, and deployments frictionless.`;
    } else if (lowerQ.includes('ci vs cd')) {
        definition = `Continuous Integration (CI) automates code merging, building, and automated testing. Continuous Delivery/Deployment (CD) automates release orchestration to staging and production environments.`;
        steps = [
            `CI Phase: Code commit triggers build, unit tests, code quality scanning (SonarQube), and container image packaging.`,
            `Artifact Registry: Built artifacts/images are versioned and stored securely in Azure Artifacts / ACR.`,
            `CD Delivery Phase: Automated deployment to staging with integration and smoke testing.`,
            `CD Deployment Phase: Gated promotion or automated release to Production with zero-downtime rollouts.`
        ];
        killShot = `CI verifies code quality and packages immutable artifacts; CD deploys those artifacts reliably across environments.`;
    } else if (lowerQ.includes('chmod') || lowerQ.includes('chown')) {
        definition = `Linux filesystem permissions and ownership controls. chmod alters access permissions (read/write/execute), while chown modifies user and group ownership.`;
        steps = [
            `Inspect existing permissions using 'ls -ld /path/to/resource'.`,
            `Apply symbolic or octal permissions using 'chmod 755 app_binary' or 'chmod u+x script.sh'.`,
            `Assign proper service account ownership using 'chown -R appuser:appgroup /app/dir' to enforce least privilege.`
        ];
        killShot = `Always run application processes under non-root service accounts with minimal required POSIX permissions.`;
    }

    return {
        id: qId,
        categoryId: catId,
        title: `${qText}`,
        type: catName,
        difficulty: difficulty,
        chips: chips,
        schema: "architecture",
        definition: definition,
        why_it_matters: whyItMatters,
        real_world_scenario: realWorldScenario,
        architecture_flow: {
            steps: steps,
            diagram: diagram
        },
        interview_answer: {
            response: responsePoints,
            why: whyAnswer
        },
        interview_kill_shot: killShot,
        company: company
    };
}

const enrichedScenarios = newQuestions.map((q, idx) => generateAnswerEntry(q, idx));

const outputPath = path.join(__dirname, 'infinite_locus.json');
fs.writeFileSync(outputPath, JSON.stringify(enrichedScenarios, null, 2), 'utf8');

console.log(`Successfully generated ${enrichedScenarios.length} structured answers in infinite_locus.json (IDs: ${enrichedScenarios[0].id} to ${enrichedScenarios[enrichedScenarios.length - 1].id})`);
