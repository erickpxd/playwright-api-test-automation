import { APIRequestContext, request } from "@playwright/test";
import { env } from "../../config/environment";

export class RequestManager {
  private context!: APIRequestContext;

  async init() {
    this.context = await request.newContext({
      baseURL: env.notesUrl,
    });
  }

  get client(): APIRequestContext {
    return this.context;
  }

  async dispose() {
    await this.context.dispose();
  }
}
