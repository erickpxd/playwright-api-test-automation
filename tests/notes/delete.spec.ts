import { test, expect } from "@playwright/test";
import { getToken } from "../../utils/auth";

const BASE_URL = process.env.NOTES_URL;
const token = getToken();

let testNoteId = "";

test.beforeAll(async ({ request }) => {
  const create = await request.post(`${BASE_URL}/notes`, {
    headers: { "x-auth-token": token },
    data: {
      title: "Note to be deleted",
      description: "This note will be deleted",
      category: "Personal",
    },
  });

  const json = await create.json();
  testNoteId = json.data.id;
});


test.afterAll(async ({ request }) => {
  if (testNoteId) {
    await request.delete(`${BASE_URL}/notes/${testNoteId}`, {
      headers: { "x-auth-token": token },
    });
  }
});

test("should fail to delete a note without token", async ({ request }) => {
  const res = await request.delete(`${BASE_URL}/notes/${testNoteId}`);

  expect(res.status()).toBe(401);

  const json = await res.json();
  expect(json.success).toBe(false);
  expect(json.message).toContain("No authentication token");
});

test("should delete a note successfully", async ({ request }) => {
  const res = await request.delete(`${BASE_URL}/notes/${testNoteId}`, {
    headers: { "x-auth-token": token },
  });

  expect(res.status()).toBe(200);

  const json = await res.json();
  expect(json.success).toBe(true);
  expect(json.message).toContain("Note successfully deleted");

  testNoteId = "";
});

test("should fail to delete a note with invalid ID", async ({ request }) => {
  const res = await request.delete(`${BASE_URL}/notes/invalid-id`, {
    headers: { "x-auth-token": token },
  });

  expect([400, 404]).toContain(res.status());

  const json = await res.json();
  expect(json.success).toBe(false);
});
