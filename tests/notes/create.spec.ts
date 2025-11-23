import { test, expect } from "@playwright/test";
import { getToken } from "../../framework/helpers/authHelper";
import { env } from "../../config/environment";
import { endpoints } from "../../config/endpoints";

const BASE_URL = env.notesUrl;

let testNoteId = "";
const token = getToken();

test.afterAll(async ({ request }) => {
  if (testNoteId) {
    await request.delete(`${BASE_URL}${endpoints.noteById(testNoteId)}`, {
      headers: { "x-auth-token": token },
    });
  }
});

test("should create a note successfully", async ({ request }) => {
  const response = await request.post(`${BASE_URL}${endpoints.notes}`, {
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
  const response = await request.post(`${BASE_URL}${endpoints.notes}`, {
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

test("should fail to create note with missing description", async ({
  request,
}) => {
  const response = await request.post(`${BASE_URL}${endpoints.notes}`, {
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

test("should fail to create note with missing category", async ({
  request,
}) => {
  const response = await request.post(`${BASE_URL}${endpoints.notes}`, {
    headers: { "x-auth-token": token },
    data: {
      title: "New note",
      description: "Testing note",
    },
  });

  const json = await response.json();

  expect(response.status()).toBe(400);
  expect(json.message).toContain(
    "Category must be one of the categories:"
  );
});

test("should fail to create note with invalid category", async ({
  request,
}) => {
  const response = await request.post(`${BASE_URL}${endpoints.notes}`, {
    headers: { "x-auth-token": token },
    data: {
      title: "New note",
      description: "Testing note",
      category: "Electronic",
    },
  });

  const json = await response.json();

  expect(response.status()).toBe(400);
  expect(json.message).toContain(
    "Category must be one of the categories:"
  );
});

test("should fail to create note with missing token", async ({ request }) => {
  const response = await request.post(`${BASE_URL}${endpoints.notes}`, {
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