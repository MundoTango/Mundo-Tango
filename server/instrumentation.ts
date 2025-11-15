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

console.log('[OpenTelemetry] Tracing initialized');
console.log(`[OpenTelemetry] Exporting to: ${process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces'}`);

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('[OpenTelemetry] Shutdown complete'))
    .catch((error) => console.error('[OpenTelemetry] Error shutting down', error))
    .finally(() => process.exit(0));
});

export default sdk;
