import { test, expect, APIRequestContext } from "@playwright/test";
import { env } from "../../config/environment";
import { endpoints } from "../../config/endpoints";
import { RequestManager } from "../../framework/core/requestManager";
import { Logger } from "../../framework/core/logger";
import { LoggingHelper } from "../../framework/helpers/loggingHelper";
import { validateResponse } from "../../framework/helpers/schemaValidator";
import { registerResponseSchema } from "../schemas/authSchemas";

const BASE_URL = env.notesUrl;
const password = env.testPassword;

let disposableEmail = "";
let disposableToken = "";
let client: APIRequestContext;
let logger: Logger;
let loggingHelper: LoggingHelper;

<<<<<<< HEAD
test.beforeAll(async () => {
  const manager = await RequestManager.getInstance();
  client = manager.client;
  logger = Logger.getInstance();
  loggingHelper = new LoggingHelper(logger);

  disposableEmail = `discard_${Date.now()}@test.com`;

  loggingHelper.logStep("Creating disposable user for register tests");
  await loggingHelper.makeRequest(
    client,
    "POST",
    `${BASE_URL}${endpoints.register}`,
    {
      data: {
        name: "Disposable",
        email: disposableEmail,
        password,
      },
    }
  );

  const login = await loggingHelper.makeRequest(
    client,
    "POST",
    `${BASE_URL}${endpoints.login}`,
    {
      data: {
        email: disposableEmail,
        password,
      },
    }
  );

  const loginJson = await login.json();
  disposableToken = loginJson.data.token;
  loggingHelper.logStep("Disposable user created");
});

test.afterAll(async () => {
  await client.delete(`${BASE_URL}${endpoints.deleteAccount}`, {
    headers: { "x-auth-token": disposableToken },
  });
});

async function deleteUser(token: string) {
  await client.delete(`${BASE_URL}${endpoints.deleteAccount}`, {
    headers: { "x-auth-token": token },
  });
}

test("should register a new user successfully", async () => {
  const email = `register_${Date.now()}@test.com`;

  loggingHelper.logStep("Registering new user");
  const res = await loggingHelper.makeRequest(
    client,
    "POST",
    `${BASE_URL}${endpoints.register}`,
    {
      data: {
        name: "Tester",
        email,
        password,
      },
    }
  );

  expect(res.status()).toBe(201);

  const json = await res.json();
  expect(json.success).toBe(true);
  expect(json.data).toHaveProperty("id");

  loggingHelper.logStep("User registered successfully, logging in to get token");
  const login = await loggingHelper.makeRequest(
    client,
    "POST",
    `${BASE_URL}${endpoints.login}`,
    {
      data: { email, password },
    }
  );

  const loginJson = await login.json();
  const tempToken = loginJson.data.token;

  await deleteUser(tempToken);
  loggingHelper.logStep("Test user cleaned up");
});

test("should fail when email is missing", async () => {
  loggingHelper.logStep("Attempting to register without email");

  const res = await loggingHelper.makeRequest(
    client,
    "POST",
    `${BASE_URL}${endpoints.register}`,
    {
      data: {
        name: "Tester",
        password,
      },
    }
  );

  expect(res.status()).toBe(400);
  const json = await res.json();

  expect(json.success).toBe(false);
  expect(json.message.toLowerCase()).toContain("email");
  loggingHelper.logStep("Missing email error handled correctly");
});

test("should fail when password is missing", async () => {
  loggingHelper.logStep("Attempting to register without password");

  const res = await loggingHelper.makeRequest(
    client,
    "POST",
    `${BASE_URL}${endpoints.register}`,
    {
      data: {
        name: "Tester",
        email: `missingpass_${Date.now()}@test.com`,
      },
    }
  );

  expect(res.status()).toBe(400);
  const json = await res.json();

  expect(json.success).toBe(false);
  expect(json.message.toLowerCase()).toContain("password");
  loggingHelper.logStep("Missing password error handled correctly");
});

