const { Octokit } = require('@octokit/rest');
const { createAppAuth } = require('@octokit/auth-app');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const LandingPage = require('../models/LandingPage');
const { v4: uuidv4 } = require('uuid');

class LandingPageDeployer {
  constructor() {
    this.githubToken = process.env.GITHUB_TOKEN;
    this.vercelToken = process.env.VERCEL_TOKEN;
    this.userId = process.env.USER_ID;
    // this.netlifyToken = process.env.NETLIFY_TOKEN;
    this.octokit = new Octokit({ auth: this.githubToken });
  }

  async generateFrontendCode(landingPage) {
    const { headline, subheadline, bulletPoints = [], painPointsSection = [], outcomeSection = [], founderMessage, ctaText } = landingPage;
    
    // Generate a unique ID for this deployment
    const deploymentId = uuidv4().substring(0, 8);
    
    // Generate the main page component
    const pageContent = `// Generated Landing Page - ${new Date().toISOString()}
import React, { useState } from 'react';
import Head from 'next/head';

const CTAButton = ({ children, ...props }) => (
  <button 
    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    {...props}
  >
    {children}
  </button>
);

const FeatureCard = ({ title, description, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
    {icon && <div className="text-blue-500 text-3xl mb-3">{icon}</div>}
    <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    // Here you would typically send the email to your backend
    console.log('Submitted email:', email);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSuccess(true);
    setEmail('');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Head>
        <title>${headline || 'Your Next Big Thing'}</title>
        <meta name="description" content="${subheadline || 'A new way to solve your problems'}" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-800">${headline?.split(' ')[0] || 'Launch'}</span>
            </div>
            <div className="flex items-center">
              <a 
                href="#pricing" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Pricing
              </a>
              <a 
                href="#contact" 
                className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
            {${JSON.stringify(headline || 'Turn Your Idea Into Reality')}}
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            {${JSON.stringify(subheadline || 'The perfect solution for your needs. Join thousands of satisfied customers.')}}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <CTAButton onClick={() => document.getElementById(\"pricing\").scrollIntoView({ behavior: 'smooth' })}
              dangerouslySetInnerHTML={{ __html: ${JSON.stringify(ctaText || 'Get Started')} }}
            />
            <button 
              className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose Us
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Everything you need to succeed, all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {${JSON.stringify(bulletPoints || []).length > 0 ? JSON.stringify(bulletPoints) : '[]'}.map((point, index) => (
              <FeatureCard 
                key={index}
                title={point.split(':')[0] || 'Feature ' + (index + 1)}
                description={point.split(':').slice(1).join(':').trim() || 'Amazing feature description'}
                icon={['🚀', '✨', '⚡', '🎯', '🔥', '💎'][index % 6]}
              />
            ))}
          </div>
        </section>

        {/* Pain Points Section */}
        ${painPointsSection.length > 0 ? `
        <section className="mt-20 bg-white rounded-xl shadow-lg p-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              We Understand Your Challenges
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Here are the common pain points we solve:
            </p>
            <ul className="mt-6 space-y-4 text-left">
              ${painPointsSection.map(point => `
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>${point}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </section>
        ` : ''}

        {/* CTA Section */}
        <section className="mt-20 bg-blue-700 rounded-xl shadow-xl overflow-hidden">
          <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 sm:py-20 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to get started?</span>
              <span className="block">Start your free trial today.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-blue-200">
              Join thousands of satisfied customers who are already using our platform.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-md shadow">
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                >
                  Get started
                </a>
              </div>
              <div className="ml-3 inline-flex">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-200 bg-blue-800 hover:bg-blue-700"
                >
                  Contact sales
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-20">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; ${new Date().getFullYear()} ${headline?.split(' ')[0] || 'Your Company'}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
`;

    // Create package.json
    const packageJson = {
      name: `landing-page-${deploymentId}`,
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies: {
        next: '^13.4.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        'tailwindcss': '^3.3.0',
        'autoprefixer': '^10.4.0',
        'postcss': '^8.4.0',
        'eslint': '^8.0.0',
        'eslint-config-next': '^13.4.0'
      }
    };

    // Create tailwind config
    const tailwindConfig = `module.exports = {
      content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
      ],
      theme: {
        extend: {
          colors: {
            primary: {
              50: '#f0f9ff',
              100: '#e0f2fe',
              200: '#bae6fd',
              300: '#7dd3fc',
              400: '#38bdf8',
              500: '#0ea5e9',
              600: '#0284c7',
              700: '#0369a1',
              800: '#075985',
              900: '#0c4a6e',
            },
          },
        },
      },
      plugins: [],
    }`;

    // Create next.config.js
    const nextConfig = `/** @type {import('next').NextConfig} */
    const nextConfig = {
      reactStrictMode: true,
      images: {
        domains: ['images.unsplash.com'],
      },
    };
    
    module.exports = nextConfig;`;

    return {
      'pages/index.js': pageContent,
      'package.json': JSON.stringify(packageJson, null, 2),
      'tailwind.config.js': tailwindConfig,
      'postcss.config.js': 'module.exports = {\n        plugins: {\n          tailwindcss: {},\n          autoprefixer: {},\n        },\n      };',
      'next.config.js': nextConfig,
      'public/favicon.ico': '', // This would be a real favicon in production
    };
  }

  async deployToVercel(landingPageId, repoName) {
    // Check if GitHub token is available
    if (!this.githubToken) {
      throw new Error('GitHub authentication token (GITHUB_TOKEN) is not configured. Please set up a GitHub Personal Access Token with repo permissions.');
    }

    // Clean up the repo name and ensure it's unique
    const cleanRepoName = repoName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const uniqueRepoName = `${cleanRepoName}-${Date.now()}`;
    
    // 1. Get the landing page data first
    const landingPage = await LandingPage.findById(landingPageId);
    if (!landingPage) {
      throw new Error('Landing page not found');
    }

    // 2. Generate frontend files
    const files = await this.generateFrontendCode(landingPage);
    
    // 3. Create a temp directory and write files
    const tempDir = path.join('/tmp', uniqueRepoName);
    await fs.mkdir(tempDir, { recursive: true });
    
    // Write all files to the temp directory
    const writePromises = Object.entries(files).map(async ([filePath, content]) => {
      const fullPath = path.join(tempDir, filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content);
    });
    
    await Promise.all(writePromises);
    
    // 4. Initialize a git repository in the temp directory
    const { execSync } = require('child_process');
    
    // Initialize git repo
    execSync('git init', { cwd: tempDir });
    
    // Add all files
    execSync('git add .', { cwd: tempDir });
    
    // Make initial commit
    execSync('git commit -m "Initial commit"', { cwd: tempDir });
    
    // 5. Create a new GitHub repository (without auto_init)
    let repo;
    try {
      const response = await this.octokit.repos.createForAuthenticatedUser({
        name: uniqueRepoName,
        private: false,
        auto_init: false // Don't auto-initialize, we'll push our own files
      });
      repo = response.data;
    } catch (error) {
      if (error.status === 401) {
        throw new Error('GitHub authentication failed. Please check your GITHUB_TOKEN is valid and has the necessary permissions (repo scope).');
      } else if (error.status === 422 && error.response?.data?.message?.includes('name already exists')) {
        // If the name already exists, try again with a more unique name
        const retryRepoName = `${uniqueRepoName}-${Math.random().toString(36).substring(2, 8)}`;
        const response = await this.octokit.repos.createForAuthenticatedUser({
          name: retryRepoName,
          private: false,
          auto_init: false // Don't auto-initialize
        });
        repo = response.data;
      } else {
        throw error;
      }
    }

    // 6. Push the local repository to GitHub
    try {
      // Add the remote with HTTPS and token authentication
      const repoOwner = repo.owner.login || repo.owner.name;
      const repoUrl = `https://${this.githubToken}@github.com/${repoOwner}/${repo.name}.git`;
      
      // Configure git to use the token for authentication
      execSync('git config --global user.name "GitHub Action"', { cwd: tempDir });
      execSync('git config --global user.email "action@github.com"', { cwd: tempDir });
      
      // Add the remote
      execSync(`git remote add origin ${repoUrl}`, { cwd: tempDir });
      
      // Push to GitHub using the token for authentication
      execSync('git push -u origin master', { 
        cwd: tempDir,
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } // Prevent git from asking for credentials
      });
      
