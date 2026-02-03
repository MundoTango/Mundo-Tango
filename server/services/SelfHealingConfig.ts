/**
 * Self-Healing Configuration Service (Wave 4E)
 * 
 * Provides production toggle for self-healing features.
 * Allows enabling/disabling self-healing based on environment.
 * 
 * MB.MD v3.1 - VibeCoding Evolution
 */

export interface SelfHealingConfigState {
  enabled: boolean;
  environment: 'development' | 'production' | 'test';
  maxRetries: number;
  retryDelay: number;
  autoFixEnabled: boolean;
  loggingLevel: 'verbose' | 'normal' | 'minimal';
  features: {
    patternMatching: boolean;
    autoFix: boolean;
    retryManager: boolean;
    logAnalyzer: boolean;
    schemaValidator: boolean;
    dependencyChecker: boolean;
    apiHealthMonitor: boolean;
    memoryManager: boolean;
    sessionHealer: boolean;
    workflowRecovery: boolean;
  };
}

const DEFAULT_CONFIG: SelfHealingConfigState = {
  enabled: true,
  environment: 'development',
  maxRetries: 3,
  retryDelay: 1000,
  autoFixEnabled: true,
  loggingLevel: 'normal',
  features: {
    patternMatching: true,
    autoFix: true,
    retryManager: true,
    logAnalyzer: true,
    schemaValidator: true,
    dependencyChecker: true,
    apiHealthMonitor: true,
    memoryManager: true,
    sessionHealer: true,
    workflowRecovery: true
  }
};

const PRODUCTION_CONFIG: SelfHealingConfigState = {
  enabled: true,
  environment: 'production',
  maxRetries: 5,
  retryDelay: 2000,
  autoFixEnabled: true,
  loggingLevel: 'minimal',
  features: {
    patternMatching: true,
    autoFix: true,
    retryManager: true,
    logAnalyzer: true,
    schemaValidator: false,
    dependencyChecker: false,
    apiHealthMonitor: true,
    memoryManager: true,
    sessionHealer: true,
    workflowRecovery: true
  }
};

class SelfHealingConfigService {
  private config: SelfHealingConfigState;
  private overrides: Partial<SelfHealingConfigState> = {};

  constructor() {
    const isProd = process.env.NODE_ENV === 'production';
    this.config = isProd ? { ...PRODUCTION_CONFIG } : { ...DEFAULT_CONFIG };
    console.log(`[SelfHealingConfig] Initialized for ${this.config.environment}`);
  }

  getConfig(): SelfHealingConfigState {
    return { ...this.config, ...this.overrides };
  }

  isEnabled(): boolean {
    return this.getConfig().enabled;
  }

  isFeatureEnabled(feature: keyof SelfHealingConfigState['features']): boolean {
    const config = this.getConfig();
    return config.enabled && config.features[feature];
  }

  enable(): void {
    this.overrides.enabled = true;
    console.log('[SelfHealingConfig] Self-healing ENABLED');
  }

  disable(): void {
    this.overrides.enabled = false;
    console.log('[SelfHealingConfig] Self-healing DISABLED');
  }

  toggle(): boolean {
    const current = this.getConfig().enabled;
    if (current) {
      this.disable();
    } else {
      this.enable();
    }
    return !current;
  }

  setEnvironment(env: 'development' | 'production' | 'test'): void {
    if (env === 'production') {
      this.config = { ...PRODUCTION_CONFIG };
    } else {
      this.config = { ...DEFAULT_CONFIG };
    }
    this.config.environment = env;
    console.log(`[SelfHealingConfig] Environment set to ${env}`);
  }

  setMaxRetries(retries: number): void {
    this.overrides.maxRetries = Math.max(1, Math.min(10, retries));
    console.log(`[SelfHealingConfig] Max retries set to ${this.overrides.maxRetries}`);
  }

  setAutoFix(enabled: boolean): void {
    this.overrides.autoFixEnabled = enabled;
    console.log(`[SelfHealingConfig] Auto-fix ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  setLoggingLevel(level: 'verbose' | 'normal' | 'minimal'): void {
    this.overrides.loggingLevel = level;
    console.log(`[SelfHealingConfig] Logging level set to ${level}`);
  }

  enableFeature(feature: keyof SelfHealingConfigState['features']): void {
    if (!this.overrides.features) {
      this.overrides.features = { ...this.config.features };
    }
    (this.overrides.features as any)[feature] = true;
    console.log(`[SelfHealingConfig] Feature ${feature} ENABLED`);
  }

  disableFeature(feature: keyof SelfHealingConfigState['features']): void {
    if (!this.overrides.features) {
      this.overrides.features = { ...this.config.features };
    }
    (this.overrides.features as any)[feature] = false;
    console.log(`[SelfHealingConfig] Feature ${feature} DISABLED`);
  }

  resetToDefaults(): void {
    this.overrides = {};
    const isProd = process.env.NODE_ENV === 'production';
    this.config = isProd ? { ...PRODUCTION_CONFIG } : { ...DEFAULT_CONFIG };
    console.log('[SelfHealingConfig] Reset to defaults');
  }

  getStatus(): {
    enabled: boolean;
    environment: string;
    activeFeatures: string[];
    disabledFeatures: string[];
    hasOverrides: boolean;
  } {
    const config = this.getConfig();
    const activeFeatures: string[] = [];
    const disabledFeatures: string[] = [];

    for (const [key, value] of Object.entries(config.features)) {
      if (value) {
        activeFeatures.push(key);
      } else {
        disabledFeatures.push(key);
      }
    }

    return {
      enabled: config.enabled,
      environment: config.environment,
      activeFeatures,
      disabledFeatures,
      hasOverrides: Object.keys(this.overrides).length > 0
    };
  }
}

export const selfHealingConfigService = new SelfHealingConfigService();