test("should fail when email format is invalid", async () => {
  loggingHelper.logStep("Attempting to register with invalid email format");

  const res = await loggingHelper.makeRequest(
    client,
    "POST",
    `${BASE_URL}${endpoints.register}`,
    {
      data: {
        name: "Tester",
        email: "invalidemail",
        password,
      },
    }
  );

  expect(res.status()).toBe(400);
  loggingHelper.logStep("Invalid email format error handled correctly");
});
=======
test.describe("Auth | Register", () => {
  test.beforeAll(async () => {
    const manager = await RequestManager.getInstance();
    client = manager.client;
    logger = Logger.getInstance();
    loggingHelper = new LoggingHelper(logger);

    disposableEmail = `discard_${Date.now()}@test.com`;

    loggingHelper.logStep("Creating disposable user for register tests");
    await loggingHelper.makeRequest(
      client,
      "POST",
      `${BASE_URL}${endpoints.register}`,
      {
        data: {
          name: "Disposable",
          email: disposableEmail,
          password,
        },
      }
    );

    const login = await loggingHelper.makeRequest(
      client,
      "POST",
      `${BASE_URL}${endpoints.login}`,
      {
        data: {
          email: disposableEmail,
          password,
        },
      }
    );

    const loginJson = await login.json();
    disposableToken = loginJson.data.token;
    loggingHelper.logStep("Disposable user created");
  });

  test.afterAll(async () => {
    await client.delete(`${BASE_URL}${endpoints.deleteAccount}`, {
      headers: { "x-auth-token": disposableToken },
    });
  });

  async function deleteUser(token: string) {
    await client.delete(`${BASE_URL}${endpoints.deleteAccount}`, {
      headers: { "x-auth-token": token },
    });
  }

  test.describe("Smoke", () => {
    test("should register a new user successfully", async () => {
      const email = `register_${Date.now()}@test.com`;

      loggingHelper.logStep("Registering new user");
      const res = await loggingHelper.makeRequest(
        client,
        "POST",
        `${BASE_URL}${endpoints.register}`,
        {
          data: {
            name: "Tester",
            email,
            password,
          },
        }
      );

      expect(res.status()).toBe(201);

      const json = await res.json();
      validateResponse(registerResponseSchema, json);
      expect(json.success).toBe(true);
      expect(json.data).toHaveProperty("id");

      loggingHelper.logStep("User registered successfully, logging in to get token");
      const login = await loggingHelper.makeRequest(
        client,
        "POST",
        `${BASE_URL}${endpoints.login}`,
        {
          data: { email, password },
        }
      );

      const loginJson = await login.json();
      const tempToken = loginJson.data.token;

      await deleteUser(tempToken);
      loggingHelper.logStep("Test user cleaned up");
    });
  });

  test.describe("Regression", () => {
    test("should fail when email is missing", async () => {
      loggingHelper.logStep("Attempting to register without email");

      const res = await loggingHelper.makeRequest(
        client,
        "POST",
        `${BASE_URL}${endpoints.register}`,
        {
          data: {
            name: "Tester",
            password,
          },
        }
      );

      expect(res.status()).toBe(400);
      const json = await res.json();

      expect(json.success).toBe(false);
      expect(json.message.toLowerCase()).toContain("email");
      loggingHelper.logStep("Missing email error handled correctly");
    });

    test("should fail when password is missing", async () => {
      loggingHelper.logStep("Attempting to register without password");

      const res = await loggingHelper.makeRequest(
        client,
        "POST",
        `${BASE_URL}${endpoints.register}`,
        {
          data: {
            name: "Tester",
            email: `missingpass_${Date.now()}@test.com`,
          },
        }
      );

      expect(res.status()).toBe(400);
      const json = await res.json();

      expect(json.success).toBe(false);
      expect(json.message.toLowerCase()).toContain("password");
      loggingHelper.logStep("Missing password error handled correctly");
    });

    test("should fail when email format is invalid", async () => {
      loggingHelper.logStep("Attempting to register with invalid email format");

      const res = await loggingHelper.makeRequest(
        client,
        "POST",
        `${BASE_URL}${endpoints.register}`,
        {
          data: {
            name: "Tester",
            email: "invalidemail",
            password,
          },
        }
      );

      expect(res.status()).toBe(400);
      loggingHelper.logStep("Invalid email format error handled correctly");
    });
  });
});
>>>>>>> 045111e2b2e34aa477768c3ed613b0cc4e3852e4
