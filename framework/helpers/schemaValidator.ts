import Ajv, { ErrorObject } from "ajv";

const ajv = new Ajv({ allErrors: true, strict: false });

function formatErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors) return "Unknown schema validation error";
  return errors
    .map((err) => {
      const instancePath = err.instancePath || "(root)";
      const message = err.message ?? "invalid";
      return `${instancePath} ${message}`;
    })
    .join("; ");
}

export function validateResponse(schema: object, payload: unknown): void {
  const validate = ajv.compile(schema);
  const valid = validate(payload);

  if (!valid) {
    const detail = formatErrors(validate.errors);
    throw new Error(`Schema validation failed: ${detail}`);
  }
}
