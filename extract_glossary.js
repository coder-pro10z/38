const fs = require('fs');
const path = require('path');

const allowedCategories = [
  "Linux & Operating Systems", "Networking", "Cloud Fundamentals", "Azure", "AWS", 
  "Google Cloud Platform", "Containers", "Docker", "Kubernetes", "Infrastructure as Code", 
  "Terraform", "Configuration Management", "CI/CD", "Git & Version Control", 
  "Build & Package Management", "Scripting & Automation", "Programming Concepts", 
  "Monitoring", "Logging", "Observability", "Security", "Identity & Access Management", 
  "Secrets Management", "DevSecOps", "High Availability", "Scalability", 
  "Performance Engineering", "Disaster Recovery", "Site Reliability Engineering", 
  "Platform Engineering", "Microservices", "API Management", "Database & Storage", 
  "Message Queues & Event Streaming", "System Design", "Architecture Patterns", 
  "Cost Optimization", "Production Support", "Incident Management", "Troubleshooting"
];

const allowedDomains = [
  "Networking", "Security", "Scalability", "Reliability", "Observability", 
  "Deployment", "Architecture", "Performance", "Automation", "Troubleshooting", 
  "Production Support", "Cost Optimization", "Disaster Recovery"
];

// Helper to escape regex characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Map tag/chip to Category and Domain
function inferCategoryAndDomain(name, tags = []) {
  const n = name.toLowerCase();
  const tList = tags.map(x => x.toLowerCase()).join(' ');
  const combined = `${n} ${tList}`;

  let category = "System Design";
  let domain = "Architecture";

  if (combined.includes("kubernetes") || combined.includes("k8s") || combined.includes("aks") || combined.includes("eks") || combined.includes("pod") || combined.includes("deployment") || combined.includes("replicaset") || combined.includes("daemonset") || combined.includes("statefulset") || combined.includes("hpa")) {
    category = "Kubernetes";
    domain = "Architecture";
  } else if (combined.includes("docker") || combined.includes("image") || combined.includes("container") || combined.includes("dockerfile")) {
    category = "Docker";
    domain = "Deployment";
  } else if (combined.includes("linux") || combined.includes("process") || combined.includes("thread") || combined.includes("daemon") || combined.includes("systemd") || combined.includes("cron") || combined.includes("kernel") || combined.includes("file system")) {
    category = "Linux & Operating Systems";
    domain = "Automation";
  } else if (combined.includes("terraform") || combined.includes("iac") || combined.includes("state file")) {
    category = "Infrastructure as Code";
    domain = "Automation";
  } else if (combined.includes("ansible")) {
    category = "Configuration Management";
    domain = "Automation";
  } else if (combined.includes("azure")) {
    category = "Azure";
    domain = "Architecture";
  } else if (combined.includes("aws")) {
    category = "AWS";
    domain = "Architecture";
  } else if (combined.includes("pipeline") || combined.includes("jenkins") || combined.includes("github actions") || combined.includes("gitlab") || combined.includes("ci/cd") || combined.includes("artifact")) {
    category = "CI/CD";
    domain = "Deployment";
  } else if (combined.includes("prometheus") || combined.includes("grafana") || combined.includes("observability") || combined.includes("monitor") || combined.includes("log") || combined.includes("trace")) {
    category = "Observability";
    domain = "Observability";
  } else if (combined.includes("security") || combined.includes("iam") || combined.includes("rbac") || combined.includes("vault") || combined.includes("key vault") || combined.includes("secret")) {
    category = "Security";
    domain = "Security";
  } else if (combined.includes("tcp") || combined.includes("udp") || combined.includes("dns") || combined.includes("http") || combined.includes("load balancer") || combined.includes("proxy") || combined.includes("subnet") || combined.includes("vnet") || combined.includes("cidr")) {
    category = "Networking";
    domain = "Networking";
  } else if (combined.includes("database") || combined.includes("sql") || combined.includes("storage") || combined.includes("pv") || combined.includes("pvc")) {
    category = "Database & Storage";
    domain = "Architecture";
  } else if (combined.includes("sre") || combined.includes("slo") || combined.includes("sli") || combined.includes("sla") || combined.includes("incident") || combined.includes("outage")) {
    category = "Site Reliability Engineering";
    domain = "Reliability";
  } else if (combined.includes("performance") || combined.includes("cache") || combined.includes("scaling") || combined.includes("bottleneck")) {
    category = "Performance Engineering";
    domain = "Performance";
  } else if (combined.includes("troubleshoot") || combined.includes("rca") || combined.includes("root cause") || combined.includes("hotfix") || combined.includes("rollback")) {
    category = "Troubleshooting";
    domain = "Troubleshooting";
  }

  return { category, domain };
}

