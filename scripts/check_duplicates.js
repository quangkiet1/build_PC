const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'prisma', 'seed.ts');
const s = fs.readFileSync(file, 'utf8');
const nameRe = /tenSanPham:\s*'([^']+)'/g;
const slugRe = /slug:\s*'([^']+)'/g;
let m;
const names = [];
const slugs = [];
while ((m = nameRe.exec(s)) !== null) names.push({v:m[1], pos: s.slice(0, m.index).split('\n').length});
while ((m = slugRe.exec(s)) !== null) slugs.push({v:m[1], pos: s.slice(0, m.index).split('\n').length});

function findDup(arr){
  const map = new Map();
  for(const item of arr){
    const key = item.v;
    if(!map.has(key)) map.set(key, []);
    map.get(key).push(item.pos);
  }
  const d = [];
  for(const [k,v] of map.entries()) if(v.length>1) d.push({k,lines:v});
  return d;
}

const dupNames = findDup(names);
const dupSlugs = findDup(slugs);

console.log('DUPLICATE tenSanPham:');
if(dupNames.length===0) console.log('  None');
else dupNames.forEach(x=> console.log(`  - ${x.k}: lines ${x.lines.join(', ')}`));

console.log('\nDUPLICATE slug:');
if(dupSlugs.length===0) console.log('  None');
else dupSlugs.forEach(x=> console.log(`  - ${x.k}: lines ${x.lines.join(', ')}`));

console.log('\nSummary:');
console.log(`  products found: ${names.length}`);
console.log(`  unique names: ${new Set(names.map(n=>n.v)).size}`);
console.log(`  unique slugs: ${new Set(slugs.map(s=>s.v)).size}`);
