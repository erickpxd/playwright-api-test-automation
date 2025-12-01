import { test, expect, APIRequestContext } from "@playwright/test";
import { RequestManager } from "../../framework/core/requestManager";

test.describe("Framework | RequestManager", () => {
  test.beforeEach(async () => {
    await RequestManager.dispose();
    RequestManager.resetConfiguration();
  });

  test.afterEach(async () => {
    await RequestManager.dispose();
    RequestManager.resetConfiguration();
  });

  test("creates a singleton client using the configured base URL", async () => {
    let receivedBase = "";
    const mockContext = {
      dispose: async () => {},
    } as unknown as APIRequestContext;

    RequestManager.configure({
      baseURL: "http://localhost:3000",
      contextFactory: async (baseURL: string) => {
        receivedBase = baseURL;
        return mockContext;
      },
    });

    const first = await RequestManager.getInstance();
    const second = await RequestManager.getInstance();

    expect(first).toBe(second);
    expect(first.client).toBe(mockContext);
    expect(first.base).toBe("http://localhost:3000");
    expect(receivedBase).toBe("http://localhost:3000");
  });

  test("dispose releases API context and allows reinitialization", async () => {
    let disposed = false;
    const mockContext = {
      dispose: async () => {
        disposed = true;
      },
    } as unknown as APIRequestContext;

    RequestManager.configure({
      baseURL: "http://local.dev",
      contextFactory: async () => mockContext,
    });

    const instance = await RequestManager.getInstance();
    expect(instance.client).toBe(mockContext);

    await RequestManager.dispose();
    expect(disposed).toBe(true);

    const nextContext = {
      dispose: async () => {},
    } as unknown as APIRequestContext;

    RequestManager.configure({
      contextFactory: async () => nextContext,
    });

    const secondInstance = await RequestManager.getInstance();
    expect(secondInstance.client).toBe(nextContext);
    expect(disposed).toBe(true);
  });

  test("throws a clear error when no base URL is provided", async () => {
    RequestManager.configure({
      baseURL: "",
      contextFactory: async () => {
        throw new Error("should not be called");
      },
    });

    await expect(RequestManager.getInstance()).rejects.toThrow(
      "Base URL não configurada para o RequestManager"
    );
  });
});
