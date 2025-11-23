import { APIRequestContext, request } from "@playwright/test";
import { env } from "../../config/environment";

export class RequestManager {
  private static instance: RequestManager | null = null;
  private apiContext!: APIRequestContext;

  private constructor() {}

  public static async getInstance(): Promise<RequestManager> {
    if (!RequestManager.instance) {
      const manager = new RequestManager();
      await manager.init();
      RequestManager.instance = manager;
    }
    return RequestManager.instance;
  }

  private async init(): Promise<void> {
    this.apiContext = await request.newContext({
      baseURL: env.notesUrl,
    });
  }

  public get client(): APIRequestContext {
    return this.apiContext;
  }

  public static async dispose(): Promise<void> {
    if (RequestManager.instance) {
      await RequestManager.instance.apiContext.dispose();
      RequestManager.instance = null;
    }
  }
}