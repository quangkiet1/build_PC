const fs = require('fs');
const lines = fs.readFileSync('prisma/seed.ts', 'utf8').split('\n');
lines.forEach((line, i) => {
  if (line.match(/const\s+\w+\s*=\s*\[/)) {
    console.log(`${i+1}: ${line.trim()}`);
  }
});
