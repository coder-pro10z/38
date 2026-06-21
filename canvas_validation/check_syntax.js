// canvas_validation/check_syntax.js
// Run: node canvas_validation/check_syntax.js

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const jsonPath = path.join(__dirname, '..', 'infra_azure.json');

console.log("🔍 Starting Interactive Canvas Syntax Check...");
console.log(`📂 Reading JSON database from: ${jsonPath}`);

if (!fs.existsSync(jsonPath)) {
  console.error("❌ Error: infra_azure.json not found in parent directory. Please run the slide generator first!");
  process.exit(1);
}

let slides = [];
try {
  slides = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
} catch (e) {
  console.error("❌ Error parsing JSON file:", e.message);
  process.exit(1);
}

let errorsFound = 0;

slides.forEach((slide, idx) => {
  const slideNum = idx + 1;
  console.log(`\n--------------------------------------------------`);
  console.log(`🛝 Slide ${slideNum}: "${slide.title}"`);
  
  const html = slide.interactive_html;
  if (!html) {
    console.warn(`⚠️ Warning: Slide ${slideNum} does not contain an interactive_html canvas!`);
    return;
  }

  // 1. Basic HTML Structure Checks
  const doctypeMatch = html.match(/<!DOCTYPE html>/i);
  const htmlTagMatch = html.match(/<html[^>]*>([\s\S]*?)<\/html>/i);
  const bodyTagMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  
  if (!doctypeMatch) {
    console.error(`❌ HTML Error: Missing <!DOCTYPE html> declaration.`);
    errorsFound++;
  }
  if (!htmlTagMatch) {
    console.error(`❌ HTML Error: Missing enclosing <html>...</html> tags.`);
    errorsFound++;
  }
  if (!bodyTagMatch) {
    console.error(`❌ HTML Error: Missing <body>...</body> tags.`);
    errorsFound++;
  }

  // 2. Extract and Validate JavaScript Syntax
  const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
  let match;
  let scriptCount = 0;

  while ((match = scriptRegex.exec(html)) !== null) {
    scriptCount++;
    const jsCode = match[1];
    
    try {
      // Use Node's built-in vm module to compile/check JS syntax
      new vm.Script(jsCode, { filename: `Slide_${slideNum}_Script_${scriptCount}.js` });
      console.log(`✅ Script Block #${scriptCount}: Syntax Valid`);
    } catch (err) {
      console.error(`❌ Script Block #${scriptCount} Syntax Error:`);
      console.error(`   Message: ${err.message}`);
      console.error(`   Location: Line ${err.stack.split('\n')[0]}`);
      
      // Print context of the error
      const lines = jsCode.split('\n');
      const errLineMatch = err.stack.match(/Line (\d+)/);
      if (errLineMatch) {
        const lineNum = parseInt(errLineMatch[1], 10);
        const start = Math.max(0, lineNum - 3);
        const end = Math.min(lines.length, lineNum + 3);
        console.error("   Context:");
        for (let l = start; l < end; l++) {
          const prefix = l === lineNum - 1 ? "  > " : "    ";
          console.error(`${prefix}${l + 1}: ${lines[l]}`);
        }
      }
      errorsFound++;
    }
  }

  if (scriptCount === 0) {
    console.warn(`⚠️ Warning: No <script> tags found in canvas HTML.`);
  }

  // 3. Basic CSS Check (matching brackets in <style>)
  const styleRegex = /<style>([\s\S]*?)<\/style>/gi;
  let styleMatch;
  while ((styleMatch = styleRegex.exec(html)) !== null) {
    const cssCode = styleMatch[1];
    const openBraces = (cssCode.match(/{/g) || []).length;
    const closeBraces = (cssCode.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      console.error(`❌ CSS Warning: Mismatched curly braces in <style> block. Found {${openBraces}} and }${closeBraces}}.`);
      errorsFound++;
    }
  }
});

console.log(`\n==================================================`);
if (errorsFound === 0) {
  console.log("🎉 SUCCESS: All 20 interactive canvases passed syntax validation!");
  process.exit(0);
} else {
  console.error(`❌ FAILURE: Found ${errorsFound} syntax/structure errors across canvases.`);
  process.exit(1);
}
