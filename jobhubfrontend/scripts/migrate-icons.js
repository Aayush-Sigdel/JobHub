const fs = require('fs');
const path = require('path');

// 1. Get all animated icons
const dts = fs.readFileSync(path.join(__dirname, '..', 'node_modules', '@animateicons', 'react', 'dist', 'lucide.d.ts'), 'utf8');
const animatedIcons = new Set();
const regex = /declare const ([a-zA-Z0-9_]+Icon):/g;
let match;
while ((match = regex.exec(dts)) !== null) {
  animatedIcons.add(match[1]);
}

console.log(`Found ${animatedIcons.size} animated icons.`);

const filesToUpdate = [
  'app/(users)/(auth)/verification/page.tsx',
  'app/(users)/(auth)/forget-password/page.tsx',
  'app/(users)/_components/landing-section-1.tsx',
  'app/(users)/_components/dropdown-notification.tsx',
  'app/(users)/_components/dropdown-message.tsx',
  'app/(users)/_components/landing-faq-section.tsx',
  'app/(users)/_components/landing-section-2.tsx',
  'app/(users)/_components/dropdown-profile.tsx',
  'app/(users)/_components/landing-section-5.tsx',
  'components/web/search.tsx',
  'components/layout/theme-toggle.tsx',
  'components/motion/theme-toggle.tsx',
  'components/motion/button/stateful.tsx',
  'components/auth/sign-up-modal.tsx',
  'components/auth/sign-in-modal.tsx'
];

filesToUpdate.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (!fs.existsSync(fullPath)) return;

  let content = fs.readFileSync(fullPath, 'utf8');
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+["']lucide-react["']/g;
  
  let hasChanges = false;
  content = content.replace(importRegex, (match, p1) => {
    const icons = p1.split(',').map(i => i.trim()).filter(Boolean);
    const staticIcons = [];
    const animatedImports = [];

    icons.forEach(i => {
      // If it's already an alias, skip for animated
      if (i.includes(' as ')) {
         staticIcons.push(i);
         return;
      }
      
      const expectedIconName = `${i}Icon`;
      if (animatedIcons.has(expectedIconName)) {
        animatedImports.push(`${expectedIconName} as ${i}`);
        hasChanges = true;
      } else {
        staticIcons.push(i);
      }
    });

    let replacement = '';
    if (staticIcons.length > 0) {
      replacement += `import { ${staticIcons.join(', ')} } from "lucide-react";\n`;
    }
    if (animatedImports.length > 0) {
      replacement += `import { ${animatedImports.join(', ')} } from "@animateicons/react/lucide";`;
    }
    return replacement.trim();
  });

  // Also replace any "@animateicons/react/lucide" imports that are broken from my previous manual edit
  if (file.includes('verification/page.tsx')) {
    content = content.replace(/import \{ CheckCircle2Icon as CheckCircle2, ArrowRightIcon as ArrowRight \} from "@animateicons\/react\/lucide";/, 'import { CheckCircle2, ArrowRight } from "lucide-react";');
    hasChanges = true;
  }

  if (hasChanges) {
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${file}`);
  }
});
