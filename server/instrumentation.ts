// ============================================================================
// OPENTELEMETRY INSTRUMENTATION
// Only initialize when OTEL_EXPORTER_OTLP_ENDPOINT is configured.
// getNodeAutoInstrumentations() monkey-patches EVERY Node.js module 
// (HTTP, fs, dns, net, pg, Redis...) adding ~30-50MB memory overhead.
// On Railway without an OTLP collector, this is pure waste.
// ============================================================================

const OTEL_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

let sdk: any = null;

if (OTEL_ENDPOINT) {
  const { NodeSDK } = await import('@opentelemetry/sdk-node');
  const { getNodeAutoInstrumentations } = await import('@opentelemetry/auto-instrumentations-node');
  const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');

  sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
      url: OTEL_ENDPOINT,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();

  console.log('[OpenTelemetry] Tracing initialized');
  console.log(`[OpenTelemetry] Exporting to: ${OTEL_ENDPOINT}`);

  // SIGTERM handler - graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[OpenTelemetry] SIGTERM received, shutting down...');
    sdk
      .shutdown()
      .then(() => console.log('[OpenTelemetry] Shutdown complete'))
      .catch((error: any) => console.error('[OpenTelemetry] Error shutting down', error))
      .finally(() => process.exit(0));
  });
} else {
  console.log('[OpenTelemetry] Skipped — no OTEL_EXPORTER_OTLP_ENDPOINT configured (saves ~30-50MB RAM)');
}

export default sdk;
