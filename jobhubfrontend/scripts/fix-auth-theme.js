const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'components/auth/sign-in-modal.tsx',
  'components/auth/sign-up-modal.tsx',
  'app/(users)/(auth)/verification/page.tsx',
  'app/(users)/(auth)/forget-password/page.tsx',
];

const replacements = [
  { from: /bg-white/g, to: 'bg-background' },
  { from: /text-slate-900/g, to: 'text-foreground' },
  { from: /text-slate-700/g, to: 'text-foreground/90' },
  { from: /text-slate-500/g, to: 'text-muted-foreground' },
  { from: /border-slate-200/g, to: 'border-border' },
  { from: /hover:text-slate-900/g, to: 'hover:text-foreground' },
  { from: /hover:text-slate-800/g, to: 'hover:text-foreground/80' },
  { from: /hover:border-slate-900/g, to: 'hover:border-foreground' },
  { from: /focus-visible:border-slate-900/g, to: 'focus-visible:border-foreground' },
];

filesToUpdate.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (!fs.existsSync(fullPath)) return;

  let content = fs.readFileSync(fullPath, 'utf8');
  let hasChanges = false;

  replacements.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      hasChanges = true;
    }
  });

  if (hasChanges) {
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${file}`);
  }
});
