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

# 7. Tag all questions with global IDs (Q0001-Q0206) & categories (C001-C017)
node tag_questions.js

# 8. Merge all datasets into combined database (merged.json)
node merge_datasets.js
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

#### 🏷️ `tag_questions.js` & `category_config.json`
- **Purpose**: Enriches all 5 JSON datasets (`scenarios.json`, `hexaview_r1.json`, `hexaview_r2.json`, `noventiq_r1.json`, `infra_azure.json`) by tagging every question with:
  - **Globally Unique Question ID**: `Q0001` through `Q0206`
  - **Category ID**: Hierarchical classification (`C001` through `C017`) mapped to major DevOps & Cloud knowledge domains.
- **Category Schema**: Includes 17 prioritized categories:
  - `C001`–`C015`: Core DevOps, Cloud, CI/CD, Kubernetes, Terraform, Security, Networking, Linux, and HR scenarios.
  - `C016`: **Python / Scripting** (30 Python programming & production design questions).
  - `C017`: **Reference** (dedicated category for master FAQ panels and slide references).

#### 📦 `merge_datasets.js` (`merged.json`)
- **Purpose**: Concatenates all 206 questions across all 5 datasets into a single unified JSON database (`merged.json`). Each entry is tagged with its original `sourceDataset` name and index.
- **Run command**:
  ```bash
  node merge_datasets.js
  ```
- **UI Integration**: Accessible directly from the **Interviews** dropdown as **`"📦 All Questions (206)"`**.

---

## 🧭 Categorized Index Navigation System

The interactive study dashboard (`index.html`) features a dual-mode index modal designed for rapid navigation across all 206 questions:

1. **📋 Category View**:
   - Organizes questions into interactive category cards (`C001`–`C017`).
   - Displays priority ranking badges (`#1`, `#2`, etc.) and completion statistics.
   - Includes **3-Segment Progress Bars** visualizing the exact proportion of questions rated as 🟢 Done, 🟠 Review, or 🟡 Revisit.
   - Collapsible cards allow focused study by domain.

2. **≡ List View**:
   - Backward-compatible flat index view with slide numbering and status indicators.

3. **⏱️ Recently Viewed History Panel**:
   - Maintains a persistent history bar across the top of the index modal showing up to 6 recently viewed questions across datasets. Clicking any item instantly switches datasets and jumps to that question.

4. **Persisted State Management**:
   - Saves your index mode preference (`devops_index_mode`), expanded category cards (`devops_expanded_categories`), recently viewed questions (`devops_recently_viewed`), and per-dataset confidence ratings independently (`getStorageKeyForDataset`).

5. **⚡ Instant Status Toggle (Grey ⚪ ↔ Green 🟢)**:
   - **Slide Header Pill**: A top pill button (`⚪ Mark Done` / `🟢 Done (Click to Reset)`) next to the question title allows instant one-click toggling between Grey (Unrated) and Green (Done).
   - **Index Modal Indicators**: Every question status icon (`⚪` / `🟢`) inside both Category View and List View is directly clickable to toggle a question's completion status without having to open the slide.
   - **Confidence Bar**: Clicking any already-active confidence button toggles the status back to Unrated (`⚪`).

---

## 🏗 Application Architecture

The application is structured to serve as an ultra-fast, fully client-side single-page application (SPA).

