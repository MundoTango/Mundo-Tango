interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private marks: Map<string, number> = new Map();

  start(name: string) {
    this.marks.set(name, performance.now());
  }

  end(name: string): number {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`Performance mark "${name}" not found`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now(),
    });

    this.marks.delete(name);
    
    if (duration > 300) {
      console.warn(`⚠️ Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }

  getAverageTime(name: string): number {
    const filtered = this.metrics.filter((m) => m.name === name);
    if (filtered.length === 0) return 0;
    
    const sum = filtered.reduce((acc, m) => acc + m.duration, 0);
    return sum / filtered.length;
  }

  clearMetrics() {
    this.metrics = [];
  }

  report() {
    const uniqueNames = Array.from(new Set(this.metrics.map((m) => m.name)));
    console.log('📊 Performance Report:');
    uniqueNames.forEach((name) => {
      const avg = this.getAverageTime(name);
      const count = this.metrics.filter((m) => m.name === name).length;
      const status = avg > 300 ? '⚠️' : '✅';
      console.log(`${status} ${name}: ${avg.toFixed(2)}ms avg (${count} samples)`);
    });
  }
}

export const perfMonitor = new PerformanceMonitor();

export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  perfMonitor.start(name);
  try {
    const result = await fn();
    perfMonitor.end(name);
    return result;
  } catch (error) {
    perfMonitor.end(name);
    throw error;
  }
}
