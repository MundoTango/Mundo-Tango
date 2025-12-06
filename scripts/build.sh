#!/bin/bash
# Build script with increased Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build:production
