# 🧭 Navigation System & Indexing Architecture Documentation

This document provides a comprehensive technical and architectural reference for the **Navigation System** and **Indexing Engine** powering the Enterprise Full-Stack & DevOps Study Dashboard (`index.html`).

---

## 1. Architectural Overview

The dashboard operates as a client-side Single-Page Application (SPA) designed to browse, search, and practice hundreds of DevOps engineering interview scenarios across multiple independent datasets.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        TOP AUTO-HIDING NAVIGATION BAR (#header)                        │
│  [Tabs: Learn | Practice | Review | Rapid Fire | Follow-Up | Glossary | Flashcards]  │
│  [Dataset Dropdown: Infinite Locus | Azure Infra | Hexaview | All (254 Qs)]          │
│  [Counter / Index Trigger: "Question 1 of 48 ▼"]   [Pin Lock: 🔓/🔒]                   │
└────────────────────────────────────────────────────────────────────────────────────────┘
            │                                                      │
            ▼                                                      ▼
┌──────────────────────────────────────┐     ┌───────────────────────────────────────────┐
│       DUAL-MODE INDEX MODAL          │     │        FLOATING SEARCH ENGINE             │
│  ├── Cross-Dataset Recently Viewed   │     │  ├── Live Full-Text Search across 254 Qs  │
│  ├── Category View (C001-C017 Cards) │     │  ├── Instant Keyword & Tag Filtering      │
│  └── List View (Sequential Slides)   │     │  └── Jump-to-Slide Routing                │
└──────────────────────────────────────┘     └───────────────────────────────────────────┘
```

---

## 2. Core Navigation Modes (`currentMode`)

The application supports 7 primary pedagogical modes, controlled by `setMode(modeName)` and rendered dynamically without full page reloads:

| Mode | Trigger Tab | Purpose & Behavior |
| :--- | :--- | :--- |
| **`learn`** | **Learn** | **Full Context Mode**: Displays complete scenario definitions, concept explanations, diagrams/tradeoff matrices, key commands, spoken interview answers, and kill shots. |
| **`practice`** | **Practice** | **Simulated Interview Mode**: Hides solutions and answers behind a glassmorphic *"Reveal Solution"* button to encourage active recall before viewing the answer. |
| **`review`** | **Review** | **Unmastered Filter Mode**: Dynamically filters the active dataset to display only questions that have **not** been rated as `Done`, displaying remaining progress. |
| **`rapid_fire`** | **Rapid Fire** | **High-Impact Q&A Mode**: Isolates and displays the short, punchy kill-shot Q&As associated with the current scenario. |
| **`follow_up`** | **Follow-Up** | **Deep-Dive Grilling Mode**: Displays the 5–6 stress-test follow-up questions likely to be asked by senior interviewers after the initial answer. |
| **`glossary`** | **Glossary** | **Interactive Reference Mode**: Opens the 524-keyword DevOps & SRE interactive glossary drawer with cross-referenced slide links (`mentionedIn`). |
| **`flashcards`** | **Flashcards** | **Active Recall Mode**: Flips through all 524 terms sequentially with front/back card animations and Easy/Medium/Hard self-ratings. |

---

## 3. Auto-Hiding Navigation Bar & Anti-Flicker Engine

To maximize vertical reading space on smaller laptops and mobile screens while retaining instant accessibility, the header (`#header`) uses a responsive auto-hiding engine:

1. **Inactivity & Scroll Collapse**:
   - The navigation bar auto-collapses (`max-height: 0px`, `opacity: 0`) after **2.2 seconds** of mouse/scroll inactivity or immediately when scrolling downwards past `scrollY > 80px`.
2. **Top-Quarter Re-emergence Zone**:
   - Scrolling upwards deep inside a long slide (`scrollY > 28%` of window height) will not distractingly trigger header expansion. The header only auto-reappears when scrolling up within the **top 28% of the viewport** or when hovering near the top edge.
3. **Anti-Flicker Lock (`isNavTransitioning`)**:
   - A `450ms` debounce transition lock prevents layout shift events during collapse/expand from triggering synthetic scroll loops.
4. **Pin Lock Toggle (`#nav-pin-toggle`)**:
   - Located at `top: 14px; right: 24px`.
   - **`🔓` Unlocked (Default)**: Auto-hide enabled.
   - **`🔒` Locked**: Locks the header permanently open (`isNavPinned = true`), glowing in primary accent color.

---

## 4. Multi-Dataset Switcher & State Isolation

The dashboard loads multiple independent JSON databases via the **Interviews** navigation dropdown (`selectDataset(datasetKey)`):

```javascript
const DATASET_CONFIG = {
    'infinite_locus':           { file: 'infinite_locus.json',           name: 'Infinite Locus JD Prep (48 Q&A)' },
    'infinite_locus_interview': { file: 'infinite_locus_interview.json', name: 'Infinite Locus Interview (28 Q&A)' },
    'infra_azure':              { file: 'infra_azure.json',              name: 'Azure Infra JD-Aligned (29 Q&A)' },
    'hexaview_r1':              { file: 'hexaview_r1.json',              name: 'Hexaview Round 1 (16 Q&A)' },
    'hexaview_r2':              { file: 'hexaview_r2.json',              name: 'Hexaview Round 2 (18 Q&A)' },
    'noventiq_r1':              { file: 'noventiq_r1.json',              name: 'Noventiq Round 1 (8 Q&A)' },
    'merged':                   { file: 'merged.json',                   name: '📦 All Questions (254 Q&A)' }
};
```

### State Isolation Architecture:
- **Slide Persistence**: Last viewed slide index is saved per dataset (`last_slide_index_<dataset>`).
- **Confidence Rating Isolation**: Each dataset stores its own completion statuses (`done`, `review`, `revisit`) under segregated `localStorage` keys (`getStorageKeyForDataset()`).

---

## 5. Dual-Mode Indexing System (`#index-modal`)

Clicking the slide counter pill (`#counter` — e.g., *"Question 5 of 48 ▼"*) opens the **Scenario Index Modal** (`z-index: 100000`). The indexing system offers two distinct organizational views:

```
┌────────────────────────────────────────────────────────────────────────┐
│ [Recently Viewed Strip]:  Coforge Q0211 | AKS Node Pools | Terraform   │
├────────────────────────────────────────────────────────────────────────┤
│ [Toggle: 📋 Category View  |  ≡ List View]      [Filter: All / Done]   │
├────────────────────────────────────────────────────────────────────────┤
│  CATEGORY VIEW CARD (C001 - CI/CD & Azure DevOps Pipeline Mastery)     │
│  [Rank #1]  [🟢 6 Done | 🟠 2 Review | 🟡 0 Revisit]  [==== 75% ====]  │
│  ├── Q0211: Continuous Integration vs Continuous Delivery        [🟢]  │
│  ├── Q0212: Azure DevOps Library — Variable Groups & Secrets     [🟢]  │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Category View (`renderCategoryIndex()`)
- **Hierarchical Clustering**: Groups slides by their Category ID (`C001` through `C017` defined in `category_config.json`).
- **Domain Priority Badging**: Displays priority badges (`#1`, `#2`, etc.) indicating which engineering domains carry the highest interview weight.
- **3-Segment Visual Progress Bar**: Each category card renders a multi-segment progress bar showing exact ratios of `Done` (green), `Review` (orange), and `Revisit` (yellow).
- **Collapsible Cards**: Clicking a category header collapses or expands the domain (`devops_expanded_categories` saved in `localStorage`).

### 5.2 Flat List View (`renderFlatIndex()`)
- Displays all questions sequentially (`1` to `N`) with slide numbering, difficulty tags, and quick-action status badges.

### 5.3 Instant 1-Click Status Indexing
- In both Category and List index views, every question row displays a status circle (`⚪` unrated or `🟢` done).
- **Inline Toggling**: Clicking the status circle inside the index modal toggles the question between Unrated and Done *without* navigating away from the index.

---

## 6. Cross-Dataset Recently Viewed History Strip

Located at the top of the Index Modal (`renderRecentlyViewedPanel()`), the history strip tracks the user's last **6 viewed questions across all datasets**:

- **Data Structure**:
  ```javascript
  // Stored in localStorage key: 'devops_recently_viewed'
  [
    { dataset: 'infinite_locus', index: 4,  title: 'CI vs CD — Pipeline Ownership' },
    { dataset: 'infra_azure',    index: 12, title: 'AKS VNet Integration & CNI' }
  ]
  ```
- **Cross-Dataset Jumping**: Clicking a recently viewed badge automatically calls `selectDataset(datasetKey)` if needed and jumps immediately to `currentIndex = index`.

---

## 7. Global Search & Keyword Routing Engine

- **Floating Search Trigger**: Accessible via `#floating-search-bar` (`top: 64px; right: 24px`).
- **Live Search Index**: Indexing scans across question titles, category labels, tags (`chips`), real-world scenarios, definitions, and interview kill shots.
- **Instant Navigation**: Clicking any search result instantly closes the search overlay and routes the dashboard to the matched slide.

---

## 8. Keyboard Navigation Shortcuts

The dashboard supports full keyboard-driven navigation for rapid studying:

| Key Shortcut | Action |
| :--- | :--- |
| **`ArrowRight`** / **`j`** | Next Slide (`nextSlide()`) |
| **`ArrowLeft`** / **`k`** | Previous Slide (`prevSlide()`) |
| **`f`** | Toggle Full-Screen Mode |
| **`Escape`** | Close Index Modal, Search Modal, or Glossary Drawer |
