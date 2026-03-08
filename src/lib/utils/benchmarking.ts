

export interface BenchmarkResult {
  operation: string;
  durationMs: number;
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
  metadata?: Record<string, any>;
}

class Benchmarker {
  private static instance: Benchmarker;
  private results: BenchmarkResult[] = [];

  private constructor() {}

  public static getInstance(): Benchmarker {
    if (!Benchmarker.instance) {
      Benchmarker.instance = new Benchmarker();
    }
    return Benchmarker.instance;
  }

  public start(): number {
    return performance.now();
  }

  public end(
    operation: string, 
    startTime: number, 
    tokens?: { input: number; output: number },
    metadata?: Record<string, any>
  ): BenchmarkResult {
    const durationMs = performance.now() - startTime;
    const result: BenchmarkResult = {
      operation,
      durationMs: Math.round(durationMs * 100) / 100,
      metadata
    };

    if (tokens) {
      result.tokens = {
        input: tokens.input,
        output: tokens.output,
        total: tokens.input + tokens.output
      };
    }

    this.results.push(result);
    
    console.log(`\n[BENCHMARK] 📊 ${operation.toUpperCase()}`);
    console.log(`- Latency: ${result.durationMs}ms (${(result.durationMs / 1000).toFixed(2)}s)`);
    if (result.tokens) {
      console.log(`- Token Usage: In:${result.tokens.input} | Out:${result.tokens.output} | Total:${result.tokens.total}`);
    }
    if (metadata) {
      console.log(`- Metadata: ${JSON.stringify(metadata)}`);
    }
    console.log('-------------------------------------------\n');

    return result;
  }

  public getResults(): BenchmarkResult[] {
    return this.results;
  }

  public clearResults(): void {
    this.results = [];
  }
}

export const benchmark = Benchmarker.getInstance();
