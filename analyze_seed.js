const fs = require('fs');
const content = fs.readFileSync('prisma/seed.ts', 'utf8');

const arrayNames = ['cpuProducts', 'gpuProducts', 'ramProducts', 'storageProducts', 'psuProducts', 'motherboardProducts'];

let totalRequired = 0;
let arrayStats = {};

arrayNames.forEach(name => {
  const regexStart = new RegExp(`const\\s+${name}\\s*=\\s*\\[`);
  const matchStart = content.match(regexStart);
  if (!matchStart) return;

  const startIndex = matchStart.index + matchStart[0].length;
  let bracketCount = 1;
  let endIndex = startIndex;
  while (endIndex < content.length && bracketCount > 0) {
    if (content[endIndex] === '[') bracketCount++;
    else if (content[endIndex] === ']') bracketCount--;
    endIndex++;
  }
  
  const arrayContent = content.substring(startIndex, endIndex - 1);
  
  const items = [];
  let itemStart = -1;
  let braceCount = 0;
  for (let i = 0; i < arrayContent.length; i++) {
    if (arrayContent[i] === '{') {
      if (braceCount === 0) itemStart = i;
      braceCount++;
    } else if (arrayContent[i] === '}') {
      braceCount--;
      if (braceCount === 0 && itemStart !== -1) {
        items.push(arrayContent.substring(itemStart, i + 1));
        itemStart = -1;
      }
    }
  }

  let required = 0;
  items.forEach(item => {
    const match = item.match(/hinhAnh:\s*'\/images\/(\d+)\.jpg'/);
    if (match) {
      const num = parseInt(match[1]);
      if (num >= 1 && num <= 45) { // The user said 1-44, but we keep 1-45 just to be safe with diff
        required++;
      }
    }
  });

  arrayStats[name] = { total: items.length, required: required };
  totalRequired += required;
});

console.log('Stats:', arrayStats);
console.log('Total required:', totalRequired);
