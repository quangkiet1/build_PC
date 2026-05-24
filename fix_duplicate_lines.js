const fs = require('fs');
let content = fs.readFileSync('prisma/seed.ts', 'utf8');

// Simple lines removal
const lines = content.split('\n');
const fixedLines = [];

let inDuplicateBlock = false;
for(let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const adminEmail = \'huynhkietzuki@gmail.com\'') && i > 1340) {
    // This is the second one, we skip backwards a couple lines and skip until the end of the block.
    // Actually, just remove from line 1351 to 1371
  }
}

// Just slice the array!
// We know lines 1350-1370 (0-indexed 1349 to 1369) are the duplicate ones.
const finalLines = [...lines.slice(0, 1350), ...lines.slice(1370)];
fs.writeFileSync('prisma/seed.ts', finalLines.join('\n'), 'utf8');
console.log('Removed specific lines');
