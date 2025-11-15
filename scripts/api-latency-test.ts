import { performance } from 'perf_hooks';

interface LatencyResult {
  endpoint: string;
  method: string;
  avgLatency: number;
  p50: number;
  p95: number;
  p99: number;
}

async function testEndpoint(url: string, iterations: number = 10): Promise<number[]> {
  const latencies: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fetch(url);
    const end = performance.now();
    latencies.push(end - start);
  }
  
  return latencies;
}

function calculatePercentile(arr: number[], percentile: number): number {
  const sorted = arr.slice().sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}

async function runLatencyTests() {
  const endpoints = [
    { url: 'http://localhost:5000/api/posts', method: 'GET' },
    { url: 'http://localhost:5000/api/auth/me', method: 'GET' },
    { url: 'http://localhost:5000/api/mrblue/conversations', method: 'GET' },
    { url: 'http://localhost:5000/api/community/global-stats', method: 'GET' },
  ];
  
  const results: LatencyResult[] = [];
  
  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint.url}...`);
    const latencies = await testEndpoint(endpoint.url);
    
    results.push({
      endpoint: endpoint.url,
      method: endpoint.method,
      avgLatency: latencies.reduce((a, b) => a + b) / latencies.length,
      p50: calculatePercentile(latencies, 50),
      p95: calculatePercentile(latencies, 95),
      p99: calculatePercentile(latencies, 99),
    });
  }
  
  // Generate report
  console.log('\n📊 API Latency Report\n');
  console.table(results);
  
  // Check against targets
  const failedEndpoints = results.filter(r => r.p95 > 500); // 500ms p95 target
  if (failedEndpoints.length > 0) {
    console.log('\n⚠️ Endpoints exceeding 500ms p95:');
    console.table(failedEndpoints);
  } else {
    console.log('\n✅ All endpoints within latency targets');
  }
}

runLatencyTests();
