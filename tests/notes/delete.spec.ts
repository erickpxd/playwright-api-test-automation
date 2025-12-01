import { test, expect, APIRequestContext } from "@playwright/test";
import { getToken } from "../../framework/helpers/authHelper";
import { env } from "../../config/environment";
import { endpoints } from "../../config/endpoints";
import { RequestManager } from "../../framework/core/requestManager";
import { Logger } from "../../framework/core/logger";
import { LoggingHelper } from "../../framework/helpers/loggingHelper";

const BASE_URL = env.notesUrl;
const token = getToken();

let client: APIRequestContext;
let testNoteId = "";
let logger: Logger;
let loggingHelper: LoggingHelper;

test.describe("Notes | Delete", () => {
  test.beforeAll(async () => {
    const manager = await RequestManager.getInstance();
    client = manager.client;
    logger = Logger.getInstance();
    loggingHelper = new LoggingHelper(logger);

    loggingHelper.logStep("Creating test note for deletion tests");
    const create = await loggingHelper.makeRequest(
      client,
      "POST",
      `${BASE_URL}${endpoints.notes}`,
      {
        headers: { "x-auth-token": token },
        data: {
          title: "Note to be deleted",
          description: "This note will be deleted",
          category: "Personal",
        },
      }
    );

    const json = await create.json();
    testNoteId = json.data.id;
    loggingHelper.logStep("Test note created", { noteId: testNoteId });
  });

  test.afterAll(async () => {
    if (testNoteId) {
      await client.delete(`${BASE_URL}${endpoints.noteById(testNoteId)}`, {
        headers: { "x-auth-token": token },
      });
    }
  });

  test.describe("Smoke", () => {
    test("should delete a note successfully", async () => {
      loggingHelper.logStep("Deleting note", { noteId: testNoteId });

      const res = await loggingHelper.makeRequest(
        client,
        "DELETE",
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
      loggingHelper.logStep("Note deleted successfully");
    });
  });

  test.describe("Regression", () => {
    test.beforeAll(async () => {
      // Recria a nota se a suíte de Smoke já a removeu.
      if (!testNoteId) {
        const create = await loggingHelper.makeRequest(
          client,
          "POST",
          `${BASE_URL}${endpoints.notes}`,
          {
            headers: { "x-auth-token": token },
            data: {
              title: "Note for negative delete",
              description: "Negative path",
              category: "Personal",
            },
          }
        );

        const json = await create.json();
        testNoteId = json.data.id;
      }
    });

    test("should fail to delete a note without token", async () => {
      loggingHelper.logStep("Attempting to delete note without authentication");

      const res = await loggingHelper.makeRequest(
        client,
        "DELETE",
        `${BASE_URL}${endpoints.noteById(testNoteId)}`,
        {}
      );

      expect(res.status()).toBe(401);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.message).toContain("No authentication token");
      loggingHelper.logStep("Authentication error handled correctly");
    });

    test("should fail to delete a note with invalid ID", async () => {
      loggingHelper.logStep("Attempting to delete note with invalid ID");

      const res = await loggingHelper.makeRequest(
        client,
        "DELETE",
        `${BASE_URL}${endpoints.noteById("invalid-id")}`,
        {
          headers: { "x-auth-token": token },
        }
      );

      expect([400, 404]).toContain(res.status());

      const json = await res.json();
      expect(json.success).toBe(false);
      loggingHelper.logStep("Invalid ID error handled correctly");
    });
  });
});
