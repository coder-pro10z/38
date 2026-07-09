const fs = require('fs');
const path = require('path');

const dir = __dirname;
const datasets = [
    { name: 'default', file: 'scenarios.json' },
    { name: 'hexaview_r1', file: 'hexaview_r1.json' },
    { name: 'hexaview_r2', file: 'hexaview_r2.json' },
    { name: 'noventiq_r1', file: 'noventiq_r1.json' },
    { name: 'infra_azure', file: 'infra_azure.json' },
    { name: 'infinite_locus', file: 'infinite_locus.json' }
];

let merged = [];
let displayIndex = 1;

datasets.forEach(ds => {
    const filePath = path.join(dir, ds.file);
    if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        try {
            const data = JSON.parse(raw);
            data.forEach((item, idx) => {
                const entry = Object.assign({}, item);
                entry.sourceDataset = ds.name;
                entry.sourceIndex = idx;
                entry.displayIndex = displayIndex++;
                merged.push(entry);
            });
            console.log(`Loaded ${data.length} entries from ${ds.file} (${ds.name})`);
        } catch (e) {
            console.error(`Error parsing ${ds.file}:`, e.message);
        }
    } else {
        console.warn(`File not found: ${ds.file}`);
    }
});

const outPath = path.join(dir, 'merged.json');
fs.writeFileSync(outPath, JSON.stringify(merged, null, 2), 'utf8');
console.log(`Successfully merged ${merged.length} total entries into merged.json`);
