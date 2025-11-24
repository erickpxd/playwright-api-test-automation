import { test, expect, APIRequestContext } from "@playwright/test";
import { env } from "../../config/environment";
import { endpoints } from "../../config/endpoints";
import { RequestManager } from "../../framework/core/requestManager";
import { Logger } from "../../framework/core/logger";
import { LoggingHelper } from "../../framework/helpers/loggingHelper";

const BASE_URL = env.notesUrl;
const password = env.testPassword;

let disposableEmail = "";
let disposableToken = "";
let client: APIRequestContext;
let logger: Logger;
let loggingHelper: LoggingHelper;

test.beforeAll(async () => {
  const manager = await RequestManager.getInstance();
  client = manager.client;
  logger = Logger.getInstance();
  loggingHelper = new LoggingHelper(logger);

  disposableEmail = `discard_${Date.now()}@test.com`;

  loggingHelper.logStep("Creating disposable user for login tests");
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
  loggingHelper.logStep("Disposable user created and logged in");
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

test("should login successfully with valid credentials", async () => {
  const email = `login_success_${Date.now()}@auto.com`;

  loggingHelper.logStep("Registering new user for login test");
  await loggingHelper.makeRequest(
    client,
    "POST",
    `${BASE_URL}${endpoints.register}`,
    {
      data: { name: "Login", email, password },
    }
  );

  loggingHelper.logStep("Attempting login with valid credentials");
  const res = await loggingHelper.makeRequest(
    client,
    "POST",
    `${BASE_URL}${endpoints.login}`,
    {
      data: { email, password },
    }
  );

  expect(res.status()).toBe(200);

  const json = await res.json();

  expect(json.success).toBe(true);
  expect(json.data).toHaveProperty("token");
  expect(typeof json.data.token).toBe("string");

  const token = json.data.token;
  loggingHelper.logStep("Login successful");
  await deleteUser(token);
});

test("should fail login when password is wrong", async () => {
  loggingHelper.logStep("Attempting login with wrong password");

  const res = await loggingHelper.makeRequest(
    client,
    "POST",
    `${BASE_URL}${endpoints.login}`,
    {
      data: {
        email: disposableEmail,
        password: "wrongpass",
      },
    }
  );

  expect(res.status()).toBe(401);

  const json = await res.json();
  expect(json.success).toBe(false);
  expect(json.message.toLowerCase()).toContain("incorrect");
  loggingHelper.logStep("Wrong password error handled correctly");
});

test("should fail login when email does not exist", async () => {
  loggingHelper.logStep("Attempting login with non-existent email");

  const res = await loggingHelper.makeRequest(
    client,
    "POST",
    `${BASE_URL}${endpoints.login}`,
    {
      data: {
        email: "notfound@test.com",
        password,
      },
    }
  );

  expect(res.status()).toBe(401);

  const json = await res.json();
  expect(json.success).toBe(false);
  loggingHelper.logStep("Non-existent email error handled correctly");
});

test("should fail login when email is missing", async () => {
  loggingHelper.logStep("Attempting login without email");

  const res = await loggingHelper.makeRequest(
    client,
    "POST",
    `${BASE_URL}${endpoints.login}`,
    {
      data: {
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

test("should fail login when password is missing", async () => {
  loggingHelper.logStep("Attempting login without password");

  const res = await loggingHelper.makeRequest(
    client,
    "POST",
    `${BASE_URL}${endpoints.login}`,
    {
      data: {
        email: disposableEmail,
      },
    }
  );

  expect(res.status()).toBe(400);

  const json = await res.json();
  expect(json.success).toBe(false);
  expect(json.message.toLowerCase()).toContain("password");
  loggingHelper.logStep("Missing password error handled correctly");
});