import { test, expect } from "@playwright/test";
import { env } from "../../config/environment";
import { endpoints } from "../../config/endpoints";

const BASE_URL = env.notesUrl;
const password = env.testPassword;

let disposableEmail = "";
let disposableToken = "";
let accountDeleted = false;

test.beforeAll(async ({ request }) => {
  disposableEmail = `delete_${Date.now()}@test.com`;

  const register = await request.post(`${BASE_URL}${endpoints.register}`, {
    data: {
      name: "Disposable Account",
      email: disposableEmail,
      password,
    },
  });

  expect(register.status()).toBe(201);

  const login = await request.post(`${BASE_URL}${endpoints.login}`, {
    data: {
      email: disposableEmail,
      password,
    },
  });

  const json = await login.json();
  disposableToken = json.data.token;
});

test.afterAll(async ({ request }) => {
  if (!accountDeleted && disposableToken) {
    await request.delete(`${BASE_URL}${endpoints.deleteAccount}`, {
      headers: { "x-auth-token": disposableToken },
    });
  }
});

test("should delete account successfully", async ({ request }) => {
  const res = await request.delete(`${BASE_URL}${endpoints.deleteAccount}`, {
    headers: { "x-auth-token": disposableToken },
  });

  expect(res.status()).toBe(200);

  const json = await res.json();
  expect(json.success).toBe(true);
  expect(json.message.toLowerCase()).toContain(
    "account successfully deleted"
  );

  accountDeleted = true;
});

test("should fail to delete account without token", async ({ request }) => {
  const res = await request.delete(`${BASE_URL}${endpoints.deleteAccount}`);

  expect(res.status()).toBe(401);

  const json = await res.json();
  expect(json.success).toBe(false);
  expect(json.message.toLowerCase()).toMatch(
    "no authentication token"
  );
});

test("should fail to delete account with invalid token", async ({
  request,
}) => {
  const res = await request.delete(`${BASE_URL}${endpoints.deleteAccount}`, {
    headers: { "x-auth-token": "invalid.token.123" },
  });

  expect(res.status()).toBe(401);

  const json = await res.json();
  expect(json.success).toBe(false);

  expect(json.message.toLowerCase()).toMatch(
    "access token is not valid"
  );
});
