import { test, expect, APIRequestContext } from "@playwright/test";
import { getToken } from "../../utils/auth";

const BASE_URL = process.env.NOTES_URL;

let createdNoteId = "";

const token = getToken();

test.beforeAll(async ({ request }) => {
  const create = await request.post(`${BASE_URL}/notes`, {
    headers: { "x-auth-token": token },
    data: {
      title: "Original Title",
      description: "Original Description",
      category: "Personal",
    },
  });

  const noteJson = await create.json();
  createdNoteId = noteJson.data.id;
});

test.afterAll(async ({ request }) => {
  await request.delete(`${BASE_URL}/notes/${createdNoteId}`, {
    headers: { "x-auth-token": token },
  });
});

test("should update a note successfully", async ({ request }) => {
  const response = await request.put(`${BASE_URL}/notes/${createdNoteId}`, {
    headers: { "x-auth-token": token },
    data: {
      title: "Updated Title",
      description: "Updated Description",
      category: "Personal",
      completed: true
    },
  });

  expect(response.status()).toBe(200);

  const json = await response.json();
  expect(json.success).toBe(true);
  expect(json.message).toContain("Note successfully Updated");
  expect(json.data).toHaveProperty("id");
  expect(json.data.title).toBe("Updated Title");
});

test("should fail when updating a note with missing title", async ({ request }) => {
  const response = await request.put(`${BASE_URL}/notes/${createdNoteId}`, {
    headers: { "x-auth-token": token },
    data: {
      description: "Updated Description",
      category: "Personal",
    },
  });

  expect(response.status()).toBe(400);

  const json = await response.json();
  expect(json.message).toContain("Title must be between");
});

test("should fail when updating a note with missing description", async ({ request }) => {
  const response = await request.put(`${BASE_URL}/notes/${createdNoteId}`, {
    headers: { "x-auth-token": token },
    data: {
      title: "Updated Title",
      category: "Personal",
    },
  });

  expect(response.status()).toBe(400);

  const json = await response.json();
  expect(json.message).toContain("Description must be between");
});

test("should fail when updating a note with missing category", async ({ request }) => {
  const response = await request.put(`${BASE_URL}/notes/${createdNoteId}`, {
    headers: { "x-auth-token": token },
    data: {
      title: "Updated Title",
      description: "Updated Description",
    },
  });

  expect(response.status()).toBe(400);

  const json = await response.json();
  expect(json.message).toContain("Category must be one of the categories:");
});

test("should fail when updating a note with invalid category", async ({ request }) => {
  const response = await request.put(`${BASE_URL}/notes/${createdNoteId}`, {
    headers: { "x-auth-token": token },
    data: {
      title: "Updated Title",
      description: "Updated Description",
      category: "Electronics",
    },
  });

  expect(response.status()).toBe(400);

  const json = await response.json();
  expect(json.message).toContain("Category must be one of the categories:");
});

test("should fail when updating a note without token", async ({ request }) => {
  const response = await request.put(`${BASE_URL}/notes/${createdNoteId}`, {
    data: {
      title: "Updated Title",
      description: "Updated Description",
      category: "Personal",
      completed:false
    },
  });

  expect(response.status()).toBe(401);

  const json = await response.json();
  expect(json.message).toContain("No authentication token");
  });
