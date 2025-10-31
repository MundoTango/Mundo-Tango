// Vercel API Client - Deploy frontend + manage env vars
// Tier 1: Deployment Automation + Secrets Management
// Created: October 31, 2025

export interface VercelDeploymentResponse {
  id: string;
  url: string;
  readyState: 'READY' | 'ERROR' | 'BUILDING' | 'QUEUED' | 'CANCELED';
  created: number;
  creator: {
    uid: string;
    email: string;
    username: string;
  };
}

export interface VercelEnvVariable {
  id: string;
  key: string;
  value: string;
  type: 'system' | 'secret' | 'encrypted' | 'plain';
  target: ('production' | 'preview' | 'development')[];
  createdAt: number;
  updatedAt: number;
}

// Get Vercel API token from environment or platform integrations
function getVercelToken(): string {
  const token = process.env.VERCEL_API_TOKEN || process.env.VERCEL_TOKEN;
  if (!token) {
    throw new Error('VERCEL_API_TOKEN not configured');
  }
  return token;
}

// Get Vercel project ID from environment
function getVercelProjectId(): string {
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!projectId) {
    throw new Error('VERCEL_PROJECT_ID not configured');
  }
  return projectId;
}

// Create a new deployment
export async function createVercelDeployment(params: {
  name: string;
  gitSource: {
    type: 'github';
    repoId: string;
    ref: string; // branch name or commit SHA
  };
  target?: 'production' | 'preview';
}): Promise<VercelDeploymentResponse> {
  const token = getVercelToken();
  const projectId = getVercelProjectId();

  const response = await fetch(`https://api.vercel.com/v13/deployments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: params.name,
      project: projectId,
      gitSource: params.gitSource,
      target: params.target || 'production',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vercel deployment failed: ${error}`);
  }

  return response.json();
}

// Get deployment status
export async function getVercelDeployment(deploymentId: string): Promise<VercelDeploymentResponse> {
  const token = getVercelToken();

  const response = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Vercel deployment: ${error}`);
  }

  return response.json();
}

// Cancel a deployment
export async function cancelVercelDeployment(deploymentId: string): Promise<void> {
  const token = getVercelToken();

  const response = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}/cancel`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to cancel Vercel deployment: ${error}`);
  }
}

// Create or update environment variable
export async function setVercelEnvVariable(params: {
  key: string;
  value: string;
  target: ('production' | 'preview' | 'development')[];
  type?: 'encrypted' | 'plain';
}): Promise<VercelEnvVariable> {
  const token = getVercelToken();
  const projectId = getVercelProjectId();

  const response = await fetch(`https://api.vercel.com/v10/projects/${projectId}/env`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key: params.key,
      value: params.value,
      type: params.type || 'encrypted',
      target: params.target,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to set Vercel env variable: ${error}`);
  }

  return response.json();
}

// List all environment variables
export async function listVercelEnvVariables(): Promise<VercelEnvVariable[]> {
  const token = getVercelToken();
  const projectId = getVercelProjectId();

  const response = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list Vercel env variables: ${error}`);
  }

  const data = await response.json();
  return data.envs || [];
}

// Delete environment variable
export async function deleteVercelEnvVariable(envId: string): Promise<void> {
  const token = getVercelToken();
  const projectId = getVercelProjectId();

  const response = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env/${envId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete Vercel env variable: ${error}`);
  }
}