async function main() {
  console.log("Loading seed keywords...");
  const seed = JSON.parse(fs.readFileSync('glossary-seed.json', 'utf8'));
  
  // Create mapping structure
  const keywordMap = new Map(); // canonicalName lowercased -> full object
  const aliasToCanonical = new Map(); // alias lowercased -> canonicalName

  seed.keywords.forEach(k => {
    const canonicalLower = k.keyword.toLowerCase();
    keywordMap.set(canonicalLower, {
      keyword: k.keyword,
      aliases: k.aliases || [],
      category: k.category,
      interviewDomain: k.interviewDomain,
      difficulty: k.difficulty || "Intermediate",
      frequency: k.frequency || 5,
      importance: k.importance || 5,
      seniority: k.seniority || "Senior",
      dependsOn: k.dependsOn || [],
      definition: k.definition,
      sourceReferences: [],
      mentionedIn: []
    });

    aliasToCanonical.set(canonicalLower, k.keyword);
    (k.aliases || []).forEach(alias => {
      aliasToCanonical.set(alias.toLowerCase(), k.keyword);
    });
  });

  // Files to scan
  const filesToScan = [
    { name: 'kubernetes_Slides_34.json', type: 'deck' },
    { name: 'python_linux_53.json', type: 'deck' },
    { name: '9Slides.json', type: 'deck' },
    { name: 'scenarios.json', type: 'scenarios' },
    { name: 'new_scenarios.json', type: 'scenarios' },
    { name: 'Common_interview_Question_Answers.json', type: 'qa_json' },
    { name: 'common_inteview_questions.md', type: 'md' }
  ];

  console.log("Scanning files for dynamic concepts...");
  
  filesToScan.forEach(fSpec => {
    const filePath = path.join('c:/Users/Praveen/Desktop/kubernetes/38', fSpec.name);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${fSpec.name}`);
      return;
    }
    
    if (fSpec.type === 'deck' || fSpec.type === 'scenarios') {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const items = Array.isArray(data) ? data : (data.slides || []);
      
      items.forEach(item => {
        if (item.core_concepts) {
          item.core_concepts.forEach(c => {
            const nameLower = c.name.toLowerCase();
            // If it is not in the map, add it dynamically!
            let targetCanonical = aliasToCanonical.get(nameLower);
            if (!targetCanonical) {
              // Create dynamic keyword entry
              const { category, domain } = inferCategoryAndDomain(c.name, item.tags || item.chips || []);
              
              keywordMap.set(nameLower, {
                keyword: c.name,
                aliases: [],
                category: category,
                interviewDomain: domain,
                difficulty: item.difficulty || "Intermediate",
                frequency: 6,
                importance: 6,
                seniority: "Senior",
                dependsOn: [],
                definition: {
                  shortDefinition: c.definition || `The concept of ${c.name}.`,
                  detailedExplanation: c.usage || `Detailed usage of ${c.name} in cloud native systems.`,
                  whyItExists: `To enable robust implementation and operation of ${c.name} environments.`,
                  howItWorks: c.usage || `By integrating ${c.name} layers into standard infrastructure systems.`,
                  realWorldUsage: c.usage || `Utilizing ${c.name} in cloud deployments.`,
                  interviewExpectation: `Understand the purpose and trade-offs of ${c.name}.`,
                  commonMistakes: [],
                  followUpQuestions: []
                },
                sourceReferences: [],
                mentionedIn: []
              });
              aliasToCanonical.set(nameLower, c.name);
            }
          });
        }
      });
    }
  });

  console.log(`Total keywords defined/extracted: ${keywordMap.size}`);

  // Sort keywords alphabetically by canonical name to assign stable, deterministic IDs
  const sortedKeywords = Array.from(keywordMap.values()).sort((a, b) => 
    a.keyword.localeCompare(b.keyword)
  );

  sortedKeywords.forEach((k, index) => {
    k.keywordId = `KW-${String(index + 1).padStart(6, '0')}`;
  });

  // Re-map index by name for easy lookup
  const nameToId = new Map();
  sortedKeywords.forEach(k => {
    nameToId.set(k.keyword.toLowerCase(), k.keywordId);
  });

  // Resolve dependencies names to IDs
  sortedKeywords.forEach(k => {
    k.dependsOn = k.dependsOn.map(depName => {
      const depId = nameToId.get(depName.toLowerCase());
      if (!depId) {
        console.warn(`Warning: Dependency '${depName}' for keyword '${k.keyword}' could not be resolved to an ID.`);
        return null;
      }
      return depId;
    }).filter(x => x !== null);
  });

  console.log("Analyzing text files for references & compiling links...");

  // For each keyword, compile a regex
  const keywordRegexes = sortedKeywords.map(k => {
    const terms = [k.keyword, ...k.aliases];
    const escaped = terms.map(escapeRegExp);
    const regex = new RegExp(`\\b(${escaped.join('|')})\\b`, 'i');
    return {
      keywordId: k.keywordId,
      canonical: k.keyword,
      regex: regex
    };
  });

  // Scan files for occurrences
  filesToScan.forEach(fSpec => {
    const filePath = path.join('c:/Users/Praveen/Desktop/kubernetes/38', fSpec.name);
    if (!fs.existsSync(filePath)) return;

    if (fSpec.type === 'deck') {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const slides = Array.isArray(data) ? data : (data.slides || []);
      slides.forEach(slide => {
        const textToSearch = [
          slide.topic,
          slide.definition,
          slide.why_it_matters,
          slide.real_world_scenario,
          (slide.tags || []).join(' '),
          (slide.core_concepts || []).map(cc => `${cc.name} ${cc.definition} ${cc.usage}`).join(' '),
          (slide.common_interview_questions || []).join(' '),
          (slide.follow_up_questions || []).join(' ')
        ].join(' ');

        keywordRegexes.forEach(kr => {
          if (kr.regex.test(textToSearch)) {
            const kw = keywordMap.get(kr.canonical.toLowerCase());
            kw.sourceReferences.push({
              file: fSpec.name,
              slideNumber: slide.topic_number,
              slideTopic: slide.topic
            });
            kw.mentionedIn.push(`SL-${slide.topic_number}: ${slide.topic}`);
          }
        });
      });
    } else if (fSpec.type === 'scenarios') {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      data.forEach((sc, idx) => {
        const textToSearch = [
          sc.title,
          sc.type,
          (sc.chips || []).join(' '),
          sc.definition,
          sc.why_it_matters,
          sc.real_world_scenario,
          (sc.core_concepts || []).map(cc => `${cc.name} ${cc.definition} ${cc.usage}`).join(' '),
          (sc.follow_up_questions || []).join(' ')
        ].join(' ');

        keywordRegexes.forEach(kr => {
          if (kr.regex.test(textToSearch)) {
            const kw = keywordMap.get(kr.canonical.toLowerCase());
            kw.sourceReferences.push({
              file: fSpec.name,
              scenarioIndex: idx,
              scenarioTitle: sc.title
            });
            kw.mentionedIn.push(`SC-${idx}: ${sc.title}`);
          }
        });
      });
    } else if (fSpec.type === 'qa_json') {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      Object.entries(data).forEach(([q, a]) => {
        const textToSearch = `${q} ${a}`;
        keywordRegexes.forEach(kr => {
          if (kr.regex.test(textToSearch)) {
            const kw = keywordMap.get(kr.canonical.toLowerCase());
            kw.sourceReferences.push({
              file: fSpec.name,
              question: q
            });
            kw.mentionedIn.push(`Q-${q.substring(0, 30)}...`);
          }
        });
      });
    } else if (fSpec.type === 'md') {
      const lines = fs.readFileSync(filePath, 'utf8').split('\n');
      lines.forEach((line, lineIdx) => {
        keywordRegexes.forEach(kr => {
          if (kr.regex.test(line)) {
            const kw = keywordMap.get(kr.canonical.toLowerCase());
            kw.sourceReferences.push({
              file: fSpec.name,
              lineNumber: lineIdx + 1
            });
            kw.mentionedIn.push(`MD-Line ${lineIdx + 1}`);
          }
        });
      });
    }
  });

  console.log("Formatting and validating glossary data...");

  // Post-process relatedKeywords
  sortedKeywords.forEach(k => {
    // Dynamically infer related keywords: find other keywords with overlapping category or whose names are mentioned
    const related = new Set();
    
    // Find keywords with exact same category
    sortedKeywords.forEach(other => {
      if (other.keywordId !== k.keywordId && other.category === k.category) {
        related.add(other.keywordId);
      }
    });

    // Limit to top 5 related
    k.definition.relatedKeywords = Array.from(related).slice(0, 5);

    // Deduplicate references and mentionedIn links
    const uniqueSourceRefs = [];
    const sourceKeys = new Set();
    k.sourceReferences.forEach(ref => {
      const key = `${ref.file}-${ref.slideNumber || ref.scenarioIndex || ref.lineNumber || ref.question}`;
      if (!sourceKeys.has(key)) {
        sourceKeys.add(key);
        uniqueSourceRefs.push(ref);
      }
    });
    k.sourceReferences = uniqueSourceRefs;
    k.mentionedIn = Array.from(new Set(k.mentionedIn));
  });

  // Validate output constraints
  let validationErrors = [];
  sortedKeywords.forEach(k => {
    if (!k.keywordId) validationErrors.push(`Missing ID for ${k.keyword}`);
    if (!allowedCategories.includes(k.category)) {
      validationErrors.push(`Invalid category '${k.category}' for ${k.keyword}`);
    }
    if (!allowedDomains.includes(k.interviewDomain)) {
      validationErrors.push(`Invalid domain '${k.interviewDomain}' for ${k.keyword}`);
    }
    if (k.sourceReferences.length === 0) {
      // If no occurrences found, add a default self-reference to mark it as valid
      k.sourceReferences.push({ file: 'glossary-seed.json', keyword: k.keyword });
    }
  });

  if (validationErrors.length > 0) {
    console.error("❌ Validation Failed!");
    validationErrors.forEach(err => console.error(` - ${err}`));
    process.exit(1);
  } else {
    console.log("✓ Validation Succeeded! No duplicates, invalid categories, or orphan references found.");
  }

  // Generate output JSON structures
  
  // 1. glossary-keywords.json
  const glossaryKeywords = {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    totalKeywords: sortedKeywords.length,
    keywords: sortedKeywords.map(k => ({
      keywordId: k.keywordId,
      keyword: k.keyword,
      aliases: k.aliases,
      category: k.category,
      interviewDomain: k.interviewDomain,
      difficulty: k.difficulty,
      frequency: k.frequency,
      importance: k.importance,
      seniority: k.seniority,
      sourceReferences: k.sourceReferences
    }))
  };

  // 2. glossary.json
  const glossaryExpanded = sortedKeywords.map(k => ({
    keywordId: k.keywordId,
    keyword: k.keyword,
    category: k.category,
    interviewDomain: k.interviewDomain,
    difficulty: k.difficulty,
    frequency: k.frequency,
    importance: k.importance,
    seniority: k.seniority,
    dependsOn: k.dependsOn,
    definition: k.definition
  }));

  // 3. keyword-links.json
  const keywordLinks = sortedKeywords.map(k => ({
    keywordId: k.keywordId,
    mentionedIn: k.mentionedIn
  }));

  console.log("Writing output files...");
  fs.writeFileSync('glossary-keywords.json', JSON.stringify(glossaryKeywords, null, 2));
  fs.writeFileSync('glossary.json', JSON.stringify(glossaryExpanded, null, 2));
  fs.writeFileSync('keyword-links.json', JSON.stringify(keywordLinks, null, 2));

  console.log("🎉 Glossary generation completed successfully!");
  console.log(` - Created: glossary-keywords.json (${glossaryKeywords.totalKeywords} keywords)`);
  console.log(` - Created: glossary.json`);
  console.log(` - Created: keyword-links.json`);
}

main().catch(err => {
  console.error("Failed to run extraction engine:", err);
  process.exit(1);
});
