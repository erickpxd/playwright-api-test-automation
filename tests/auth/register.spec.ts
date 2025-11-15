import { test, expect, APIRequestContext } from "@playwright/test";

const BASE_URL = process.env.NOTES_URL;

let disposableEmail = "";
let disposableToken = "";

test.beforeAll(async ({ request }) => {
  disposableEmail = `discard_${Date.now()}@test.com`;

  await request.post(`${BASE_URL}/users/register`, {
    data: {
      name: "Disposable",
      email: disposableEmail,
      password: "123321",
    },
  });

  const login = await request.post(`${BASE_URL}/users/login`, {
    data: {
      email: disposableEmail,
      password: "123321",
    },
  });

  const loginJson = await login.json();
  disposableToken = loginJson.data.token;
});

test.afterAll(async ({ request }) => {
  await request.delete(`${BASE_URL}/users/delete-account`, {
    headers: { "x-auth-token": disposableToken },
  });
});

async function deleteUser(request: APIRequestContext, token: string) {
  await request.delete(`${BASE_URL}/users/delete-account`, {
    headers: { "x-auth-token": token },
  });
}

test("should register a new user successfully", async ({ request }) => {
  const email = `register_${Date.now()}@test.com`;

  const res = await request.post(`${BASE_URL}/users/register`, {
    data: {
      name: "Tester",
      email,
      password: "123321",
    },
  });

  expect(res.status()).toBe(201);

  const json = await res.json();
  expect(json.success).toBe(true);
  expect(json.data).toHaveProperty("id");

  const login = await request.post(`${BASE_URL}/users/login`, {
    data: { email, password: "123321" },
  });

  const loginJson = await login.json();
  const tempToken = loginJson.data.token;

  await deleteUser(request, tempToken);
});

test("should fail when email is missing", async ({ request }) => {
  const res = await request.post(`${BASE_URL}/users/register`, {
    data: {
      name: "Tester",
      password: "123321",
    },
  });

  expect(res.status()).toBe(400);
  const json = await res.json();

  expect(json.success).toBe(false);
  expect(json.message.toLowerCase()).toContain("email");
});

test("should fail when password is missing", async ({ request }) => {
  const res = await request.post(`${BASE_URL}/users/register`, {
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
  const res = await request.post(`${BASE_URL}/users/register`, {
    data: {
      name: "Tester",
      email: "invalidemail",
      password: "123321",
    },
  });

  expect(res.status()).toBe(400);
});
