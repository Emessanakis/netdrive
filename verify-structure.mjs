#!/usr/bin/env node

/**
 * NetDrive Structure Verification Script
 * 
 * This script verifies the current project structure matches the documented
 * architecture, including controller organization, model relationships, and
 * role-based access control implementation.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handle the current directory (should be "net drive")
const projectRoot = process.cwd();

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bold}${colors.blue}\n=== ${msg} ===${colors.reset}`)
};

function checkPath(relativePath, description) {
  const fullPath = path.join(projectRoot, relativePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    log.success(`${description}: ${relativePath}`);
  } else {
    log.error(`Missing ${description}: ${relativePath}`);
  }
  
  return exists;
}

function checkFileContent(relativePath, searchPattern, description) {
  const fullPath = path.join(projectRoot, relativePath);
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const matches = content.includes(searchPattern);
    
    if (matches) {
      log.success(`${description} found in ${relativePath}`);
    } else {
      log.warn(`${description} not found in ${relativePath}`);
    }
    
    return matches;
  } catch (error) {
    log.error(`Cannot read ${relativePath}: ${error.message}`);
    return false;
  }
}

function verifyControllerStructure() {
  log.header('Controller Structure Verification');
  
  // Check HTTP method organized folders
  const controllerDirs = [
    'backend/app/controllers/auth/getRequests',
    'backend/app/controllers/auth/postRequests', 
    'backend/app/controllers/auth/putRequests',
    'backend/app/controllers/auth/deleteRequests'
  ];
  
  controllerDirs.forEach(dir => checkPath(dir, 'Controller directory'));
  
  // Check key controller files
  const controllerFiles = [
    'backend/app/controllers/auth/getRequests/getStorageStats.controller.js',
    'backend/app/controllers/auth/getRequests/downloadFile.controller.js',
    'backend/app/controllers/auth/postRequests/upload.controller.js',
    'backend/app/controllers/auth/postRequests/signin.controller.js',
    'backend/app/controllers/auth/putRequests/changePassword.controller.js',
    'backend/app/controllers/auth/deleteRequests/permanentDelete.controller.js'
  ];
  
  controllerFiles.forEach(file => checkPath(file, 'Controller file'));
  
  // Check index.js has updated imports
  checkFileContent(
    'backend/app/controllers/auth/index.js',
    'getRequests/',
    'HTTP method imports'
  );
}

function verifyModelStructure() {
  log.header('Model Structure Verification');
  
  // Check associations file
  checkPath('backend/app/models/associations.js', 'Associations file');
  checkPath('backend/app/models/README.md', 'Models documentation');
  
  // Check key model files
  const modelFiles = [
    'backend/app/models/user.model.js',
    'backend/app/models/role.model.js',
    'backend/app/models/files.model.js',
    'backend/app/models/folder.model.js'
  ];
  
  modelFiles.forEach(file => checkPath(file, 'Model file'));
  
  // Check associations are centralized
  checkFileContent(
    'backend/app/models/index.js',
    'defineAssociations(db)',
    'Centralized associations call'
  );
  
  checkFileContent(
    'backend/app/models/associations.js',
    'belongsToMany',
    'Model relationships'
  );
}

function verifyRoleSystem() {
  log.header('Role-Based Access Control Verification');
  
  // Check middleware
  checkFileContent(
    'backend/app/middleware/authJwt.js',
    'isAdmin',
    'Admin role middleware'
  );
  
  // Check routes protection
  checkFileContent(
    'backend/app/routes/auth.routes.js',
    'isAdmin',
    'Admin route protection'
  );
  
  // Check frontend role usage
  checkFileContent(
    'frontend/src/components/Dashboard/Sidebar.tsx',
    'ROLE_ADMIN',
    'Frontend role checking'
  );
  
  checkFileContent(
    'frontend/src/components/CreateUser/CreateUser.tsx',
    'ROLE_ADMIN',
    'Admin component protection'
  );
}

function verifyFrontendStructure() {
  log.header('Frontend Structure Verification');
  
  // Check gallery components
  const galleryComponents = [
    'frontend/src/components/Gallery/StorageDonutChart.tsx',
    'frontend/src/components/Gallery/StorageDonutChartSkeleton.tsx',
    'frontend/src/components/Gallery/GalleryUpload.tsx',
    'frontend/src/components/Gallery/components/MediaGrid',
    'frontend/src/components/Gallery/components/StorageDialog'
  ];
  
  galleryComponents.forEach(component => checkPath(component, 'Gallery component'));
  
  // Check skeleton implementation
  checkFileContent(
    'frontend/src/components/Gallery/GalleryUpload.tsx',
    'StorageDonutChartSkeleton',
    'Skeleton loading implementation'
  );
}

function verifyDocumentation() {
  log.header('Documentation Verification');
  
  // Check README files exist and have role information
  checkFileContent('README.md', 'ROLE_ADMIN', 'Main README role documentation');
  checkFileContent('backend/README.md', 'Role-Based Access Control', 'Backend README roles');
  checkFileContent('frontend/README.md', 'Role-Based UI Features', 'Frontend README roles');
  
  // Check folder structure documentation
  checkFileContent('README.md', 'getRequests/', 'Main README updated structure');
  checkFileContent('backend/README.md', 'associations.js', 'Backend README model structure');
}

function verifyStorageUpdates() {
  log.header('Storage System Verification');
  
  // Check storage stats include deleted files
  checkFileContent(
    'backend/app/controllers/auth/getRequests/getStorageStats.controller.js',
    'including deleted files',
    'Deleted files in storage calculation'
  );
  
  // Check frontend skeleton usage
  checkFileContent(
    'frontend/src/components/Gallery/GalleryUpload.tsx',
    'isStorageDataLoaded',
    'Storage loading state management'
  );
}

// Main execution
async function main() {
  console.log(`${colors.bold}${colors.blue}`);
  console.log('🔍 NetDrive Structure Verification');
  console.log('=====================================');
  console.log(`Verifying project at: ${projectRoot}`);
  console.log(colors.reset);
  
  const checks = [
    verifyControllerStructure,
    verifyModelStructure, 
    verifyRoleSystem,
    verifyFrontendStructure,
    verifyStorageUpdates,
    verifyDocumentation
  ];
  
  for (const check of checks) {
    try {
      check();
    } catch (error) {
      log.error(`Verification failed: ${error.message}`);
    }
  }
  
  log.header('Verification Complete');
  log.info('Review any warnings or errors above');
  log.info('Green checkmarks indicate properly structured components');
}

main().catch(console.error);