import { test, expect, APIRequestContext } from "@playwright/test";
import { getToken } from "../../framework/helpers/authHelper";
import { env } from "../../config/environment";
import { endpoints } from "../../config/endpoints";
import { RequestManager } from "../../framework/core/requestManager";
import { Logger } from "../../framework/core/logger";
import { LoggingHelper } from "../../framework/helpers/loggingHelper";
import { validateResponse } from "../../framework/helpers/schemaValidator";
import { updateNoteResponseSchema } from "../schemas/noteSchemas";

const BASE_URL = env.notesUrl;
const token = getToken();

let client: APIRequestContext;
let createdNoteId = "";
let logger: Logger;
let loggingHelper: LoggingHelper;

<<<<<<< HEAD
test.beforeAll(async () => {
  const manager = await RequestManager.getInstance();
  client = manager.client;
  logger = Logger.getInstance();
  loggingHelper = new LoggingHelper(logger);

  loggingHelper.logStep("Creating test note for update tests");
  const create = await loggingHelper.makeRequest(
    client,
    "POST",
    `${BASE_URL}${endpoints.notes}`,
    {
      headers: { "x-auth-token": token },
      data: {
        title: "Original Title",
        description: "Original Description",
        category: "Personal",
      },
    }
  );

  const noteJson = await create.json();
  createdNoteId = noteJson.data.id;
  loggingHelper.logStep("Test note created", { noteId: createdNoteId });
});

test.afterAll(async () => {
  await client.delete(`${BASE_URL}${endpoints.noteById(createdNoteId)}`, {
    headers: { "x-auth-token": token },
  });
});

test("should update a note successfully", async () => {
  loggingHelper.logStep("Updating note", { noteId: createdNoteId });

  const response = await loggingHelper.makeRequest(
    client,
    "PUT",
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
  loggingHelper.logStep("Note updated successfully");
});

test("should fail when updating a note with missing title", async () => {
  loggingHelper.logStep("Attempting to update note without title");

  const response = await loggingHelper.makeRequest(
    client,
    "PUT",
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
  loggingHelper.logStep("Validation error handled correctly");
});

test("should fail when updating a note with missing description", async () => {
  loggingHelper.logStep("Attempting to update note without description");

  const response = await loggingHelper.makeRequest(
    client,
    "PUT",
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
  loggingHelper.logStep("Validation error handled correctly");
});

test("should fail when updating a note with missing category", async () => {
  loggingHelper.logStep("Attempting to update note without category");

  const response = await loggingHelper.makeRequest(
    client,
    "PUT",
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
  loggingHelper.logStep("Validation error handled correctly");
});

test("should fail when updating a note with invalid category", async () => {
  loggingHelper.logStep("Attempting to update note with invalid category");

  const response = await loggingHelper.makeRequest(
    client,
    "PUT",
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
  loggingHelper.logStep("Validation error handled correctly");
});

test("should fail when updating a note without token", async () => {
  loggingHelper.logStep("Attempting to update note without authentication");

  const response = await loggingHelper.makeRequest(
    client,
    "PUT",
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
  loggingHelper.logStep("Authentication error handled correctly");
});
=======
test.describe("Notes | Update", () => {
  test.beforeAll(async () => {
    const manager = await RequestManager.getInstance();
    client = manager.client;
    logger = Logger.getInstance();
    loggingHelper = new LoggingHelper(logger);

    loggingHelper.logStep("Creating test note for update tests");
    const create = await loggingHelper.makeRequest(
      client,
      "POST",
      `${BASE_URL}${endpoints.notes}`,
      {
        headers: { "x-auth-token": token },
        data: {
          title: "Original Title",
          description: "Original Description",
          category: "Personal",
        },
      }
    );

    const noteJson = await create.json();
    createdNoteId = noteJson.data.id;
    loggingHelper.logStep("Test note created", { noteId: createdNoteId });
  });

  test.afterAll(async () => {
    await client.delete(`${BASE_URL}${endpoints.noteById(createdNoteId)}`, {
      headers: { "x-auth-token": token },
    });
  });

  test.describe("Smoke", () => {
    test("should update a note successfully", async () => {
      loggingHelper.logStep("Updating note", { noteId: createdNoteId });

      const response = await loggingHelper.makeRequest(
        client,
        "PUT",
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
      validateResponse(updateNoteResponseSchema, json);
      expect(json.success).toBe(true);
      expect(json.message).toContain("Note successfully Updated");
      expect(json.data).toHaveProperty("id");
      expect(json.data.title).toBe("Updated Title");
      loggingHelper.logStep("Note updated successfully");
    });
  });

  test.describe("Regression", () => {
    test("should fail when updating a note with missing title", async () => {
      loggingHelper.logStep("Attempting to update note without title");

      const response = await loggingHelper.makeRequest(
        client,
        "PUT",
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
      loggingHelper.logStep("Validation error handled correctly");
    });

    test("should fail when updating a note with missing description", async () => {
      loggingHelper.logStep("Attempting to update note without description");

      const response = await loggingHelper.makeRequest(
        client,
        "PUT",
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
      loggingHelper.logStep("Validation error handled correctly");
    });

    test("should fail when updating a note with missing category", async () => {
      loggingHelper.logStep("Attempting to update note without category");

      const response = await loggingHelper.makeRequest(
        client,
        "PUT",
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
      loggingHelper.logStep("Validation error handled correctly");
    });

    test("should fail when updating a note with invalid category", async () => {
      loggingHelper.logStep("Attempting to update note with invalid category");

      const response = await loggingHelper.makeRequest(
        client,
        "PUT",
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
      loggingHelper.logStep("Validation error handled correctly");
    });

    test("should fail when updating a note without token", async () => {
      loggingHelper.logStep("Attempting to update note without authentication");

      const response = await loggingHelper.makeRequest(
        client,
        "PUT",
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
      loggingHelper.logStep("Authentication error handled correctly");
    });
  });
});
>>>>>>> 045111e2b2e34aa477768c3ed613b0cc4e3852e4
