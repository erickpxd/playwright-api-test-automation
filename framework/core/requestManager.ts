import { APIRequestContext, request } from "@playwright/test";
import { env } from "../../config/environment";

export type ContextFactory = (baseURL: string) => Promise<APIRequestContext>;

export class RequestManager {
  private static instance: RequestManager | null = null;
  private static readonly defaultFactory: ContextFactory = (baseURL: string) =>
    request.newContext({ baseURL });
  private static contextFactory: ContextFactory = RequestManager.defaultFactory;
  private static defaultBaseURL = env.notesUrl;

  private apiContext!: APIRequestContext;

  private constructor(private readonly baseURL: string) {}

  public static async getInstance(baseURL?: string): Promise<RequestManager> {
    if (!RequestManager.instance) {
      const resolvedBaseURL =
        baseURL ?? RequestManager.defaultBaseURL ?? env.notesUrl;

      if (!resolvedBaseURL) {
        throw new Error("Base URL não configurada para o RequestManager");
      }

      const manager = new RequestManager(resolvedBaseURL);
      await manager.init();
      RequestManager.instance = manager;
    }
    return RequestManager.instance;
  }

  private async init(): Promise<void> {
    this.apiContext = await RequestManager.contextFactory(this.baseURL);
  }

  public get client(): APIRequestContext {
    return this.apiContext;
  }

  public get base(): string {
    return this.baseURL;
  }

  public static configure(options: {
    baseURL?: string;
    contextFactory?: ContextFactory;
  }): void {
    if (options.baseURL !== undefined) {
      RequestManager.defaultBaseURL = options.baseURL;
    }
    if (options.contextFactory) {
      RequestManager.contextFactory = options.contextFactory;
    }
    RequestManager.instance = null;
  }

  public static async dispose(): Promise<void> {
    if (RequestManager.instance) {
      await RequestManager.instance.apiContext.dispose();
      RequestManager.instance = null;
    }
  }

  public static resetConfiguration(): void {
    RequestManager.contextFactory = RequestManager.defaultFactory;
    RequestManager.defaultBaseURL = env.notesUrl;
    RequestManager.instance = null;
  }
}
