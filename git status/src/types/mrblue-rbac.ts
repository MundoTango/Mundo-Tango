/**
 * Mr. Blue RBAC (Role-Based Access Control) Types
 * Defines permissions for different Mr. Blue contexts
 */

export type MrBlueRole = 
  | 'visual_editor'  // Visual Editor context - full UI/UX editing powers
  | 'general_user'   // General chat - standard user interactions
  | 'admin'          // Admin powers - full platform control
  | 'developer';     // Developer mode - code generation, debugging

export interface MrBluePermissions {
  // Code generation abilities
  canGenerateCode: boolean;
  canModifyFiles: boolean;
  canExecuteCommands: boolean;
  
  // Visual editing abilities
  canEditElements: boolean;
  canEditStyles: boolean;
  canEditLayout: boolean;
  
  // Database abilities
  canModifyDatabase: boolean;
  canViewAnalytics: boolean;
  
  // Voice abilities
  canUseVoice: boolean;
  canUseVoiceCommands: boolean;
  
  // Advanced features
  canUseAutonomousMode: boolean;
  canUseVibeCoding: boolean;
  canAccessMemory: boolean;
  
  // UI customization
  showWorkflowPanel: boolean;
  show3DAvatar: boolean;
  showContextPanel: boolean;
}

/**
 * Get permissions for a specific Mr. Blue role
 */
export function getMrBluePermissions(role: MrBlueRole): MrBluePermissions {
  switch (role) {
    case 'visual_editor':
      return {
        canGenerateCode: true,
        canModifyFiles: true,
        canExecuteCommands: false,
        canEditElements: true,
        canEditStyles: true,
        canEditLayout: true,
        canModifyDatabase: false,
        canViewAnalytics: true,
        canUseVoice: true,
        canUseVoiceCommands: true,
        canUseAutonomousMode: true,
        canUseVibeCoding: true,
        canAccessMemory: true,
        showWorkflowPanel: true,
        show3DAvatar: false,
        showContextPanel: true,
      };
    
    case 'general_user':
      return {
        canGenerateCode: false,
        canModifyFiles: false,
        canExecuteCommands: false,
        canEditElements: false,
        canEditStyles: false,
        canEditLayout: false,
        canModifyDatabase: false,
        canViewAnalytics: false,
        canUseVoice: true,
        canUseVoiceCommands: false,
        canUseAutonomousMode: false,
        canUseVibeCoding: false,
        canAccessMemory: false,
        showWorkflowPanel: false,
        show3DAvatar: true,
        showContextPanel: false,
      };
    
    case 'developer':
      return {
        canGenerateCode: true,
        canModifyFiles: true,
        canExecuteCommands: true,
        canEditElements: true,
        canEditStyles: true,
        canEditLayout: true,
        canModifyDatabase: true,
        canViewAnalytics: true,
        canUseVoice: true,
        canUseVoiceCommands: true,
        canUseAutonomousMode: true,
        canUseVibeCoding: true,
        canAccessMemory: true,
        showWorkflowPanel: true,
        show3DAvatar: false,
        showContextPanel: true,
      };
    
    case 'admin':
      return {
        canGenerateCode: true,
        canModifyFiles: true,
        canExecuteCommands: true,
        canEditElements: true,
        canEditStyles: true,
        canEditLayout: true,
        canModifyDatabase: true,
        canViewAnalytics: true,
        canUseVoice: true,
        canUseVoiceCommands: true,
        canUseAutonomousMode: true,
        canUseVibeCoding: true,
        canAccessMemory: true,
        showWorkflowPanel: true,
        show3DAvatar: true,
        showContextPanel: true,
      };
  }
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: MrBlueRole,
  permission: keyof MrBluePermissions
): boolean {
  const permissions = getMrBluePermissions(role);
  return permissions[permission];
}
