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

test("should login successfully with valid credentials", async ({ request }) => {
  const email = `login_success_${Date.now()}@auto.com`;

  await request.post(`${BASE_URL}${endpoints.register}`, {
    data: { name: "Login", email, password },
  });

  const res = await request.post(`${BASE_URL}${endpoints.login}`, {
    data: { email, password },
  });

  expect(res.status()).toBe(200);

  const json = await res.json();

  expect(json.success).toBe(true);
  expect(json.data).toHaveProperty("token");
  expect(typeof json.data.token).toBe("string");

  const token = json.data.token;
  await deleteUser(request, token);
});

test("should fail login when password is wrong", async ({ request }) => {
  const res = await request.post(`${BASE_URL}${endpoints.login}`, {
    data: {
      email: disposableEmail,
      password: "wrongpass",
    },
  });

  expect(res.status()).toBe(401);

  const json = await res.json();
  expect(json.success).toBe(false);
  expect(json.message.toLowerCase()).toContain("incorrect");
});

test("should fail login when email does not exist", async ({ request }) => {
  const res = await request.post(`${BASE_URL}${endpoints.login}`, {
    data: {
      email: "notfound@test.com",
      password,
    },
  });

  expect(res.status()).toBe(401);

  const json = await res.json();
  expect(json.success).toBe(false);
});

test("should fail login when email is missing", async ({ request }) => {
  const res = await request.post(`${BASE_URL}${endpoints.login}`, {
    data: {
      password,
    },
  });

  expect(res.status()).toBe(400);

  const json = await res.json();
  expect(json.success).toBe(false);
  expect(json.message.toLowerCase()).toContain("email");
});

test("should fail login when password is missing", async ({ request }) => {
  const res = await request.post(`${BASE_URL}${endpoints.login}`, {
    data: {
      email: disposableEmail,
    },
  });

  expect(res.status()).toBe(400);

  const json = await res.json();
  expect(json.success).toBe(false);
  expect(json.message.toLowerCase()).toContain("password");
});