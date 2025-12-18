/**
 * Mundo Tango Journey Schema & Parser
 * Defines YAML schema for customer journeys, marketing videos, and Mr. Blue tours
 * 
 * MB.MD Pattern 41: Parallel Execution
 * MB.MD Pattern 26: OSI - Using js-yaml for parsing
 * 
 * Usage: 
 *   import { parseJourney, JourneyDefinition } from './journey-schema';
 *   const journey = parseJourney('journeys/customer/event-discovery.yaml');
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export type JourneyType = 'customer' | 'marketing' | 'tour';

export interface JourneyStep {
  action: 'navigate' | 'click' | 'type' | 'scroll' | 'wait' | 'screenshot' | 'hover';
  target?: string;
  value?: string;
  delay?: number;
  description: string;
}

export interface JourneyDefinition {
  id: string;
  name: string;
  description: string;
  type: JourneyType;
  startPath: string;
  viewport?: {
    width: number;
    height: number;
  };
  steps: JourneyStep[];
  output: {
    filename: string;
    format: 'webm' | 'mp4';
    thumbnail?: boolean;
  };
  metadata?: {
    duration?: string;
    category?: string;
    tags?: string[];
    marketingUse?: boolean;
    facebookOptimized?: boolean;
  };
}

export interface JourneyManifest {
  journeys: Array<{
    id: string;
    name: string;
    description: string;
    type: JourneyType;
    videoFile: string;
    thumbnailFile?: string;
    duration?: string;
    recordedAt: string;
  }>;
  generatedAt: string;
}

const defaultViewport = { width: 1280, height: 720 };

export function parseJourney(filePath: string): JourneyDefinition {
  const absolutePath = path.isAbsolute(filePath) 
    ? filePath 
    : path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Journey file not found: ${absolutePath}`);
  }
  
  const content = fs.readFileSync(absolutePath, 'utf-8');
  const parsed = yaml.load(content) as Partial<JourneyDefinition>;
  
  return validateJourney(parsed, filePath);
}

export function parseAllJourneys(directory: string): JourneyDefinition[] {
  const absoluteDir = path.isAbsolute(directory)
    ? directory
    : path.join(process.cwd(), directory);
  
  if (!fs.existsSync(absoluteDir)) {
    return [];
  }
  
  const journeys: JourneyDefinition[] = [];
  
  function scanDirectory(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) {
        try {
          journeys.push(parseJourney(fullPath));
        } catch (err) {
          console.warn(`Warning: Failed to parse ${fullPath}:`, err);
        }
      }
    }
  }
  
  scanDirectory(absoluteDir);
  return journeys;
}

function validateJourney(data: Partial<JourneyDefinition>, filePath: string): JourneyDefinition {
  const errors: string[] = [];
  
  if (!data.id) errors.push('Missing required field: id');
  if (!data.name) errors.push('Missing required field: name');
  if (!data.description) errors.push('Missing required field: description');
  if (!data.startPath) errors.push('Missing required field: startPath');
  if (!data.steps || !Array.isArray(data.steps)) errors.push('Missing required field: steps (array)');
  
  if (errors.length > 0) {
    throw new Error(`Invalid journey file ${filePath}:\n  - ${errors.join('\n  - ')}`);
  }
  
  const type = data.type || inferTypeFromPath(filePath);
  
  return {
    id: data.id!,
    name: data.name!,
    description: data.description!,
    type,
    startPath: data.startPath!,
    viewport: data.viewport || defaultViewport,
    steps: data.steps!.map(validateStep),
    output: {
      filename: data.output?.filename || `${data.id}.mp4`,
      format: data.output?.format || 'mp4',
      thumbnail: data.output?.thumbnail ?? true,
    },
    metadata: data.metadata || {},
  };
}

function validateStep(step: Partial<JourneyStep>, index: number): JourneyStep {
  if (!step.action) {
    throw new Error(`Step ${index + 1} missing required field: action`);
  }
  
  const validActions = ['navigate', 'click', 'type', 'scroll', 'wait', 'screenshot', 'hover'];
  if (!validActions.includes(step.action)) {
    throw new Error(`Step ${index + 1} has invalid action: ${step.action}. Valid: ${validActions.join(', ')}`);
  }
  
  if (['click', 'type', 'hover'].includes(step.action) && !step.target) {
    throw new Error(`Step ${index + 1} (${step.action}) requires target selector`);
  }
  
  if (step.action === 'type' && !step.value) {
    throw new Error(`Step ${index + 1} (type) requires value`);
  }
  
  return {
    action: step.action,
    target: step.target,
    value: step.value,
    delay: step.delay || getDefaultDelay(step.action),
    description: step.description || `${step.action} ${step.target || ''}`.trim(),
  };
}

function getDefaultDelay(action: string): number {
  const delays: Record<string, number> = {
    navigate: 2000,
    click: 500,
    type: 100,
    scroll: 300,
    wait: 1000,
    screenshot: 0,
    hover: 500,
  };
  return delays[action] || 500;
}

function inferTypeFromPath(filePath: string): JourneyType {
  if (filePath.includes('/customer/')) return 'customer';
  if (filePath.includes('/marketing/')) return 'marketing';
  if (filePath.includes('/tour')) return 'tour';
  return 'customer';
}

export function generateManifest(journeys: Array<{
  definition: JourneyDefinition;
  videoFile: string;
  thumbnailFile?: string;
  recordedAt: Date;
}>): JourneyManifest {
  return {
    journeys: journeys.map(j => ({
      id: j.definition.id,
      name: j.definition.name,
      description: j.definition.description,
      type: j.definition.type,
      videoFile: j.videoFile,
      thumbnailFile: j.thumbnailFile,
      duration: j.definition.metadata?.duration,
      recordedAt: j.recordedAt.toISOString(),
    })),
    generatedAt: new Date().toISOString(),
  };
}

export function saveManifest(manifest: JourneyManifest, outputPath: string): void {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
}
