export const send = (res, data, { status = 200, meta = {} } = {}) =>
  res.status(status).json({ data, meta });
