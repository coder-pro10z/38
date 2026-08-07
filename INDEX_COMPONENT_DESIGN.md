# 🧩 Scenario Index Component Design Document

This document provides a comprehensive design specification and technical blueprint for rebuilding the **Dual-Mode Scenario Index (`#index-modal`)** in a modern component-based framework (e.g., React, Vue, Svelte, or Next.js) or refactoring the existing Vanilla JS implementation.

---

## 1. Component Architecture

The Index Modal is composed of **4 primary sub-components**:

1. **`IndexModalWrapper`**: The dark, glassmorphic overlay (`.modal-overlay`) and container (`.modal-content`) that traps focus and handles closing.
2. **`IndexHeader`**: Contains the title, Dual-Mode Toggle Buttons (`Category` / `List`), Expand All button, Search Input, and the **Overall Mastery Progress Bar**.
3. **`RecentlyViewedStrip`**: A horizontal pill list of up to 6 recently viewed questions across datasets.
4. **`IndexBody` (Conditional Render)**:
   - **`CategoryView`**: Renders a grid of `CategoryCard` components.
   - **`FlatListView`**: Renders a simple, sequentially numbered list of `QuestionItem` components.

---

## 2. State Management (Data Models)

To rebuild this component, your state manager (e.g., Redux, Zustand, React Context) must expose the following state:

| State Variable | Type | Description |
| :--- | :--- | :--- |
| `isIndexOpen` | `boolean` | Controls modal visibility. |
| `indexMode` | `'category' | 'flat'` | Toggles between Category Cards and Flat List views. |
| `indexSearchQuery` | `string` | The active filter string typed into the index search bar. |
| `expandedCategories` | `string[]` | Array of category IDs (e.g., `['C001', 'C005']`) that are currently un-collapsed. |
| `scenarios` | `Array<Scenario>` | The currently loaded dataset questions. |
| `ratings` | `Record<index, 'done'|'review'|'revisit'>` | The active dataset's confidence ratings. |
| `recentlyViewed` | `Array<HistoryItem>` | The global cross-dataset recently viewed list (from `localStorage`). |

---

## 3. DOM Structure & CSS Classes (JSX Blueprint)

Use the following semantic structure and CSS class names to retain the exact styling and glassmorphic look of the application.

### 3.1. Wrapper & Header
```jsx
<div className="modal-overlay" style={{ display: isIndexOpen ? 'flex' : 'none' }}>
  <div className="modal-content">
    
    {/* Header Controls */}
    <div className="modal-header">
      <h2>Scenario Index</h2>
      
      {/* Mode Toggle */}
      <div className="index-mode-toggle">
        <button className={`index-mode-btn ${indexMode === 'category' ? 'active' : ''}`}>📋 Category</button>
        <button className={`index-mode-btn ${indexMode === 'flat' ? 'active' : ''}`}>≡ List</button>
      </div>

      {/* Search Input */}
      <div className="index-search-container">
        <span>🔍</span>
        <input type="text" placeholder="Search questions..." />
      </div>

      {/* Overall Progress */}
      <div className="overall-index-progress">
        <div className="overall-progress-text">
           <span>Mastery Progress</span>
           <strong>120 / 254 (47%)</strong>
        </div>
        <div className="overall-progress-track">
           <div className="overall-progress-fill" style={{ width: '47%' }}></div>
        </div>
      </div>
      
      <button className="btn-close">✕</button>
    </div>

    {/* Recently Viewed Strip */}
    <div className="recently-viewed-panel">
       {/* Map recently viewed pills here */}
    </div>

    {/* Body Rendering */}
    { indexMode === 'category' ? <CategoryView /> : <FlatListView /> }
    
  </div>
</div>
```

