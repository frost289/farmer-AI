// validate(zodSchema, source = 'body'). The parsed value replaces req[source].
export const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    req[source] = schema.parse(req[source]);
    next();
  };
