import { test, expect, APIRequestContext } from "@playwright/test";
import { getToken } from "../../framework/helpers/authHelper";
import { env } from "../../config/environment";
import { endpoints } from "../../config/endpoints";
import { RequestManager } from "../../framework/core/requestManager";
import { Logger } from "../../framework/core/logger";
import { LoggingHelper } from "../../framework/helpers/loggingHelper";
import { validateResponse } from "../../framework/helpers/schemaValidator";
import { listNotesResponseSchema } from "../schemas/noteSchemas";

const BASE_URL = env.notesUrl;
const token = getToken();

let client: APIRequestContext;
let logger: Logger;
let loggingHelper: LoggingHelper;

test.describe("Notes | Get", () => {
  test.beforeAll(async () => {
    const manager = await RequestManager.getInstance();
    client = manager.client;
    logger = Logger.getInstance();
    loggingHelper = new LoggingHelper(logger);
  });

  test.describe("Smoke", () => {
    test("should list all notes successfully", async () => {
      loggingHelper.logStep("Retrieving all notes");

      const res = await loggingHelper.makeRequest(
        client,
        "GET",
        `${BASE_URL}${endpoints.notes}`,
        {
          headers: { "x-auth-token": token },
        }
      );

      expect(res.status()).toBe(200);

      const json = await res.json();
      validateResponse(listNotesResponseSchema, json);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);

      if (json.data.length > 0) {
        const first = json.data[0];

        expect(first).toHaveProperty("id");
        expect(first).toHaveProperty("title");
        expect(first).toHaveProperty("description");
        expect(first).toHaveProperty("category");

        expect(typeof first.id).toBe("string");
        expect(typeof first.title).toBe("string");
        expect(typeof first.description).toBe("string");
        expect(typeof first.category).toBe("string");
      }

      loggingHelper.logStep("Notes retrieved successfully", { count: json.data.length });
    });
  });

  test.describe("Regression", () => {
    test("should fail to list notes without token", async () => {
      loggingHelper.logStep("Attempting to retrieve notes without authentication");

      const res = await loggingHelper.makeRequest(
        client,
        "GET",
        `${BASE_URL}${endpoints.notes}`,
        {}
      );

      expect(res.status()).toBe(401);

      const json = await res.json();
      expect(json.success).toBe(false);
      loggingHelper.logStep("Authentication error handled correctly");
    });

    test("should fail to list notes with invalid token", async () => {
      loggingHelper.logStep("Attempting to retrieve notes with invalid token");

      const res = await loggingHelper.makeRequest(
        client,
        "GET",
        `${BASE_URL}${endpoints.notes}`,
        {
          headers: { "x-auth-token": "123.invalid.token.456" },
        }
      );

      expect(res.status()).toBe(401);

      const json = await res.json();

      expect(json.success).toBe(false);

      if (json.message) {
        expect(json.message.toLowerCase()).toMatch(
          "access token is not valid"
        );
      }
      loggingHelper.logStep("Invalid token error handled correctly");
    });
  });
});