```
38/
├── index.html                                  # Main dashboard (HTML + CSS + JS)
├── devops_interview_study_dashboard_38.html     # Identical backup copy of index.html
├── scenarios.json                              # Main Kubernetes/Troubleshooting scenarios database (135 Qs)
├── hexaview_r1.json                            # Hexaview Round 1 interview slides (16 Qs)
├── hexaview_r2.json                            # Hexaview Round 2 interview slides (18 Qs)
├── noventiq_r1.json                            # Noventiq Round 1 interview slides (8 Qs)
├── infra_azure.json                            # Azure Infra JD-aligned slides (29 Qs)
├── infinite_locus.json                         # Coforge / Infinite Locus interview questions (48 Qs, HR synced)
├── hr_behavioral.json                          # Authentic behavioral interview answers base (Anam Ansari / Coforge)
├── merged.json                                 # Combined database containing all 254 questions
├── category_config.json                        # Category definitions & priorities (C001-C017)
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
| **Interviews Dropdown** | Nav Dropdown | Switches datasets on-the-fly (`Default`, `Hexaview R1/R2`, `Noventiq`, `Azure Infra`, or `📦 All Questions (254)`) while retaining study progress independently. |
| **Scenario Index Modal** | Header Counter Button | Opens the dual-mode index modal (`📋 Category` vs `≡ List`) with 3-segment progress bars, priority badges, and cross-dataset recently viewed history. |

---

## 🧭 Navigation & UI Ergonomics

### 1. Auto-Hiding Navigation Bar & Anti-Flicker Engine
- **Debounced Layout Reclamation**: To maximize vertical reading space during study sessions, the top navigation bar and master progress bar automatically collapse (`max-height: 0px`) after **2.2 seconds** of inactivity or immediately when scrolling down (`> 35px` past `scrollY > 80px`).
- **Anti-Flicker Transition Lock**: Uses a `450ms` debounced transition lock (`isNavTransitioning`) so document resizing during collapse/expand never triggers synthetic scroll events or visual flicker loops.
- **Top-Quarter Auto-Reappear Scroll Zone**: Scrolling upwards while reading deep in the page (`scrollY > 28%` of screen height) will not pop open the navigation bar. Auto-reappear via scrolling up only activates within the **top quarter of the screen (`scrollY <= 28%`)** or when reaching the very top (`scrollY <= 15px`).
- **Mobile Multi-Row Unlocking**: On phone view (`max-width: 768px`), the navigation bar uses `max-height: 500px` and compact `54px` right padding so wrapped tabs and dropdowns remain 100% visible without clipping.

### 2. Lock / Unlock Navigation Icon (`#nav-pin-toggle`)
- Located fixed at the top right corner (`top: 14px; right: 24px`) above the search bar as a sleek 40×40px circular button (scales to 36×36px on mobile).
- **`🔓` (Unlocked / Auto-Hide Mode)**: Default state where the navigation bar auto-hides on inactivity or scroll down.
- **`🔒` (Locked / Fixed Mode)**: Clicking locks the navigation bar open permanently with an accent glow, disabling auto-hide until toggled off.

### 3. Full Top-Space Index Modal & Event Isolation
- **Top-Edge Coverage (`z-index: 100000`)**: The Index Modal slides down from the top edge (`align-items: flex-start`, `height: 96vh`) with `z-index: 100000`, covering sticky headers and floating controls.
- **Single-Line Compact Recently Viewed Strip**: The history strip is formatted as a single horizontal scrollable row (`max-height: 42px`) so it never consumes excess vertical modal height.
- **Event Isolation (`isIndexModalOpen`)**: While the Index Modal is open, navigation bar auto-hiding and auto-reappearing are completely suppressed.

### 4. Floating Right Search Bar (`#floating-search-bar`)
- Positioned floating at `top: 64px; right: 24px` showing a clean magnifying glass icon (`🔍`) formatted identically to `#nav-pin-toggle` (40×40px on desktop, 36×36px on mobile).
- **Seamless Pill Input**: When expanded, the inner text input is borderless and transparent so there are no nested inner square borders or boxes.
- Searches live across all **254 questions** (titles, answers, and tags) and highlights exact matches.

### 5. 524-Term Interactive Glossary (`glossary.json`)
- Includes 15 new rich high-impact Cloud Native/SRE keywords (**FinOps**, **KEDA**, **eBPF**, **Argo CD**, **GitOps**, **Karpenter**, **Crossplane**, **OPA Gatekeeper**, **Cilium**, **Zero Trust**, **UDR**, **Azure Private Endpoint**, **OpenTelemetry**, **DevSecOps Shift Left**, **Service Mesh**).
- Dynamic keyword links (`keyword-links.json`) connect terms to relevant study scenarios across all datasets.
