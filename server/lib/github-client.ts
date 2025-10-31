// GitHub Client - Uses Replit GitHub Integration
// Feature 1: Deployment Automation
// Created: October 31, 2025

import { Octokit } from '@octokit/rest';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

// Helper: Get repository info
export async function getRepositoryInfo(owner: string, repo: string) {
  const octokit = await getUncachableGitHubClient();
  const { data } = await octokit.repos.get({ owner, repo });
  return data;
}

// Helper: Get latest commit on branch
export async function getLatestCommit(owner: string, repo: string, branch: string = 'main') {
  const octokit = await getUncachableGitHubClient();
  const { data } = await octokit.repos.getBranch({ owner, repo, branch });
  return {
    sha: data.commit.sha,
    message: data.commit.commit.message,
    author: data.commit.commit.author?.name,
    date: data.commit.commit.author?.date,
  };
}

// Helper: Create or update file
export async function createOrUpdateFile(
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string = 'main'
) {
  const octokit = await getUncachableGitHubClient();
  
  // Try to get existing file
  let sha: string | undefined;
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });
    if ('sha' in data) {
      sha = data.sha;
    }
  } catch (error) {
    // File doesn't exist, that's okay
  }

  const { data } = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: Buffer.from(content).toString('base64'),
    branch,
    sha,
  });

  return data;
}

// Helper: Create deployment (triggers deployment on Vercel/Railway via GitHub)
export async function createDeployment(
  owner: string,
  repo: string,
  ref: string = 'main',
  environment: string = 'production'
) {
  const octokit = await getUncachableGitHubClient();
  
  const { data } = await octokit.repos.createDeployment({
    owner,
    repo,
    ref,
    environment,
    auto_merge: false,
    required_contexts: [],
  });

  return data;
}

// Helper: List deployments
export async function listDeployments(owner: string, repo: string) {
  const octokit = await getUncachableGitHubClient();
  const { data } = await octokit.repos.listDeployments({ owner, repo });
  return data;
}
