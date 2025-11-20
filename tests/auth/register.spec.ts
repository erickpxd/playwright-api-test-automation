import { test, expect, APIRequestContext } from "@playwright/test";
import { env } from "../../config/environment";
import { endpoints } from "../../config/endpoints";

const BASE_URL = env.notesUrl;
const password = env.testPassword;

let disposableEmail = "";
let disposableToken = "";

test.beforeAll(async ({ request }) => {
  disposableEmail = `discard_${Date.now()}@test.com`;

  await request.post(`${BASE_URL}${endpoints.register}`, {
    data: {
      name: "Disposable",
      email: disposableEmail,
      password,
    },
  });

  const login = await request.post(`${BASE_URL}${endpoints.login}`, {
    data: {
      email: disposableEmail,
      password,
    },
  });

  const loginJson = await login.json();
  disposableToken = loginJson.data.token;
});

test.afterAll(async ({ request }) => {
  await request.delete(`${BASE_URL}${endpoints.deleteAccount}`, {
    headers: { "x-auth-token": disposableToken },
  });
});

async function deleteUser(request: APIRequestContext, token: string) {
  await request.delete(`${BASE_URL}${endpoints.deleteAccount}`, {
    headers: { "x-auth-token": token },
  });
}

test("should register a new user successfully", async ({ request }) => {
  const email = `register_${Date.now()}@test.com`;

  const res = await request.post(`${BASE_URL}${endpoints.register}`, {
    data: {
      name: "Tester",
      email,
      password,
    },
  });

  expect(res.status()).toBe(201);

  const json = await res.json();
  expect(json.success).toBe(true);
  expect(json.data).toHaveProperty("id");

  const login = await request.post(`${BASE_URL}${endpoints.login}`, {
    data: { email, password },
  });

  const loginJson = await login.json();
  const tempToken = loginJson.data.token;

  await deleteUser(request, tempToken);
});

test("should fail when email is missing", async ({ request }) => {
  const res = await request.post(`${BASE_URL}${endpoints.register}`, {
    data: {
      name: "Tester",
      password,
    },
  });

  expect(res.status()).toBe(400);
  const json = await res.json();

  expect(json.success).toBe(false);
  expect(json.message.toLowerCase()).toContain("email");
});

test("should fail when password is missing", async ({ request }) => {
  const res = await request.post(`${BASE_URL}${endpoints.register}`, {
    data: {
      name: "Tester",
      email: `missingpass_${Date.now()}@test.com`,
    },
  });

  expect(res.status()).toBe(400);
  const json = await res.json();

  expect(json.success).toBe(false);
  expect(json.message.toLowerCase()).toContain("password");
});

test("should fail when email format is invalid", async ({ request }) => {
  const res = await request.post(`${BASE_URL}${endpoints.register}`, {
    data: {
      name: "Tester",
      email: "invalidemail",
      password,
    },
  });

  expect(res.status()).toBe(400);
});
