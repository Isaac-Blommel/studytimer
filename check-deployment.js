#!/usr/bin/env node

const { execSync } = require('child_process');

function checkDeploymentStatus() {
  try {
    // Get latest deployment status
    const result = execSync('vercel ls --format=json', { encoding: 'utf8' });
    const deployments = JSON.parse(result);
    
    if (deployments.length > 0) {
      const latest = deployments[0];
      console.log(`Status: ${latest.state}`);
      console.log(`URL: ${latest.url}`);
      
      if (latest.state === 'ERROR') {
        // Get deployment logs
        const logs = execSync(`vercel logs ${latest.url}`, { encoding: 'utf8' });
        console.log('Error logs:', logs);
        return { success: false, logs };
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error checking deployment:', error.message);
    return { success: false, error: error.message };
  }
}

checkDeploymentStatus();