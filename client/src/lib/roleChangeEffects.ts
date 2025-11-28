/**
 * ROLE CHANGE EFFECTS - PRO GROUP AUTO-JOIN
 * Mirrors locationChangeEffects.ts pattern for role changes
 * Triggers auto-join to PRO groups when user selects professional roles
 */

export interface RoleChangeEvent {
  previousRoles: string[];
  newRoles: string[];
}

export interface RoleChangeEffects {
  addedRoles: string[];
  removedRoles: string[];
  autoJoinedGroups: Array<{
    groupId: number;
    groupName: string;
    role: string;
    memberCount: number;
    alreadyMember?: boolean;
    created?: boolean;
  }>;
  createdGroups: Array<{
    groupId: number;
    groupName: string;
    role: string;
  }>;
  message: string;
}

export async function triggerRoleChangeEffects(
  event: RoleChangeEvent
): Promise<RoleChangeEffects> {
  const accessToken = localStorage.getItem('accessToken');
  
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch('/api/roles/change-effects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`Failed to trigger role change effects: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[RoleChangeEffects] Error:', error);
    throw error;
  }
}

export async function fetchPROGroups(): Promise<Array<{
  id: number;
  name: string;
  slug: string;
  description: string;
  memberCount: number;
  coverImage?: string;
}>> {
  const accessToken = localStorage.getItem('accessToken');
  
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch('/api/roles/pro-groups', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PRO groups: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[RoleChangeEffects] Error fetching PRO groups:', error);
    throw error;
  }
}
