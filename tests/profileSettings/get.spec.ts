import { test, expect, APIRequestContext } from "@playwright/test";
import { getToken } from "../../framework/helpers/authHelper";
import { env } from "../../config/environment";
import { endpoints } from "../../config/endpoints";
import { RequestManager } from "../../framework/core/requestManager";

const BASE_URL = env.notesUrl;
const token = getToken();

let client: APIRequestContext;

test.beforeAll(async () => {
  const manager = await RequestManager.getInstance();
  client = manager.client;
});

test("Should return, user profile information retrieved successfully.", async () => {
  const res = await client.get(`${BASE_URL}${endpoints.profile}`, {
    headers: { "x-auth-token": token },
  });

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
});

test("Should return 401 Unauthorized when token is malformed", async () => {
  const res = await client.get(`${BASE_URL}${endpoints.profile}`, {
    headers: {
      "x-auth-token": "123-invalid-token",
    },
  });

  const json = await res.json();

  expect(res.status()).toBe(401);
  expect(json.success).toBe(false);
  expect(json.status).toBe(401);
  expect(json.message).toBe(
    "Access token is not valid or has expired, you will need to login"
  );
});

test("Should return 401 Unauthorized when no token is provided", async () => {
  const res = await client.get(`${BASE_URL}${endpoints.profile}`);

  const json = await res.json();

  expect(res.status()).toBe(401);
  expect(json.success).toBe(false);
  expect(json.status).toBe(401);
  expect(json.message).toBe(
    "No authentication token specified in x-auth-token header"
  );
});