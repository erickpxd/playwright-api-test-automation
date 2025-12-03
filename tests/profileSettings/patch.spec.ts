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

test("Should update user profile successfully (200)", async () => {
  const payload = {
    name: "Updated User Teste",
    phone: "9876543210",
    company: "QA3 Company",
  };

  loggingHelper.logStep("Updating user profile", payload);

  const res = await client.patch(`${BASE_URL}${endpoints.profileUpdate}`, {
    headers: { "x-auth-token": token },
    form: payload,
  });

  const json = await res.json();

  expect(res.status()).toBe(200);
  expect(json.success).toBe(true);
  expect(json.status).toBe(200);
  expect(json.message).toBe("Profile updated successful");

  expect(typeof json.data).toBe("object");

  expect(json.data).toHaveProperty("id");
  expect(json.data).toHaveProperty("name");
  expect(json.data).toHaveProperty("email");

  expect(json.data.name).toBe(payload.name);
  expect(json.data.phone).toBe(payload.phone);
  expect(json.data.company).toBe(payload.company);

  loggingHelper.logStep("Profile updated successfully");
});

test("Should return 400 Bad Request when invalid data is sent", async () => {
  loggingHelper.logStep("Attempting to update profile with invalid data");

  const res = await client.patch(`${BASE_URL}${endpoints.profileUpdate}`, {
    headers: { "x-auth-token": token },
    form: {
      name: "",
      phone: "123",
      company: "Test",
    },
  });

  const json = await res.json();

  expect(res.status()).toBe(400);
  expect(json.success).toBe(false);
  expect(json.status).toBe(400);

  expect(typeof json.message).toBe("string");
  expect(json.message.length).toBeGreaterThan(0);

  loggingHelper.logStep("Invalid data error handled correctly");
});

test("Should return 401 Unauthorized when no token is provided", async () => {
  loggingHelper.logStep("Attempting to update profile without token");

  const res = await client.patch(`${BASE_URL}${endpoints.profileUpdate}`, {
    form: {
      name: "User",
      phone: "9999999999",
      company: "Company",
    },
  });

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
test.describe("Profile Settings | Patch", () => {
  test.beforeAll(async () => {
    const manager = await RequestManager.getInstance();
    client = manager.client;
    logger = Logger.getInstance();
    loggingHelper = new LoggingHelper(logger);
  });

  test.describe("Smoke", () => {
    test("Should update user profile successfully (200)", async () => {
      const payload = {
        name: "Updated User Teste",
        phone: "9876543210",
        company: "QA3 Company",
      };

      loggingHelper.logStep("Updating user profile", payload);

      const res = await client.patch(`${BASE_URL}${endpoints.profileUpdate}`, {
        headers: { "x-auth-token": token },
        form: payload,
      });

      const json = await res.json();

      expect(res.status()).toBe(200);
      expect(json.success).toBe(true);
      expect(json.status).toBe(200);
      expect(json.message).toBe("Profile updated successful");

      expect(typeof json.data).toBe("object");

      expect(json.data).toHaveProperty("id");
      expect(json.data).toHaveProperty("name");
      expect(json.data).toHaveProperty("email");

      expect(json.data.name).toBe(payload.name);
      expect(json.data.phone).toBe(payload.phone);
      expect(json.data.company).toBe(payload.company);

      loggingHelper.logStep("Profile updated successfully");
    });
  });

  test.describe("Regression", () => {
    test("Should return 400 Bad Request when invalid data is sent", async () => {
      loggingHelper.logStep("Attempting to update profile with invalid data");

      const res = await client.patch(`${BASE_URL}${endpoints.profileUpdate}`, {
        headers: { "x-auth-token": token },
        form: {
          name: "",
          phone: "123",
          company: "Test",
        },
      });

      const json = await res.json();

      expect(res.status()).toBe(400);
      expect(json.success).toBe(false);
      expect(json.status).toBe(400);

      expect(typeof json.message).toBe("string");
      expect(json.message.length).toBeGreaterThan(0);

      loggingHelper.logStep("Invalid data error handled correctly");
    });

    test("Should return 401 Unauthorized when no token is provided", async () => {
      loggingHelper.logStep("Attempting to update profile without token");

      const res = await client.patch(`${BASE_URL}${endpoints.profileUpdate}`, {
        form: {
          name: "User",
          phone: "9999999999",
          company: "Company",
        },
      });

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
