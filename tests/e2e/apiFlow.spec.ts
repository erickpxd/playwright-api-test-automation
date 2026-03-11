import { test, expect, APIRequestContext } from "@playwright/test";
import { env } from "../../config/environment";
import { endpoints } from "../../config/endpoints";
import { RequestManager } from "../../framework/core/requestManager";
import { Logger } from "../../framework/core/logger";
import { LoggingHelper } from "../../framework/helpers/loggingHelper";
import { validateResponse } from "../../framework/helpers/schemaValidator";
import {
  createNoteResponseSchema,
  deleteNoteResponseSchema,
  getNoteByIdResponseSchema,
  listNotesResponseSchema,
  updateNoteResponseSchema,
} from "../schemas/noteSchemas";
import {
  deleteAccountResponseSchema,
  loginResponseSchema,
  registerResponseSchema,
} from "../schemas/authSchemas";

const BASE_URL = env.notesUrl;
const password = env.testPassword;

let client: APIRequestContext;
let logger: Logger;
let loggingHelper: LoggingHelper;
let disposableEmail = "";
let token = "";
let noteId = "";
let accountDeleted = false;

test.describe("E2E | Auth and Notes flow", () => {
  test.beforeAll(async () => {
    const manager = await RequestManager.getInstance();
    client = manager.client;
    logger = Logger.getInstance();
    loggingHelper = new LoggingHelper(logger);

    disposableEmail = `e2e_${Date.now()}@test.com`;
  });

  test.afterAll(async () => {
    if (noteId && token) {
      await client.delete(`${BASE_URL}${endpoints.noteById(noteId)}`, {
        headers: { "x-auth-token": token },
      });
    }

    if (!accountDeleted && token) {
      await client.delete(`${BASE_URL}${endpoints.deleteAccount}`, {
        headers: { "x-auth-token": token },
      });
    }
  });

  test("should complete the full auth and notes lifecycle", async () => {
    loggingHelper.logStep("Registering disposable user for E2E flow");
    const register = await loggingHelper.makeRequest(
      client,
      "POST",
      `${BASE_URL}${endpoints.register}`,
      {
        data: {
          name: "E2E User",
          email: disposableEmail,
          password,
        },
      }
    );

    expect(register.status()).toBe(201);
    const registerJson = await register.json();
    validateResponse(registerResponseSchema, registerJson);
    expect(registerJson.success).toBe(true);
    expect(registerJson.data).toHaveProperty("id");

    loggingHelper.logStep("Logging in with disposable user");
    const login = await loggingHelper.makeRequest(
      client,
      "POST",
      `${BASE_URL}${endpoints.login}`,
      {
        data: {
          email: disposableEmail,
          password,
        },
      }
    );

    expect(login.status()).toBe(200);
    const loginJson = await login.json();
    validateResponse(loginResponseSchema, loginJson);
    token = loginJson.data.token;
    expect(typeof token).toBe("string");

    loggingHelper.logStep("Creating note as authenticated user");
    const createNote = await loggingHelper.makeRequest(
      client,
      "POST",
      `${BASE_URL}${endpoints.notes}`,
      {
        headers: { "x-auth-token": token },
        data: {
          title: "E2E Note",
          description: "E2E note description",
          category: "Personal",
        },
      }
    );

    expect(createNote.status()).toBe(200);
    const createNoteJson = await createNote.json();
    validateResponse(createNoteResponseSchema, createNoteJson);
    noteId = createNoteJson.data.id;
    expect(noteId).toBeTruthy();

    loggingHelper.logStep("Retrieving created note");
    const getNote = await loggingHelper.makeRequest(
      client,
      "GET",
      `${BASE_URL}${endpoints.noteById(noteId)}`,
      {
        headers: { "x-auth-token": token },
      }
    );

    expect(getNote.status()).toBe(200);
    const getNoteJson = await getNote.json();
    validateResponse(getNoteByIdResponseSchema, getNoteJson);
    expect(getNoteJson.data.id).toBe(noteId);
    expect(getNoteJson.data.title).toBe("E2E Note");

    loggingHelper.logStep("Updating note content");
    const updateNote = await loggingHelper.makeRequest(
      client,
      "PUT",
      `${BASE_URL}${endpoints.noteById(noteId)}`,
      {
        headers: { "x-auth-token": token },
        data: {
          title: "E2E Note Updated",
          description: "Updated description",
          category: "Personal",
          completed: true,
        },
      }
    );

    expect(updateNote.status()).toBe(200);
    const updateNoteJson = await updateNote.json();
    validateResponse(updateNoteResponseSchema, updateNoteJson);
    expect(updateNoteJson.success).toBe(true);
    expect(updateNoteJson.message).toContain("Note successfully Updated");

    loggingHelper.logStep("Listing notes to ensure updated note is present");
    const listNotes = await loggingHelper.makeRequest(
      client,
      "GET",
      `${BASE_URL}${endpoints.notes}`,
      {
        headers: { "x-auth-token": token },
      }
    );

    expect(listNotes.status()).toBe(200);
    const listJson = await listNotes.json();
    validateResponse(listNotesResponseSchema, listJson);
    const found = listJson.data.find(
      (note: { id: string }) => note.id === noteId
    );
    expect(found).toBeTruthy();

    loggingHelper.logStep("Deleting note");
    const deleteNote = await loggingHelper.makeRequest(
      client,
      "DELETE",
      `${BASE_URL}${endpoints.noteById(noteId)}`,
      {
        headers: { "x-auth-token": token },
      }
    );

    expect(deleteNote.status()).toBe(200);
    const deleteNoteJson = await deleteNote.json();
    validateResponse(deleteNoteResponseSchema, deleteNoteJson);
    expect(deleteNoteJson.success).toBe(true);
    expect(deleteNoteJson.message).toContain("Note successfully deleted");
    noteId = "";

    loggingHelper.logStep("Deleting account");
    const deleteAccount = await loggingHelper.makeRequest(
      client,
      "DELETE",
      `${BASE_URL}${endpoints.deleteAccount}`,
      {
        headers: { "x-auth-token": token },
      }
    );

    expect(deleteAccount.status()).toBe(200);
    const deleteAccountJson = await deleteAccount.json();
    validateResponse(deleteAccountResponseSchema, deleteAccountJson);
    expect(deleteAccountJson.success).toBe(true);
    expect(deleteAccountJson.message.toLowerCase()).toContain(
      "account successfully deleted"
    );
    accountDeleted = true;
  });
});
