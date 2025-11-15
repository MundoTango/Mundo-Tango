/**
 * OpenTelemetry Traces Proxy
 * Receives traces from the frontend and forwards to OTLP collector
 */

import { Router, type Request, Response } from "express";
import axios from "axios";

const router = Router();

// Proxy endpoint for frontend traces
router.post("/", async (req: Request, res: Response) => {
  try {
    const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';
    
    // Forward the trace data to the OTLP collector
    await axios.post(otlpEndpoint, req.body, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });

    res.status(200).send('OK');
  } catch (error) {
    console.error('[Traces] Error forwarding traces to OTLP collector:', error);
    // Don't fail the request even if trace forwarding fails
    res.status(200).send('OK');
  }
});

export default router;