      console.log('Successfully pushed to GitHub repository:', repo.html_url);
    } catch (error) {
      console.error('Failed to push to GitHub:', error);
      throw new Error(`Failed to push to GitHub: ${error.message}`);
    }
    
    // 7. Deploy to Vercel
      if (!this.vercelToken) {
        throw new Error('Vercel authentication token (VERCEL_TOKEN) is not configured. Please set up a Vercel Access Token.');
      }

      console.log('Starting Vercel deployment...');
      console.log('Using repo name:', uniqueRepoName);

      try {
        // First, verify the Vercel token is valid and get user info
        console.log('Verifying Vercel token and fetching user information...');
        let userId = this.userId; // Use the USER_ID from environment variables
        
        // Verify the token and get user info
        try {
          const userResponse = await axios.get('https://api.vercel.com/v2/user', {
            headers: {
              'Authorization': `Bearer ${this.vercelToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            timeout: 10000
          });
          
          // Log successful authentication
          if (userResponse.data && userResponse.data.user) {
            console.log('Successfully authenticated with Vercel as user:', userResponse.data.user.email || 'Unknown');
            // Use the user ID from the response if available, otherwise fall back to environment variable
            userId = userResponse.data.user.uid || userId;
          } else {
            console.warn('Unexpected Vercel API response format, using USER_ID from environment');
          }
      } catch (error) {
        console.error('Vercel authentication failed:', error.response?.data || error.message);
        if (error.response?.status === 403) {
          throw new Error('Vercel authentication failed: Invalid or expired token. Please generate a new token from Vercel dashboard with the correct permissions.');
        }
        throw new Error(`Vercel authentication failed: ${error.message}`);
      }
      
      // Create a new Vercel project
      console.log('Creating Vercel project...');
      const projectName = uniqueRepoName.replace(/[^a-zA-Z0-9-]/g, '-'); // Sanitize project name
      
      // Minimal required configuration for Vercel API v13
      const projectData = {
        name: projectName,
        framework: 'nextjs',
        buildCommand: 'npm run build',
        installCommand: 'npm install',
        outputDirectory: '.next',
      };

      const projectResponse = await axios.post(
        'https://api.vercel.com/v9/projects',
        projectData,
        {
          headers: {
            'Authorization': `Bearer ${this.vercelToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );
      
      console.log('Vercel project created:', projectResponse.data);
      const projectId = projectResponse.data.id;
      
      // Then, configure the GitHub integration
      console.log('Configuring GitHub integration...');
      // First, ensure the project is properly initialized
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for project to be ready
      
      // Update project settings with only valid properties
      // Configure the project with the correct framework settings
      const projectSettings = {
        framework: 'nextjs',
        buildCommand: 'npm run build',
        installCommand: 'npm install',
        outputDirectory: '.next'
      };
      
      console.log('Project settings to update:', JSON.stringify(projectSettings, null, 2));
      
      // Update project settings
      await axios.patch(
        `https://api.vercel.com/v9/projects/${projectId}`, 
        projectSettings,
        { headers: { 'Authorization': `Bearer ${this.vercelToken}` } }
      );
      
      console.log('Vercel project settings updated successfully');
      
      // Link the GitHub repository
      console.log('Linking GitHub repository...');
      const gitLinkData = {
        projectId: projectId,
        type: 'github',
        repo: uniqueRepoName,
        repoId: repo.id.toString(),
        org: process.env.GITHUB_USERNAME || 'your-github-username',
        productionBranch: 'master',
        // Adding these additional fields that might be required
        gitCredentialId: '', // This might be needed for private repos
        deploymentType: 'GITHUB_DEPLOYMENT',
        prComments: { enabled: true }
      };
      
      console.log('Git link data:', JSON.stringify(gitLinkData, null, 2));
      
      // Try multiple endpoints for linking the repository
      const linkEndpoints = [
        `https://api.vercel.com/v1/integrations/git/${projectId}`,
        `https://api.vercel.com/v9/projects/${projectId}/link`,
        `https://api.vercel.com/v9/integrations/git/repo`
      ];
      
      let linkSuccess = false;
      
      for (const endpoint of linkEndpoints) {
        try {
          console.log(`Attempting to link using endpoint: ${endpoint}`);
          const response = await axios.post(
            endpoint,
            gitLinkData,
            { 
              headers: { 
                'Authorization': `Bearer ${this.vercelToken}`,
                'Content-Type': 'application/json'
              },
              timeout: 10000 // 10 second timeout
            }
          );
          
          console.log('GitHub repository linked successfully via', endpoint);
          console.log('Link response:', JSON.stringify(response.data, null, 2));
          linkSuccess = true;
          break; // Exit loop on success
          
        } catch (linkError) {
          const errorDetails = linkError.response ? {
            status: linkError.response.status,
            statusText: linkError.response.statusText,
            data: linkError.response.data
          } : linkError.message;
          
          console.warn(`Failed to link using ${endpoint}:`, JSON.stringify(errorDetails, null, 2));
          
          // If we get a 404, try the next endpoint
          if (linkError.response && linkError.response.status === 404) {
            continue;
          }
          
          // For other errors, log and continue to next endpoint
          console.warn(`Error details for ${endpoint}:`, errorDetails);
        }
      }
      
      if (!linkSuccess) {
        console.warn('Warning: Could not automatically link GitHub repository.');
        console.warn('You may need to manually link the repository in the Vercel dashboard.');
        console.warn(`GitHub Repository: ${repo.html_url}`);
        console.warn(`Vercel Project: https://vercel.com/${process.env.VERCEL_TEAM_ID || 'your-team'}/${projectId}`);
      }
      
      // Trigger a deployment
      console.log('Triggering deployment...');
      const deployment = await axios.post(
        `https://api.vercel.com/v13/deployments`, 
        {
          name: uniqueRepoName,
          gitSource: {
            type: 'github',
            repo: uniqueRepoName,
            repoId: repo.id,
            org: process.env.GITHUB_USERNAME || 'your-github-username',
            ref: 'master',
            productionBranch: 'master'
          },
          framework: 'nextjs',
          devCommand: 'next dev',
          buildCommand: 'npm run build',
          installCommand: 'npm install',
          outputDirectory: '.next',
          target: 'production',
          regions: ['iad1']
        },
        { 
          headers: { 
            'Authorization': `Bearer ${this.vercelToken}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('Deployment triggered:', deployment.data);

      // 8. Save deployment URL and details to landing page
      const deploymentUrl = deployment.data.url || `${uniqueRepoName}.vercel.app`;
      const fullDeploymentUrl = `https://${deploymentUrl}`;
      
      // Update the landing page with deployment details
      const updatedLandingPage = await LandingPage.findByIdAndUpdate(
        landingPageId,
        {
          deploymentStatus: 'deployed',
          deploymentUrl: fullDeploymentUrl,
          githubRepoUrl: repo.html_url,
          vercelProjectId: projectId,
          vercelDeploymentId: deployment.data.id,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      console.log('Landing page updated with deployment details');
      
      // 9. Clean up the temporary directory
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
        console.log('Temporary directory cleaned up');
      } catch (cleanupError) {
        console.warn('Warning: Failed to clean up temporary directory:', cleanupError.message);
      }
      

      return {
        success: true,
        message: 'Deployment initiated successfully',
        deployment: {
          id: deployment.data.id,
          url: fullDeploymentUrl,
          status: 'queued',
          githubRepo: repo.html_url,
          vercelProjectId: projectId
        },
        landingPage: updatedLandingPage
      };
      
    } catch (error) {
      console.error('Vercel deployment error:', error.response?.data || error.message);
      if (error.response) {
        console.error('Error details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      throw new Error(`Failed to deploy to Vercel: ${error.message}`);
    }
  }

  async deployToNetlify(landingPageId) {
    // Similar to deployToVercel but for Netlify
    // Implementation would use the Netlify API
    throw new Error('Netlify deployment not yet implemented');
  }
}

module.exports = new LandingPageDeployer();
