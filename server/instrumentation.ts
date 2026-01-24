import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations({
    // Disable DNS instrumentation to avoid ENOTSUP error on macOS
    '@opentelemetry/instrumentation-dns': { enabled: false },
  })],
});

sdk.start();

console.log('[OpenTelemetry] Tracing initialized');
console.log(`[OpenTelemetry] Exporting to: ${process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces'}`);

// SIGTERM handler - graceful shutdown
process.on('SIGTERM', () => {
  console.log('[OpenTelemetry] SIGTERM received, shutting down...');
  sdk
    .shutdown()
    .then(() => console.log('[OpenTelemetry] Shutdown complete'))
    .catch((error) => console.error('[OpenTelemetry] Error shutting down', error))
    .finally(() => process.exit(0));
});

// Listen for beforeExit to prevent premature shutdown
process.on('beforeExit', (code) => {
  console.log(`[OpenTelemetry] beforeExit with code: ${code}`);
});

export default sdk;
