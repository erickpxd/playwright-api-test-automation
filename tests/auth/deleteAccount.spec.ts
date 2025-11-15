import { test, expect } from "@playwright/test";

const BASE_URL = process.env.NOTES_URL;
const password = process.env.TEST_PASSWORD;

let disposableEmail = "";
let disposableToken = "";
let accountDeleted = false;

test.beforeAll(async ({ request }) => {
  disposableEmail = `delete_${Date.now()}@test.com`;

  const register = await request.post(`${BASE_URL}/users/register`, {
    data: {
      name: "Disposable Account",
      email: disposableEmail,
      password: password,
    },
  });

  expect(register.status()).toBe(201);

  const login = await request.post(`${BASE_URL}/users/login`, {
    data: {
      email: disposableEmail,
      password: password,
    },
  });

  const json = await login.json();
  disposableToken = json.data.token;
});

test.afterAll(async ({ request }) => {
  if (!accountDeleted && disposableToken) {
    await request.delete(`${BASE_URL}/users/delete-account`, {
      headers: { "x-auth-token": disposableToken },
    });
  }
});

test("should delete account successfully", async ({ request }) => {
  const res = await request.delete(`${BASE_URL}/users/delete-account`, {
    headers: { "x-auth-token": disposableToken },
  });

  expect(res.status()).toBe(200);

  const json = await res.json();
  expect(json.success).toBe(true);
  expect(json.message.toLowerCase()).toContain("account successfully deleted");

  accountDeleted = true;
});

test("should fail to delete account without token", async ({ request }) => {
  const res = await request.delete(`${BASE_URL}/users/delete-account`);

  expect(res.status()).toBe(401);

  const json = await res.json();
  expect(json.success).toBe(false);
  expect(json.message.toLowerCase()).toMatch("no authentication token");
});

test("should fail to delete account with invalid token", async ({
  request,
}) => {
  const res = await request.delete(`${BASE_URL}/users/delete-account`, {
    headers: { "x-auth-token": "invalid.token.123" },
  });

  expect(res.status()).toBe(401);

  const json = await res.json();
  expect(json.success).toBe(false);

  expect(json.message.toLowerCase()).toMatch("access token is not valid");
});
