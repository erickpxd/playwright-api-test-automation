import { performance } from "node:perf_hooks";
import { APIRequestContext, APIResponse } from "@playwright/test";
import { Logger } from "../core/logger";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type TimedRequestResult = {
  response: APIResponse;
  durationMs: number;
};

export type PerformanceStats = {
  count: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  p50Ms: number;
  p95Ms: number;
};

type RequestOptions = {
  headers?: Record<string, string>;
  data?: unknown;
  params?: Record<string, string>;
};

export class PerformanceHelper {
  constructor(
    private readonly client: APIRequestContext,
    private readonly logger?: Logger
  ) {}

  public async timedRequest(
    method: HttpMethod,
    url: string,
    options?: RequestOptions
  ): Promise<TimedRequestResult> {
    const start = performance.now();
    const response = await this.send(method, url, options);
    const durationMs = +(performance.now() - start).toFixed(2);

    this.logger?.info("Performance timing", {
      method,
      url,
      status: response.status(),
      durationMs,
    });

    return { response, durationMs };
  }

  private async send(
    method: HttpMethod,
    url: string,
    options?: RequestOptions
  ): Promise<APIResponse> {
    switch (method) {
      case "GET":
        return this.client.get(url, options);
      case "POST":
        return this.client.post(url, options);
      case "PUT":
        return this.client.put(url, options);
      case "PATCH":
        return this.client.patch(url, options);
      case "DELETE":
        return this.client.delete(url, options);
      default: {
        const exhaustiveCheck: never = method;
        throw new Error(`Unsupported method: ${exhaustiveCheck}`);
      }
    }
  }
}

export function calculateStats(durations: number[]): PerformanceStats {
  if (durations.length === 0) {
    throw new Error("Durations array is empty; cannot compute performance stats.");
  }

  const sorted = [...durations].sort((a, b) => a - b);
  const sum = durations.reduce((acc, value) => acc + value, 0);

  return {
    count: durations.length,
    avgMs: +((sum / durations.length).toFixed(2)),
    minMs: sorted[0],
    maxMs: sorted[sorted.length - 1],
    p50Ms: percentile(sorted, 0.5),
    p95Ms: percentile(sorted, 0.95),
  };
}

function percentile(sortedValues: number[], percentileValue: number): number {
  if (percentileValue < 0 || percentileValue > 1) {
    throw new Error("Percentile must be between 0 and 1.");
  }

  const index = Math.max(Math.ceil(percentileValue * sortedValues.length) - 1, 0);
  return sortedValues[index];
}
