const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = [
    'scenarios.json',
    'hexaview_r1.json',
    'hexaview_r2.json',
    'noventiq_r1.json',
    'infra_azure.json',
    'infinite_locus.json'
];

function classifyQuestion(item, idx, filename) {
    const title = (item.title || '').toLowerCase();
    const type = (item.type || '').toLowerCase();
    const text = JSON.stringify(item).toLowerCase();

    // Special exact / index checks
    if (filename === 'scenarios.json' && idx >= 105 && idx <= 134) {
        return 'C016'; // Python / Scripting
    }
    if (title.includes('faq master reference')) {
        return 'C017'; // Reference
    }
    if (title.includes('python') || type.includes('python') || title.includes('scripting')) {
        return 'C016';
    }
    if (title.includes('terraform') || title.includes('tfstate') || title.includes('hcl') || title.includes('module')) {
        return 'C004';
    }
    if (title.includes('kubernetes') || title.includes('aks') || title.includes('k8s') || title.includes('pod') || title.includes('helm') || title.includes('ingress') || title.includes('kubectl') || title.includes('taint') || title.includes('toleration') || title.includes('deployment failing')) {
        return 'C006';
    }
    if (title.includes('docker') || title.includes('dockerfile') || title.includes('container') || title.includes('image')) {
        return 'C005';
    }
    if (title.includes('azure devops') || title.includes('ado ') || title.includes('work item') || title.includes('azure board')) {
        return 'C003';
    }
    if (title.includes('jenkins')) {
        return 'C010';
    }
    if (title.includes('ci/cd') || title.includes('pipeline') || title.includes('release') || title.includes('artifact') || title.includes('deployment')) {
        return 'C002';
    }
    if (title.includes('git ') || title.includes('git:') || title.includes('rebase') || title.includes('merge') || title.includes('branching')) {
        return 'C009';
    }
    if (title.includes('monitor') || title.includes('logging') || title.includes('prometheus') || title.includes('grafana') || title.includes('log analytics') || title.includes('alert')) {
        return 'C011';
    }
    if (title.includes('network') || title.includes('vnet') || title.includes('dns') || title.includes('subnet') || title.includes('nsg') || title.includes('firewall') || title.includes('vpn') || title.includes('load balancer') || title.includes('gateway')) {
        return 'C012';
    }
    if (title.includes('security') || title.includes('devsecops') || title.includes('key vault') || title.includes('rbac') || title.includes('iam') || title.includes('secret') || title.includes('vulnerability') || title.includes('sonarqube')) {
        return 'C013';
    }
    if (title.includes('linux') || title.includes('bash') || title.includes('shell') || title.includes('chmod') || title.includes('systemd') || title.includes('inode') || title.includes('process') || title.includes('cpu') || title.includes('memory') || title.includes('disk')) {
        return 'C008';
    }
    if (title.includes('azure') || title.includes('vm ') || title.includes('resource group') || title.includes('subscription') || title.includes('storage account') || title.includes('acr') || title.includes('app service')) {
        return 'C007';
    }
    if (title.includes('introduction') || title.includes('project') || title.includes('architecture') || title.includes('overview') || title.includes('role') || title.includes('day to day') || title.includes('responsibilit')) {
        return 'C001';
    }
    if (title.includes('hr') || title.includes('behavioral') || title.includes('tell me about yourself') || title.includes('strength') || title.includes('weakness') || title.includes('conflict')) {
        return 'C015';
    }
    // Secondary check in full text if still unclassified
    if (text.includes('terraform')) return 'C004';
    if (text.includes('kubernetes') || text.includes('aks')) return 'C006';
    if (text.includes('docker')) return 'C005';
    if (text.includes('ci/cd') || text.includes('pipeline')) return 'C002';

    return 'C014'; // Scenario-Based fallback
}

let globalCounter = 1;
let stats = {};

files.forEach(file => {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) return;
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);

    data.forEach((item, idx) => {
        const qId = 'Q' + String(globalCounter++).padStart(4, '0');
        item.id = qId;
        item.categoryId = classifyQuestion(item, idx, file);

        stats[item.categoryId] = (stats[item.categoryId] || 0) + 1;
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Tagged ${data.length} questions in ${file}`);
});

console.log('Category breakdown across all datasets:');
console.table(stats);

// Re-run merge logic to update merged.json with the new tags
require('./merge_datasets.js');
