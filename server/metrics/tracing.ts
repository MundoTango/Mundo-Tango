import { trace, SpanStatusCode, type Span } from '@opentelemetry/api';
import type { Request, Response, NextFunction } from 'express';

const tracer = trace.getTracer('mundo-tango-server');

/**
 * Middleware to trace route execution with OpenTelemetry
 * @param routeName - Name of the route for identification in traces
 */
export function traceRoute(routeName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const span = tracer.startSpan(routeName, {
      attributes: {
        'http.method': req.method,
        'http.url': req.url,
        'http.route': routeName,
        'http.user_agent': req.get('user-agent') || 'unknown',
        'http.client_ip': req.ip || req.socket.remoteAddress || 'unknown',
      },
    });

    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      span.setAttribute('http.status_code', res.statusCode);
      span.setAttribute('http.response_time_ms', duration);
      
      if (res.statusCode >= 400) {
        span.setStatus({ 
          code: SpanStatusCode.ERROR,
          message: `HTTP ${res.statusCode}`,
        });
      } else {
        span.setStatus({ code: SpanStatusCode.OK });
      }
      
      span.end();
    });

    res.on('error', (error: Error) => {
      span.setStatus({ 
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.recordException(error);
      span.end();
    });

    next();
  };
}

/**
 * Manually create a span for custom tracing
 * @param name - Name of the operation
 * @param fn - Function to execute within the span
 */
export async function traceOperation<T>(
  name: string,
  fn: (span: Span) => Promise<T>
): Promise<T> {
  const span = tracer.startSpan(name);
  
  try {
    const result = await fn(span);
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({ 
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Trace a database query
 * @param queryName - Name of the query operation
 * @param query - SQL query string
 * @param fn - Function executing the query
 */
export async function traceQuery<T>(
  queryName: string,
  query: string,
  fn: (span: Span) => Promise<T>
): Promise<T> {
  const span = tracer.startSpan(`db.${queryName}`, {
    attributes: {
      'db.system': 'postgresql',
      'db.statement': query.length > 1000 ? query.substring(0, 1000) + '...' : query,
    },
  });
  
  try {
    const result = await fn(span);
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({ 
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'Query failed',
    });
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Trace WebSocket events
 * @param eventName - Name of the WebSocket event
 * @param metadata - Additional metadata to include in the span
 */
export function traceWebSocketEvent(
  eventName: string,
  metadata: Record<string, string | number | boolean> = {}
): Span {
  return tracer.startSpan(`ws.${eventName}`, {
    attributes: {
      'messaging.system': 'websocket',
      'messaging.operation': eventName,
      ...metadata,
    },
  });
}

/**
 * Trace AI/LLM operations
 * @param provider - AI provider (openai, claude, groq, etc.)
 * @param operation - Operation name (chat, completion, embedding, etc.)
 * @param fn - Function executing the AI operation
 */
export async function traceAIOperation<T>(
  provider: string,
  operation: string,
  fn: (span: Span) => Promise<T>
): Promise<T> {
  const span = tracer.startSpan(`ai.${provider}.${operation}`, {
    attributes: {
      'ai.provider': provider,
      'ai.operation': operation,
    },
  });
  
  try {
    const result = await fn(span);
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({ 
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'AI operation failed',
    });
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    throw error;
  } finally {
    span.end();
  }
}
