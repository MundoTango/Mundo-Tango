import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export interface CSPOptions {
  nonce?: string;
  reportOnly?: boolean;
}

export function generateNonce(): string {
  return crypto.randomBytes(16).toString("base64");
}

export function cspHeaders(options: CSPOptions = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const nonce = options.nonce || generateNonce();
    res.locals.cspNonce = nonce;

    const directives = {
      "default-src": ["'self'"],
      "script-src": [
        "'self'",
        `'nonce-${nonce}'`,
        "'unsafe-inline'",
        "https://js.stripe.com",
        "https://challenges.cloudflare.com",
      ],
      "style-src": [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
      ],
      "img-src": [
        "'self'",
        "data:",
        "blob:",
        "https:",
        "https://res.cloudinary.com",
        "https://api.mapbox.com",
        "https://*.tile.openstreetmap.org",
      ],
      "font-src": [
        "'self'",
        "data:",
        "https://fonts.gstatic.com",
      ],
      "connect-src": [
        "'self'",
        "https://api.stripe.com",
        "https://api.cloudinary.com",
        "https://api.mapbox.com",
        "wss:",
        "ws:",
      ],
      "media-src": [
        "'self'",
        "blob:",
        "https://res.cloudinary.com",
      ],
      "object-src": ["'none'"],
      "base-uri": ["'self'"],
      "form-action": ["'self'"],
      "frame-ancestors": ["'none'"],
      "frame-src": [
        "'self'",
        "https://js.stripe.com",
        "https://challenges.cloudflare.com",
      ],
      "worker-src": ["'self'", "blob:"],
      "upgrade-insecure-requests": [],
    };

    const cspString = Object.entries(directives)
      .map(([key, values]) => {
        if (values.length === 0) {
          return key;
        }
        return `${key} ${values.join(" ")}`;
      })
      .join("; ");

    const headerName = options.reportOnly
      ? "Content-Security-Policy-Report-Only"
      : "Content-Security-Policy";

    res.setHeader(headerName, cspString);

    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(self)"
    );

    next();
  };
}
