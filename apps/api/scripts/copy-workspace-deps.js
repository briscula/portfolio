const fs = require('fs');
const path = require('path');

/**
 * Copy workspace dependencies into dist/node_modules for Vercel serverless deployment
 * This ensures @repo/database and other workspace packages are available at runtime
 */

const distDir = path.join(__dirname, '../dist');
const nodeModulesDir = path.join(distDir, 'node_modules');
const repoDir = path.join(nodeModulesDir, '@repo');

// Create directories
if (!fs.existsSync(nodeModulesDir)) {
  fs.mkdirSync(nodeModulesDir, { recursive: true });
}
if (!fs.existsSync(repoDir)) {
  fs.mkdirSync(repoDir, { recursive: true });
}

// Copy @repo/database
console.log('📦 Copying workspace dependencies for Vercel deployment...');

const databaseSrc = path.join(__dirname, '../../../packages/database');
const databaseDest = path.join(repoDir, 'database');

// Copy function
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy database package
console.log('  ↳ Copying @repo/database...');
copyRecursiveSync(databaseSrc, databaseDest);

// Also copy shared package if it exists
const sharedSrc = path.join(__dirname, '../../../packages/shared');
if (fs.existsSync(sharedSrc)) {
  const sharedDest = path.join(repoDir, 'shared');
  console.log('  ↳ Copying @repo/shared...');
  copyRecursiveSync(sharedSrc, sharedDest);
}

console.log('✅ Workspace dependencies copied successfully!');
