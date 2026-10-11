// Copy only the allowed fields from a request body.
// Stops a client from setting fields it must not control, such as `status` or `_id`.
export const pick = (source = {}, fields) =>
  Object.fromEntries(fields.filter((field) => source[field] !== undefined).map((field) => [field, source[field]]));
