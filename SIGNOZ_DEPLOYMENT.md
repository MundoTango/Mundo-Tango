# SigNoz Monitoring Platform Deployment

## Overview
This document describes the complete OpenTelemetry instrumentation and SigNoz monitoring platform deployment for the Mundo Tango application.

## Architecture

The monitoring stack consists of:
- **Backend Instrumentation**: Node.js/Express server with OpenTelemetry SDK
- **Frontend Instrumentation**: React browser instrumentation with OTLP exporter
- **Trace Collection**: OTLP HTTP exporter sending traces to SigNoz
- **Custom Metrics**: Route-level tracing and AI operation tracking

## Backend Instrumentation

### 1. OpenTelemetry SDK Setup

**File**: `server/instrumentation.ts`

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

**Critical**: This file MUST be imported FIRST in `server/index.ts` before any other imports.

### 2. Custom Tracing Middleware

**File**: `server/metrics/tracing.ts`

Provides two key functions:
- `traceRoute(routeName)`: Middleware for HTTP route tracing
- `traceAIOperation(operationName, fn)`: Wrapper for AI operation tracing

### 3. Instrumented Routes

The following critical routes are instrumented with custom tracing:

**Mr. Blue Routes** (`server/routes/mrBlue.ts`):
- `/chat` - AI chat interactions

**Autonomous Workflow Routes** (`server/routes/autonomous.ts`):
- `/execute` - Autonomous task execution
- `/status/:taskId` - Task status polling

**Visual Editor Routes** (`server/routes/visualEditor.ts`):
- `/generate` - AI code generation
- `/apply-change` - Live preview changes

## Frontend Instrumentation

### 1. Browser Tracing Setup

**File**: `client/src/instrumentation.ts`

Features:
- Document load instrumentation
- User interaction tracking (clicks, form submissions)
- Automatic trace batching and export to `/api/traces`

### 2. Trace Proxy Endpoint

**File**: `server/routes/traces.ts`

Receives frontend traces and forwards them to the OTLP collector. This allows frontend traces to be sent through the backend, avoiding CORS issues.

## Configuration

### Environment Variables

```bash
# OTLP Exporter Endpoint (SigNoz collector)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces

# For cloud-hosted SigNoz
# OTEL_EXPORTER_OTLP_ENDPOINT=https://ingest.{region}.signoz.cloud:443/v1/traces
```

### SigNoz Cloud Setup

1. **Sign up for SigNoz Cloud**: https://signoz.io/teams/
2. **Get your ingestion endpoint**: 
   - Navigate to Settings > Ingestion Settings
   - Copy the OTLP endpoint URL
3. **Set environment variable**:
   ```bash
   export OTEL_EXPORTER_OTLP_ENDPOINT=<your-signoz-endpoint>
   ```

### Local SigNoz Setup (Docker)

**File**: `docker-compose.signoz.yml`

For local development, you can run SigNoz using Docker Compose:

```bash
docker-compose -f docker-compose.signoz.yml up -d
```

This will start:
- OTLP Collector on ports 4317 (gRPC) and 4318 (HTTP)
- Query Service on port 8080
- Frontend UI on port 3301

## Instrumented Operations

### Backend Traces

1. **HTTP Routes**
   - Method, URL, user agent
   - Status code
   - Response time
   - Error conditions

2. **AI Operations**
   - Chat interactions
   - Code generation
   - Autonomous task execution

### Frontend Traces

1. **Document Load**
   - Page load time
   - Resource timing
   - First contentful paint

2. **User Interactions**
   - Button clicks
   - Form submissions
   - Input changes

## Viewing Traces in SigNoz

### SigNoz Dashboard Access

**Cloud**: https://your-org.signoz.cloud
**Local**: http://localhost:3301

### Key Dashboards

1. **Services Overview**
   - Service map showing frontend → backend → database
   - Request rate, error rate, latency (RED metrics)

2. **Traces View**
   - Distributed traces across services
   - Span timeline and waterfall view
   - Filter by service, operation, status

3. **Custom Metrics**
   - Mr. Blue chat response times
   - Autonomous workflow execution duration
   - Visual editor generation latency

## Monitoring Best Practices

### What to Monitor

1. **API Performance**
   - P50, P95, P99 latencies for critical routes
   - Error rates by endpoint
   - Request throughput

2. **AI Operations**
   - LLM API call duration
   - Token usage patterns
   - Error rates by AI provider

3. **User Experience**
   - Page load times
   - Interaction latency
   - Client-side errors

### Setting Up Alerts

Example alert configurations:

```yaml
# High error rate
- name: high_error_rate
  condition: error_rate > 5%
  window: 5m
  
# Slow API responses
- name: slow_api
  condition: p95_latency > 2s
  window: 5m
  
# AI operation failures
- name: ai_failures
  condition: ai_error_rate > 10%
  window: 10m
```

## Troubleshooting

### No traces appearing

1. **Check OTLP endpoint**:
   ```bash
   echo $OTEL_EXPORTER_OTLP_ENDPOINT
   ```

2. **Verify server logs**:
   ```
   [OpenTelemetry] Tracing initialized
   [OpenTelemetry] Exporting to: <endpoint>
   ```

3. **Test OTLP endpoint**:
   ```bash
   curl -X POST $OTEL_EXPORTER_OTLP_ENDPOINT \
     -H "Content-Type: application/json" \
     -d '{"test": "connection"}'
   ```

### Frontend traces not appearing

1. **Check browser console** for errors
2. **Verify `/api/traces` endpoint** is accessible
3. **Check network tab** for failed trace exports

### High trace volume

1. **Implement sampling**:
   ```typescript
   import { ParentBasedSampler, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';
   
   const sdk = new NodeSDK({
     // Sample 10% of traces
     sampler: new ParentBasedSampler({
       root: new TraceIdRatioBasedSampler(0.1),
     }),
     // ... rest of config
   });
   ```

2. **Filter noisy endpoints**:
   ```typescript
   '@opentelemetry/instrumentation-http': {
     ignoreIncomingPaths: [
       '/health',
       '/metrics',
       '/favicon.ico',
     ],
   }
   ```

## Performance Impact

### Backend
- Overhead: ~1-2ms per request
- Memory: ~50MB additional
- CPU: Minimal (<5% increase)

### Frontend
- Bundle size: ~100KB (gzipped: ~30KB)
- Performance: Negligible impact on user experience
- Batched exports reduce network overhead

## Migration from Prometheus

### Removed Components
- Prometheus scraping endpoint (still available at `/metrics` for legacy)
- Grafana dashboards (replaced by SigNoz)

### Benefits
- **Unified observability**: Traces, metrics, and logs in one platform
- **Distributed tracing**: See entire request flow across services
- **Better debugging**: Root cause analysis with trace context
- **Lower complexity**: No separate Prometheus+Grafana setup

## Next Steps

1. **Create Custom Dashboards**
   - Mr. Blue performance metrics
   - Autonomous workflow analytics
   - User journey visualization

2. **Set Up Alerts**
   - Critical error thresholds
   - Performance degradation
   - Resource utilization

3. **Optimize Sampling**
   - Tune sampling rates for production
   - Implement intelligent sampling (always sample errors)

4. **Integrate Logs**
   - Add OpenTelemetry logging
   - Correlate logs with traces

## Resources

- [SigNoz Documentation](https://signoz.io/docs/)
- [OpenTelemetry JS](https://opentelemetry.io/docs/instrumentation/js/)
- [OTLP Specification](https://opentelemetry.io/docs/reference/specification/protocol/otlp/)
