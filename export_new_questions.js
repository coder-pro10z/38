const fs = require('fs');
const path = require('path');

const allQuestions = JSON.parse(fs.readFileSync(path.join(__dirname, 'infinite_locus_questions.json'), 'utf8'));
const newQuestions = allQuestions.filter(q => q.status === 'new_pending_answer');

fs.writeFileSync(path.join(__dirname, 'infinite_locus_new_questions.json'), JSON.stringify(newQuestions, null, 2));

let md = '# 48 New Questions from Infinite_LOCUS.md (Pending Answers)\n\n';
newQuestions.forEach((item, i) => {
    md += `### ${i + 1}. ${item.question}\n`;
    md += `- **ID**: \`${item.id}\`\n`;
    md += `- **Category**: ${item.categoryName} (\`${item.categoryId}\`)\n`;
    md += `- **Priority**: ${item.priority}\n`;
    md += `- **Company**: ${item.company}\n\n`;
});

fs.writeFileSync(path.join(__dirname, 'infinite_locus_new_questions.md'), md);
console.log(`Successfully exported ${newQuestions.length} new questions.`);
