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

test("should list all notes successfully", async () => {
  const res = await client.get(`${BASE_URL}${endpoints.notes}`, {
    headers: { "x-auth-token": token },
  });

  expect(res.status()).toBe(200);

  const json = await res.json();
  expect(json.success).toBe(true);
  expect(Array.isArray(json.data)).toBe(true);

  if (json.data.length > 0) {
    const first = json.data[0];

    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("title");
    expect(first).toHaveProperty("description");
    expect(first).toHaveProperty("category");

    expect(typeof first.id).toBe("string");
    expect(typeof first.title).toBe("string");
    expect(typeof first.description).toBe("string");
    expect(typeof first.category).toBe("string");
  }
});

test("should fail to list notes without token", async () => {
  const res = await client.get(`${BASE_URL}${endpoints.notes}`);

  expect(res.status()).toBe(401);

  const json = await res.json();
  expect(json.success).toBe(false);
});

test("should fail to list notes with invalid token", async () => {
  const res = await client.get(`${BASE_URL}${endpoints.notes}`, {
    headers: { "x-auth-token": "123.invalid.token.456" },
  });

  expect(res.status()).toBe(401);

  const json = await res.json();

  expect(json.success).toBe(false);

  if (json.message) {
    expect(json.message.toLowerCase()).toMatch(
      "access token is not valid"
    );
  }
});
