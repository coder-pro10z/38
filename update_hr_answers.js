const fs = require('fs');
const path = require('path');

// Load hr_behavioral.json
const hrBehavioralPath = path.join(__dirname, 'hr_behavioral.json');
const hrData = JSON.parse(fs.readFileSync(hrBehavioralPath, 'utf8'));

// Build lookup map
const hrMap = {};
hrData.forEach(item => {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    hrMap[key] = item;
});

// Helper fuzzy matcher for HR titles
function findHrMatch(title) {
    const norm = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (hrMap[norm]) return hrMap[norm];

    // Substring / keyword match
    if (norm.includes('yourself')) return hrMap['tellmeaboutyourself'];
    if (norm.includes('coforge')) return hrMap['whycoforge'];
    if (norm.includes('change')) return hrMap['whyareyoulookingforachange'];
    if (norm.includes('achievement')) return hrMap['biggestachievement'];
    if (norm.includes('failure')) return hrMap['biggestfailure'];
    if (norm.includes('conflict')) return hrMap['conflictwithdevelopers'];
    if (norm.includes('deadline')) return hrMap['handlingdeadlines'];
    if (norm.includes('learning')) return hrMap['learningnewtechnologies'];
    if (norm.includes('collaboration') || norm.includes('team')) return hrMap['teamcollaboration'];
    if (norm.includes('leadership')) return hrMap['leadershipexample'];
    if (norm.includes('strength') || norm.includes('weakness')) return hrMap['strengthsandweaknesses'];

    return null;
}

// Read infinite_locus.json
const infPath = path.join(__dirname, 'infinite_locus.json');
const infScenarios = JSON.parse(fs.readFileSync(infPath, 'utf8'));

let updatedCount = 0;

infScenarios.forEach(item => {
    const hrMatch = findHrMatch(item.title);
    if (hrMatch) {
        updatedCount++;
        const answerLines = hrMatch.data.answer || [];

        item.categoryId = "C015";
        item.type = "HR / Behavioral";
        item.difficulty = hrMatch.difficulty || "Core";
        item.chips = ["Coforge", "Behavioral", "HR", "Anam Ansari", "Azure DevOps"];
        item.company = "Coforge - Anam Ansari";

        item.definition = answerLines[0] || `Authentic behavioral response for: ${item.title}`;
        item.why_it_matters = `Demonstrates professional maturity, clear communication, engineering ownership, and cultural alignment with Coforge values.`;
        item.real_world_scenario = `During an interview with Coforge for an Azure DevOps Engineer position (2+ years experience), presenting a structured, authentic response to '${item.title}' builds trust and highlights practical engineering competence.`;

        item.architecture_flow = {
            steps: answerLines.map((line, idx) => `Point ${idx + 1}: ${line}`),
            diagram: `Interview Prompt (${item.title}) ──[ STAR Structure ]──> Professional Evidence ──> Strong Alignment with Coforge`
        };

        item.interview_answer = {
            response: answerLines,
            why: `Interviewers evaluate not only technical aptitude but also ownership, self-awareness, teamwork, and genuine motivation for joining Coforge.`
        };

        item.interview_kill_shot = answerLines[answerLines.length - 1] || `Ownership, continuous learning, and teamwork are the pillars of my DevOps engineering philosophy.`;
    }
});

fs.writeFileSync(infPath, JSON.stringify(infScenarios, null, 2), 'utf8');
console.log(`Successfully updated ${updatedCount} HR/Behavioral questions in infinite_locus.json using hr_behavioral.json!`);
