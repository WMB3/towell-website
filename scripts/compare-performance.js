import { execSync } from 'child_process';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function walkFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round((bytes / 1024 ** i) * 100) / 100} ${sizes[i]}`;
}

function sumSize(files) {
  return files.reduce((total, file) => total + fs.statSync(file).size, 0);
}

function analyzeBuild() {
  console.log('Building project...\n');
  execSync('npm run build', { stdio: 'inherit' });

  const distPath = join(__dirname, '../dist');
  if (!fs.existsSync(distPath)) {
    throw new Error('dist directory not found after build.');
  }

  const allFiles = walkFiles(distPath);
  const jsFiles = allFiles.filter((file) => file.endsWith('.js'));
  const cssFiles = allFiles.filter((file) => file.endsWith('.css'));
  const gzipFiles = allFiles.filter((file) => file.endsWith('.gz') || file.endsWith('.br'));

  const totalSize = sumSize(allFiles);
  const jsSize = sumSize(jsFiles);
  const cssSize = sumSize(cssFiles);
  const compressedSize = sumSize(gzipFiles);

  console.log('\nBuild Analysis');
  console.log('------------------------------------------------------------');
  console.log(`Total Bundle Size:      ${formatBytes(totalSize)}`);
  console.log(`JavaScript Size:        ${formatBytes(jsSize)}`);
  console.log(`CSS Size:               ${formatBytes(cssSize)}`);
  console.log(`Compressed Size:        ${formatBytes(compressedSize)}`);
  console.log('------------------------------------------------------------');
  console.log(`Number of JS Files:     ${jsFiles.length}`);
  console.log(`Number of CSS Files:    ${cssFiles.length}`);

  const topFiles = allFiles
    .map((file) => ({ file, size: fs.statSync(file).size }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);

  console.log('\nLargest Files:');
  topFiles.forEach((item, index) => {
    console.log(`${index + 1}. ${item.file.replace(distPath, 'dist')}: ${formatBytes(item.size)}`);
  });

  const results = {
    timestamp: new Date().toISOString(),
    totalSize,
    jsSize,
    cssSize,
    compressedSize,
    jsFiles: jsFiles.length,
    cssFiles: cssFiles.length
  };

  fs.writeFileSync(join(__dirname, '../performance-results.json'), JSON.stringify(results, null, 2));
  console.log('\nSaved performance-results.json');
}

try {
  analyzeBuild();
} catch (error) {
  console.error('Performance analysis failed:', error);
  process.exit(1);
}
