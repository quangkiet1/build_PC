const fs = require('fs');
let content = fs.readFileSync('prisma/seed.ts', 'utf8');

// There are multiple copies of "Tạo user admin" block. Let's keep only the first one.
const regex = /\/\/ Tạo user admin nếu chưa tồn tại[\s\S]+?console\.log\(`✅ Updated admin role:[^\n]+\n}/g;
const matches = content.match(regex);

if (matches && matches.length > 1) {
  // Keep the first match, remove all others
  let firstMatchFound = false;
  content = content.replace(regex, (match) => {
    if (!firstMatchFound) {
      firstMatchFound = true;
      return match;
    }
    return '';
  });
  
  fs.writeFileSync('prisma/seed.ts', content, 'utf8');
  console.log('Removed duplicate admin block.');
} else {
  console.log('No duplicates found.');
}
