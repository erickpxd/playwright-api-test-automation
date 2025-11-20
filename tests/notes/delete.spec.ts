import { test, expect, APIRequestContext } from "@playwright/test";
import { getToken } from "../../framework/helpers/authHelper";
import { env } from "../../config/environment";
import { endpoints } from "../../config/endpoints";
import { RequestManager } from "../../framework/core/requestManager";

const BASE_URL = env.notesUrl;
const token = getToken();

let client: APIRequestContext;
let testNoteId = "";

test.beforeAll(async () => {
  const manager = await RequestManager.getInstance();
  client = manager.client;

  const create = await client.post(`${BASE_URL}${endpoints.notes}`, {
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

test.afterAll(async () => {
  if (testNoteId) {
    await client.delete(`${BASE_URL}${endpoints.noteById(testNoteId)}`, {
      headers: { "x-auth-token": token },
    });
  }
});

test("should fail to delete a note without token", async () => {
  const res = await client.delete(
    `${BASE_URL}${endpoints.noteById(testNoteId)}`
  );

  expect(res.status()).toBe(401);

  const json = await res.json();
  expect(json.success).toBe(false);
  expect(json.message).toContain("No authentication token");
});

test("should delete a note successfully", async () => {
  const res = await client.delete(
    `${BASE_URL}${endpoints.noteById(testNoteId)}`,
    {
      headers: { "x-auth-token": token },
    }
  );

  expect(res.status()).toBe(200);

  const json = await res.json();
  expect(json.success).toBe(true);
  expect(json.message).toContain("Note successfully deleted");

  testNoteId = "";
});

test("should fail to delete a note with invalid ID", async () => {
  const res = await client.delete(
    `${BASE_URL}${endpoints.noteById("invalid-id")}`,
    {
      headers: { "x-auth-token": token },
    }
  );

  expect([400, 404]).toContain(res.status());

  const json = await res.json();
  expect(json.success).toBe(false);
});