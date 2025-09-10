#!/usr/bin/env node

const { execSync } = require('child_process');

async function deployWithFeedback() {
  console.log('🚀 Starting deployment process...');
  
  try {
    // Run build locally first
    console.log('📦 Building locally...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Deploy to Vercel
    console.log('🌐 Deploying to Vercel...');
    const deployOutput = execSync('vercel --prod --yes', { encoding: 'utf8' });
    
    console.log('✅ Deployment successful!');
    console.log('🔗 URL:', deployOutput.trim());
    
    return { success: true, url: deployOutput.trim() };
  } catch (error) {
    console.error('❌ Deployment failed:');
    console.error(error.stdout || error.message);
    return { success: false, error: error.stdout || error.message };
  }
}

deployWithFeedback().then(result => {
  process.exit(result.success ? 0 : 1);
});