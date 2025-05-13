// check-tailwind.js
// Questo script verifica la corretta installazione e configurazione di Tailwind CSS
// Esegui con: node check-tailwind.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colori per l'output in console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.blue}=== Verifica di Tailwind CSS ===${colors.reset}\n`);

// Verifica pacchetti installati
try {
  console.log(`${colors.cyan}Verifica pacchetti installati...${colors.reset}`);
  
  // Recupera tutte le dipendenze installate
  const packageJson = require('./package.json');
  const dependencies = { 
    ...packageJson.dependencies, 
    ...packageJson.devDependencies 
  };
  
  // Verifica tailwindcss
  if (dependencies.tailwindcss) {
    console.log(`${colors.green}✓ tailwindcss trovato: ${dependencies.tailwindcss}${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ tailwindcss non trovato nel package.json${colors.reset}`);
    console.log(`  Installa con: npm install -D tailwindcss`);
  }
  
  // Verifica postcss
  if (dependencies.postcss) {
    console.log(`${colors.green}✓ postcss trovato: ${dependencies.postcss}${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ postcss non trovato nel package.json${colors.reset}`);
    console.log(`  Installa con: npm install -D postcss`);
  }
  
  // Verifica autoprefixer
  if (dependencies.autoprefixer) {
    console.log(`${colors.green}✓ autoprefixer trovato: ${dependencies.autoprefixer}${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ autoprefixer non trovato nel package.json${colors.reset}`);
    console.log(`  Installa con: npm install -D autoprefixer`);
  }
} catch (err) {
  console.log(`${colors.red}Errore nella verifica dei pacchetti: ${err.message}${colors.reset}`);
}

console.log('');

// Verifica file di configurazione
console.log(`${colors.cyan}Verifica file di configurazione...${colors.reset}`);

// Verifica tailwind.config.js
if (fs.existsSync('./tailwind.config.js')) {
  console.log(`${colors.green}✓ tailwind.config.js trovato${colors.reset}`);
  
  // Verifica contenuto
  try {
    const tailwindConfig = require('./tailwind.config.js');
    if (tailwindConfig.content && Array.isArray(tailwindConfig.content)) {
      console.log(`${colors.green}✓ La proprietà 'content' è configurata correttamente${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ La proprietà 'content' è assente o non è un array${colors.reset}`);
    }
  } catch (err) {
    console.log(`${colors.red}✗ Errore nel file tailwind.config.js: ${err.message}${colors.reset}`);
  }
} else {
  console.log(`${colors.red}✗ tailwind.config.js non trovato${colors.reset}`);
  console.log(`  Crea con: npx tailwindcss init`);
}

// Verifica postcss.config.js
if (fs.existsSync('./postcss.config.js')) {
  console.log(`${colors.green}✓ postcss.config.js trovato${colors.reset}`);
  
  // Verifica contenuto
  try {
    const postcssConfig = require('./postcss.config.js');
    if (postcssConfig.plugins && postcssConfig.plugins.tailwindcss) {
      console.log(`${colors.green}✓ Plugin tailwindcss configurato in postcss.config.js${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠ Plugin tailwindcss non trovato in postcss.config.js${colors.reset}`);
    }
  } catch (err) {
    console.log(`${colors.red}✗ Errore nel file postcss.config.js: ${err.message}${colors.reset}`);
  }
} else {
  console.log(`${colors.red}✗ postcss.config.js non trovato${colors.reset}`);
  console.log(`  Crea con: npx tailwindcss init -p`);
}

console.log('');

// Verifica file CSS
console.log(`${colors.cyan}Verifica file CSS...${colors.reset}`);

// Verifica src/index.css
const cssFile = path.join('src', 'index.css');
if (fs.existsSync(cssFile)) {
  console.log(`${colors.green}✓ ${cssFile} trovato${colors.reset}`);
  
  // Verifica contenuto
  const cssContent = fs.readFileSync(cssFile, 'utf8');
  const directives = ['@tailwind base', '@tailwind components', '@tailwind utilities'];
  
  let allDirectivesFound = true;
  for (const directive of directives) {
    if (cssContent.includes(directive)) {
      console.log(`${colors.green}✓ Direttiva '${directive}' trovata${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ Direttiva '${directive}' non trovata${colors.reset}`);
      allDirectivesFound = false;
    }
  }
  
  if (!allDirectivesFound) {
    console.log(`${colors.yellow}⚠ Il file CSS dovrebbe contenere tutte le direttive Tailwind${colors.reset}`);
    console.log(`  Aggiungi le seguenti linee all'inizio di ${cssFile}:`);
    console.log(`  @tailwind base;`);
    console.log(`  @tailwind components;`);
    console.log(`  @tailwind utilities;`);
  }
} else {
  console.log(`${colors.red}✗ ${cssFile} non trovato${colors.reset}`);
  console.log(`  Crea il file con le direttive Tailwind`);
}

console.log('');

// Verifica importazione in index.js
console.log(`${colors.cyan}Verifica importazione CSS...${colors.reset}`);

const indexFile = path.join('src', 'index.js');
if (fs.existsSync(indexFile)) {
  console.log(`${colors.green}✓ ${indexFile} trovato${colors.reset}`);
  
  // Verifica contenuto
  const indexContent = fs.readFileSync(indexFile, 'utf8');
  if (indexContent.includes("import './index.css'")) {
    console.log(`${colors.green}✓ Importazione CSS trovata${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Importazione CSS non trovata in ${indexFile}${colors.reset}`);
    console.log(`  Aggiungi questa linea: import './index.css';`);
  }
} else {
  console.log(`${colors.red}✗ ${indexFile} non trovato${colors.reset}`);
}

console.log('');
console.log(`${colors.blue}=== Verifica completata ===${colors.reset}`);