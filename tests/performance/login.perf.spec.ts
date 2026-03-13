import { test, expect, APIRequestContext } from "@playwright/test";
import { env } from "../../config/environment";
import { endpoints } from "../../config/endpoints";
import { RequestManager } from "../../framework/core/requestManager";
import { Logger } from "../../framework/core/logger";
import { LoggingHelper } from "../../framework/helpers/loggingHelper";
import {
  PerformanceHelper,
  calculateStats,
} from "../../framework/helpers/performanceHelper";

test.describe("Auth | Performance | Login", () => {
  const iterations = Number(process.env.PERF_LOGIN_ITERATIONS ?? 20);
  const p95SlaMs = Number(process.env.PERF_LOGIN_P95_MS ?? 400);
  const warmupRuns = Number(process.env.PERF_LOGIN_WARMUP ?? 2);
  const strictMode =
    (process.env.PERF_LOGIN_STRICT ?? "true").toLowerCase() === "true";

  let client: APIRequestContext;
  let loggingHelper: LoggingHelper;
  let performanceHelper: PerformanceHelper;
  let disposableEmail: string;
  const password = env.testPassword;
  let disposableToken = "";

  test.beforeAll(async () => {
    const manager = await RequestManager.getInstance();
    client = manager.client;
    const logger = Logger.getInstance();

    loggingHelper = new LoggingHelper(logger);
    performanceHelper = new PerformanceHelper(client, logger);
    disposableEmail = `perf_login_${Date.now()}@auto.com`;

    if (!password) {
      throw new Error("TEST_PASSWORD não configurada para testes de desempenho.");
    }

    await loggingHelper.makeRequest(
      client,
      "POST",
      `${env.notesUrl}${endpoints.register}`,
      {
        data: {
          name: "Perf Login",
          email: disposableEmail,
          password,
        },
      }
    );

    const login = await loggingHelper.makeRequest(
      client,
      "POST",
      `${env.notesUrl}${endpoints.login}`,
      {
        data: {
          email: disposableEmail,
          password,
        },
      }
    );

    const loginJson = await login.json();
    disposableToken = loginJson.data.token;
  });

  test.afterAll(async () => {
    if (disposableToken) {
      await client.delete(`${env.notesUrl}${endpoints.deleteAccount}`, {
        headers: { "x-auth-token": disposableToken },
      });
    }
    await RequestManager.dispose();
  });

  test(`p95 do login deve ser <= ${p95SlaMs}ms em ${iterations} execucoes`, async () => {
    const durations: number[] = [];

    // Warm-up requests to stabilize caches/connections; not included in metrics.
    for (let i = 0; i < warmupRuns; i += 1) {
      const warmup = await performanceHelper.timedRequest(
        "POST",
        `${env.notesUrl}${endpoints.login}`,
        {
          data: {
            email: disposableEmail,
            password,
          },
        }
      );
      expect(warmup.response.status(), "warmup status code").toBe(200);
    }

    for (let i = 0; i < iterations; i += 1) {
      const { response, durationMs } = await performanceHelper.timedRequest(
        "POST",
        `${env.notesUrl}${endpoints.login}`,
        {
          data: {
            email: disposableEmail,
            password,
          },
        }
      );

      expect(response.status(), "status code").toBe(200);
      durations.push(durationMs);
    }

    const stats = calculateStats(durations);

    console.log(
      `[perf] login stats p95=${stats.p95Ms}ms avg=${stats.avgMs}ms min=${stats.minMs}ms max=${stats.maxMs}ms runs=${stats.count}`
    );

    test.info().annotations.push({
      type: "perf",
      description: `login p95=${stats.p95Ms}ms avg=${stats.avgMs}ms over ${stats.count} runs`,
    });

    if (strictMode) {
      expect(stats.p95Ms).toBeLessThanOrEqual(p95SlaMs);
    } else if (stats.p95Ms > p95SlaMs) {
      console.warn(
        `[perf][warning] p95 acima do SLA (${stats.p95Ms}ms > ${p95SlaMs}ms) em modo nao estrito`
      );
      test.info().annotations.push({
        type: "perf-warning",
        description: `p95 acima do SLA (${stats.p95Ms}ms > ${p95SlaMs}ms) em modo nao estrito`,
      });
    }
  });
});
