import { apiRequest, queryClient } from './queryClient';

export interface LocationChangeEvent {
  previousCity?: string;
  previousCountry?: string;
  newCity: string;
  newCountry: string;
  userId: number;
  timestamp: Date;
}

export interface LocationChangeEffects {
  autoJoinedGroup?: { groupId: number; groupName: string };
  suggestedGroups?: Array<{ id: number; name: string; memberCount: number }>;
  localEvents?: Array<{ id: number; title: string; date: string }>;
  nearbyDancers?: number;
  nearbyVenues?: number;
  welcomeMessage?: string;
}

export async function triggerLocationChangeEffects(
  event: LocationChangeEvent
): Promise<LocationChangeEffects> {
  const accessToken = localStorage.getItem('accessToken');
  
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch('/api/location/change-effects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        previousCity: event.previousCity,
        previousCountry: event.previousCountry,
        newCity: event.newCity,
        newCountry: event.newCountry,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to trigger location change effects');
    }

    const effects: LocationChangeEffects = await response.json();

    queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
    queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });

    return effects;
  } catch (error) {
    console.error('[LocationChangeEffects] Failed:', error);
    throw error;
  }
}

export function detectLocationChange(
  oldProfile: { city?: string; country?: string } | null,
  newCity: string,
  newCountry: string
): boolean {
  if (!oldProfile) return true;
  
  const cityChanged = oldProfile.city !== newCity;
  const countryChanged = oldProfile.country !== newCountry;
  
  return cityChanged || countryChanged;
}

export function formatWelcomeMessage(effects: LocationChangeEffects, cityName: string): string {
  const parts: string[] = [`Welcome to ${cityName}!`];
  
  if (effects.autoJoinedGroup) {
    parts.push(`You've been added to "${effects.autoJoinedGroup.groupName}".`);
  }
  
  if (effects.nearbyDancers && effects.nearbyDancers > 0) {
    parts.push(`${effects.nearbyDancers} dancers are in your area.`);
  }
  
  if (effects.localEvents && effects.localEvents.length > 0) {
    parts.push(`${effects.localEvents.length} upcoming events nearby.`);
  }
  
  return parts.join(' ');
}
