import { test, expect } from "@playwright/test";
import { getToken } from "../../utils/auth";

const BASE_URL = process.env.NOTES_URL;

let disposableEmail = "";
let disposableToken = "";
let testNoteId = "";
const password = process.env.TEST_PASSWORD; 
const token = getToken();

test.beforeAll(async ({ request }) => {
  disposableEmail = `discard_${Date.now()}@test.com`;

  await request.post(`${BASE_URL}/users/register`, {
    data: {
      name: "Disposable",
      email: disposableEmail,
      password: password,
    },
  });

  const login = await request.post(`${BASE_URL}/users/login`, {
    data: {
      email: disposableEmail,
      password: password,
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

test("should create a note successfully", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/notes`, {
      headers: { "x-auth-token": token },
      data: {
        title: "New note",
        description: "Testing note",
        category: "Personal",
      },
    });

    const json = await response.json();

    expect(response.status()).toBe(200);
    expect(json.data).toHaveProperty("id");
    expect(response.headers()["content-type"]).toContain("application/json");

    testNoteId = json.data.id;
});

test("should fail to create note with missing title", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/notes`, {
      headers: { "x-auth-token": token },
      data: {
        description: "Testing note",
        category: "Personal",
      },
    });

    const json = await response.json();

    expect(response.status()).toBe(400);
    expect(json.message).toContain("Title must be between");
});

test("should fail to create note with missing description", async ({request}) => {
    const response = await request.post(`${BASE_URL}/notes`, {
      headers: { "x-auth-token": token },
      data: {
        title: "New note",
        category: "Personal",
      },
    });

    const json = await response.json();

    expect(response.status()).toBe(400);
    expect(json.message).toContain("Description must be between");
});

test("should fail to create note with missing category", async ({request}) => {
    const response = await request.post(`${BASE_URL}/notes`, {
      headers: { "x-auth-token": token },
      data: {
        title: "New note",
        description: "Testing note",
      },
    });

    const json = await response.json();

    expect(response.status()).toBe(400);
    expect(json.message).toContain("Category must be one of the categories:");
});

test("should fail to create note with invalid category", async ({request}) => {
    const response = await request.post(`${BASE_URL}/notes`, {
      headers: { "x-auth-token": token },
      data: {
        title: "New note",
        description: "Testing note",
        category: "Electronic",
      },
    });

    const json = await response.json();

    expect(response.status()).toBe(400);
    expect(json.message).toContain("Category must be one of the categories:");
});

test("should fail to create note with missing token", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/notes`, {
      data: {
        title: "New note",
        description: "Testing note",
        category: "Personal",
      },
    });

    const json = await response.json();

    expect(response.status()).toBe(401);
    expect(json.message).toContain("No authentication token");
});