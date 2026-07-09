const fs = require('fs');
const path = require('path');

// Load existing 206 questions
const mergedPath = path.join(__dirname, 'merged.json');
const mergedScenarios = JSON.parse(fs.readFileSync(mergedPath, 'utf8'));

// Load category config
const categoryConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'category_config.json'), 'utf8'));
const categoryMapById = {};
categoryConfig.forEach(c => categoryMapById[c.id] = c.name);

// Category mapping helper from heading text to Category ID
function mapHeadingToCategory(heading) {
    const h = heading.toLowerCase();
    if (h.includes('introduction') || h.includes('project experience')) return { id: 'C001', name: 'Introduction & Project' };
    if (h.includes('ci/cd') || h.includes('pipeline')) return { id: 'C002', name: 'CI/CD Pipelines' };
    if (h.includes('azure devops')) return { id: 'C003', name: 'Azure DevOps' };
    if (h.includes('terraform') || h.includes('infrastructure as code')) return { id: 'C004', name: 'Terraform' };
    if (h.includes('docker')) return { id: 'C005', name: 'Docker' };
    if (h.includes('kubernetes') || h.includes('aks')) return { id: 'C006', name: 'Kubernetes / AKS' };
    if (h.includes('azure cloud') || h.includes('azure service')) return { id: 'C007', name: 'Azure Services' };
    if (h.includes('linux')) return { id: 'C008', name: 'Linux' };
    if (h.includes('git')) return { id: 'C009', name: 'Git' };
    if (h.includes('jenkins')) return { id: 'C010', name: 'Jenkins' };
    if (h.includes('monitoring') || h.includes('logging')) return { id: 'C011', name: 'Monitoring & Logging' };
    if (h.includes('networking')) return { id: 'C012', name: 'Networking' };
    if (h.includes('security') || h.includes('devsecops')) return { id: 'C013', name: 'Security / DevSecOps' };
    if (h.includes('behavioral') || h.includes('hr')) return { id: 'C015', name: 'HR / Behavioral' };
    if (h.includes('scenario')) return { id: 'C014', name: 'Scenario-Based' };
    if (h.includes('basic knowledge')) return { id: 'C014', name: 'Scenario-Based' };
    return { id: 'C014', name: 'Scenario-Based' };
}

// Tokenize text for similarity comparison
function tokenize(text) {
    return text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !['the', 'and', 'for', 'with', 'what', 'how', 'why', 'explain', 'describe', 'about', 'your'].includes(w));
}

// Check matching against existing 206 questions
function findBestMatch(questionText, categoryId) {
    const qTokens = tokenize(questionText);
    if (qTokens.length === 0) return null;

    let bestMatch = null;
    let bestScore = 0;

    mergedScenarios.forEach((s) => {
        const titleTokens = tokenize(s.title || '');
        const chipTokens = tokenize((s.chips || []).join(' '));
        const allTokens = new Set([...titleTokens, ...chipTokens]);

        // Calculate overlap
        let matchCount = 0;
        qTokens.forEach(t => {
            if (allTokens.has(t)) matchCount++;
        });

        const score = matchCount / Math.max(qTokens.length, 1);

        // Also boost if exact substring match in title
        const normQ = questionText.toLowerCase().trim();
        const normTitle = (s.title || '').toLowerCase().trim();
        let finalScore = score;
        if (normTitle.includes(normQ) || normQ.includes(normTitle)) {
            finalScore = Math.max(finalScore, 0.85);
        }

        if (finalScore > bestScore && finalScore >= 0.5) {
            bestScore = finalScore;
            bestMatch = {
                id: s.id,
                title: s.title,
                score: parseFloat(finalScore.toFixed(2))
            };
        }
    });

    return bestMatch;
}

// Read Infinite_LOCUS.md
const locusMdPath = path.join(__dirname, 'Infra', 'Infinite_LOCUS.md');
const mdContent = fs.readFileSync(locusMdPath, 'utf8');
const lines = mdContent.split(/\r?\n/);

let currentPriority = 1;
let currentCategory = { id: 'C001', name: 'Introduction & Project' };

const extractedQuestions = [];

lines.forEach((line) => {
    const trimmed = line.trim();

    // Check Priority Headers
    if (trimmed.startsWith('# Priority 1')) currentPriority = 1;
    else if (trimmed.startsWith('# Priority 2')) currentPriority = 2;
    else if (trimmed.startsWith('# Priority 3')) currentPriority = 3;
    else if (trimmed.startsWith('# Priority 4')) currentPriority = 4;
    else if (trimmed.startsWith('# Priority 5')) currentPriority = 5;

    // Check Category Headings
    if (trimmed.startsWith('## ')) {
        const headingText = trimmed.replace(/^##\s+/, '');
        currentCategory = mapHeadingToCategory(headingText);
    }

    // Extract Bullet Questions/Topics
    if (trimmed.startsWith('* ')) {
        const qText = trimmed.replace(/^\*\s+/, '').replace(/\.$/, '').trim();
        if (qText.length < 3) return;

        const bestMatch = findBestMatch(qText, currentCategory.id);
        const status = bestMatch ? 'already_present' : 'new_pending_answer';

        const record = {
            id: `LOCUS-${String(extractedQuestions.length + 1).padStart(3, '0')}`,
            question: qText,
            categoryId: currentCategory.id,
            categoryName: currentCategory.name,
            priority: currentPriority,
            company: "Coforge - Infinite Locus",
            status: status
        };

        if (bestMatch) {
            record.matchedQId = bestMatch.id;
            record.matchedTitle = bestMatch.title;
            record.matchScore = bestMatch.score;
        }

        extractedQuestions.push(record);
    }
});

// Build statistics & mapper file
const alreadyPresentCount = extractedQuestions.filter(q => q.status === 'already_present').length;
const newPendingCount = extractedQuestions.filter(q => q.status === 'new_pending_answer').length;

const mapperData = {
    metadata: {
        source: "Infra/Infinite_LOCUS.md",
        company: "Coforge - Infinite Locus",
        totalExtracted: extractedQuestions.length,
        alreadyPresentCount: alreadyPresentCount,
        newPendingAnswerCount: newPendingCount,
        generatedAt: new Date().toISOString()
    },
    mapping: extractedQuestions.map(q => ({
        locusId: q.id,
        question: q.question,
        category: q.categoryName,
        priority: q.priority,
        company: q.company,
        status: q.status,
        matchedQId: q.matchedQId || null,
        matchedTitle: q.matchedTitle || null,
        matchScore: q.matchScore || null
    }))
};

fs.writeFileSync(path.join(__dirname, 'infinite_locus_mapper.json'), JSON.stringify(mapperData, null, 2));
fs.writeFileSync(path.join(__dirname, 'infinite_locus_questions.json'), JSON.stringify(extractedQuestions, null, 2));

console.log(`Successfully extracted ${extractedQuestions.length} questions from Infinite_LOCUS.md`);
console.log(` -> Already present in index (merged.json): ${alreadyPresentCount}`);
console.log(` -> New / pending answer: ${newPendingCount}`);
console.log(`Outputs written to infinite_locus_mapper.json and infinite_locus_questions.json`);
