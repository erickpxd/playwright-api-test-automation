export const noteBaseProperties = {
  id: { type: "string" },
  title: { type: "string" },
  description: { type: "string" },
  category: { type: "string" },
  completed: { type: "boolean" },
  createdAt: { type: "string" },
  updatedAt: { type: "string" },
};

export const createNoteResponseSchema = {
  type: "object",
  required: ["success", "data", "message"],
  properties: {
    success: { type: "boolean" },
    message: { type: "string" },
    data: {
      type: "object",
      required: ["id"],
      properties: {
        ...noteBaseProperties,
      },
      additionalProperties: true,
    },
  },
  additionalProperties: true,
};

export const getNoteByIdResponseSchema = {
  type: "object",
  required: ["success", "data"],
  properties: {
    success: { type: "boolean" },
    data: {
      type: "object",
      required: ["id", "title", "description", "category"],
      properties: {
        ...noteBaseProperties,
      },
      additionalProperties: true,
    },
  },
  additionalProperties: true,
};

export const listNotesResponseSchema = {
  type: "object",
  required: ["success", "data"],
  properties: {
    success: { type: "boolean" },
    data: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "title", "description", "category"],
        properties: {
          ...noteBaseProperties,
        },
        additionalProperties: true,
      },
    },
  },
  additionalProperties: true,
};

export const updateNoteResponseSchema = {
  type: "object",
  required: ["success", "data", "message"],
  properties: {
    success: { type: "boolean" },
    message: { type: "string" },
    data: {
      type: "object",
      required: ["id", "title", "description", "category"],
      properties: {
        ...noteBaseProperties,
      },
      additionalProperties: true,
    },
  },
  additionalProperties: true,
};

export const deleteNoteResponseSchema = {
  type: "object",
  required: ["success", "message"],
  properties: {
    success: { type: "boolean" },
    message: { type: "string" },
  },
  additionalProperties: true,
};
