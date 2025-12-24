import fs from 'fs';
import path from 'path';

// Add navigation translations to common.json for all languages
const LOCALES_DIR = 'client/public/locales';

const navTranslations = {
  aboutUs: 'About Us',
  contact: 'Contact',
  help: 'Help',
  volunteer: 'Volunteer',
  whoItsFor: "Who It's For",
  community: 'Community'
};

// Read English common.json
const enPath = path.join(LOCALES_DIR, 'en/common.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

// Add navigation items to English if they don't exist
Object.assign(enData, navTranslations);

// Write back to English
fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));

console.log('✓ Updated English translations');
console.log('Navigation translations needed in all languages');
console.log('Please translate these to all other languages manually or with AI');
