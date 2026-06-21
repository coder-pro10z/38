# 🎯 Enterprise Full-Stack & DevOps Interview Study Dashboard

An interactive, single-page study dashboard designed to help candidates master **real-world DevOps, Cloud, and SRE interview scenarios** — including curated rapid-fire questions, architectural tradeoffs, and live troubleshooting flows.

This repository features both the client-side interactive dashboard and a **Node.js data compilation pipeline** that automatically parses raw interview content, extracts terminology, and builds structured datasets.

---

## 🛠 Developer Scripts & Data Pipeline

The project features a suite of Node.js utility scripts designed to manage, seed, compile, and enrich the study databases. Below is a guide on how these scripts are used to generate the system's static assets.

```
Data Source (.md)  ──[Compilers]──>  Dataset (.json)  ──[Injectors]──>  Enriched scenarios.json
```

### 1. Data Pipeline Execution Order
If you are rebuilding the entire application dataset from scratch, execute the scripts in the following order:

```bash
# 1. Compile the glossary definitions
node generate_seed.js

# 2. Extract keywords and establish cross-mentions
node extract_glossary.js

# 3. Inject interview Q&As into scenarios.json
node inject_qa.js

# 4. Generate core concepts for scenarios.json
node inject_core_concepts.js

# 5. Populate follow-up questions for scenarios.json
node generate_followups.js

# 6. Compile custom company interview datasets
node generate_hexaview_json.js
node generate_hexaview_r1_json.js
node generate_noventiq_r1_json.js
```

---

### 2. Script Reference & Code Deep Dive

#### 📝 `generate_seed.js`
- **Purpose**: Generates the raw glossary seed data (`glossary-seed.json`) from hardcoded structures containing detailed DevOps, SRE, and Cloud definitions, aliases, importance weightings, and common interview pitfalls.
- **Key Code Structure**:
  ```javascript
  const seedData = {
    version: "1.0",
    keywords: [
      {
        keyword: "Linux",
        aliases: ["Linux OS", "GNU/Linux"],
        category: "Linux & Operating Systems",
        interviewDomain: "Automation",
        difficulty: "Beginner",
        definition: {
          shortDefinition: "An open-source, Unix-like operating system kernel...",
          detailedExplanation: "Linux manages system hardware resources...",
          commonMistakes: ["Confusing the Linux kernel with a full distribution", "Running container processes as root"],
          followUpQuestions: ["Explain soft vs hard links.", "What is the role of PID 1?"]
        }
      }
    ]
  };
  fs.writeFileSync('glossary-seed.json', JSON.stringify(seedData, null, 2));
  ```

#### 🔍 `extract_glossary.js`
- **Purpose**: Parses `glossary-seed.json`, formats classifications, and scans all scenario definitions in `scenarios.json` to generate `keyword-links.json` (cross-referencing which slides mention which keywords).
- **Core Lookup Logic**:
  ```javascript
  // Scans all scenario text fields to determine where keywords are mentioned
  scenarios.forEach((s, idx) => {
    const textContent = JSON.stringify(s).toLowerCase();
    keywords.forEach(k => {
      const regex = new RegExp(`\\b${escapeRegExp(k.keyword.toLowerCase())}\\b`, 'g');
      if (regex.test(textContent)) {
        addMention(k.keywordId, s.title, idx);
      }
    });
  });
  ```
- **Outputs**: `glossary.json`, `keyword-links.json`

#### 💉 `inject_qa.js`
- **Purpose**: Enriches `scenarios.json` by mapping and injecting custom arrays of real-world interview Q&As and their high-impact "kill-shot" answers directly into scenarios based on their titles.
- **Key Code Structure**:
  ```javascript
  const qaMapping = {
    "AKS Deployment Failing After Release": [
      { 
        question: "What state do you check first when pods fail to roll out?", 
        kill_shot_answer: "Check if pods are in CrashLoopBackOff, ImagePullBackOff, or Pending via 'kubectl get pods'." 
      }
    ]
  };
  // Injecting into scenarios.json
  scenarios.forEach(s => {
    if (qaMapping[s.title]) {
      s.common_interview_questions = qaMapping[s.title];
    }
  });
  ```

