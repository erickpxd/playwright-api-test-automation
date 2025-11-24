import { Logger } from "../core/logger";
import { APIRequestContext, APIResponse } from "@playwright/test";

export class LoggingHelper {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public async makeRequest(
    client: APIRequestContext,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    url: string,
    options?: {
      headers?: Record<string, string>;
      data?: unknown;
      params?: Record<string, string>;
    }
  ): Promise<APIResponse> {
    this.logger.request(method, url, options?.data);

    const startTime = Date.now();
    let response: APIResponse;

    switch (method) {
      case "GET":
        response = await client.get(url, options);
        break;
      case "POST":
        response = await client.post(url, options);
        break;
      case "PUT":
        response = await client.put(url, options);
        break;
      case "PATCH":
        response = await client.patch(url, options);
        break;
      case "DELETE":
        response = await client.delete(url, options);
        break;
    }

    const responseTime = Date.now() - startTime;
    this.logger.response(response.status(), response.url(), responseTime);

    return response;
  }

  public logStep(stepName: string, metadata?: Record<string, unknown>): void {
    this.logger.step(stepName, metadata);
  }
}
