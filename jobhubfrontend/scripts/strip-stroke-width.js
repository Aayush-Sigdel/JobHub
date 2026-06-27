const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all TSX files in app/ and components/
const getFiles = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else if (fullPath.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
};

const appDir = path.join(__dirname, '..', 'app');
const compDir = path.join(__dirname, '..', 'components');

const files = [...getFiles(appDir), ...getFiles(compDir)];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Check if it has a @animateicons/react import
  if (content.includes('@animateicons/react')) {
    const original = content;
    // Remove strokeWidth={...} or strokeWidth="..."
    content = content.replace(/\s+strokeWidth=\{[^}]+\}/g, '');
    content = content.replace(/\s+strokeWidth="[^"]+"/g, '');
    
    if (original !== content) {
      fs.writeFileSync(file, content);
      console.log(`Stripped strokeWidth from ${file}`);
    }
  }
});
