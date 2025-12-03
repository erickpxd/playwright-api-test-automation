import { test, expect, APIRequestContext } from "@playwright/test";
import { getToken } from "../../framework/helpers/authHelper";
import { env } from "../../config/environment";
import { endpoints } from "../../config/endpoints";
import { RequestManager } from "../../framework/core/requestManager";
import { Logger } from "../../framework/core/logger";
import { LoggingHelper } from "../../framework/helpers/loggingHelper";

const BASE_URL = env.notesUrl;
const token = getToken();

let client: APIRequestContext;
let logger: Logger;
let loggingHelper: LoggingHelper;

<<<<<<< HEAD
test.beforeAll(async () => {
  const manager = await RequestManager.getInstance();
  client = manager.client;
  logger = Logger.getInstance();
  loggingHelper = new LoggingHelper(logger);
});

test("Should return, user profile information retrieved successfully.", async () => {
  loggingHelper.logStep("Retrieving user profile");

  const res = await loggingHelper.makeRequest(
    client,
    "GET",
    `${BASE_URL}${endpoints.profile}`,
    {
      headers: { "x-auth-token": token },
    }
  );

  const json = await res.json();

  expect(res.status()).toBe(200);
  expect(json.success).toBe(true);
  expect(json.message).toBe("Profile successful");

  expect(typeof json.data).toBe("object");
  expect(json.data).not.toBeNull();

  expect(json.data).toHaveProperty("id");
  expect(json.data).toHaveProperty("name");
  expect(json.data).toHaveProperty("email");

  expect(typeof json.data.id).toBe("string");
  expect(typeof json.data.name).toBe("string");
  expect(typeof json.data.email).toBe("string");

  loggingHelper.logStep("Profile retrieved successfully");
});

test("Should return 401 Unauthorized when token is malformed", async () => {
  loggingHelper.logStep("Attempting to retrieve profile with malformed token");

  const res = await loggingHelper.makeRequest(
    client,
    "GET",
    `${BASE_URL}${endpoints.profile}`,
    {
      headers: {
        "x-auth-token": "123-invalid-token",
      },
    }
  );

  const json = await res.json();

  expect(res.status()).toBe(401);
  expect(json.success).toBe(false);
  expect(json.status).toBe(401);
  expect(json.message).toBe(
    "Access token is not valid or has expired, you will need to login"
  );

  loggingHelper.logStep("Malformed token error handled correctly");
});

test("Should return 401 Unauthorized when no token is provided", async () => {
  loggingHelper.logStep("Attempting to retrieve profile without token");

  const res = await loggingHelper.makeRequest(
    client,
    "GET",
    `${BASE_URL}${endpoints.profile}`,
    {}
  );

  const json = await res.json();

  expect(res.status()).toBe(401);
  expect(json.success).toBe(false);
  expect(json.status).toBe(401);
  expect(json.message).toBe(
    "No authentication token specified in x-auth-token header"
  );

  loggingHelper.logStep("Missing token error handled correctly");
});
=======
test.describe("Profile Settings | Get", () => {
  test.beforeAll(async () => {
    const manager = await RequestManager.getInstance();
    client = manager.client;
    logger = Logger.getInstance();
    loggingHelper = new LoggingHelper(logger);
  });

  test.describe("Smoke", () => {
    test("Should return, user profile information retrieved successfully.", async () => {
      loggingHelper.logStep("Retrieving user profile");

      const res = await loggingHelper.makeRequest(
        client,
        "GET",
        `${BASE_URL}${endpoints.profile}`,
        {
          headers: { "x-auth-token": token },
        }
      );

      const json = await res.json();

      expect(res.status()).toBe(200);
      expect(json.success).toBe(true);
      expect(json.message).toBe("Profile successful");

      expect(typeof json.data).toBe("object");
      expect(json.data).not.toBeNull();

      expect(json.data).toHaveProperty("id");
      expect(json.data).toHaveProperty("name");
      expect(json.data).toHaveProperty("email");

      expect(typeof json.data.id).toBe("string");
      expect(typeof json.data.name).toBe("string");
      expect(typeof json.data.email).toBe("string");

      loggingHelper.logStep("Profile retrieved successfully");
    });
  });

  test.describe("Regression", () => {
    test("Should return 401 Unauthorized when token is malformed", async () => {
      loggingHelper.logStep("Attempting to retrieve profile with malformed token");

      const res = await loggingHelper.makeRequest(
        client,
        "GET",
        `${BASE_URL}${endpoints.profile}`,
        {
          headers: {
            "x-auth-token": "123-invalid-token",
          },
        }
      );

      const json = await res.json();

      expect(res.status()).toBe(401);
      expect(json.success).toBe(false);
      expect(json.status).toBe(401);
      expect(json.message).toBe(
        "Access token is not valid or has expired, you will need to login"
      );

      loggingHelper.logStep("Malformed token error handled correctly");
    });

    test("Should return 401 Unauthorized when no token is provided", async () => {
      loggingHelper.logStep("Attempting to retrieve profile without token");

      const res = await loggingHelper.makeRequest(
        client,
        "GET",
        `${BASE_URL}${endpoints.profile}`,
        {}
      );

      const json = await res.json();

      expect(res.status()).toBe(401);
      expect(json.success).toBe(false);
      expect(json.status).toBe(401);
      expect(json.message).toBe(
        "No authentication token specified in x-auth-token header"
      );

      loggingHelper.logStep("Missing token error handled correctly");
    });
  });
});
>>>>>>> 045111e2b2e34aa477768c3ed613b0cc4e3852e4
