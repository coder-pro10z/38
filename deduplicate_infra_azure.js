const fs = require('fs');
const path = require('path');

const infraPath = path.join(__dirname, 'infra_azure.json');
const infraScenarios = JSON.parse(fs.readFileSync(infraPath, 'utf8'));

infraScenarios.forEach(item => {
    if (item.id === 'Q0185') {
        item.title = "User Defined Routes (UDR) — Custom Subnet Routing & BGP Override";
    } else if (item.id === 'Q0205') {
        item.title = "Azure FinOps — Enterprise Resource Tagging & Cost Management";
    }
});

fs.writeFileSync(infraPath, JSON.stringify(infraScenarios, null, 2), 'utf8');
console.log('Successfully deduplicated titles in infra_azure.json!');
