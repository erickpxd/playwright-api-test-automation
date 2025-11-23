import { test, expect } from "@playwright/test";
import { getToken } from "../../framework/helpers/authHelper";
import { env } from "../../config/environment";
import { endpoints } from "../../config/endpoints";

const BASE_URL = env.notesUrl;
const token = getToken();

test("Should update user profile successfully (200)", async ({ request }) => {
  const payload = {
    name: "Updated User Teste",
    phone: "9876543210",
    company: "QA3 Company",
  };

  const res = await request.patch(`${BASE_URL}${endpoints.profileUpdate}`, {
    headers: { "x-auth-token": token },
    form: payload,
  });

  const json = await res.json();

  expect(res.status()).toBe(200);
  expect(json.success).toBe(true);
  expect(json.status).toBe(200);
  expect(json.message).toBe("Profile updated successful");

  expect(typeof json.data).toBe("object");

  expect(json.data).toHaveProperty("id");
  expect(json.data).toHaveProperty("name");
  expect(json.data).toHaveProperty("email");

  expect(json.data.name).toBe(payload.name);
  expect(json.data.phone).toBe(payload.phone);
  expect(json.data.company).toBe(payload.company);
});

test("Should return 400 Bad Request when invalid data is sent", async ({
  request,
}) => {
  const res = await request.patch(`${BASE_URL}${endpoints.profileUpdate}`, {
    headers: { "x-auth-token": token },
    form: {
      name: "",
      phone: "123",
      company: "Test",
    },
  });

  const json = await res.json();

  expect(res.status()).toBe(400);
  expect(json.success).toBe(false);
  expect(json.status).toBe(400);

  expect(typeof json.message).toBe("string");
  expect(json.message.length).toBeGreaterThan(0);
});

test("Should return 401 Unauthorized when no token is provided", async ({
  request,
}) => {
  const res = await request.patch(`${BASE_URL}${endpoints.profileUpdate}`, {
    form: {
      name: "User",
      phone: "9999999999",
      company: "Company",
    },
  });

  const json = await res.json();

  expect(res.status()).toBe(401);
  expect(json.success).toBe(false);
  expect(json.status).toBe(401);
  expect(json.message).toBe(
    "No authentication token specified in x-auth-token header"
  );
});