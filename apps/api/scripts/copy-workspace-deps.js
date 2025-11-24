const fs = require('fs');
const path = require('path');

/**
 * Copy workspace dependencies to node_modules for Vercel serverless deployment
 * This ensures @repo/database and other workspace packages are available at runtime
 * and avoids symlink issues that cause "invalid deployment package" errors
 */

// Copy to the app's node_modules, not dist/node_modules
const apiDir = path.join(__dirname, '..');
const nodeModulesDir = path.join(apiDir, 'node_modules');
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

// Verify the copy was successful
const databasePackageJson = path.join(repoDir, 'database', 'package.json');
if (fs.existsSync(databasePackageJson)) {
  console.log('✓ Verified: @repo/database/package.json exists');
  const pkg = JSON.parse(fs.readFileSync(databasePackageJson, 'utf8'));
  console.log(`  Main entry: ${pkg.main}`);
} else {
  console.error('✗ Error: @repo/database/package.json not found!');
  process.exit(1);
}

// Verify Prisma client exists
const prismaClient = path.join(repoDir, 'database', 'node_modules', '.prisma', 'client', 'index.js');
if (fs.existsSync(prismaClient)) {
  console.log('✓ Verified: Prisma client exists');
} else {
  console.warn('⚠ Warning: Prisma client not found at expected location');
}
