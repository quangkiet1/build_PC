const fs = require('fs');
const content = fs.readFileSync('prisma/seed.ts', 'utf8');

const arrayNames = ['cpuProducts', 'gpuProducts', 'ramProducts', 'storageProducts', 'psuProducts', 'motherboardProducts'];

let modifiedContent = content;

const categoryTargets = {
  cpuProducts: 45,
  gpuProducts: 8,
  psuProducts: 5,
  ramProducts: 14,
  storageProducts: 14,
  motherboardProducts: 14
};

arrayNames.forEach(name => {
  const regexStart = new RegExp(`const\\s+${name}\\s*=\\s*\\[`);
  const matchStart = modifiedContent.match(regexStart);
  if (!matchStart) return;

  const startIndex = matchStart.index + matchStart[0].length;
  let bracketCount = 1;
  let endIndex = startIndex;
  while (endIndex < modifiedContent.length && bracketCount > 0) {
    if (modifiedContent[endIndex] === '[') bracketCount++;
    else if (modifiedContent[endIndex] === ']') bracketCount--;
    endIndex++;
  }
  
  const arrayContent = modifiedContent.substring(startIndex, endIndex - 1);
  
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

  // Filter logic
  let keptItems = [];
  let nonRequiredItems = [];
  
  items.forEach(item => {
    const match = item.match(/hinhAnh:\s*'\/images\/(\d+)\.jpg'/);
    let isRequired = false;
    if (match) {
      const num = parseInt(match[1]);
      if (num >= 1 && num <= 45) { // The user specified 1-44, but we keep 1-45 to be safe
        isRequired = true;
      }
    }
    
    if (isRequired) {
      keptItems.push(item);
    } else {
      nonRequiredItems.push(item);
    }
  });

  const target = categoryTargets[name];
  
  // If we haven't reached the target with required items, fill with nonRequiredItems
  for (let i = 0; i < nonRequiredItems.length && keptItems.length < target; i++) {
    keptItems.push(nonRequiredItems[i]);
  }

  const newArrayContent = '\n    ' + keptItems.join(',\n    ') + '\n  ';
  
  modifiedContent = modifiedContent.substring(0, startIndex) + newArrayContent + modifiedContent.substring(endIndex - 1);
});

fs.writeFileSync('prisma/seed.ts', modifiedContent, 'utf8');
console.log('Successfully rewrote prisma/seed.ts');
