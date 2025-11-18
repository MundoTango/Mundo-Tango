/**
 * Self-Healing Hook
 * MB.MD v9.0 - November 18, 2025
 * 
 * Triggers complete self-healing cycle on page load
 */

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

export interface SelfHealingResult {
  pageId: string;
  agentsActivated: number;
  activationTime: number;
  auditResults: any;
  auditTime: number;
  healingApplied: boolean;
  healingTime?: number;
  issuesFixed?: number;
  uxValidationPassed: boolean;
  preCheckStarted: boolean;
  totalTime: number;
}

export function useSelfHealing(route: string, enabled: boolean = true) {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SelfHealingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const runSelfHealing = async () => {
      setIsRunning(true);
      setError(null);

      try {
        console.log(`🔧 [useSelfHealing] Triggering self-healing for route: ${route}`);

        const response = await apiRequest<{ success: boolean; result: SelfHealingResult }>(
          '/api/admin/self-healing/orchestrate',
          {
            method: 'POST',
            body: JSON.stringify({ route })
          }
        );

        if (response.success) {
          setResult(response.result);
          console.log(`✅ [useSelfHealing] Self-healing complete:`, response.result);
        } else {
          throw new Error('Self-healing failed');
        }
      } catch (err: any) {
        console.error(`❌ [useSelfHealing] Error:`, err);
        setError(err.message || 'Self-healing failed');
      } finally {
        setIsRunning(false);
      }
    };

    runSelfHealing();
  }, [route, enabled]);

  return {
    isRunning,
    result,
    error
  };
}
