/**
 * Connector Registry Service (Pattern 77)
 * 
 * Manages external API connectors and integrations.
 * Provides a unified interface for Mr. Blue to interact with third-party services.
 * 
 * MB.MD v3.1 - VibeCoding Evolution
 */

export interface Connector {
  id: string;
  name: string;
  description: string;
  type: ConnectorType;
  baseUrl?: string;
  authType: AuthType;
  requiredSecrets: string[];
  endpoints: ConnectorEndpoint[];
  rateLimit?: RateLimitConfig;
  status: ConnectorStatus;
  lastHealthCheck?: Date;
}

export interface ConnectorEndpoint {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  requestSchema?: string;
  responseSchema?: string;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour?: number;
  concurrentRequests?: number;
}

export type ConnectorType = 
  | 'ai_provider'
  | 'database'
  | 'storage'
  | 'email'
  | 'payment'
  | 'analytics'
  | 'social'
  | 'communication'
  | 'search'
  | 'other';

export type AuthType = 
  | 'api_key'
  | 'oauth2'
  | 'basic'
  | 'bearer'
  | 'none';

export type ConnectorStatus = 
  | 'active'
  | 'inactive'
  | 'error'
  | 'rate_limited'
  | 'maintenance';

class ConnectorRegistryService {
  private connectors: Map<string, Connector> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeBuiltInConnectors();
    console.log('[ConnectorRegistry] Service initialized');
  }

  private initializeBuiltInConnectors(): void {
    const builtInConnectors: Connector[] = [
      {
        id: 'openai',
        name: 'OpenAI',
        description: 'GPT models for text generation and analysis',
        type: 'ai_provider',
        baseUrl: 'https://api.openai.com/v1',
        authType: 'bearer',
        requiredSecrets: ['OPENAI_API_KEY'],
        endpoints: [
          { name: 'chat', method: 'POST', path: '/chat/completions', description: 'Chat completions' },
          { name: 'embeddings', method: 'POST', path: '/embeddings', description: 'Text embeddings' }
        ],
        rateLimit: { requestsPerMinute: 60 },
        status: 'active'
      },
      {
        id: 'anthropic',
        name: 'Anthropic Claude',
        description: 'Claude models for advanced reasoning',
        type: 'ai_provider',
        baseUrl: 'https://api.anthropic.com/v1',
        authType: 'api_key',
        requiredSecrets: ['ANTHROPIC_API_KEY'],
        endpoints: [
          { name: 'messages', method: 'POST', path: '/messages', description: 'Send messages to Claude' }
        ],
        rateLimit: { requestsPerMinute: 50 },
        status: 'active'
      },
      {
        id: 'groq',
        name: 'Groq',
        description: 'Ultra-fast LLM inference',
        type: 'ai_provider',
        baseUrl: 'https://api.groq.com/openai/v1',
        authType: 'bearer',
        requiredSecrets: ['GROQ_API_KEY'],
        endpoints: [
          { name: 'chat', method: 'POST', path: '/chat/completions', description: 'Fast chat completions' }
        ],
        rateLimit: { requestsPerMinute: 100 },
        status: 'active'
      },
      {
        id: 'stripe',
        name: 'Stripe',
        description: 'Payment processing',
        type: 'payment',
        baseUrl: 'https://api.stripe.com/v1',
        authType: 'basic',
        requiredSecrets: ['STRIPE_SECRET_KEY'],
        endpoints: [
          { name: 'customers', method: 'POST', path: '/customers', description: 'Create customer' },
          { name: 'checkout', method: 'POST', path: '/checkout/sessions', description: 'Create checkout' }
        ],
        status: 'active'
      },
      {
        id: 'resend',
        name: 'Resend',
        description: 'Email delivery service',
        type: 'email',
        baseUrl: 'https://api.resend.com',
        authType: 'bearer',
        requiredSecrets: ['RESEND_API_KEY'],
        endpoints: [
          { name: 'send', method: 'POST', path: '/emails', description: 'Send email' }
        ],
        rateLimit: { requestsPerMinute: 100 },
        status: 'active'
      },
      {
        id: 'cloudinary',
        name: 'Cloudinary',
        description: 'Image and video management',
        type: 'storage',
        baseUrl: 'https://api.cloudinary.com/v1_1',
        authType: 'basic',
        requiredSecrets: ['CLOUDINARY_URL'],
        endpoints: [
          { name: 'upload', method: 'POST', path: '/image/upload', description: 'Upload image' }
        ],
        status: 'active'
      },
      {
        id: 'nominatim',
        name: 'OpenStreetMap Nominatim',
        description: 'Free geocoding service',
        type: 'search',
        baseUrl: 'https://nominatim.openstreetmap.org',
        authType: 'none',
        requiredSecrets: [],
        endpoints: [
          { name: 'search', method: 'GET', path: '/search', description: 'Geocode address' },
          { name: 'reverse', method: 'GET', path: '/reverse', description: 'Reverse geocode' }
        ],
        rateLimit: { requestsPerMinute: 60 },
        status: 'active'
      }
    ];

    for (const connector of builtInConnectors) {
      this.connectors.set(connector.id, connector);
    }
  }

  registerConnector(connector: Connector): void {
    this.connectors.set(connector.id, connector);
    console.log(`[ConnectorRegistry] Registered connector: ${connector.name}`);
  }

  getConnector(id: string): Connector | undefined {
    return this.connectors.get(id);
  }

  getConnectorsByType(type: ConnectorType): Connector[] {
    return Array.from(this.connectors.values()).filter(c => c.type === type);
  }

  getActiveConnectors(): Connector[] {
    return Array.from(this.connectors.values()).filter(c => c.status === 'active');
  }

  updateStatus(id: string, status: ConnectorStatus): void {
    const connector = this.connectors.get(id);
    if (connector) {
      connector.status = status;
      connector.lastHealthCheck = new Date();
    }
  }

  checkSecrets(id: string): { available: boolean; missing: string[] } {
    const connector = this.connectors.get(id);
    if (!connector) return { available: false, missing: [] };

    const missing: string[] = [];
    for (const secret of connector.requiredSecrets) {
      if (!process.env[secret]) {
        missing.push(secret);
      }
    }

    return { available: missing.length === 0, missing };
  }

  getAllConnectors(): Connector[] {
    return Array.from(this.connectors.values());
  }

  async healthCheck(id: string): Promise<boolean> {
    const connector = this.connectors.get(id);
    if (!connector) return false;

    const secretsCheck = this.checkSecrets(id);
    if (!secretsCheck.available) {
      this.updateStatus(id, 'inactive');
      return false;
    }

    this.updateStatus(id, 'active');
    return true;
  }
}

export const connectorRegistryService = new ConnectorRegistryService();
