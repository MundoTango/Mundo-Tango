import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

interface LatencyMetrics {
  operation: string;
  p50: number;
  p95: number;
  p99: number;
  mean: number;
  min: number;
  max: number;
  iterations: number;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function min(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.min(...values);
}

function max(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values);
}

function calculateMetrics(operation: string, latencies: number[]): LatencyMetrics {
  return {
    operation,
    p50: percentile(latencies, 50),
    p95: percentile(latencies, 95),
    p99: percentile(latencies, 99),
    mean: average(latencies),
    min: min(latencies),
    max: max(latencies),
    iterations: latencies.length,
  };
}

async function benchmarkFeedLoading(): Promise<LatencyMetrics> {
  console.log('📰 Benchmarking Feed Loading (with pagination)...');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const iterations = 100;
  const latencies: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    try {
      await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (*),
          likes:likes(count),
          comments:comments(count)
        `)
        .order('created_at', { ascending: false })
        .range(0, 9);
    } catch (e) {
    }
    
    const end = performance.now();
    latencies.push(end - start);
    
    if (i % 20 === 0 && i > 0) {
      process.stdout.write('.');
    }
  }
  
  console.log(' Done!');
  return calculateMetrics('Feed Loading (10 posts with profile, likes, comments)', latencies);
}

async function benchmarkEventSearch(): Promise<LatencyMetrics> {
  console.log('🎭 Benchmarking Event Search & Filtering...');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const iterations = 100;
  const latencies: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    try {
      await supabase
        .from('events')
        .select(`
          *,
          profiles:user_id (*),
          rsvps:rsvps(count)
        `)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(20);
    } catch (e) {
    }
    
    const end = performance.now();
    latencies.push(end - start);
    
    if (i % 20 === 0 && i > 0) {
      process.stdout.write('.');
    }
  }
  
  console.log(' Done!');
  return calculateMetrics('Event Search (upcoming events with RSVPs)', latencies);
}

async function benchmarkEventFiltering(): Promise<LatencyMetrics> {
  console.log('🔍 Benchmarking Event Filtering by Type...');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const iterations = 100;
  const latencies: number[] = [];
  const eventTypes = ['milonga', 'practica', 'workshop', 'festival'];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const eventType = eventTypes[i % eventTypes.length];
    
    try {
      await supabase
        .from('events')
        .select('*')
        .eq('event_type', eventType)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(10);
    } catch (e) {
    }
    
    const end = performance.now();
    latencies.push(end - start);
    
    if (i % 20 === 0 && i > 0) {
      process.stdout.write('.');
    }
  }
  
  console.log(' Done!');
  return calculateMetrics('Event Filtering (by event type)', latencies);
}

async function benchmarkMessageDelivery(): Promise<LatencyMetrics> {
  console.log('💬 Benchmarking Message Loading...');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const iterations = 100;
  const latencies: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    try {
      await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (*)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
    } catch (e) {
    }
    
    const end = performance.now();
    latencies.push(end - start);
    
    if (i % 20 === 0 && i > 0) {
      process.stdout.write('.');
    }
  }
  
  console.log(' Done!');
  return calculateMetrics('Message Loading (50 messages with sender info)', latencies);
}

async function benchmarkConversationList(): Promise<LatencyMetrics> {
  console.log('💬 Benchmarking Conversation List Loading...');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const iterations = 100;
  const latencies: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    try {
      await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(
            user:user_id (*)
          )
        `)
        .order('updated_at', { ascending: false })
        .limit(20);
    } catch (e) {
    }
    
    const end = performance.now();
    latencies.push(end - start);
    
    if (i % 20 === 0 && i > 0) {
      process.stdout.write('.');
    }
  }
  
  console.log(' Done!');
  return calculateMetrics('Conversation List (20 conversations with participants)', latencies);
}

async function benchmarkProfileLoading(): Promise<LatencyMetrics> {
  console.log('👤 Benchmarking Profile Loading...');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const iterations = 100;
  const latencies: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    try {
      await supabase
        .from('profiles')
        .select(`
          *,
          posts:posts(count),
          followers:follows!following_id(count),
          following:follows!follower_id(count)
        `)
        .limit(1)
        .single();
    } catch (e) {
    }
    
    const end = performance.now();
    latencies.push(end - start);
    
    if (i % 20 === 0 && i > 0) {
      process.stdout.write('.');
    }
  }
  
  console.log(' Done!');
  return calculateMetrics('Profile Loading (with posts, followers, following counts)', latencies);
}

