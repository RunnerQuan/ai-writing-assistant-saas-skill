export const json = (data, init = {}) =>
  new Response(JSON.stringify(data), {
    status: init.status ?? 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': init.cacheControl ?? 'no-store'
    }
  });

export const error = (message, status = 400, extra = {}) =>
  json(
    {
      error: message,
      ...extra
    },
    { status }
  );
