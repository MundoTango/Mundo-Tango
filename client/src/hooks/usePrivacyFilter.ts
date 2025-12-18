/**
 * usePrivacyFilter Hook
 * 
 * MB.MD v9.6 Pattern 28: Privacy Filtering System
 * Evaluates fieldVisibility settings and filters user data for public view.
 * 
 * When privacy is set to 'private' or 'friends', the field is hidden from strangers.
 * When viewing as public (isPublicView=true), this hook filters accordingly.
 */

export type PrivacyLevel = 'public' | 'friends' | 'private';

export interface FieldVisibility {
  bio?: PrivacyLevel;
  occupation?: PrivacyLevel;
  location?: PrivacyLevel;
  languages?: PrivacyLevel;
  email?: PrivacyLevel;
  phone?: PrivacyLevel;
  socialLinks?: PrivacyLevel;
  tangoRoles?: PrivacyLevel;
  tango?: PrivacyLevel;
}

export interface PrivacySettings {
  profileVisibility?: 'public' | 'friends' | 'private';
  searchDiscoverable?: boolean;
  showOnlineStatus?: boolean;
  messagePermission?: 'everyone' | 'friends' | 'none';
  friendsListVisibility?: 'everyone' | 'friends' | 'me';
  eventsVisibility?: 'everyone' | 'friends' | 'me';
  tagPermission?: 'everyone' | 'friends' | 'none';
  locationSharing?: boolean;
  preciseLocation?: boolean;
  travelPlansVisibility?: 'everyone' | 'friends' | 'me';
  showActivityStatus?: boolean;
  showTypingIndicators?: boolean;
  showReadReceipts?: boolean;
  fieldVisibility?: FieldVisibility;
}

export interface PrivacyFilterOptions {
  isPublicView: boolean;
  isFriend?: boolean;
  isOwnProfile: boolean;
}

/**
 * Determines if a field should be visible based on privacy settings
 */
export function isFieldVisible(
  fieldVisibility: PrivacyLevel | undefined,
  options: PrivacyFilterOptions
): boolean {
  const { isPublicView, isFriend = false, isOwnProfile } = options;
  
  // Owner always sees everything in private view
  if (isOwnProfile && !isPublicView) {
    return true;
  }
  
  const visibility = fieldVisibility || 'public';
  
  switch (visibility) {
    case 'public':
      return true;
    case 'friends':
      // In public view simulation, treat as not-a-friend
      return isPublicView ? false : isFriend;
    case 'private':
      return false;
    default:
      return true;
  }
}

/**
 * Returns placeholder text for hidden fields
 */
export function getPrivacyPlaceholder(
  fieldVisibility: PrivacyLevel | undefined,
  fieldName: string
): string {
  const visibility = fieldVisibility || 'public';
  
  switch (visibility) {
    case 'friends':
      return `${fieldName} visible to friends only`;
    case 'private':
      return `${fieldName} hidden`;
    default:
      return '';
  }
}

/**
 * Hook to filter user fields based on privacy settings
 */
export function usePrivacyFilter(
  privacySettings: PrivacySettings | undefined,
  options: PrivacyFilterOptions
) {
  const fieldVisibility = privacySettings?.fieldVisibility || {};
  
  const checkVisibility = (field: keyof FieldVisibility): boolean => {
    return isFieldVisible(fieldVisibility[field], options);
  };
  
  const getPlaceholder = (field: keyof FieldVisibility, displayName: string): string => {
    if (checkVisibility(field)) return '';
    return getPrivacyPlaceholder(fieldVisibility[field], displayName);
  };
  
  // Check section-level visibility
  const isFriendsListVisible = (): boolean => {
    if (options.isOwnProfile && !options.isPublicView) return true;
    const visibility = privacySettings?.friendsListVisibility || 'everyone';
    if (visibility === 'everyone') return true;
    if (visibility === 'friends') return options.isFriend || false;
    return false; // 'me'
  };
  
  const isEventsVisible = (): boolean => {
    if (options.isOwnProfile && !options.isPublicView) return true;
    const visibility = privacySettings?.eventsVisibility || 'everyone';
    if (visibility === 'everyone') return true;
    if (visibility === 'friends') return options.isFriend || false;
    return false; // 'me'
  };
  
  const isTravelPlansVisible = (): boolean => {
    if (options.isOwnProfile && !options.isPublicView) return true;
    const visibility = privacySettings?.travelPlansVisibility || 'everyone';
    if (visibility === 'everyone') return true;
    if (visibility === 'friends') return options.isFriend || false;
    return false; // 'me'
  };
  
  return {
    // Field-level checks
    isBioVisible: checkVisibility('bio'),
    isOccupationVisible: checkVisibility('occupation'),
    isLocationVisible: checkVisibility('location'),
    isLanguagesVisible: checkVisibility('languages'),
    isEmailVisible: checkVisibility('email'),
    isPhoneVisible: checkVisibility('phone'),
    isSocialLinksVisible: checkVisibility('socialLinks'),
    isTangoRolesVisible: checkVisibility('tangoRoles') && checkVisibility('tango'),
    
    // Section-level checks
    isFriendsListVisible: isFriendsListVisible(),
    isEventsVisible: isEventsVisible(),
    isTravelPlansVisible: isTravelPlansVisible(),
    
    // Placeholder text generators
    getBioPlaceholder: () => getPlaceholder('bio', 'Bio'),
    getOccupationPlaceholder: () => getPlaceholder('occupation', 'Occupation'),
    getLocationPlaceholder: () => getPlaceholder('location', 'Location'),
    getLanguagesPlaceholder: () => getPlaceholder('languages', 'Languages'),
    getEmailPlaceholder: () => getPlaceholder('email', 'Email'),
    getPhonePlaceholder: () => getPlaceholder('phone', 'Phone'),
    getSocialLinksPlaceholder: () => getPlaceholder('socialLinks', 'Social links'),
    getTangoRolesPlaceholder: () => getPlaceholder('tango', 'Tango roles'),
    
    // Raw settings access
    fieldVisibility,
    privacySettings,
    
    // Helper to check any field
    checkField: checkVisibility,
    getFieldPlaceholder: getPlaceholder,
  };
}

export default usePrivacyFilter;
