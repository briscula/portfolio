const fs = require('fs');
const path = require('path');

/**
 * Copy workspace dependencies into dist/node_modules for Vercel serverless deployment
 * This ensures @repo/database and other workspace packages are available at runtime
 * and avoids symlink issues that cause "invalid deployment package" errors
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

console.log('📦 Copying workspace dependencies for Vercel deployment...');

// Copy function that dereferences symlinks
function copyRecursiveSync(src, dest, options = {}) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.lstatSync(src); // Use lstatSync to detect symlinks
  const isDirectory = exists && stats.isDirectory();
  const isSymlink = exists && stats.isSymbolicLink();

  if (isSymlink) {
    // Follow symlinks
    const realPath = fs.realpathSync(src);
    copyRecursiveSync(realPath, dest, options);
    return;
  }

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      // Skip node_modules in source (except .prisma)
      if (childItemName === 'node_modules' && !src.includes('.prisma')) {
        // Copy only .prisma from node_modules
        const prismaPath = path.join(src, 'node_modules', '.prisma');
        if (fs.existsSync(prismaPath)) {
          const prismaDestPath = path.join(dest, 'node_modules', '.prisma');
          console.log(`  ↳ Copying Prisma client from ${prismaPath}...`);
          copyRecursiveSync(prismaPath, prismaDestPath);
        }
        return;
      }
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy @repo/database
const databaseSrc = path.join(__dirname, '../../../packages/database');
const databaseDest = path.join(repoDir, 'database');

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
console.log(`   Location: ${repoDir}`);
