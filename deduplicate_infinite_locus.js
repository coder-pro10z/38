const fs = require('fs');
const path = require('path');

const infPath = path.join(__dirname, 'infinite_locus.json');
const infScenarios = JSON.parse(fs.readFileSync(infPath, 'utf8'));

infScenarios.forEach(item => {
    if (item.id === 'Q0207') {
        item.title = "Tell me about yourself — Technical Introduction (Azure DevOps & AKS)";
        item.definition = "Technical introduction structuring your 2+ years of DevOps engineering experience, Azure infrastructure automation, CI/CD pipelines, and Terraform expertise.";
    } else if (item.id === 'Q0240') {
        item.title = "Tell me about yourself — HR Interview & Career Roadmap (Coforge)";
        item.definition = "Behavioral self-introduction highlighting your background, collaboration strengths, engineering mindset, and motivations for applying to Coforge.";
    } else if (item.id === 'Q0212') {
        item.title = "Azure DevOps Library — Variable Groups & Secret Management";
        item.definition = "Using Azure DevOps Library Variable Groups to manage non-sensitive configuration values across YAML pipeline environments.";
    } else if (item.id === 'Q0214') {
        item.title = "Azure DevOps Library — Secure Files & Key Vault Integration";
        item.definition = "Managing certificates, SSH keys, and dynamic secrets in Azure DevOps pipelines using Secure Files and Azure Key Vault integration.";
    }
});

fs.writeFileSync(infPath, JSON.stringify(infScenarios, null, 2), 'utf8');
console.log('Successfully deduplicated titles in infinite_locus.json!');
