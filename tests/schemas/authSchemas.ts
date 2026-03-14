export const registerResponseSchema = {
  type: "object",
  required: ["success", "data"],
  properties: {
    success: { type: "boolean" },
    message: { type: "string" },
    data: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
      },
      additionalProperties: true,
    },
  },
  additionalProperties: true,
};

export const loginResponseSchema = {
  type: "object",
  required: ["success", "data"],
  properties: {
    success: { type: "boolean" },
    message: { type: "string" },
    data: {
      type: "object",
      required: ["token"],
      properties: {
        token: { type: "string" },
      },
      additionalProperties: true,
    },
  },
  additionalProperties: true,
};

export const deleteAccountResponseSchema = {
  type: "object",
  required: ["success", "message"],
  properties: {
    success: { type: "boolean" },
    message: { type: "string" },
  },
  additionalProperties: true,
};