#### 📚 `inject_core_concepts.js`
- **Purpose**: Ensures that every scenario has 5 to 6 associated core concepts (name, definition, usage) dynamically injected to facilitate the "Quick Recall" UI module.
- **Category Domain Inference**:
  ```javascript
  function determineDomain(title, tags) {
      const t = (title + ' ' + tags.join(' ')).toLowerCase();
      if (t.includes('kubernetes') || t.includes('aks') || t.includes('pod')) return 'kubernetes';
      if (t.includes('terraform') || t.includes('iac')) return 'terraform';
      return 'general';
  }
  ```

#### 🔄 `generate_followups.js`
- **Purpose**: Injects 6 randomized but highly context-relevant follow-up questions to help candidates prepare for deep-dive grilling during live interviews.
- **Follow-up Mixing Logic**:
  ```javascript
  // Selects 4 domain-specific questions and fills the rest with generic stress questions
  let finalQuestions = [];
  let domainSpecific = questions.sort(() => 0.5 - Math.random());
  finalQuestions.push(...domainSpecific.slice(0, 4));

  let genericShuffle = generic.sort(() => 0.5 - Math.random());
  while(finalQuestions.length < 6 && genericShuffle.length > 0) {
      let q = genericShuffle.pop();
      if(!finalQuestions.includes(q)) finalQuestions.push(q);
  }
  ```

#### 🏭 `generate_hexaview_json.js`, `generate_hexaview_r1_json.js`, `generate_noventiq_r1_json.js`
- **Purpose**: Compilers that parse raw text/markdown interview dossiers (`Hexaview-R1.md`, `Hexaview-R2.md`, `Noventiq-R1.md`) and output structured JSON databases matching the dashboard's rendering engine.
- **Run command**:
  ```bash
  node generate_hexaview_r1_json.js
  ```
- **Outputs**: `hexaview_r1.json`, `hexaview_r2.json`, `noventiq_r1.json`

---

## 🏗 Application Architecture

The application is structured to serve as an ultra-fast, fully client-side single-page application (SPA).

```
38/
├── index.html                                  # Main dashboard (HTML + CSS + JS)
├── devops_interview_study_dashboard_38.html     # Identical backup copy of index.html
├── scenarios.json                              # Main Kubernetes/Troubleshooting scenarios database
├── hexaview_r1.json                            # Hexaview Round 1 interview slides
├── hexaview_r2.json                            # Hexaview Round 2 interview slides
├── noventiq_r1.json                            # Noventiq Round 1 interview slides
├── glossary.json                               # Processed keywords & definitions database
├── keyword-links.json                          # Keywords cross-reference links
├── *.js                                        # Node.js data pipeline scripts
└── README.md                                   # This documentation file
```

### Tech Stack
- **Frontend Core**: Standard HTML5 & Vanilla ES6+ Javascript (no compilation, build-tools, or Node.js frontend runtime needed).
- **Styling**: Curated custom Vanilla CSS featuring dark glassmorphic styling, responsive flex/grid layouts, and micro-interactions.
- **State Management**: Dynamic local storage segregation for ratings progress (e.g. `k8s_dashboard_ratings`, `hexaview_r1_ratings`, `hexaview_r2_ratings`, `noventiq_r1_ratings`).

---

## 🚀 How to Run Locally

Because the dashboard retrieves its databases via HTTP requests (`fetch`), browsers block direct file execution (`file://` protocol) due to Cross-Origin Resource Sharing (CORS) rules. You must run a basic local web server.

### Option A: Python (Built-in)
```bash
# Start server on port 8000
python3 -m http.server 8000
```

### Option B: Node.js (serve package)
```bash
# Start server globally or via npx
npx serve
```

Once running, navigate to `http://localhost:8000` or `http://localhost:3000` in your web browser.

---

## 🎨 UI Modes Reference

| Mode | Trigger | Behavior |
|---|---|---|
| **Learn Mode** | Active tab: `Learn` | Fully displays all scenario diagnostics, definitions, code blocks, and solutions. |
| **Practice Mode** | Active tab: `Practice` | Hides answers and solutions behind a glassmorphic "Reveal Solution" button to simulate a live interview. |
| **Review Mode** | Active tab: `Review` | Filters scenarios dynamically, showing only the ones not marked as "Done". Tracks overall progress. |
| **Glossary View** | Active tab: `Glossary` | Displays the interactive DevOps glossary drawer, categories, and keyword relationships. |
| **Flashcards** | Active tab: `Flashcards` | Flips through key concepts dynamically with active recall rating. |
| **Interviews Dropdown** | Nav Dropdown | Switches datasets on-the-fly (e.g., loading Noventiq or Hexaview Round 1 datasets) while retaining study progress metrics independently. |
