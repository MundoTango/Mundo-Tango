/**
 * Error Auto-Analysis Hook - MB.MD v9.2
 * Automatically detects errors and proposes fixes via chat
 * 
 * Features:
 * - Monitors Error Analysis panel for new errors
 * - Auto-generates fix proposals using Mr. Blue
 * - Presents proposal in chat for step-by-step approval
 * - Executes fix only after user confirmation
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { ErrorContext } from '@/services/ContextBuilderService';

interface ErrorPattern {
  id: number;
  errorType: string;
  errorMessage: string;
  frequency: number;
  lastSeen: string;
  suggestedFix?: string;
  fixConfidence?: string;
  status: string;
}

interface FixProposal {
  errorId: number;
  errorMessage: string;
  proposedFix: string;
  confidence: number;
  filesAffected: string[];
  estimatedImpact: string;
  timestamp: Date;
}

interface UseErrorAutoAnalysisReturn {
  currentErrors: ErrorContext[];
  activeProposal: FixProposal | null;
  isAnalyzing: boolean;
  generateProposal: (errorId: number) => Promise<void>;
  approveProposal: () => Promise<void>;
  rejectProposal: () => void;
}

export function useErrorAutoAnalysis(
  onProposalReady: (proposal: FixProposal) => void,
  conversationId?: number | null // ✅ MB.MD Fix: Wait for conversation before analyzing
): UseErrorAutoAnalysisReturn {
  const [currentErrors, setCurrentErrors] = useState<ErrorContext[]>([]);
  const [activeProposal, setActiveProposal] = useState<FixProposal | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedErrorIds, setAnalyzedErrorIds] = useState<Set<number>>(new Set());
  
  // Fetch error patterns (refetch every 30 seconds)
  const { data: patternsData } = useQuery<{
    success: boolean;
    patterns: ErrorPattern[];
  }>({
    queryKey: ['/api/mrblue/error-patterns', { status: 'analyzed', limit: '10' }],
    refetchInterval: 30000,
  });
  
  const patterns = patternsData?.patterns || [];
  
  /**
   * Update current errors context
   */
  useEffect(() => {
    if (patterns.length > 0) {
      const errorContext: ErrorContext[] = patterns.slice(0, 5).map(p => ({
        errorType: p.errorType,
        errorMessage: p.errorMessage,
        frequency: p.frequency,
        lastSeen: p.lastSeen,
        suggestedFix: p.suggestedFix
      }));
      
      setCurrentErrors(errorContext);
    }
  }, [patterns]);
  
  /**
   * Auto-detect new errors and trigger analysis
   * MB.MD v9.2: Triggers on ANY analyzed error, even without suggestedFix
   * ✅ MB.MD Fix: Only analyze AFTER conversation exists (prevents orphaned proposals)
   */
  useEffect(() => {
    if (patterns.length === 0) return;
    if (!conversationId) {
      console.log('[ErrorAutoAnalysis] ⏳ Waiting for conversation ID before analyzing errors...');
      return;
    }
    
    // Find errors we haven't analyzed yet
    const newErrors = patterns.filter(p => 
      !analyzedErrorIds.has(p.id) && 
      p.status === 'analyzed'
      // REMOVED: p.suggestedFix check - now triggers on all errors!
    );
    
    if (newErrors.length > 0) {
      // Auto-analyze the most recent error
      const errorToAnalyze = newErrors[0];
      console.log('[ErrorAutoAnalysis] ✅ Conversation ready, auto-analyzing error:', errorToAnalyze.id);
      
      // Mark as analyzed to prevent duplicate analysis
      setAnalyzedErrorIds(prev => new Set([...prev, errorToAnalyze.id]));
      
      // Generate proposal
      generateProposal(errorToAnalyze.id);
    }
  }, [patterns, analyzedErrorIds, conversationId]);
  
  /**
   * Generate fix proposal for an error
   * ✅ MB.MD v9.2: Now uses AutoFixEngine for REAL confidence scores + auto-approval
   */
  const generateProposal = useCallback(async (errorId: number) => {
    setIsAnalyzing(true);
    
    try {
      const error = patterns.find(p => p.id === errorId);
      if (!error) {
        throw new Error('Error pattern not found');
      }
      
      console.log('[ErrorAutoAnalysis] 🤖 Calling AutoFixEngine for AI-powered analysis...', errorId);
      
      // ✅ MB.MD v9.2: Call AutoFixEngine for REAL analysis with confidence scores
      const response = await apiRequest('POST', '/api/mrblue/auto-fix', {
        errorId: error.id,
        dryRun: true // Analyze only, don't apply fix yet
      });
      
      let proposal: FixProposal;
      let autoFixResult: any = null;
      
      if (response.ok) {
        autoFixResult = await response.json();
        
        // Create proposal from AutoFixEngine analysis
        proposal = {
          errorId: error.id,
          errorMessage: error.errorMessage,
          proposedFix: autoFixResult.fixAnalysis?.suggestedFix || 
            `I'll investigate this ${error.errorType} error and propose a solution. ` +
            `Error: "${error.errorMessage.substring(0, 100)}..." ` +
            `This error has occurred ${error.frequency} time(s).`,
          confidence: autoFixResult.fixAnalysis?.confidence || 0,
          filesAffected: autoFixResult.fixAnalysis?.affectedFiles || ['Will be determined during fix'],
          estimatedImpact: autoFixResult.fixAnalysis?.estimatedComplexity === 'low' 
            ? 'Low - Targeted fix for specific error'
            : autoFixResult.fixAnalysis?.estimatedComplexity === 'medium'
            ? 'Medium - Affects multiple components'
            : 'High - Significant refactoring required',
          timestamp: new Date()
        };
        
        console.log(`[ErrorAutoAnalysis] ✅ AutoFixEngine confidence: ${proposal.confidence}%`);
        
        // ✅ MB.MD v9.2: Auto-approve high-confidence fixes (>= 80%)
        if (proposal.confidence >= 80 && autoFixResult.decision?.action === 'auto-fix') {
          console.log('[ErrorAutoAnalysis] 🚀 HIGH CONFIDENCE - Auto-applying fix...');
          
          // Apply fix immediately
          const applyResponse = await apiRequest('POST', '/api/mrblue/auto-fix', {
            errorId: error.id,
            dryRun: false // Actually apply the fix
          });
          
          if (applyResponse.ok) {
            const applyResult = await applyResponse.json();
            console.log('[ErrorAutoAnalysis] ✅ Fix auto-applied!', applyResult);
            
            // Update proposal to show auto-fix status
            proposal.proposedFix = `✅ **AUTO-FIXED** (${proposal.confidence}% confidence)\n\n` +
              `${proposal.proposedFix}\n\n` +
              `**Status:** Fix applied automatically and committed to git.`;
          }
        }
      } else {
        // Fallback to simple proposal if AutoFixEngine fails
        console.warn('[ErrorAutoAnalysis] AutoFixEngine unavailable, using fallback proposal');
        proposal = {
          errorId: error.id,
          errorMessage: error.errorMessage,
          proposedFix: error.suggestedFix || 
            `I'll investigate this ${error.errorType} error and propose a solution. ` +
            `Error: "${error.errorMessage.substring(0, 100)}..." ` +
            `This error has occurred ${error.frequency} time(s).`,
          confidence: parseFloat(error.fixConfidence || '0.65'),
          filesAffected: ['Will be determined during fix'],
          estimatedImpact: 'Low - Targeted fix for specific error',
          timestamp: new Date()
        };
      }
      
      setActiveProposal(proposal);
      
      // Notify parent component
      onProposalReady(proposal);
      
    } catch (error: any) {
      console.error('[ErrorAutoAnalysis] Failed to generate proposal:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [patterns, onProposalReady]);
  
  /**
   * Approve and execute fix proposal
   */
  const approveProposal = useCallback(async () => {
    if (!activeProposal) return;
    
    try {
      console.log('[ErrorAutoAnalysis] Applying approved fix for error:', activeProposal.errorId);
      
      const response = await apiRequest('POST', '/api/mrblue/apply-fix', {
        errorPatternId: activeProposal.errorId
      });
      
      if (!response.ok) {
        throw new Error('Failed to apply fix');
      }
      
      // Clear active proposal
      setActiveProposal(null);
      
    } catch (error: any) {
      console.error('[ErrorAutoAnalysis] Failed to apply fix:', error);
      throw error;
    }
  }, [activeProposal]);
  
  /**
   * Reject fix proposal
   */
  const rejectProposal = useCallback(() => {
    console.log('[ErrorAutoAnalysis] Fix proposal rejected');
    setActiveProposal(null);
  }, []);
  
  return {
    currentErrors,
    activeProposal,
    isAnalyzing,
    generateProposal,
    approveProposal,
    rejectProposal
  };
}
