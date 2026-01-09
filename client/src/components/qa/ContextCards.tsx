/**
 * ContextCards - Collapsible diagnostic context display
 * Shows user, API, errors, and app state in organized cards
 * MB.MD Pattern 67: Universal Bug Diagnostic System
 */

import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  User, 
  Globe, 
  AlertTriangle, 
  Database,
  Check,
  X,
  Clock,
  Shield,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserContext, APICallRecord, ErrorRecord } from '@/lib/qa/componentRegistry';

interface ContextCardsProps {
  userContext?: UserContext;
  apiCalls?: APICallRecord[];
  errors?: ErrorRecord[];
  appState?: Record<string, unknown>;
  compact?: boolean;
}

interface CollapsibleCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'error';
}

function CollapsibleCard({ 
  title, 
  icon, 
  children, 
  defaultOpen = false,
  badge,
  badgeVariant = 'default'
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const badgeColors = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    error: 'bg-red-500/20 text-red-400'
  };
  
  return (
    <div className="border rounded-md overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 p-2 text-sm hover:bg-muted/50 transition-colors"
      >
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <span className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{title}</span>
        </span>
        {badge && (
          <span className={cn("ml-auto px-2 py-0.5 text-xs rounded-full", badgeColors[badgeVariant])}>
            {badge}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="p-2 pt-0 border-t bg-muted/20">
          {children}
        </div>
      )}
    </div>
  );
}

function UserContextCard({ context }: { context: UserContext }) {
  return (
    <CollapsibleCard 
      title="User Context" 
      icon={<User className="h-4 w-4" />}
      defaultOpen={true}
      badge={context.tier.toUpperCase()}
      badgeVariant={context.tier === 'god' ? 'success' : context.tier === 'pro' ? 'success' : 'default'}
    >
      <div className="grid grid-cols-2 gap-2 text-xs mt-2">
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3 text-muted-foreground" />
          <span>Tier:</span>
          <span className="font-medium">{context.tier}</span>
        </div>
        <div className="flex items-center gap-1">
          {context.isVerified ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <X className="h-3 w-3 text-red-500" />
          )}
          <span>Verified:</span>
          <span className="font-medium">{context.isVerified ? 'Yes' : 'No'}</span>
        </div>
        {context.cityName && (
          <div className="flex items-center gap-1 col-span-2">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span>City:</span>
            <span className="font-medium">{context.cityName}</span>
          </div>
        )}
        <div className="flex items-center gap-1 col-span-2">
          <Database className="h-3 w-3 text-muted-foreground" />
          <span>Profile:</span>
          <span className="font-medium">{context.profileComplete ? 'Complete' : 'Incomplete'}</span>
        </div>
        {context.permissions.length > 0 && (
          <div className="col-span-2 flex flex-wrap gap-1 mt-1">
            {context.permissions.map(perm => (
              <span key={perm} className="px-1.5 py-0.5 bg-muted rounded text-xs">
                {perm}
              </span>
            ))}
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}

function APICallsCard({ calls }: { calls: APICallRecord[] }) {
  const failedCalls = calls.filter(c => c.status >= 400 || c.status === 0);
  const successCalls = calls.filter(c => c.status >= 200 && c.status < 400);
  
  return (
    <CollapsibleCard 
      title="API Calls" 
      icon={<Globe className="h-4 w-4" />}
      badge={failedCalls.length > 0 ? `${failedCalls.length} failed` : `${calls.length} calls`}
      badgeVariant={failedCalls.length > 0 ? 'error' : 'default'}
    >
      <div className="space-y-1 mt-2 max-h-40 overflow-y-auto">
        {calls.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No API calls recorded</p>
        ) : (
          calls.slice(-10).map((call, idx) => (
            <div 
              key={`${call.timestamp}-${idx}`}
              className={cn(
                "text-xs p-1.5 rounded flex items-center gap-2",
                call.status >= 400 || call.status === 0 
                  ? "bg-red-500/10 border border-red-500/20" 
                  : "bg-muted/50"
              )}
            >
              <span className={cn(
                "px-1 rounded text-xs font-mono",
                call.status >= 400 || call.status === 0 ? "text-red-400" : "text-green-400"
              )}>
                {call.status || 'ERR'}
              </span>
              <span className="font-medium text-muted-foreground">{call.method}</span>
              <span className="truncate flex-1">{call.url.replace('/api/', '')}</span>
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {call.duration}ms
              </span>
            </div>
          ))
        )}
      </div>
    </CollapsibleCard>
  );
}

function ErrorsCard({ errors }: { errors: ErrorRecord[] }) {
  if (errors.length === 0) {
    return (
      <CollapsibleCard 
        title="Errors" 
        icon={<AlertTriangle className="h-4 w-4" />}
        badge="None"
        badgeVariant="success"
      >
        <p className="text-xs text-muted-foreground italic mt-2">No errors detected</p>
      </CollapsibleCard>
    );
  }
  
  return (
    <CollapsibleCard 
      title="Errors" 
      icon={<AlertTriangle className="h-4 w-4" />}
      defaultOpen={true}
      badge={`${errors.length} errors`}
      badgeVariant="error"
    >
      <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
        {errors.map((error, idx) => (
          <div 
            key={`${error.timestamp}-${idx}`}
            className="text-xs p-2 bg-red-500/10 border border-red-500/20 rounded"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="px-1 bg-red-500/20 text-red-400 rounded text-xs uppercase">
                {error.type}
              </span>
              {error.componentName && (
                <span className="text-muted-foreground">
                  in {error.componentName}
                </span>
              )}
            </div>
            <p className="text-red-300 break-words">
              {error.message.substring(0, 200)}
              {error.message.length > 200 && '...'}
            </p>
          </div>
        ))}
      </div>
    </CollapsibleCard>
  );
}

function AppStateCard({ state }: { state: Record<string, unknown> }) {
  return (
    <CollapsibleCard 
      title="App State" 
      icon={<Database className="h-4 w-4" />}
    >
      <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-x-auto max-h-32 overflow-y-auto">
        {JSON.stringify(state, null, 2)}
      </pre>
    </CollapsibleCard>
  );
}

export function ContextCards({ 
  userContext, 
  apiCalls = [], 
  errors = [], 
  appState = {},
  compact = false 
}: ContextCardsProps) {
  if (compact) {
    // Compact mode: Show summary badges only
    const failedApiCount = apiCalls.filter(c => c.status >= 400 || c.status === 0).length;
    
    return (
      <div className="flex flex-wrap gap-2 text-xs">
        {userContext && (
          <span className="px-2 py-1 bg-muted rounded-full flex items-center gap-1">
            <User className="h-3 w-3" />
            {userContext.tier}
            {userContext.cityName && ` • ${userContext.cityName}`}
          </span>
        )}
        <span className={cn(
          "px-2 py-1 rounded-full flex items-center gap-1",
          failedApiCount > 0 ? "bg-red-500/20 text-red-400" : "bg-muted"
        )}>
          <Globe className="h-3 w-3" />
          {apiCalls.length} calls {failedApiCount > 0 && `(${failedApiCount} failed)`}
        </span>
        {errors.length > 0 && (
          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {errors.length} errors
          </span>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {userContext && <UserContextCard context={userContext} />}
      <APICallsCard calls={apiCalls} />
      <ErrorsCard errors={errors} />
      {Object.keys(appState).length > 0 && <AppStateCard state={appState} />}
    </div>
  );
}

export default ContextCards;
