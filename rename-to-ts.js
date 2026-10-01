const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src');

function renameFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      renameFiles(fullPath); // റിക്രസീവ് ആയി ഉള്ളിലെ ഫോൾഡറുകളിലേക്ക് പോകും
    } else if (entry.isFile()) {
      let ext = path.extname(entry.name);
      let baseName = path.basename(entry.name, ext);

      // ഡ്യൂപ്ലിക്കേറ്റ് ആയി കിടക്കുന്ന globals.css പോലെയുള്ളവ ഒഴിവാക്കാൻ (ഒന്നിൽ കൂടുതൽ ഉണ്ടെങ്കിൽ ഒന്ന് നിലനിർത്തി ബാക്കി കളയാം)
      if (entry.name === 'globals.css') {
        // വേണമെങ്കിൽ മാനുവൽ ആയി ഡിലീറ്റ് ചെയ്യാം, അല്ലെങ്കിൽ എക്സ്റ്റൻഷൻ മാറ്റങ്ങളിൽ ശ്രദ്ധിക്കാം
      }

      // .js ഫയലുകളെ .ts അല്ലെങ്കിൽ .tsx ആക്കുന്നു
      if (ext === '.js') {
        // കോൺപോണന്റുകൾ അല്ലെങ്കിൽ JSX കോഡ് ഉള്ളവ .tsx ആക്കാം, ബാക്കിയുള്ളവ .ts ആക്കാം
        // (ചുവടെയുള്ള ലിസ്റ്റിൽ ഉള്ളവയോ അല്ലെങ്കിൽ UI ഫയലുകളോ .tsx ആക്കാം)
        const isComponentOrPage = 
          fullPath.includes('components') || 
          fullPath.includes('app') && (entry.name === 'page.js' || entry.name === 'layout.js' || entry.name === 'Tidepool.js');

        const newExt = isComponentOrPage ? '.tsx' : '.ts';
        const newPath = path.join(dir, baseName + newExt);

        fs.renameSync(fullPath, newPath);
        console.log(`Renamed: ${entry.name} ➔ ${baseName + newExt}`);
      }
    }
  });
}

console.log('🔄 Converting .js files to .ts/.tsx inside src/...');
renameFiles(srcDir);
console.log('✨ Conversion completed successfully!');