async function benchmarkProfileSearch(): Promise<LatencyMetrics> {
  console.log('🔍 Benchmarking Profile Search...');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const iterations = 100;
  const latencies: number[] = [];
  const searchTerms = ['user', 'tango', 'dancer', 'teacher', 'organizer'];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const term = searchTerms[i % searchTerms.length];
    
    try {
      await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${term}%,full_name.ilike.%${term}%`)
        .limit(20);
    } catch (e) {
    }
    
    const end = performance.now();
    latencies.push(end - start);
    
    if (i % 20 === 0 && i > 0) {
      process.stdout.write('.');
    }
  }
  
  console.log(' Done!');
  return calculateMetrics('Profile Search (by username or full name)', latencies);
}

async function benchmarkUnderLoad(): Promise<LatencyMetrics> {
  console.log('⚡ Simulating 100 Concurrent Users (Feed Loading)...');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const concurrentUsers = 100;
  const latencies: number[] = [];

  const promises = Array.from({ length: concurrentUsers }, async () => {
    const start = performance.now();
    
    try {
      await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (*),
          likes:likes(count)
        `)
        .order('created_at', { ascending: false })
        .range(0, 9);
    } catch (e) {
    }
    
    const end = performance.now();
    return end - start;
  });

  const results = await Promise.all(promises);
  latencies.push(...results);
  
  console.log(' Done!');
  return calculateMetrics('Concurrent Load Test (100 simultaneous users)', latencies);
}

function printMetrics(metrics: LatencyMetrics) {
  const status = metrics.p95 < 200 ? '✅' : metrics.p95 < 500 ? '⚠️' : '❌';
  
  console.log(`\n${status} ${metrics.operation}`);
  console.log(`   Iterations: ${metrics.iterations}`);
  console.log(`   P50: ${metrics.p50.toFixed(2)}ms`);
  console.log(`   P95: ${metrics.p95.toFixed(2)}ms`);
  console.log(`   P99: ${metrics.p99.toFixed(2)}ms`);
  console.log(`   Mean: ${metrics.mean.toFixed(2)}ms`);
  console.log(`   Min: ${metrics.min.toFixed(2)}ms`);
  console.log(`   Max: ${metrics.max.toFixed(2)}ms`);
}

function generateRecommendations(allMetrics: LatencyMetrics[]) {
  console.log('\n💡 Performance Recommendations:\n');
  
  const slowOperations = allMetrics.filter(m => m.p95 > 500);
  const moderateOperations = allMetrics.filter(m => m.p95 > 200 && m.p95 <= 500);
  const fastOperations = allMetrics.filter(m => m.p95 <= 200);
  
  if (slowOperations.length > 0) {
    console.log('❌ CRITICAL - Slow Operations (P95 > 500ms):');
    slowOperations.forEach(op => {
      console.log(`   - ${op.operation}: ${op.p95.toFixed(2)}ms`);
      console.log(`     Recommendation: Add database indexes, optimize query, consider caching`);
    });
    console.log('');
  }
  
  if (moderateOperations.length > 0) {
    console.log('⚠️  WARNING - Moderate Operations (P95 200-500ms):');
    moderateOperations.forEach(op => {
      console.log(`   - ${op.operation}: ${op.p95.toFixed(2)}ms`);
      console.log(`     Recommendation: Monitor closely, consider optimization`);
    });
    console.log('');
  }
  
  if (fastOperations.length > 0) {
    console.log('✅ GOOD - Fast Operations (P95 < 200ms):');
    fastOperations.forEach(op => {
      console.log(`   - ${op.operation}: ${op.p95.toFixed(2)}ms`);
    });
    console.log('');
  }
  
  console.log('📋 General Recommendations:');
  console.log('   1. Add indexes on frequently queried columns (user_id, created_at, start_date)');
  console.log('   2. Implement query result caching for frequently accessed data');
  console.log('   3. Use database connection pooling to handle concurrent requests');
  console.log('   4. Consider implementing pagination for large result sets');
  console.log('   5. Monitor query performance in production and set up alerts');
  console.log('   6. Use Supabase\'s built-in query performance monitoring');
  console.log('   7. Consider implementing read replicas for read-heavy operations');
}

async function runBenchmarks() {
  console.log('🚀 Starting Performance Benchmarks...\n');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const allMetrics: LatencyMetrics[] = [];

  allMetrics.push(await benchmarkFeedLoading());
  allMetrics.push(await benchmarkEventSearch());
  allMetrics.push(await benchmarkEventFiltering());
  allMetrics.push(await benchmarkMessageDelivery());
  allMetrics.push(await benchmarkConversationList());
  allMetrics.push(await benchmarkProfileLoading());
  allMetrics.push(await benchmarkProfileSearch());
  allMetrics.push(await benchmarkUnderLoad());

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('\n📊 Performance Benchmark Results:\n');
  
  allMetrics.forEach(printMetrics);
  
  console.log('\n═══════════════════════════════════════════════════════════');
  
  generateRecommendations(allMetrics);
  
  console.log('\n═══════════════════════════════════════════════════════════');
  
  const overallP95 = average(allMetrics.map(m => m.p95));
  const status = overallP95 < 200 ? '✅' : overallP95 < 500 ? '⚠️' : '❌';
  
  console.log(`\n${status} Overall Performance: ${overallP95.toFixed(2)}ms average P95 latency`);
  console.log(`\n${overallP95 < 500 ? '✅ Performance benchmarks passed!' : '❌ Performance needs improvement'}\n`);
  
  return overallP95 < 500;
}

runBenchmarks()
  .then((passed) => {
    process.exit(passed ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Performance benchmarking failed with error:', error);
    process.exit(1);
  });