### 3.2. Category Card Component (`CategoryView`)
```jsx
// A single Category Card (e.g., C001 - CI/CD Pipeline Mastery)
<div className={`cat-card ${isExpanded ? 'expanded' : ''} ${isEmpty ? 'empty-cat' : ''}`}>
  
  {/* Category Header (Click to expand) */}
  <div className="cat-header" onClick={toggleExpand}>
    <div className="cat-header-top">
      <div className="cat-title">
        <span>{category.name}</span>
        <span className="cat-priority-badge">#{category.priority}</span>
      </div>
      <span className="cat-stats">{doneCount}/{totalCount} Done</span>
    </div>
    
    {/* 3-Segment Progress Bar */}
    <div className="cat-progress-bar">
       <div className="cat-progress-segment done" style={{ width: `${pctDone}%` }}></div>
       <div className="cat-progress-segment review" style={{ width: `${pctReview}%` }}></div>
       <div className="cat-progress-segment revisit" style={{ width: `${pctRevisit}%` }}></div>
    </div>
  </div>

  {/* Category Content (The Questions) */}
  <div className="cat-content">
    {questions.map(q => (
      <div className="cat-q-item" key={q.id}>
        <div className="cat-q-title">
           <span className="cat-q-num">{q.displayIndex}.</span> {q.title}
        </div>
        {/* Instant Status Toggle Button */}
        <span className="status-toggle-btn">
           {q.rating === 'done' ? '🟢' : (q.rating === 'review' ? '🟠' : (q.rating === 'revisit' ? '🟡' : '⚪'))}
        </span>
      </div>
    ))}
  </div>
</div>
```

---

## 4. Required CSS Design Tokens

If migrating to Tailwind or styled-components, map your styles to these design tokens existing in `index.html`:

* **Backgrounds**: `var(--surface-1)` (Deep dark), `var(--surface-2)` (Card background), `var(--surface-3)` (Hover states).
* **Borders**: `var(--border)` (`#334155` or `rgba(255,255,255,0.1)`).
* **Text**: `var(--text-primary)` (White/Light Grey), `var(--text-muted)` (Darker Grey).
* **Status Colors (Crucial for Progress Bars)**:
  * Done (`.done`): `var(--status-success)` (`#34D399`)
  * Review (`.review`): `var(--status-warning)` (`#FBBF24`)
  * Revisit (`.revisit`): `var(--status-error)` (`#F87171`)
* **Glassmorphism Overlay (`.modal-overlay`)**:
  * `background: rgba(15, 23, 42, 0.85);`
  * `backdrop-filter: blur(8px);`

---

## 5. Core JS Rendering & Metrics Logic

When calculating metrics for the `CategoryCard` progress bars, group the scenarios by `categoryId` and calculate percentages.

```javascript
// Pseudo-logic for grouping and metric calculation
function getCategoryMetrics(categoryId, scenarios, ratings) {
    const items = scenarios.filter(s => s.categoryId === categoryId);
    const totalCount = items.length;
    
    let doneCount = 0, reviewCount = 0, revisitCount = 0;
    
    items.forEach(item => {
        const rating = ratings[item.index];
        if (rating === 'done') doneCount++;
        else if (rating === 'review') reviewCount++;
        else if (rating === 'revisit') revisitCount++;
    });

    return {
        totalCount,
        doneCount,
        pctDone: totalCount > 0 ? (doneCount / totalCount) * 100 : 0,
        pctReview: totalCount > 0 ? (reviewCount / totalCount) * 100 : 0,
        pctRevisit: totalCount > 0 ? (revisitCount / totalCount) * 100 : 0
    };
}
```

### Search Filtering Implementation
When `indexSearchQuery` is active:
1. Filter `scenarios` by checking matches across `title`, `tags`, `interview_kill_shot`, and `definition`.
2. Expand ALL category cards (`isExpanded = true`).
3. Hide any `CategoryCard` where `matchedQuestions.length === 0`.
4. Inject `<mark>` tags around the matched substrings for visual highlighting inside `.cat-q-title` or `.index-match-snippet`.
