import { test, expect, APIRequestContext } from "@playwright/test";
import { getToken } from "../../framework/helpers/authHelper";
import { env } from "../../config/environment";
import { endpoints } from "../../config/endpoints";
import { RequestManager } from "../../framework/core/requestManager";

const BASE_URL = env.notesUrl;
const token = getToken();

let client: APIRequestContext;
let createdNoteId = "";

test.beforeAll(async () => {
  const manager = await RequestManager.getInstance();
  client = manager.client;

  const create = await client.post(`${BASE_URL}${endpoints.notes}`, {
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

test.afterAll(async () => {
  await client.delete(`${BASE_URL}${endpoints.noteById(createdNoteId)}`, {
    headers: { "x-auth-token": token },
  });
});

test("should update a note successfully", async () => {
  const response = await client.put(
    `${BASE_URL}${endpoints.noteById(createdNoteId)}`,
    {
      headers: { "x-auth-token": token },
      data: {
        title: "Updated Title",
        description: "Updated Description",
        category: "Personal",
        completed: true,
      },
    }
  );

  expect(response.status()).toBe(200);

  const json = await response.json();
  expect(json.success).toBe(true);
  expect(json.message).toContain("Note successfully Updated");
  expect(json.data).toHaveProperty("id");
  expect(json.data.title).toBe("Updated Title");
});

test("should fail when updating a note with missing title", async () => {
  const response = await client.put(
    `${BASE_URL}${endpoints.noteById(createdNoteId)}`,
    {
      headers: { "x-auth-token": token },
      data: {
        description: "Updated Description",
        category: "Personal",
      },
    }
  );

  expect(response.status()).toBe(400);

  const json = await response.json();
  expect(json.message).toContain("Title must be between");
});

test("should fail when updating a note with missing description", async () => {
  const response = await client.put(
    `${BASE_URL}${endpoints.noteById(createdNoteId)}`,
    {
      headers: { "x-auth-token": token },
      data: {
        title: "Updated Title",
        category: "Personal",
      },
    }
  );

  expect(response.status()).toBe(400);

  const json = await response.json();
  expect(json.message).toContain("Description must be between");
});

test("should fail when updating a note with missing category", async () => {
  const response = await client.put(
    `${BASE_URL}${endpoints.noteById(createdNoteId)}`,
    {
      headers: { "x-auth-token": token },
      data: {
        title: "Updated Title",
        description: "Updated Description",
      },
    }
  );

  expect(response.status()).toBe(400);

  const json = await response.json();
  expect(json.message).toContain(
    "Category must be one of the categories:"
  );
});

test("should fail when updating a note with invalid category", async () => {
  const response = await client.put(
    `${BASE_URL}${endpoints.noteById(createdNoteId)}`,
    {
      headers: { "x-auth-token": token },
      data: {
        title: "Updated Title",
        description: "Updated Description",
        category: "Electronics",
      },
    }
  );

  expect(response.status()).toBe(400);

  const json = await response.json();
  expect(json.message).toContain(
    "Category must be one of the categories:"
  );
});

test("should fail when updating a note without token", async () => {
  const response = await client.put(
    `${BASE_URL}${endpoints.noteById(createdNoteId)}`,
    {
      data: {
        title: "Updated Title",
        description: "Updated Description",
        category: "Personal",
        completed: false,
      },
    }
  );

  expect(response.status()).toBe(401);

  const json = await response.json();
  expect(json.message).toContain("No authentication token");
});