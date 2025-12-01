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

test.describe("Notes | Create", () => {
  test.beforeAll(async () => {
    const manager = await RequestManager.getInstance();
    client = manager.client;
    logger = Logger.getInstance();
    loggingHelper = new LoggingHelper(logger);
  });

  test.afterAll(async () => {
    if (testNoteId) {
      await client.delete(`${BASE_URL}${endpoints.noteById(testNoteId)}`, {
        headers: { "x-auth-token": token },
      });
    }
  });

  test.describe("Smoke", () => {
    test("should create a note successfully", async () => {
      loggingHelper.logStep("Creating a new note");

      const response = await loggingHelper.makeRequest(
        client,
        "POST",
        `${BASE_URL}${endpoints.notes}`,
        {
          headers: { "x-auth-token": token },
          data: {
            title: "New note",
            description: "Testing note",
            category: "Personal",
          },
        }
      );

      const json = await response.json();

      expect(response.status()).toBe(200);
      expect(json.data).toHaveProperty("id");
      expect(response.headers()["content-type"]).toContain("application/json");

      testNoteId = json.data.id;
      loggingHelper.logStep("Note created successfully", { noteId: testNoteId });
    });
  });

  test.describe("Regression", () => {
    test("should fail to create note with missing title", async () => {
      loggingHelper.logStep("Attempting to create note without title");

      const response = await loggingHelper.makeRequest(
        client,
        "POST",
        `${BASE_URL}${endpoints.notes}`,
        {
          headers: { "x-auth-token": token },
          data: {
            description: "Testing note",
            category: "Personal",
          },
        }
      );

      const json = await response.json();

      expect(response.status()).toBe(400);
      expect(json.message).toContain("Title must be between");
      loggingHelper.logStep("Validation error handled correctly");
    });

    test("should fail to create note with missing description", async () => {
      loggingHelper.logStep("Attempting to create note without description");

      const response = await loggingHelper.makeRequest(
        client,
        "POST",
        `${BASE_URL}${endpoints.notes}`,
        {
          headers: { "x-auth-token": token },
          data: {
            title: "New note",
            category: "Personal",
          },
        }
      );

      const json = await response.json();

      expect(response.status()).toBe(400);
      expect(json.message).toContain("Description must be between");
      loggingHelper.logStep("Validation error handled correctly");
    });

    test("should fail to create note with missing category", async () => {
      loggingHelper.logStep("Attempting to create note without category");

      const response = await loggingHelper.makeRequest(
        client,
        "POST",
        `${BASE_URL}${endpoints.notes}`,
        {
          headers: { "x-auth-token": token },
          data: {
            title: "New note",
            description: "Testing note",
          },
        }
      );

      const json = await response.json();

      expect(response.status()).toBe(400);
      expect(json.message).toContain(
        "Category must be one of the categories:"
      );
      loggingHelper.logStep("Validation error handled correctly");
    });

    test("should fail to create note with invalid category", async () => {
      loggingHelper.logStep("Attempting to create note with invalid category");

      const response = await loggingHelper.makeRequest(
        client,
        "POST",
        `${BASE_URL}${endpoints.notes}`,
        {
          headers: { "x-auth-token": token },
          data: {
            title: "New note",
            description: "Testing note",
            category: "Electronic",
          },
        }
      );

      const json = await response.json();

      expect(response.status()).toBe(400);
      expect(json.message).toContain(
        "Category must be one of the categories:"
      );
      loggingHelper.logStep("Validation error handled correctly");
    });

    test("should fail to create note with missing token", async () => {
      loggingHelper.logStep("Attempting to create note without authentication token");

      const response = await loggingHelper.makeRequest(
        client,
        "POST",
        `${BASE_URL}${endpoints.notes}`,
        {
          data: {
            title: "New note",
            description: "Testing note",
            category: "Personal",
          },
        }
      );

      const json = await response.json();

      expect(response.status()).toBe(401);
      expect(json.message).toContain("No authentication token");
      loggingHelper.logStep("Authentication error handled correctly");
    });
  });
});
