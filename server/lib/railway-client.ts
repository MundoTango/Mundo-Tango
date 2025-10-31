// Railway API Client - Deploy backend + manage env vars
// Tier 1: Deployment Automation + Secrets Management
// Created: October 31, 2025

export interface RailwayDeploymentResponse {
  id: string;
  status: 'SUCCESS' | 'FAILED' | 'BUILDING' | 'DEPLOYING' | 'CRASHED' | 'REMOVING';
  createdAt: string;
  updatedAt: string;
  url?: string;
}

export interface RailwayVariable {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Get Railway API token from environment
function getRailwayToken(): string {
  const token = process.env.RAILWAY_API_TOKEN || process.env.RAILWAY_TOKEN;
  if (!token) {
    throw new Error('RAILWAY_API_TOKEN not configured');
  }
  return token;
}

// Get Railway project ID from environment
function getRailwayProjectId(): string {
  const projectId = process.env.RAILWAY_PROJECT_ID;
  if (!projectId) {
    throw new Error('RAILWAY_PROJECT_ID not configured');
  }
  return projectId;
}

// Get Railway environment ID (defaults to production)
function getRailwayEnvironmentId(): string {
  const envId = process.env.RAILWAY_ENVIRONMENT_ID || 'production';
  return envId;
}

// Railway uses GraphQL API
async function railwayGraphQL(query: string, variables: Record<string, any> = {}): Promise<any> {
  const token = getRailwayToken();

  const response = await fetch('https://backboard.railway.app/graphql/v2', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Railway GraphQL request failed: ${error}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`Railway GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return data.data;
}

// Trigger a new deployment
export async function createRailwayDeployment(params: {
  branch?: string;
  commitSha?: string;
}): Promise<RailwayDeploymentResponse> {
  const projectId = getRailwayProjectId();
  const environmentId = getRailwayEnvironmentId();

  const query = `
    mutation DeploymentCreate($projectId: String!, $environmentId: String!, $branch: String, $commitSha: String) {
      deploymentCreate(
        input: {
          projectId: $projectId
          environmentId: $environmentId
          branch: $branch
          commitSha: $commitSha
        }
      ) {
        id
        status
        createdAt
        updatedAt
      }
    }
  `;

  const data = await railwayGraphQL(query, {
    projectId,
    environmentId,
    branch: params.branch || 'main',
    commitSha: params.commitSha,
  });

  return data.deploymentCreate;
}

// Get deployment status
export async function getRailwayDeployment(deploymentId: string): Promise<RailwayDeploymentResponse> {
  const query = `
    query Deployment($id: String!) {
      deployment(id: $id) {
        id
        status
        createdAt
        updatedAt
        url
      }
    }
  `;

  const data = await railwayGraphQL(query, { id: deploymentId });
  return data.deployment;
}

// Cancel a deployment
export async function cancelRailwayDeployment(deploymentId: string): Promise<void> {
  const query = `
    mutation DeploymentRemove($id: String!) {
      deploymentRemove(id: $id)
    }
  `;

  await railwayGraphQL(query, { id: deploymentId });
}

// Set environment variable
export async function setRailwayVariable(params: {
  name: string;
  value: string;
}): Promise<RailwayVariable> {
  const projectId = getRailwayProjectId();
  const environmentId = getRailwayEnvironmentId();

  const query = `
    mutation VariableUpsert($projectId: String!, $environmentId: String!, $name: String!, $value: String!) {
      variableUpsert(
        input: {
          projectId: $projectId
          environmentId: $environmentId
          name: $name
          value: $value
        }
      ) {
        id
        name
        createdAt
        updatedAt
      }
    }
  `;

  const data = await railwayGraphQL(query, {
    projectId,
    environmentId,
    name: params.name,
    value: params.value,
  });

  return data.variableUpsert;
}

// List all environment variables
export async function listRailwayVariables(): Promise<RailwayVariable[]> {
  const projectId = getRailwayProjectId();
  const environmentId = getRailwayEnvironmentId();

  const query = `
    query Variables($projectId: String!, $environmentId: String!) {
      variables(projectId: $projectId, environmentId: $environmentId) {
        edges {
          node {
            id
            name
            createdAt
            updatedAt
          }
        }
      }
    }
  `;

  const data = await railwayGraphQL(query, {
    projectId,
    environmentId,
  });

  return data.variables?.edges?.map((edge: any) => edge.node) || [];
}

// Delete environment variable
export async function deleteRailwayVariable(variableId: string): Promise<void> {
  const query = `
    mutation VariableDelete($id: String!) {
      variableDelete(id: $id)
    }
  `;

  await railwayGraphQL(query, { id: variableId });
}
