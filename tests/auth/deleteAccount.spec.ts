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
let accountDeleted = false;
let client: APIRequestContext;
let logger: Logger;
let loggingHelper: LoggingHelper;

test.beforeAll(async () => {
  const manager = await RequestManager.getInstance();
  client = manager.client;
  logger = Logger.getInstance();
  loggingHelper = new LoggingHelper(logger);

  disposableEmail = `delete_${Date.now()}@test.com`;

  loggingHelper.logStep("Creating account for deletion tests");
  const register = await loggingHelper.makeRequest(
    client,
    "POST",
    `${BASE_URL}${endpoints.register}`,
    {
      data: {
        name: "Disposable Account",
        email: disposableEmail,
        password,
      },
    }
  );

  expect(register.status()).toBe(201);

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

  const json = await login.json();
  disposableToken = json.data.token;
  loggingHelper.logStep("Test account created");
});

test.afterAll(async () => {
  if (!accountDeleted && disposableToken) {
    await client.delete(`${BASE_URL}${endpoints.deleteAccount}`, {
      headers: { "x-auth-token": disposableToken },
    });
  }
});

test("should delete account successfully", async () => {
  loggingHelper.logStep("Deleting account");

  const res = await loggingHelper.makeRequest(
    client,
    "DELETE",
    `${BASE_URL}${endpoints.deleteAccount}`,
    {
      headers: { "x-auth-token": disposableToken },
    }
  );

  expect(res.status()).toBe(200);

  const json = await res.json();
  expect(json.success).toBe(true);
  expect(json.message.toLowerCase()).toContain(
    "account successfully deleted"
  );

  accountDeleted = true;
  loggingHelper.logStep("Account deleted successfully");
});

test("should fail to delete account without token", async () => {
  loggingHelper.logStep("Attempting to delete account without token");

  const res = await loggingHelper.makeRequest(
    client,
    "DELETE",
    `${BASE_URL}${endpoints.deleteAccount}`,
    {}
  );

  expect(res.status()).toBe(401);

  const json = await res.json();
  expect(json.success).toBe(false);
  expect(json.message.toLowerCase()).toMatch("no authentication token");
  loggingHelper.logStep("Authentication error handled correctly");
});

test("should fail to delete account with invalid token", async () => {
  loggingHelper.logStep("Attempting to delete account with invalid token");

  const res = await loggingHelper.makeRequest(
    client,
    "DELETE",
    `${BASE_URL}${endpoints.deleteAccount}`,
    {
      headers: { "x-auth-token": "invalid.token.123" },
    }
  );

  expect(res.status()).toBe(401);

  const json = await res.json();
  expect(json.success).toBe(false);
  expect(json.message.toLowerCase()).toMatch("access token is not valid");
  loggingHelper.logStep("Invalid token error handled correctly");
});