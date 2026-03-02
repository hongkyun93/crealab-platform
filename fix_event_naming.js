const fs = require('fs');
const path = require('path');

const files = [
  'lib/types/moment.ts',
  'lib/hooks/use-moments-swr.ts',
  'lib/mock-data.ts',
  'components/dialogs/DetailsModal.tsx',
  'components/dashboard/calendar-view.tsx',
  'components/shared/MomentGridCard.tsx',
  'components/shared/MomentTableView.tsx',
  'components/providers/proposal-provider.tsx',
  'components/forms/MomentForm.tsx',
  'components/creator/MomentListRow.tsx',
  'components/creator/MomentCompactRow.tsx',
  'components/creator/MomentGalleryCard.tsx',
  'components/creator/views/MomentsView.tsx',
  'components/creator/MomentCard.tsx',
  'app/design-lab/profile-card/page.tsx',
  'app/moment/[id]/page.tsx'
];

for (const file of files) {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) {
      console.log(`Skipping missing file: ${file}`);
      continue;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  let original = content;

  // Types update
  if (file === 'lib/types/moment.ts') {
      content = content.replace(/event: string.*\n\s*title\?: string.*/g, 'title: string');
  }

  // Mappings update
  if (file === 'lib/hooks/use-moments-swr.ts') {
      content = content.replace(/event:\s*e\.title,\n\s*title:\s*e\.title/g, 'title: e.title');
      content = content.replace(/updates\.event/g, 'updates.title');
  }

  // Form updates
  if (file === 'components/forms/MomentForm.tsx') {
      content = content.replace(/event\.event/g, 'event.title');
  }

  // Replace fallback logic "x.title || x.event" -> just "x.title"
  content = content.replace(/(\w+)\.title\s*\|\|\s*\1\.event/g, '$1.title');
  content = content.replace(/(\w+)\.event\s*\|\|\s*\1\.title/g, '$1.title');
  
  // Replace direct access "x.event" -> "x.title" for moment-like objects
  // Objects: event, item, data, m, ev, selectedMoment, momentData, moment, p.moment
  content = content.replace(/\b(event|item|data|m|ev|selectedMoment|momentData|moment)\.event\b/g, '$1.title');
  content = content.replace(/p\.moment\?\.event/g, 'p.moment?.title');

  // Hardcode specific replacements for profile-card/page.tsx
  if (file === 'app/design-lab/profile-card/page.tsx') {
      content = content.replace(/m\.event/g, 'm.title');
  }
  
  if (content !== original) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated ${file}`);
  }
}
